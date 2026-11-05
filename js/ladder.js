"use strict";
// ================= سلّم القيم: a 100-tile board of good values and bad habits, moved by answers, not dice =================
// Every round one question goes to every team at once; each team's majority is its answer. A right answer
// lets the team choose how far to go (the fastest right team may go further); a wrong one moves one tile.
// Ladders are values with a one-line lesson, snakes are habits with a short card. A team on a snake's head
// may spend one of its escape chances on a quick question. First to land exactly on 100 wins.
// Votes stay with each team: the host sends each team its own tallies, everyone sees only who has answered.
// The values, habits and lessons are a draft under review (see HOW.ladder.note).

const LD_TEAMS = [{ n: "الأزرق", c: "#2f6fd6", note: "#9fd3ff" }, { n: "البرتقالي", c: "#d9730d", note: "#ffbd6b" }, { n: "الأخضر", c: "#1f8a53", note: "#9be7a0" }, { n: "البنفسجي", c: "#6b3fb8", note: "#c9a7ff" }, { n: "الوردي", c: "#d6457a", note: "#ff9fb2" }, { n: "السماوي", c: "#0e8fa8", note: "#7ee0d0" }];
const LD_LADDERS = [
  { a: 4, b: 25, v: "الصدق", l: "الصدق يخلّي الناس يثقون فيك، والثقة ترفعك." },
  { a: 9, b: 31, v: "بر الوالدين", l: "ساعد والديك وكلّمهم بلطف، كلمة طيبة منك تفرّق في يومهم." },
  { a: 21, b: 42, v: "الأمانة", l: "احفظ اللي ينأمن عندك، صغير كان أو كبير." },
  { a: 28, b: 55, v: "التعاون", l: "يد وحدة ما تصفّق. مع بعض نوصل أبعد." },
  { a: 51, b: 73, v: "الرحمة", l: "ارحم الصغير والضعيف والحيوان، الرحمة تكبّر القلب." },
  { a: 65, b: 84, v: "احترام الكبير", l: "قدّر الكبير واسمع له، عنده خبرة سنين." },
  { a: 72, b: 91, v: "الصبر", l: "الصبر يوصلك للي تبيه، ولو تأخر شوي." },
];
const LD_SNAKES = [
  { a: 17, b: 6, v: "الغيبة", l: "الكلام عن الناس في غيابهم يجرحهم. قل خير أو اسكت." },
  { a: 36, b: 14, v: "الحسد", l: "تمنَّ الخير لغيرك مثل ما تتمناه لنفسك. الحسد يتعب صاحبه." },
  { a: 47, b: 26, v: "الكذب", l: "كذبة صغيرة تجرّ كذبات أكبر. الصدق أريح." },
  { a: 62, b: 19, v: "التسويف", l: "اللي تأجله اليوم يكبر بكرة. ابدأ الحين ولو بخطوة." },
  { a: 79, b: 58, v: "التنمّر", l: "الكلمة الجارحة تبقى في القلب. كن سند لغيرك، مو سبب حزنه." },
  { a: 87, b: 53, v: "الغش", l: "الغش يعطيك درجة، ويأخذ منك التعلّم وثقة الناس." },
  { a: 95, b: 75, v: "الغرور", l: "اللي يشوف نفسه فوق الناس يطيح بسرعة. التواضع يرفعك." },
];
const LD_LAD = {}, LD_SNK = {};
LD_LADDERS.forEach((x, i) => (LD_LAD[x.a] = i)); LD_SNAKES.forEach((x, i) => (LD_SNK[x.a] = i));
const LD_LEN = [{ n: "عادية", r: 3, f: 4, d: "صح: ١ إلى ٣ خطوات، والأسرع حتى ٤" }, { n: "سريعة", r: 4, f: 6, d: "صح: ١ إلى ٤ خطوات، والأسرع حتى ٦" }];
const LD_AUD = ["صغار", "عائلة", "كبار"];
const LD_QS = [
  [1, "حيوانات", "كم رجلًا للعنكبوت؟", ["٦", "٨", "١٠", "٤"], 1], [1, "حيوانات", "ما اسم صغير الجمل؟", ["مهر", "حُوار", "جرو", "عجل"], 1],
  [1, "حيوانات", "ما اسم بيت النحل؟", ["خلية", "عرين", "وكر", "جحر"], 0], [1, "حيوانات", "ما اسم صوت الأسد؟", ["نهيق", "زئير", "نباح", "صهيل"], 1],
  [1, "حيوانات", "أي حيوان يُلقّب بسفينة الصحراء؟", ["الحصان", "الجمل", "الفيل", "الغزال"], 1], [1, "حيوانات", "ما أكبر حيوان على الأرض؟", ["الفيل", "الحوت الأزرق", "الزرافة", "القرش"], 1],
  [1, "حيوانات", "ما اسم صوت الحصان؟", ["صهيل", "خوار", "ثغاء", "مواء"], 0], [1, "حيوانات", "من أين يأتي العسل؟", ["النحل", "الفراش", "النمل", "الذباب"], 0],
  [1, "ألوان", "ماذا ينتج من خلط الأزرق مع الأصفر؟", ["أخضر", "بنفسجي", "برتقالي", "بني"], 0], [1, "عامة", "ما لون إشارة المرور التي تعني «قف»؟", ["الأخضر", "الأصفر", "الأحمر", "الأزرق"], 2],
  [1, "عامة", "كم يومًا في الأسبوع؟", ["٥", "٦", "٧", "٨"], 2], [1, "عامة", "كم ساعة في اليوم؟", ["١٢", "٢٤", "٤٨", "٢٠"], 1], [1, "عامة", "كم شهرًا في السنة؟", ["١٠", "١١", "١٢", "١٣"], 2],
  [1, "لغتي", "كم حرفًا في الحروف الهجائية العربية؟", ["٢٦", "٢٨", "٣٠", "٢٤"], 1], [1, "لغتي", "ما جمع كلمة «كتاب»؟", ["كتابات", "كُتُب", "كتّاب", "مكاتب"], 1],
  [1, "لغتي", "ما عكس كلمة «طويل»؟", ["عريض", "قصير", "كبير", "سريع"], 1], [1, "لغتي", "ما مفرد كلمة «أشجار»؟", ["شجرة", "شجر", "شجيرات", "مشجر"], 0],
  [1, "رياضيات", "كم ضلعًا للمثلث؟", ["٢", "٣", "٤", "٥"], 1], [1, "رياضيات", "كم يساوي ٥ + ٧؟", ["١١", "١٢", "١٣", "١٤"], 1], [1, "رياضيات", "كم يساوي ٣ × ٤؟", ["٧", "١٢", "١٠", "١٤"], 1],
  [1, "جسمي", "ما العضو الذي يضخّ الدم في الجسم؟", ["الرئة", "القلب", "المعدة", "الكبد"], 1], [1, "جسمي", "كم إصبعًا في اليدين معًا؟", ["٨", "١٠", "١٢", "٥"], 1],
  [1, "ألغاز", "شيء له أسنان ولا يعض، ما هو؟", ["الأسد", "المشط", "القط", "التمساح"], 1], [1, "ألغاز", "شيء يمشي بلا رجلين، ما هو؟", ["الكرسي", "الساعة", "الباب", "الطاولة"], 1],
  [1, "بلادي", "ما عاصمة المملكة العربية السعودية؟", ["جدة", "الرياض", "الدمام", "مكة المكرمة"], 1], [1, "كورة", "كم لاعبًا لكل فريق داخل ملعب كرة القدم؟", ["٩", "١٠", "١١", "١٢"], 2],
  [1, "علوم", "أي فصل هو الأحرّ في السنة؟", ["الشتاء", "الربيع", "الصيف", "الخريف"], 2], [1, "علوم", "ما الكوكب الذي نعيش عليه؟", ["المريخ", "الأرض", "زحل", "عطارد"], 1],
  [2, "علوم", "ما الكوكب الذي يُسمّى «الكوكب الأحمر»؟", ["الزهرة", "المريخ", "المشتري", "زحل"], 1], [2, "علوم", "على أي درجة مئوية يغلي الماء عند سطح البحر؟", ["٨٠", "٩٠", "١٠٠", "١٢٠"], 2],
  [2, "علوم", "ما الرمز الكيميائي للماء؟", ["CO2", "H2O", "O2", "NaCl"], 1], [2, "علوم", "كم عدد كواكب المجموعة الشمسية؟", ["٧", "٨", "٩", "١٠"], 1],
  [2, "علوم", "ما اسم العملية التي يصنع بها النبات غذاءه؟", ["التنفس", "البناء الضوئي", "الهضم", "التبخر"], 1], [2, "علوم", "ما الغاز الذي نحتاجه لنتنفس؟", ["الأكسجين", "الهيليوم", "النيتروجين", "ثاني أكسيد الكربون"], 0],
  [2, "علوم", "ما أقرب نجم إلى الأرض؟", ["الشمس", "القمر", "المريخ", "الشعرى"], 0], [2, "جسمي", "كم عظمة تقريبًا في جسم الإنسان البالغ؟", ["١٠٦", "٢٠٦", "٣٠٦", "٥٠"], 1],
  [2, "جغرافيا", "ما أكبر دولة عربية مساحة؟", ["السعودية", "السودان", "الجزائر", "ليبيا"], 2], [2, "جغرافيا", "أي نهرين يمرّان بالعراق؟", ["دجلة والفرات", "النيل والأردن", "العاصي والليطاني", "بردى والنيل"], 0],
  [2, "جغرافيا", "ما المضيق الذي يفصل عُمان عن إيران؟", ["باب المندب", "هرمز", "جبل طارق", "البوسفور"], 1], [2, "جغرافيا", "ما أكبر محيط في العالم؟", ["الأطلسي", "الهندي", "الهادي", "المتجمد الشمالي"], 2],
  [2, "جغرافيا", "ما عاصمة الأردن؟", ["عمّان", "إربد", "العقبة", "الزرقاء"], 0], [2, "جغرافيا", "ما أطول نهر في العالم حسب المشهور؟", ["الأمازون", "النيل", "الفرات", "المسيسيبي"], 1],
  [2, "الخليج", "كم عدد دول مجلس التعاون الخليجي؟", ["٤", "٥", "٦", "٧"], 2], [2, "بلادي", "أي مدينة تُلقّب بـ«عروس البحر الأحمر»؟", ["ينبع", "جدة", "جازان", "الوجه"], 1],
  [2, "بلادي", "ما اسم الموقع الأثري المشهور في العُلا؟", ["البتراء", "الحِجر", "تدمر", "جرش"], 1], [2, "بلادي", "متى يوم التأسيس السعودي؟", ["٢٢ فبراير", "٢٣ سبتمبر", "١ يناير", "٩ أغسطس"], 0],
  [2, "عامة", "كم يومًا في السنة الكبيسة؟", ["٣٦٤", "٣٦٥", "٣٦٦", "٣٦٠"], 2], [2, "عامة", "كم لونًا في قوس قزح؟", ["٥", "٦", "٧", "٨"], 2],
  [2, "ألغاز", "شيء كلما أخذت منه كبر، ما هو؟", ["البحر", "الحفرة", "الكيس", "البالون"], 1], [2, "ألغاز", "شيء تكسره دون أن تلمسه، ما هو؟", ["الزجاج", "البيض", "الوعد", "القلم"], 2],
  [2, "رياضيات", "كم يساوي ٩ × ٨؟", ["٦٢", "٧٢", "٨١", "٦٤"], 1], [2, "حيوانات", "ما أسرع حيوان بري؟", ["الأسد", "الفهد", "الحصان", "الغزال"], 1],
  [2, "كورة", "في أي سنة ستستضيف السعودية كأس العالم؟", ["٢٠٣٠", "٢٠٣٤", "٢٠٢٦", "٢٠٣٨"], 1], [2, "لغتي", "ما جمع كلمة «قلم»؟", ["أقلام", "قلمات", "قلوم", "مقالم"], 0],
].map(([lv, c, q, o, a]) => ({ lv, c, q, o, a }));
const ldTeamOf = (S, id) => (S.lt || {})[id] ?? -1;
const ldStepWord = (n) => (n === 1 ? "خطوة" : n === 2 ? "خطوتين" : `${AR(n)} خطوات`);
const ldLen = (S) => LD_LEN[S.len] || LD_LEN[1];
// where a choice lands: a ladder or a snake fires on the tile it reaches
function ldLanding(pos, s) {
  const n = pos + s; if (n > 100) return null;
  if (LD_LAD[n] !== undefined) return { n, k: "lad", i: LD_LAD[n], end: LD_LADDERS[LD_LAD[n]].b };
  if (LD_SNK[n] !== undefined) return { n, k: "snk", i: LD_SNK[n], end: LD_SNAKES[LD_SNK[n]].b };
  return { n, k: n === 100 ? "win" : "", end: n };
}
function ldLandText(L) {
  if (!L) return "تعدّي ١٠٠";
  if (L.k === "lad") return `سلّم ${LD_LADDERS[L.i].v}، تطلعون إلى ${AR(L.end)}`;
  if (L.k === "snk") return `ثعبان ${LD_SNAKES[L.i].v}، تنزلون إلى ${AR(L.end)}`;
  if (L.k === "win") return "١٠٠، تفوزون!";
  return "خانة عادية";
}

