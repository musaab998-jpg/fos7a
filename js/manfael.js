"use strict";
// ================= مَن الفاعل؟: a whodunit for teams, on the couch or round the house =================
// One case for everyone: twelve suspects, eight places, five features. Each witness knows one feature; the
// lantern shop repeats one, and in the normal game one of those two lies. The sage (after three testimonies)
// names the liar, the informer (after the sage) names the hiding place, and then a team can accuse.
// «على الكنب»: a question for all teams each round; right = a ticket, fastest right = two; tickets open places.
// «في البيت»: the witnesses are printed cards hidden in the house; riddles tell exactly where, runners scan them.
// The case stays with the host (H); every testimony goes only to the phones of the team that heard it.
const MF_TEAMS = [{ n: "الأزرق", c: "#2f6fe0" }, { n: "الأحمر", c: "#e0442f" }, { n: "الأخضر", c: "#1f9a5a" }, { n: "البنفسجي", c: "#8b4fd8" }];
ROOM_GAMES.manfael = (() => {
  const A = MFA;
  const SAVE = "fos7a.manfael.v1";
  const CATS = ["عامة", "السعودية", "الخليج والعرب", "جغرافيا", "أكل", "حيوانات", "علوم", "كورة", "زمن الطيبين", "ألغاز"];
  const RIDDLES = ["ألغاز", "عامة", "علوم", "حيوانات", "أكل"];
  const CODE_CHARS = "ACEFHKMNPRTXY34679";
  const Q_WAIT = 15000, ACC_LOCK = 120000, LEAD_T = 4 * 60000, INV_T = 60000, ACC_T = 60000, CLUE_T = 40000;
  const R = (n) => Math.floor(Math.random() * n);
  const T = (t) => MF_TEAMS[t] || MF_TEAMS[0];
  // the phone only buzzes once someone has touched it (browsers refuse before that, and say so in the console)
  const vib = (p) => { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; buzz(p); };
  const teamOf = (S, id) => (S.mteams && S.mteams[id] !== undefined ? S.mteams[id] : -1);
  const isHouse = (S) => S.mode === "house";
  const pn = (S, i) => A.placeName(i, S.mode);
  const nW = (seen) => seen.filter((i) => A.isW(i)).length;
  // the three stages: witnesses, then the sage opens, then the informer
  function lockedWhy(S, seen, i) {
    if (i === A.SAGE) return nW(seen) < 3 ? "بعد ٣ شهادات" : "";
    if (i === A.SPY) return S.lie ? (seen.includes(A.SAGE) ? "" : "بعد الحكيم") : nW(seen) < 3 ? "بعد ٣ شهادات" : "";
    return "";
  }
  const stagesOf = (S) => (S.lie ? ["الشهود", "الحكيم", "المُخبِر", "الاتهام"] : ["الشهود", "المُخبِر", "الاتهام"]);
  function stageOf(S, seen) {
    const n = stagesOf(S).length;
    if (seen.includes(A.SPY)) return n - 1;
    if (S.lie) return seen.includes(A.SAGE) ? 2 : nW(seen) >= 3 ? 1 : 0;
    return nW(seen) >= 3 ? 1 : 0;
  }
  const tkWord = (n) => (n === 1 ? "تذكرة" : n === 2 ? "تذكرتين" : "تذاكر");
  const clock = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return AR(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`); };

  // ---------------- what the host keeps between visits: the settings, the case, the printed cards ----------------
  function load() { try { return JSON.parse(localStorage.getItem(SAVE) || "null") || {}; } catch (e) { return {}; } }
  function save() { try { const S = H.S; localStorage.setItem(SAVE, JSON.stringify({ mode: S.mode, nt: S.nt, lie: S.lie, secs: S.secs, K: H.mfCase, codes: H.mfCodes, spots: H.mfSpots })); } catch (e) {} }
  function newCodes() { const used = new Set(); return A.CITY.map(() => { let c; do c = Array.from({ length: 4 }, () => CODE_CHARS[R(CODE_CHARS.length)]).join(""); while (used.has(c)); used.add(c); return c; }); }
  function freshCase(S) { H.mfCase = A.makeCase(S.lie); save(); }
  function publicCase(S) { const K = H.mfCase; S.story = K.story; S.shopTr = K.shopTr; S.sus = K.sus.map((s) => ({ id: s.id, name: s.name, glasses: s.glasses, stache: s.stache, scar: s.scar, head: s.head, color: s.color, eye: s.eye, mouth: s.mouth, tilt: s.tilt })); }
  function assign(id) {
    const S = H.S;
    if (isHouse(S) && id === PID) { delete H.mft[id]; return; }
    const n = (t) => Object.entries(H.mft).filter(([k, x]) => x === t && k !== id).length;
    let best = 0; for (let t = 1; t < S.nt; t++) if (n(t) < n(best)) best = t;
    H.mft[id] = best;
  }
  function reassign() { const S = H.S; H.mft = {}; H.players.filter((p) => !(isHouse(S) && p.id === PID)).forEach((p, k) => (H.mft[p.id] = k % S.nt)); }

  // ---------------- the host: talking to one team ----------------
  const Z = () => H.mf;
  const members = (t) => H.players.map((p) => p.id).filter((id) => H.mft[id] === t);
  function tell(id, m) { m.to = id; if (id === PID) G.direct(m); else if (KL.net) KL.net.send(m); }
  function testimony(h) {
    const K = Z().K, r = A.roleOf(h.at);
    if (r === "spy") return { at: h.at, round: h.round, kind: "spy", hide: K.hide };
    if (r === "sage") return { at: h.at, round: h.round, kind: "sage", liar: K.lie ? K.liarAt : -1 };
    const st = K.W[h.at]; return { at: h.at, round: h.round, kind: "w", st: { t: st.t, v: st.v, pos: st.pos } };
  }
  function tellOne(id, extra = {}) {
    const S = H.S, z = Z(); if (!z) return;
    const t = H.mft[id];
    if (t === undefined || !S.teams.includes(t)) return tell(id, { t: "mfme", sid: S.sid, team: -1 });
    const rd = z.riddle[t];
    tell(id, { t: "mfme", sid: S.sid, team: t, heard: z.heard[t].map(testimony), marks: z.marks[t], riddle: rd ? { i: rd.i, q: rd.q, o: rd.o, cat: rd.cat } : null,
      hints: Object.fromEntries(z.hints[t].map((i) => [i, H.mfSpots[i]])), qWait: Math.max(0, (z.qWait[t] || 0) - now()),
      props: Object.entries(z.props[t] || {}).map(([pid, x]) => ({ id: pid, name: (H.players.find((p) => p.id === pid) || {}).name || "؟", s: x.s, at: x.at })), ...extra });
  }
  const tellTeam = (t, extra) => members(t).forEach((id) => tellOne(id, extra));
  const tellAll = () => H.players.forEach((p) => tellOne(p.id));
  // each team has a leader (قائد) who alone hands in the accusation; it turns every round on the couch,
  // and every few minutes or after an accusation in the house. The others can propose to the leader.
  function pickLeader(t) {
    const S = H.S, z = Z(), mem = members(t), tm = S.tm[t];
    if (!mem.length) { tm.leader = ""; tm.leaderName = ""; return; }
    const id = mem[z.rot[t]++ % mem.length], p = H.players.find((x) => x.id === id);
    tm.leader = id; tm.leaderName = p ? p.name : ""; z.props[t] = {}; z.leadAt[t] = now();
  }
  const leaderOk = (t) => { const tm = H.S.tm[t]; if (!members(t).includes(tm.leader)) pickLeader(t); };
  function hear(t, i) {
    const S = H.S, z = Z(), tm = S.tm[t];
    if (tm.seen.includes(i)) return false;
    z.heard[t].push({ at: i, round: S.round }); tm.seen.push(i); tm.loc = i; tm.fresh = (tm.fresh || 0) + 1;
    return true;
  }

  // ---------------- the host: starting ----------------
  function start() {
    hClear();
    const S = H.S;
    if (!H.mfCase || H.mfCase.played || H.mfCase.lie !== S.lie) freshCase(S);
    const K = JSON.parse(JSON.stringify(H.mfCase));
    H.mfCase.played = true; save();
    const teams = [...new Set(H.players.filter((p) => H.mft[p.id] !== undefined).map((p) => H.mft[p.id]))].filter((t) => t < S.nt).sort();
    const per = (v) => Object.fromEntries(teams.map((t) => [t, typeof v === "function" ? v() : v]));
    H.mf = { K, heard: per(() => []), marks: per(() => ({})), votes: per(() => ({})), acc: {}, riddle: {}, hints: per(() => []), qWait: {}, lock: {}, vq: [], vi: 0, rot: per(0), props: per(() => ({})), leadAt: {} };
    H.usedQ instanceof Set || (H.usedQ = new Set());
    H.deadline = 0; H.mfT0 = 0;
    publicCase(S);
    Object.assign(S, { sid: Math.random().toString(36).slice(2, 8), phase: isHouse(S) ? "print" : "intro", round: 0, teams, q: null, ans: -1, visits: [], eligible: [], verdict: null, vk: 0, narr: "", feed: [], pop: null, winner: [], reveal: null, roles: {},
      tm: per(() => ({ tickets: 1, jail: 0, seen: [], loc: -1, loc0: -1, sent: false, acked: true, accDone: true, wrong: 0, gain: 0, right: false, fast: false, final: -1, tally: [0, 0, 0, 0], voted: [], picks: [], fresh: 0, lock: 0, hints: 0 })) });
    if (isHouse(S)) teams.forEach((t) => (S.tm[t].tickets = 0));
    teams.forEach(pickLeader);
    hostSend(); tellAll();
    if (!isHouse(S)) hLater(ask, 6500);
  }

  // ---------------- «على الكنب»: one round ----------------
  function ask() {
    hClear();
    const S = H.S, z = Z();
    S.round++;
    if (S.round > 1) S.teams.forEach(pickLeader); else S.teams.forEach(leaderOk);
    const d = drawQuestion(pickOne(CATS.filter((c) => QBANK[c])), H.usedQ);
    z.q = d; z.qStart = now();
    S.teams.forEach((t) => { z.votes[t] = {}; Object.assign(S.tm[t], { tally: [0, 0, 0, 0], voted: [], right: false, fast: false, gain: 0, final: -1, picks: [], sent: false, fresh: 0, acked: true, accDone: true }); });
    Object.assign(S, { phase: "q", q: { q: d.q, o: d.o, cat: d.cat }, ans: -1, visits: [], eligible: [], verdict: null, narr: `الجولة ${AR(S.round)}: سؤال للكل` });
    S.qT = S.secs * 1000; H.deadline = now() + S.qT;
    hostSend();
    hEvery(() => { if (now() >= H.deadline) afterQ(); }, 200);
  }
  const voters = () => H.S.teams.filter((t) => !H.S.tm[t].jail).flatMap(members);
  function afterQ() {
    hClear();
    const S = H.S, z = Z(), a = z.q.a;
    let fastest = -1, best = Infinity;
    S.teams.forEach((t) => {
      const tm = S.tm[t], vs = Object.values(z.votes[t]);
      if (!vs.length || tm.jail) { tm.final = -1; tm.right = false; return; }
      const top = Math.max(...tm.tally), tied = tm.tally.map((n, k) => (n === top ? k : -1)).filter((k) => k >= 0);
      tm.final = tied.length === 1 ? tied[0] : vs.filter((v) => tied.includes(v.k)).sort((x, y) => x.at - y.at)[0].k;
      tm.right = tm.final === a;
      const all = members(t).every((id) => z.votes[t][id]), when = all ? Math.max(...vs.map((v) => v.at)) : Math.max(...vs.map((v) => v.at)) + S.qT;
      if (tm.right && when < best) { best = when; fastest = t; }
    });
    S.teams.forEach((t) => { const tm = S.tm[t]; tm.fast = t === fastest; tm.gain = tm.jail || !tm.right ? 0 : tm.fast ? 2 : 1; tm.tickets += tm.gain; });
    S.ans = a; S.phase = "reveal";
    S.narr = `الجواب: ${S.q.o[a]}${fastest >= 0 ? `. الأسرع ${T(fastest).n} ياخذ تذكرتين` : ""}`;
    hostSend();
    hLater(inv, 4500);
  }
  function inv() {
    hClear();
    const S = H.S;
    S.teams.forEach((t) => { const tm = S.tm[t]; tm.picks = []; tm.sent = !tm.tickets || tm.jail > 0; });
    S.phase = "inv"; S.narr = "التحقيق: كل فريق يختار وين يصرف تذاكره";
    H.deadline = now() + INV_T;
    if (S.teams.every((t) => S.tm[t].sent)) { S.narr = "ما فيه تذاكر هالجولة"; hostSend(); return hLater(go, 1800); }
    hostSend();
    hEvery(() => { if (now() >= H.deadline) go(); }, 300);
  }
  function go() {
    hClear();
    const S = H.S, visits = [];
    S.teams.forEach((t) => { const tm = S.tm[t]; tm.loc0 = tm.loc; tm.sent = true; tm.picks.forEach((i) => { if (tm.tickets > 0 && hear(t, i)) { tm.tickets--; visits.push([t, i]); } }); tm.picks = []; });
    S.visits = visits; S.phase = "go"; H.deadline = 0;
    S.narr = visits.length ? "الفرق رايحة للأماكن…" : "ما راح أحد هالجولة";
    hostSend();
    hLater(clue, visits.length * 1400 + 1400);
  }
  function clue() {
    hClear();
    const S = H.S;
    S.teams.forEach((t) => { const tm = S.tm[t]; tm.acked = !tm.fresh; });
    S.phase = "clue"; S.narr = S.visits.length ? "كل فريق وصلته شهاداته على جواله بس" : "";
    H.deadline = now() + CLUE_T;
    hostSend(); tellAll();
    if (S.teams.every((t) => S.tm[t].acked)) return hLater(accPhase, 1500);
    hEvery(() => { if (now() >= H.deadline) accPhase(); }, 300);
  }
  function accPhase() {
    hClear();
    const S = H.S, z = Z();
    S.eligible = S.teams.filter((t) => S.tm[t].seen.includes(A.SPY) && !S.tm[t].jail);
    if (!S.eligible.length) return endRound();
    z.acc = {};
    S.eligible.forEach(leaderOk);
    S.teams.forEach((t) => (S.tm[t].accDone = !S.eligible.includes(t)));
    S.phase = "acc"; S.narr = "الفرق اللي سمعت المُخبِر تقدر تتّهم الحين";
    H.deadline = now() + ACC_T;
    hostSend();
    hEvery(() => { if (now() >= H.deadline) verdicts(); }, 300);
  }
  function verdicts() {
    hClear();
    const S = H.S, z = Z();
    z.vq = S.eligible.filter((t) => z.acc[t]).map((t) => ({ t, ...z.acc[t] })); z.vi = 0; z.wins = [];
    if (!z.vq.length) return endRound();
    nextVerdict();
  }
  // each accusation on the TV: the card first, the stamp a moment later
  function nextVerdict() {
    hClear();
    const S = H.S, z = Z();
    if (z.vi >= z.vq.length) { if (z.wins.length) return finish(z.wins); return endRound(); }
    const v = z.vq[z.vi++];
    S.phase = "verdict"; S.vk++; S.verdict = { t: v.t, s: v.s, at: v.at, ok: null }; S.narr = `${T(v.t).n} يتّهم…`;
    hostSend();
    hLater(() => {
      const ok = v.s === z.K.thief && v.at === z.K.hide;
      S.verdict.ok = ok;
      if (ok) z.wins.push(v.t); else { S.tm[v.t].jail = 3; S.tm[v.t].wrong++; }
      hostSend();
      hLater(nextVerdict, 3200);
    }, 2800);
  }
  function endRound() {
    hClear();
    const S = H.S;
    S.teams.forEach((t) => { const tm = S.tm[t]; if (tm.jail) tm.jail--; });
    S.phase = "between"; S.narr = ""; S.verdict = null;
    hostSend();
    hLater(ask, 1500);
  }
  function finish(wins) {
    hClear();
    const S = H.S, K = Z().K;
    S.phase = "end"; S.winner = wins; S.verdict = null; H.deadline = 0;
    S.reveal = { thief: K.thief, hide: K.hide, liar: K.liarAt, decoy: K.decoy };
    if (H.mfT0) S.final = now() - H.mfT0;
    hostSend(); tellAll();
  }

  // ---------------- «في البيت»: the clock runs and every team goes at its own pace ----------------
  function play() {
    const S = H.S; if (S.phase !== "print") return;
    hClear();
    S.phase = "play"; H.mfT0 = now(); S.narr = "";
    feed("بدأ التحقيق! الشهود مخبّين في البيت", -1);
    hostSend(); tellAll();
    hEvery(houseTick, 1000);
  }
  function houseTick() {
    const S = H.S, z = Z(); if (S.phase !== "play") return hClear();
    let dirty = false;
    S.teams.forEach((t) => {
      if (z.lock[t] && z.lock[t] <= now()) { z.lock[t] = 0; dirty = true; tellTeam(t); }
      if (z.qWait[t] && z.qWait[t] <= now()) { z.qWait[t] = 0; tellTeam(t); }
      if (!S.verdict && (now() - (z.leadAt[t] || 0) > LEAD_T || !members(t).includes(S.tm[t].leader))) { pickLeader(t); feed(`القائد الجديد للفريق ${T(t).n}: ${S.tm[t].leaderName}`, t); dirty = true; tellTeam(t); }
    });
    if (dirty || now() - (H.lastSend || 0) > 10000) hostSendSoon();
  }
  function feed(text, t) { const S = H.S; S.feed = [{ text, t }, ...(S.feed || [])].slice(0, 7); }
  const parseCode = (raw) => String(raw || "").toUpperCase().replace(/^.*[?&]K=/, "").replace(/[^A-Z0-9]/g, "").slice(0, 4);
  function scan(t, id, raw) {
    const S = H.S, z = Z(), code = parseCode(raw), i = H.mfCodes.indexOf(code);
    if (i < 0) return tellOne(id, { bad: "wrong" });
    if (z.lock[t] > now()) return tellOne(id, { bad: "locked" });
    if (S.tm[t].seen.includes(i)) return tellOne(id, { bad: "dup", at: i });
    const why = lockedWhy(S, S.tm[t].seen, i);
    if (why) return tellOne(id, { bad: "early", at: i, why });
    hear(t, i);
    feed(`${T(t).n} مسح بطاقة ${pn(S, i)}`, t);
    S.pop = { t, i, n: (S.pop ? S.pop.n : 0) + 1 };
    hostSend(); tellTeam(t, { found: i });
  }
  function riddle(t, i) {
    const S = H.S, z = Z();
    if (!Number.isInteger(i) || i < 0 || i >= 8 || z.riddle[t] || z.qWait[t] > now() || z.hints[t].includes(i) || S.tm[t].seen.includes(i)) return;
    const d = drawQuestion(pickOne(RIDDLES.filter((c) => QBANK[c])), H.usedQ);
    z.riddle[t] = { i, q: d.q, o: d.o, a: d.a, cat: d.cat };
    tellTeam(t);
  }
  function riddleAns(t, k) {
    const S = H.S, z = Z(), rd = z.riddle[t]; if (!rd) return;
    z.riddle[t] = null;
    if (k === rd.a) { z.hints[t].push(rd.i); S.tm[t].hints++; feed(`${T(t).n} حلّ لغز وعرف مكان بطاقة`, t); hostSendSoon(); tellTeam(t, { solved: rd.i }); }
    else { z.qWait[t] = now() + Q_WAIT; tellTeam(t, { missed: rd.o[rd.a] }); }
  }
  function houseAccuse(t, s, at) {
    const S = H.S, z = Z();
    if (S.verdict || z.lock[t] > now()) return;
    S.vk++; S.verdict = { t, s, at, ok: null }; S.narr = `${T(t).n} يتّهم…`;
    hostSend();
    hLater(() => {
      const ok = s === z.K.thief && at === z.K.hide;
      S.verdict.ok = ok;
      if (!ok) { z.lock[t] = now() + ACC_LOCK; S.tm[t].wrong++; feed(`${T(t).n} اتّهم غلط وانوقف دقيقتين`, t); }
      hostSend(); tellTeam(t);
      hLater(() => { if (ok) return finish([t]); S.verdict = null; S.narr = ""; pickLeader(t); feed(`القائد الجديد للفريق ${T(t).n}: ${S.tm[t].leaderName}`, t); hostSend(); tellTeam(t); }, 3200);
    }, 2800);
  }
  function stopGame() { const S = H.S; if (S.phase === "end") return; finish([]); }

  // ---------------- every phone ----------------
  const mine = () => (KL.my.mf && KL.S && KL.my.mf.sid === KL.S.sid ? KL.my.mf : null);
  function ask4me() { if (!mine() && now() - (KL.my.mfAsked || 0) > 2500) { KL.my.mfAsked = now(); act({ t: "mfwho", id: PID }); } }
  const chip = (t) => `<span class="mf-chip" style="--c:${T(t).c}">${A.lantern(T(t).c)}${T(t).n}</span>`;
  const now1 = (txt) => `<div class="mf-now">${txt}</div>`;
  function head(S, me2) {
    const t = me2.team, tm = S.tm[t], st = stagesOf(S), c = stageOf(S, tm.seen);
    const right = isHouse(S) ? `<span class="mf-clock" id="mfClock">${clock(elapsed(S))}</span>` : `<span class="mf-tix" aria-label="${AR(tm.tickets)} ${tkWord(tm.tickets)}">${A.tickets(tm.tickets)}${tm.tickets ? "" : '<small>بدون تذاكر</small>'}</span>`;
    return `<div class="mf-top" style="--c:${T(t).c}"><div class="mf-r1">${chip(t)}${tm.jail ? '<span class="mf-tag red">موقوفين</span>' : ""}${right}</div>
      ${tm.leader ? `<div class="mf-lead">${tm.leader === PID ? "أنت قائد الفريق: الاتهام بيدك" : `القائد: <b>${esc(tm.leaderName)}</b>`}</div>` : ""}
      <div class="mf-dots" style="grid-template-columns:repeat(${st.length},1fr)">${st.map((n, i) => `<span class="${i === c ? "on" : i < c ? "done" : ""}">${AR(i + 1)} ${n}</span>`).join("")}</div></div>`;
  }
  const tabs = (S, me2) => { const tab = KL.my.mftab || "round", unread = me2.heard.length > (KL.my.mfRead || 0); return `<div class="mf-tabs" role="tablist"><button type="button" role="tab" data-mt="round" aria-selected="${tab === "round"}">${isHouse(S) ? "التحقيق" : "الجولة"}</button><button type="button" role="tab" data-mt="book" aria-selected="${tab === "book"}">دفتر التحقيق${unread && tab !== "book" ? '<i class="mf-dot"></i>' : ""}</button></div>`; };
  const totalOf = (s) => (s.phase === "q" ? s.qT : s.phase === "inv" ? INV_T : s.phase === "acc" ? ACC_T : CLUE_T);
  const timer = (S) => `<div class="mf-timer"><i id="mfBar" style="transform:scaleX(${leftOf(S.left) / Math.max(1, totalOf(S))})"></i></div>`;
  function tickers(S) {
    klEvery(() => {
      const s = KL.S; if (!s || s.game !== "manfael") return;
      const bar = $("mfBar"); if (bar) bar.style.transform = `scaleX(${leftOf(s.left) / Math.max(1, totalOf(s))})`;
      const n = $("mfLeft"); if (n) n.textContent = AR(Math.ceil(leftOf(s.left) / 1000));
      const c = $("mfClock"); if (c) c.textContent = clock(elapsed(s));
      const lk = $("mfLock"); if (lk) { const me2 = mine(), left = me2 ? Math.max(0, (s.tm[me2.team].lock || 0) - (now() - KL.gotAt)) : 0; lk.textContent = clock(left); if (left <= 0 && !KL.my.mfLockDone) { KL.my.mfLockDone = true; render(s, false); } }
      const qw = $("mfQw"); if (qw) { const me2 = mine(), left = me2 ? Math.max(0, me2.qWait - (now() - (KL.my.mfAt || now()))) : 0; qw.textContent = AR(Math.ceil(left / 1000)); if (left <= 0) render(s, false); }
    }, 250);
  }
  const elapsed = (s) => { if (s.phase === "end") return s.final || 0; if (KL.my.mfElBase !== s.elapsed) { KL.my.mfElBase = s.elapsed; KL.my.mfElAt = now(); } return (s.elapsed || 0) + (now() - (KL.my.mfElAt || now())); };

  function render(S, fresh) {
    ask4me();
    if (fresh) { clearKL(); tickers(S); KL.my.mfLockDone = false; if (["intro", "q", "reveal", "inv", "clue", "acc", "verdict", "print"].includes(S.phase)) KL.my.mftab = "round"; }
    const me2 = mine();
    setTop(isHouse(S) ? "في البيت" : S.round ? `الجولة ${AR(S.round)}` : "مَن الفاعل؟");
    if (S.phase === "end") return vEnd(S, fresh, me2);
    if (!me2) return show('<p class="muted" style="text-align:center">لحظة…</p>');
    if (me2.team < 0) return isHost() ? vHost(S, fresh) : show(`<div class="mf-card"><div class="mf-h">دخلت بعد البداية</div><p class="muted">تقدر تتفرج على التلفزيون، وتلعب معهم القضية الجاية.</p></div>`);
    const y = screen.scrollTop, tab = KL.my.mftab || "round";
    if (tab === "book") KL.my.mfRead = me2.heard.length;
    const body = tab === "book" ? notebook(S, me2) : isHouse(S) ? vHouse(S, me2) : vRound(S, me2, fresh);
    show(`${head(S, me2)}${tabs(S, me2)}${body}${isHost() ? `<details class="mf-host"><summary>للمضيف</summary><button type="button" class="btn btn-ghost" id="mfStop">اكشف الحل وأنهِ اللعبة</button></details>` : ""}`);
    if (!fresh) screen.scrollTop = y;
    bind(S, me2);
  }
  function bind(S, me2) {
    const on = (sel, fn) => screen.querySelectorAll(sel).forEach((b) => (b.onclick = () => fn(b)));
    on("[data-mt]", (b) => { KL.my.mftab = b.dataset.mt; KL.my.mfShow = null; beep(660, 0.03); render(KL.S, false); screen.scrollTop = 0; });
    on("[data-ans]", (b) => { KL.my.mfv = +b.dataset.ans; beep(660, 0.05); act({ t: "mfvote", id: PID, k: KL.my.mfv }); screen.querySelectorAll("[data-ans]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
    on("[data-pl]", (b) => { beep(700, 0.04); act({ t: "mfpick", id: PID, i: +b.dataset.pl }); });
    on("#mfGo", () => { beep(880, 0.06); act({ t: "mfsend", id: PID }); });
    on("#mfKeep", () => act({ t: "mfsend", id: PID, keep: true }));
    on("#mfAck", () => { beep(760, 0.05); act({ t: "mfack", id: PID }); KL.my.mftab = "book"; render(KL.S, false); });
    on("#mfAccuse", () => accuseSheet(S));
    on("#mfNoAcc", () => act({ t: "mfnoacc", id: PID }));
    on("[data-sus]", (b) => { const m = me2.marks, id = b.dataset.sus, v = !m[id] ? "out" : m[id] === "out" ? "maybe" : ""; if (v) m[id] = v; else delete m[id]; KL.my.mfAnim = v === "out" ? [+id] : null; act({ t: "mfmark", id: PID, s: +id, v }); render(KL.S, false); KL.my.mfAnim = null; });
    on("[data-apply]", (b) => { const ids = b.dataset.apply.split(",").map(Number); (KL.my.mfApplied ||= []).push(+b.dataset.at); ids.forEach((s) => { me2.marks[s] = "out"; act({ t: "mfmark", id: PID, s, v: "out" }); }); KL.my.mfAnim = ids; beep(520, 0.05); render(KL.S, false); KL.my.mfAnim = null; });
    on("[data-hq]", (b) => { beep(700, 0.04); act({ t: "mfriddle", id: PID, i: +b.dataset.hq }); });
    on("[data-ha]", (b) => { beep(700, 0.05); act({ t: "mfra", id: PID, k: +b.dataset.ha }); });
    on("#mfRx", () => act({ t: "mfrx", id: PID }));
    on("[data-scan]", () => scanner());
    on("[data-mr]", (b) => { beep(660, 0.05); act({ t: "mfrole", id: PID, r: b.dataset.mr }); });
    on("#mfStop", () => { if (confirm("تكشف الحل وتنهي اللعبة على الكل؟")) stopGame(); });
  }

  // ---- «على الكنب» on the phone ----
  function vRound(S, me2, fresh) {
    const t = me2.team, tm = S.tm[t], P = S.phase, q = S.q;
    if (fresh) { if (P === "q") { beep(880, 0.08); vib(40); KL.my.mfv = undefined; } if (P === "clue" && tm.fresh) { beep(988, 0.08); vib([60, 40, 60]); } }
    if (P === "intro" || (P === "between" && !S.round)) return `<div class="mf-card"><span class="mf-lab">القضية</span><div class="mf-h">${A.CASES[S.story].t}</div><p>${A.story(S.story, S.mode).d}</p></div>${now1("كل فريق يبدأ بتذكرة تحقيق وحدة. أول سؤال جاي…")}`;
    if (P === "q" && q) {
      if (tm.jail) return `${now1(`موقوفين بسبب الاتهام الغلط: بدون تذاكر هالجولة${tm.jail > 1 ? " واللي بعدها" : ""}.`)}<div class="mf-card"><span class="mf-cat">${esc(q.cat)}</span><div class="mf-q">${esc(q.q)}</div></div>`;
      const mates = S.players.filter((p) => teamOf(S, p.id) === t);
      return `${now1("سؤال للكل. الصح يعطيكم تذكرة، والأسرع ياخذ تذكرتين.")}<div class="mf-card mf-qc"><div class="mf-row"><span class="mf-cat">${esc(q.cat)}</span><b class="mf-secs" id="mfLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</b></div><div class="mf-q">${esc(q.q)}</div>${timer(S)}
        <div class="mf-opts">${q.o.map((o, k) => `<button type="button" class="mf-opt" data-ans="${k}" aria-pressed="${KL.my.mfv === k}"><span>${esc(o)}</span>${tm.tally[k] ? `<small>${AR(tm.tally[k])}</small>` : ""}</button>`).join("")}</div></div>
        <div class="mf-row"><span class="muted">جواب الأغلبية هو جواب فريقكم.</span><span class="mf-faces">${mates.map((p) => `<span style="opacity:${tm.voted.includes(p.id) ? 1 : 0.35}">${face(p, 24)}</span>`).join("")}</span></div>`;
    }
    if (P === "reveal" && q) {
      const msg = tm.jail ? "موقوفين: بدون تذاكر هالجولة" : tm.fast ? "الأسرع! تذكرتين" : tm.right ? "صح! تذكرة تحقيق" : tm.final < 0 ? "ما جاوبتوا… بدون تذكرة" : "غلط… بدون تذكرة";
      return `<div class="mf-card"><div class="mf-q">${esc(q.q)}</div><div class="mf-opts">${q.o.map((o, k) => `<div class="mf-opt ${k === S.ans ? "ok" : k === tm.final ? "no" : ""}">${k === S.ans ? A.CHECK : k === tm.final ? A.CROSS : ""}<span>${esc(o)}</span></div>`).join("")}</div></div>
        <div class="mf-res ${fresh ? "in" : ""}"><div class="mf-big">${msg}</div>${tm.tickets ? `<div class="mf-tixbig">${A.tickets(tm.tickets - tm.gain)}${A.tickets(tm.gain, "new")}</div><span class="muted">معكم ${AR(tm.tickets)} ${tkWord(tm.tickets)}</span>` : ""}</div>`;
    }
    if (P === "inv") return pickView(S, me2);
    if (P === "go") return `${now1("تابعوا التلفزيون: الفرق رايحة للأماكن…")}${S.visits.filter((v) => v[0] === t).length ? `<div class="mf-card">رايحين: <b>${S.visits.filter((v) => v[0] === t).map((v) => pn(S, v[1])).join("، ")}</b></div>` : ""}`;
    if (P === "clue") {
      const fr = me2.heard.filter((h) => h.round === S.round);
      if (!fr.length) return now1("ما زرتوا مكان هالجولة. الفرق الثانية تقرا شهاداتها…");
      return `${now1(fr.length > 1 ? "شهادات جديدة! لكم بس" : "شهادة جديدة! لكم بس")}${fr.map((h) => witness(S, me2, h, true)).join("")}${!tm.acked ? '<button type="button" class="btn btn-marker" id="mfAck">حطّوها في الدفتر</button>' : '<p class="muted" style="text-align:center">ننتظر باقي الفرق…</p>'}`;
    }
    if (P === "acc") {
      if (S.eligible.includes(t) && !tm.accDone) {
        const clockRow = `<div class="mf-row"><span class="muted">باقي</span><b class="mf-secs" id="mfLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</b></div>${timer(S)}`;
        if (tm.leader === PID) return `${now1("سمعتوا المُخبِر! أنت القائد: تعلن اللص ولا تكملون التحقيق؟")}${clockRow}${propsList(S, me2)}<button type="button" class="btn btn-marker mf-red" id="mfAccuse">أعلن اللص</button><button type="button" class="btn btn-ghost" id="mfNoAcc">مو بعد، نكمل التحقيق</button><p class="muted">الاتهام الغلط يوقفكم جولتين بدون تذاكر.</p>`;
        return `${now1(`سمعتوا المُخبِر! القائد <b>${esc(tm.leaderName)}</b> يقرر الحين.`)}${clockRow}${myProp(S, me2)}<button type="button" class="btn btn-marker" id="mfAccuse">اقترح على القائد</button>`;
      }
      return now1(S.eligible.includes(t) ? "سلّمتوا قراركم. تابعوا التلفزيون…" : "الفرق اللي سمعت المُخبِر تقدر تتّهم الحين…");
    }
    if (P === "verdict" && S.verdict) return verdictCard(S, t);
    return now1(S.narr || "الجولة الجاية…");
  }
  function verdictCard(S, t) {
    const v = S.verdict, s = S.sus[v.s];
    return `<div class="mf-res"><span class="mf-lab">${v.t === t ? "اتهامكم" : `اتهام ${T(v.t).n}`}</span>${A.sFace(s, 90)}<div class="mf-big">${esc(s.name)}، في ${pn(S, v.at)}</div>${v.ok === null ? '<p class="muted">لحظة…</p>' : `<span class="mf-stamp ${v.ok ? "ok" : ""}">${v.ok ? "صحيح!" : isHouse(S) ? "غلط! موقوفين دقيقتين" : "غلط! موقوفين جولتين"}</span>`}</div>`;
  }
  // spending tickets: the whole decision of the round, made together on the phones
  function pickView(S, me2) {
    const t = me2.team, tm = S.tm[t];
    if (tm.sent) return `${now1(tm.jail ? "موقوفين: ما تقدرون تروحون مكان هالجولة." : tm.picks.length ? "اخترتوا. ننتظر باقي الفرق…" : tm.tickets ? "خلّيتوا تذاكركم للجولة الجاية." : "ما معكم تذاكر هالجولة. الجواب الصح الجاي يعطيكم تذكرة.")}${tm.picks.length ? `<div class="mf-card">رايحين: <b>${tm.picks.map((i) => pn(S, i)).join("، ")}</b></div>` : ""}`;
    const n = tm.tickets, sel = tm.picks;
    const row = (i) => {
      const lk = lockedWhy(S, tm.seen, i), was = tm.seen.includes(i), on = sel.includes(i), full = !on && sel.length >= n;
      return `<button type="button" class="mf-place" data-pl="${i}" aria-pressed="${on}" ${lk || was || full ? "disabled" : ""}>${A.miniVig(A.CITY[i].art, 44)}<span><b>${pn(S, i)}</b><small>${A.knows(i, S)}</small></span><em class="${lk ? "lk" : ""}">${was ? "زرتوه" : lk || (on ? "مختار" : "")}</em></button>`;
    };
    const grp = (title, note, list) => `<div class="mf-grp"><b>${title}</b><small>${note}</small></div>${list.map(row).join("")}`;
    return `${now1(`معكم <b>${AR(n)} ${tkWord(n)}</b>. كل تذكرة تفتح مكان واحد. وش الصفة اللي تحتاجونها الحين؟`)}
      <div class="mf-tixrow"><span class="mf-tix">${A.tickets(n - sel.length)}${A.tickets(sel.length, "used")}</span><span class="muted">اخترتوا ${AR(sel.length)} من ${AR(n)}</span><b class="mf-secs sm" id="mfLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</b></div>
      <div class="mf-places">${grp("١ الشهود", `سمعتوا ${AR(nW(tm.seen))} من ٦`, A.WITNESS)}${S.lie ? grp("٢ الحكيم", "يفتح بعد ٣ شهادات", [A.SAGE]) : ""}${grp(S.lie ? "٣ المُخبِر" : "٢ المُخبِر", S.lie ? "يفتح بعد الحكيم" : "يفتح بعد ٣ شهادات", [A.SPY])}</div>
      <button type="button" class="btn btn-marker" id="mfGo" ${sel.length ? "" : "disabled"}>روحوا</button><button type="button" class="btn btn-ghost" id="mfKeep">نخلّيها للجولة الجاية</button>
      <p class="muted">أي واحد في الفريق يقدر يختار، والكل يشوف الاختيار.</p>`;
  }
  // one testimony, as it reaches the phone
  function witness(S, me2, h, fresh) {
    const sage = me2.heard.find((x) => x.kind === "sage"), liar = sage ? sage.liar : -2;
    let q, tags = "";
    if (h.kind === "spy") { q = `«اللص يختبي في ${pn(S, h.hide)}. لا تقول إني قلت لك.»`; tags = `<span class="mf-tag red">${A.PIN}المخبأ: ${pn(S, h.hide)}</span>`; }
    else if (h.kind === "sage") { q = h.liar >= 0 ? `«شاهد ${pn(S, h.liar)} يكذب عليكم. اعكسوا كلامه.»` : "«كل الشهود صادقين هالمرة.»"; tags = h.liar >= 0 ? `<span class="mf-tag red">${pn(S, h.liar)} يكذب</span>` : ""; }
    else { const [s, tg] = A.say(h.st); q = `«${s}»`; tags = `<span class="mf-tag">${A.TRAIT_N[h.st.t]}</span><span class="mf-tag">${tg}</span>`; }
    const lie = h.kind === "w" && liar === h.at;
    return `<div class="mf-wit ${fresh ? "fresh" : ""} ${lie ? "lie" : ""}"><div class="mf-who">${A.miniVig(A.CITY[h.at].art, 46)}<span>${A.whoOf(h.at, S.mode)}${isHouse(S) && A.isW(h.at) ? "" : `، ${pn(S, h.at)}`}</span></div><div class="mf-bubble">${q}</div><div class="mf-tags">${tags}${lie ? '<span class="mf-tag red">كذّاب</span>' : ""}</div></div>`;
  }
  // the notebook: the features, the lineup to cross out, and every testimony this team heard
  function notebook(S, me2) {
    const marks = me2.marks || {}, heard = me2.heard, sage = heard.find((x) => x.kind === "sage"), liar = sage ? sage.liar : -2;
    const left = S.sus.filter((s) => marks[s.id] !== "out").length;
    const done = KL.my.mfApplied || [];
    const last = heard.slice().reverse().find((h) => h.kind === "w" && !done.includes(h.at));
    let helper = "";
    if (last) { const ids = S.sus.filter((s) => !A.fits(s, last.st) && marks[s.id] !== "out").map((s) => s.id); if (ids.length) helper = `<div class="mf-helper"><span>شهادة ${pn(S, last.at)} تشطب ${AR(ids.length)} مشتبهين${S.lie && !sage ? "، إذا كانت صادقة" : ""}.</span><button type="button" class="btn btn-marker sm" data-apply="${ids.join(",")}" data-at="${last.at}">اشطبهم</button></div>`; }
    const rows = A.TRAITS.map((tr) => {
      const hs = heard.filter((h) => h.kind === "w" && h.st.t === tr);
      const where = A.WITNESS.filter((i) => A.traitOf(i, S.shopTr) === tr).map((i) => pn(S, i)).join(" أو ");
      return `<div class="mf-trow"><b>${A.TRAIT_N[tr]}</b>${hs.length ? hs.map((h) => `<span class="mf-tag ${h.at === liar ? "lie" : ""}">${A.say(h.st)[1]}</span>`).join("") : `<span class="muted">ما تعرفون. اسألوا ${where}</span>`}${hs.length > 1 && S.lie && !sage && hs[0].st.v !== hs[1].st.v ? '<span class="mf-tag red">واحد منهم يكذب</span>' : ""}</div>`;
    }).join("");
    const anim = KL.my.mfAnim || [];
    return `${helper}<div class="mf-card"><div class="mf-h sm">الصفات</div>${rows}</div>
      <div class="mf-row"><div class="mf-h sm">المشتبهين</div><span class="muted">باقي ${AR(left)} من ١٢</span></div>
      <div class="mf-lineup">${S.sus.map((s) => `<button type="button" class="mf-sus ${anim.includes(s.id) ? "anim" : ""}" data-sus="${s.id}" data-st="${marks[s.id] || ""}">${A.sFace(s, 60)}<span>${esc(s.name)}</span>${A.XMARK}</button>`).join("")}</div>
      <p class="muted">اضغط مرة للشطب، ومرتين لعلامة استفهام، والثالثة ترجّعه. الشطب يوصل لجوالات فريقك.</p>
      <div class="mf-h sm">اللي سمعناه (${AR(heard.length)} من ٨)</div>
      ${heard.length ? heard.slice().reverse().map((h) => witness(S, me2, h, false)).join("") : `<div class="mf-card muted">ما سمعتوا أحد للحين. ${isHouse(S) ? "كل بطاقة تمسحونها" : "كل تذكرة"} تفتح لكم شاهد.</div>`}`;
  }
  // the accusation: who, and where they hide. A sheet over the screen so a snapshot doesn't close it
  // what the team proposed, on the leader's phone; and what I proposed, on mine
  function propsList(S, me2) {
    const ps = me2.props || [];
    return ps.length ? `<div class="mf-card"><span class="mf-lab">اقتراحات الفريق</span>${ps.map((p) => `<div class="mf-prop">${A.sFace(S.sus[p.s], 30)}<span><b>${esc(S.sus[p.s].name)}</b>، في ${pn(S, p.at)}</span><small>${esc(p.name)}</small></div>`).join("")}</div>` : "";
  }
  function myProp(S, me2) { const p = (me2.props || []).find((x) => x.id === PID); return p ? `<p class="muted">اقتراحك وصل للقائد: <b>${esc(S.sus[p.s].name)}، في ${pn(S, p.at)}</b></p>` : ""; }
  function accuseSheet(S) {
    const A2 = (KL.my.mfAcc = KL.my.mfAcc || {});
    let el = $("mfSheet"); if (!el) { el = document.createElement("div"); el.id = "mfSheet"; el.className = "mf-sheet"; document.body.appendChild(el); }
    const draw = () => {
      const s = KL.S, me2 = mine(); if (!s || !me2) return el.remove();
      const marks = me2.marks || {}, lead = s.tm[me2.team].leader === PID, ps = me2.props || [];
      el.innerHTML = `<div class="mf-sheet-in"><div class="mf-h">${lead ? "مين اللص؟" : "اقتراحك للقائد: مين اللص؟"}</div>
        ${lead && ps.length ? `<div class="chips pick">${ps.map((p, k) => `<button type="button" class="chip" data-prop="${k}">${esc(p.name)}: ${esc(s.sus[p.s].name)}، ${pn(s, p.at)}</button>`).join("")}</div>` : ""}
        <div class="mf-lineup">${s.sus.map((x) => `<button type="button" class="mf-sus" data-pick="${x.id}" data-st="${A2.s === x.id ? "pick" : marks[x.id] === "out" ? "out" : ""}">${A.sFace(x, 54)}<span>${esc(x.name)}</span>${A.XMARK}</button>`).join("")}</div>
        <div class="mf-h sm">وين يختبي؟</div><div class="chips pick">${A.WITNESS.map((i) => `<button type="button" class="chip" data-at="${i}" aria-pressed="${A2.at === i}">${pn(s, i)}</button>`).join("")}</div>
        <p class="muted">${isHouse(s) ? "الاتهام الغلط يوقفكم دقيقتين: لا مسح ولا اتهام." : "الاتهام الغلط يوقفكم جولتين بدون تذاكر."}</p>
        <button type="button" class="btn btn-marker ${lead ? "mf-red" : ""}" id="mfSend" ${A2.s === undefined || A2.at === undefined ? "disabled" : ""}>${lead ? "سلّم الاتهام" : "أرسل اقتراحك للقائد"}</button><button type="button" class="btn btn-ghost" id="mfClose">رجوع</button></div>`;
      el.querySelectorAll("[data-pick]").forEach((b) => (b.onclick = () => { A2.s = +b.dataset.pick; beep(700, 0.04); draw(); }));
      el.querySelectorAll("[data-at]").forEach((b) => (b.onclick = () => { A2.at = +b.dataset.at; beep(700, 0.04); draw(); }));
      el.querySelectorAll("[data-prop]").forEach((b) => (b.onclick = () => { const p = ps[+b.dataset.prop]; A2.s = p.s; A2.at = p.at; beep(700, 0.04); draw(); }));
      $("mfClose").onclick = () => el.remove();
      $("mfSend").onclick = () => { beep(880, 0.08); vib(60); act({ t: lead ? "mfacc" : "mfprop", id: PID, s: A2.s, at: A2.at }); KL.my.mfAcc = null; el.remove(); };
    };
    draw();
  }

  // ---- «في البيت» on the phone: detectives solve riddles, runners scan cards ----
  function vHouse(S, me2) {
    const t = me2.team, tm = S.tm[t], locked = tm.lock > 0 && tm.lock - (now() - KL.gotAt) > 0;
    if (S.phase === "print") {
      const role = (S.roles || {})[PID];
      return `<div class="mf-card"><span class="mf-lab">القضية</span><div class="mf-h">${A.CASES[S.story].t}</div><p>${A.story(S.story, S.mode).d}</p></div>
        <div class="mf-h sm">وش دورك؟</div><div class="mf-roles"><button type="button" data-mr="solve" aria-pressed="${role === "solve"}"><b>محقق</b><small>تقعد عند التلفزيون وتحل ألغاز تكشف مكان البطاقات</small></button><button type="button" data-mr="run" aria-pressed="${role === "run"}"><b>راكض</b><small>تروح للغرف وتدوّر البطاقة وتمسحها</small></button></div>
        ${now1("المضيف يخبّي البطاقات الحين. لا تلحقونه!")}`;
    }
    if (S.verdict) return verdictCard(S, t);
    let h = "";
    if (me2.found !== undefined && KL.my.mfFound !== me2.found) { KL.my.mfFound = me2.found; KL.my.mfShow = me2.found; }
    if (KL.my.mfShow !== undefined && KL.my.mfShow !== null) { const w = me2.heard.find((x) => x.at === KL.my.mfShow); if (w) h += `${now1("مسحتوا البطاقة! هالشهادة لكم بس.")}${witness(S, me2, w, true)}<button type="button" class="btn btn-ghost" data-mt="book" id="mfSeen">حطّوها في الدفتر</button>`; }
    if (locked) h += `${now1("اتهامكم كان غلط: موقوفين، لا مسح ولا اتهام.")}<div class="mf-row"><span class="muted">باقي</span><b class="mf-secs sm" id="mfLock">${clock(tm.lock - (now() - KL.gotAt))}</b></div>`;
    if (tm.seen.includes(A.SPY) && !locked) h += tm.leader === PID ? `${propsList(S, me2)}<button type="button" class="btn btn-marker mf-red" id="mfAccuse">سمعتوا المُخبِر: أعلن اللص (أنت القائد)</button>` : `${myProp(S, me2)}<button type="button" class="btn btn-marker" id="mfAccuse">سمعتوا المُخبِر: اقترح على القائد ${esc(tm.leaderName)}</button>`;
    const msg = KL.my.mfMsg && KL.my.mfMsg.until > now() ? KL.my.mfMsg : null;
    if (msg && msg.bad) h += `<p class="mf-bad">${{ wrong: "الكود غلط، تأكدوا منه", locked: "موقوفين، ما تقدرون تمسحون الحين", dup: `بطاقة ${pn(S, msg.at)} مسحتوها قبل`, early: `${A.whoOf(msg.at, S.mode)} مقفول: ${msg.why}. رجّعوا البطاقة مكانها وارجعوا لها بعدين.` }[msg.bad] || ""}</p>`;
    if (msg && msg.missed) h += `<p class="mf-bad">غلط! الجواب الصح: ${esc(msg.missed)}</p>`;
    const rd = me2.riddle, wait = me2.qWait - (now() - (KL.my.mfAt || now())) > 0;
    if (rd) h += `<div class="mf-card mf-qc"><span class="mf-lab">لغز يكشف مكان بطاقة ${pn(S, rd.i)}</span><div class="mf-q">${esc(rd.q)}</div><div class="mf-opts">${rd.o.map((o, k) => `<button type="button" class="mf-opt" data-ha="${k}"><span>${esc(o)}</span></button>`).join("")}</div><button type="button" class="btn btn-ghost sm" id="mfRx">إلغاء</button></div>`;
    else if (wait) h += `<div class="mf-card muted"><p>اللغز الجاي بعد <b id="mfQw">${AR(Math.ceil((me2.qWait - (now() - KL.my.mfAt)) / 1000))}</b> ثانية…</p></div>`;
    h += `<button type="button" class="btn btn-marker" data-scan ${locked ? "disabled" : ""}>امسحوا بطاقة</button>`;
    const rows = A.CITY.map((p) => {
      const i = p.i, lk = lockedWhy(S, tm.seen, i), was = tm.seen.includes(i), spot = me2.hints[i];
      const canQ = !rd && !wait && !spot && !was;
      return `<div class="mf-hrow ${was ? "done" : ""}">${A.miniVig(p.art, 42)}<div><b>${pn(S, i)}</b><small>${A.knows(i, S)}</small>${spot && !was ? `<span class="mf-hint">${A.PIN}${esc(spot)}</span>` : ""}${lk && !was ? `<small class="lk">${i === A.SAGE ? "الحكيم نايم: " : "مقفول: "}${lk}</small>` : ""}</div>
        <div class="mf-acts">${was ? `<span class="mf-ok">${A.CHECK}مسحتوها</span>` : spot ? '<span class="mf-ok">عرفتوا المكان</span>' : `<button type="button" class="btn btn-ghost sm" data-hq="${i}" ${canQ ? "" : "disabled"}>لغز</button>`}</div></div>`;
    }).join("");
    return `${me2.heard.length ? "" : now1("المحققين يحلّون ألغاز تكشف مكان كل بطاقة بالضبط، والراكضين يدوّرون ويمسحون. تقدرون تدوّرون بدون لغز بعد.")}${h}<div class="mf-hrows">${rows}</div>`;
  }
  // the camera: a sheet over the page, so the snapshots coming in don't turn it off
  function scanner() {
    let el = $("mfScan"); if (el) return;
    el = document.createElement("div"); el.id = "mfScan"; el.className = "mf-sheet";
    el.innerHTML = `<div class="mf-sheet-in"><div class="mf-h">امسحوا البطاقة</div><div class="mf-cam"><video id="mfVideo" playsinline muted></video><div class="mf-frame"></div></div><p class="muted" id="mfCamMsg">وجّهوا الكاميرا على الباركود.</p>
      <form class="mf-code" id="mfCodeF"><input id="mfCode" maxlength="8" dir="ltr" autocomplete="off" placeholder="أو اكتبوا الكود: K7M2"><button type="submit" class="btn btn-marker">فتح</button></form><button type="button" class="btn btn-ghost" id="mfScanX">رجوع</button></div>`;
    document.body.appendChild(el);
    const close = () => { clearInterval(KL.my.mfScanT); if (KL.my.mfStream) KL.my.mfStream.getTracks().forEach((x) => x.stop()); KL.my.mfStream = null; el.remove(); };
    KL.my.mfCloseScan = close;
    $("mfScanX").onclick = close;
    $("mfCodeF").onsubmit = (e) => { e.preventDefault(); const k = $("mfCode").value.trim(); if (k) { beep(760, 0.05); act({ t: "mfcode", id: PID, k }); close(); } };
    (async () => {
      const v = $("mfVideo");
      try {
        KL.my.mfStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (!el.isConnected) return close();
        v.srcObject = KL.my.mfStream; await v.play();
        const det = "BarcodeDetector" in window ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null;
        if (!det && !window.jsQR) await new Promise((ok, no) => { const s = document.createElement("script"); s.src = "vendor/jsqr.js"; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
        const cv = document.createElement("canvas"), cx = cv.getContext("2d", { willReadFrequently: true });
        let busy = false;
        KL.my.mfScanT = setInterval(async () => {
          if (!v.videoWidth || busy) return; busy = true;
          try {
            let text = "";
            if (det) { const r = await det.detect(v); if (r[0]) text = r[0].rawValue; }
            else { const w = 480, h = Math.round((480 * v.videoHeight) / v.videoWidth); cv.width = w; cv.height = h; cx.drawImage(v, 0, 0, w, h); const r = window.jsQR(cx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" }); if (r) text = r.data; }
            if (text) { vib(40); beep(990, 0.06); act({ t: "mfcode", id: PID, k: text }); close(); }
          } catch (e) {}
          busy = false;
        }, 300);
      } catch (e) { const m = $("mfCamMsg"); if (m) m.textContent = "ما قدرنا نفتح الكاميرا. اسمحوا للموقع يستخدمها، أو اكتبوا الكود اللي تحت الباركود."; }
    })();
  }

  // ---- the host's phone when the host isn't in a team («في البيت»): the cards, the race, the controls ----
  function vHost(S, fresh) {
    if (S.phase === "print") {
      show(`<div class="mf-h">خبّوا البطاقات</div><p class="muted">٨ بطاقات، وحدة لكل غرفة. اطبعها، وخبّ كل وحدة في المكان المكتوب عليها. البطاقة نفسها ما فيها شهادة: الشهادة تطلع بس على جوال الفريق اللي يمسحها.</p>
        <button type="button" class="btn btn-ghost" id="mfPrint">اطبع البطاقات (A4)</button>
        ${cardsGrid(S)}
        <div class="mf-card">${S.teams.map((t) => `<div class="mf-row">${chip(t)}<span class="muted">${roleLine(S, t)}</span></div>`).join("")}</div>
        <button type="button" class="btn btn-marker" id="mfPlay">خبّيتها كلها، يلا نبدأ</button>`);
      $("mfPrint").onclick = () => printCards(S);
      $("mfPlay").onclick = () => { beep(880, 0.08); play(); };
      return;
    }
    const y = screen.scrollTop;
    show(`<div class="mf-row"><div class="mf-h">التحقيق شغال</div><span class="mf-clock" id="mfClock">${clock(elapsed(S))}</span></div>
      ${S.verdict ? verdictCard(S, -1) : ""}
      <div class="mf-card">${S.teams.map((t) => `<div class="mf-row">${chip(t)}<span class="muted">${AR(nW(S.tm[t].seen))} شهادات، ${stagesOf(S)[stageOf(S, S.tm[t].seen)]}${S.tm[t].lock > 0 ? "، موقوفين" : ""}</span></div>`).join("")}</div>
      <div class="mf-card mf-feed">${(S.feed || []).map((f) => `<p>${f.t >= 0 ? `<i style="background:${T(f.t).c}"></i>` : ""}${esc(f.text)}</p>`).join("")}</div>
      <p class="muted">افتحوا الغرفة على التلفزيون (اعرضها على شاشة كبيرة) عشان المحققين يشوفون مخطط البيت.</p>
      <button type="button" class="btn btn-ghost" id="mfPrint">اطبع البطاقات مرة ثانية</button>
      <button type="button" class="btn btn-ghost" id="mfStop">اكشف الحل وأنهِ اللعبة</button>`);
    if (!fresh) screen.scrollTop = y;
    $("mfPrint").onclick = () => printCards(S);
    $("mfStop").onclick = () => { if (confirm("تكشف الحل وتنهي اللعبة على الكل؟")) stopGame(); };
  }
  const roleLine = (S, t) => { const ids = Object.keys(S.mteams || {}).filter((id) => S.mteams[id] === t), r = S.roles || {}; const n = (k) => ids.filter((id) => r[id] === k).length; return `${AR(n("solve"))} محقق، ${AR(n("run"))} راكض${ids.length - n("solve") - n("run") ? `، ${AR(ids.length - n("solve") - n("run"))} ما اختاروا` : ""}`; };
  const cardUrl = (code) => `${location.origin}${location.pathname}?k=${code}`;
  const qr = (text) => { try { const q = qrcode(0, "M"); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { return ""; } };
  function cardsGrid() {
    return `<div class="mf-pcards">${A.CITY.map((p, i) => `<div class="mf-pcard">${A.miniVig(p.art, 54)}<b>${A.HOME[i]}</b><small>خبّها: ${esc(H.mfSpots[i])}</small><div class="mf-pqr">${qr(cardUrl(H.mfCodes[i]))}</div><code>${H.mfCodes[i]}</code></div>`).join("")}</div>`;
  }
  // A4: the browser's print dialog with only the cards on the page; the same cards work for every case
  function printCards() {
    let el = $("mfPrintArea"); if (!el) { el = document.createElement("div"); el.id = "mfPrintArea"; document.body.appendChild(el); }
    el.innerHTML = A.CITY.map((p, i) => `<div class="mfp-card"><div class="mfp-head"><b>مَن الفاعل؟</b><span>بطاقة شاهد</span></div><div class="mfp-room">${A.HOME[i]}</div>${A.miniVig(p.art, 120)}<div class="mfp-qr">${qr(cardUrl(H.mfCodes[i]))}</div><div class="mfp-code">${H.mfCodes[i]}</div><div class="mfp-spot">خبّها: ${esc(H.mfSpots[i])}</div><div class="mfp-note">امسحوها من داخل اللعبة، ورجّعوها مكانها.</div></div>`).join("");
    document.body.classList.add("mf-printing");
    const done = () => document.body.classList.remove("mf-printing");
    window.addEventListener("afterprint", done, { once: true });
    try { window.print(); } catch (e) {}
    setTimeout(done, 60000);
  }

  // ---- the end: the thief, the hiding place and the liar, on every phone ----
  function vEnd(S, fresh, me2) {
    const t = me2 ? me2.team : teamOf(S, PID), rv = S.reveal || {}, s = S.sus[rv.thief], won = S.winner.includes(t);
    if (fresh) { document.getElementById("mfSheet")?.remove(); KL.my.mfCloseScan?.(); if (won) { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.3), 240); } else beep(262, 0.4, "triangle", 0.12); }
    setTop("انحلّت القضية");
    show(`<div class="mf-res in"><div class="mf-big">${S.winner.length ? (won ? "مبروك! حلّيتوها" : `حلّها ${S.winner.map((x) => T(x).n).join(" و")}`) : "انكشف الحل"}</div>${s ? A.sFace(s, 110) : ""}<b>اللص: ${s ? esc(s.name) : ""}</b><span class="muted">كان يختبي في ${pn(S, rv.hide)}${rv.liar >= 0 ? `، والكذّاب شاهد ${pn(S, rv.liar)}` : ""}</span></div>
      <div class="mf-card">${S.teams.map((x) => `<div class="mf-row">${chip(x)}<span class="muted">${AR(nW(S.tm[x].seen))} شهادات${S.tm[x].wrong ? `، ${AR(S.tm[x].wrong)} اتهام غلط` : ""}</span>${S.winner.includes(x) ? '<span class="mf-tag ok">فاز</span>' : ""}</div>`).join("")}</div>
      ${isHost() ? '<button type="button" class="btn btn-marker" id="mfAgain">قضية جديدة</button>' : '<p class="muted" style="text-align:center">المضيف يقدر يبدأ قضية جديدة.</p>'}
      <button type="button" class="btn btn-ghost" id="mfHome">رجوع لفسحة</button>`);
    if ($("mfAgain")) $("mfAgain").onclick = () => hostAgain();
    $("mfHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
  }

  // ---------------- the lobby: the host's setup, one question at a time, before anyone arrives ----------------
  const STEPS = (S) => ["الطريقة", "الفرق", "الصعوبة", isHouse(S) ? "البطاقات" : "وقت السؤال", "القضية", "جاهزة"];
  function wizard(S) {
    const w = Math.min(KL.my.mfw || 0, 5), K = H.mfCase, st = STEPS(S);
    const chips = (attr, list, cur, lab) => `<div class="chips pick">${list.map((v) => `<button type="button" class="chip" data-${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${lab(v)}</button>`).join("")}</div>`;
    let body = "";
    if (w === 0) body = `<div class="modes mf-modes"><button type="button" class="mode" data-mfm="couch" aria-pressed="${!isHouse(S)}"><b>على الكنب</b><small>سؤال كل جولة، والجواب الصح تذكرة لأي مكان على الخريطة. بدون تجهيز.</small></button><button type="button" class="mode" data-mfm="house" aria-pressed="${isHouse(S)}"><b>في البيت</b><small>الشهود بطاقات تطبعها وتخبّيها في الغرف، والفرق تركض وتمسحها. ١٠ دقائق تجهيز.</small></button></div>
      <p class="muted">${isHouse(S) ? "في كل فريق محققين عند التلفزيون يحلّون ألغاز تكشف مكان البطاقة، وراكضين يدوّرون ويمسحون. والمضيف يدير اللعبة وما يلعب مع فريق." : "الكل قدام التلفزيون. تناسب الجلسات العائلية، والمضيف يلعب مع فريق."}</p>`;
    else if (w === 1) body = `<p>تنقسم الفرق تلقائي لما يدخل اللاعبين. لكل فريق فانوس بلونه على الخريطة.</p>${chips("mfnt", [2, 3, 4], S.nt, (v) => `${AR(v)} فرق`)}<div class="mf-lans">${MF_TEAMS.slice(0, S.nt).map((x) => `<span style="color:${x.c}">${A.lantern(x.c)}${x.n}</span>`).join("")}</div><p class="muted">كل الفرق تحقق في نفس القضية بنفس الوقت، وتتسابق مين يحلّها أول.</p>`;
    else if (w === 2) body = `<div class="modes mf-modes"><button type="button" class="mode" data-mflie="0" aria-pressed="${!S.lie}"><b>سهلة: كل الشهود صادقين</b><small>للمرة الأولى وللصغار. ٢٠ دقيقة تقريباً.</small></button><button type="button" class="mode" data-mflie="1" aria-pressed="${S.lie}"><b>عادية: شاهد واحد يكذب</b><small>لازم تزورون الحكيم عشان تعرفون الكذّاب. ٣٠ دقيقة تقريباً.</small></button></div>
      <p class="muted">${S.lie ? "محل الفوانيس يعرف نفس صفة مكان ثاني. إذا اختلفوا، واحد منهم يكذب، والحكيم يقول مين." : "في السهلة ما فيه تعارض: كل شهادة صحيحة."}</p>`;
    else if (w === 3 && !isHouse(S)) body = `<p>كم ثانية لكل سؤال؟ الفريق يتناقش ويصوّت خلالها.</p>${chips("mfsecs", [15, 20, 30], S.secs, (v) => `${AR(v)} ثانية`)}<p class="muted">الأسئلة من بنك فسحة. تنحل القضية عادة في ٦ إلى ١٠ جولات.</p>`;
    else if (w === 3) body = `<p>بطاقة لكل غرفة، ومكتوب عليها وين تتخبى. عدّل المكان لو تبي، وينطبع على البطاقة.</p><div class="mf-spots">${A.HOME.map((n, i) => `<label><b>${n}</b><input class="mf-in" data-mfspot="${i}" maxlength="40" value="${esc(H.mfSpots[i])}"></label>`).join("")}</div>
      <button type="button" class="btn btn-ghost" id="mfPrint">اطبع البطاقات (A4)</button><p class="muted">نفس البطاقات تنفع لكل قضية، فتقدر تطبعها وتخبّيها قبل ما يوصلون.</p>`;
    else if (w === 4) body = `<div class="mf-card"><span class="mf-lab">القضية</span><div class="mf-h sm">${A.CASES[K.story].t}</div><p>${A.story(K.story, S.mode).d}</p></div><button type="button" class="btn btn-ghost" id="mfReroll">قضية ثانية</button>
      <div class="mf-secret" id="mfSecret"><span class="mf-lab">الحل لك بس: اضغط مطوّل تشوفه</span><div id="mfSecretIn">${A.sFace(K.sus[K.thief], 48)}<div><b>${esc(K.sus[K.thief].name)}</b><small>يختبي في ${A.placeName(K.hide, S.mode)}${K.lie ? `، وشاهد ${A.placeName(K.liarAt, S.mode)} يكذب عشان يبان ${esc(K.sus[K.decoy].name)} هو اللص` : ""}</small></div></div></div>${isHouse(S) ? "" : '<p class="muted">إذا بتلعب مع فريق، لا تشوف الحل!</p>'}`;
    else body = `<div class="mf-card"><b>${A.CASES[K.story].t}</b><span class="muted">${isHouse(S) ? "في البيت" : "على الكنب"}، ${AR(S.nt)} فرق، ${S.lie ? "شاهد يكذب" : "الشهود صادقين"}${isHouse(S) ? "" : `، ${AR(S.secs)} ثانية للسؤال`}</span></div><p>القضية محفوظة في جوالك. تقدر تقفله الحين، ولما يوصل الضيوف افتح الغرفة على طول.</p>${isHouse(S) ? '<p class="muted">لا تنسى: البطاقات مطبوعة ومخبّاة؟</p>' : ""}`;
    return `<div class="mf-wiz"><div class="mf-wsteps">${st.map((n, i) => `<button type="button" data-mfw="${i}" class="${i === w ? "on" : i < w ? "done" : ""}"><b>${AR(i + 1)}</b>${n}</button>`).join("")}</div><div class="mf-h sm">${st[w]}</div>${body}
      <div class="mf-row2">${w ? '<button type="button" class="btn btn-ghost" id="mfBack">رجوع</button>' : ""}${w < 5 ? '<button type="button" class="btn btn-ghost" id="mfNext">التالي</button>' : ""}</div></div>`;
  }
  function bindWizard() {
    const S = H.S, re = () => hostSend();
    const on = (sel, fn) => screen.querySelectorAll(sel).forEach((b) => (b.onclick = () => { beep(700, 0.04); fn(b); }));
    on("[data-mfw]", (b) => { KL.my.mfw = +b.dataset.mfw; re(); });
    on("#mfNext", () => { KL.my.mfw = (KL.my.mfw || 0) + 1; re(); });
    on("#mfBack", () => { KL.my.mfw = Math.max(0, (KL.my.mfw || 0) - 1); re(); });
    on("[data-mfm]", (b) => { S.mode = b.dataset.mfm; reassign(); save(); re(); });
    on("[data-mfnt]", (b) => { S.nt = +b.dataset.mfnt; reassign(); save(); re(); });
    on("[data-mflie]", (b) => { S.lie = b.dataset.mflie === "1"; freshCase(S); re(); });
    on("[data-mfsecs]", (b) => { S.secs = +b.dataset.mfsecs; save(); re(); });
    on("#mfReroll", () => { freshCase(S); re(); });
    on("#mfPrint", () => printCards(S));
    screen.querySelectorAll("[data-mfspot]").forEach((i) => (i.onchange = () => { H.mfSpots[+i.dataset.mfspot] = i.value.trim() || A.SPOTS[+i.dataset.mfspot]; save(); }));
    const s = $("mfSecret");
    if (s) { const o = () => $("mfSecretIn").classList.add("show"), c = () => $("mfSecretIn").classList.remove("show"); s.onpointerdown = o; s.onpointerup = c; s.onpointerleave = c; s.oncontextmenu = (e) => e.preventDefault(); }
  }
  // the explainer on a phone, for whoever wants to watch it there
  function explainOnPhone(S) {
    $("modalCard").innerHTML = `<h3>طريقة اللعب</h3><div class="mf-exbox" id="mfExPh"></div><div class="mf-row2"><button type="button" class="pbtn alt" id="mfExPrev">السابق</button><button type="button" class="pbtn alt" id="mfExNext">التالي</button></div><button type="button" class="pbtn" id="mfExOk">فهمت</button>`;
    $("modal").hidden = false;
    const ex = A.explainer($("mfExPh"), { mode: S.mode });
    $("mfExPrev").onclick = () => ex.go(-1); $("mfExNext").onclick = () => ex.go(1);
    $("mfExOk").onclick = () => { ex.stop(); $("modal").hidden = true; $("modalCard").innerHTML = ""; };
  }

  // ---------------- the big screen (tv.js) ----------------
  const tvHead = (S) => `<div class="mft-ttl">${MFA_ICON}<b>مَن الفاعل؟</b></div><div class="mft-rnd">${A.CASES[S.story].t}${isHouse(S) ? "، في البيت" : S.round ? `، الجولة ${AR(S.round)}` : ""}</div>`;
  const PH = [["q", "السؤال"], ["inv", "التحقيق"], ["acc", "الاتهام"]];
  const phIdx = (P) => (P === "q" || P === "reveal" ? 0 : P === "inv" || P === "go" || P === "clue" ? 1 : P === "acc" || P === "verdict" ? 2 : -1);
  function tvTeamsList(S) {
    return `<div class="mft-teams">${S.teams.map((t) => { const tm = S.tm[t], st = stagesOf(S); return `<div class="mft-team ${S.verdict && S.verdict.t === t ? "hot" : ""}" style="--c:${T(t).c}">${A.lantern(T(t).c)}<div><b>${T(t).n}</b><small>${AR(nW(tm.seen))} شهادات، المرحلة ${AR(stageOf(S, tm.seen) + 1)}: ${st[stageOf(S, tm.seen)]}${tm.jail ? "، موقوفين" : ""}${tm.lock > 0 ? "، موقوفين" : ""}</small>${tm.leader ? `<span class="mft-lead">${face(who(tm.leader), 24)}القائد: ${esc(tm.leaderName)}</span>` : ""}</div><span class="mft-st">${tvStatus(S, t)}${isHouse(S) ? "" : `<span class="mft-tk">${A.tickets(tm.tickets)}</span>`}</span></div>`; }).join("")}</div>`;
  }
  function tvStatus(S, t) {
    const tm = S.tm[t], P = S.phase;
    if (P === "q") return tm.jail ? "موقوف" : tm.voted.length ? "يجاوب…" : "يفكّر…";
    if (P === "reveal") return tm.fast ? "الأسرع" : tm.right ? "صح" : tm.jail ? "" : tm.final < 0 ? "ما جاوب" : "غلط";
    if (P === "inv") return tm.sent ? "جاهز" : "يختار…";
    if (P === "clue") return tm.acked ? "" : "يقرا…";
    if (P === "acc" && S.eligible.includes(t)) return tm.accDone ? "قرّر" : "يفكّر…";
    if (isHouse(S)) return tm.hints ? `${AR(tm.hints)} لغز` : "";
    return "";
  }
  function tvBox(S) {
    const q = S.q, P = S.phase;
    if (P === "q" && q) return `<div class="mft-box"><div class="mf-row"><span class="mf-cat">${esc(q.cat)}</span>${tvSecs(S.left)}</div><div class="mft-q">${esc(q.q)}</div>${tvBar(S.left, S.qT)}<div class="mft-opts">${q.o.map((o) => `<span>${esc(o)}</span>`).join("")}</div></div>`;
    if (P === "reveal" && q) return `<div class="mft-box"><div class="mft-q sm">${esc(q.q)}</div><div class="mft-ans">${esc(q.o[S.ans])}</div>${S.teams.map((t) => { const tm = S.tm[t]; return `<div class="mft-line ${tm.gain ? "ok" : "no"}">${tm.gain ? A.CHECK : A.CROSS}${T(t).n}${tm.gain ? `: ${tm.gain > 1 ? "تذكرتين" : "تذكرة"}` : tm.jail ? ": موقوف" : ""}</div>`; }).join("")}</div>`;
    if (P === "inv") return `<div class="mft-box"><div class="mft-q">التحقيق</div><span>كل فريق يختار من جواله وين يصرف تذاكره. الشهادة توصل لجوالات الفريق بس.</span>${tvBar(S.left, INV_T)}</div>`;
    if (P === "go" || P === "clue") return `<div class="mft-box"><div class="mft-q sm">زيارات الجولة</div>${S.teams.filter((t) => S.visits.some((v) => v[0] === t)).map((t) => `<div class="mft-line"><i style="background:${T(t).c}"></i>${T(t).n}: ${S.visits.filter((v) => v[0] === t).map((v) => pn(S, v[1])).join("، ")}</div>`).join("") || '<span class="muted">ما راح أحد هالجولة</span>'}</div>`;
    if (P === "acc") return `<div class="mft-box"><div class="mft-q sm">الاتهام</div><span>${S.eligible.map((t) => T(t).n).join(" و")} سمع${S.eligible.length > 1 ? "وا" : ""} المُخبِر ويقدر يتّهم الحين.</span>${tvBar(S.left, ACC_T)}</div>`;
    if (isHouse(S)) return `<div class="mft-box"><div class="mft-q sm">آخر الأخبار</div>${(S.feed || []).slice(0, 5).map((f) => `<div class="mft-line">${f.t >= 0 ? `<i style="background:${T(f.t).c}"></i>` : ""}${esc(f.text)}</div>`).join("") || '<span class="muted">الراكضين طلعوا يدوّرون…</span>'}</div>`;
    return "";
  }
  // the board with the lanterns and the dots that say who has been where (never what they heard)
  function tvBoard(S, fresh) {
    const n = S.teams.length, going = S.phase === "go" && fresh;
    const dots = (i) => { const ts = S.teams.filter((t) => S.tm[t].seen.includes(i) && !(going && S.visits.some((v) => v[0] === t && v[1] === i))); return ts.map((t, k) => `<circle cx="${(k - (ts.length - 1) / 2) * 24}" cy="0" r="9" fill="${T(t).c}" stroke="#3a2a1a" stroke-width="2.5"/>`).join(""); };
    const svg = isHouse(S) ? A.houseSVG(S, dots) : A.boardSVG(S, "t", dots);
    const pawns = S.teams.map((t, k) => { const tm = S.tm[t], p = A.pawnXY(going ? tm.loc0 : tm.loc, k, n, S.mode); return `<g class="mf-pg" data-pw="${t}" style="transform:translate(${p.x}px,${p.y}px)"><g transform="scale(1.15)">${A.pawnArt(T(t).c, tm.jail > 0 || tm.lock > 0)}</g></g>`; }).join("");
    let pops = "";
    if (going) pops = S.visits.map(([t, i], k) => popSvg(S, t, i, `${T(t).n} في ${pn(S, i)}`, 0.2 + k * 1.4)).join("");
    if (isHouse(S) && S.pop && fresh) pops = popSvg(S, S.pop.t, S.pop.i, `${T(S.pop.t).n} لقى البطاقة`, 0);
    return svg.replace('<g class="mf-pawns"></g>', `<g class="mf-pawns">${pawns}</g>`).replace('<g class="mf-pops"></g>', `<g class="mf-pops">${pops}</g>`);
  }
  function popSvg(S, t, i, text, delay) {
    const N = A.popXY(i, S.mode), w = text.length * 13 + 40, hx = T(t).c;
    return `<g class="mf-popin" style="animation-delay:${delay}s"><rect x="${N.x - w / 2}" y="${N.y - 132}" width="${w}" height="44" rx="12" fill="#fff" stroke="${hx}" stroke-width="5"/><path d="M${N.x - 10} ${N.y - 90}l10 16l10-16" fill="#fff" stroke="${hx}" stroke-width="5"/><text x="${N.x}" y="${N.y - 101}" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-weight="700" font-size="22" fill="#1b2a4a">${text}</text></g>`;
  }
  // the lanterns fly to the doors one visit at a time, so the room can follow
  function tvAnimate(S) {
    if (S.phase !== "go") return;
    const sid = S.sid, n = S.teams.length;
    S.visits.forEach(([t, i], k) => setTimeout(() => {
      if (!KL.S || KL.S.sid !== sid || KL.S.phase !== "go") return;
      const g = document.querySelector(`#tv [data-pw="${t}"]`); if (!g) return;
      const p = A.pawnXY(i, S.teams.indexOf(t), n, S.mode); g.style.transform = `translate(${p.x}px,${p.y}px)`;
      const d = document.querySelector(`#tv [data-seen="${i}"]`); if (d) { const ts = S.teams.filter((u) => S.tm[u].seen.includes(i)); d.innerHTML = ts.map((u, j) => `<circle cx="${(j - (ts.length - 1) / 2) * 24}" cy="0" r="9" fill="${T(u).c}" stroke="#3a2a1a" stroke-width="2.5"/>`).join(""); }
    }, 200 + k * 1400));
  }
  function tvOverlay(S, fresh) {
    if (S.phase === "intro") return `<div class="mft-over"><div class="mft-card ${fresh ? "in" : ""}"><span class="k">القضية</span><div class="big">${A.CASES[S.story].t}</div><p>${A.story(S.story, S.mode).d}</p><p class="k">كل فريق يبدأ بتذكرة تحقيق وحدة</p></div></div>`;
    if (S.phase === "print") return `<div class="mft-over"><div class="mft-card ${fresh ? "in" : ""}"><span class="k">القضية، في البيت</span><div class="big">${A.CASES[S.story].t}</div><p>${A.story(S.story, S.mode).d}</p><p class="k">المضيف يخبّي بطاقات الشهود في الغرف. الفرق: اختاروا مين يحل الألغاز ومين يركض.</p></div></div>`;
    if (S.verdict) { const v = S.verdict, s = S.sus[v.s]; return `<div class="mft-over"><div class="mft-card ${fresh ? "in" : ""}"><span class="k">اتهام الفريق ${T(v.t).n}</span>${A.sFace(s, 150)}<div class="big">${esc(s.name)}، في ${pn(S, v.at)}</div><div style="min-height:80px">${v.ok === null ? "" : `<span class="mf-stamp big ${v.ok ? "ok" : ""}">${v.ok ? "صحيح!" : isHouse(S) ? "غلط! موقوفين دقيقتين" : "غلط! موقوفين جولتين"}</span>`}</div></div></div>`; }
    return "";
  }
  function tvPlay(S, fresh) {
    const pi = phIdx(S.phase);
    const html = `<div class="mft">
      <aside class="mft-side">${tvHead(S)}${isHouse(S) ? `<div class="mft-clock">${tvMMSS(elapsedTV(S))}</div>` : `<div class="mft-ph">${PH.map(([, n], i) => `<div class="${i === pi ? "on" : i < pi ? "done" : ""}"><i>${AR(i + 1)}</i>${n}</div>`).join("")}</div>`}${tvBox(S)}${tvTeamsList(S)}</aside>
      <div class="mft-map">${tvBoard(S, fresh)}${S.narr ? `<div class="mft-narr"><div>${esc(S.narr)}</div></div>` : ""}${tvOverlay(S, fresh)}</div></div>`;
    return { html, after: () => { if (fresh) tvAnimate(S); if (isHouse(S)) tvClockRun(S); } };
  }
  // «في البيت»: the clock counts up on its own between snapshots
  const elapsedTV = (S) => (S.phase === "end" ? S.final || 0 : (S.elapsed || 0) + (now() - KL.gotAt));
  function tvClockRun(S) { clearInterval(KL.mfTvT); KL.mfTvT = setInterval(() => { const el = document.querySelector("#tv .mft-clock"); if (!el || !KL.S) return clearInterval(KL.mfTvT); el.textContent = tvMMSS(elapsedTV(KL.S)); }, 500); }
  function tvEnd(S) {
    const rv = S.reveal || {}, s = S.sus[rv.thief];
    return `<div class="mft-end"><div class="mft-endin"><div class="mft-rnd">${A.CASES[S.story].t}</div>
      <div class="mft-grid">${S.sus.map((x, k) => `<div class="s ${x.id === rv.thief ? "thief" : "dim"}" style="animation-delay:${k * 0.06}s, ${1.4 + k * 0.08}s">${A.sFace(x, 84)}</div>`).join("")}</div>
      <div class="mft-who"><b>اللص: ${s ? esc(s.name) : ""}</b><span>كان يختبي في ${pn(S, rv.hide)}${rv.liar >= 0 ? `، والكذّاب شاهد ${pn(S, rv.liar)}` : ""}</span></div>
      <span class="mf-stamp big ok">${S.winner.length ? `فاز ${S.winner.map((t) => T(t).n).join(" و")}!` : "انكشف الحل"}</span></div></div>`;
  }
  // «وينكم!» on the TV: the explainer plays, with the code and the teams beside it
  function tvLobbyHTML(S) {
    return { html: `<div class="mft-lobby" data-keep="manfael"><div class="mf-exbox big" id="mfExTv"></div><aside class="mft-door" id="mfDoor">${tvDoor(S)}</aside></div>`,
      after: () => { KL.mfEx?.stop(); KL.mfEx = A.explainer($("mfExTv"), { mode: S.mode, t0: KL.mfExT0 || (KL.mfExT0 = now()) }); } };
  }
  const tvDoor = (S) => `<div class="mft-qr">${qrSvg(joinUrl(S.code))}</div><p>صوّروا الباركود أو ادخلوا فسحة واكتبوا الرمز</p><div class="mft-code" dir="ltr">${esc(S.code)}</div>
    <div class="mft-lteams">${Array.from({ length: S.nt }, (_, t) => `<div class="mft-lt" style="--c:${T(t).c}"><b>${A.lantern(T(t).c)}${T(t).n}</b><span>${S.players.filter((p) => teamOf(S, p.id) === t).map((p) => face(p, 34)).join("") || "…"}</span></div>`).join("")}</div>
    <p class="mft-mode">${isHouse(S) ? "في البيت" : "على الكنب"} · ${S.lie ? "شاهد يكذب" : "الشهود صادقين"}</p>`;

  const MFA_ICON = '<svg class="mf-icon" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="24" fill="#14484f"/><g transform="translate(16 16) scale(.68)"><path d="M50 8v8" stroke="#fff6dc" stroke-width="3"/><circle cx="50" cy="6" r="4" fill="none" stroke="#fff6dc" stroke-width="3"/><path d="M34 30q16-18 32 0z" fill="#fff6dc"/><path d="M31 30h38l-6 44H37z" fill="#ffc933"/><path d="M31 30h38l-6 44H37z" fill="none" stroke="#fff6dc" stroke-width="4"/><text x="50" y="64" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="30" fill="#14484f">؟</text><path d="M38 74h24l-12 14z" fill="#fff6dc"/></g></svg>';

  // ---------------- the room game ----------------
  const G = {
    name: "مَن الفاعل؟", theme: "manfael", min: 2, need: "يحتاج لاعب في فريقين على الأقل", who: "٢ إلى ٤ فرق · تحقيق",
    rules: [
      "اللص واحد من ١٢ مشتبه، وكل مشتبه يختلف في ٥ صفات: النظارة، الشنب، الجرح، غطاء الراس، لون الورقة.",
      "كل مكان فيه شاهد يعرف صفة وحدة. محل الفوانيس يعرف نفس صفة مكان ثاني، وفي الصعوبة العادية واحد منهم يكذب.",
      "الحكيم يفتح بعد ٣ شهادات ويقول مين الكذّاب، والمُخبِر يفتح بعد الحكيم ويقول وين يختبي اللص.",
      "الشهادة توصل لجوالات فريقكم بس. الفرق الثانية تشوف على التلفزيون إنكم رحتم، بدون ما تعرف وش سمعتوا.",
      "على الكنب: كل جولة سؤال للكل. الصح تذكرة، وأسرع فريق صح تذكرتين، والموقوف بدون. كل تذكرة تفتح مكان.",
      "في البيت: الشهود بطاقات مخبّاة في الغرف. المحققين يحلّون لغز يكشف مكان البطاقة، والراكضين يمسحونها.",
      "بعد المُخبِر قائد الفريق يتّهم: اللص ومكانه، والباقين يقترحون عليه. القائد يتغير كل جولة (وفي البيت كل ٤ دقائق أو بعد كل اتهام). أول فريق يصيب يفوز، والغلط يوقفكم جولتين (أو دقيقتين في البيت).",
    ],
    setup(S) {
      const sv = load();
      Object.assign(S, { mode: sv.mode === "house" ? "house" : "couch", nt: [2, 3, 4].includes(sv.nt) ? sv.nt : 3, lie: sv.lie !== false, secs: [15, 20, 30].includes(sv.secs) ? sv.secs : 20 });
      if (!H.mfCase && sv.K && sv.K.sus && !sv.K.played && sv.K.lie === S.lie) H.mfCase = sv.K;
      if (!H.mfCase || H.mfCase.played || H.mfCase.lie !== S.lie) H.mfCase = A.makeCase(S.lie);
      H.mfCodes ||= Array.isArray(sv.codes) && sv.codes.length === 8 ? sv.codes : newCodes();
      H.mfSpots ||= Array.isArray(sv.spots) && sv.spots.length === 8 ? sv.spots : A.SPOTS.slice();
      H.mft ||= {};
      if (isHouse(S)) delete H.mft[PID];
      Object.keys(H.mft).forEach((id) => { if (H.mft[id] >= S.nt) H.mft[id] = H.mft[id] % S.nt; });
      H.players.forEach((p) => { if (H.mft[p.id] === undefined) assign(p.id); });
      save();
      S.story = H.mfCase.story;
    },
    joined(id) { assign(id); },
    left(id) { delete H.mft[id]; },
    snap(S) {
      S.mteams = {}; H.players.forEach((p) => { if (H.mft[p.id] !== undefined) S.mteams[p.id] = Math.min(H.mft[p.id], S.nt - 1); });
      S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
      S.elapsed = H.mfT0 ? now() - H.mfT0 : 0;
      if (S.tm && H.mf) for (const t of S.teams) S.tm[t].lock = H.mf.lock[t] ? Math.max(0, H.mf.lock[t] - now()) : 0;
      if (S.phase === "lobby" && H.mfCase) S.story = H.mfCase.story;
    },
    key: (S) => (S.phase === "lobby" ? `lobby:${S.mode}:${S.lie}` : `${S.sid || ""}:${S.phase}:${S.round || 0}:${S.vk || 0}`),
    on(m) {
      const S = H.S, z = Z();
      if (!z || !m.id) return;
      if (m.t === "mfwho") return tellOne(m.id);
      const t = H.mft[m.id];
      if (t === undefined || !S.teams.includes(t)) return;
      const tm = S.tm[t];
      if (m.t === "mfmark" && Number.isInteger(m.s) && m.s >= 0 && m.s < 12) { if (m.v === "out" || m.v === "maybe") z.marks[t][m.s] = m.v; else delete z.marks[t][m.s]; return members(t).forEach((id) => id !== m.id && tellOne(id)); }
      if (m.t === "mfrole" && (m.r === "solve" || m.r === "run")) { S.roles = { ...S.roles, [m.id]: m.r }; return hostSendSoon(); }
      if (m.t === "mfvote" && S.phase === "q" && !tm.jail && Number.isInteger(m.k) && m.k >= 0 && m.k < 4) {
        z.votes[t][m.id] = { k: m.k, at: now() - z.qStart };
        tm.tally = [0, 0, 0, 0]; Object.values(z.votes[t]).forEach((v) => tm.tally[v.k]++); tm.voted = Object.keys(z.votes[t]);
        hostSendSoon();
        if (voters().every((id) => z.votes[H.mft[id]] && z.votes[H.mft[id]][id])) H.deadline = Math.min(H.deadline, now() + 700);
        return;
      }
      if (m.t === "mfpick" && S.phase === "inv" && !tm.sent && Number.isInteger(m.i) && m.i >= 0 && m.i < 8) {
        const k = tm.picks.indexOf(m.i);
        if (k >= 0) tm.picks.splice(k, 1);
        else if (tm.picks.length < tm.tickets && !tm.seen.includes(m.i) && !lockedWhy(S, tm.seen, m.i)) tm.picks.push(m.i);
        return hostSendSoon();
      }
      if (m.t === "mfsend" && S.phase === "inv" && !tm.sent) {
        if (m.keep) tm.picks = []; else if (!tm.picks.length) return;
        tm.sent = true; hostSendSoon();
        if (S.teams.every((x) => S.tm[x].sent)) { hClear(); hLater(go, 700); }
        return;
      }
      if (m.t === "mfack" && S.phase === "clue") { tm.acked = true; hostSendSoon(); if (S.teams.every((x) => S.tm[x].acked)) { hClear(); hLater(accPhase, 800); } return; }
      const okAcc = Number.isInteger(m.s) && m.s >= 0 && m.s < 12 && A.WITNESS.includes(m.at);
      if (m.t === "mfprop" && okAcc && tm.seen.includes(A.SPY) && m.id !== tm.leader) { z.props[t][m.id] = { s: m.s, at: m.at }; return tellTeam(t); }
      if (m.t === "mfacc" && okAcc && tm.seen.includes(A.SPY) && m.id === tm.leader) {
        if (isHouse(S)) { if (S.phase === "play") houseAccuse(t, m.s, m.at); return; }
        if (S.phase !== "acc" || !S.eligible.includes(t) || tm.accDone) return;
        z.acc[t] = { s: m.s, at: m.at }; tm.accDone = true; hostSendSoon();
        if (S.eligible.every((x) => S.tm[x].accDone)) { hClear(); hLater(verdicts, 700); }
        return;
      }
      if (m.t === "mfnoacc" && S.phase === "acc" && S.eligible.includes(t) && m.id === tm.leader) { tm.accDone = true; hostSendSoon(); if (S.eligible.every((x) => S.tm[x].accDone)) { hClear(); hLater(verdicts, 700); } return; }
      if (!isHouse(S) || S.phase !== "play") return;
      if (m.t === "mfriddle") return riddle(t, m.i);
      if (m.t === "mfra" && Number.isInteger(m.k)) return riddleAns(t, m.k);
      if (m.t === "mfrx") { z.riddle[t] = null; return tellTeam(t); }
      if (m.t === "mfcode") return scan(t, m.id, m.k);
    },
    direct(m) {
      if (m.t !== "mfme") return;
      KL.my.mf = m; KL.my.mfAt = now();
      if (m.found !== undefined) KL.my.mftab = "round";
      if (m.found !== undefined || m.solved !== undefined) { beep(988, 0.08); vib([60, 40, 60]); }
      if (m.bad || m.missed) { beep(220, 0.2, "sawtooth", 0.06); vib([40, 30, 40]); KL.my.mfMsg = { ...m, until: now() + 8000 }; klLater(() => { if (KL.S && KL.S.game === "manfael") render(KL.S, false); }, 8100); }
      if (KL.S && KL.S.game === "manfael" && KL.S.phase !== "lobby" && !isScreen()) render(KL.S, false);
    },
    lobbyPlayers(S) {
      const col = (t) => `<div class="kl-team" style="color:${T(t).c}"><b>الفريق ${T(t).n}</b>${S.players.filter((p) => teamOf(S, p.id) === t).map((p) => `<button type="button" class="kl-p" data-mfsw="${esc(p.id)}" ${isHost() ? "" : "disabled"}>${face(p, 30)}<span>${esc(p.name)}${p.id === PID ? " (أنت)" : ""}</span></button>`).join("") || '<span class="muted">…</span>'}</div>`;
      const host = isHouse(S) ? S.players.find((p) => p.host) : null;
      return `<button type="button" class="btn btn-ghost" id="mfExplain">شاهد الشرح</button><p class="muted" style="font-weight:700;color:var(--soft)">الفرق (${AR(S.players.length)} لاعب)${isHost() ? " · اضغط على لاعب ينقله للفريق اللي بعده" : ""}</p><div class="kl-teams">${Array.from({ length: S.nt }, (_, t) => col(t)).join("")}</div>${host ? `<p class="muted">${esc(host.name)} المضيف: يخبّي البطاقات ويدير اللعبة، وما يلعب مع فريق.</p>` : ""}`;
    },
    lobby: (S) => wizard(S),
    bindLobby(S) {
      bindWizard();
      screen.querySelectorAll("[data-mfsw]").forEach((b) => (b.onclick = () => { const id = b.dataset.mfsw; if (H.mft[id] === undefined) return; H.mft[id] = (H.mft[id] + 1) % H.S.nt; beep(640, 0.04); hostSend(); }));
      const used = new Set(Object.values(S.mteams || {}));
      if (used.size < 2) $("start").disabled = true;
    },
    start: () => start(),
    resume(S) {
      H.usedQ instanceof Set || (H.usedQ = new Set());
      const P = S.phase;
      if (P === "intro" || P === "between") hLater(ask, 1500);
      else if (P === "q") hEvery(() => { if (now() >= H.deadline) afterQ(); }, 200);
      else if (P === "reveal") hLater(inv, 1500);
      else if (P === "inv") hEvery(() => { if (now() >= H.deadline) go(); }, 300);
      else if (P === "go") hLater(clue, 1500);
      else if (P === "clue") hEvery(() => { if (now() >= H.deadline) accPhase(); }, 300);
      else if (P === "acc") hEvery(() => { if (now() >= H.deadline) verdicts(); }, 300);
      else if (P === "verdict") { Z().vi = Math.max(0, Z().vi - 1); hLater(nextVerdict, 1000); }
      else if (P === "play") { if (S.verdict) { S.verdict = null; } hEvery(houseTick, 1000); }
      tellAll();
    },
    views: {},
    tv: {},
  };
  ["intro", "q", "reveal", "inv", "go", "clue", "acc", "verdict", "between", "print", "play", "end"].forEach((p) => {
    G.views[p] = render;
    G.tv[p] = p === "end" ? tvEnd : tvPlay;
  });
  G.tvLobby = tvLobbyHTML;
  G.tvLobbyUpdate = (S) => { const d = $("mfDoor"); if (d) d.innerHTML = tvDoor(S); };
  G.tvTeams = (S) => Array.from({ length: S.nt || 2 }, (_, t) => ({ n: `الفريق ${T(t).n}`, c: T(t).c, ps: S.players.filter((p) => teamOf(S, p.id) === t) }));
  G.icon = MFA_ICON;
  // «شاهد الشرح» in the lobby works on every phone, not only the host's
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest("#mfExplain") && KL.S) explainOnPhone(KL.S); });
  return G;
})();
