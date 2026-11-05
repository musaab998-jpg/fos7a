"use strict";
// ================= من الشخصية؟: a hidden person or place from the Seerah, the Hijra and Madinah =================
// Six hint cards go up on the screen one at a time, from vague to obvious. The teams guess from their phones
// (a team's guess is its majority); the earlier the right guess, the more it's worth, and a wrong one costs
// points and benches the team until the next card. A team may buy the next card for itself, and after the
// 2nd and 4th card a quick question gives the fastest right team the next card for free.
// The host keeps the answer, the unrevealed cards and every team's votes in H.ws; the snapshot only ever has
// the cards already on the screen. Votes and bought cards go to each team's phones on their own (direct).

// ======================================================================================================
// WS_CONTENT: every historical and sharia text in the game, in one place. It is a draft and needs review by
// a specialist in the Seerah before it is relied on; a reviewer's correction goes into its line here only.
// h = the six hints, vague to obvious: [kind of hint, symbol, text]. fact (and trip) show when it's revealed.
// ======================================================================================================
const WS_CONTENT = {
  chars: [
    { id: "abubakr", n: "أبو بكر الصديق", ty: "صحابي", h: [
      ["النوع", "tent", "صحابي من المهاجرين، من قبيلة قريش."],
      ["قبل الإسلام", "scale", "كان تاجرًا معروفًا في مكة، وعالمًا بأنساب العرب."],
      ["الدعوة", "star", "من أوائل من أسلم، وأسلم على يده عدد من كبار الصحابة."],
      ["في مكة", "key", "اشترى عددًا من المستضعفين المعذَّبين وأعتقهم، ومنهم بلال بن رباح."],
      ["الهجرة", "cave", "رافق النبي ﷺ في الهجرة، وكان معه في غار ثور."],
      ["اللقب", "quill", "أول الخلفاء الراشدين، ولقبه «الصدّيق»."]],
      fact: "نزل فيه قوله تعالى: ﴿إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا﴾." },
    { id: "musab", n: "مصعب بن عمير", ty: "صحابي", h: [
      ["النوع", "tent", "صحابي من المهاجرين، من قبيلة قريش."],
      ["قبل الإسلام", "coin", "كان من أكثر شباب مكة ترفًا، وأحسنهم ثيابًا وعطرًا."],
      ["بعد الإسلام", "sun", "ترك ذلك النعيم بعد إسلامه، وصبر على الشدة والفقر."],
      ["قبل الهجرة", "route", "أرسله النبي ﷺ إلى يثرب ليعلّم أهلها القرآن والإسلام."],
      ["في المدينة", "star", "أسلم على يديه سعد بن معاذ وأُسيد بن حُضير."],
      ["اللقب", "banner", "يُلقَّب «أول سفير في الإسلام»، وحمل اللواء يوم أحد واستُشهد فيه."]],
      fact: "كان أهل المدينة يسمّونه «المُقرئ» لأنه يعلّمهم القرآن." },
    { id: "asma", n: "أسماء بنت أبي بكر", ty: "صحابية", h: [
      ["النوع", "tent", "صحابية من المهاجرات، من قبيلة قريش."],
      ["العمر", "clock", "عاشت عمرًا طويلًا، قرابة مئة سنة."],
      ["الأسرة", "link", "زوجها الزبير بن العوام، أحد العشرة المبشّرين بالجنة."],
      ["الأسرة", "house", "أختها أم المؤمنين عائشة رضي الله عنها."],
      ["الهجرة", "drop", "كانت تحمل الطعام والماء إلى غار ثور أيام الهجرة."],
      ["اللقب", "belt", "شقّت نطاقها نصفين لتربط به الزاد، فلُقّبت «ذات النطاقين»."]],
      fact: "ابنها عبد الله بن الزبير أول مولود للمهاجرين في المدينة." },
    { id: "salman", n: "سلمان الفارسي", ty: "صحابي", h: [
      ["النوع", "globe", "صحابي وصل إلى المدينة من بلاد بعيدة جدًا."],
      ["قبل الإسلام", "route", "ترك دين قومه شابًا، وتنقّل بين البلدان يبحث عن الحق."],
      ["الطريق", "palm", "بِيع مملوكًا، وانتهى به الطريق إلى نخل يثرب."],
      ["في المدينة", "key", "كاتَبَ سيّده على غرس نخل، فأعانه النبي ﷺ والصحابة حتى عُتق."],
      ["الغزوات", "trench", "أشار على المسلمين بحفر الخندق حول المدينة."],
      ["النسب", "scroll", "أصله من بلاد فارس، وإليها يُنسب."]],
      fact: "تولّى إمارة المدائن في خلافة عمر بن الخطاب رضي الله عنه." },
    { id: "quba", n: "مسجد قباء", ty: "مكان", h: [
      ["النوع", "pin", "ليس شخصًا: إنه مكان في المدينة."],
      ["الموقع", "palm", "يقع في جنوب المدينة، وكانت حوله البساتين قديمًا."],
      ["الهجرة", "route", "نزل النبي ﷺ في قباء أيامًا عند وصوله مهاجرًا، قبل دخول المدينة."],
      ["سنّة", "clock", "كان النبي ﷺ يزوره كل سبت، راكبًا وماشيًا."],
      ["فضل", "drop", "من تطهّر في بيته ثم صلّى فيه، كان له كأجر عمرة."],
      ["الأول", "arch", "أول مسجد بُني في الإسلام."]],
      fact: "يقع جنوب المسجد النبوي على بعد بضعة كيلومترات.", trip: "في الرحلة: توضّؤوا في مكانكم، ثم صلّوا فيه ركعتين." },
    { id: "abuayyub", n: "أبو أيوب الأنصاري", ty: "صحابي", h: [
      ["النوع", "tent", "صحابي من الأنصار، من أهل المدينة."],
      ["النسب", "link", "من بني النجار، من قبيلة الخزرج."],
      ["الاسم", "scroll", "اسمه خالد بن زيد، وشهد بدرًا والمشاهد كلها."],
      ["آخر حياته", "globe", "خرج غازيًا وهو شيخ كبير، وتوفي قرب أسوار القسطنطينية."],
      ["الهجرة", "pin", "بركت ناقة النبي ﷺ عند وصوله المدينة قريبًا من داره."],
      ["في المدينة", "house", "استضاف النبي ﷺ في بيته حتى بُني المسجد النبوي ومساكنه."]],
      fact: "قبره اليوم في إسطنبول، في الحي الذي يحمل اسمه." },
    { id: "uhud", n: "جبل أحد", ty: "مكان", h: [
      ["النوع", "pin", "ليس شخصًا: إنه معلم طبيعي في المدينة."],
      ["الموقع", "mountain", "يقع شمال المدينة، ويمتد من الشرق إلى الغرب."],
      ["حديث", "heart", "قال عنه النبي ﷺ: «هذا جبلٌ يحبّنا ونحبّه»."],
      ["قربه", "banner", "عند سفحه جبل صغير صار يُعرف بجبل الرماة."],
      ["الشهداء", "star", "عنده استُشهد حمزة بن عبد المطلب، سيد الشهداء."],
      ["الغزوة", "clock", "وقعت عنده الغزوة التي تحمل اسمه، في السنة الثالثة للهجرة."]],
      fact: "من أكبر جبال المدينة، ولون صخره يميل إلى الحُمرة.", trip: "في الرحلة: زوروا مقبرة شهداء أحد، وجبل الرماة المقابل له." },
    { id: "bilal", n: "بلال بن رباح", ty: "صحابي", h: [
      ["النوع", "tent", "صحابي من المهاجرين."],
      ["الأصل", "globe", "أصله من الحبشة."],
      ["في مكة", "sun", "عُذّب في رمضاء مكة، فكان يردّد: «أحدٌ أحد»."],
      ["الحرية", "key", "اشتراه أبو بكر الصديق وأعتقه."],
      ["في المدينة", "wave", "كان صوته نديًّا، فاختاره النبي ﷺ لمهمة تتكرر كل يوم خمس مرات."],
      ["اللقب", "arch", "أول مؤذن في الإسلام، ومؤذن رسول الله ﷺ."]],
      fact: "أذّن فوق الكعبة يوم فتح مكة." },
  ],
  // other names on the guessing board: they are never the answer, they make the guess a real choice
  others: [
    ["omar", "عمر بن الخطاب", "صحابي"], ["othman", "عثمان بن عفان", "صحابي"], ["ali", "علي بن أبي طالب", "صحابي"], ["hamza", "حمزة بن عبد المطلب", "صحابي"],
    ["saad", "سعد بن معاذ", "صحابي"], ["zubair", "الزبير بن العوام", "صحابي"], ["abuobaida", "أبو عبيدة بن الجراح", "صحابي"],
    ["khadija", "خديجة بنت خويلد", "صحابية"], ["aisha", "عائشة بنت أبي بكر", "صحابية"], ["umsalama", "أم سلمة", "صحابية"],
    ["nabawi", "المسجد النبوي", "مكان"], ["thawr", "غار ثور", "مكان"], ["baqi", "البقيع", "مكان"], ["rumat", "جبل الرماة", "مكان"], ["aqiq", "وادي العقيق", "مكان"], ["sala", "جبل سلع", "مكان"],
  ].map(([id, n, ty]) => ({ id, n, ty })),
  // the quick questions between the cards; a = the right option
  quiz: [
    { q: "ما اسم المدينة المنورة قبل الهجرة؟", o: ["يثرب", "الطائف", "تبوك", "خيبر"], a: 0 },
    { q: "في أي غار اختبأ النبي ﷺ وصاحبه أثناء الهجرة؟", o: ["حراء", "ثور", "أحد", "سلع"], a: 1 },
    { q: "إلى أي بلد كانت أول هجرة للمسلمين؟", o: ["الشام", "اليمن", "الحبشة", "مصر"], a: 2 },
    { q: "من هم الأنصار؟", o: ["أهل مكة", "أهل المدينة الذين نصروا النبي ﷺ", "أهل الطائف", "أهل الحبشة"], a: 1 },
    { q: "ما أول شهر في السنة الهجرية؟", o: ["رمضان", "ذو الحجة", "محرّم", "رجب"], a: 2 },
    { q: "في خلافة من بدأ التأريخ بالهجرة؟", o: ["أبو بكر الصديق", "عمر بن الخطاب", "عثمان بن عفان", "علي بن أبي طالب"], a: 1 },
    { q: "بين من آخى النبي ﷺ في المدينة؟", o: ["المهاجرين والأنصار", "قريش وثقيف", "تميم وأسد", "هذيل وهوازن"], a: 0 },
    { q: "كم مسجدًا تُشدّ إليها الرحال؟", o: ["٢", "٣", "٤", "٥"], a: 1 },
    { q: "في أي غزوة حُفر الخندق؟", o: ["بدر", "أحد", "الأحزاب", "تبوك"], a: 2 },
    { q: "ما القبيلتان الكبيرتان في المدينة قبل الهجرة؟", o: ["الأوس والخزرج", "قريش وهذيل", "ثقيف وهوازن", "تميم وأسد"], a: 0 },
  ],
  review: "المحتوى تحت المراجعة الشرعية",
};

