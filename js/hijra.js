"use strict";
// ================= لوحة الهجرة: a category board about the Hijra, Madinah and the Companions =================
// Six categories × five values (١٠٠ to ٥٠٠) on the board. The team whose turn it is picks a square by majority;
// the question goes to that team first, and its majority answer counts. Right: the square's value. Wrong:
// their option is struck out and every other team may steal it at once, one try each; the fastest right
// team takes the value. Two hidden «بطاقة مضاعفة» squares are worth double, answered alone, with no steal.
// After the board (or the chosen number of squares) comes the last round: every team wagers part of its
// points, then one question for all; right adds the wager, wrong takes it away. Highest score wins.
// The host keeps the answers and the doubles; the snapshot only carries what has been revealed.

// ======================================================================================================
// HJ_REVIEW: every question below is a first draft and must be checked by a specialist in the Seerah and
// the sharia sciences before this game is promoted. A reviewer's correction goes into its line here.
// o[a] is the answer counted right; the options are shown in the order written.
// ======================================================================================================
const HJ_CATS = [
  { n: "قبل الهجرة", qs: [
    { q: "ما الاسم القديم للمدينة المنورة قبل الهجرة؟", o: ["تيماء", "يثرب", "خيبر", "تبوك"], a: 1 },
    { q: "عند أي موضع بايع وفدُ أهل يثرب النبيَّ ﷺ في موسم الحج قبل الهجرة؟", o: ["الحديبية", "بدر", "العقبة", "قباء"], a: 2 },
    { q: "كم بيعةً كانت عند العقبة بين النبي ﷺ وأهل يثرب؟", o: ["اثنتان", "ثلاث", "أربع", "واحدة"], a: 0 },
    { q: "من الصحابي الذي أرسله النبي ﷺ إلى يثرب ليعلّم أهلها القرآن بعد بيعة العقبة الأولى؟", o: ["بلال بن رباح", "زيد بن حارثة", "عمّار بن ياسر", "مصعب بن عمير"], a: 3 },
    { q: "إلى أين كانت أول هجرة للمسلمين، قبل الهجرة إلى المدينة؟", o: ["الحبشة", "اليمن", "الشام", "الطائف"], a: 0 },
  ] },
  { n: "طريق الهجرة", qs: [
    { q: "من صاحَبَ النبيَّ ﷺ في رحلة الهجرة إلى المدينة؟", o: ["عمر بن الخطاب", "أبو بكر الصديق", "عثمان بن عفان", "الزبير بن العوام"], a: 1 },
    { q: "من الذي نام في فراش النبي ﷺ ليلة الهجرة؟", o: ["علي بن أبي طالب", "الزبير بن العوام", "أبو بكر الصديق", "سعد بن أبي وقاص"], a: 0 },
    { q: "في غار أي جبل اختبأ النبي ﷺ وصاحبه في طريق الهجرة؟", o: ["جبل النور", "جبل ثور", "جبل أحد", "جبل سلع"], a: 1 },
    { q: "من الذي لحق بالنبي ﷺ وصاحبه طمعًا في الجائزة، فغاصت قوائم فرسه في الأرض؟", o: ["خالد بن الوليد", "أبو سفيان بن حرب", "سراقة بن مالك", "عكرمة بن أبي جهل"], a: 2 },
    { q: "ما اسم الدليل الذي استأجره النبي ﷺ وأبو بكر ليدلّهما على الطريق؟", o: ["عامر بن فهيرة", "عبدالله بن أريقط", "عبدالله بن أبي بكر", "أسامة بن زيد"], a: 1 },
  ] },
  { n: "معالم المدينة", qs: [
    { q: "ما أول مسجد بناه النبي ﷺ عند وصوله إلى المدينة في الهجرة؟", o: ["المسجد النبوي", "مسجد قباء", "مسجد القبلتين", "مسجد الجمعة"], a: 1 },
    { q: "ما اسم المقبرة الشهيرة في المدينة التي دُفن فيها كثير من الصحابة؟", o: ["المعلاة", "الحجون", "البقيع", "الشبيكة"], a: 2 },
    { q: "أي جبل قال عنه النبي ﷺ: «هذا جبلٌ يحبّنا ونحبّه»؟", o: ["جبل أحد", "جبل ثور", "جبل النور", "جبل سلع"], a: 0 },
    { q: "أي مسجد في المدينة اشتهر بارتباطه بحادثة تحويل القبلة من بيت المقدس إلى الكعبة؟", o: ["مسجد قباء", "مسجد الجمعة", "مسجد الغمامة", "مسجد القبلتين"], a: 3 },
    { q: "أكمل الحديث: «ما بين بيتي ومنبري ...»", o: ["باب من أبواب الجنة", "نورٌ على نور", "روضةٌ من رياض الجنة", "خيرٌ من الدنيا وما فيها"], a: 2 },
  ] },
  { n: "الأنصار", qs: [
    { q: "من أي قبيلتين كان الأنصار؟", o: ["قريش وثقيف", "الأوس والخزرج", "هوازن وغطفان", "بكر وتغلب"], a: 1 },
    { q: "في بيت أي صحابي نزل النبي ﷺ أول قدومه المدينة؟", o: ["سعد بن عبادة", "معاذ بن جبل", "أُبيّ بن كعب", "أبو أيوب الأنصاري"], a: 3 },
    { q: "من سيد الأوس الذي اهتزّ لموته عرش الرحمن؟", o: ["سعد بن معاذ", "أُسيد بن حُضير", "سعد بن عبادة", "البراء بن معرور"], a: 0 },
    { q: "من الصحابي الأنصاري الذي كُلّف بجمع القرآن في عهد أبي بكر الصديق؟", o: ["أُبيّ بن كعب", "زيد بن ثابت", "معاذ بن جبل", "عبدالله بن مسعود"], a: 1 },
    { q: "من الصحابي الأنصاري الذي خدم النبي ﷺ عشر سنين منذ قدومه المدينة؟", o: ["جابر بن عبدالله", "البراء بن عازب", "أنس بن مالك", "زيد بن ثابت"], a: 2 },
  ] },
  { n: "ألقاب الصحابة", qs: [
    { q: "من الصحابي الملقّب بـ«الصدّيق»؟", o: ["أبو بكر", "عمر بن الخطاب", "عثمان بن عفان", "علي بن أبي طالب"], a: 0 },
    { q: "من الصحابي الملقّب بـ«الفاروق»؟", o: ["علي بن أبي طالب", "عمر بن الخطاب", "حمزة بن عبدالمطلب", "خالد بن الوليد"], a: 1 },
    { q: "من الصحابي الملقّب بـ«ذي النورين»؟", o: ["الزبير بن العوام", "طلحة بن عبيدالله", "عثمان بن عفان", "عبدالرحمن بن عوف"], a: 2 },
    { q: "من الصحابي الذي قال عنه النبي ﷺ إنه «أمين هذه الأمة»؟", o: ["سعد بن أبي وقاص", "عبدالرحمن بن عوف", "طلحة بن عبيدالله", "أبو عبيدة بن الجراح"], a: 3 },
    { q: "من الصحابية الملقّبة بـ«ذات النطاقين» لما فعلته في الهجرة؟", o: ["عائشة بنت أبي بكر", "أسماء بنت أبي بكر", "فاطمة بنت محمد", "أم سلمة"], a: 1 },
  ] },
  { n: "أحداث في المدينة", qs: [
    { q: "ماذا يُسمّى ما فعله النبي ﷺ حين جعل المهاجرين والأنصار إخوة؟", o: ["البيعة", "المؤاخاة", "الهدنة", "الصلح"], a: 1 },
    { q: "ما أول غزوة كبرى انتصر فيها المسلمون، وكانت في السنة الثانية للهجرة؟", o: ["أحد", "الخندق", "بدر", "تبوك"], a: 2 },
    { q: "في أي غزوة حفر المسلمون خندقًا حول المدينة؟", o: ["الأحزاب", "حنين", "أحد", "خيبر"], a: 0 },
    { q: "في عهد أي خليفة بدأ العمل بالتقويم الهجري؟", o: ["أبو بكر الصديق", "عثمان بن عفان", "علي بن أبي طالب", "عمر بن الخطاب"], a: 3 },
    { q: "ما الشهر الذي جُعل أول السنة الهجرية؟", o: ["ربيع الأول", "محرّم", "رمضان", "ذو الحجة"], a: 1 },
  ] },
];
const HJ_FINAL = { c: "سؤال الختام", q: "كم سنة تقريبًا عاش النبي ﷺ في المدينة بعد الهجرة؟", o: ["ثلاث عشرة", "عشر", "خمس", "عشرون"], a: 1 };
const HJ_REVIEW = "المحتوى تحت المراجعة الشرعية";

