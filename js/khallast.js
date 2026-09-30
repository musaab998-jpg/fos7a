"use strict";
// ================= خلّصت! for real: one phone hosts the room, everyone else plays from any browser =================
// The host keeps the whole game and sends everyone a snapshot whenever something changes.
// Players only send what they did: joined, typed, pressed «خلّصت!», voted, peeked.

const LETTERS = "أبتجحخدرزسشصطعفقكلمنهوي".split("");
const MAX_PLAYERS = 12;

const KL = { role: null, code: "", net: null, S: null, gotAt: 0, view: "", my: {}, typing: 0, alive: 0 };
const H = {};

const now = () => Date.now();
const who = (id) => (KL.S ? KL.S.players.find((p) => p.id === id) : null) || { name: "؟", av: me.av };
const isHost = () => KL.role === "host";
const act = (m) => (isHost() ? hostOn(m) : KL.net && KL.net.send(m));
const leftOf = (ms) => Math.max(0, ms - (now() - KL.gotAt)); // counts down locally from the host's snapshot
const clearKL = () => { (KL.timers || []).forEach((t) => { clearTimeout(t); clearInterval(t); }); KL.timers = []; };
const klLater = (fn, ms) => (KL.timers ||= []).push(setTimeout(fn, ms));
const klEvery = (fn, ms) => (KL.timers ||= []).push(setInterval(fn, ms));
const hClear = () => { (H.timers || []).forEach((t) => { clearTimeout(t); clearInterval(t); }); H.timers = []; };
const hLater = (fn, ms) => (H.timers ||= []).push(setTimeout(fn, ms));
const hEvery = (fn, ms) => (H.timers ||= []).push(setInterval(fn, ms));
const hStat = (id) => (H.stats[id] ||= { first: 0, laughs: 0, rejected: 0, peeks: 0, accepted: 0, unique: 0, shared: 0 });

function leaveRoom(tell = true) {
  clearKL(); hClear();
  if (KL.net) {
    if (tell) isHost() ? KL.net.send({ t: "state", s: { phase: "closed" } }) : KL.net.send({ t: "bye", id: PID });
    const n = KL.net; setTimeout(() => n.close(), 300);
  }
  Object.assign(KL, { role: null, code: "", net: null, S: null, view: "", my: {} });
}