// ---------------- the board, drawn once as SVG: tile 1 bottom right, rows winding up ----------------
const LD_INK = "#1b2a4a", LD_GREEN = "#1f7a52", LD_RED = "#e5484d", LD_AMBER = "#c98a12";
const LD_PAL = [["#9be7a0", "#2f9e6f"], ["#c9a7ff", "#6b4aa8"], ["#e5484d", "#a81d25"], ["#9fd3ff", "#3d7aa0"], ["#ffc933", "#c98a12"], ["#ff9fb2", "#d8406e"], ["#7ee0d0", "#2a979d"]];
const LD_TILE = ["#ffeeb8", "#fffdf6", "#ffe39a", "#fff6dc"];
const LD_OFF = [[-24, 0], [24, 0], [-24, 26], [24, 26], [0, 0], [0, 26]];
function ldXY(n) { const i = n - 1, r = Math.floor(i / 10), c = i % 10; return { x: (r % 2 === 0 ? 9 - c : c) * 100 + 50, y: (9 - r) * 100 + 50 }; }
const ldSpot = (t, n) => { const p = ldXY(n), o = LD_OFF[t % LD_OFF.length]; return { x: p.x + o[0], y: p.y + o[1] }; };
function ldSnakePts(H, L, amp = 26, n = 48) {
  const dx = L.x - H.x, dy = L.y - H.y, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, waves = Math.max(1.2, len / 230), pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n, o = Math.sin(t * Math.PI * 2 * waves) * amp * Math.min(1, t / 0.12); pts.push({ x: H.x + dx * t + nx * o, y: H.y + dy * t + ny * o }); }
  return pts;
}
function ldSnake(H, L, pal, amp = 26, wid = 34) {
  const P = ldSnakePts(H, L, amp), n = P.length - 1, lf = [], rt = [], w = (i) => (wid * (1 - 0.78 * (i / n))) / 2 + 1.5;
  for (let i = 0; i <= n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n, i + 1)]; let tx = b.x - a.x, ty = b.y - a.y; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    lf.push(`${(P[i].x - ty * w(i)).toFixed(1)} ${(P[i].y + tx * w(i)).toFixed(1)}`); rt.push(`${(P[i].x + ty * w(i)).toFixed(1)} ${(P[i].y - tx * w(i)).toFixed(1)}`);
  }
  let spots = ""; for (let i = 5; i < n - 3; i += 5) spots += `<circle cx="${P[i].x.toFixed(1)}" cy="${P[i].y.toFixed(1)}" r="${(w(i) * 0.38).toFixed(1)}" fill="${pal[1]}"/>`;
  const ang = (Math.atan2(P[0].y - P[3].y, P[0].x - P[3].x) * 180) / Math.PI, s = (k) => (wid * k).toFixed(1);
  const head = `<path d="M${s(0.95)} 0h${s(0.5)}l${s(0.22)} -${s(0.2)}M${s(1.45)} 0l${s(0.22)} ${s(0.2)}" stroke="#ff4d6d" stroke-width="${s(0.1)}" fill="none" stroke-linecap="round"/><ellipse cx="${s(0.25)}" cy="0" rx="${s(0.8)}" ry="${s(0.66)}" fill="${pal[0]}" stroke="${LD_INK}" stroke-width="${s(0.13)}"/><circle cx="${s(0.5)}" cy="-${s(0.3)}" r="${s(0.2)}" fill="#fff" stroke="${LD_INK}" stroke-width="${s(0.07)}"/><circle cx="${s(0.5)}" cy="${s(0.3)}" r="${s(0.2)}" fill="#fff" stroke="${LD_INK}" stroke-width="${s(0.07)}"/><circle cx="${s(0.58)}" cy="-${s(0.3)}" r="${s(0.1)}" fill="${LD_INK}"/><circle cx="${s(0.58)}" cy="${s(0.3)}" r="${s(0.1)}" fill="${LD_INK}"/>`;
  return `<g><path d="M${lf.join("L")}L${rt.reverse().join("L")}Z" fill="${pal[0]}" stroke="${LD_INK}" stroke-width="${s(0.13)}" stroke-linejoin="round"/>${spots}<g transform="translate(${P[0].x.toFixed(1)} ${P[0].y.toFixed(1)}) rotate(${ang.toFixed(1)})">${head}</g></g>`;
}
function ldLadder(B, T, half = 17, sw = 8) {
  const dx = T.x - B.x, dy = T.y - B.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy * half, ny = ux * half, f = (v) => v.toFixed(1);
  const L1 = `M${f(B.x + nx)} ${f(B.y + ny)}L${f(T.x + nx)} ${f(T.y + ny)}`, L2 = `M${f(B.x - nx)} ${f(B.y - ny)}L${f(T.x - nx)} ${f(T.y - ny)}`;
  let r = ""; for (let s = 22; s < len - 10; s += 34) { const x = B.x + ux * s, y = B.y + uy * s; r += `M${f(x + nx)} ${f(y + ny)}L${f(x - nx)} ${f(y - ny)}`; }
  return `<g stroke-linecap="round" fill="none"><path d="${L1}${L2}${r}" stroke="${LD_INK}" stroke-width="${sw + 6}"/><path d="${r}" stroke="#fff6dc" stroke-width="${sw - 1}"/><path d="${L1}${L2}" stroke="${LD_AMBER}" stroke-width="${sw}"/></g>`;
}
const ldPill = (x, y, txt, fill, fs = 19) => { const w = txt.length * fs * 0.56 + 22; return `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="${-fs * 0.75}" width="${w}" height="${fs * 1.45}" rx="${fs * 0.72}" fill="${fill}" stroke="${LD_INK}" stroke-width="3"/><text y="${fs * 0.36}" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="${fs}" fill="#fff">${txt}</text></g>`; };
const ldStar = (x, y, r) => { let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? "L" : "M"}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`; } return `<path d="${d}Z" fill="#fff" stroke="${LD_INK}" stroke-width="4" stroke-linejoin="round"/>`; };
// the fixed part of the board is the same every time, so it's built once
const LD_BASE = (() => {
  let g = `<rect x="-14" y="-14" width="1028" height="1028" rx="40" fill="${LD_INK}"/><rect width="1000" height="1000" rx="30" fill="#fff6dc"/>`;
  for (let n = 1; n <= 100; n++) {
    const { x, y } = ldXY(n), r = Math.floor((n - 1) / 10), c = (n - 1) % 10;
    g += `<rect x="${x - 46}" y="${y - 46}" width="92" height="92" rx="16" fill="${n === 100 ? "#ffc933" : LD_TILE[(r + c) % 2 ? (r % 2 ? 1 : 3) : r % 2 ? 0 : 2]}"/>`;
    if (n !== 100) g += `<text x="${x + 30}" y="${y - 22}" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-weight="700" font-size="22" fill="${LD_INK}" opacity=".62">${AR(n)}</text>`;
  }
  const t1 = ldXY(1), t100 = ldXY(100);
  g += `<text x="${t1.x}" y="${t1.y + 34}" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="22" fill="${LD_GREEN}">ابدأ</text>`;
  g += ldStar(t100.x, t100.y - 6, 34) + `<text x="${t100.x}" y="${t100.y + 38}" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="24" fill="${LD_INK}">${AR(100)}</text>`;
  LD_LADDERS.forEach((L) => (g += ldLadder(ldXY(L.a), ldXY(L.b))));
  LD_SNAKES.forEach((S, k) => (g += ldSnake(ldXY(S.a), ldXY(S.b), LD_PAL[k % LD_PAL.length])));
  LD_LADDERS.forEach((L) => { const p = ldXY(L.a); g += ldPill(p.x, p.y + 30, L.v, LD_GREEN); });
  LD_SNAKES.forEach((S) => { const p = ldXY(S.a); g += ldPill(p.x, p.y + 32, S.v, LD_RED); });
  return g;
})();
// a team's piece: its own sticky note with a face, no arms or legs
const LD_FACE = [[1, 1], [4, 0], [3, 1], [0, 5], [2, 0], [3, 3]];
const ldNote = (t) => { const [e, m] = LD_FACE[t % 6]; return `<g transform="rotate(${t % 2 ? 4 : -4} 50 50)"><path d="M12 12h76v64L74 90H12z" fill="${LD_TEAMS[t].note}" stroke="${LD_INK}" stroke-width="5" stroke-linejoin="round"/><path d="M88 76L74 90V76z" fill="rgba(0,0,0,.2)"/><path d="M12 12h76v7H12z" fill="rgba(0,0,0,.08)"/>${EYES[e].s}${MOUTHS[m].s}</g>`; };
const ldPiece = (t) => `<ellipse cx="0" cy="6" rx="16" ry="4" fill="#000" opacity=".18"/><g transform="translate(-23 -40) scale(.46)">${ldNote(t)}</g>`;
const ldIcon = (t, s = 26) => `<svg class="ld-ic" viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true">${ldNote(t)}</svg>`;
// o.at = positions to draw instead of S.pos (the start of an animation); o.hl = tiles to ring
function ldBoard(S, o = {}) {
  const at = o.at || {};
  const ring = (o.hl || []).map((n) => { const p = ldXY(n); return `<rect class="ld-ring" x="${p.x - 46}" y="${p.y - 46}" width="92" height="92" rx="16" fill="none" stroke="${o.hc || LD_INK}" stroke-width="8"/>`; }).join("");
  const order = S.teams.slice().sort((a, b) => (S.cur && S.cur.t === a ? 1 : 0) - (S.cur && S.cur.t === b ? 1 : 0));
  const pieces = order.map((t) => { const p = ldSpot(t, at[t] ?? S.pos[t]); return `<g data-lp="${t}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})">${ldPiece(t)}</g>`; }).join("");
  return `<svg class="ld-board ${o.cls || ""}" viewBox="-14 -14 1028 1028" role="img" aria-label="لوح سلّم القيم">${LD_BASE}${ring}${pieces}</svg>`;
}
// the moving piece starts where the step began and travels to where the host already put it
const LD_MOVES = ["walk", "lad", "slide"];
const ldStartAt = (S, fresh) => { const c = S.cur; return fresh && c && LD_MOVES.includes(c.kind) && S.phase === "move" ? { [c.t]: c.a } : {}; };
function ldAnimate(root, S, fresh) {
  const c = S.cur; if (!fresh || !c || S.phase !== "move" || !LD_MOVES.includes(c.kind)) return;
  const g = root && root.querySelector(`[data-lp="${c.t}"]`); if (!g) return;
  const set = (p) => g.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
  const run = (dur, fn) => new Promise((ok) => { const st = performance.now(); const f = (n) => { if (!g.isConnected) return ok(); const k = Math.min(1, (n - st) / dur); fn(k); if (k < 1) requestAnimationFrame(f); else ok(); }; requestAnimationFrame(f); });
  const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  (async () => {
    if (c.kind === "walk") for (let n = c.a; n < c.b; n++) { const A = ldSpot(c.t, n), B = ldSpot(c.t, n + 1); await run(300, (k) => { const e = ease(k); set({ x: A.x + (B.x - A.x) * e, y: A.y + (B.y - A.y) * e - Math.sin(Math.PI * k) * 34 }); }); }
    else if (c.kind === "lad") { const A = ldSpot(c.t, c.a), B = ldSpot(c.t, c.b); await run(1200, (k) => { const e = ease(k); set({ x: A.x + (B.x - A.x) * e, y: A.y + (B.y - A.y) * e }); }); }
    else {
      const o = LD_OFF[c.t % LD_OFF.length], P = ldSnakePts(ldXY(c.a), ldXY(c.b)).map((p) => ({ x: p.x + o[0] * 0.4, y: p.y + o[1] * 0.4 })), n = P.length - 1, end = ldSpot(c.t, c.b);
      await run(1500, (k) => { const e = k * k * (3 - 2 * k), f = e * n, i = Math.min(n - 1, Math.floor(f)), r = f - i; set({ x: P[i].x + (P[i + 1].x - P[i].x) * r, y: P[i].y + (P[i + 1].y - P[i].y) * r }); });
      await run(250, (k) => set({ x: P[n].x + (end.x - P[n].x) * k, y: P[n].y + (end.y - P[n].y) * k }));
    }
  })();
}