// ================= teams, look and small helpers =================
// each team is named after a landmark of Madinah, and wears one of فسحة's sticky-note characters
const HJ_TEAMS = [
  { n: "قباء", c: "#2f6fa8", av: { k: 0, c: 3, e: 1, m: 1, h: 0, r: -4 } },
  { n: "أحد", c: "#e5484d", av: { k: 3, c: 1, e: 4, m: 0, h: 0, r: 3 } },
  { n: "العقيق", c: "#b88a00", av: { k: 2, c: 0, e: 3, m: 1, h: 0, r: -2 } },
  { n: "سلع", c: "#1f8f7a", av: { k: 5, c: 7, e: 0, m: 3, h: 0, r: 4 } },
];
const HJ_LET = ["أ", "ب", "ج", "د"];
const HJ_STEAL = 12; // seconds for a steal: one option is already struck out
// the game's emblem: the value tiles, from the catalog card
const HJ_ICON = '<svg class="hj-ico" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="24" fill="#243a6b"/><g transform="translate(16 16) scale(.68)"><rect x="12" y="12" width="36" height="23" rx="4" fill="#fff6dc"/><rect x="52" y="12" width="36" height="23" rx="4" fill="#ffc933"/><rect x="12" y="39" width="36" height="23" rx="4" fill="#ffc933"/><rect x="52" y="39" width="36" height="23" rx="4" fill="#fff6dc"/><rect x="12" y="66" width="36" height="23" rx="4" fill="#fff6dc"/><rect x="52" y="66" width="36" height="23" rx="4" fill="#ffc933"/><text x="30" y="29" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="14" fill="#243a6b">١٠٠</text><text x="70" y="29" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="14" fill="#243a6b">١٠٠</text><text x="30" y="56" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="14" fill="#243a6b">٢٠٠</text><text x="70" y="56" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="14" fill="#243a6b">٢٠٠</text><text x="30" y="83" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="14" fill="#243a6b">٣٠٠</text><text x="70" y="83" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="14" fill="#243a6b">٣٠٠</text></g></svg>';
const HJ_STAR = '<svg class="hj-star" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l2.6 4.4L19 5l-1.4 4.4L22 12l-4.4 2.6L19 19l-4.4-1.4L12 22l-2.6-4.4L5 19l1.4-4.4L2 12l4.4-2.6L5 5l4.4 1.4z"/><circle cx="12" cy="12" r="3"/></svg>';
const hjTeam = (t) => HJ_TEAMS[t] || HJ_TEAMS[0];
const hjName = (t) => `فريق ${hjTeam(t).n}`;
const hjEmb = (t, s = 34) => `<span class="hj-emb" style="--hx:${hjTeam(t).c}">${avatar(hjTeam(t).av, s)}</span>`;
const hjChip = (t, extra = "") => `<span class="hj-chip ${extra}" style="--hx:${hjTeam(t).c}">${hjEmb(t, 24)}${hjTeam(t).n}</span>`;
const hjTeamOf = (S, id) => (S.jteams || {})[id] ?? -1;
const hjMembers = (t) => H.players.map((p) => p.id).filter((id) => H.jt[id] === t);
const hjVal = (S, i) => S.board[i].v * (S.board[i].dbl ? 2 : 1);
const hjMedian = (vs) => { const v = vs.slice().sort((a, b) => a - b); return v.length ? v[Math.floor((v.length - 1) / 2)] : 0; };
// a majority of votes {id: {k, at}}; a tie goes to the option that got its first vote earliest
function hjMajority(votes) {
  const cnt = {}, first = {};
  Object.values(votes).forEach((v) => { cnt[v.k] = (cnt[v.k] || 0) + 1; first[v.k] = Math.min(first[v.k] ?? Infinity, v.at); });
  let best = -1;
  Object.keys(cnt).forEach((k) => { k = +k; if (best < 0 || cnt[k] > cnt[best] || (cnt[k] === cnt[best] && first[k] < first[best])) best = k; });
  return best;
}