// ---------------- hosting ----------------
function hostRoom() {
  leaveRoom(false);
  const code = newRoomCode();
  Object.assign(KL, { role: "host", code, my: {} });
  Object.assign(H, { players: [{ id: PID, name: me.name, av: { ...me.av }, host: true }], answers: {}, votes: {}, plans: {}, stats: {}, score: {}, gain: {}, used: [], timers: [], deadline: 0, stopAt: 0, voteEnds: 0,
    S: { phase: "lobby", code, mode: "classic", players: [], round: 0, rounds: 2, letter: "", cats: [], done: [], stop: null, groups: [], score: {}, gain: {}, funniest: null, awards: {}, voted: [], seq: 0 } });
  setTop("");
  show(`<div class="paper"><h2 style="font-size:26px">نجهّز الغرفة…</h2></div>`);
  KL.net = openRoom(code, hostOn, (st) => { if (st === "SUBSCRIBED") hostSend(); else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT") offline(); });
  klLater(() => { if (!KL.S) hostSend(); }, 2500);
}
function offline() {
  if (KL.S) return;
  show(`<div class="paper" style="display:grid;gap:10px"><h2 style="font-size:26px">ما قدرنا نتصل</h2><p class="pmuted">تأكد إن النت شغال وجرّب مرة ثانية.</p></div><button type="button" class="btn btn-marker" id="retry">جرّب مرة ثانية</button>`);
  $("retry").onclick = () => (isHost() ? hostRoom() : joinRoom(KL.code));
}
function hostSend() {
  const S = H.S;
  S.players = H.players.map((p) => ({ id: p.id, name: p.name, av: p.av, host: !!p.host, bot: !!p.bot }));
  S.score = H.score; S.gain = H.gain;
  S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
  S.stop = H.stopAt ? { by: H.stopBy, left: Math.max(0, H.stopAt - now()) } : null;
  S.voteLeft = H.voteEnds ? Math.max(0, H.voteEnds - now()) : 0;
  S.seq++;
  const snap = JSON.parse(JSON.stringify(S));
  if (KL.net) KL.net.send({ t: "state", s: snap });
  apply(snap);
}
function hostOn(m) {
  const S = H.S;
  if (!m || !m.t) return;
  switch (m.t) {
    case "join": {
      const p = H.players.find((x) => x.id === m.p.id);
      if (p) Object.assign(p, { name: m.p.name, av: m.p.av, away: false });
      else if (H.players.length < MAX_PLAYERS) { H.players.push({ id: m.p.id, name: String(m.p.name || "؟").slice(0, 12), av: m.p.av }); H.score[m.p.id] ||= 0; beep(620, 0.06); }
      hostSend(); break;
    }
    case "hello": hostSend(); break;
    case "bye": if (S.phase === "lobby") H.players = H.players.filter((p) => p.id !== m.id); hostSend(); break;
    case "ans": if (m.round === S.round && (S.phase === "write" || S.phase === "collect")) H.answers[m.id] = (m.a || []).map((x) => String(x || "").slice(0, 24)); break;
    case "done": if (m.round === S.round) hostDone(m.id); break;
    case "vote": if (S.phase === "vote" && m.round === S.round) { H.votes[m.id] = { v: m.v || {}, l: m.l || [] }; if (m.final && !S.voted.includes(m.id)) S.voted.push(m.id); if (allVoted()) hostReveal(); else if (m.final) hostSend(); } break;
    case "peek": hostPeek(m.id); break;
    case "mode": if (S.phase === "lobby") { S.mode = m.mode; hostSend(); } break;
  }
}
function hostAddBot() {
  const b = BOTS.find((x) => !H.players.some((p) => p.id === x.id));
  if (!b || H.players.length >= MAX_PLAYERS) return;
  H.players.push({ id: b.id, name: b.name, av: b.av, bot: true, skill: b.skill }); H.score[b.id] = 0; beep(560, 0.05); hostSend();
}
function hostStart() {
  const S = H.S, pool = CATS.slice().sort(() => Math.random() - 0.5);
  const plan = S.mode === "quick" ? pool.slice(0, 6).map((c) => [c]) : [pool.slice(0, 4), pool.slice(4, 8)];
  Object.assign(H, { plan, used: [], stats: {}, score: {}, gain: {} });
  H.players.forEach((p) => (H.score[p.id] = 0));
  Object.assign(S, { rounds: plan.length, round: 0, funniest: null, awards: {} });
  hostRound();
}
function hostRound() {
  hClear();
  const S = H.S;
  S.round++; S.cats = H.plan[S.round - 1];
  let pool = LETTERS.filter((l) => !H.used.includes(l)); if (!pool.length) { H.used = []; pool = LETTERS; }
  S.letter = pickOne(pool); H.used.push(S.letter);
  Object.assign(S, { phase: "letter", done: [], groups: [], voted: [] });
  Object.assign(H, { answers: {}, votes: {}, deadline: 0, stopAt: 0, stopBy: null, voteEnds: 0, gain: {} });
  hostSend();
  hLater(hostWrite, 2200);
}
function hostWrite() {
  const S = H.S, quick = S.cats.length === 1, T = quick ? 15000 : 55000;
  S.phase = "write"; H.deadline = now() + T;
  // the pretend players write too, at their own speed
  H.players.filter((p) => p.bot).forEach((b) => {
    const L = S.letter, known = (c) => (DATA[L] && DATA[L][c.id]) || [];
    const row = S.cats.map((c) => (Math.random() < b.skill && known(c).length ? pickOne(known(c)).replace(/^[?!]/, "") : ""));
    H.plans[b.id] = { row, at: now() + (quick ? rnd(5, 11) : rnd(22, 42)) * 1000, full: row.every(Boolean) };
  });
  hostSend();
  hEvery(() => {
    const t = now();
    H.players.filter((p) => p.bot).forEach((b) => { const pl = H.plans[b.id]; if (pl && !S.done.includes(b.id) && t >= pl.at) { H.answers[b.id] = pl.row; if (pl.full) hostDone(b.id); else { S.done.push(b.id); hostSend(); } } });
    if ((H.stopAt && t >= H.stopAt) || t >= H.deadline) hostCollect();
  }, 250);
}
function hostDone(id) {
  const S = H.S;
  if (S.phase !== "write" || H.stopAt) return;
  const quick = S.cats.length === 1;
  H.stopAt = now() + (quick ? 3000 : 5000); H.stopBy = id;
  if (!S.done.includes(id)) S.done.push(id);
  hStat(id).first++;
  hostSend();
}
function hostCollect() {
  hClear();
  const S = H.S;
  S.phase = "collect"; H.deadline = 0; H.stopAt = 0;
  // bots stopped mid-sheet keep what they had written by now
  H.players.filter((p) => p.bot && !H.answers[p.id]).forEach((b) => { const pl = H.plans[b.id]; if (pl) H.answers[b.id] = pl.row.map((w, i) => (i < pl.row.length / 2 ? w : "")); });
  hostSend();
  hLater(hostGroups, 1800); // time for the last answers to arrive
}
function hostGroups() {
  const S = H.S, L = S.letter, m = new Map();
  S.cats.forEach((c, ci) => H.players.forEach((p) => {
    const w = (H.answers[p.id] || [])[ci]; if (!w || !w.trim()) return;
    const key = ci + ":" + norm(w);
    if (!m.has(key)) m.set(key, { key, ci, text: w.trim(), who: [] });
    m.get(key).who.push(p.id);
  }));
  const groups = [...m.values()];
  groups.forEach((g) => {
    const c = S.cats[g.ci], right = startsRight(g.text, L);
    const listed = DATA[L] ? kindOf(g.text, L, c.id) : right ? "unknown" : "wrong";
    g.kind = listed;
    g.auto = right && (listed === "good" || g.who.length > 1 || c.id === "name"); // known, shared, or a name on the letter: no vote needed
    g.wrong = !right; // wrong letter: out without a vote
    g.doubt = right && !g.auto;
  });
  H.groups = groups;
  S.groups = groups.map((g) => ({ key: g.key, ci: g.ci, text: g.text, n: g.who.length, doubt: g.doubt, auto: g.auto, wrong: g.wrong }));
  if (!groups.some((g) => g.doubt)) return hostReveal();
  S.phase = "vote"; S.voted = []; H.votes = {};
  H.voteEnds = now() + (S.cats.length === 1 ? 12000 : 25000);
  H.players.filter((p) => p.bot).forEach((b) => hLater(() => {
    const v = {}, l = [];
    H.groups.filter((g) => g.doubt && !g.who.includes(b.id)).forEach((g) => {
      const pAcc = { argue: 0.45, joke: 0.3, unknown: 0.72, wrong: 0.08 }[g.kind] ?? 0.6;
      v[g.key] = Math.random() < pAcc ? "acc" : "rej";
      if (Math.random() < ({ joke: 0.85, argue: 0.15 }[g.kind] ?? 0.1)) l.push(g.key);
    });
    hostOn({ t: "vote", id: b.id, round: S.round, v, l, final: true });
  }, rnd(1500, 6000)));
  hEvery(() => { if (now() >= H.voteEnds) hostReveal(); }, 300);
  hostSend();
}
function allVoted() {
  const S = H.S;
  return H.players.every((p) => S.voted.includes(p.id) || !H.groups.some((g) => g.doubt && !g.who.includes(p.id)));
}
function hostReveal() {
  hClear();
  const S = H.S;
  H.voteEnds = 0;
  let funny = S.funniest && S.funniest.round === S.round ? S.funniest : null;
  H.groups.forEach((g) => {
    let acc = 0, rej = 0, lol = 0;
    Object.entries(H.votes).forEach(([id, bv]) => { if (g.who.includes(id)) return; if (bv.v[g.key] === "acc") acc++; if (bv.v[g.key] === "rej") rej++; if ((bv.l || []).includes(g.key)) lol++; });
    g.ok = !g.wrong && (g.auto || acc >= rej);
    g.pts = g.ok ? (g.who.length === 1 ? 10 : 5) : 0;
    g.lol = lol; g.acc = acc; g.rej = rej;
    g.who.forEach((id) => { H.gain[id] = (H.gain[id] || 0) + g.pts; const st = hStat(id); st.laughs += lol; g.ok ? st.accepted++ : st.rejected++; if (g.ok && g.who.length === 1) st.unique++; if (g.who.length > 1) st.shared++; });
    if (lol >= 2 && (!funny || lol > funny.lol)) funny = { round: S.round, text: g.text, who: g.who.slice(), lol, cat: S.cats[g.ci].n };
  });
  S.funniest = funny;
  S.groups = H.groups.map((g) => ({ key: g.key, ci: g.ci, text: g.text, who: g.who, ok: g.ok, pts: g.pts, lol: g.lol, auto: g.auto, wrong: g.wrong }));
  S.phase = "reveal";
  hostSend();
}
function hostNext() {
  const S = H.S;
  if (S.phase === "reveal") {
    const quick = S.cats.length === 1, last = S.round >= S.rounds;
    if (quick && !last && S.round % 3 !== 0) { hostBank(); return hostRound(); }
    hostBank();
    S.phase = "board"; return hostSend();
  }
  if (S.phase === "board") return S.round < S.rounds ? hostRound() : hostCert();
}
// adds this round's points (and the funniest-answer bonus) to the running score
function hostBank() {
  const S = H.S;
  if (S.funniest && S.funniest.round === S.round && !S.funniest.paid) { S.funniest.who.forEach((id) => (H.gain[id] = (H.gain[id] || 0) + 5)); S.funniest.paid = true; }
  S.lastGain = { ...H.gain };
  H.players.forEach((p) => (H.score[p.id] = (H.score[p.id] || 0) + (H.gain[p.id] || 0)));
  H.gain = {};
}
function hostCert() {
  const S = H.S, got = {};
  const awards = [
    ["الأول على الفصل", (id) => H.score[id] || 0, (id) => `جمع ${AR(H.score[id] || 0)} نقطة`],
    ["أسرع قلم", (id) => hStat(id).first, (id) => `قال «خلّصت!» ${AR(hStat(id).first)} مرات`],
    ["ملك الضحك", (id) => hStat(id).laughs, (id) => `ضحّك الفصل ${AR(hStat(id).laughs)} مرات`],
    ["الغشّاش الرسمي", (id) => hStat(id).peeks, () => "لمح ورقة جاره، والكل شافه"],
    ["صاحب الإجابات الغريبة", (id) => hStat(id).rejected, (id) => `${AR(hStat(id).rejected)} إجابات رفضها الفصل`],
    ["ما أحد فكّر فيها غيره", (id) => hStat(id).unique, (id) => `${AR(hStat(id).unique)} إجابات ما كتبها أحد غيره`],
    ["على نفس الموجة مع الربع", (id) => hStat(id).shared, (id) => `كتب نفس إجابات غيره ${AR(hStat(id).shared)} مرات`],
  ];
  awards.forEach(([t, v, why]) => { const best = H.players.filter((p) => !got[p.id]).sort((x, y) => v(y.id) - v(x.id))[0]; if (best && v(best.id) > 0) got[best.id] = { t, why: why(best.id) }; });
  H.players.forEach((p) => (got[p.id] ||= { t: "مجتهد ويحتاج تركيز", why: "حاول، والمحاولة لها أجر" }));
  S.awards = got; S.phase = "cert";
  hostSend();
}
function hostAgain() {
  hClear();
  Object.assign(H.S, { phase: "lobby", round: 0, groups: [], done: [], funniest: null, awards: {} });
  H.score = {}; H.gain = {}; H.players.forEach((p) => (H.score[p.id] = 0));
  hostSend();
}
function hostPeek(id) {
  const S = H.S;
  if (S.phase !== "write") return;
  hStat(id).peeks++;
  const cands = [];
  H.players.forEach((p) => {
    if (p.id === id) return;
    const row = p.bot ? (H.plans[p.id] || {}).row || [] : H.answers[p.id] || [];
    row.forEach((w, ci) => { if (w) cands.push({ name: p.name, cat: S.cats[ci].n, text: w }); });
  });
  const res = cands.length ? pickOne(cands) : { name: "", cat: "", text: "" };
  const m = { t: "peekRes", to: id, ...res };
  if (id === PID) showPeek(m); else KL.net && KL.net.send(m);
}

// ---------------- joining ----------------
function joinRoom(code) {
  leaveRoom(false);
  Object.assign(KL, { role: "player", code, my: {} });
  setTop("");
  show(`<div class="paper" style="display:grid;gap:8px"><h2 style="font-size:26px">ندخل الغرفة ${esc(code)}…</h2><p class="pmuted">ثواني بس.</p></div>`);
  KL.net = openRoom(code, (m) => {
    if (!m) return;
    if (m.t === "state") apply(m.s);
    if (m.t === "peekRes" && m.to === PID) showPeek(m);
  }, (st) => {
    if (st === "SUBSCRIBED") { KL.net.send({ t: "join", p: { id: PID, name: me.name, av: me.av } }); KL.net.send({ t: "hello", id: PID }); }
    else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT") offline();
  });
  klLater(() => {
    if (KL.S) return;
    show(`<div class="paper" style="display:grid;gap:10px"><h2 style="font-size:26px">ما لقينا الغرفة ${esc(code)}</h2><p class="pmuted">تأكد من الرمز، وإن المضيف فاتح الغرفة ومتصل بالنت.</p></div><button type="button" class="btn btn-marker" id="retry">جرّب مرة ثانية</button><button type="button" class="btn btn-ghost" id="back">رجوع</button>`);
    $("retry").onclick = () => joinRoom(code);
    $("back").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
  }, 8000);
  // players who were away catch up
  klEvery(() => { if (KL.S && KL.net && document.visibilityState === "visible" && now() - KL.gotAt > 15000) KL.net.send({ t: "hello", id: PID }); }, 5000);
}

// ---------------- what every phone shows ----------------
function apply(S) {
  if (!S) return;
  if (S.phase === "closed") { KL.S = null; clearKL(); show(`<div class="paper" style="display:grid;gap:10px"><h2 style="font-size:26px">المضيف قفل الغرفة</h2><p class="pmuted">شكراً على اللعب!</p></div><button type="button" class="btn btn-marker" id="back">رجوع لفسحة</button>`); $("back").onclick = () => { leaveRoom(false); renderHub(); view("hub"); }; return; }
  if (KL.S && S.seq < KL.S.seq) return;
  const prev = KL.S;
  KL.S = S; KL.gotAt = now();
  $("roomCode").textContent = S.code || "";
  if (!isHost() && prev && !S.players.some((p) => p.id === PID)) KL.net.send({ t: "join", p: { id: PID, name: me.name, av: me.av } });
  const viewKey = S.phase + ":" + S.round;
  if (viewKey !== KL.view) { KL.view = viewKey; renderPhase(S, true); } else renderPhase(S, false);
}
function renderPhase(S, fresh) {
  const f = { lobby: vLobby, letter: vLetter, write: vWrite, collect: vCollect, vote: vVote, reveal: vReveal, board: vBoard, cert: vCert }[S.phase];
  if (f) f(S, fresh);
}
const face = (p, s) => avatar(p.av || me.av, s);
const hostOnly = (html, wait = "بانتظار المضيف…") => (isHost() ? html : `<p class="muted" style="text-align:center">${wait}</p>`);

function vLobby(S) {
  setTop("الغرفة");
  const url = joinUrl(S.code);
  show(`
    <div class="paper" style="display:grid;gap:10px;justify-items:center;text-align:center">
      <h2 style="font-size:30px">وينكم!</h2>
      ${isHost() ? `<div class="qr" style="width:190px;max-width:70%;background:#fff;border-radius:12px;padding:6px">${qrSvg(url)}</div><p class="pmuted">صوّروا الباركود بكاميرا الجوال، أو ادخلوا فسحة واكتبوا الرمز</p>` : `<p class="pmuted">دخلت! انتظر المضيف يبدأ.</p>`}
      <div style="font-family:var(--f-display);font-size:44px;letter-spacing:.18em;color:var(--ink-red);direction:ltr;line-height:1">${esc(S.code)}</div>
      ${isHost() ? `<button type="button" class="btn btn-ghost" id="shareLink" style="width:auto;padding:6px 16px;font-size:14px">أرسل الرابط</button>` : ""}
    </div>
    <div class="players">${S.players.map((p) => `<div class="pl ${p.id === PID ? "me" : ""}">${face(p, 40)}<div class="grow"><div class="name">${esc(p.name)}</div><div class="tag">${p.host ? "يدير الجلسة" : p.bot ? "لاعب وهمي للتجربة" : "انضم"}${p.id === PID ? " · أنت" : ""}</div></div></div>`).join("")}</div>
    ${isHost() ? `
      <p class="muted" style="font-weight:700;color:var(--soft)">طريقة اللعب</p>
      <div class="modes">
        <button type="button" class="mode" data-mode="classic" aria-pressed="${S.mode === "classic"}"><b>الورقة</b><small>جولتين، كل جولة ٤ خانات</small></button>
        <button type="button" class="mode" data-mode="quick" aria-pressed="${S.mode === "quick"}"><b>خانة خانة</b><small>٦ جولات سريعة بخانة وحدة</small></button>
      </div>
      <button type="button" class="btn btn-ghost" id="addBot" ${S.players.length >= MAX_PLAYERS ? "disabled" : ""}>أضف لاعب وهمي للتجربة</button>
      <button type="button" class="btn btn-marker" id="start" ${S.players.length < 2 ? "disabled" : ""}>${S.players.length < 2 ? "ينتظر لاعب واحد على الأقل" : `ابدأ (${AR(S.players.length)} لاعبين)`}</button>` : `<p class="muted" style="text-align:center">المضيف يختار طريقة اللعب ويبدأ.</p>`}`);
  if (!isHost()) return;
  $("shareLink").onclick = async () => { const text = `تعال العب معنا «خلّصت!» في فسحة: ${url}`; try { if (window.Fos7aApp) window.Fos7aApp.share(text); else if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); $("shareLink").textContent = "انسخ الرابط"; } } catch (e) {} };
  screen.querySelectorAll(".mode").forEach((b) => (b.onclick = () => { beep(700, 0.04); hostOn({ t: "mode", mode: b.dataset.mode }); }));
  $("addBot").onclick = () => hostAddBot();
  $("start").onclick = () => { beep(880, 0.08); hostStart(); };
}
function vLetter(S, fresh) {
  if (!fresh) return;
  clearKL(); setTop(`الجولة ${AR(S.round)} من ${AR(S.rounds)}`);
  KL.my = { round: S.round, ans: S.cats.map(() => ""), votes: {}, lols: {}, peeked: false, final: false };
  show(`<div class="paper" style="text-align:center;display:grid;gap:10px;justify-items:center;padding-block:28px">
    <p class="pmuted">حرف الجولة</p><div class="letter" id="spin" style="width:120px;height:120px;font-size:92px">؟</div>
    <p class="pmuted">${S.cats.map((c) => c.n).join(" · ")}</p></div>`);
  let k = 0;
  klEvery(() => { const el = $("spin"); if (el) el.textContent = LETTERS[k++ % LETTERS.length]; if (k % 2) beep(300 + (k % 5) * 60, 0.03, "square", 0.04); }, 80);
  klLater(() => { clearKL(); const el = $("spin"); if (el) el.textContent = S.letter; beep(990, 0.2, "triangle", 0.2); buzz(80); }, 1500);
}
function vWrite(S, fresh) {
  const quick = S.cats.length === 1;
  if (fresh || !$("a0")) {
    clearKL(); setTop(`الجولة ${AR(S.round)} من ${AR(S.rounds)}`);
    if (KL.my.round !== S.round) KL.my = { round: S.round, ans: S.cats.map(() => ""), votes: {}, lols: {}, peeked: false, final: false };
    show(`
      <div class="letter-box"><div class="letter">${S.letter}</div><div class="grow" style="display:grid;gap:6px">
        <div class="row" style="justify-content:space-between"><b>${quick ? `${S.cats[0].n} يبدأ بـ«${S.letter}»` : `اكتب كلمة تبدأ بـ«${S.letter}»`}</b><span class="ring" id="left"></span></div>
        <div class="timer"><i id="bar"></i></div>
        <div class="strip" id="strip"></div>
      </div></div>
      <div id="alert"></div>
      <div class="paper" style="padding-block:10px">
        ${S.cats.map((c, i) => `<div class="cat"${quick ? ' style="grid-template-columns:1fr"' : ""}>${quick ? "" : `<label for="a${i}">${c.n}</label>`}<input id="a${i}" autocomplete="off" maxlength="24" value="${esc(KL.my.ans[i] || "")}" ${quick ? `aria-label="${c.n}" style="font-size:24px;text-align:center"` : ""}></div>`).join("")}
      </div>
      <div class="row">
        ${quick ? "" : `<button type="button" class="btn btn-ghost" id="peekBtn" style="flex:1;font-size:14.5px" ${KL.my.peeked ? "disabled" : ""}>نظرة على ورقة جارك</button>`}
        <button type="button" class="btn btn-marker" id="doneBtn" style="flex:1.2" disabled>خلّصت!</button>
      </div>`);
    const inputs = S.cats.map((_, i) => $("a" + i));
    const sendAns = () => act({ t: "ans", id: PID, round: S.round, a: KL.my.ans });
    let deb = 0;
    const sync = () => { $("doneBtn").disabled = !!(KL.S.stop) || !inputs.every((x) => x.value.trim()); };
    inputs.forEach((x, i) => {
      x.addEventListener("input", () => { KL.my.ans[i] = x.value; sync(); clearTimeout(deb); deb = setTimeout(sendAns, 600); });
      x.addEventListener("keydown", (e) => { if (e.key === "Enter") { if (inputs[i + 1]) inputs[i + 1].focus(); else if (!$("doneBtn").disabled) $("doneBtn").click(); } });
    });
    setTimeout(() => inputs[0] && inputs[0].focus(), 60);
    $("doneBtn").onclick = () => { sendAns(); act({ t: "done", id: PID, round: S.round }); };
    if (!quick) $("peekBtn").onclick = () => { if (KL.my.peeked) return; KL.my.peeked = true; $("peekBtn").disabled = true; act({ t: "peek", id: PID }); };
    klEvery(() => {
      const s = KL.S; if (!s || s.phase !== "write") return;
      const T = quick ? 15000 : 55000, left = leftOf(s.left);
      const l = $("left"), b = $("bar"); if (l) l.textContent = AR(Math.ceil(left / 1000)); if (b) b.style.transform = `scaleX(${left / T})`;
      const f = $("five"); if (f && s.stop) { const sec = Math.ceil(leftOf(s.stop.left) / 1000); if (f.textContent !== AR(sec)) { f.textContent = AR(sec); if (sec > 0) beep(880, 0.05, "square", 0.06); } }
    }, 200);
    sync();
  }
  // parts that change while everyone writes
  $("strip").innerHTML = S.players.map((p) => `<span class="mini" title="${esc(p.name)}">${face(p, 30)}${S.done.includes(p.id) ? '<span class="ok">✓</span>' : ""}</span>`).join("");
  if (S.stop && !$("five")) {
    const p = who(S.stop.by);
    $("alert").innerHTML = `<div class="banner pop"><span class="row">${face(p, 34)}<span>${S.stop.by === PID ? "قلت «خلّصت!»، الباقين عندهم" : esc(p.name) + " خلّص! باقي لك"}</span></span><b id="five">${AR(Math.ceil(S.stop.left / 1000))}</b></div>`;
    beep(1200, 0.15, "square", 0.12); buzz([60, 40, 60]);
    $("doneBtn").disabled = true;
  }
}
function showPeek(m) {
  const el = $("alert"); if (!el) return;
  el.innerHTML = m.text ? `<div class="peek pop">لمحت ورقة <b>${esc(m.name)}</b>: ${esc(m.cat)} ← <b style="color:var(--ink-blue)">${esc(m.text)}</b></div>` : `<div class="peek pop">أوراق الباقين فاضية للحين!</div>`;
  beep(440, 0.1, "sine", 0.08);
  klLater(() => { if ($("alert") && !(KL.S && KL.S.stop)) $("alert").innerHTML = ""; }, 3000);
}
function vCollect(S, fresh) {
  if (!fresh) return;
  clearKL();
  if (KL.my.round === S.round) act({ t: "ans", id: PID, round: S.round, a: KL.my.ans }); // the final sheet
  beep(220, 0.3, "sawtooth", 0.08); buzz(120);
  show(`<div class="paper" style="text-align:center;display:grid;gap:8px;padding-block:24px"><h2 style="font-size:30px">قلم فوق!</h2><p class="pmuted">نجمع الأوراق…</p></div>`);
}
function vVote(S, fresh) {
  const mine = (g) => KL.my.round === S.round && norm(KL.my.ans[g.ci] || "") === g.key.slice(g.key.indexOf(":") + 1);
  const doubt = S.groups.filter((g) => g.doubt);
  const autoN = S.groups.length - doubt.length;
  const send = (final) => act({ t: "vote", id: PID, round: S.round, v: KL.my.votes, l: Object.keys(KL.my.lols).filter((k) => KL.my.lols[k]), final });
  const draw = () => {
    const y = screen.scrollTop;
    show(`
      <div class="row" style="justify-content:space-between"><h2 style="font-size:30px">مقبولة ولا لا؟</h2><span class="ring" id="vleft"></span></div>
      <p class="muted">${AR(autoN)} إجابات انحسمت تلقائي. هذي اللي تحتاج رأيكم، وبدون أسماء.</p>
      ${doubt.map((g) => mine(g) ? `<div class="ans"><div class="ans-top"><span class="ans-text">${esc(g.text)}</span><span class="dup">${S.cats[g.ci].n}</span></div><p class="mine">إجابتك، الباقين يصوّتون عليها</p></div>` : `
        <div class="ans"><div class="ans-top"><span class="ans-text">${esc(g.text)}</span><span class="dup">${S.cats[g.ci].n} · «${S.letter}»</span></div>
        <div class="votes"><button type="button" class="vote acc" data-k="${esc(g.key)}" data-v="acc" aria-pressed="${KL.my.votes[g.key] === "acc"}" ${KL.my.final ? "disabled" : ""}>مقبولة</button><button type="button" class="vote rej" data-k="${esc(g.key)}" data-v="rej" aria-pressed="${KL.my.votes[g.key] === "rej"}" ${KL.my.final ? "disabled" : ""}>مرفوضة</button><button type="button" class="vote lol" data-k="${esc(g.key)}" data-v="lol" aria-pressed="${!!KL.my.lols[g.key]}" ${KL.my.final ? "disabled" : ""}>ضحّكتني</button></div></div>`).join("")}
      <p class="muted" id="votedN" style="text-align:center"></p>
      <button type="button" class="btn btn-marker" id="voteDone" ${KL.my.final ? "disabled" : ""}>${KL.my.final ? "سلّمت تصويتك" : "سلّم تصويتك"}</button>
      ${isHost() ? '<button type="button" class="btn btn-ghost" id="reveal">اكشف النتيجة الحين</button>' : ""}`);
    screen.scrollTop = y;
    screen.querySelectorAll("button.vote").forEach((b) => (b.onclick = () => {
      const k = b.dataset.k;
      if (b.dataset.v === "lol") KL.my.lols[k] = !KL.my.lols[k]; else KL.my.votes[k] = KL.my.votes[k] === b.dataset.v ? undefined : b.dataset.v;
      beep(b.dataset.v === "rej" ? 330 : 660, 0.05); send(false); draw();
    }));
    $("voteDone").onclick = () => { KL.my.final = true; send(true); beep(880, 0.08); draw(); };
    if (isHost()) $("reveal").onclick = () => hostReveal();
    counts();
  };
  const counts = () => { const n = $("votedN"); if (n) n.textContent = `سلّم ${AR(S.voted.length)} من ${AR(S.players.length)}`; };
  if (fresh) {
    clearKL(); setTop(`الجولة ${AR(S.round)} · تصويت`);
    draw();
    if (!doubt.some((g) => !mine(g))) { KL.my.final = true; send(true); if (KL.S && KL.S.phase === "vote" && $("voteDone")) draw(); } // nothing for me to judge
    klEvery(() => { const s = KL.S; if (!s || s.phase !== "vote") return; const v = $("vleft"); if (v) v.textContent = AR(Math.ceil(leftOf(s.voteLeft) / 1000)); }, 250);
  } else counts();
}
function vReveal(S, fresh) {
  if (!fresh) return;
  clearKL(); setTop(`الجولة ${AR(S.round)} · النتيجة`);
  beep(523, 0.08); setTimeout(() => beep(784, 0.12), 90);
  const quick = S.cats.length === 1, last = S.round >= S.rounds, toBoard = !quick || last || S.round % 3 === 0;
  show(`
    ${S.cats.map((c, ci) => { const gs = S.groups.filter((g) => g.ci === ci); return `
      <h3 style="font-size:24px">${c.n} · «${S.letter}»</h3>
      ${gs.map((g) => `<div class="ans pop">
        <div class="ans-top"><span class="ans-text">${esc(g.text)}</span><span class="stamp ${g.ok ? "yes" : "no"}">${g.ok ? "مقبولة" : g.wrong ? "حرف غلط" : "مرفوضة"}</span></div>
        <div class="ans-top"><div class="who">${g.who.map((id) => `<span class="p">${face(who(id), 24)}${esc(who(id).name)}</span>`).join("")}</div><span class="pts ${g.pts ? "" : "zero"}">+${AR(g.pts)}</span></div>
        ${g.lol ? `<p class="mine">ضحّك ${AR(g.lol)}</p>` : ""}
      </div>`).join("") || '<p class="muted">محد كتب شي.</p>'}`; }).join("")}
    <p class="muted">الإجابة الوحيدة ١٠، والمكررة ٥، والمرفوضة صفر.</p>
    ${hostOnly(`<button type="button" class="btn btn-marker" id="next">${toBoard ? "ترتيب الفصل" : "الحرف الجاي"}</button>`)}`);
  if (isHost()) $("next").onclick = () => hostNext();
}
function vBoard(S, fresh) {
  if (!fresh) return;
  clearKL(); setTop(S.round >= S.rounds ? "النتيجة الأخيرة" : `بعد الجولة ${AR(S.round)}`);
  beep(659, 0.1); setTimeout(() => beep(880, 0.15), 110);
  const order = S.players.slice().sort((a, b) => (S.score[b.id] || 0) - (S.score[a.id] || 0));
  const f = S.funniest && S.funniest.round === S.round ? S.funniest : null;
  show(`
    <h2 style="font-size:32px">ترتيب الفصل</h2>
    ${f ? `<div class="best pop"><span style="font-family:var(--f-display);font-size:22px;color:var(--ink-red)">+٥</span><div><b>أضحك إجابة:</b> «${esc(f.text)}» في ${f.cat}<div class="pmuted">${f.who.map((id) => esc(who(id).name)).join("، ")}</div></div></div>` : ""}
    <div class="board">${order.map((p, i) => `<div class="rank ${p.id === PID ? "me" : ""} pop"><span class="n">${AR(i + 1)}</span>${face(p, 40)}<div class="grow"><b>${esc(p.name)}</b><div class="gain">+${AR((S.lastGain || {})[p.id] || 0)}</div></div><span class="sc">${AR(S.score[p.id] || 0)}</span></div>`).join("")}</div>
    ${hostOnly(`<button type="button" class="btn btn-marker" id="go">${S.round < S.rounds ? "كمّلوا" : "الشهادات"}</button>`)}`);
  if (isHost()) $("go").onclick = () => hostNext();
}
function vCert(S, fresh) {
  if (!fresh) return;
  clearKL(); setTop("آخر الليلة");
  const mine = S.awards[PID] || { t: "", why: "" }, meP = who(PID);
  beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.2), 240);
  show(`
    <div class="cert pop">
      <p class="pmuted">فسحة · جلسة ${esc(S.code)}</p>
      <h2>شهادة تقدير</h2>
      <p>تُمنح هذه الشهادة لـ</p>
      ${face(meP, 84)}
      <div style="font-family:var(--f-display);font-size:28px">${esc(meP.name)}</div>
      <p>لقب</p>
      <div class="title">${mine.t}</div>
      <p class="pmuted">${mine.why}</p>
      <div class="sign">توقيع المعلّم: ـــــــــ</div>
      <div class="seal">خلّصت!</div>
    </div>
    <p class="muted">صوّر الشاشة وأرسلها للقروب.</p>
    <div class="others">${S.players.filter((p) => p.id !== PID).map((p) => `<div class="other">${face(p, 34)}<span class="grow">${esc(p.name)}</span><b>${(S.awards[p.id] || {}).t || ""}</b></div>`).join("")}</div>
    ${hostOnly(`<button type="button" class="btn btn-marker" id="again">جلسة جديدة بنفس الربع</button>`, "المضيف يقدر يبدأ جلسة جديدة.")}
    <button type="button" class="btn btn-ghost" id="home">رجوع لفسحة</button>`);
  if (isHost()) $("again").onclick = () => hostAgain();
  $("home").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}
