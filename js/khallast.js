"use strict";
// ================= خلّصت!: a letter, a few boxes, and the first one done stops everyone =================
// Runs inside a room (room.js). The host keeps the answers and the votes; every phone writes and votes.

const LETTERS = "أبتجحخدرزسشصطعفقكلمنهوي".split("");
const hStat = (id) => (H.stats[id] ||= { first: 0, laughs: 0, rejected: 0, peeks: 0, accepted: 0, unique: 0, shared: 0 });
const KH_ROUNDS = { classic: [1, 2, 3, 4, 5], quick: [3, 6, 9, 12] };
const KH_WRITE = { classic: [40, 60, 90], quick: [10, 15, 25] }, KH_VOTE = [15, 25, 40]; // seconds
const khWrite = (S) => (S.wtime || (S.cats.length === 1 ? 15 : 60)) * 1000;

ROOM_GAMES.khallast = {
  name: "خلّصت!", theme: "khallast", min: 2, need: "ينتظر لاعب واحد على الأقل", who: "٢ إلى ٣٠ · كتابة",
  rules: ["يطلع حرف، وكل واحد يكتب في جواله كلمة تبدأ فيه لكل خانة.", "أول واحد يعبّي كل الخانات يضغط «خلّصت!»، والباقين عندهم ٥ ثواني.", "الإجابات المعروفة تنقبل تلقائياً، والغريبة تنعرض للتصويت بدون أسماء.", "الإجابة اللي ما كتبها غيرك ١٠ نقاط، المكررة ٥، وأضحك إجابة تاخذ ٥ زيادة.", "بعد آخر جولة كل لاعب ياخذ شهادة بلقب."],
  setup(S) {
    Object.assign(S, { mode: "classic", rounds: 2, wtime: 60, vtime: 25, picks: CATS.slice(0, 8).map((c) => c.id), letter: "", cats: [], done: [], stop: null, groups: [], score: {}, gain: {}, funniest: null, awards: {}, voted: [] });
    Object.assign(H, { answers: {}, votes: {}, stats: {}, score: {}, gain: {}, used: [], deadline: 0, stopAt: 0, voteEnds: 0 });
  },
  joined(id) { H.score[id] ||= 0; },
  snap(S) {
    S.score = H.score; S.gain = H.gain;
    S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
    S.stop = H.stopAt ? { by: H.stopBy, left: Math.max(0, H.stopAt - now()) } : null;
    S.voteLeft = H.voteEnds ? Math.max(0, H.voteEnds - now()) : 0;
  },
  on(m) {
    const S = H.S;
    switch (m.t) {
      case "ans": if (m.round === S.round && (S.phase === "write" || S.phase === "collect")) H.answers[m.id] = (m.a || []).slice(0, 4).map((x) => String(x || "").slice(0, 24)); break;
      case "done": if (m.round === S.round) hostDone(m.id); break;
      case "vote": if (S.phase === "vote" && m.round === S.round) { H.votes[m.id] = { v: m.v || {}, l: m.l || [] }; if (m.final && !S.voted.includes(m.id)) S.voted.push(m.id); if (allVoted()) hostReveal(); else if (m.final) hostSendSoon(); } break;
      case "peek": hostPeek(m.id); break;
    }
  },
  direct(m) { if (m.t === "peekRes") showPeek(m); },
  // the host came back: a round that was running is collected as it stands
  resume(S) { if (["letter", "write", "collect"].includes(S.phase)) hostCollect(); else if (S.phase === "vote") hostReveal(); },
  lobby(S) {
    const need = S.mode === "quick" ? 1 : 4;
    return `<p class="muted" style="font-weight:700;color:var(--soft)">طريقة اللعب</p>
      <div class="modes">
        <button type="button" class="mode" data-mode="classic" aria-pressed="${S.mode === "classic"}"><b>الورقة</b><small>كل جولة ٤ خانات</small></button>
        <button type="button" class="mode" data-mode="quick" aria-pressed="${S.mode === "quick"}"><b>خانة خانة</b><small>جولات سريعة بخانة وحدة</small></button>
      </div>
      <p class="muted" style="font-weight:700;color:var(--soft)">كم جولة؟</p>
      <div class="chips pick">${KH_ROUNDS[S.mode].map((n) => `<button type="button" class="chip" data-rounds="${n}" aria-pressed="${S.rounds === n}">${AR(n)}</button>`).join("")}</div>
      <p class="muted" style="font-weight:700;color:var(--soft)">وقت الكتابة</p>
      <div class="chips pick">${KH_WRITE[S.mode].map((n) => `<button type="button" class="chip" data-wtime="${n}" aria-pressed="${S.wtime === n}">${AR(n)} ثانية</button>`).join("")}</div>
      <p class="muted" style="font-weight:700;color:var(--soft)">وقت التصويت</p>
      <div class="chips pick">${KH_VOTE.map((n) => `<button type="button" class="chip" data-vtime="${n}" aria-pressed="${S.vtime === n}">${AR(n)} ثانية</button>`).join("")}</div>
      <p class="muted" style="font-weight:700;color:var(--soft)">الخانات (${S.mode === "quick" ? "اختر وحدة على الأقل" : "اختر ٤ على الأقل"})</p>
      <div class="chips pick">${CATS.map((c) => `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="${S.picks.includes(c.id)}">${c.n}</button>`).join("")}</div>
      ${S.picks.length < need ? `<p class="muted" style="color:var(--ink-red)">اختر ${AR(need)} خانات على الأقل.</p>` : ""}`;
  },
  bindLobby(S) {
    screen.querySelectorAll("[data-mode]").forEach((b) => (b.onclick = () => { S.mode = b.dataset.mode; H.S.mode = S.mode; H.S.rounds = S.mode === "quick" ? 6 : 2; H.S.wtime = S.mode === "quick" ? 15 : 60; H.S.vtime = S.mode === "quick" ? 15 : 25; beep(700, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-wtime]").forEach((b) => (b.onclick = () => { H.S.wtime = +b.dataset.wtime; beep(700, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-vtime]").forEach((b) => (b.onclick = () => { H.S.vtime = +b.dataset.vtime; beep(700, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-rounds]").forEach((b) => (b.onclick = () => { H.S.rounds = +b.dataset.rounds; beep(700, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-cat]").forEach((b) => (b.onclick = () => { const p = H.S.picks, id = b.dataset.cat; H.S.picks = p.includes(id) ? p.filter((x) => x !== id) : [...p, id]; beep(660, 0.04); hostSend(); }));
    if (S.picks.length < (S.mode === "quick" ? 1 : 4)) $("start").disabled = true;
  },
  start: () => hostStart(),
  views: { letter: vLetter, write: vWrite, collect: vCollect, vote: vVote, reveal: vReveal, board: vBoard, cert: vCert },
};

// ---------------- the host ----------------
function hostStart() {
  const S = H.S, picked = CATS.filter((c) => S.picks.includes(c.id));
  // «الورقة»: every round is 4 of the chosen boxes; «خانة خانة»: one box a round, going round the chosen ones
  const plan = S.mode === "quick"
    ? Array.from({ length: S.rounds }, (_, i) => (i % picked.length === 0 ? (H.deck = shuffled(picked)) : H.deck)[i % picked.length]).map((c) => [c])
    : Array.from({ length: S.rounds }, () => shuffled(picked).slice(0, 4));
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
  const S = H.S, T = khWrite(S);
  S.phase = "write"; H.deadline = now() + T;
  hostSend();
  hEvery(() => { const t = now(); if ((H.stopAt && t >= H.stopAt) || t >= H.deadline) hostCollect(); }, 250);
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
    if (isRude(g.text)) { g.bad = true; g.wrong = true; g.auto = false; g.text = "•••"; } // a rude word: out, and nobody sees it
    g.doubt = right && !g.auto;
  });
  H.groups = groups;
  groups.forEach((g) => { if (g.bad) g.doubt = false; });
  S.groups = groups.map((g) => ({ key: g.key, ci: g.ci, text: g.text, n: g.who.length, doubt: g.doubt, auto: g.auto, wrong: g.wrong, bad: !!g.bad }));
  if (!groups.some((g) => g.doubt)) return hostReveal();
  S.phase = "vote"; S.voted = []; H.votes = {};
  H.voteEnds = now() + (S.vtime || 25) * 1000;
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
  S.groups = H.groups.map((g) => ({ key: g.key, ci: g.ci, text: g.text, who: g.who, ok: g.ok, pts: g.pts, lol: g.lol, auto: g.auto, wrong: g.wrong, bad: !!g.bad }));
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
function hostPeek(id) {
  const S = H.S;
  if (S.phase !== "write") return;
  hStat(id).peeks++;
  const cands = [];
  H.players.forEach((p) => {
    if (p.id === id) return;
    const row = H.answers[p.id] || [];
    row.forEach((w, ci) => { if (w && !isRude(w)) cands.push({ name: p.name, cat: S.cats[ci].n, text: w }); });
  });
  const res = cands.length ? pickOne(cands) : { name: "", cat: "", text: "" };
  const m = { t: "peekRes", to: id, ...res };
  if (id === PID) showPeek(m); else KL.net && KL.net.send(m);
}


// ---------------- every phone ----------------
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
    const sync = () => { const d = $("doneBtn"); if (d) d.disabled = !!(KL.S.stop) || !inputs.every((x) => x.value.trim()); };
    inputs.forEach((x, i) => {
      x.addEventListener("input", () => { KL.my.ans[i] = x.value; sync(); clearTimeout(deb); deb = setTimeout(sendAns, 600); });
      x.addEventListener("keydown", (e) => { if (e.key === "Enter") { if (inputs[i + 1]) inputs[i + 1].focus(); else if (!$("doneBtn").disabled) $("doneBtn").click(); } });
    });
    setTimeout(() => inputs[0] && inputs[0].focus(), 60);
    $("doneBtn").onclick = () => { sendAns(); act({ t: "done", id: PID, round: S.round }); };
    if (!quick) $("peekBtn").onclick = () => { if (KL.my.peeked) return; KL.my.peeked = true; $("peekBtn").disabled = true; act({ t: "peek", id: PID }); };
    klEvery(() => {
      const s = KL.S; if (!s || s.phase !== "write") return;
      const T = khWrite(s), left = leftOf(s.left);
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
    if ($("doneBtn")) $("doneBtn").disabled = true;
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
  if (KL.my.round !== S.round || !KL.my.votes) KL.my = { round: S.round, ans: KL.my.round === S.round ? KL.my.ans || [] : [], votes: {}, lols: {}, peeked: true, final: false }; // e.g. a host who just came back
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
      beep(b.dataset.v === "rej" ? 330 : 660, 0.05); if (isHost()) send(false); draw();
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
    klEvery(() => {
      const s = KL.S; if (!s || s.phase !== "vote") return;
      const left = leftOf(s.voteLeft), v = $("vleft"); if (v) v.textContent = AR(Math.ceil(left / 1000));
      if (left < 1500 && !KL.my.final && !KL.my.lastCall) { KL.my.lastCall = true; send(false); } // whatever you picked still counts
    }, 250);
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
        <div class="ans-top"><span class="ans-text">${esc(g.text)}</span><span class="stamp ${g.ok ? "yes" : "no"}">${g.ok ? "مقبولة" : g.bad ? "كلمة ممنوعة" : g.wrong ? "حرف غلط" : "مرفوضة"}</span></div>
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