ROOM_GAMES.hijra = {
  name: "لوحة الهجرة", theme: "hijra", min: 2, need: "يحتاج لاعب في فريقين على الأقل", who: "٢ إلى ٤ فرق · فئات ونقاط",
  rules: [
    "على اللوحة ٦ فئات عن الهجرة والمدينة المنورة والصحابة، وفي كل فئة ٥ أسئلة من ١٠٠ إلى ٥٠٠. كل ما كبر الرقم صعب السؤال.",
    "الفرق تتناوب: الفريق اللي عليه الدور يختار مربعًا من جوالاته، والأغلبية تقرر.",
    "السؤال يروح للفريق صاحب الدور أول، وجواب الأغلبية هو جوابه. الصح يعطيه قيمة المربع.",
    "إذا غلط ينشطب خياره، وتقدر كل الفرق الثانية تسرق السؤال في ١٢ ثانية. لكل فريق محاولة وحدة، وأسرع فريق يصيب ياخذ النقاط.",
    "في اللوحة بطاقتان مضاعفتان مخفيتان: اللي يفتحها يجاوب وحده بلا سرقة، والقيمة ضعفين، والغلط ما ينقص شي.",
    "الجولة الأخيرة: كل فريق يراهن سرًّا من صفر إلى كل نقاطه، ورهان الفريق هو الوسيط بين اقتراحات أعضائه. بعدها سؤال واحد للكل: الصح يضيف الرهان والغلط يخصمه.",
    "أعلى نقاط يفوز. طول اللوحة ما ينقص شي من النقاط، الخصم بس في رهان الجولة الأخيرة.",
    HJ_REVIEW + ": الأسئلة مسودة وتحتاج مراجعة متخصص في السيرة قبل اعتمادها.",
  ],
  setup(S) {
    Object.assign(S, { nt: 3, len: 12, qtime: 20, dbl: true, fin: true });
    H.jt ||= {};
    H.players.forEach((p) => { if (H.jt[p.id] === undefined) ROOM_GAMES.hijra.joined(p.id); });
  },
  joined(id) {
    const S = H.S, live = S.phase !== "lobby" && S.teams ? S.teams : Array.from({ length: S.nt || 3 }, (_, t) => t);
    const n = (t) => Object.values(H.jt).filter((x) => x === t).length;
    let best = live[0];
    for (const t of live) if (n(t) < n(best)) best = t;
    H.jt[id] = best;
  },
  left(id) { delete H.jt[id]; },
  snap(S) {
    S.jteams = {}; H.players.forEach((p) => (S.jteams[p.id] = Math.min(H.jt[p.id] ?? 0, (S.nt || 3) - 1)));
    S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
  },
  key: (S) => `${S.sid || ""}:${S.phase}:${S.ti ?? ""}:${S.fstep || 0}`,
  on(m, local) {
    const S = H.S, Z = H.hj;
    if (!Z || !m.id) return;
    if (m.t === "hjjump" && local && ["pick", "res"].includes(S.phase)) { H.jump = true; return hostSend(); }
    const t = H.jt[m.id];
    if (t === undefined || !S.teams.includes(t)) return;
    const k = m.k;
    if (m.t === "hjtile" && S.phase === "pick" && t === S.turn && Number.isInteger(k) && S.board[k] && !S.board[k].used) {
      Z.votes[m.id] = { k, at: now() }; hjTally();
      if (hjMembers(t).every((id) => Z.votes[id])) H.deadline = Math.min(H.deadline, now() + 700);
      return hostSendSoon();
    }
    if (m.t !== "hjvote" && m.t !== "hjwprop" && m.t !== "hjwlock") return;
    if (m.t === "hjvote" && Number.isInteger(k) && k >= 0 && k < 4) {
      if (S.phase === "q" && t === S.asking) {
        Z.votes[m.id] = { k, at: now() }; hjTally();
        if (hjMembers(t).every((id) => Z.votes[id])) H.deadline = Math.min(H.deadline, now() + 600);
        return hostSendSoon();
      }
      if (S.phase === "steal" && t !== S.from && S.slock[t] === undefined && k !== S.removed) {
        Z.votes[m.id] = { k, at: now(), t }; hjTally();
        if (hjMembers(t).every((id) => Z.votes[id])) hjStealLock(t);
        return hjStealCheck();
      }
      if (S.phase === "fq" && S.flock[t] === undefined) {
        Z.votes[m.id] = { k, at: now(), t }; hjTally();
        if (hjMembers(t).every((id) => Z.votes[id])) hjFinalLock(t);
        if (S.teams.every((x) => S.flock[x] !== undefined)) H.deadline = Math.min(H.deadline, now() + 600);
        return hostSendSoon();
      }
      return;
    }
    if (S.phase !== "wager" || S.wlock[t] !== undefined) return;
    if (m.t === "hjwprop" && Number.isFinite(m.v)) {
      const max = Math.max(0, S.pts[t]);
      S.wprops[t] = { ...(S.wprops[t] || {}), [m.id]: Math.max(0, Math.min(max, Math.round(m.v / 100) * 100)) };
      return hostSendSoon();
    }
    if (m.t === "hjwlock") {
      S.wlock[t] = hjMedian(Object.values(S.wprops[t] || {}));
      if (S.teams.every((x) => S.wlock[x] !== undefined)) { hClear(); hLater(hjFinalQ, 900); }
      return hostSend();
    }
  },
  lobbyPlayers(S) {
    const col = (t) => `<div class="kl-team" style="color:${hjTeam(t).c}"><b class="hj-lteam">${hjEmb(t, 26)}${hjName(t)}</b>${S.players.filter((p) => hjTeamOf(S, p.id) === t).map((p) => `<button type="button" class="kl-p" data-jsw="${esc(p.id)}" ${isHost() ? "" : "disabled"}>${face(p, 30)}<span>${esc(p.name)}${p.id === PID ? " (أنت)" : ""}</span></button>`).join("") || '<span class="muted">…</span>'}</div>`;
    return `<p class="muted" style="font-weight:700;color:var(--soft)">الفرق (${AR(S.players.length)} لاعب)${isHost() ? " · اضغط على لاعب ينقله للفريق اللي بعده" : ""}</p><div class="kl-teams">${Array.from({ length: S.nt }, (_, t) => col(t)).join("")}</div>`;
  },
  lobby(S) {
    const chips = (attr, list, cur, lab) => `<div class="chips pick">${list.map((v) => `<button type="button" class="chip" data-${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${lab(v)}</button>`).join("")}</div>`;
    const h = (t) => `<p class="muted" style="font-weight:700;color:var(--soft)">${t}</p>`;
    return `${h("كم فريق؟")}${chips("jnt", [2, 3, 4], S.nt, (v) => `${AR(v)} فرق`)}
      ${h("طول اللعبة")}${chips("jlen", [12, 30], S.len, (v) => (v === 12 ? "قصيرة: ١٢ مربع" : "كاملة: ٣٠ مربع"))}
      <p class="muted">القصيرة نحو ١٥ دقيقة، والكاملة نحو ٤٠ دقيقة.</p>
      ${h("وقت الإجابة")}${chips("jqt", [15, 20, 30], S.qtime, (v) => `${AR(v)} ثانية`)}
      ${h("بطاقتان مضاعفتان")}${chips("jdbl", ["1", "0"], S.dbl ? "1" : "0", (v) => (v === "1" ? "مفعّلة" : "مطفأة"))}
      ${h("الجولة الأخيرة بالرهان")}${chips("jfin", ["1", "0"], S.fin ? "1" : "0", (v) => (v === "1" ? "مفعّلة" : "مطفأة"))}
      <p class="muted hj-review">${HJ_REVIEW}.</p>`;
  },
  bindLobby(S) {
    const set = (attr, key, bool) => screen.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { H.S[key] = bool ? b.dataset[attr] === "1" : +b.dataset[attr]; beep(700, 0.04); if (key === "nt") H.players.forEach((p, k) => (H.jt[p.id] = k % H.S.nt)); hostSend(); }));
    set("jnt", "nt"); set("jlen", "len"); set("jqt", "qtime"); set("jdbl", "dbl", true); set("jfin", "fin", true);
    screen.querySelectorAll("[data-jsw]").forEach((b) => (b.onclick = () => { const id = b.dataset.jsw; H.jt[id] = ((H.jt[id] ?? 0) + 1) % H.S.nt; beep(640, 0.04); hostSend(); }));
    const used = new Set(Object.values(S.jteams || {}));
    if (used.size < 2) $("start").disabled = true;
  },
  start: () => hjStart(),
  resume(S) {
    const tick = (fn) => hEvery(() => { if (now() >= H.deadline) fn(); }, 200);
    if (S.phase === "pick") tick(hjAfterPick);
    else if (S.phase === "open") hLater(hjAsk, 1500);
    else if (S.phase === "q") tick(hjAfterQ);
    else if (S.phase === "steal") tick(hjStealEnd);
    else if (S.phase === "res") hLater(hjNext, 3000);
    else if (S.phase === "wager") tick(hjWagerEnd);
    else if (S.phase === "fq") tick(hjFinalEnd);
    else if (S.phase === "fres") hLater(hjFresStep, 2000);
  },
  views: { pick: hjvPick, open: hjvOpen, q: hjvQ, steal: hjvSteal, res: hjvRes, wager: hjvWager, fq: hjvFq, fres: hjvFres, end: hjvEnd },
};