ROOM_GAMES.ladder = {
  name: "سلّم القيم", theme: "ladder", min: 2, need: "يحتاج لاعب في فريقين على الأقل", who: "٢ إلى ٦ فرق · لوح وأسئلة وقيم",
  rules: [
    "لوح فيه ١٠٠ خانة: السلالم قيم طيبة، والثعابين عادات سيئة. أول فريق يوصل ١٠٠ بالضبط يفوز.",
    "ما فيه نرد. كل جولة سؤال واحد لكل الفرق مع بعض، وجواب الأغلبية في الفريق هو جوابه.",
    "الجواب الصح: الفريق يختار كم خطوة يمشي. أسرع فريق جاوب صح يقدر يمشي أكثر.",
    "الجواب الغلط: خطوة وحدة بس.",
    "السلّم يطلّعكم فوق ويطلع معه درس قصير. الثعبان ينزّلكم ومعه بطاقة تقول ليش نتركها.",
    "على راس ثعبان؟ تقدرون تستخدمون فرصة نجاة: سؤال سريع لفريقكم وحده، صح وتبقون مكانكم.",
    "آخر اللوح: الخطوات اللي تعدّي ١٠٠ ما تنفع، فاحسبوها زين.",
  ],
  setup(S) {
    Object.assign(S, { nt: 2, len: 1, chances: 2, aud: 1, qtime: 20 });
    H.lt ||= {};
    H.players.forEach((p) => { if (H.lt[p.id] === undefined) ROOM_GAMES.ladder.joined(p.id); });
  },
  joined(id) { const S = H.S, n = (t) => Object.values(H.lt).filter((x) => x === t).length; let best = 0; for (let t = 1; t < (S.nt || 2); t++) if (n(t) < n(best)) best = t; H.lt[id] = best; },
  left(id) { delete H.lt[id]; },
  snap(S) {
    S.lt = {}; H.players.forEach((p) => (S.lt[p.id] = Math.min(H.lt[p.id] ?? 0, (S.nt || 2) - 1)));
    S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
  },
  key: (S) => `${S.sid || ""}:${S.phase}:${S.round || 0}:${S.cur ? S.cur.n : ""}:${S.esc ? S.esc.stage : ""}`,
  on(m) {
    const S = H.S, Z = H.ld, t = H.lt[m.id];
    if (!Z || !m.id) return;
    if (m.t === "ldwho") return ldTellTeam(t);
    if (t === undefined || !S.teams || !S.teams.includes(t)) return;
    const k = m.k;
    if (m.t === "ldvote" && S.phase === "q" && Number.isInteger(k) && k >= 0 && k < S.q.o.length) {
      Z.votes[m.id] = { k, at: now() - Z.qStart };
      S.done[t] = ldMembers(t).filter((id) => Z.votes[id]).length;
      ldTellTeam(t); hostSendSoon();
      if (ldAll(S.teams, Z.votes)) H.deadline = Math.min(H.deadline, now() + 600);
      return;
    }
    if (m.t === "ldstep" && S.phase === "pick" && S.res[t] && S.res[t].right && Number.isInteger(k) && k >= 1 && k <= S.res[t].max) {
      Z.steps[m.id] = k;
      S.done[t] = ldMembers(t).filter((id) => Z.steps[id]).length;
      ldTellTeam(t); hostSendSoon();
      if (ldAll(S.teams.filter((x) => S.res[x].right), Z.steps)) H.deadline = Math.min(H.deadline, now() + 600);
      return;
    }
    if (S.phase !== "esc" || !S.esc || t !== S.esc.t) return;
    if (m.t === "ldesc" && S.esc.stage === "ask") { Z.ask[m.id] = !!m.on; ldTellTeam(t); if (ldAll([t], Z.ask)) H.deadline = Math.min(H.deadline, now() + 400); return; }
    if (m.t === "ldeq" && S.esc.stage === "q" && Number.isInteger(k) && k >= 0 && k < S.esc.q.o.length) { Z.eq[m.id] = k; ldTellTeam(t); if (ldAll([t], Z.eq)) H.deadline = Math.min(H.deadline, now() + 400); }
  },
  direct(m) { if (m.t === "ldme") { KL.my.ld = m; const v = ROOM_GAMES.ladder.views[KL.S && KL.S.phase]; if (v && KL.S.game === "ladder") v(KL.S, false); } },
  lobbyPlayers(S) {
    const col = (t) => `<div class="kl-team" style="color:${LD_TEAMS[t].c}"><b class="ld-tname">${ldIcon(t, 22)}الفريق ${LD_TEAMS[t].n}</b>${S.players.filter((p) => ldTeamOf(S, p.id) === t).map((p) => `<button type="button" class="kl-p" data-lsw="${esc(p.id)}" ${isHost() ? "" : "disabled"}>${face(p, 30)}<span>${esc(p.name)}${p.id === PID ? " (أنت)" : ""}</span></button>`).join("") || '<span class="muted">…</span>'}</div>`;
    return `<p class="muted" style="font-weight:700;color:var(--soft)">الفرق (${AR(S.players.length)} لاعب)${isHost() ? " · اضغط على لاعب ينقله للفريق اللي بعده" : ""}</p><div class="kl-teams">${Array.from({ length: S.nt }, (_, t) => col(t)).join("")}</div>`;
  },
  lobby(S) {
    const chips = (attr, list, cur, lab) => `<div class="chips pick">${list.map((v) => `<button type="button" class="chip" data-${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${lab(v)}</button>`).join("")}</div>`;
    const h = (t) => `<p class="muted" style="font-weight:700;color:var(--soft)">${t}</p>`;
    return `${h("كم فريق؟")}${chips("lnt", [2, 3, 4, 5, 6], S.nt, (v) => AR(v))}
      ${h("مدة اللعبة")}${chips("llen", [1, 0], S.len, (v) => `${LD_LEN[v].n}`)}<p class="muted">${LD_LEN[S.len].d}. والغلط خطوة وحدة.</p>
      ${h("فرص النجاة من الثعبان")}${chips("lesc", [2, 3, 0], S.chances, (v) => (v ? `${AR(v)} لكل فريق` : "بدون"))}
      ${h("الجمهور")}${chips("laud", [0, 1, 2], S.aud, (v) => LD_AUD[v])}
      ${h("وقت الإجابة")}${chips("lqt", [15, 20, 30], S.qtime, (v) => `${AR(v)} ثانية`)}`;
  },
  bindLobby(S) {
    const set = (attr, key) => screen.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { H.S[key] = +b.dataset[attr]; beep(700, 0.04); if (key === "nt") H.players.forEach((p, k) => (H.lt[p.id] = k % H.S.nt)); hostSend(); }));
    set("lnt", "nt"); set("llen", "len"); set("lesc", "chances"); set("laud", "aud"); set("lqt", "qtime");
    screen.querySelectorAll("[data-lsw]").forEach((b) => (b.onclick = () => { const id = b.dataset.lsw; H.lt[id] = ((H.lt[id] ?? 0) + 1) % H.S.nt; beep(640, 0.04); hostSend(); }));
    if (new Set(Object.values(S.lt || {})).size < 2) $("start").disabled = true;
  },
  start: () => ldStart(),
  resume(S) {
    const back = { q: () => hEvery(() => { if (now() >= H.deadline) ldReveal(); }, 200), rev: () => hLater(ldPick, 2500), pick: () => hEvery(() => { if (now() >= H.deadline) ldMove(); }, 200),
      esc: () => (S.esc && S.esc.stage === "res" ? hLater(ldEscDone, 2500) : hEvery(() => { if (now() >= H.deadline) (S.esc.stage === "ask" ? ldEscDecide() : ldEscAnswer()); }, 200)),
      move: () => hLater(S.cur && S.cur.kind === "walk" ? ldLanded : ldNextMove, 1500) };
    if (back[S.phase]) back[S.phase]();
    S.teams && S.teams.forEach((t) => ldTellTeam(t));
  },
  views: { q: ldvQ, rev: ldvRev, pick: ldvPick, move: ldvMove, esc: ldvEsc, end: ldvEnd },
};

