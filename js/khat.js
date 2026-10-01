"use strict";
// ================= خط ثلاثة: X-O on the chalkboard, one question per square, two teams voting =================
// the questions live in questions.js, shared with ترابيع
const KCATS = QCATS, KLABEL = QLABEL;

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const TN = { b: "الأزرق", r: "الأحمر" };
const kOther = (t) => (t === "b" ? "r" : "b");
const kStat = (id) => (H.kst[id] ||= { told: 0, right: 0 });
const kWinner = (board) => { for (const l of LINES) { const [a, b, c] = l; if (board[a] && board[a] === board[b] && board[a] === board[c]) return { t: board[a], line: l }; } return null; };
const kCount = (board, t) => board.filter((x) => x === t).length;
function argmax(arr) { const m = Math.max(...arr); return pickOne(arr.map((v, k) => (v === m ? k : -1)).filter((k) => k >= 0)); }
const myTeam = (S) => (S.teams || {})[PID];

ROOM_GAMES.khat = {
  name: "خط ثلاثة", theme: "khat", min: 2, need: "يحتاج لاعب في كل فريق", who: "فريقين · أسئلة",
  rules: ["اللاعبين يتقسمون فريقين، أزرق وأحمر.", "الفريق اللي عليه الدور يختار مربع، وكل مربع فئة.", "السؤال يطلع عند الكل، والفريق يصوّت خلال ١٥ ثانية، وجواب الأغلبية هو جواب الفريق.", "صح؟ المربع لكم. غلط؟ الفريق الثاني ياخذ فرصة يسرقه.", "في مربع «وش يقول الأغلبية؟» الصح هو اللي اختاره أكثر الحاضرين.", "أول فريق يكمل خط ثلاثة يفوز باللوحة.", "مع «الاختفاء»: كل فريق له ٣ علامات بس، والرابعة تمسح أقدم علامة له، فاللوحة ما تتقفل أبداً."],
  setup(S) {
    Object.assign(S, { picks: KCATS.slice(), best: 1, qtime: 15, fade: true, wins: { b: 0, r: 0 }, boardNo: 0 });
    H.team ||= {};
    H.players.forEach((p) => { if (!H.team[p.id]) ROOM_GAMES.khat.joined(p.id); });
    H.kst = {};
  },
  joined(id) { const n = (t) => Object.values(H.team).filter((x) => x === t).length; H.team[id] = n("b") <= n("r") ? "b" : "r"; },
  left(id) { delete H.team[id]; },
  snap(S) {
    S.teams = {}; H.players.forEach((p) => (S.teams[p.id] = H.team[p.id] || "b"));
    S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
  },
  key: (S) => S.phase + ":" + S.boardNo + ":" + (S.turns || 0) + ":" + (S.ask ? S.ask.steal : ""),
  on(m) {
    const S = H.S;
    if (m.t === "kpick" && S.phase === "pick" && H.team[m.id] === S.team && Number.isInteger(m.i) && m.i >= 0 && m.i < 9 && !S.board[m.i]) hostAsk(m.i, S.team, false);
    if (m.t === "kvote" && S.phase === "ask") {
      const a = S.ask, k = m.k;
      if (!Number.isInteger(k) || k < 0 || k >= a.q.o.length || k === a.excluded) return;
      if (!a.maj && H.team[m.id] !== a.team) return;
      H.votes[m.id] = k; kTally(); hostSendSoon();
      if (kVoters().every((id) => H.votes[id] !== undefined)) { H.deadline = Math.min(H.deadline, now() + 700); }
    }
  },
  lobbyPlayers(S) {
    const col = (t) => `<div class="kl-team ${t}"><b>الفريق ${TN[t]}</b>${S.players.filter((p) => (S.teams || {})[p.id] === t).map((p) => `<button type="button" class="kl-p" data-sw="${esc(p.id)}" ${isHost() ? "" : "disabled"}>${face(p, 30)}<span>${esc(p.name)}${p.id === PID ? " (أنت)" : ""}</span></button>`).join("") || '<span class="muted">…</span>'}</div>`;
    return `<p class="muted" style="font-weight:700;color:var(--soft)">الفرق (${AR(S.players.length)} لاعب)${isHost() ? " · اضغط على لاعب ينقله للفريق الثاني" : ""}</p><div class="kl-teams">${col("b")}${col("r")}</div>`;
  },
  lobby(S) {
    return `<p class="muted" style="font-weight:700;color:var(--soft)">كم لوحة؟</p>
      <div class="chips pick"><button type="button" class="chip" data-best="1" aria-pressed="${S.best === 1}">لوحة وحدة</button><button type="button" class="chip" data-best="3" aria-pressed="${S.best === 3}">أفضل من ٣</button><button type="button" class="chip" data-best="5" aria-pressed="${S.best === 5}">أفضل من ٥</button></div>
      <p class="muted" style="font-weight:700;color:var(--soft)">لا تتقفل اللوحة</p>
      <div class="modes"><button type="button" class="mode" data-fade="1" aria-pressed="${S.fade !== false}"><b>الاختفاء</b><small>كل فريق له ٣ علامات، والرابعة تمسح أقدم وحدة</small></button><button type="button" class="mode" data-fade="0" aria-pressed="${S.fade === false}"><b>عادي</b><small>إذا امتلت بدون خط، اللي معه مربعات أكثر يفوز</small></button></div>
      <p class="muted" style="font-weight:700;color:var(--soft)">وقت الإجابة</p>
      <div class="chips pick">${[10, 15, 25].map((n) => `<button type="button" class="chip" data-qt="${n}" aria-pressed="${(S.qtime || 15) === n}">${AR(n)} ثانية</button>`).join("")}</div>
      <p class="muted" style="font-weight:700;color:var(--soft)">فئات المربعات (اختر ٣ على الأقل)</p>
      <div class="chips pick">${KCATS.map((c) => `<button type="button" class="chip" data-kc="${c}" aria-pressed="${S.picks.includes(c)}">${KLABEL(c)}</button>`).join("")}</div>`;
  },
  bindLobby(S) {
    screen.querySelectorAll("[data-sw]").forEach((b) => (b.onclick = () => { const id = b.dataset.sw; H.team[id] = kOther(H.team[id] || "b"); beep(640, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-qt]").forEach((b) => (b.onclick = () => { H.S.qtime = +b.dataset.qt; beep(700, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-fade]").forEach((b) => (b.onclick = () => { H.S.fade = b.dataset.fade === "1"; beep(700, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-best]").forEach((b) => (b.onclick = () => { H.S.best = +b.dataset.best; beep(700, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-kc]").forEach((b) => (b.onclick = () => { const c = b.dataset.kc, p = H.S.picks; H.S.picks = p.includes(c) ? p.filter((x) => x !== c) : [...p, c]; beep(660, 0.04); hostSend(); }));
    const t = Object.values(S.teams || {});
    if (!t.includes("b") || !t.includes("r") || S.picks.length < 3) $("start").disabled = true;
  },
  resume(S) { if (!(H.usedQ instanceof Set)) H.usedQ = new Set(); if (S.phase === "ask") kFinish(); else if (S.phase === "res" && S.res.stealNext) kNext(); },
  start() { Object.assign(H.S, { wins: { b: 0, r: 0 }, boardNo: 0 }); H.kst = {}; if (!(H.usedQ instanceof Set)) H.usedQ = new Set(); kNewBoard(); },
  views: { pick: kvPick, ask: kvAsk, res: kvRes, end: kvEnd },
};

// ---------------- the host ----------------
function kNewBoard() {
  hClear();
  const S = H.S;
  S.boardNo++;
  let deck = []; while (deck.length < 9) deck = deck.concat(shuffled(S.picks));
  Object.assign(S, { phase: "pick", board: Array(9).fill(null), sq: deck.slice(0, 9), team: S.boardNo % 2 ? "b" : "r", turns: 0, win: null, ask: null, res: null, order: { b: [], r: [] }, gone: -1 });
  H.deadline = 0;
  hostSend();
}
const kVoters = () => { const a = H.S.ask; return H.players.map((p) => p.id).filter((id) => a.maj || H.team[id] === a.team); };
function kTally() {
  const a = H.S.ask, n = a.q.o.length, t = { b: Array(n).fill(0), r: Array(n).fill(0) };
  Object.entries(H.votes).forEach(([id, k]) => { const tm = H.team[id]; if (tm) t[tm][k]++; });
  a.tally = t; a.voted = Object.keys(H.votes);
}
function hostAsk(i, team, steal, q0, excluded = -1) {
  hClear();
  const S = H.S, cat = S.sq[i];
  const q = q0 || drawQuestion(cat, (H.usedQ ||= new Set()));
  H.q = q; H.votes = {};
  const qt = S.qtime || 15, maj = q.a < 0, T = (maj ? Math.max(8, qt - 3) : steal ? Math.max(8, qt - 5) : qt) * 1000;
  S.ask = { i, team, steal, excluded, maj, T, q: { q: q.q, o: q.o, cat } };
  S.phase = "ask"; H.deadline = now() + T;
  kTally(); hostSend();
  hEvery(() => { if (now() >= H.deadline) kFinish(); }, 200);
}
function kFinish() {
  hClear();
  const S = H.S, a = S.ask, q = H.q, maj = a.maj, team = a.team, other = kOther(team), n = q.o.length;
  const tally = (ids) => Array.from({ length: n }, (_, k) => ids.filter((id) => H.votes[id] === k).length);
  const teamIds = Object.keys(H.votes).filter((id) => H.team[id] === team);
  const teamAns = teamIds.length ? argmax(tally(teamIds)) : -1;
  const allIds = Object.keys(H.votes);
  const right = maj ? (allIds.length ? argmax(tally(allIds)) : -1) : q.a;
  const ok = teamAns >= 0 && teamAns === right;
  if (!maj) teamIds.forEach((id) => { if (H.votes[id] === right) kStat(id).right++; });
  const told = !ok && !maj ? teamIds.filter((id) => H.votes[id] === right) : [];
  told.forEach((id) => kStat(id).told++);
  let note = "";
  S.gone = -1;
  if (ok) kPlace(a.i, team);
  else if (maj) { // no steal round here: the other team's guess is already in
    const oIds = allIds.filter((id) => H.team[id] === other);
    if (oIds.length && argmax(tally(oIds)) === right) { kPlace(a.i, other); note = `بس الفريق ${TN[other]} توقّع صح، والمربع راح لهم!`; }
  }
  S.win = kWinner(S.board);
  const counts = maj ? tally(allIds) : tally(teamIds);
  const stealNext = !ok && !a.steal && !maj;
  // a wrong answer passes the question to the other team, so the right one stays hidden until they've had their go
  S.res = stealNext
    ? { ok, right: -1, teamAns, told: [], note, counts, total: Math.max(1, teamIds.length), stealNext, answer: "" }
    : { ok, right, teamAns, told, note, counts, total: Math.max(1, maj ? allIds.length : teamIds.length), stealNext, answer: q.o[right] ?? "" };
  S.phase = "res";
  hostSend();
  if (stealNext) hLater(() => { if (S.phase === "res" && S.res.stealNext) kNext(); }, 2600);
}
function kNext() {
  const S = H.S, a = S.ask;
  if (S.phase === "res") {
    if (S.res.stealNext) return hostAsk(a.i, kOther(a.team), true, H.q, S.res.teamAns);
    S.turns++;
    if (S.win || !S.board.includes(null) || S.turns >= kMaxTurns(S)) return kBoardEnd();
    S.team = a.steal ? a.team : kOther(a.team); // after a steal the turn goes to the team that stole
    S.phase = "pick"; S.ask = null; S.res = null;
    return hostSend();
  }
  if (S.phase === "end" && !S.over) return kNewBoard();
}
// with «الاختفاء» each team keeps its last three marks: a fourth wipes its oldest, so the board never fills up
function kPlace(i, t) {
  const S = H.S;
  S.board[i] = t;
  if (S.fade === false) return;
  const o = (S.order ||= { b: [], r: [] })[t];
  o.push(i);
  if (o.length > 3) { const old = o.shift(); S.board[old] = null; S.sq[old] = pickOne(S.picks); S.gone = old; }
}
const kMaxTurns = (S) => (S.fade === false ? 16 : 30);
function kBoardEnd() {
  const S = H.S, b = kCount(S.board, "b"), r = kCount(S.board, "r");
  const w = S.win ? S.win.t : b > r ? "b" : r > b ? "r" : null;
  if (w) S.wins[w]++;
  const need = Math.ceil(S.best / 2);
  S.boardWin = w;
  S.over = S.wins.b >= need || S.wins.r >= need || S.boardNo >= S.best + 2;
  const st = H.kst, top = (key) => { const id = Object.keys(st).sort((x, y) => st[y][key] - st[x][key])[0]; return id && st[id][key] > 0 ? { id, n: st[id][key] } : null; };
  S.honor = { right: top("right"), told: top("told"), mine: {} };
  Object.keys(st).forEach((id) => (S.honor.mine[id] = st[id]));
  S.phase = "end";
  hostSend();
}

// ---------------- every phone ----------------
function kBoardHTML(S, pickable) {
  const w = S.win ? S.win.line : [];
  const old = new Set(S.win || S.fade === false ? [] : ["b", "r"].map((t) => ((S.order || {})[t] || []).length === 3 ? S.order[t][0] : -1));
  return `<div class="k-frame"><div class="k-board">${S.board.map((m, i) => m
    ? `<div class="k-sq ${m} ${w.includes(i) ? "win" : ""} ${old.has(i) ? "old" : ""}"><span class="m">${m === "b" ? "X" : "O"}</span></div>`
    : `<button type="button" class="k-sq open ${i === S.gone ? "gone" : ""}" data-sq="${i}" ${pickable ? "" : "disabled"}>${KLABEL(S.sq[i])}</button>`).join("")}${S.win ? kStrike(S.win) : ""}</div></div>`;
}
// a chalk line through the three: square i sits at column i % 3 counted from the right (the page is RTL)
function kStrike(win) {
  const at = (i) => [2 - (i % 3) + 0.5, Math.floor(i / 3) + 0.5], [x1, y1] = at(win.line[0]), [x2, y2] = at(win.line[2]);
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ex = (dx / len) * 0.38, ey = (dy / len) * 0.38;
  return `<svg class="k-strike ${win.t}" viewBox="0 0 3 3" aria-hidden="true"><line x1="${x1 - ex}" y1="${y1 - ey}" x2="${x2 + ex}" y2="${y2 + ey}" pathLength="1"/></svg>`;
}
const kScore = (S) => `<div class="k-score"><span class="b">الأزرق ${AR(kCount(S.board, "b"))}</span><span class="k-dim" style="font-family:var(--f-body)">${S.best > 1 ? `لوحة ${AR(S.boardNo)} · ${AR(S.wins.b)}-${AR(S.wins.r)}` : "أول خط ثلاثة يفوز"}</span><span class="r">${AR(kCount(S.board, "r"))} الأحمر</span></div>`;
function kvPick(S, fresh) {
  if (!fresh) return;
  clearKL(); setTop(`الدور ${AR(S.turns + 1)}`);
  const mine = myTeam(S) === S.team;
  show(`
    ${kScore(S)}
    <div class="k-turn ${S.team}">${mine ? "دوركم! أي واحد منكم يختار مربع" : `الفريق ${TN[S.team]} يختار مربع…`}</div>
    ${kBoardHTML(S, mine)}
    <p class="k-dim">${mine ? "اتفقوا بسرعة، أول ضغطة تحسم." : "انتظر، وبعدها السؤال يطلع عندك."}</p>`);
  if (mine) screen.querySelectorAll("[data-sq]").forEach((b) => (b.onclick = () => { beep(700, 0.05); act({ t: "kpick", id: PID, i: +b.dataset.sq }); screen.querySelectorAll("[data-sq]").forEach((x) => (x.disabled = true)); b.classList.add("hot"); }));
}
function kvAsk(S, fresh) {
  const a = S.ask, q = a.q, t = myTeam(S), canVote = a.maj || t === a.team;
  if (fresh) { clearKL(); KL.my.kv = undefined; setTop(a.steal ? "فرصة سرقة" : `الدور ${AR(S.turns + 1)}`); beep(520, 0.06); }
  const bars = a.maj ? a.q.o.map((_, k) => a.tally.b[k] + a.tally.r[k]) : t ? a.tally[t] : a.q.o.map(() => 0);
  const showBars = a.maj || t === a.team, total = Math.max(1, bars.reduce((x, y) => x + y, 0));
  const voters = S.players.filter((p) => a.maj || (S.teams || {})[p.id] === a.team);
  show(`
    <div class="k-turn ${a.team}">${a.steal ? `فرصة سرقة للفريق ${TN[a.team]}` : `دور الفريق ${TN[a.team]}`}${a.maj ? " · الكل يصوّت" : ""}</div>
    <div class="k-card" style="display:grid;gap:10px">
      <span class="k-cat">${KLABEL(q.cat)}</span>
      <div class="k-q">${esc(q.q)}</div>
      <div class="k-timer"><i id="kbar"></i></div>
      ${q.o.map((o, k) => `<button type="button" class="k-opt ${k === a.excluded ? "wrong" : ""}" data-o="${k}" aria-pressed="${KL.my.kv === k}" ${!canVote || k === a.excluded ? "disabled" : ""}><i style="width:${showBars ? Math.round((bars[k] / total) * 100) : 0}%"></i><span><b>${esc(o)}</b><small>${showBars && bars[k] ? AR(bars[k]) : ""}</small></span></button>`).join("")}
      ${a.maj ? '<p class="k-dim">ما فيه جواب صح: الصح هو اللي يختاره أكثر الحاضرين، وفريقكم لازم يتوقّعه.</p>' : ""}
    </div>
    <div class="row" style="justify-content:space-between;gap:8px"><span class="k-dim">${canVote ? (KL.my.kv === undefined ? "اختر جوابك" : "تقدر تغيّر لين يخلص الوقت") : `الفريق ${TN[a.team]} يصوّت…`}</span>
    <span class="k-faces">${voters.map((p) => `<span style="opacity:${a.voted.includes(p.id) ? 1 : 0.35}">${face(p, 26)}</span>`).join("")}</span></div>`);
  screen.querySelectorAll(".k-opt:not([disabled])").forEach((b) => (b.onclick = () => { KL.my.kv = +b.dataset.o; beep(660, 0.05); act({ t: "kvote", id: PID, k: KL.my.kv }); screen.querySelectorAll(".k-opt").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
  if (fresh) klEvery(() => { const s = KL.S; if (!s || s.phase !== "ask") return; const b = $("kbar"); if (b) b.style.transform = `scaleX(${leftOf(s.left) / s.ask.T})`; }, 200);
}
function kvRes(S, fresh) {
  if (!fresh) return;
  clearKL();
  const a = S.ask, r = S.res, q = a.q, other = kOther(a.team), t = myTeam(S);
  const good = r.ok ? t === a.team : r.note ? t === other : t !== a.team;
  if (good) { beep(784, 0.1); setTimeout(() => beep(1047, 0.18), 110); buzz(60); } else { beep(200, 0.3, "sawtooth", 0.08); buzz([40, 30, 40]); }
  const last = S.win || !S.board.includes(null) || S.turns + 1 >= kMaxTurns(S);
  show(`
    <div class="k-turn ${a.team}">${r.ok ? `صح! المربع للفريق ${TN[a.team]}` : a.maj ? `الفريق ${TN[a.team]} ما توقّع الأغلبية` : `غلط! ${a.steal ? "والسرقة ما نجحت" : `فرصة سرقة للفريق ${TN[other]}`}`}</div>
    <div class="k-card" style="display:grid;gap:10px">
      <span class="k-cat">${KLABEL(q.cat)}</span>
      <div class="k-q">${esc(q.q)}</div>
      ${q.o.map((o, k) => `<div class="k-opt ${k === r.right ? "right" : k === r.teamAns || k === a.excluded ? "wrong" : ""}"><i style="width:${Math.round((r.counts[k] / r.total) * 100)}%"></i><span><b>${esc(o)}</b><small>${r.counts[k] ? AR(r.counts[k]) : ""}</small></span></div>`).join("")}
      <p class="k-dim">${a.maj ? `اختيار أغلب الحاضرين: «${esc(r.answer)}».` : `جواب الفريق: «${r.teamAns >= 0 ? esc(q.o[r.teamAns]) : "ما جاوبوا"}».`} ${r.stealNext ? `الجواب الصح ينكشف بعد محاولة الفريق ${TN[other]}.` : !a.maj && !r.ok ? `الصح: «${esc(r.answer)}».` : ""} ${r.note}${S.gone >= 0 ? " واختفت أقدم علامة لهم." : ""}</p>
    </div>
    ${r.told.length ? `<div class="k-told pop">${r.told.map((id) => face(who(id), 28)).join("")}<span>«قلت لكم!» ${r.told.map((id) => esc(who(id).name)).join(" و")} صوّت صح</span></div>` : ""}
    ${r.stealNext ? `<p class="k-dim" style="text-align:center">السؤال ينتقل للفريق ${TN[other]}…</p>` : isHost() ? `<button type="button" class="k-btn" id="kNext">${last ? "النتيجة" : "كمّل"}</button>` : '<p class="k-dim" style="text-align:center">بانتظار المضيف…</p>'}`);
  if (isHost() && $("kNext")) $("kNext").onclick = () => kNext();
}
function kvEnd(S, fresh) {
  if (!fresh) return;
  clearKL(); setTop(S.over ? "انتهت" : `بعد اللوحة ${AR(S.boardNo)}`);
  const w = S.over ? (S.wins.b > S.wins.r ? "b" : S.wins.r > S.wins.b ? "r" : null) : S.boardWin, t = myTeam(S);
  if (w && w === t) { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); } else beep(262, 0.4, "triangle", 0.12);
  const h = S.honor, mine = h.mine[PID] || { right: 0, told: 0 };
  const team = (x) => S.players.filter((p) => (S.teams || {})[p.id] === x);
  show(`
    ${kBoardHTML(S, false)}
    <div class="k-card k-honor pop">
      <p class="k-dim">${S.over ? "لوحة الشرف" : `النتيجة ${AR(S.wins.b)}-${AR(S.wins.r)}`}</p>
      <div class="big" style="color:${w === "b" ? "var(--tb)" : w === "r" ? "var(--tr)" : "var(--chalk-y)"}">${w ? `${S.over ? "فاز" : "اللوحة للفريق"} ${S.over ? `الفريق ${TN[w]}` : TN[w]}!` : "تعادل!"}</div>
      <div class="k-faces">${(w ? team(w) : S.players).map((p) => face(p, 40)).join("")}</div>
      ${S.over && h.right ? `<div class="k-row">${face(who(h.right.id), 28)}<span>${esc(who(h.right.id).name)}</span><b>أكثر واحد جاوب صح (${AR(h.right.n)})</b></div>` : ""}
      ${S.over && h.told ? `<div class="k-row">${face(who(h.told.id), 28)}<span>${esc(who(h.told.id).name)}</span><b>ملك «قلت لكم!» (${AR(h.told.n)})</b></div>` : ""}
      ${S.over ? `<div class="k-row">${face(who(PID), 28)}<span>أنت</span><b>${AR(mine.right)} صح · ${AR(mine.told)} «قلت لكم!»</b></div>` : ""}
    </div>
    ${isHost() ? (S.over ? '<button type="button" class="k-btn" id="kAgain">جلسة جديدة بنفس الربع</button>' : `<button type="button" class="k-btn" id="kGo">اللوحة ${AR(S.boardNo + 1)}</button>`) : '<p class="k-dim" style="text-align:center">بانتظار المضيف…</p>'}
    <button type="button" class="k-btn ghost" id="kHome">رجوع لفسحة</button>`);
  if (isHost()) { if (S.over) $("kAgain").onclick = () => hostAgain(); else $("kGo").onclick = () => kNext(); }
  $("kHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}