// ---------------- the host ----------------
function hjStart() {
  hClear();
  const S = H.S;
  const teams = [...new Set(H.players.map((p) => H.jt[p.id] ?? 0))].filter((t) => t < S.nt).sort();
  const dbl = [];
  if (S.dbl) shuffled([0, 1, 2, 3, 4, 5]).slice(0, 2).forEach((c) => dbl.push(c * 5 + 2 + Math.floor(Math.random() * 3)));
  H.hj = { dbl, votes: {} };
  H.jump = false;
  const board = [];
  HJ_CATS.forEach((c, ci) => c.qs.forEach((q, r) => board.push({ c: ci, v: (r + 1) * 100, used: false, by: -1, dbl: false })));
  Object.assign(S, { sid: Math.random().toString(36).slice(2, 8), phase: "pick", teams, board, pts: Array(S.nt).fill(0), turn: pickOne(teams), picked: 0, limit: Math.min(30, S.len),
    ti: null, q: null, tally: null, voted: [], vmap: {}, asking: -1, from: -1, removed: -1, slock: {}, flock: {}, wprops: {}, wlock: {}, res: null, answer: -1, fstep: 0 });
  hjPick();
}
function hjTally() {
  const S = H.S, Z = H.hj;
  S.vmap = {}; Object.entries(Z.votes).forEach(([id, v]) => (S.vmap[id] = v.k));
  S.voted = Object.keys(Z.votes);
  if (S.phase === "q") { S.tally = [0, 0, 0, 0]; Object.values(Z.votes).forEach((v) => S.tally[v.k]++); }
}
function hjPick() {
  hClear();
  const S = H.S;
  H.hj.votes = {};
  Object.assign(S, { phase: "pick", ti: null, q: null, voted: [], vmap: {}, res: null, answer: -1, asking: -1, removed: -1 });
  S.qT = 15000; H.deadline = now() + S.qT;
  hostSend();
  hEvery(() => { if (now() >= H.deadline) hjAfterPick(); }, 200);
}
// nobody chose: the lowest square still on the board
function hjFallbackTile(S) { const L = S.board.map((t, i) => (t.used ? -1 : i)).filter((i) => i >= 0); const lo = Math.min(...L.map((i) => S.board[i].v)); return pickOne(L.filter((i) => S.board[i].v === lo)); }
function hjAfterPick() {
  hClear();
  const S = H.S;
  if (S.phase !== "pick") return;
  let i = hjMajority(H.hj.votes);
  if (i < 0 || S.board[i].used) i = hjFallbackTile(S);
  const tile = S.board[i], cat = HJ_CATS[tile.c], q = cat.qs[tile.v / 100 - 1];
  tile.used = true; tile.dbl = H.hj.dbl.includes(i);
  S.picked++;
  Object.assign(S, { phase: "open", ti: i, q: { q: q.q, o: q.o, cat: cat.n }, voted: [], vmap: {} });
  H.deadline = 0;
  hostSend();
  hLater(hjAsk, tile.dbl ? 3200 : 1700);
}
function hjAsk() {
  hClear();
  const S = H.S;
  H.hj.votes = {};
  Object.assign(S, { phase: "q", asking: S.turn, tally: [0, 0, 0, 0], voted: [], vmap: {}, removed: -1 });
  S.qT = S.qtime * 1000; H.deadline = now() + S.qT;
  hostSend();
  hEvery(() => { if (now() >= H.deadline) hjAfterQ(); }, 200);
}
const hjRight = (S) => HJ_CATS[S.board[S.ti].c].qs[S.board[S.ti].v / 100 - 1].a;
function hjAfterQ() {
  hClear();
  const S = H.S;
  if (S.phase !== "q") return;
  const k = hjMajority(H.hj.votes), a = hjRight(S), t = S.asking, val = hjVal(S, S.ti);
  if (k === a) { S.pts[t] += val; S.board[S.ti].by = t; return hjRes({ kind: "ok", t, k, val }); }
  const others = S.teams.filter((x) => x !== t);
  if (S.board[S.ti].dbl || !others.length) return hjRes({ kind: "none", t, k, val, dbl: S.board[S.ti].dbl });
  // the steal: every other team at once, their wrong option struck out
  H.hj.votes = {};
  Object.assign(S, { phase: "steal", from: t, removed: k, wrong: k, slock: {}, sorder: [], winner: -1, voted: [], vmap: {} });
  S.qT = HJ_STEAL * 1000; H.deadline = now() + S.qT;
  hostSend();
  hEvery(() => { if (now() >= H.deadline) hjStealEnd(); }, 200);
}
// a team's steal is sent the moment all its players have voted (or when the time runs out)
function hjStealLock(t) {
  const S = H.S, mine = {};
  Object.entries(H.hj.votes).forEach(([id, v]) => { if (v.t === t) mine[id] = v; });
  const k = hjMajority(mine);
  if (k < 0 || S.slock[t] !== undefined) return;
  S.slock[t] = k; S.sorder.push(t);
  if (k === hjRight(S) && S.winner < 0) S.winner = t;
}
function hjStealCheck() {
  const S = H.S, rest = S.teams.filter((x) => x !== S.from);
  if (S.winner >= 0 || rest.every((x) => S.slock[x] !== undefined)) { hClear(); hostSend(); return hLater(hjStealEnd, 500); }
  hostSendSoon();
}
function hjStealEnd() {
  hClear();
  const S = H.S;
  if (S.phase !== "steal") return;
  S.teams.filter((x) => x !== S.from && S.slock[x] === undefined).forEach(hjStealLock);
  const val = hjVal(S, S.ti);
  if (S.winner >= 0) { S.pts[S.winner] += val; S.board[S.ti].by = S.winner; }
  hjRes({ kind: S.winner >= 0 ? "steal" : "none", t: S.winner >= 0 ? S.winner : S.from, from: S.from, k: S.wrong, val });
}
function hjRes(r) {
  hClear();
  const S = H.S;
  S.phase = "res"; S.res = r; S.answer = hjRight(S); H.deadline = 0;
  hostSend();
  hLater(hjNext, r.kind === "ok" ? 3600 : 4400);
}
function hjNext() {
  hClear();
  const S = H.S;
  if (S.phase !== "res") return;
  if (H.jump || S.picked >= S.limit || S.board.every((t) => t.used)) return S.fin ? hjWager() : hjEnd();
  const i = S.teams.indexOf(S.turn);
  S.turn = S.teams[(i + 1) % S.teams.length];
  hjPick();
}
function hjWager() {
  hClear();
  const S = H.S;
  Object.assign(S, { phase: "wager", ti: null, q: null, res: null, answer: -1, wprops: {}, wlock: {}, voted: [], vmap: {} });
  // everyone starts on half the team's points, so a team that never touches the slider still wagers something sensible
  S.teams.forEach((t) => { S.wprops[t] = {}; hjMembers(t).forEach((id) => (S.wprops[t][id] = Math.round(Math.max(0, S.pts[t]) / 2 / 100) * 100)); });
  S.qT = 30000; H.deadline = now() + S.qT;
  hostSend();
  hEvery(() => { if (now() >= H.deadline) hjWagerEnd(); }, 250);
}
function hjWagerEnd() {
  hClear();
  const S = H.S;
  if (S.phase !== "wager") return;
  S.teams.forEach((t) => { if (S.wlock[t] === undefined) S.wlock[t] = hjMedian(Object.values(S.wprops[t] || {})); });
  hjFinalQ();
}
function hjFinalQ() {
  hClear();
  const S = H.S;
  if (S.phase !== "wager") return;
  H.hj.votes = {};
  Object.assign(S, { phase: "fq", q: { q: HJ_FINAL.q, o: HJ_FINAL.o, cat: HJ_FINAL.c }, flock: {}, voted: [], vmap: {} });
  S.qT = (S.qtime + 10) * 1000; H.deadline = now() + S.qT;
  hostSend();
  hEvery(() => { if (now() >= H.deadline) hjFinalEnd(); }, 200);
}
function hjFinalLock(t) {
  const S = H.S, mine = {};
  Object.entries(H.hj.votes).forEach(([id, v]) => { if (v.t === t) mine[id] = v; });
  S.flock[t] = hjMajority(mine);
}
function hjFinalEnd() {
  hClear();
  const S = H.S;
  if (S.phase !== "fq") return;
  S.teams.forEach((t) => { if (S.flock[t] === undefined) hjFinalLock(t); });
  // reveal from the lowest score up, so the lead is the last thing anyone learns
  S.forder = S.teams.slice().sort((a, b) => S.pts[a] - S.pts[b]);
  S.before = S.pts.slice();
  Object.assign(S, { phase: "fres", answer: HJ_FINAL.a, fstep: 0 });
  H.deadline = 0;
  hostSend();
  hLater(hjFresStep, 2400);
}
function hjFresStep() {
  hClear();
  const S = H.S;
  if (S.phase !== "fres") return;
  if (S.fstep >= S.forder.length) return hjEnd();
  const t = S.forder[S.fstep], w = S.wlock[t] || 0;
  S.pts[t] += S.flock[t] === HJ_FINAL.a ? w : -w;
  S.fstep++;
  hostSend();
  hLater(hjFresStep, S.fstep >= S.forder.length ? 3000 : 2300);
}
function hjEnd() {
  hClear();
  const S = H.S;
  S.rank = S.teams.slice().sort((a, b) => S.pts[b] - S.pts[a]);
  S.won = S.rank[0];
  S.tie = S.rank.length > 1 && S.pts[S.rank[0]] === S.pts[S.rank[1]];
  S.phase = "end"; H.deadline = 0;
  hostSend();
}