// ---------------- the host ----------------
function ldTell(id, m) { m.to = id; if (id === PID) ROOM_GAMES.ladder.direct(m); else if (KL.net) KL.net.send(m); }
const ldMembers = (t) => H.players.map((p) => p.id).filter((id) => H.lt[id] === t);
const ldAll = (teams, votes) => teams.every((t) => ldMembers(t).every((id) => votes[id] !== undefined));
// what one team sees of its own votes: how many picked each answer, each step, use or skip
function ldTellTeam(t) {
  const S = H.S, Z = H.ld; if (!Z || t === undefined || !S.teams || !S.teams.includes(t)) return;
  const mem = ldMembers(t), count = (src, n, off = 0) => { const a = Array(n).fill(0); mem.forEach((id) => { const v = src[id]; if (v !== undefined) a[(typeof v === "object" ? v.k : +v) - off]++; }); return a; };
  const m = { t: "ldme", sid: S.sid, team: t,
    qt: S.q ? count(Z.votes, S.q.o.length) : null,
    st: S.res && S.res[t] && S.res[t].right ? count(Z.steps, S.res[t].max, 1) : null,
    ask: S.esc && S.esc.t === t ? [mem.filter((id) => Z.ask[id] === true).length, mem.filter((id) => Z.ask[id] === false).length] : null,
    eq: S.esc && S.esc.t === t && S.esc.q ? count(Z.eq, S.esc.q.o.length) : null };
  mem.forEach((id) => ldTell(id, { ...m }));
}
function ldQuestion() {
  const S = H.S, pool = LD_QS.filter((q) => (S.aud === 0 ? q.lv === 1 : S.aud === 2 ? q.lv === 2 : true));
  let fresh = pool.filter((q) => !H.ldUsed.includes(q.q)); if (!fresh.length) { H.ldUsed = []; fresh = pool; }
  const q = pickOne(fresh); H.ldUsed.push(q.q);
  const order = shuffled([0, 1, 2, 3]);
  return { q: q.q, cat: q.c, o: order.map((k) => q.o[k]), a: order.indexOf(q.a) };
}
function ldStart() {
  hClear();
  const S = H.S;
  const teams = [...new Set(H.players.map((p) => H.lt[p.id] ?? 0))].filter((t) => t < S.nt).sort();
  H.ld = { votes: {}, steps: {}, ask: {}, eq: {}, a: -1, ea: -1, qStart: 0, queue: [], cid: 0 };
  H.ldUsed ||= [];
  Object.assign(S, { sid: Math.random().toString(36).slice(2, 8), phase: "q", teams, round: 0, pos: Array(S.nt).fill(1), shields: Array(S.nt).fill(S.chances), vals: Array.from({ length: S.nt }, () => []), habits: Array.from({ length: S.nt }, () => []), res: null, steps: null, cur: null, esc: null, won: -1 });
  ldAsk();
}
function ldAsk() {
  hClear();
  const S = H.S, Z = H.ld;
  if (S.round >= 60) return ldEnd(S.teams.slice().sort((x, y) => S.pos[y] - S.pos[x])[0], true);
  S.round++;
  const d = ldQuestion();
  Z.a = d.a; Z.votes = {}; Z.steps = {}; Z.qStart = now();
  Object.assign(S, { phase: "q", q: { q: d.q, o: d.o, cat: d.cat }, answer: -1, done: Array(S.nt).fill(0), res: null, steps: null, cur: null, esc: null, qT: S.qtime * 1000 });
  H.deadline = now() + S.qT;
  hostSend();
  S.teams.forEach((t) => ldTellTeam(t));
  hEvery(() => { if (now() >= H.deadline) ldReveal(); }, 200);
}
// each team's majority; a team is as fast as its last vote, so the whole team has to agree quickly
function ldReveal() {
  hClear();
  const S = H.S, Z = H.ld;
  S.res = Array(S.nt).fill(null);
  S.teams.forEach((t) => {
    const mem = ldMembers(t), vs = mem.map((id) => Z.votes[id]).filter(Boolean), tally = S.q.o.map(() => 0);
    vs.forEach((v) => tally[v.k]++);
    const k = vs.length ? argmax(tally) : -1, all = vs.length === mem.length && mem.length > 0;
    S.res[t] = { k, right: k === Z.a, fast: false, at: all ? Math.max(...vs.map((v) => v.at)) : 1e12, max: 1 };
  });
  const right = S.teams.filter((t) => S.res[t].right).sort((x, y) => S.res[x].at - S.res[y].at);
  if (right.length) S.res[right[0]].fast = true;
  S.teams.forEach((t) => { const r = S.res[t], L = ldLen(S); r.max = Math.max(1, Math.min(r.right ? (r.fast ? L.f : L.r) : 1, 100 - S.pos[t])); delete r.at; });
  S.answer = Z.a; S.phase = "rev"; H.deadline = 0;
  hostSend();
  hLater(ldPick, 4200);
}
function ldPick() {
  hClear();
  const S = H.S, Z = H.ld;
  S.steps = S.teams.reduce((a, t) => ((a[t] = S.res[t].right ? 0 : 1), a), Array(S.nt).fill(0));
  if (!S.teams.some((t) => S.res[t].right)) return ldMove();
  Z.steps = {}; S.done = Array(S.nt).fill(0);
  S.phase = "pick"; H.deadline = now() + 25000;
  hostSend();
  S.teams.forEach((t) => ldTellTeam(t));
  hEvery(() => { if (now() >= H.deadline) ldMove(); }, 200);
}
// a team that doesn't agree in time takes the best step on the board
function ldBest(S, t) {
  let best = 1, sc = -1e9;
  for (let s = 1; s <= S.res[t].max; s++) { const L = ldLanding(S.pos[t], s); if (!L) continue; const v = L.k === "win" ? 1e6 : L.k === "snk" ? (S.shields[t] ? 0.55 * L.n + 0.45 * L.end - 3 : L.end) : L.end; if (v > sc) { sc = v; best = s; } }
  return best;
}
function ldMove() {
  hClear();
  const S = H.S, Z = H.ld;
  S.teams.forEach((t) => {
    if (!S.res[t].right) return;
    const tally = Array(S.res[t].max).fill(0); ldMembers(t).forEach((id) => { if (Z.steps[id]) tally[Z.steps[id] - 1]++; });
    S.steps[t] = tally.some((x) => x) ? argmax(tally) + 1 : ldBest(S, t);
  });
  Z.queue = S.teams.slice().sort((x, y) => (S.res[y].fast ? 1 : 0) - (S.res[x].fast ? 1 : 0) || x - y);
  ldNextMove();
}
function ldNextMove() {
  hClear();
  const S = H.S, Z = H.ld;
  const t = Z.queue.shift();
  if (t === undefined) return ldAsk();
  const a = S.pos[t], b = Math.min(100, a + S.steps[t]);
  S.pos[t] = b;
  S.cur = { t, kind: "walk", a, b, n: ++Z.cid };
  S.phase = "move"; S.esc = null; H.deadline = 0;
  hostSend();
  hLater(ldLanded, 330 * (b - a) + 900);
}
function ldLanded() {
  hClear();
  const S = H.S, Z = H.ld, t = S.cur.t, p = S.pos[t];
  if (p === 100) { S.cur = { t, kind: "win", a: p, b: p, n: ++Z.cid }; hostSend(); return hLater(() => ldEnd(t, false), 2600); }
  if (LD_LAD[p] !== undefined) {
    const i = LD_LAD[p], L = LD_LADDERS[i];
    S.pos[t] = L.b; S.vals[t].push(i);
    S.cur = { t, kind: "lad", a: L.a, b: L.b, i, n: ++Z.cid };
    hostSend();
    return hLater(() => ldCard(t, "lad", i, false), 1700);
  }
  if (LD_SNK[p] !== undefined) {
    const i = LD_SNK[p];
    if (S.chances && S.shields[t] > 0) return ldEscAsk(t, i);
    return ldSlide(t, i);
  }
  hLater(ldNextMove, 500);
}
function ldCard(t, kind, i, saved) {
  hClear();
  const S = H.S, Z = H.ld;
  S.phase = "move"; S.esc = null;
  S.cur = { t, kind: "card", ck: kind, i, saved, n: ++Z.cid };
  hostSend();
  hLater(ldNextMove, 6000);
}
function ldSlide(t, i) {
  hClear();
  const S = H.S, Z = H.ld, sn = LD_SNAKES[i];
  S.pos[t] = sn.b; S.habits[t].push({ i, saved: false });
  S.phase = "move"; S.esc = null;
  S.cur = { t, kind: "slide", a: sn.a, b: sn.b, i, n: ++Z.cid };
  hostSend();
  hLater(() => ldCard(t, "snk", i, false), 2100);
}
// on a snake's head: the team decides whether to spend an escape chance
function ldEscAsk(t, i) {
  hClear();
  const S = H.S, Z = H.ld;
  Z.ask = {}; Z.eq = {};
  S.phase = "esc"; S.esc = { t, i, stage: "ask" };
  H.deadline = now() + 15000;
  hostSend(); ldTellTeam(t);
  hEvery(() => { if (now() >= H.deadline) ldEscDecide(); }, 200);
}
function ldEscDecide() {
  hClear();
  const S = H.S, Z = H.ld, t = S.esc.t, mem = ldMembers(t);
  const yes = mem.filter((id) => Z.ask[id] === true).length, no = mem.filter((id) => Z.ask[id] === false).length;
  if (no > yes) return ldSlide(t, S.esc.i);
  S.shields[t]--;
  const d = ldQuestion();
  Z.ea = d.a; Z.eq = {};
  S.esc = { ...S.esc, stage: "q", q: { q: d.q, o: d.o, cat: d.cat }, qT: 10000 };
  H.deadline = now() + 10000;
  hostSend(); ldTellTeam(t);
  hEvery(() => { if (now() >= H.deadline) ldEscAnswer(); }, 200);
}
function ldEscAnswer() {
  hClear();
  const S = H.S, Z = H.ld, t = S.esc.t, tally = S.esc.q.o.map(() => 0);
  ldMembers(t).forEach((id) => { if (Z.eq[id] !== undefined) tally[Z.eq[id]]++; });
  const k = tally.some((x) => x) ? argmax(tally) : -1;
  S.esc = { ...S.esc, stage: "res", k, a: Z.ea, ok: k === Z.ea };
  H.deadline = 0;
  hostSend(); ldTellTeam(t);
  hLater(ldEscDone, 3000);
}
function ldEscDone() {
  hClear();
  const S = H.S, e = S.esc;
  if (!e) return ldNextMove();
  if (e.ok) { S.habits[e.t].push({ i: e.i, saved: true }); return ldCard(e.t, "snk", e.i, true); }
  ldSlide(e.t, e.i);
}
function ldEnd(t, byRounds) {
  hClear();
  const S = H.S;
  S.won = t; S.byRounds = !!byRounds;
  S.rank = S.teams.slice().sort((x, y) => (y === t) - (x === t) || S.pos[y] - S.pos[x]);
  S.phase = "end"; S.cur = null; S.esc = null; H.deadline = 0;
  hostSend();
}

