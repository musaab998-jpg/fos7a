"use strict";
// ================= ترابيع: the school yard at recess, tiles coloured in with chalk =================
// Teams take turns: pick a tile first, then answer a question for it. Right: the tile and its four
// neighbours turn your colour (taking them from other teams, except their centres and coned tiles).
// Wrong: the same question passes to the next team, who can take the tile instead.
// A host who'd rather ask the questions out loud can play «الحَكَم», with an optional memory mode.

const TR_N = 10, TR_ROWS = ["أ", "ب", "ج", "د", "هـ", "و", "ز", "ح", "ط", "ي"];
const TR_TEAMS = [{ n: "الوردي", c: "#ff5a6e" }, { n: "الأزرق", c: "#3e8bff" }, { n: "الأخضر", c: "#2fbf71" }, { n: "البرتقالي", c: "#ff9f1c" }];
const TR_PLUS = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
const trName = (i) => TR_ROWS[Math.floor(i / TR_N)] + AR((i % TR_N) + 1);
const trTeamOf = (S, id) => (S.tteams || {})[id] ?? -1;
// the tiles a pick would colour: the tile and its four neighbours, minus other teams' centres and cones
function trPlus(S, i, team) {
  const r = Math.floor(i / TR_N), c = i % TR_N, out = [];
  for (const [dr, dc] of TR_PLUS) {
    const nr = r + dr, nc = c + dc; if (nr < 0 || nr >= TR_N || nc < 0 || nc >= TR_N) continue;
    const k = nr * TR_N + nc, o = S.own[k];
    if (o >= 0 && o !== team && (S.ctr[k] || S.cone[k] >= 0)) continue;
    out.push(k);
  }
  return out;
}
// can this team ask for this tile? a claim needs an empty tile; a cone goes on an empty tile or one of your own (not a centre)
const trCanPick = (S, i, team, kind) => kind === "cone" ? (S.own[i] < 0 || (S.own[i] === team && !S.ctr[i] && S.cone[i] < 0)) : S.own[i] < 0;
const trCount = (S) => { const n = [0, 0, 0, 0]; S.own.forEach((o) => o >= 0 && n[o]++); return n; };