// ---------------- every phone ----------------
const hjMe = (S) => hjTeamOf(S, PID);
function hjTick() {
  klEvery(() => {
    const s = KL.S; if (!s || s.game !== "hijra") return;
    const bar = $("hjBar"); if (bar) bar.style.transform = `scaleX(${leftOf(s.left) / (s.qT || 1)})`;
    const n = $("hjLeft"); if (n) n.textContent = AR(Math.ceil(leftOf(s.left) / 1000));
  }, 200);
}
const hjTimer = (S) => `<div class="hj-timer"><i id="hjBar" style="transform:scaleX(${leftOf(S.left) / (S.qT || 1)})"></i></div>`;
function hjTop(S, line) {
  const t = hjMe(S);
  if (t < 0 || !S.teams.includes(t)) return `<div class="hj-top"><div class="hj-r1">${HJ_ICON}<div class="hj-nm"><b>لوحة الهجرة</b><small>تتفرج على اللعبة</small></div></div>${line ? `<div class="hj-line">${line}</div>` : ""}</div>`;
  const mates = S.players.filter((p) => hjTeamOf(S, p.id) === t);
  return `<div class="hj-top" style="--hx:${hjTeam(t).c}"><div class="hj-r1">${hjEmb(t, 44)}<div class="hj-nm"><b>${hjName(t)}</b><small>${mates.map((p) => esc(p.name)).join("، ")}</small></div><div class="hj-pts"><small>نقاطكم</small><b>${AR(S.pts[t])}</b></div></div>${line ? `<div class="hj-line">${line}</div>` : ""}</div>`;
}
const hjScores = (S) => `<div class="hj-scores">${S.teams.slice().sort((a, b) => S.pts[b] - S.pts[a]).map((t) => `<div class="${t === hjMe(S) ? "me" : ""}">${hjEmb(t, 30)}<span>${hjName(t)}</span>${S.turn === t && ["pick", "open", "q"].includes(S.phase) ? '<em>دوره</em>' : ""}<b>${AR(S.pts[t])}</b></div>`).join("")}</div>`;
const hjQHead = (S) => { const tl = S.board[S.ti]; return `<div class="hj-qmeta"><span class="hj-cat">${esc(S.q.cat)}</span><span class="hj-val ${tl.dbl ? "x2" : ""}">${AR(hjVal(S, S.ti))}${tl.dbl ? " ×٢" : ""}</span></div>`; };
// the four options; votes = my team's votes (faces), cls(k) = extra state
function hjOpts(S, o) {
  const mates = o.faces ? S.players.filter((p) => hjTeamOf(S, p.id) === hjMe(S)) : [];
  return `<div class="hj-opts">${S.q.o.map((x, k) => { const vs = mates.filter((p) => S.vmap[p.id] === k); return `<button type="button" class="hj-opt ${o.cls ? o.cls(k) : ""}" data-o="${k}" aria-pressed="${o.can && KL.my.hv === k}" ${o.can && k !== S.removed ? "" : "disabled"}><span class="l">${HJ_LET[k]}</span><span class="tx">${esc(x)}</span>${vs.length ? `<span class="hj-vs">${vs.map((p) => face(p, 22)).join("")}</span>` : ""}</button>`; }).join("")}</div>`;
}
function hjBindOpts(type) {
  screen.querySelectorAll(".hj-opt:not([disabled])").forEach((b) => (b.onclick = () => {
    KL.my.hv = +b.dataset.o; beep(660, 0.05);
    screen.querySelectorAll(".hj-opt").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    act({ t: type, id: PID, k: KL.my.hv });
  }));
}
function hjFresh(S, fresh, loud) { if (fresh) { clearKL(); KL.my.hv = undefined; hjTick(); if (loud) { beep(880, 0.1); buzz([60, 40, 60]); } else beep(560, 0.05); } }