// ---------------- every phone ----------------
const ldMine = () => { const m = KL.my.ld; return m && KL.S && m.sid === KL.S.sid ? m : null; };
function ldAsk4Me(S) { if (!ldMine() && ldTeamOf(S, PID) >= 0 && now() - (KL.my.ldAskedAt || 0) > 2500) { KL.my.ldAskedAt = now(); act({ t: "ldwho", id: PID }); } }
function ldTick() {
  klEvery(() => {
    const s = KL.S; if (!s || s.game !== "ladder") return;
    const el = $("ldLeft"); if (el) el.textContent = AR(Math.ceil(leftOf(s.left) / 1000));
    const bar = $("ldBar"), T = s.phase === "esc" && s.esc ? s.esc.qT || 15000 : s.phase === "pick" ? 25000 : s.qT;
    if (bar) bar.style.transform = `scaleX(${leftOf(s.left) / (T || 20000)})`;
  }, 250);
}
const ldShields = (S, t) => (S.chances && S.shields ? `<span class="ld-sh">${Array.from({ length: S.chances }, (_, k) => `<i class="${k < S.shields[t] ? "on" : ""}"></i>`).join("")}</span>` : "");
const ldChip = (t, extra = "") => `<span class="ld-chip ${extra}" style="--c:${LD_TEAMS[t].c}">${ldIcon(t, 20)}${LD_TEAMS[t].n}</span>`;
function ldScores(S, mine) {
  return `<div class="ld-scores">${S.teams.map((t) => `<div class="ld-sc ${t === mine ? "me" : ""} ${S.cur && S.cur.t === t ? "on" : ""}" style="--c:${LD_TEAMS[t].c}">${ldIcon(t, 24)}<b>${AR(S.pos[t])}</b>${ldShields(S, t)}<i style="width:${S.pos[t]}%"></i></div>`).join("")}</div>`;
}
const ldTimer = (S, T) => `<div class="ld-timer"><i id="ldBar" style="transform:scaleX(${leftOf(S.left) / T})"></i></div>`;
function ldValCard(kind, i, note = "", cls = "") {
  const it = kind === "lad" ? LD_LADDERS[i] : LD_SNAKES[i];
  return `<div class="ld-vc ${kind} ${cls}"><div class="hd"><span>${kind === "lad" ? "سلّم" : "ثعبان"}، من ${AR(it.a)} إلى ${AR(it.b)}</span><span>${note}</span></div><div class="bd"><b>${it.v}</b><span>${it.l}</span></div></div>`;
}
// «قيمنا»: what the team climbed and learned, folded under the board
function ldOurs(S, t) {
  if (t < 0) return "";
  const v = S.vals[t], h = S.habits[t];
  return `<details class="ld-ours"><summary>قيمنا (${AR(v.length)})</summary>${v.length ? v.slice().reverse().map((i) => ldValCard("lad", i)).join("") : '<p class="muted">ما طلعتوا سلّم للحين. كل سلّم قيمة تنحفظ هنا.</p>'}${h.length ? `<p class="muted" style="font-weight:700">دروس من الثعابين</p>${h.slice().reverse().map((x) => ldValCard("snk", x.i, x.saved ? "نجوتم" : "")).join("")}` : ""}</details>`;
}
function ldvShell(S, fresh, body, o = {}) {
  const t = ldTeamOf(S, PID);
  show(`${ldScores(S, t)}${o.top ? ldBoard(S, { at: ldStartAt(S, fresh), hl: o.hl, hc: o.hc }) + body : body + ldBoard(S, { hl: o.hl, hc: o.hc, cls: "small" })}${ldOurs(S, t)}`);
  ldAnimate(screen, S, fresh);
}
function ldvQ(S, fresh) {
  ldAsk4Me(S);
  const t = ldTeamOf(S, PID), mine = ldMine(), q = S.q;
  if (fresh) { clearKL(); KL.my.lv = undefined; ldTick(); beep(880, 0.08); buzz(40); }
  setTop(`الجولة ${AR(S.round)}`);
  const tally = mine && mine.qt, total = tally ? Math.max(1, tally.reduce((a, b) => a + b, 0)) : 1, playing = t >= 0 && S.teams.includes(t);
  ldvShell(S, fresh, `<div class="ld-card">
      <div class="ld-row"><span class="ld-kind">${esc(q.cat)}</span><span class="ld-clock"><span id="ldLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</span> ث</span></div>
      <div class="ld-qt">${esc(q.q)}</div>${ldTimer(S, S.qT)}
      ${q.o.map((o, k) => `<button type="button" class="ld-opt" data-lo="${k}" aria-pressed="${KL.my.lv === k}" ${playing ? "" : "disabled"}><i style="width:${tally ? Math.round((tally[k] / total) * 100) : 0}%"></i><span>${esc(o)}</span><small>${tally && tally[k] ? AR(tally[k]) : ""}</small></button>`).join("")}
    </div><p class="muted" style="text-align:center">${playing ? "جواب الأغلبية في فريقكم هو جوابكم. صح؟ تختارون كم خطوة تمشون." : "دخلت بعد البداية، تقدر تتفرج."}</p>
    <div class="ld-answered">${S.teams.map((x) => `<span>${ldChip(x)} ${AR(S.done[x] || 0)} من ${AR(S.players.filter((p) => ldTeamOf(S, p.id) === x).length)}</span>`).join("")}</div>`);
  screen.querySelectorAll("[data-lo]:not([disabled])").forEach((b) => (b.onclick = () => { KL.my.lv = +b.dataset.lo; beep(660, 0.05); act({ t: "ldvote", id: PID, k: KL.my.lv }); screen.querySelectorAll("[data-lo]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
}
function ldvRev(S, fresh) {
  const t = ldTeamOf(S, PID), r = t >= 0 && S.res ? S.res[t] : null;
  if (fresh) { clearKL(); if (r && r.right) { beep(784, 0.1); setTimeout(() => beep(988, 0.14), 110); } else if (r) beep(220, 0.25, "triangle"); }
  setTop("الجواب");
  const msg = !r ? "" : r.fast ? `الأسرع! حتى ${ldStepWord(r.max)}` : r.right ? `صح! من ١ إلى ${AR(r.max)}` : "خطأ… خطوة وحدة";
  ldvShell(S, fresh, `<div class="ld-card"><div class="ld-qt">${esc(S.q.q)}</div>${S.q.o.map((o, k) => `<div class="ld-opt ${k === S.answer ? "ok" : r && k === r.k ? "no" : ""}"><span>${esc(o)}</span></div>`).join("")}</div>
    ${r ? `<div class="ld-res ${r.right ? "ok" : "no"}">${msg}</div>` : ""}
    <div class="ld-feed">${S.teams.map((x) => `<div>${ldChip(x)}<b class="${S.res[x].right ? "ok" : "no"}">${S.res[x].right ? (S.res[x].fast ? `الأسرع · حتى ${AR(S.res[x].max)}` : `صح · حتى ${AR(S.res[x].max)}`) : "خطوة وحدة"}</b></div>`).join("")}</div>`);
}
function ldvPick(S, fresh) {
  ldAsk4Me(S);
  const t = ldTeamOf(S, PID), r = t >= 0 && S.res ? S.res[t] : null, mine = ldMine();
  if (fresh) { clearKL(); KL.my.ls = undefined; ldTick(); if (r && r.right) { beep(880, 0.1); buzz([60, 40, 60]); } }
  setTop("كم خطوة؟");
  if (!r || !r.right) {
    const L = r ? ldLanding(S.pos[t], 1) : null;
    return ldvShell(S, fresh, `<div class="ld-now">الفرق اللي جاوبت صح تختار الحين…</div>${L ? `<div class="ld-card"><b>خطوتكم الوحدة توديكم:</b> ${ldLandText(L)}</div>` : ""}`, { top: true, hl: L ? [L.n] : [], hc: r ? LD_TEAMS[t].c : null });
  }
  const tally = mine && mine.st, sel = KL.my.ls;
  const opts = Array.from({ length: r.max }, (_, k) => k + 1).map((s) => { const L = ldLanding(S.pos[t], s); return `<button type="button" class="ld-stp" data-ls="${s}" aria-pressed="${sel === s}"><span class="n">${AR(s)}</span><span>${ldStepWord(s)}${s > ldLen(S).r ? '<em class="ld-fast">للأسرع</em>' : ""}<small class="${L.k}">الخانة ${AR(L.n)}: ${ldLandText(L)}</small></span><b>${tally && tally[s - 1] ? AR(tally[s - 1]) : ""}</b></button>`; }).join("");
  ldvShell(S, fresh, `<div class="ld-row"><div class="ld-now">صح! كم خطوة تمشون؟ <b>من ١ إلى ${AR(r.max)}</b></div><span class="ld-clock"><span id="ldLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</span> ث</span></div>${ldTimer(S, 25000)}
    <div class="ld-steps">${opts}</div><p class="muted" style="text-align:center">الأغلبية تقرر. الأرقام جنب كل خيار: كم واحد من فريقكم اختاره.</p>`, { top: true, hl: sel ? [S.pos[t] + sel] : Array.from({ length: r.max }, (_, k) => S.pos[t] + k + 1), hc: LD_TEAMS[t].c });
  screen.querySelectorAll("[data-ls]").forEach((b) => (b.onclick = () => { KL.my.ls = +b.dataset.ls; beep(700, 0.05); act({ t: "ldstep", id: PID, k: KL.my.ls }); ldvPick(KL.S, false); }));
}
function ldvMove(S, fresh) {
  const t = ldTeamOf(S, PID), c = S.cur || {};
  if (fresh) {
    clearKL();
    if (c.kind === "walk") for (let k = 0; k < c.b - c.a; k++) setTimeout(() => beep(520 + k * 40, 0.05), k * 300);
    if (c.kind === "lad") { beep(660, 0.08); setTimeout(() => beep(880, 0.08), 200); setTimeout(() => beep(1046, 0.14), 400); }
    if (c.kind === "slide") { beep(440, 0.2, "triangle"); setTimeout(() => beep(300, 0.3, "triangle"), 250); if (c.t === t) buzz([80, 40, 80]); }
    if (c.kind === "win") { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); }
  }
  setTop("الحركة");
  const who = c.t !== undefined ? `الفريق ${LD_TEAMS[c.t].n}` : "", ours = c.t === t;
  let body = "";
  if (c.kind === "walk") body = `<div class="ld-now">${ours ? "دوركم! " : ""}${who} يمشي ${ldStepWord(c.b - c.a)}</div>`;
  else if (c.kind === "lad") body = `<div class="ld-now ok">${who} على سلّم ${LD_LADDERS[c.i].v}!</div>`;
  else if (c.kind === "slide") body = `<div class="ld-now no">${who} ينزل مع ثعبان ${LD_SNAKES[c.i].v}</div>`;
  else if (c.kind === "win") body = `<div class="ld-res ok">${who} وصل ١٠٠!</div>`;
  else if (c.kind === "card") body = `<div class="ld-now ${c.ck === "lad" ? "ok" : c.saved ? "" : "no"}">${ours ? (c.ck === "lad" ? "طلعتوا السلّم!" : c.saved ? "نجوتم، بس اقرأوا البطاقة" : "نزلتوا مع الثعبان…") : `${who}: ${c.ck === "lad" ? "طلع السلّم" : c.saved ? "نجا من الثعبان" : "نزل مع الثعبان"}`}</div>${ldValCard(c.ck, c.i, c.saved ? "نجوا" : "", "fresh")}`;
  ldvShell(S, fresh, body, { top: c.kind !== "card" });
}
function ldvEsc(S, fresh) {
  ldAsk4Me(S);
  const t = ldTeamOf(S, PID), e = S.esc, ours = e.t === t, mine = ldMine(), sn = LD_SNAKES[e.i];
  if (fresh) { clearKL(); KL.my.le = undefined; KL.my.lq = undefined; ldTick(); if (ours) { beep(880, 0.1); buzz([60, 40, 60]); } }
  setTop("فرصة النجاة");
  const who = `الفريق ${LD_TEAMS[e.t].n}`;
  if (!ours) return ldvShell(S, fresh, `<div class="ld-now">${who} على راس ثعبان ${sn.v}… ${e.stage === "ask" ? "يقررون يستخدمون فرصة نجاة؟" : e.stage === "q" ? "يجاوبون سؤال النجاة" : e.ok ? "نجوا!" : "ما ضبطت معهم"}</div>${e.stage === "q" ? `<div class="ld-card"><div class="ld-qt">${esc(e.q.q)}</div></div>` : ""}`, { top: true, hl: [sn.a], hc: LD_RED });
  if (e.stage === "ask") {
    const a = mine && mine.ask;
    return ldvShell(S, fresh, `<div class="ld-res no">راس ثعبان ${sn.v}!</div><p style="text-align:center;margin:0">ينزّلكم من ${AR(sn.a)} إلى ${AR(sn.b)}. عندكم ${AR(S.shields[t])} ${S.shields[t] === 1 ? "فرصة" : "فرص"} نجاة.</p>${ldTimer(S, 15000)}
      <button type="button" class="btn btn-marker" data-le="1" aria-pressed="${KL.my.le === true}">استخدموا فرصة نجاة${a && a[0] ? ` (${AR(a[0])})` : ""}</button>
      <button type="button" class="btn btn-ghost" data-le="0" aria-pressed="${KL.my.le === false}">ننزل ونخلّيها لثعبان أطول${a && a[1] ? ` (${AR(a[1])})` : ""}</button>
      <p class="muted" style="text-align:center">الفرصة سؤال سريع ١٠ ثواني لفريقكم وحده.</p>`, { top: true, hl: [sn.a], hc: LD_RED });
  }
  if (e.stage === "q") {
    const tally = mine && mine.eq;
    ldvShell(S, fresh, `<div class="ld-card"><div class="ld-row"><span class="ld-kind">سؤال النجاة</span><span class="ld-clock"><span id="ldLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</span> ث</span></div><div class="ld-qt">${esc(e.q.q)}</div>${ldTimer(S, 10000)}
      ${e.q.o.map((o, k) => `<button type="button" class="ld-opt" data-lq="${k}" aria-pressed="${KL.my.lq === k}"><span>${esc(o)}</span><small>${tally && tally[k] ? AR(tally[k]) : ""}</small></button>`).join("")}</div>`, { top: false });
    screen.querySelectorAll("[data-lq]").forEach((b) => (b.onclick = () => { KL.my.lq = +b.dataset.lq; beep(660, 0.05); act({ t: "ldeq", id: PID, k: KL.my.lq }); screen.querySelectorAll("[data-lq]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
    return;
  }
  ldvShell(S, fresh, `<div class="ld-res ${e.ok ? "ok" : "no"}">${e.ok ? "نجوتم! تبقون مكانكم" : "ما ضبطت… تنزلون"}</div><p class="muted" style="text-align:center">الجواب: ${esc(e.q.o[e.a])}</p>`, { top: true });
  if (fresh) e.ok ? beep(988, 0.15) : beep(220, 0.3, "triangle");
  return;
}
// the escape buttons are bound after every render of the ask stage
const ldBindEsc = () => screen.querySelectorAll("[data-le]").forEach((b) => (b.onclick = () => { KL.my.le = b.dataset.le === "1"; beep(700, 0.05); act({ t: "ldesc", id: PID, on: KL.my.le }); ldvEscBound(KL.S, false); }));
const ldvEscBound = (S, fresh) => { ldvEsc(S, fresh); ldBindEsc(); };
ROOM_GAMES.ladder.views.esc = ldvEscBound;
function ldvEnd(S, fresh) {
  const t = ldTeamOf(S, PID), w = S.won;
  if (fresh) { clearKL(); if (w === t) { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); } else beep(262, 0.4, "triangle", 0.12); }
  setTop("انتهت");
  show(`<div class="ld-win" style="--c:${LD_TEAMS[w].c}">${ldIcon(w, 72)}<b>${S.byRounds ? `خلصت الجولات! الأقرب ${LD_TEAMS[w].n}` : `فاز الفريق ${LD_TEAMS[w].n}!`}</b></div>
    <div class="ld-ranks">${S.rank.map((x, k) => `<div class="ld-rk ${x === t ? "me" : ""}"><span class="n">${AR(k + 1)}</span>${ldChip(x)}<b>الخانة ${AR(S.pos[x])}</b><div class="vs">${S.vals[x].map((i) => `<span>${LD_LADDERS[i].v}</span>`).join("") || '<span class="none">بدون سلالم</span>'}</div></div>`).join("")}</div>
    ${t >= 0 && S.vals[t] ? `${S.vals[t].length ? `<p class="muted" style="font-weight:700">قيمنا في هاللعبة</p>${S.vals[t].map((i) => ldValCard("lad", i)).join("")}` : ""}` : ""}
    <p class="muted" style="text-align:center">المحتوى تحت المراجعة الشرعية.</p>
    ${isHost() ? '<button type="button" class="btn btn-marker" id="ldAgain">لعبة جديدة بنفس الفرق</button>' : '<p class="muted" style="text-align:center">المضيف يقدر يبدأ لعبة جديدة.</p>'}
    <button type="button" class="btn btn-ghost" id="ldHome">رجوع لفسحة</button>`);
  if ($("ldAgain")) $("ldAgain").onclick = () => hostAgain();
  $("ldHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}

// ---------------- the big screen: the board on the right, what's happening on the left ----------------
ROOM_GAMES.ladder.tvTeams = (S) => Array.from({ length: S.nt || 2 }, (_, t) => ({ n: `الفريق ${LD_TEAMS[t].n}`, c: LD_TEAMS[t].c, ps: S.players.filter((p) => ldTeamOf(S, p.id) === t) }));
function ldTv(S, fresh, side, o = {}) {
  return {
    html: `<div class="ld-tv"><section class="ld-tvs">${side}<div class="ld-tvteams">${S.teams.map((t) => `<div class="ld-tvt ${S.cur && S.cur.t === t ? "on" : ""}" style="--c:${LD_TEAMS[t].c}">${ldIcon(t, 44)}<div><b>${LD_TEAMS[t].n}</b><small>الخانة ${AR(S.pos[t])}</small><i><u style="width:${S.pos[t]}%"></u></i></div><span>${o.status ? o.status(t) : ""}${ldShields(S, t)}</span></div>`).join("")}</div></section>
      <section class="ld-tvb">${ldBoard(S, { at: ldStartAt(S, fresh), hl: o.hl, hc: o.hc })}${o.over || ""}</section></div>`,
    after: () => ldAnimate($("tv"), S, fresh),
  };
}
const ldTvCard = (kind, i, head) => { const it = kind === "lad" ? LD_LADDERS[i] : LD_SNAKES[i]; return `<div class="ld-tvover"><div class="ld-vc big ${kind}"><div class="hd"><span>${head}</span></div><div class="bd"><b>${it.v}</b><span>${it.l}</span></div></div></div>`; };
ROOM_GAMES.ladder.tv = {
  q: (S, fresh) => ldTv(S, fresh, `<div class="ld-tvh"><span class="ld-kind">${esc(S.q.cat)} · الجولة ${AR(S.round)}</span>${tvSecs(S.left)}</div><div class="ld-tvq">${esc(S.q.q)}</div>${tvBar(S.left, S.qT)}<div class="ld-tvopts">${S.q.o.map((o) => `<div>${esc(o)}</div>`).join("")}</div>`,
    { status: (t) => `${AR(S.done[t] || 0)} من ${AR(S.players.filter((p) => ldTeamOf(S, p.id) === t).length)}` }),
  rev: (S, fresh) => ldTv(S, fresh, `<div class="ld-tvq">${esc(S.q.q)}</div><div class="ld-tvans">${esc(S.q.o[S.answer])}</div>`,
    { status: (t) => `<b class="${S.res[t].right ? "ok" : "no"}">${S.res[t].right ? (S.res[t].fast ? `الأسرع · حتى ${AR(S.res[t].max)}` : `صح · حتى ${AR(S.res[t].max)}`) : "خطوة وحدة"}</b>` }),
  pick: (S, fresh) => ldTv(S, fresh, `<div class="ld-tvh"><span class="ld-kind">كم خطوة؟</span>${tvSecs(S.left)}</div><div class="ld-tvq small">الفرق اللي جاوبت صح تختار من جوالاتها. شوفوا وين السلالم والثعابين.</div>${tvBar(S.left, 25000)}`,
    { status: (t) => (S.res[t].right ? (S.done[t] ? "يختارون…" : "يفكّرون…") : "خطوة وحدة") }),
  move(S, fresh) {
    const c = S.cur || {}, who = c.t !== undefined ? `الفريق ${LD_TEAMS[c.t].n}` : "";
    const line = { walk: `${who} يمشي ${ldStepWord(c.b - c.a)}`, lad: `${who} على سلّم ${c.i !== undefined ? LD_LADDERS[c.i].v : ""}!`, slide: `${who} ينزل مع ثعبان ${c.i !== undefined ? LD_SNAKES[c.i].v : ""}`, win: `${who} وصل ١٠٠!`, card: who }[c.kind] || "";
    const over = c.kind === "card" ? ldTvCard(c.ck, c.i, c.ck === "lad" ? `${who} طلع السلّم، من ${AR(LD_LADDERS[c.i].a)} إلى ${AR(LD_LADDERS[c.i].b)}` : c.saved ? `${who} نجا من الثعبان` : `${who} نزل، من ${AR(LD_SNAKES[c.i].a)} إلى ${AR(LD_SNAKES[c.i].b)}`) : "";
    return ldTv(S, fresh, `<div class="ld-tvq">${line}</div><div class="ld-tvsteps">${S.teams.map((t) => `<span>${ldChip(t)} ${ldStepWord(S.steps ? S.steps[t] || 1 : 1)}</span>`).join("")}</div>`, { over });
  },
  esc(S, fresh) {
    const e = S.esc, sn = LD_SNAKES[e.i], who = `الفريق ${LD_TEAMS[e.t].n}`;
    const side = e.stage === "ask" ? `<div class="ld-tvq">${who} على راس ثعبان ${sn.v}!</div><p class="ld-tvsub">يقررون من جوالاتهم: يستخدمون فرصة نجاة؟</p>${tvBar(S.left, 15000)}`
      : e.stage === "q" ? `<div class="ld-tvh"><span class="ld-kind">سؤال النجاة: ${who}</span>${tvSecs(S.left)}</div><div class="ld-tvq">${esc(e.q.q)}</div>${tvBar(S.left, 10000)}<div class="ld-tvopts">${e.q.o.map((o) => `<div>${esc(o)}</div>`).join("")}</div>`
      : `<div class="ld-tvq">${e.ok ? `${who} نجا!` : `ما ضبطت مع ${who}`}</div><div class="ld-tvans">${esc(e.q.o[e.a])}</div>`;
    return ldTv(S, fresh, side, { hl: [sn.a], hc: LD_RED });
  },
  end(S) {
    const w = S.won;
    return `<div class="ld-tvend"><div class="ld-win big" style="--c:${LD_TEAMS[w].c}">${ldIcon(w, 120)}<b>${S.byRounds ? `خلصت الجولات! الأقرب ${LD_TEAMS[w].n}` : `فاز الفريق ${LD_TEAMS[w].n}!`}</b></div>
      <div class="ld-ranks tv">${S.rank.map((x, k) => `<div class="ld-rk"><span class="n">${AR(k + 1)}</span>${ldChip(x)}<b>الخانة ${AR(S.pos[x])}</b><div class="vs">${S.vals[x].map((i) => `<span>${LD_LADDERS[i].v}</span>`).join("") || '<span class="none">بدون سلالم</span>'}</div></div>`).join("")}</div>
      <p class="ld-tvsub">القيم اللي صعدها كل فريق</p></div>`;
  },
};