// ================= rules =================
const WS_VAL = [100, 80, 60, 40, 25, 10]; // a right guess while card k is the newest card on the screen
const WS_WRONG = 15, WS_BUY = 10, WS_QWIN = 10, WS_QSEC = 15;
const WS_TEAMS = [{ n: "الأخضر", c: "#1f8a53" }, { n: "الأزرق", c: "#2d6fa3" }, { n: "الأحمر", c: "#e5484d" }, { n: "البنفسجي", c: "#6b3fb8" }, { n: "البرتقالي", c: "#d9730d" }, { n: "الوردي", c: "#d6457a" }];
const wsTeamOf = (S, id) => (S.wteams || {})[id] ?? -1;
const wsChar = (id) => WS_CONTENT.chars.find((c) => c.id === id);
// a signed number keeps its sign in front of the digits inside Arabic text
// a score: a plain number, or signed when it has gone below zero
const wsN = (n) => (n < 0 ? wsSG(n) : AR(n));
const wsSG = (n) => `<span dir="ltr" class="ws-sg">${n > 0 ? "+" : n < 0 ? "−" : ""}${AR(Math.abs(n))}</span>`;

// ---------------- the drawings: objects and places only, never a person ----------------
const WS_I = (d) => `<svg class="ws-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const WS_HI = {
  tent: '<path d="M3 20L12 4l9 16z"/><path d="M9 20l3-5 3 5"/>',
  scale: '<path d="M12 4v16M8 20h8M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
  star: '<path d="M12 2l2.4 4.4L19 5l-1.4 4.6L22 12l-4.4 2.4L19 19l-4.6-1.4L12 22l-2.4-4.4L5 19l1.4-4.6L2 12l4.4-2.4L5 5l4.6 1.4z"/>',
  key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/>',
  cave: '<path d="M2 20l5-10 3 3 4-8 8 15z"/><path d="M9 20a3 3.5 0 0 1 6 0"/>',
  quill: '<path d="M20 4c-8 1-13 6-15 15"/><path d="M20 4c0 6-4 10-11 11"/><path d="M4 21l3-3"/>',
  palm: '<path d="M12 21c0-4 0-8 1-11"/><path d="M13 10c-3-3-7-3-9-1 3-1 6 0 9 1zM13 10c3-3 7-3 8 0-3-1-5-1-8 0zM13 10c-1-3-3-5-6-6 2 2 4 4 6 6zM13 10c1-3 3-5 6-5-2 1-4 3-6 5z"/>',
  mountain: '<path d="M2 19l6-9 4 5 3-4 7 8z"/>',
  arch: '<path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M9 21v-6a3 3 0 0 1 6 0v6M3 21h18"/>',
  drop: '<path d="M12 3c3 4 6 8 6 11a6 6 0 0 1-12 0c0-3 3-7 6-11z"/>',
  belt: '<path d="M2 9h20v6H2z"/><path d="M10 7v10M14 7v10"/>',
  trench: '<path d="M2 8h20M2 16h20"/><path d="M5 8l2 8M10 8l2 8M15 8l2 8"/>',
  route: '<path d="M5 19c4-6 10 0 14-12" stroke-dasharray="2.4 2.4"/><circle cx="5" cy="19" r="1.8"/><circle cx="19" cy="6" r="1.8"/>',
  banner: '<path d="M6 21V3"/><path d="M6 4h12l-3 4 3 4H6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  wave: '<path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/>',
  house: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  pin: '<path d="M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  link: '<path d="M9 15l6-6"/><path d="M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1"/>',
  coin: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  scroll: '<path d="M7 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8"/><path d="M7 4a2 2 0 0 0-2 2v1h4V6a2 2 0 0 0-2-2zM8 20a2 2 0 0 1-2-2v-1h4v1a2 2 0 0 1-2 2"/><path d="M11 9h6M11 12h6M11 15h4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
};
const wsIc = (k) => WS_I(WS_HI[k] || WS_HI.star);
// the game's emblem from the site identity: two hint cards and a star; the front card carries ؟ or !
const wsEmb = (txt = "؟", cls = "") => `<svg class="ws-emb ${cls}" viewBox="0 0 100 100" aria-hidden="true"><rect x="2.5" y="2.5" width="95" height="95" rx="24" fill="#0f5c4a" stroke="#1b2a4a" stroke-width="5"/><g transform="translate(16 16) scale(.68)"><g transform="rotate(-9 34 50)"><rect x="12" y="20" width="44" height="60" rx="6" fill="#fff6dc" opacity=".5"/></g><g transform="rotate(7 60 48)"><rect x="38" y="16" width="44" height="62" rx="6" fill="#fff6dc"/><text x="60" y="60" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="34" fill="#0f5c4a">${txt}</text></g><path d="M74 82l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#ffc933"/></g></svg>`;
const wsChip = (t, extra = "") => `<span class="ws-chip ${extra}" style="--c:${WS_TEAMS[t].c}">${WS_TEAMS[t].n}</span>`;
// one hint card: n = its number, h = [kind, symbol, text]; cls: cur (newest), peek (bought), new (just turned)
const wsCard = (h, n, cls = "", tag = "") => `<div class="ws-hc ${cls}"><div class="ws-hct"><i>${AR(n)}</i><span>${tag || h[0]}</span><b>${wsIc(h[1])}</b></div><p>${h[2]}</p></div>`;
const wsBack = (n) => `<div class="ws-hc back"><b class="n">${AR(n)}</b><small>${AR(WS_VAL[n - 1])} نقطة</small></div>`;

ROOM_GAMES.whois = {
  name: "من الشخصية؟", theme: "whois", min: 2, need: "يحتاج لاعب في فريقين على الأقل", who: "٢ إلى ٦ فرق · بطاقات تلميح من السيرة",
  rules: [
    "في كل جولة شخصية مخفية من السيرة والهجرة: صحابي، أو صحابية، أو مكان في المدينة.",
    `تنكشف على الشاشة ٦ بطاقات تلميح وحدة بعد وحدة، من الغامضة إلى الواضحة. التخمين الصح يساوي ${WS_VAL.map((v) => AR(v)).join("، ")} نقطة حسب البطاقة.`,
    "كل لاعب يختار من جواله، وإذا اتفق أكثر من نصف الفريق على اسم صار هذا تخمين الفريق. أول تخمين صح يقفل نقاطكم.",
    `التخمين الغلط ينقص ${AR(WS_WRONG)} نقطة، ويوقف الفريق عن التخمين لين تنكشف البطاقة الجاية.`,
    `تقدرون تشترون البطاقة الجاية بـ${AR(WS_BUY)} نقاط: تنكشف على جوالات فريقكم بس، قبل الشاشة. والشراء يحتاج أكثر من نصف الفريق.`,
    `بعد البطاقة الثانية والرابعة سؤال سريع عن السيرة: الجواب الصح +${AR(WS_QWIN)}، وأسرع فريق يجاوب صح ياخذ البطاقة الجاية مجانًا.`,
    "بعد كل شخصية ينكشف الاسم ومعلومة عنها، وبعد آخر شخصية الفريق الأعلى نقاطًا يفوز.",
    `${WS_CONTENT.review}: المعلومات التاريخية والشرعية مسودة تنتظر مراجعة مختص.`,
  ],
  setup(S) {
    Object.assign(S, { nt: 3, nc: 5, secs: 20, quiz: true });
    H.wt ||= {};
    H.players.forEach((p) => { if (H.wt[p.id] === undefined) ROOM_GAMES.whois.joined(p.id); });
  },
  joined(id) {
    const S = H.S, live = S.phase !== "lobby" && S.teams ? S.teams : Array.from({ length: S.nt || 3 }, (_, t) => t);
    const n = (t) => Object.values(H.wt).filter((x) => x === t).length;
    let best = live[0];
    for (const t of live) if (n(t) < n(best)) best = t;
    H.wt[id] = best;
    if (H.ws && S.phase !== "lobby") wsTellOne(id);
  },
  left(id) { delete H.wt[id]; },
  snap(S) {
    S.wteams = {}; H.players.forEach((p) => (S.wteams[p.id] = Math.min(H.wt[p.id] ?? 0, (S.nt || 3) - 1)));
    S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
  },
  key: (S) => `${S.sid || ""}:${S.phase}:${S.ci ?? ""}:${S.k ?? ""}`,
  on(m, local) {
    const S = H.S, Z = H.ws, t = H.wt[m.id];
    if (!Z || !m.id) return;
    if (m.t === "wswho") return wsTellOne(m.id);
    if (m.t === "wsnext" && local && S.phase === "reveal") return wsAfterReveal();
    if (t === undefined || !S.teams.includes(t)) return;
    const st = S.st[t];
    if (m.t === "wsvote" && S.phase === "card" && !st.solved && st.frozen < S.k && (m.c === null || S.board.some((b) => b.id === m.c))) {
      if (m.c === null) delete Z.votes[m.id]; else Z.votes[m.id] = m.c;
      const mem = wsMembers(t), n = mem.filter((id) => Z.votes[id] === m.c).length;
      if (m.c !== null && n * 2 > mem.length) return wsGuess(t, m.c);
      return wsTellTeam(t);
    }
    if (m.t === "wsbuy" && S.phase === "card" && !st.solved && S.k < 6 && Z.peek[t] <= S.k) {
      if (m.on) Z.buys[m.id] = true; else delete Z.buys[m.id];
      const mem = wsMembers(t), n = mem.filter((id) => Z.buys[id]).length;
      if (n * 2 > mem.length) return wsBuy(t);
      return wsTellTeam(t);
    }
    if (m.t === "wsq" && S.phase === "quiz" && !S.locked[t] && Number.isInteger(m.k) && m.k >= 0 && m.k < S.q.o.length) {
      Z.qv[m.id] = m.k;
      wsQuizCheck(t);
      return wsTellTeam(t);
    }
  },
  direct(m) {
    if (m.t !== "wsme") return;
    KL.my.ws = m;
    const v = ROOM_GAMES.whois.views[KL.S && KL.S.phase];
    if (v && KL.S.game === "whois") v(KL.S, false);
  },
  lobbyPlayers(S) {
    const col = (t) => `<div class="kl-team" style="color:${WS_TEAMS[t].c}"><b>الفريق ${WS_TEAMS[t].n}</b>${S.players.filter((p) => wsTeamOf(S, p.id) === t).map((p) => `<button type="button" class="kl-p" data-wsw="${esc(p.id)}" ${isHost() ? "" : "disabled"}>${face(p, 30)}<span>${esc(p.name)}${p.id === PID ? " (أنت)" : ""}</span></button>`).join("") || '<span class="muted">…</span>'}</div>`;
    return `<p class="muted" style="font-weight:700;color:var(--soft)">الفرق (${AR(S.players.length)} لاعب)${isHost() ? " · اضغط على لاعب ينقله للفريق اللي بعده" : ""}</p><div class="kl-teams">${Array.from({ length: S.nt }, (_, t) => col(t)).join("")}</div>`;
  },
  lobby(S) {
    const chips = (attr, list, cur, lab) => `<div class="chips pick">${list.map((v) => `<button type="button" class="chip" data-${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${lab(v)}</button>`).join("")}</div>`;
    const h = (t) => `<p class="muted" style="font-weight:700;color:var(--soft)">${t}</p>`;
    return `${h("كم فريق؟")}${chips("wnt", [2, 3, 4, 5, 6], S.nt, (v) => AR(v))}
      ${h("كم شخصية؟")}${chips("wnc", [3, 5, 8], S.nc, (v) => `${AR(v)} شخصيات`)}
      <p class="muted">كل شخصية ٦ بطاقات، وتاخذ ٣ إلى ٤ دقائق.</p>
      ${h("وقت كل بطاقة")}${chips("wsec", [15, 20, 30], S.secs, (v) => `${AR(v)} ثانية`)}
      ${h("سؤال سريع بعد البطاقة الثانية والرابعة")}${chips("wqz", [1, 0], S.quiz ? 1 : 0, (v) => (v ? "نعم" : "لا، البطاقات بس"))}
      <p class="muted ws-review">${WS_CONTENT.review}.</p>`;
  },
  bindLobby(S) {
    const set = (attr, key, f = (v) => +v) => screen.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { H.S[key] = f(b.dataset[attr]); beep(700, 0.04); if (key === "nt") H.players.forEach((p, k) => (H.wt[p.id] = k % H.S.nt)); hostSend(); }));
    set("wnt", "nt"); set("wnc", "nc"); set("wsec", "secs"); set("wqz", "quiz", (v) => v === "1");
    screen.querySelectorAll("[data-wsw]").forEach((b) => (b.onclick = () => { const id = b.dataset.wsw; H.wt[id] = ((H.wt[id] ?? 0) + 1) % H.S.nt; beep(640, 0.04); hostSend(); }));
    const used = new Set(Object.values(S.wteams || {}));
    if (used.size < 2) $("start").disabled = true;
  },
  start: () => wsStart(),
  resume(S) {
    const tick = (fn) => hEvery(() => { if (now() >= H.deadline) fn(); }, 250);
    if (S.phase === "intro") hLater(() => wsCardUp(1), 2500);
    else if (S.phase === "card") tick(wsAfterCard);
    else if (S.phase === "quiz") tick(wsQuizEnd);
    else if (S.phase === "qres") hLater(() => wsCardUp(S.k + 1), 2500);
    else if (S.phase === "reveal") hLater(wsAfterReveal, 4000);
    H.players.forEach((p) => wsTellOne(p.id));
  },
  views: { intro: wsvPlay, card: wsvPlay, quiz: wsvQuiz, qres: wsvQuiz, reveal: wsvPlay, end: wsvEnd },
};

// ---------------- the host ----------------
function wsTell(id, m) { m.to = id; if (id === PID) ROOM_GAMES.whois.direct(m); else if (KL.net) KL.net.send(m); }
const wsMembers = (t) => H.players.map((p) => p.id).filter((id) => H.wt[id] === t);
function wsTellOne(id) {
  const S = H.S, Z = H.ws; if (!Z) return;
  const t = H.wt[id];
  if (t === undefined || !S.teams || !S.teams.includes(t)) return wsTell(id, { t: "wsme", sid: S.sid, team: -1 });
  const mem = wsMembers(t), ch = wsChar(Z.list[S.ci]);
  const votes = {}, buys = [], qv = {};
  mem.forEach((x) => { if (Z.votes[x] !== undefined) votes[x] = Z.votes[x]; if (Z.buys[x]) buys.push(x); if (Z.qv[x] !== undefined) qv[x] = Z.qv[x]; });
  const peek = [];
  if (ch && ["card", "quiz", "qres"].includes(S.phase)) for (let n = S.k + 1; n <= Z.peek[t]; n++) peek.push([n, ch.h[n - 1]]);
  wsTell(id, { t: "wsme", sid: S.sid, team: t, ci: S.ci, k: S.k, votes, buys, qv, peek, free: !!Z.free[t], wrong: Z.lastWrong[t] || "" });
}
const wsTellTeam = (t) => wsMembers(t).forEach((id) => wsTellOne(id));
const wsTellAll = () => H.players.forEach((p) => wsTellOne(p.id));

function wsStart() {
  hClear();
  const S = H.S;
  const teams = [...new Set(H.players.map((p) => H.wt[p.id] ?? 0))].filter((t) => t < S.nt).sort();
  const list = shuffled(WS_CONTENT.chars.map((c) => c.id)).slice(0, Math.min(S.nc, WS_CONTENT.chars.length));
  H.ws = { list, votes: {}, buys: {}, qv: {}, qlock: {}, peek: Array(S.nt).fill(0), free: Array(S.nt).fill(false), lastWrong: Array(S.nt).fill(""), usedQ: [] };
  Object.assign(S, { sid: Math.random().toString(36).slice(2, 8), teams, total: list.length, pts: Array(S.nt).fill(0), hist: [], ch: null });
  wsNewChar(0);
}
// a new hidden character: a fresh board of names, everyone's status cleared
function wsNewChar(ci) {
  hClear();
  const S = H.S, Z = H.ws, ch = wsChar(Z.list[ci]);
  Object.assign(S, { phase: "intro", ci, k: 0, hints: [], ch: null, q: null, qres: null, board: wsBoard(ch), st: Array.from({ length: S.nt }, () => ({ solved: false, gain: 0, at: 0, frozen: 0, wrong: 0, bought: 0 })), news: "" });
  Z.peek = Array(S.nt).fill(0); Z.free = Array(S.nt).fill(false); Z.lastWrong = Array(S.nt).fill(""); Z.votes = {}; Z.buys = {};
  H.deadline = 0;
  hostSend(); wsTellAll();
  hLater(() => wsCardUp(1), 3500);
}
// twelve names: the answer and eleven others, with enough of its own kind that the first card doesn't give it away
function wsBoard(ch) {
  const others = shuffled([...WS_CONTENT.chars.filter((c) => c.id !== ch.id), ...WS_CONTENT.others]);
  const by = (ty) => others.filter((o) => o.ty === ty);
  const nP = ch.ty === "مكان" ? 4 : 3, nW = ch.ty === "صحابية" ? 3 : 2;
  const pick = [...by("مكان").slice(0, nP), ...by("صحابية").slice(0, nW), ...by("صحابي").slice(0, 11 - nP - nW)];
  return shuffled([ch, ...pick]).map((o) => ({ id: o.id, n: o.n, ty: o.ty }));
}
function wsCardUp(k) {
  hClear();
  const S = H.S, Z = H.ws, ch = wsChar(Z.list[S.ci]);
  S.k = k; S.hints = ch.h.slice(0, k); S.phase = "card"; S.q = null; S.qres = null;
  S.teams.forEach((t) => { if (Z.peek[t] < k) Z.peek[t] = k; if (Z.peek[t] <= k) Z.free[t] = false; });
  Z.votes = {}; Z.buys = {};
  S.news = k === 1 ? "البطاقة الأولى: أعلى نقاط وأصعب تخمين" : k === 6 ? "آخر بطاقة! آخر فرصة" : `البطاقة ${AR(k)} انكشفت`;
  S.T = S.secs * 1000; H.deadline = now() + S.T;
  hostSend(); wsTellAll();
  hEvery(() => { if (now() >= H.deadline) wsAfterCard(); }, 250);
}
const wsAllSolved = () => H.S.teams.every((t) => H.S.st[t].solved);
function wsAfterCard() {
  hClear();
  const S = H.S;
  if (S.phase !== "card") return;
  if (wsAllSolved() || S.k >= 6) return wsReveal();
  if (S.quiz && (S.k === 2 || S.k === 4)) return wsQuiz();
  wsCardUp(S.k + 1);
}
function wsGuess(t, c) {
  const S = H.S, Z = H.ws, st = S.st[t], ch = wsChar(Z.list[S.ci]);
  Z.votes = Object.fromEntries(Object.entries(Z.votes).filter(([id]) => H.wt[id] !== t));
  Z.buys = Object.fromEntries(Object.entries(Z.buys).filter(([id]) => H.wt[id] !== t));
  if (c === ch.id) {
    const v = WS_VAL[S.k - 1];
    S.pts[t] += v; Object.assign(st, { solved: true, gain: v, at: S.k });
    S.news = `فريق ${WS_TEAMS[t].n} عرفها مع البطاقة ${AR(S.k)}!`;
    if (wsAllSolved()) H.deadline = Math.min(H.deadline, now() + 1500);
  } else {
    S.pts[t] -= WS_WRONG; st.frozen = S.k; st.wrong++;
    Z.lastWrong[t] = (S.board.find((b) => b.id === c) || {}).n || "";
    S.news = `فريق ${WS_TEAMS[t].n} خمّن غلط`;
  }
  hostSend(); wsTellTeam(t);
}
function wsBuy(t) {
  const S = H.S, Z = H.ws;
  Z.buys = Object.fromEntries(Object.entries(Z.buys).filter(([id]) => H.wt[id] !== t));
  S.pts[t] -= WS_BUY; Z.peek[t] = S.k + 1; S.st[t].bought++;
  S.news = `فريق ${WS_TEAMS[t].n} اشترى البطاقة ${AR(S.k + 1)}`;
  hostSend(); wsTellTeam(t);
}
// ---------------- the quick question ----------------
function wsQuiz() {
  hClear();
  const S = H.S, Z = H.ws;
  let pool = WS_CONTENT.quiz.filter((x) => !Z.usedQ.includes(x.q));
  if (!pool.length) { Z.usedQ = []; pool = WS_CONTENT.quiz; }
  const q = pickOne(pool); Z.usedQ.push(q.q);
  Z.q = q; Z.qv = {}; Z.qlock = {};
  Object.assign(S, { phase: "quiz", q: { q: q.q, o: q.o }, locked: {}, qres: null, news: "سؤال سريع! الأسرع ياخذ البطاقة الجاية مجانًا" });
  S.T = WS_QSEC * 1000; H.deadline = now() + S.T;
  hostSend(); wsTellAll();
  hEvery(() => { if (now() >= H.deadline) wsQuizEnd(); }, 250);
}
// a team's answer is in once more than half of it agrees, or once all of it has voted
function wsQuizCheck(t) {
  const S = H.S, Z = H.ws, mem = wsMembers(t), n = [0, 0, 0, 0];
  mem.forEach((id) => { if (Z.qv[id] !== undefined) n[Z.qv[id]]++; });
  const best = n.indexOf(Math.max(...n)), all = mem.every((id) => Z.qv[id] !== undefined);
  if (n[best] * 2 > mem.length || (all && n[best] > 0)) {
    Z.qlock[t] = { o: best, at: now() }; S.locked[t] = true;
    if (S.teams.every((x) => S.locked[x])) H.deadline = Math.min(H.deadline, now() + 800);
    hostSendSoon();
  }
}
function wsQuizEnd() {
  hClear();
  const S = H.S, Z = H.ws;
  if (S.phase !== "quiz") return;
  S.teams.forEach((t) => {
    if (Z.qlock[t]) return;
    const n = [0, 0, 0, 0]; wsMembers(t).forEach((id) => { if (Z.qv[id] !== undefined) n[Z.qv[id]]++; });
    if (Math.max(...n) > 0) Z.qlock[t] = { o: n.indexOf(Math.max(...n)), at: now() };
  });
  const right = S.teams.filter((t) => Z.qlock[t] && Z.qlock[t].o === Z.q.a).sort((a, b) => Z.qlock[a].at - Z.qlock[b].at);
  right.forEach((t) => (S.pts[t] += WS_QWIN));
  const fast = right.find((t) => !S.st[t].solved && Z.peek[t] <= S.k);
  if (fast !== undefined) { Z.peek[fast] = S.k + 1; Z.free[fast] = true; }
  S.qres = { a: Z.q.a, picks: Object.fromEntries(S.teams.map((t) => [t, Z.qlock[t] ? Z.qlock[t].o : -1])), right, fast: fast ?? -1 };
  S.phase = "qres"; H.deadline = 0;
  S.news = right.length ? `${AR(right.length)} ${right.length > 2 ? "فرق" : right.length === 2 ? "فريقين" : "فريق"} جاوب صح${fast !== undefined ? `، والأسرع الفريق ${WS_TEAMS[fast].n}` : ""}` : "ولا فريق جاوب صح";
  hostSend(); wsTellAll();
  hLater(() => wsCardUp(S.k + 1), 4500);
}
// ---------------- the name, and the next one ----------------
function wsReveal() {
  hClear();
  const S = H.S, Z = H.ws, ch = wsChar(Z.list[S.ci]);
  S.phase = "reveal"; S.hints = ch.h.slice(); H.deadline = 0;
  S.ch = { n: ch.n, ty: ch.ty, fact: ch.fact, trip: ch.trip || "" };
  S.hist.push({ n: ch.n, trip: ch.trip || "", res: S.teams.map((t) => ({ t, solved: S.st[t].solved, at: S.st[t].at, gain: S.st[t].gain, wrong: S.st[t].wrong })) });
  S.news = `كانت: ${ch.n}`;
  hostSend(); wsTellAll();
  hLater(wsAfterReveal, 10000);
}
function wsAfterReveal() {
  hClear();
  const S = H.S;
  if (S.phase !== "reveal") return;
  if (S.ci + 1 < S.total) return wsNewChar(S.ci + 1);
  wsEnd();
}
function wsEnd() {
  hClear();
  const S = H.S;
  S.rank = S.teams.slice().sort((a, b) => S.pts[b] - S.pts[a]);
  S.won = S.rank[0]; S.tie = S.rank.length > 1 && S.pts[S.rank[1]] === S.pts[S.rank[0]];
  S.phase = "end"; H.deadline = 0;
  hostSend();
}

// ---------------- every phone ----------------
const wsMine = () => (KL.my.ws && KL.S && KL.my.ws.sid === KL.S.sid ? KL.my.ws : null);
function wsAsk4Me() { if (!wsMine() && now() - (KL.my.wsAskedAt || 0) > 2500) { KL.my.wsAskedAt = now(); act({ t: "wswho", id: PID }); } }
function wsHead() { const el = $("gTitle"); if (el && !el.querySelector(".ws-gico")) el.innerHTML = `<span class="ws-gico">${wsEmb()}</span>${ROOM_GAMES.whois.name}`; }
function wsTick() {
  klEvery(() => {
    const s = KL.S; if (!s || s.game !== "whois") return;
    const el = $("wsLeft"); if (el) el.textContent = AR(Math.ceil(leftOf(s.left) / 1000));
    const bar = $("wsBar"); if (bar && s.T) bar.style.transform = `scaleX(${leftOf(s.left) / s.T})`;
  }, 250);
}
// show without jumping back to the top when only the votes changed
const wsShow = (html, fresh) => { const y = screen.scrollTop; show(html); if (!fresh) screen.scrollTop = y; };
function wsTop(S, t) {
  const k = S.k || 0, val = S.phase === "card" && k ? WS_VAL[k - 1] : 0, mine = wsMine();
  return `<div class="ws-top" style="--c:${t >= 0 ? WS_TEAMS[t].c : "#1b2a4a"}">
    <div class="ws-r1">${wsEmb()}<div class="ws-nm"><b>${t >= 0 ? `الفريق ${WS_TEAMS[t].n}` : "تتفرج"}</b><small>الشخصية ${AR((S.ci || 0) + 1)} من ${AR(S.total || 0)}</small></div>${t >= 0 ? `<div class="ws-pts"><small>نقاطكم</small><b>${wsN(S.pts[t])}</b></div>` : ""}</div>
    <div class="ws-dots">${WS_VAL.map((v, i) => { const n = i + 1; return `<span class="${S.phase === "reveal" || n < k ? "on" : n === k ? "cur" : mine && mine.peek.some((p) => p[0] === n) ? "pk" : ""}">${AR(v)}</span>`; }).join("")}</div>
    ${val ? `<div class="ws-now"><span>البطاقة ${AR(k)} من ٦ · التخمين الصح الآن</span><b>${AR(val)}</b></div><div class="ws-tline"><i id="wsBar" style="transform:scaleX(${leftOf(S.left) / (S.T || 1)})"></i></div>` : ""}
  </div>`;
}
const wsScores = (S) => `<div class="ws-scores">${[...S.teams].sort((a, b) => S.pts[b] - S.pts[a]).map((t) => `<span class="ws-chip" style="--c:${WS_TEAMS[t].c}">${WS_TEAMS[t].n} <b>${wsN(S.pts[t])}</b></span>`).join("")}</div>`;

function wsvPlay(S, fresh) {
  wsHead(); wsAsk4Me();
  const me2 = wsMine(), t = me2 ? me2.team : wsTeamOf(S, PID), mine = S.teams.includes(t);
  if (fresh) {
    clearKL(); wsTick(); KL.my.sel = null; KL.my.newK = true;
    if (S.phase === "card") { beep(780, 0.06); buzz(30); }
    if (S.phase === "reveal") { const st = mine && S.st[t]; if (st && st.solved) { beep(523, 0.1); setTimeout(() => beep(784, 0.2), 140); } else beep(392, 0.2, "triangle"); }
  }
  setTop(S.phase === "reveal" ? "الكشف" : S.phase === "intro" ? "استعدوا" : `البطاقة ${AR(S.k)}`);
  if (S.phase === "intro") return wsShow(`${wsTop(S, t)}<div class="ws-res">${wsEmb("؟", "big")}<div class="big">استعدوا</div><span class="muted">الشخصية ${AR(S.ci + 1)} من ${AR(S.total)}. انتبهوا للشاشة: البطاقة الأولى جاية.</span></div>${wsScores(S)}`, true);
  if (S.phase === "reveal") {
    const st = mine ? S.st[t] : null, ch = S.ch;
    wsShow(`${wsTop(S, t)}
      <div class="ws-res"><span class="muted">الشخصية كانت</span><span class="ws-cart">${esc(ch.n)}</span>
        ${st ? (st.solved ? `<div class="pts">${wsSG(st.gain)}</div><b>عرفتوها مع البطاقة ${AR(st.at)}${st.wrong ? `، بعد ${AR(st.wrong)} غلط` : ""}</b>` : `<div class="big sm">ما عرفتوها هالمرة</div>`) : ""}
        <p>${ch.fact}</p>${ch.trip ? `<span class="ws-trip">${ch.trip}</span>` : ""}</div>
      ${wsScores(S)}
      <details class="ws-more"><summary>البطاقات الست</summary><div class="ws-list">${S.hints.map((h, i) => `<div><i>${AR(i + 1)}</i><span>${h[2]}</span></div>`).join("")}</div></details>
      ${isHost() ? `<button type="button" class="btn btn-marker" id="wsNext">${S.ci + 1 < S.total ? "الشخصية الجاية" : "النتيجة"}</button>` : ""}`, fresh);
    if ($("wsNext")) $("wsNext").onclick = () => { beep(700, 0.05); act({ t: "wsnext", id: PID }); };
    return;
  }
  // a hint card is up
  const k = S.k, st = mine ? S.st[t] : null;
  const peeks = me2 && me2.peek ? me2.peek.slice().reverse().map(([n, h]) => wsCard(h, n, "peek", `خاص بفريقكم: البطاقة ${AR(n)}${me2.free ? " (مجانًا)" : ""}`)).join("") : "";
  const latest = wsCard(S.hints[k - 1], k, `cur ${KL.my.newK ? "new" : ""}`);
  KL.my.newK = false;
  const older = k > 1 ? `<details class="ws-more" ${KL.my.olderOpen ? "open" : ""}><summary>البطاقات السابقة (${AR(k - 1)})</summary><div class="ws-list">${S.hints.slice(0, k - 1).map((h, i) => `<div><i>${AR(i + 1)}</i><span>${h[2]}</span></div>`).reverse().join("")}</div></details>` : "";
  if (!mine) return wsShow(`${wsTop(S, t)}${latest}${older}<p class="muted" style="text-align:center">دخلت بعد البداية: تتفرج، وتلعب معهم الشخصية الجاية.</p>${wsScores(S)}`, fresh);
  if (st.solved) return wsShow(`${wsTop(S, t)}<div class="ws-res ok"><div class="big">عرفتوها!</div><div class="pts">${wsSG(st.gain)}</div><span class="muted">لا تقولون لأحد! انتظروا الفرق الثانية.</span></div>${peeks}${latest}${older}${wsScores(S)}`, fresh);
  const frozen = st.frozen >= k, votes = (me2 && me2.votes) || {}, mates = S.players.filter((p) => wsTeamOf(S, p.id) === t);
  const sel = KL.my.sel && S.board.some((b) => b.id === KL.my.sel) ? KL.my.sel : null, myVote = votes[PID] ?? null;
  const voters = (id) => mates.filter((p) => votes[p.id] === id).map((p) => face(p, 22)).join("");
  const need = Math.floor(mates.length / 2) + 1;
  const buys = (me2 && me2.buys) || [], iBuy = buys.includes(PID), canBuy = k < 6 && !(me2 && me2.peek && me2.peek.length);
  wsShow(`${wsTop(S, t)}
    ${S.news ? `<div class="ws-news">${S.news}</div>` : ""}
    ${peeks}${latest}${older}
    ${frozen ? `<div class="ws-help bad">${wsIc("lock")}<span>${me2 && me2.wrong ? `«${esc(me2.wrong)}» غلط` : "تخمين غلط"} (${wsSG(-WS_WRONG)}). تقدرون تخمّنون مع البطاقة ${AR(k + 1)}.</span></div>` : ""}
    <span class="ws-lab">مَن تكون؟ اختر اسم وصوّت. ${mates.length > 1 ? `يحتاج ${AR(need)} من ${AR(mates.length)} في فريقكم على نفس الاسم.` : "صوتك هو تخمين الفريق."}</span>
    <div class="ws-cands">${S.board.map((b) => `<button type="button" class="ws-cand ${myVote === b.id ? "voted" : ""}" data-c="${esc(b.id)}" aria-pressed="${sel === b.id}" ${frozen ? "disabled" : ""}><b>${esc(b.n)}</b><small>${b.ty}</small><span class="vv">${voters(b.id)}</span></button>`).join("")}</div>
    <button type="button" class="btn btn-marker" id="wsVote" ${!sel || frozen || myVote === sel ? "disabled" : ""}>${myVote && myVote === sel ? "صوّتت لهذا الاسم" : sel ? `صوّت: ${esc((S.board.find((b) => b.id === sel) || {}).n)} <span class="ws-p">${wsSG(WS_VAL[k - 1])}</span>` : "اختر اسم"}</button>
    ${myVote ? `<button type="button" class="btn btn-ghost sm" id="wsUnvote">ألغِ صوتي</button>` : ""}
    ${canBuy ? `<button type="button" class="btn btn-ghost" id="wsBuy" aria-pressed="${iBuy}">${iBuy ? "طلبت شراء البطاقة" : `اشتروا البطاقة ${AR(k + 1)} لفريقكم`} <span class="ws-p bad">${wsSG(-WS_BUY)}</span>${mates.length > 1 ? ` <small>${AR(buys.length)} من ${AR(need)}</small>` : ""}</button>` : ""}
    ${wsScores(S)}`, fresh);
  const more = screen.querySelector("details.ws-more"); if (more) more.ontoggle = () => (KL.my.olderOpen = more.open);
  screen.querySelectorAll(".ws-cand:not([disabled])").forEach((b) => (b.onclick = () => { KL.my.sel = b.dataset.c; beep(660, 0.04); wsvPlay(KL.S, false); }));
  if ($("wsVote")) $("wsVote").onclick = () => { if (!sel) return; beep(880, 0.06); buzz(30); act({ t: "wsvote", id: PID, c: sel }); };
  if ($("wsUnvote")) $("wsUnvote").onclick = () => act({ t: "wsvote", id: PID, c: null });
  if ($("wsBuy")) $("wsBuy").onclick = () => { beep(700, 0.05); act({ t: "wsbuy", id: PID, on: !iBuy }); };
}

function wsvQuiz(S, fresh) {
  wsHead(); wsAsk4Me();
  const me2 = wsMine(), t = me2 ? me2.team : wsTeamOf(S, PID), mine = S.teams.includes(t), R = S.qres;
  if (fresh) {
    clearKL(); wsTick(); KL.my.qv = undefined;
    if (!R) { beep(880, 0.08); buzz([50, 30, 50]); }
    else if (mine && R.right.includes(t)) { beep(660, 0.08); setTimeout(() => beep(880, 0.12), 120); } else beep(220, 0.2, "triangle");
  }
  setTop("سؤال سريع");
  const qv = (me2 && me2.qv) || {}, mates = S.players.filter((p) => wsTeamOf(S, p.id) === t), my = qv[PID] ?? KL.my.qv;
  const voters = (k) => mates.filter((p) => qv[p.id] === k).map((p) => face(p, 22)).join("");
  const locked = mine && S.locked && S.locked[t];
  wsShow(`${wsTop(S, t)}
    <div class="ws-card">
      <div class="ws-k">سؤال سريع: <b>${wsSG(WS_QWIN)}</b>، والأسرع ياخذ البطاقة ${AR(S.k + 1)} مجانًا</div>
      <div class="ws-q">${esc(S.q.q)}</div>
      ${R ? "" : `<div class="ws-tline"><i id="wsBar" style="transform:scaleX(${leftOf(S.left) / (S.T || 1)})"></i></div>`}
      <div class="ws-opts">${S.q.o.map((o, k) => `<button type="button" class="ws-opt ${R ? (k === R.a ? "ok" : mine && R.picks[t] === k ? "no" : "") : ""}" data-qo="${k}" aria-pressed="${my === k}" ${!mine || R || locked ? "disabled" : ""}><span>${esc(o)}</span><span class="vv">${voters(k)}</span></button>`).join("")}</div>
      ${R ? (mine ? (R.right.includes(t) ? `<div class="ws-help ok">${wsIc("star")}<span>صح! ${wsSG(WS_QWIN)}${R.fast === t ? `، وأنتم الأسرع: البطاقة ${AR(S.k + 1)} وصلتكم مجانًا` : ""}</span></div>` : `<div class="ws-help bad">${wsIc("lock")}<span>${R.picks[t] >= 0 ? "جواب غلط" : "ما لحقتوا تجاوبون"}. الجواب: ${esc(S.q.o[R.a])}</span></div>`) : "")
        : `<p class="muted">${!mine ? "تتفرج الحين." : locked ? "جواب فريقكم وصل. ننتظر الباقين…" : "اختر جوابك، وجواب الأغلبية هو جواب الفريق."} · <span id="wsLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</span> ث</p>`}
    </div>
    ${wsScores(S)}`, fresh);
  screen.querySelectorAll(".ws-opt:not([disabled])").forEach((b) => (b.onclick = () => { KL.my.qv = +b.dataset.qo; beep(660, 0.05); act({ t: "wsq", id: PID, k: KL.my.qv }); screen.querySelectorAll(".ws-opt").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
}

function wsvEnd(S, fresh) {
  wsHead();
  const t = wsTeamOf(S, PID), rank = S.rank.indexOf(t) + 1;
  if (fresh) { clearKL(); if (rank === 1) { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); } else beep(262, 0.4, "triangle", 0.12); }
  setTop("انتهت");
  const w = S.won;
  show(`
    <div class="ws-res"><div class="big" style="color:${WS_TEAMS[w].c}">${S.tie ? "تعادل!" : `فاز الفريق ${WS_TEAMS[w].n}`}</div>${rank ? `<span class="muted">فريقكم في المركز ${AR(rank)}، وعرف ${AR(S.hist.filter((h) => (h.res.find((r) => r.t === t) || {}).solved).length)} من ${AR(S.hist.length)} شخصيات</span>` : ""}</div>
    <div class="ws-rank">${S.rank.map((x, i) => `<div class="${x === t ? "me" : ""}" style="--c:${WS_TEAMS[x].c}"><i>${AR(i + 1)}</i><span>الفريق ${WS_TEAMS[x].n}</span><b>${wsN(S.pts[x])}</b></div>`).join("")}</div>
    <span class="ws-lab">للرحلة: اللي مرّ عليكم</span>
    <div class="ws-card ws-list">${S.hist.map((h) => { const r = h.res.find((x) => x.t === t); return `<div><i>${r && r.solved ? AR(r.at) : "–"}</i><span><b>${esc(h.n)}</b>${r ? (r.solved ? ` · ${wsSG(r.gain)}` : " · ما عرفتوها") : ""}${h.trip ? `<br><small>${h.trip}</small>` : ""}</span></div>`; }).join("")}</div>
    <p class="muted ws-review">${WS_CONTENT.review}.</p>
    ${isHost() ? '<button type="button" class="btn btn-marker" id="wsAgain">جولة جديدة بنفس الفرق</button>' : '<p class="muted" style="text-align:center">المضيف يقدر يبدأ جولة جديدة.</p>'}
    <button type="button" class="btn btn-ghost" id="wsHome">رجوع لفسحة</button>`);
  if ($("wsAgain")) $("wsAgain").onclick = () => hostAgain();
  $("wsHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}

// ---------------- the big screen (tv.js) ----------------
// Only what's public: the cards already up, who has got it (never what anyone guessed), and the points.
ROOM_GAMES.whois.tvTeams = (S) => Array.from({ length: S.nt || 3 }, (_, t) => ({ n: `الفريق ${WS_TEAMS[t].n}`, c: WS_TEAMS[t].c, ps: S.players.filter((p) => wsTeamOf(S, p.id) === t) }));
function wsTvStatus(S, t) {
  const st = S.st[t];
  if (S.phase === "reveal") return st.solved ? `عرفوها مع البطاقة ${AR(st.at)}: ${wsSG(st.gain)}` : "ما عرفوها";
  if (S.phase === "quiz") return S.locked[t] ? "جاوبوا" : "يفكّرون";
  if (S.phase === "qres") return S.qres.right.includes(t) ? `جواب صح ${wsSG(WS_QWIN)}${S.qres.fast === t ? "، والأسرع" : ""}` : "جواب غلط";
  if (S.phase === "intro") return "مستعدين";
  if (st.solved) return `عرفوها! ${wsSG(st.gain)}`;
  if (st.frozen >= S.k) return `غلط ${wsSG(-WS_WRONG)}، ينتظرون البطاقة الجاية`;
  return st.bought ? "اشتروا بطاقة" : "يتناقشون";
}
function wsTvSide(S) {
  return `<aside class="wst-side">
    <div class="wst-ttl">${wsEmb()}<b>من الشخصية؟</b></div>
    <div class="wst-rnd">الشخصية ${AR(S.ci + 1)} من ${AR(S.total)}</div>
    <div class="wst-lad">${WS_VAL.map((v, i) => `<div class="${i + 1 === S.k && S.phase !== "reveal" ? "cur" : i + 1 < S.k ? "past" : ""}"><i>${AR(i + 1)}</i><span>البطاقة ${AR(i + 1)}</span><b>${AR(v)}</b></div>`).join("")}</div>
    <div class="wst-teams">${[...S.teams].sort((a, b) => S.pts[b] - S.pts[a]).map((t) => `<div class="wst-team ${S.st[t].solved ? "won" : S.phase === "card" && S.st[t].frozen >= S.k ? "frz" : ""}" style="--c:${WS_TEAMS[t].c}"><i></i><div><b>الفريق ${WS_TEAMS[t].n}</b><small>${wsTvStatus(S, t)}</small></div><span>${wsN(S.pts[t])}</span></div>`).join("")}</div>
  </aside>`;
}
function wsTvCards(S, fresh) {
  const all = S.phase === "reveal";
  return `<div class="wst-cards">${Array.from({ length: 6 }, (_, i) => { const n = i + 1; if (n > S.k && !all) return wsBack(n); return wsCard(S.hints[i], n, `${n === S.k && !all ? "cur" : ""} ${(fresh && n === S.k && S.phase === "card") || (all && n > S.k && fresh) ? "new" : ""}`); }).join("")}</div>`;
}
function wsTvMain(S, fresh, over) {
  const val = S.phase === "card" ? `<span class="v">التخمين الصح الآن <b>${AR(WS_VAL[S.k - 1])}</b></span>${tvSecs(S.left)}` : "";
  return `<div class="wst">${wsTvSide(S)}<section class="wst-main">
    <div class="wst-head">${wsEmb(S.phase === "reveal" ? "!" : "؟")}<div class="wst-hd"><b>مَن تكون الشخصية ${AR(S.ci + 1)}؟</b><span>${S.news || ""}</span></div><div class="wst-tmr">${val}${S.phase === "card" ? tvBar(S.left, S.T) : ""}</div></div>
    ${wsTvCards(S, fresh)}${over || ""}</section></div>`;
}
ROOM_GAMES.whois.tv = {
  intro: (S, fresh) => wsTvMain(S, fresh, `<div class="wst-over"><div class="wst-oc">${wsEmb("؟", "big")}<span class="k">الشخصية ${AR(S.ci + 1)} من ${AR(S.total)}</span><b class="big">مَن تكون؟</b><span>٦ بطاقات. أول تخمين صح ياخذ ${AR(WS_VAL[0])} نقطة</span></div></div>`),
  card: (S, fresh) => wsTvMain(S, fresh),
  quiz: (S, fresh) => wsTvMain(S, fresh, wsTvQuiz(S)),
  qres: (S, fresh) => wsTvMain(S, fresh, wsTvQuiz(S)),
  reveal: (S, fresh) => wsTvMain(S, fresh, `<div class="wst-over low"><div class="wst-oc"><span class="k">الشخصية ${AR(S.ci + 1)} كانت</span><span class="ws-cart">${esc(S.ch.n)}</span><p>${S.ch.fact}</p>${S.ch.trip ? `<span class="ws-trip">${S.ch.trip}</span>` : ""}
    <div class="wst-chips">${S.teams.map((t) => `<span class="ws-chip" style="--c:${WS_TEAMS[t].c}">${WS_TEAMS[t].n}: ${S.st[t].solved ? `البطاقة ${AR(S.st[t].at)}، ${wsSG(S.st[t].gain)}` : "ما عرفوها"}</span>`).join("")}</div></div></div>`),
  end(S) {
    const w = S.won;
    return `<div class="wst-end">
      <div class="wst-stamp">${S.tie ? "تعادل!" : `فاز الفريق ${WS_TEAMS[w].n}`}</div>
      <div class="wst-pod">${S.rank.map((t, i) => `<div style="--c:${WS_TEAMS[t].c}"><small>${AR(i + 1)}</small><b>الفريق ${WS_TEAMS[t].n}</b><span>${wsN(S.pts[t])}</span></div>`).join("")}</div>
      <div class="wst-table" style="grid-template-columns:2.2fr repeat(${S.teams.length},1fr)"><span class="h">الشخصية</span>${S.teams.map((t) => `<span class="h" style="color:${WS_TEAMS[t].c}">${WS_TEAMS[t].n}</span>`).join("")}
        ${S.hist.map((h) => `<b>${esc(h.n)}</b>${S.teams.map((t) => { const r = h.res.find((x) => x.t === t); return `<span>${r && r.solved ? `البطاقة ${AR(r.at)} · ${wsSG(r.gain)}` : "–"}</span>`; }).join("")}`).join("")}</div>
      <p class="wst-note">${WS_CONTENT.review}</p></div>`;
  },
};
function wsTvQuiz(S) {
  const R = S.qres;
  return `<div class="wst-over"><div class="wst-oc quiz"><span class="k">سؤال سريع: ${wsSG(WS_QWIN)}، والأسرع ياخذ البطاقة ${AR(S.k + 1)} مجانًا</span><b class="q">${esc(S.q.q)}</b>
    <div class="wst-opts">${S.q.o.map((o, k) => `<div class="${R && k === R.a ? "ok" : ""}"><span>${esc(o)}</span><span class="dots">${R ? S.teams.filter((t) => R.picks[t] === k).map((t) => `<i style="--c:${WS_TEAMS[t].c}"></i>`).join("") : ""}</span></div>`).join("")}</div>
    <div class="wst-chips">${S.teams.map((t) => `<span class="ws-chip" style="--c:${WS_TEAMS[t].c}">${WS_TEAMS[t].n}: ${wsTvStatus(S, t)}</span>`).join("")}</div>
    ${R ? "" : `<div class="wst-qt">${tvBar(S.left, S.T)}${tvSecs(S.left)}</div>`}</div></div>`;
}