function hjvPick(S, fresh) {
  const t = hjMe(S), mine = t === S.turn;
  hjFresh(S, fresh, mine);
  setTop(`المربع ${AR(S.picked + 1)} من ${AR(S.limit)}`);
  if (!mine) return show(`${hjTop(S, `دور ${hjName(S.turn)}`)}<div class="hj-body"><div class="hj-card hj-wait">${hjEmb(S.turn, 60)}<b>${hjName(S.turn)} يختار مربعًا</b><span>إذا غلطوا في الجواب تنفتح السرقة لكم. خلّوكم جاهزين.</span></div>${hjScores(S)}</div>`);
  const mates = S.players.filter((p) => hjTeamOf(S, p.id) === t);
  let grid = HJ_CATS.map((c) => `<div class="hj-ch">${c.n}</div>`).join("");
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
    const i = c * 5 + r, tl = S.board[i], vs = mates.filter((p) => S.vmap[p.id] === i);
    grid += `<button type="button" class="hj-tile" data-ti="${i}" aria-pressed="${KL.my.ti === i}" aria-label="${HJ_CATS[c].n} ${tl.v}" ${tl.used ? "disabled" : ""}>${tl.used ? "" : AR(tl.v)}${vs.length ? `<span class="hj-vs">${vs.map((p) => face(p, 16)).join("")}</span>` : ""}</button>`;
  }
  show(`${hjTop(S, "دوركم: اختاروا مربعًا")}<div class="hj-body">${hjTimer(S)}<div class="hj-grid">${grid}</div><p class="muted">كل واحد يختار من جواله، والأغلبية تقرر. إذا تعادلتوا يُعتمد أول اختيار.</p></div>`);
  screen.querySelectorAll(".hj-tile:not([disabled])").forEach((b) => (b.onclick = () => { KL.my.ti = +b.dataset.ti; beep(700, 0.04); screen.querySelectorAll(".hj-tile").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); act({ t: "hjtile", id: PID, k: KL.my.ti }); }));
}
function hjvOpen(S, fresh) {
  hjFresh(S, fresh, false);
  const tl = S.board[S.ti], t = hjMe(S);
  setTop("انفتح المربع");
  if (fresh && tl.dbl) { beep(523, 0.1); setTimeout(() => beep(784, 0.2), 140); }
  show(`${hjTop(S, `${hjName(S.turn)} اختار ${esc(S.q.cat)} بـ${AR(tl.v)}`)}<div class="hj-body">${tl.dbl
    ? `<div class="hj-dbl">${HJ_STAR}<b>بطاقة مضاعفة</b><span class="x2">×٢</span><span>${S.turn === t ? `جاوبوا وحدكم على ${AR(tl.v * 2)}، بلا سرقة` : `${hjName(S.turn)} يجاوب وحده، وما فيه سرقة`}</span></div>`
    : `<div class="hj-card hj-wait">${hjQHead(S)}<b>${esc(S.q.cat)} بـ${AR(tl.v)}</b><span>السؤال يظهر الحين</span></div>`}</div>`);
}
function hjvQ(S, fresh) {
  const t = hjMe(S), mine = t === S.asking, tl = S.board[S.ti];
  hjFresh(S, fresh, mine);
  setTop(tl.dbl ? "بطاقة مضاعفة" : "السؤال");
  show(`${hjTop(S, mine ? "جاوبوا الحين" : `يجاوب ${hjName(S.asking)}`)}<div class="hj-body">${hjQHead(S)}<div class="hj-qt">${esc(S.q.q)}</div>${hjTimer(S)}
    ${hjOpts(S, { can: mine, faces: mine })}
    <p class="muted">${mine ? "جواب الأغلبية هو جواب فريقكم. تقدر تغيّر صوتك لين يصوّت الكل." : tl.dbl ? "بطاقة مضاعفة: ما فيها سرقة." : "إذا غلطوا تنفتح السرقة على جوالكم. فكّروا من الحين."}</p></div>`);
  if (mine) hjBindOpts("hjvote");
}
function hjvSteal(S, fresh) {
  const t = hjMe(S), can = t >= 0 && t !== S.from && S.slock[t] === undefined;
  hjFresh(S, fresh, can);
  setTop("سرقة!");
  const struck = (k) => (k === S.removed ? "no" : "");
  const line = t === S.from ? "الفرق الثانية تحاول تسرق" : S.slock[t] !== undefined ? `أرسلتم جوابكم: ${HJ_LET[S.slock[t]]}` : `سرقة! ${AR(hjVal(S, S.ti))} لأسرع فريق يصيب`;
  show(`${hjTop(S, line)}<div class="hj-body">${hjQHead(S)}<div class="hj-qt">${esc(S.q.q)}</div>${hjTimer(S)}
    ${hjOpts(S, { can, faces: t !== S.from, cls: struck })}
    <p class="muted">${t === S.from ? "خيار فريقكم انشطب. الحين الفرق الثانية تحاول." : can ? "محاولة وحدة لفريقكم: يُرسل جوابكم لما يصوّت الكل، أو عند نهاية الوقت." : "ننتظر باقي الفرق."}</p>
    <div class="hj-tries">${S.sorder.map((x) => hjChip(x, "sent")).join("")}</div></div>`);
  if (can) hjBindOpts("hjvote");
}
function hjvRes(S, fresh) {
  const r = S.res, t = hjMe(S), good = (r.kind === "ok" || r.kind === "steal") && r.t === t;
  if (fresh) { clearKL(); if (good) { beep(784, 0.1); setTimeout(() => beep(1047, 0.18), 120); buzz(60); } else if (r.kind === "none") beep(220, 0.3, "triangle", 0.1); else beep(600, 0.06); }
  setTop("النتيجة");
  const big = r.kind === "ok" ? `${r.t === t ? "أحسنتم" : hjName(r.t)} +${AR(r.val)}` : r.kind === "steal" ? `${r.t === t ? "سرقتوه!" : `${hjName(r.t)} سرقه`} +${AR(r.val)}` : r.dbl ? "ما أصابوا البطاقة المضاعفة" : "ما أحد أصاب";
  const cls = (k) => (k === S.answer ? "ok" : k === r.k ? "no" : "");
  show(`${hjTop(S, "النتيجة")}<div class="hj-body"><div class="hj-res ${r.kind === "none" ? "none" : ""}"><span class="hj-stamp ${r.kind === "none" ? "no" : "ok"}">${r.kind === "none" ? "ولا فريق" : "صح"}</span><b>${big}</b><span>الجواب الصحيح: ${esc(S.q.o[S.answer])}</span></div>
    ${hjOpts(S, { can: false, cls })}${hjScores(S)}
    ${isHost() && S.fin && !H.jump && S.picked < S.limit ? '<button type="button" class="btn btn-ghost" id="hjJump">اقفز للجولة الأخيرة بعد هذا المربع</button>' : ""}</div>`);
  if ($("hjJump")) $("hjJump").onclick = () => { act({ t: "hjjump", id: PID }); $("hjJump").disabled = true; $("hjJump").textContent = "تمام، بعد هذا المربع"; };
}
function hjvWager(S, fresh) {
  const t = hjMe(S), inT = t >= 0 && S.teams.includes(t), locked = inT && S.wlock[t] !== undefined;
  const props = inT ? S.wprops[t] || {} : {}, mine = props[PID] ?? 0, max = inT ? Math.max(0, S.pts[t]) : 0;
  const propsHTML = () => { const p = KL.S.wprops[t] || {}; return `${KL.S.players.filter((x) => hjTeamOf(KL.S, x.id) === t).map((x) => `<div>${face(x, 22)}<span>${esc(x.name)}</span><b>${p[x.id] !== undefined ? AR(p[x.id]) : "…"}</b></div>`).join("")}<div class="med"><span>رهان الفريق (الوسيط)</span><b>${AR(hjMedian(Object.values(p)))}</b></div>`; };
  if (!fresh && $("hjW") && !locked) { $("hjProps").innerHTML = propsHTML(); return; }
  hjFresh(S, fresh, true);
  setTop("الجولة الأخيرة");
  if (!inT) return show(`${hjTop(S, "الفرق تراهن")}<div class="hj-body">${hjScores(S)}</div>`);
  if (locked) return show(`${hjTop(S, "رهانكم جاهز")}<div class="hj-body"><div class="hj-res"><span>رهان فريقكم</span><b>${AR(S.wlock[t])}</b><span>ننتظر باقي الفرق، بعدها يظهر السؤال</span></div>${hjScores(S)}</div>`);
  show(`${hjTop(S, "الرهان سرّي")}<div class="hj-body"><div class="hj-dbl small">${HJ_ICON}<b>الجولة الأخيرة</b><span>الفئة: ${HJ_FINAL.c}</span></div>
    <p>كل واحد يقترح، ورهان فريقكم هو <b>الوسيط</b> بين اقتراحاتكم. الصح يضيف الرهان، والغلط يخصمه.</p>
    <div class="hj-card hj-wager">${max ? `<label class="muted" for="hjW">اقتراحك</label><div class="amt" id="hjAmt">${AR(mine)}</div><input type="range" id="hjW" min="0" max="${max}" step="100" value="${mine}">` : `<p>ما عندكم نقاط تراهنون فيها، رهانكم صفر وتقدرون تجاوبون عادي.</p><input type="hidden" id="hjW" value="0">`}<div class="hj-props" id="hjProps">${propsHTML()}</div></div>
    ${hjTimer(S)}<button type="button" class="btn btn-marker" id="hjLock">اعتمدوا رهان الفريق</button></div>`);
  const sl = $("hjW");
  if (sl.type === "range") { sl.oninput = () => { $("hjAmt").textContent = AR(+sl.value); }; sl.onchange = () => act({ t: "hjwprop", id: PID, v: +sl.value }); }
  $("hjLock").onclick = () => { beep(880, 0.08); act({ t: "hjwprop", id: PID, v: +sl.value }); act({ t: "hjwlock", id: PID }); $("hjLock").disabled = true; };
}
function hjvFq(S, fresh) {
  const t = hjMe(S), inT = t >= 0 && S.teams.includes(t), can = inT && S.flock[t] === undefined;
  hjFresh(S, fresh, can);
  setTop("السؤال الأخير");
  show(`${hjTop(S, can ? "السؤال الأخير للجميع" : inT ? `أرسلتم جوابكم: ${S.flock[t] >= 0 ? HJ_LET[S.flock[t]] : "بدون"}` : "السؤال الأخير")}<div class="hj-body">
    <div class="hj-qmeta"><span class="hj-cat">${HJ_FINAL.c}</span>${inT ? `<span class="hj-val">رهانكم ${AR(S.wlock[t] || 0)}</span>` : ""}</div><div class="hj-qt">${esc(S.q.q)}</div>${hjTimer(S)}
    ${hjOpts(S, { can, faces: inT })}<p class="muted">${can ? "جواب الأغلبية يُرسل لما يصوّت الكل في فريقكم." : "ننتظر باقي الفرق."}</p></div>`);
  if (can) hjBindOpts("hjvote");
}
function hjvFres(S, fresh) {
  const t = hjMe(S), shown = S.forder.slice(0, S.fstep), on = shown.includes(t), ok = S.flock[t] === S.answer, w = S.wlock[t] || 0;
  if (fresh) { clearKL(); if (on && S.forder[S.fstep - 1] === t) ok ? (beep(784, 0.1), setTimeout(() => beep(1047, 0.2), 120)) : beep(220, 0.3, "triangle", 0.1); }
  setTop("نتيجة الجولة الأخيرة");
  show(`${hjTop(S, "التلفاز يكشف الفرق وحدة وحدة")}<div class="hj-body"><div class="hj-res"><span>الجواب الصحيح</span><b>${esc(S.q.o[S.answer])}</b>${on ? `<span class="${ok ? "plus" : "minus"}">${ok ? `صح، +${AR(w)}` : `غلط، ${AR(-w)}`}</span>` : ""}</div>${hjScores(S)}</div>`);
}
function hjvEnd(S, fresh) {
  const t = hjMe(S), rank = S.rank.indexOf(t) + 1;
  if (fresh) { clearKL(); if (S.won === t) { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); } else beep(262, 0.4, "triangle", 0.12); }
  setTop("انتهت");
  show(`${hjTop(S, rank ? `مركزكم: ${AR(rank)} من ${AR(S.rank.length)}` : "انتهت اللعبة")}<div class="hj-body">
    <div class="hj-res"><span>${S.tie ? "تعادل في الصدارة" : "الفائز"}</span><b>${S.tie ? S.rank.filter((x) => S.pts[x] === S.pts[S.won]).map(hjName).join(" و") : hjName(S.won)}</b></div>
    <div class="hj-ranks">${S.rank.map((x, k) => `<div class="${x === t ? "me" : ""}"><span class="n">${AR(k + 1)}</span>${hjEmb(x, 30)}<span>${hjName(x)}</span><b>${AR(S.pts[x])}</b></div>`).join("")}</div>
    <p class="muted hj-review">${HJ_REVIEW}.</p>
    ${isHost() ? '<button type="button" class="btn btn-marker" id="hjAgain">لوحة جديدة بنفس الفرق</button>' : '<p class="muted" style="text-align:center">المضيف يقدر يبدأ لوحة جديدة.</p>'}
    <button type="button" class="btn btn-ghost" id="hjHome">رجوع لفسحة</button></div>`);
  if ($("hjAgain")) $("hjAgain").onclick = () => hostAgain();
  $("hjHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}

// ---------------- the big screen: the board, the teams, and the card of the moment ----------------
ROOM_GAMES.hijra.tvTeams = (S) => Array.from({ length: S.nt || 3 }, (_, t) => ({ n: hjName(t), c: hjTeam(t).c, ps: S.players.filter((p) => hjTeamOf(S, p.id) === t) }));
function hjTvBoard(S) {
  let h = HJ_CATS.map((c) => `<div class="hj-tbh">${c.n}</div>`).join("");
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
    const i = c * 5 + r, tl = S.board[i];
    h += `<div class="hj-tt ${tl.used ? "used" : ""} ${i === S.ti && S.phase === "open" ? "sel" : ""}" style="--hx:${tl.by >= 0 ? hjTeam(tl.by).c : "transparent"}">${tl.used ? (tl.by >= 0 ? `<span>${hjTeam(tl.by).n}</span>` : "") : AR(tl.v)}</div>`;
  }
  return `<div class="hj-tboard">${h}</div>`;
}
function hjTvSide(S) {
  const tag = (t) => {
    if (S.phase === "steal") return S.slock[t] !== undefined ? "أرسل" : t === S.from ? "" : "يحاول";
    if (S.phase === "wager") return S.wlock[t] !== undefined ? "راهن" : "يفكر";
    if (S.phase === "fq") return S.flock[t] !== undefined ? "جاوب" : "يفكر";
    if (S.phase === "q" && t === S.asking) return `صوّت ${AR(S.voted.length)}`;
    return ["pick", "open", "q"].includes(S.phase) && t === S.turn ? "دوره" : "";
  };
  const fin = ["wager", "fq", "fres"].includes(S.phase);
  return `<div class="hj-tside"><div class="hj-tttl">${HJ_ICON}<b>لوحة الهجرة</b></div><small class="hj-tmeta">${fin ? "الجولة الأخيرة" : `المربعات: ${AR(S.picked)} من ${AR(S.limit)}`}</small>
    ${S.teams.map((t) => { const tg = tag(t); return `<div class="hj-tteam ${tg === "دوره" ? "hot" : ""}" style="--hx:${hjTeam(t).c}">${hjEmb(t, 58)}<div><b>${hjName(t)}</b>${tg ? `<em>${tg}</em>` : ""}<div class="hj-tfaces">${S.players.filter((p) => hjTeamOf(S, p.id) === t).map((p) => face(p, 26)).join("")}</div></div><span class="sc">${AR(S.pts[t])}</span></div>`; }).join("")}
    <small class="hj-tnote">${HJ_REVIEW}</small></div>`;
}
function hjTvCard(S) {
  const P = S.phase;
  if (P === "pick") return `<div class="hj-tnarr">دور ${hjName(S.turn)}: يختارون مربعًا من جوالاتهم ${tvSecs(S.left)}</div>`;
  if (P === "open") { const tl = S.board[S.ti]; return tl.dbl ? `<div class="hj-tcover"><div class="hj-dbl big">${HJ_STAR}<b>بطاقة مضاعفة</b><span class="x2">×٢</span><span>${hjName(S.turn)} يجاوب وحده على ${AR(tl.v * 2)}</span></div></div>` : `<div class="hj-tnarr">${hjName(S.turn)} اختار ${esc(S.q.cat)} بـ${AR(tl.v)}</div>`; }
  if (["q", "steal", "res"].includes(P)) {
    const tl = S.board[S.ti], r = S.res;
    const who = P === "q" ? `${hjEmb(S.asking, 40)}يجاوب ${hjName(S.asking)}` : P === "steal" ? `سرقة: أسرع فريق يصيب ياخذ ${AR(hjVal(S, S.ti))}` : r.kind === "ok" ? `${hjEmb(r.t, 40)}${hjName(r.t)} أصاب` : r.kind === "steal" ? `${hjEmb(r.t, 40)}${hjName(r.t)} سرقه` : "ما أحد أصاب";
    const cls = (k) => (P === "steal" && k === S.removed ? "no" : P === "res" ? (k === S.answer ? "ok" : k === r.k ? "no" : "") : "");
    const stamp = P === "res" ? `<span class="hj-stamp ${r.kind === "none" ? "no" : "ok"}">${r.kind === "none" ? "غلط" : `+${AR(r.val)}`}</span>` : "";
    return `<div class="hj-tq"><div class="hj-tqh"><span class="hj-cat">${esc(S.q.cat)}</span><span class="hj-val ${tl.dbl ? "x2" : ""}">${AR(hjVal(S, S.ti))}${tl.dbl ? " ×٢" : ""}</span><span class="who">${who}</span>${P !== "res" ? tvSecs(S.left) : ""}</div>
      <div class="hj-tqt">${esc(S.q.q)}</div><div class="hj-topts">${S.q.o.map((o, k) => `<div class="${cls(k)}"><span class="l">${HJ_LET[k]}</span>${esc(o)}</div>`).join("")}</div>
      ${P !== "res" ? tvBar(S.left, S.qT || 1) : ""}${P === "steal" ? `<div class="hj-tries">${S.sorder.length ? S.sorder.map((x) => hjChip(x, "sent")).join("") : "<span>بانتظار أول محاولة</span>"}</div>` : ""}${stamp}</div>`;
  }
  if (P === "wager") return `<div class="hj-tq"><div class="hj-tqh"><span class="hj-cat">الجولة الأخيرة</span><span class="hj-val">${HJ_FINAL.c}</span><span class="who">الرهان سرّي في الجوالات</span>${tvSecs(S.left)}</div>
    <div class="hj-tqt">كل فريق يحدد كم يراهن من نقاطه، من صفر إلى كل نقاطه. بعدها سؤال واحد للكل.</div>${tvBar(S.left, S.qT || 1)}</div>`;
  if (P === "fq") return `<div class="hj-tq"><div class="hj-tqh"><span class="hj-cat">الجولة الأخيرة</span><span class="hj-val">${HJ_FINAL.c}</span><span class="who">كل الفرق تجاوب</span>${tvSecs(S.left)}</div>
    <div class="hj-tqt">${esc(S.q.q)}</div><div class="hj-topts">${S.q.o.map((o, k) => `<div><span class="l">${HJ_LET[k]}</span>${esc(o)}</div>`).join("")}</div>${tvBar(S.left, S.qT || 1)}</div>`;
  if (P === "fres") {
    const shown = S.forder.slice(0, S.fstep);
    return `<div class="hj-tq"><div class="hj-tqh"><span class="hj-cat">الجولة الأخيرة</span><span class="who">الجواب: ${esc(S.q.o[S.answer])}</span></div><div class="hj-tqt small">${esc(S.q.q)}</div>
      <div class="hj-tfres">${S.forder.map((t) => { const on = shown.includes(t), ok = S.flock[t] === S.answer, w = S.wlock[t] || 0; return `<div class="${on ? (ok ? "ok" : "no") : "wait"}">${hjEmb(t, 40)}<span>${hjName(t)}: ${on ? (S.flock[t] >= 0 ? esc(S.q.o[S.flock[t]]) : "بدون جواب") : "…"}</span><span>رهان ${on ? AR(w) : "؟"}</span><b>${on ? `${ok ? "+" : ""}${AR(ok ? w : -w)}` : ""}</b><span class="sc">${AR(on ? S.pts[t] : S.before[t])}</span></div>`; }).join("")}</div></div>`;
  }
  return "";
}
const hjTvPlay = (S) => `<div class="hj-tv">${hjTvSide(S)}<div class="hj-tmain">${hjTvBoard(S)}${hjTvCard(S)}</div></div>`;
ROOM_GAMES.hijra.tv = {
  pick: hjTvPlay, open: hjTvPlay, q: hjTvPlay, steal: hjTvPlay, res: hjTvPlay, wager: hjTvPlay, fq: hjTvPlay, fres: hjTvPlay,
  end(S) {
    const top = Math.max(1, S.pts[S.rank[0]]);
    return `<div class="hj-tv end"><div class="hj-tend"><div class="hj-tendk">${HJ_ICON}انتهت لوحة الهجرة</div><div class="hj-tendt">${S.tie ? "تعادل في الصدارة" : `فاز ${hjName(S.won)}`}</div>
      ${S.rank.map((t, i) => `<div class="hj-tendr" style="animation-delay:${0.3 + i * 0.25}s"><span class="n">${AR(i + 1)}</span>${hjEmb(t, 64)}<b>${hjName(t)}</b><i style="--hx:${hjTeam(t).c};width:${Math.max(3, (Math.max(0, S.pts[t]) / top) * 100)}%"></i><span class="sc">${AR(S.pts[t])}</span></div>`).join("")}
      <small class="hj-tnote">${HJ_REVIEW}</small></div></div>`;
  },
};