ROOM_GAMES.trabee = {
  name: "ترابيع", theme: "trabee", min: 2, need: "يحتاج لاعب في فريقين على الأقل", who: "٢ إلى ٤ فرق · أسئلة",
  rules: ["الفرق تلعب بالدور، والفريق يختار بلاطة فاضية أول، وبعدها يطلع سؤال.", "جواب صح: البلاطة واللي حولها من الجهات الأربع تصير بلونكم، حتى لو كانت لفريق ثاني.", "البلاطة اللي اخترتوها تصير مركز بدائرة، والمركز ما ينسرق.", "بدل الاحتلال تقدرون تحطون قمع على بلاطة: تصير لكم وما تنسرق أبداً.", "جواب غلط: نفس السؤال ينتقل للفريق اللي بعدكم، وإذا جاوب صح ياخذ البلاطة.", "لما يخلص الوقت أو يمتلي الحوش، الفريق اللي معه أكثر بلاط يفوز."],
  setup(S) {
    Object.assign(S, { nt: 2, mode: "bank", picks: QCATS.filter((c) => c !== "الأغلبية"), qtime: 15, mins: 10, cones: 3, memN: 4 });
    H.tt ||= {};
    H.players.forEach((p) => { if (H.tt[p.id] === undefined) ROOM_GAMES.trabee.joined(p.id); });
  },
  joined(id) { const S = H.S, n = (t) => Object.values(H.tt).filter((x) => x === t).length; let best = 0; for (let t = 1; t < (S.nt || 2); t++) if (n(t) < n(best)) best = t; H.tt[id] = best; },
  left(id) { delete H.tt[id]; },
  snap(S) {
    S.tteams = {}; H.players.forEach((p) => (S.tteams[p.id] = Math.min(H.tt[p.id] ?? 0, (S.nt || 2) - 1)));
    S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
    S.matchLeft = H.matchEnd ? Math.max(0, H.matchEnd - now()) : 0;
  },
  key: (S) => `${S.phase}:${S.moves || 0}:${S.ask ? S.ask.steal : ""}`,
  on(m, local) {
    const S = H.S, t = H.tt[m.id];
    if (m.t === "tpick" && S.phase === "pick" && t === S.turn && Number.isInteger(m.i) && m.i >= 0 && m.i < TR_N * TR_N) {
      const kind = m.kind === "cone" && S.coneLeft[t] > 0 ? "cone" : "claim";
      if (trCanPick(S, m.i, t, kind)) trAsk({ i: m.i, kind, team: t, steal: false });
      else if ((S.hidden || []).includes(m.i)) trMiss(m.i, t);
    }
    if (m.t === "tvote" && S.phase === "ask" && S.ask && !S.ask.ref && t === S.ask.team) {
      const k = m.k; if (!Number.isInteger(k) || k < 0 || k > 3 || k === S.ask.excluded) return;
      H.votes[m.id] = k; trTally(); hostSendSoon();
      if (trVoters().every((id) => H.votes[id] !== undefined)) H.deadline = Math.min(H.deadline, now() + 700);
    }
  },
  lobbyPlayers(S) {
    const col = (t) => `<div class="kl-team" style="color:${TR_TEAMS[t].c}"><b>الفريق ${TR_TEAMS[t].n}</b>${S.players.filter((p) => trTeamOf(S, p.id) === t).map((p) => `<button type="button" class="kl-p" data-tsw="${esc(p.id)}" ${isHost() ? "" : "disabled"}>${face(p, 30)}<span>${esc(p.name)}${p.id === PID ? " (أنت)" : ""}</span></button>`).join("") || '<span class="muted">…</span>'}</div>`;
    return `<p class="muted" style="font-weight:700;color:var(--soft)">الفرق (${AR(S.players.length)} لاعب)${isHost() ? " · اضغط على لاعب ينقله للفريق اللي بعده" : ""}</p><div class="kl-teams">${Array.from({ length: S.nt }, (_, t) => col(t)).join("")}</div>`;
  },
  lobby(S) {
    const chips = (attr, list, cur, lab) => `<div class="chips pick">${list.map((v) => `<button type="button" class="chip" data-${attr}="${v}" aria-pressed="${cur === v}">${lab(v)}</button>`).join("")}</div>`;
    const h = (t) => `<p class="muted" style="font-weight:700;color:var(--soft)">${t}</p>`;
    return `${h("كم فريق؟")}${chips("tnt", [2, 3, 4], S.nt, (v) => AR(v))}
      ${h("مين يسأل؟")}<div class="modes"><button type="button" class="mode" data-tmode="bank" aria-pressed="${S.mode === "bank"}"><b>أسئلة جاهزة</b><small>السؤال يطلع في الجوالات، والفريق يصوّت</small></button><button type="button" class="mode" data-tmode="ref" aria-pressed="${S.mode === "ref"}"><b>الحَكَم</b><small>المضيف يسأل بصوته ويحكم صح أو غلط</small></button></div>
      ${h("وقت المباراة")}${chips("tmin", [5, 10, 15, 0], S.mins, (v) => (v ? `${AR(v)} دقائق` : "لين يمتلي الحوش"))}
      ${S.mode === "bank" ? `${h("وقت الإجابة")}${chips("tqt", [10, 15, 25], S.qtime, (v) => `${AR(v)} ثانية`)}
      ${h("فئات الأسئلة")}<div class="chips pick">${QCATS.filter((c) => c !== "الأغلبية").map((c) => `<button type="button" class="chip" data-tcat="${c}" aria-pressed="${S.picks.includes(c)}">${c}</button>`).join("")}</div>` : `${h("وضع الذاكرة: كم دور تختفي الألوان؟")}${chips("tmem", [0, 3, 4, 6], S.memN, (v) => (v ? AR(v) : "بدون"))}`}
      ${h("أقماع لكل فريق")}${chips("tcone", [0, 2, 3, 5], S.cones, (v) => AR(v))}`;
  },
  bindLobby(S) {
    const set = (attr, key, num = true) => screen.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { H.S[key] = num ? +b.dataset[attr] : b.dataset[attr]; beep(700, 0.04); if (key === "nt") trRebalance(); hostSend(); }));
    set("tnt", "nt"); set("tmode", "mode", false); set("tmin", "mins"); set("tqt", "qtime"); set("tcone", "cones"); set("tmem", "memN");
    screen.querySelectorAll("[data-tcat]").forEach((b) => (b.onclick = () => { const c = b.dataset.tcat, p = H.S.picks; H.S.picks = p.includes(c) ? p.filter((x) => x !== c) : [...p, c]; beep(660, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-tsw]").forEach((b) => (b.onclick = () => { const id = b.dataset.tsw; H.tt[id] = ((H.tt[id] ?? 0) + 1) % H.S.nt; beep(640, 0.04); hostSend(); }));
    const used = new Set(Object.values(S.tteams || {}));
    if (used.size < 2 || (S.mode === "bank" && !S.picks.length)) $("start").disabled = true;
  },
  start: () => trStart(),
  resume(S) { if (!(H.usedQ instanceof Set)) H.usedQ = new Set(); H.votes ||= {}; trArmClock(); if (S.phase === "ask" && !S.ask.ref) trFinish(); else if (S.phase === "res") trNext(); },
  views: { pick: trvPick, ask: trvAsk, res: trvRes, end: trvEnd },
};

// ---------------- the host ----------------
// a new number of teams deals everyone out again, evenly
function trRebalance() { H.players.forEach((p, k) => (H.tt[p.id] = k % H.S.nt)); }
function trStart() {
  hClear();
  const S = H.S, N = TR_N * TR_N;
  // teams without anyone in them sit out
  const live = [...new Set(H.players.map((p) => H.tt[p.id] ?? 0))].filter((t) => t < S.nt).sort();
  Object.assign(S, { phase: "pick", own: Array(N).fill(-1), ctr: Array(N).fill(false), cone: Array(N).fill(-1), hidden: [], live, turnIdx: 0, turn: live[0], moves: 0, turnNo: 1,
    coneLeft: [S.cones, S.cones, S.cones, S.cones], memLeft: 0, ask: null, res: null, stolen: [0, 0, 0, 0] });
  H.right = {}; H.usedQ instanceof Set || (H.usedQ = new Set());
  H.matchEnd = S.mins ? now() + S.mins * 60000 : 0; H.deadline = 0;
  trArmClock();
  hostSend();
}
function trArmClock() { if (H.matchEnd) hEvery(() => { if (now() >= H.matchEnd && H.S.phase === "pick") trEnd(); }, 1000); }
const trVoters = () => H.players.map((p) => p.id).filter((id) => H.tt[id] === H.S.ask.team);
function trTally() { const a = H.S.ask, t = [0, 0, 0, 0]; Object.values(H.votes).forEach((k) => t[k]++); a.tally = t; a.voted = Object.keys(H.votes); }
function trAsk(a) {
  hClear(); trArmClock();
  const S = H.S;
  const q = a.q || (S.mode === "bank" ? drawQuestion(pickOne(S.picks.length ? S.picks : ["عامة"]), (H.usedQ ||= new Set())) : null);
  H.q = q; H.votes = {};
  const T = S.mode === "bank" ? (a.steal ? Math.max(8, S.qtime - 5) : S.qtime) * 1000 : 0;
  S.ask = { i: a.i, kind: a.kind, team: a.team, from: a.from ?? a.team, steal: a.steal, excluded: a.excluded ?? -1, ref: S.mode === "ref", T, take: trPlus(S, a.i, a.team), q: q ? { q: q.q, o: q.o, cat: q.cat } : null, tally: [0, 0, 0, 0], voted: [] };
  S.phase = "ask"; H.deadline = T ? now() + T : 0;
  hostSend();
  if (T) hEvery(() => { if (now() >= H.deadline) trFinish(); }, 200);
}
// the referee's call
function trJudge(ok) { if (H.S.phase === "ask" && H.S.ask.ref) trFinish(ok); }
function trFinish(refOk) {
  hClear(); trArmClock();
  const S = H.S, a = S.ask, q = H.q;
  let ok, ans = -1;
  if (a.ref) ok = !!refOk;
  else {
    const ids = Object.keys(H.votes), tally = [0, 1, 2, 3].map((k) => ids.filter((id) => H.votes[id] === k).length);
    ans = ids.length ? argmax(tally) : -1; ok = ans >= 0 && ans === q.a;
    ids.forEach((id) => { if (H.votes[id] === q.a) H.right[id] = (H.right[id] || 0) + 1; });
  }
  let took = [];
  if (ok) {
    took = a.kind === "cone" ? [a.i] : trPlus(S, a.i, a.team);
    took.forEach((k) => { if (S.own[k] >= 0 && S.own[k] !== a.team) S.stolen[a.team]++; S.own[k] = a.team; });
    if (a.kind === "cone") { S.cone[a.i] = a.team; S.coneLeft[a.team]--; } else S.ctr[a.i] = true;
    if (S.memLeft > 0) S.hidden = [...new Set([...S.hidden, ...took])];
  }
  // a wrong answer passes once to the next team in line, with the wrong option struck out
  const next = S.live[(S.live.indexOf(a.from) + 1) % S.live.length];
  const stealNext = !ok && !a.steal && S.live.length > 1 && trCanPick(S, a.i, next, "claim");
  S.res = { ok, ans, took, stealNext, next, right: stealNext || a.ref ? -1 : q.a, answer: !stealNext && !a.ref && q ? q.o[q.a] : "" };
  if (stealNext) H.stealExcluded = ans;
  S.phase = "res"; S.moves++;
  hostSend();
  hLater(trNext, stealNext ? 2600 : 3200);
}
function trNext() {
  const S = H.S, a = S.ask;
  if (S.phase !== "res") return;
  if (S.res.stealNext) return trAsk({ i: a.i, kind: "claim", team: S.res.next, from: a.from, steal: true, q: H.q, excluded: H.stealExcluded });
  // memory mode counts down the turns, then shows everything again
  if (S.memLeft > 0 && --S.memLeft === 0) S.hidden = [];
  if ((H.matchEnd && now() >= H.matchEnd) || !S.own.some((o) => o < 0)) return trEnd();
  S.turnIdx = (S.live.indexOf(a.from) + 1) % S.live.length; S.turn = S.live[S.turnIdx];
  S.phase = "pick"; S.ask = null; S.res = null; S.moves++; S.turnNo++;
  hostSend();
}
// memory mode: every coloured tile goes blank for a few turns, and so does whatever gets taken meanwhile
function trMemory() {
  const S = H.S; if (S.mode !== "ref" || S.phase !== "pick" || !S.memN) return;
  S.memLeft = S.memLeft ? 0 : S.memN;
  S.hidden = S.memLeft ? S.own.map((o, k) => (o >= 0 ? k : -1)).filter((k) => k >= 0) : [];
  beep(500, 0.08); hostSend();
}
// a team picked a tile it forgot was taken: the turn is lost
function trMiss(i, t) {
  hClear(); trArmClock();
  const S = H.S;
  S.ask = { i, kind: "claim", team: t, from: t, steal: false, excluded: -1, ref: true, T: 0, take: [], q: null, tally: [0, 0, 0, 0], voted: [] };
  S.res = { ok: false, miss: true, ans: -1, took: [], stealNext: false, next: t, right: -1, answer: "" };
  S.phase = "res"; S.moves++;
  hostSend();
  hLater(trNext, 2600);
}
function trEnd() {
  hClear();
  const S = H.S;
  S.hidden = []; S.memLeft = 0;
  const top = Object.entries(H.right).sort((x, y) => y[1] - x[1])[0];
  S.awards = { right: top ? { id: top[0], n: top[1] } : null };
  S.phase = "end"; S.moves++;
  hostSend();
}

// ---------------- every phone ----------------
function trBoard(S, o = {}) {
  const hide = new Set(S.hidden || []), prev = new Set(o.prev || []), steal = new Set((o.prev || []).filter((k) => S.own[k] >= 0 && S.own[k] !== o.team));
  let h = '<span></span>' + Array.from({ length: TR_N }, (_, c) => `<span class="tr-lab">${AR(c + 1)}</span>`).join("");
  for (let r = 0; r < TR_N; r++) {
    h += `<span class="tr-lab">${TR_ROWS[r]}</span>`;
    for (let c = 0; c < TR_N; c++) {
      const k = r * TR_N + c, own = S.own[k], hid = hide.has(k) && !(o.flash || []).includes(k); // what was just taken shows for a moment, even in memory mode
      let cls = "tr-cell", st = "";
      if (own >= 0 && !hid) { cls += " own"; st = `--c:${TR_TEAMS[own].c}`; }
      if (hid) cls += " hid";
      if (S.ctr[k] && !hid) cls += " ctr";
      if (S.cone[k] >= 0 && !hid) cls += " cone";
      if (prev.has(k)) cls += " prev" + (steal.has(k) ? " steal" : "") + (k === o.at ? " at" : "");
      if (o.flash && o.flash.includes(k)) cls += " flash";
      if (o.pickable && o.pickable(k)) cls += " pick";
      h += `<button type="button" class="${cls}" style="${st}" data-tk="${k}" ${o.pickable ? "" : "tabindex=\"-1\""} aria-label="${trName(k)}"></button>`;
    }
  }
  return `<div class="tr-board">${h}</div>`;
}
function trScores(S) {
  const n = trCount(S);
  return `<div class="tr-scores">${S.live.map((t) => `<div class="tr-sc ${t === S.turn && S.phase !== "end" ? "on" : ""}">${t === S.turn && S.phase !== "end" ? "<i>الدور</i>" : ""}<b>${AR(n[t])}</b><div class="tr-chalk" style="background:${TR_TEAMS[t].c}"></div><small>${TR_TEAMS[t].n}</small></div>`).join("")}</div>`;
}
const trClock = (S) => (S.mins ? `<span id="trClock">${trMMSS(S.matchLeft)}</span>` : "");
const trMMSS = (ms) => { const s = Math.ceil(ms / 1000); return `${AR(Math.floor(s / 60))}:${AR(String(s % 60).padStart(2, "0"))}`; };
function trTick() { klEvery(() => { const s = KL.S, el = $("trClock"); if (s && el && s.mins) el.textContent = trMMSS(leftOf(s.matchLeft)); }, 500); }

function trvPick(S, fresh) {
  const t = trTeamOf(S, PID), mine = t === S.turn;
  if (fresh) { clearKL(); KL.my.tp = null; KL.my.tkind = "claim"; beep(620, 0.06); if (mine) buzz(30); }
  setTop(`الدور ${AR(S.turnNo || 1)}`);
  const mem = S.memLeft > 0, hid = new Set(S.hidden || []);
  const can = (k) => (mem && hid.has(k)) || trCanPick(S, k, t, KL.my.tkind);
  if (KL.my.tp != null && !can(KL.my.tp)) KL.my.tp = null;
  const draw = () => {
    const p = KL.my.tp, kind = KL.my.tkind, take = p != null ? (kind === "cone" || mem ? [p] : trPlus(S, p, t)) : [];
    const stealN = take.filter((k) => S.own[k] >= 0 && S.own[k] !== t).length;
    show(`
      ${trScores(S)}
      <div class="tr-turn" style="color:${TR_TEAMS[S.turn].c}">${mine ? `دوركم يا ${TR_TEAMS[t].n}! اختاروا بلاطة` : `الفريق ${TR_TEAMS[S.turn].n} يختار بلاطة…`} ${trClock(S)}</div>
      ${S.memLeft ? `<div class="tr-hint">وضع الذاكرة: الألوان مخفية ${AR(S.memLeft)} أدوار</div>` : ""}
      ${trBoard(S, { prev: take, team: t, at: p, pickable: mine ? can : null })}
      ${mine ? `<div class="tr-hint">${p == null ? (mem ? "تذكّروا وين البلاط الفاضي! إذا اخترتوا بلاطة مأخوذة يروح عليكم الدور." : kind === "cone" ? "اختاروا بلاطة فاضية أو من بلاطكم تحطون عليها القمع." : "الدائرة مركز ما ينسرق، والقمع ما ينسرق.") : mem ? `${trName(p)}؟ متأكدين إنها فاضية؟` : kind === "cone" ? `قمع على ${trName(p)}: تصير لكم وما تنسرق.` : `${trName(p)}: تاخذون ${AR(take.length)} بلاطات${stealN ? `، منها ${AR(stealN)} تسرقونها` : ""}.`}</div>
        <button type="button" class="btn btn-marker" id="trGo" ${p == null ? "disabled" : ""}>${p == null ? "اختاروا بلاطة" : `نبي ${trName(p)} · طلّع السؤال`}</button>
        ${S.coneLeft[t] > 0 ? `<button type="button" class="btn btn-ghost" id="trCone" aria-pressed="${kind === "cone"}">${kind === "cone" ? "رجوع للاحتلال" : `حط قمع بدلها (باقي ${AR(S.coneLeft[t])})`}</button>` : ""}` : ""}
      ${isHost() && S.mode === "ref" && S.memN ? `<button type="button" class="btn btn-ghost" id="trMem">${S.memLeft ? "اكشف الألوان الحين" : `وضع الذاكرة: خفّ الألوان ${AR(S.memN)} أدوار`}</button>` : ""}`);
    if (mine) {
      screen.querySelectorAll(".tr-cell.pick").forEach((b) => (b.onclick = () => { KL.my.tp = +b.dataset.tk; beep(700, 0.04); draw(); }));
      $("trGo").onclick = () => { if (KL.my.tp == null || KL.my.sent) return; KL.my.sent = true; $("trGo").disabled = true; beep(880, 0.08); act({ t: "tpick", id: PID, i: KL.my.tp, kind: KL.my.tkind }); };
      if ($("trCone")) $("trCone").onclick = () => { KL.my.tkind = KL.my.tkind === "cone" ? "claim" : "cone"; if (KL.my.tp != null && !can(KL.my.tp)) KL.my.tp = null; beep(600, 0.04); draw(); };
    }
    if ($("trMem")) $("trMem").onclick = () => trMemory();
  };
  if (fresh) KL.my.sent = false;
  draw();
  if (KL.my.sent && $("trGo")) $("trGo").disabled = true;
  if (fresh) trTick();
}
function trStake(S, a) {
  if (S.memLeft > 0) return `<div class="tr-stake"><b>${trName(a.i)}</b><span>${a.kind === "cone" ? "قمع" : "وضع الذاكرة: الألوان مخفية"}</span></div>`;
  const stealN = a.take.filter((k) => S.own[k] >= 0 && S.own[k] !== a.team).length;
  return `<div class="tr-stake"><b>${trName(a.i)}</b><span>${a.kind === "cone" ? "قمع: البلاطة تصير لكم وما تنسرق" : `${AR(a.take.length)} بلاطات${stealN ? `، منها ${AR(stealN)} تنسرق` : ""}`}</span></div>`;
}
function trvAsk(S, fresh) {
  const a = S.ask, t = trTeamOf(S, PID), mine = t === a.team, col = TR_TEAMS[a.team].c;
  if (fresh) { clearKL(); KL.my.tv = undefined; beep(520, 0.06); if (mine) buzz(30); }
  setTop(a.steal ? "فرصة سرقة" : `سؤال على ${trName(a.i)}`);
  const voters = S.players.filter((p) => trTeamOf(S, p.id) === a.team);
  const head = a.steal ? `<div class="tr-banner whistle"><b>فرصتكم يا ${TR_TEAMS[a.team].n}!</b><span>الفريق ${TR_TEAMS[a.from].n} غلط. جاوبوا صح وخذوا ${trName(a.i)}</span></div>` : `<div class="tr-turn" style="color:${col}">سؤال للفريق ${TR_TEAMS[a.team].n} ${trClock(S)}</div>`;
  if (a.ref) {
    show(`${head}${trStake(S, a)}
      <div class="tr-card"><div class="tr-q">${isHost() ? `اسأل الفريق ${TR_TEAMS[a.team].n} سؤالك، وبعدها احكم:` : "الحَكَم يسأل الحين… جاوبوا بصوتكم"}</div>
      ${isHost() ? '<div class="row"><button type="button" class="btn btn-marker" id="trOk" style="flex:1">صح ✓</button><button type="button" class="btn btn-ghost" id="trNo" style="flex:1">غلط ✗</button></div>' : ""}</div>
      ${trBoard(S, { prev: S.memLeft > 0 ? [a.i] : a.take, team: a.team, at: a.i })}`);
    if (isHost()) { $("trOk").onclick = () => trJudge(true); $("trNo").onclick = () => trJudge(false); }
    if (fresh) trTick();
    return;
  }
  const q = a.q, total = Math.max(1, a.tally.reduce((x, y) => x + y, 0));
  show(`${head}${trStake(S, a)}
    <div class="tr-card">
      <span class="tr-cat">${q.cat}</span>
      <div class="tr-q">${esc(q.q)}</div>
      <div class="tr-timer"><i id="trBar" style="background:${col};transform:scaleX(${a.T ? leftOf(S.left) / a.T : 1})"></i></div>
      ${q.o.map((o, k) => `<button type="button" class="tr-opt ${k === a.excluded ? "wrong" : ""}" data-o="${k}" aria-pressed="${KL.my.tv === k}" ${!mine || k === a.excluded ? "disabled" : ""}><i style="width:${mine ? Math.round((a.tally[k] / total) * 100) : 0}%;background:${col}33"></i><span>${esc(o)}</span><small>${mine && a.tally[k] ? AR(a.tally[k]) : k === a.excluded ? `جواب ${TR_TEAMS[a.from].n}` : ""}</small></button>`).join("")}
    </div>
    <div class="row" style="justify-content:space-between"><span class="tr-hint">${mine ? (KL.my.tv === undefined ? "اختر جوابك، والأغلبية تحسم" : "تقدر تغيّر لين يخلص الوقت") : `الفريق ${TR_TEAMS[a.team].n} يصوّت…`}</span><span class="k-faces">${voters.map((p) => `<span style="opacity:${a.voted.includes(p.id) ? 1 : 0.35}">${face(p, 24)}</span>`).join("")}</span></div>`);
  screen.querySelectorAll(".tr-opt:not([disabled])").forEach((b) => (b.onclick = () => { KL.my.tv = +b.dataset.o; beep(660, 0.05); act({ t: "tvote", id: PID, k: KL.my.tv }); screen.querySelectorAll(".tr-opt").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
  if (fresh) { klEvery(() => { const s = KL.S; if (!s || s.phase !== "ask" || !s.ask.T) return; const b = $("trBar"); if (b) b.style.transform = `scaleX(${leftOf(s.left) / s.ask.T})`; }, 200); trTick(); }
}
function trvRes(S, fresh) {
  if (!fresh) return;
  clearKL();
  const a = S.ask, r = S.res, t = trTeamOf(S, PID), col = TR_TEAMS[a.team].c;
  const good = r.ok ? t === a.team : t !== a.team;
  if (r.ok) { beep(784, 0.1); setTimeout(() => beep(1047, 0.18), 110); } else beep(200, 0.3, "sawtooth", 0.08);
  if (good) buzz(60); else buzz([40, 30, 40]);
  const msg = r.miss ? `${trName(a.i)} مأخوذة! راح الدور على ${TR_TEAMS[a.team].n}` : r.ok ? (a.kind === "cone" ? `قمع للفريق ${TR_TEAMS[a.team].n} على ${trName(a.i)}` : `${trName(a.i)} للفريق ${TR_TEAMS[a.team].n}! +${AR(r.took.length)}`) : r.stealNext ? `غلط! السؤال ينتقل للفريق ${TR_TEAMS[r.next].n}…` : a.steal ? "غلط بعد! البلاطة تبقى فاضية" : "غلط!";
  show(`
    ${trScores(S)}
    <div class="tr-banner${r.stealNext ? " whistle" : ""}" style="background:${r.ok ? col : "var(--navy)"}"><b>${msg}</b><span>${r.stealNext ? "الجواب الصح ينكشف بعد محاولتهم" : !a.ref && a.q ? `الجواب: ${esc(r.answer)}` : ""}</span></div>
    ${trBoard(S, { flash: r.took })}`);
}
function trvEnd(S, fresh) {
  if (!fresh) return;
  clearKL(); setTop("انتهت");
  const n = trCount(S), order = S.live.slice().sort((x, y) => n[y] - n[x]), w = order[0], t = trTeamOf(S, PID);
  const tie = order.length > 1 && n[order[0]] === n[order[1]];
  if (!tie && t === w) { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); } else beep(262, 0.4, "triangle", 0.12);
  const thief = S.live.slice().sort((x, y) => S.stolen[y] - S.stolen[x])[0], aw = S.awards || {};
  const pod = [order[1], order[0], order[2]].map((x, k) => (x === undefined ? "" : `<div style="background:${TR_TEAMS[x].c};height:${[52, 72, 38][k]}px">${AR([2, 1, 3][k])}</div>`)).join("");
  show(`
    ${trBoard(S)}
    <div class="tr-cert pop">
      <div class="tr-crown" style="color:${tie ? "var(--navy)" : TR_TEAMS[w].c}">${tie ? "تعادل!" : `فاز الفريق ${TR_TEAMS[w].n}!`}</div>
      <div class="tr-podium">${pod}</div>
      ${order.map((x, k) => `<div class="tr-rank"><span>${AR(k + 1)}</span><i style="background:${TR_TEAMS[x].c}"></i><span>الفريق ${TR_TEAMS[x].n}</span><b>${AR(n[x])}</b></div>`).join("")}
      ${S.stolen[thief] ? `<div class="tr-aw"><span>أكثر فريق سرق</span><b>${TR_TEAMS[thief].n} · ${AR(S.stolen[thief])} بلاطة</b></div>` : ""}
      ${aw.right ? `<div class="tr-aw"><span>أكثر واحد جاوب صح</span><b>${esc(who(aw.right.id).name)} · ${AR(aw.right.n)}</b></div>` : ""}
    </div>
    ${isHost() ? '<button type="button" class="btn btn-marker" id="trAgain">جلسة جديدة بنفس الربع</button>' : '<p class="muted" style="text-align:center">المضيف يقدر يبدأ جلسة جديدة.</p>'}
    <button type="button" class="btn btn-ghost" id="trHome">رجوع لفسحة</button>`);
  if (isHost()) $("trAgain").onclick = () => hostAgain();
  $("trHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}
