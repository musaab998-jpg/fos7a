"use strict";
// ================= the people: a man and a woman from every Arab country =================
// Each one is a piece of clothing drawn over the sticky-note face: something on the head, and a collar at the bottom.
// The note stays the face, so eyes, mouth and paper colour are still the player's to choose.
const PEOPLE = (() => {
  const INK = "#1c2433";
  const p = (d, fill, stroke = INK, sw = 2.5, extra = "") => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${extra}/>`;

  // ---- head pieces for men ----
  // a ghutra or shmagh falling to the shoulders, with or without the black igal
  const GHUTRA = "M6 36Q8 2 50 1Q92 2 94 36L98 74H84L82 32Q50 21 18 32L16 74H2Z";
  const IGAL = '<ellipse cx="50" cy="15" rx="33" ry="6" fill="none" stroke="#111" stroke-width="4.5"/><ellipse cx="50" cy="22" rx="32" ry="5.5" fill="none" stroke="#111" stroke-width="4.5"/>';
  const ghutra = (fill, stroke, more = "") => p(GHUTRA, fill, stroke) + more + IGAL;
  // a felt tarboush or chechia: tall = Egypt and the Levant, round = North Africa
  const tarboush = (fill, h = 30, tassel = true) =>
    p(`M28 ${28}L32 ${28 - h}H68L72 28Z`, fill, "#7a1016") + p(`M32 ${28 - h}H68`, "none", "#7a1016", 3) +
    (tassel ? p(`M50 ${28 - h}q14 2 18 ${h * 0.55}`, "none", "#111", 3) + `<circle cx="68" cy="${28 - h * 0.45}" r="3.4" fill="#111"/>` : "");
  const chechia = (fill, band = "") => p("M22 30Q20 6 50 5Q80 6 78 30Q50 24 22 30Z", fill, "#7a1016") + band;
  // a wound turban: layers of cloth around the head
  const turban = (fill, stroke, wide = 0, lines = "#0000") =>
    p(`M${14 - wide} 32Q${10 - wide} 4 50 ${2 - wide}Q${90 + wide} 4 ${86 + wide} 32Q50 22 ${14 - wide} 32Z`, fill, stroke) +
    p(`M${20 - wide} 22Q50 ${6 - wide} ${80 + wide} 22M${16 - wide} 28Q40 ${14 - wide} ${70 + wide} 12`, "none", lines, 2.5);
  // a small round cap sitting on top
  const cap = (fill, stroke, dots = "") => p("M26 26Q26 6 50 6Q74 6 74 26Q50 20 26 26Z", fill, stroke) + dots;
  // a hood that comes down over the head and the sides: the jellaba and the burnous
  const hood = (fill, stroke, peak, stripes = "") =>
    p(`M4 96Q2 40 16 20Q${peak ? "34 -4 50 -6Q66 -4" : "30 2 50 2Q70 2"} 84 20Q98 40 96 96H84Q86 50 76 34Q50 22 24 34Q14 50 16 96Z`, fill, stroke) + stripes;

  // ---- head pieces for women ----
  // a headscarf around the face: the face shows through an oval
  const SCARF = "M4 98Q0 40 16 16Q50 -8 84 16Q100 40 96 98ZM50 26C30 26 21 42 21 58C21 76 34 88 50 88C66 88 79 76 79 58C79 42 70 26 50 26Z";
  const scarf = (fill, stroke = INK, trim = "", opacity = 1) => p(SCARF, fill, stroke, 2.5, ` fill-rule="evenodd"${opacity < 1 ? ` fill-opacity="${opacity}"` : ""}`) + trim;
  // a gold or coloured edge along the face opening
  const edge = (color, w = 3.5, dash = "") => `<path d="M50 26C30 26 21 42 21 58C21 76 34 88 50 88C66 88 79 76 79 58C79 42 70 26 50 26Z" fill="none" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
  // a cloak drawn over the head with a peak on top: the Iraqi abaya
  const cloak = (fill) => p("M2 98Q-2 30 20 12Q50 -12 80 12Q102 30 98 98ZM50 26C30 26 21 42 21 58C21 76 34 88 50 88C66 88 79 76 79 58C79 42 70 26 50 26Z", fill, INK, 2.5, ' fill-rule="evenodd"');
  // dark hair for those who don't cover it
  const hair = (color = "#2b1a12") => p("M11 44Q8 6 50 5Q92 6 89 44Q88 58 90 76L80 76Q82 50 76 30Q60 22 48 26Q34 30 22 26Q18 50 20 76L10 76Q12 58 11 44Z", color, "#150c07");

  // ---- collars at the bottom ----
  const neck = (fill, stroke = INK, more = "") => p("M8 100V94Q26 84 40 85L50 97L60 85Q74 84 92 94V100Z", fill, stroke) + more;
  const thobe = (fill = "#fbfbf8", more = "") => p("M8 100V94Q24 86 38 86Q44 90 50 90Q56 90 62 86Q76 86 92 94V100Z", fill, "#b9b8ad") + p("M50 90V100", "none", "#b9b8ad", 2) + more;
  const button = (y, c = "#b9b8ad") => `<circle cx="50" cy="${y}" r="1.8" fill="${c}"/>`;
  const drape = (fill, stroke = INK, more = "") => p("M4 100V90Q20 80 44 84Q70 86 96 76V100Z", fill, stroke) + more;
  const stitches = (color, y = 94) => `<path d="M16 ${y}h68" stroke="${color}" stroke-width="3" stroke-dasharray="3 3"/>`;

  // [country, man, woman]; each person: name, what they wear (said in the picker), drawing
  const LANDS = [
    ["السعودية",
      ["فهد", "شماغ", ghutra("url(#pShm)", "#a81d25") + thobe("#fbfbf8", button(94))],
      ["نورة", "طرحة وعباية", scarf("#15151c", "#000") + neck("#15151c", "#000", p("M40 85L50 97L60 85", "none", "#6b4aa8", 3))]],
    ["الإمارات",
      ["سعيد", "غترة وكندورة", ghutra("#fbfbf8", "#cfcfc6") + thobe("#fbfbf8", p("M50 90q-2 8 1 12", "none", "#cfcfc6", 2.5) + `<circle cx="51" cy="99" r="2.6" fill="#e9e6da" stroke="#b9b8ad"/>`)],
      ["مهرة", "شيلة مطرزة", scarf("#15151c", "#000", edge("#e0b43c", 3.5)) + neck("#15151c", "#000", p("M10 96Q26 87 40 88", "none", "#e0b43c", 3) + p("M90 96Q74 87 60 88", "none", "#e0b43c", 3))]],
    ["الكويت",
      ["بدر", "غترة ودشداشة", ghutra("#fbfbf8", "#cfcfc6") + thobe("#f4f2ea", p("M42 86L46 92M58 86L54 92", "none", "#b9b8ad", 2.5) + button(95))],
      ["دانة", "دراعة وشيلة خفيفة", scarf("#7fb8d6", "#3d7aa0", edge("#fff", 2, "2 4"), 0.75) + neck("#2f9e6f", INK, stitches("#f4d64a", 95))]],
    ["قطر",
      ["حمد", "غترة بالكوبرا", ghutra("#fbfbf8", "#cfcfc6", p("M36 8L50 0L64 8", "#fbfbf8", "#cfcfc6")) + p("M84 26q6 10 4 26M88 26q6 10 4 22", "none", "#111", 2.5) + thobe("#fbfbf8", button(94))],
      ["موزة", "شيلة وثوب نشل", scarf("#15151c", "#000") + neck("#7a1f3d", INK, `<g fill="#e0b43c"><circle cx="24" cy="94" r="1.6"/><circle cx="34" cy="92" r="1.6"/><circle cx="66" cy="92" r="1.6"/><circle cx="76" cy="94" r="1.6"/></g>`)]],
    ["البحرين",
      ["جاسم", "غترة وبشت", ghutra("#fbfbf8", "#cfcfc6") + p("M4 100V92Q18 84 36 86L44 100Z", "#6b4a2b", INK) + p("M96 100V92Q82 84 64 86L56 100Z", "#6b4a2b", INK) + p("M36 86L44 100M64 86L56 100", "none", "#e0b43c", 3) + p("M44 100L50 90L56 100Z", "#fbfbf8", "#b9b8ad")],
      ["فاطمة", "مشمر ملوّن", scarf("url(#pFlower)", "#1f6b4a") + neck("#1f6b4a")]],
    ["عُمان",
      ["سالم", "مصر ودشداشة", turban("url(#pMassar)", "#5b3f8c", 0, "#5b3f8c") + thobe("#fbfbf8", p("M50 90q2 7-1 11", "none", "#b9b8ad", 2.5) + `<circle cx="49" cy="100" r="2.4" fill="#d9d4c4"/>`)],
      ["شمسة", "لحاف ملوّن", scarf("url(#pLihaf)", "#8c1f2a") + neck("#e05a2b", INK, stitches("#ffe27a", 95))]],
    ["اليمن",
      ["صالح", "عمامة وكوت", turban("url(#pYemen)", "#2e6b3a", 0, "#2e6b3a") + p("M8 100V94Q22 86 36 86L50 100Z", "#585c66", INK) + p("M92 100V94Q78 86 64 86L50 100Z", "#585c66", INK) + p("M36 86Q50 92 64 86L50 100Z", "#fbfbf8", "#b9b8ad")],
      ["بلقيس", "ستارة", scarf("url(#pSitara)", "#1d3fb8") + neck("#c8232c")]],
    ["العراق",
      ["علي", "يشماغ", ghutra("url(#pYash)", "#222") + thobe("#b8b0a0", button(94, "#8a8272"))],
      ["زينب", "عباية على الراس", cloak("#111") + neck("#111", "#000")]],
    ["سوريا",
      ["عمر", "طربوش وصدرية", tarboush("#c8232c", 24) + p("M8 100V94Q22 86 38 86L50 100Z", "#1b2a4a", INK) + p("M92 100V94Q78 86 62 86L50 100Z", "#1b2a4a", INK) + p("M38 86Q50 90 62 86L50 100Z", "#fbfbf8", "#b9b8ad")],
      ["لينا", "ثوب مطرز", scarf("#9fd3ff", "#3d7aa0") + neck("#15151c", INK, stitches("#ff6b81", 93) + stitches("#9be7a0", 97))]],
    ["لبنان",
      ["جورج", "طربوش وشروال", tarboush("#9e1b24", 20) + neck("#15151c", INK, p("M22 92q8 4 14 0M64 92q8 4 14 0", "none", "#e0b43c", 2.5))],
      ["ريما", "منديل أبيض", scarf("#fbfbf8", "#b9b8ad", edge("#d9d4c4", 3, "1 3")) + neck("#c8232c", INK, stitches("#fbfbf8", 95))]],
    ["الأردن",
      ["فادي", "شماغ بالشراشيب", ghutra("url(#pShm)", "#a81d25", `<g fill="#fbfbf8" stroke="#a81d25" stroke-width="1.2"><circle cx="5" cy="76" r="2.4"/><circle cx="11" cy="76" r="2.4"/><circle cx="89" cy="76" r="2.4"/><circle cx="95" cy="76" r="2.4"/></g>`) + thobe("#fbfbf8", button(94))],
      ["سلمى", "ثوب مطرز بالأزرق", scarf("#15151c", "#000") + neck("#15151c", "#000", stitches("#3d7ae0", 93) + stitches("#3d7ae0", 97))]],
    ["فلسطين",
      ["خالد", "كوفية", ghutra("url(#pKuf)", "#222") + neck("#3a3f4a")],
      ["رشا", "ثوب مطرز بالأحمر", scarf("#fbfbf8", "#b9b8ad") + neck("#15151c", "#000", stitches("#e0262f", 92) + stitches("#e0262f", 96) + p("M44 90l6 5 6-5", "none", "#e0262f", 2.5))]],
    ["مصر",
      ["محمود", "طربوش وجلابية", tarboush("#c8232c", 27) + p("M8 100V94Q24 86 38 86L50 98L62 86Q76 86 92 94V100Z", "#8fc1e8", "#3d7aa0")],
      ["منى", "طرحة ملونة", scarf("#ff9fb2", "#c2456a") + neck("#6b4aa8")]],
    ["السودان",
      ["عثمان", "عمامة وشال", turban("#fbfbf8", "#b9b8ad", 5, "#d9d4c4") + thobe("#fbfbf8", p("M8 94Q30 82 60 100", "none", "#d9d4c4", 5))],
      ["آمنة", "توب ملوّن", scarf("url(#pToob)", "#c2410c") + drape("url(#pToob)", "#c2410c")]],
    ["ليبيا",
      ["طارق", "شنّة وجرد", chechia("#9e1b24", p("M22 30Q50 24 78 30", "none", "#111", 3)) + drape("#f4f1e8", "#b9b8ad", p("M20 86Q40 92 60 84", "none", "#d9d4c4", 2))],
      ["هند", "ردا مخطط", scarf("url(#pRida)", "#8c1f2a") + neck("#fbfbf8", "#b9b8ad")]],
    ["تونس",
      ["سامي", "شاشية وجبّة", chechia("#c8232c", p("M50 5q10-4 14 8", "none", "#111", 3)) + p("M8 100V94Q24 86 38 86L50 98L62 86Q76 86 92 94V100Z", "#f4ecd6", "#b9a77a") + p("M38 86L50 98L62 86", "none", "#e0b43c", 2.5)],
      ["إيمان", "سفساري", scarf("url(#pSefsari)", "#b9a77a") + neck("#f4ecd6", "#b9a77a")]],
    ["الجزائر",
      ["كريم", "برنوس", hood("#f4f1e8", "#b9b8ad", false, p("M24 34Q50 22 76 34", "none", "#d9d4c4", 2.5))],
      ["أمينة", "كاراكو وخيط الروح", hair() + p("M22 30Q50 40 78 30", "none", "#e0b43c", 2.5) + `<circle cx="50" cy="36" r="3" fill="#e0b43c"/>` + neck("#5a1330", INK, p("M40 85Q30 92 26 100M60 85Q70 92 74 100", "none", "#e0b43c", 3))]],
    ["المغرب",
      ["يوسف", "جلابة بالقب", hood("#8a6a4a", "#5a4430", true, p("M50 -4V20M36 4L40 26M64 4L60 26", "none", "#6d5238", 2))],
      ["سكينة", "قفطان وسبنية", hair() + p("M14 30Q14 10 50 8Q86 10 86 30Q50 18 14 30Z", "#e0457b", "#9e2753") + p("M86 28q6 8 4 18", "none", "#9e2753", 3) + neck("#1f7a4a", INK, p("M40 85L50 97L60 85", "none", "#e0b43c", 3.5))]],
    ["موريتانيا",
      ["محمد الأمين", "لثام ودرّاعة", turban("#2b3f8c", "#16224f", 3, "#4a5fb0") + drape("#4a7ad6", "#16224f", p("M50 88v12", "none", "#fbfbf8", 2))],
      ["مريم", "ملحفة", scarf("#3b4fb8", "#16224f", "", 0.85) + drape("#e05a8a", "#8c1f4a")]],
    ["الصومال",
      ["عبدي", "كوفية وقميص", cap("#fbfbf8", "#b9b8ad", `<g fill="#3d7ae0"><circle cx="38" cy="16" r="1.8"/><circle cx="50" cy="12" r="1.8"/><circle cx="62" cy="16" r="1.8"/></g>`) + thobe("#fbfbf8", button(94))],
      ["هودان", "دِراك وغربسار", scarf("#8e44ad", "#5b2c6f") + neck("#f4d64a")]],
    ["جيبوتي",
      ["إسماعيل", "عمامة", turban("#e8dcc0", "#9a8a66", 0, "#c8b890") + thobe("#fbfbf8", button(94))],
      ["حليمة", "دِراك ملوّن", scarf("#2f9e6f", "#1f6b4a", edge("#f4d64a", 2.5, "4 4")) + neck("#e05a2b")]],
    ["جزر القمر",
      ["أحمد", "كوفية مطرزة", p("M28 28L30 6H70L72 28Z", "#f4ecd6", "#b9a77a") + p("M32 12H68M31 20H69", "none", "#e0b43c", 2.5, ' stroke-dasharray="3 2"') + neck("#15151c", INK, p("M40 85L50 97L60 85", "#fbfbf8", "#b9b8ad"))],
      ["سعاد", "شيروماني", scarf("url(#pShiro)", "#5a1318") + neck("#c8232c") + `<g fill="#fff6d8" opacity=".9"><circle cx="30" cy="58" r="2"/><circle cx="34" cy="64" r="2"/><circle cx="70" cy="58" r="2"/><circle cx="66" cy="64" r="2"/></g>`]],
  ];

  const list = [];
  LANDS.forEach(([land, man, woman]) => {
    [man, woman].forEach(([name, wear, s], i) => list.push({ land, name, wear, s, woman: i === 1 }));
  });
  return list;
})();

// Patterns the clothes use; added once to the page's hidden <defs>.
const PEOPLE_DEFS = `
  <pattern id="pShm" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fbfbf8"/><path d="M0 0h7M0 0v7" stroke="#c8232c" stroke-width="2.6"/></pattern>
  <pattern id="pYash" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fbfbf8"/><path d="M0 0h7M0 0v7" stroke="#222" stroke-width="2.4"/></pattern>
  <pattern id="pKuf" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#fbfbf8"/><path d="M0 5q2.5-4 5 0t5 0M0 0h10" stroke="#222" stroke-width="1.6" fill="none"/></pattern>
  <pattern id="pMassar" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><rect width="8" height="8" fill="#c9a7ff"/><path d="M0 2h8" stroke="#fbfbf8" stroke-width="1.6"/><path d="M0 6h8" stroke="#ff9fb2" stroke-width="1.6"/></pattern>
  <pattern id="pYemen" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)"><rect width="8" height="8" fill="#fbfbf8"/><path d="M0 4h8" stroke="#2e8b57" stroke-width="3"/></pattern>
  <pattern id="pLihaf" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#e0262f"/><circle cx="6" cy="6" r="3" fill="#ffc933"/><circle cx="0" cy="0" r="2" fill="#2f9e6f"/><circle cx="12" cy="12" r="2" fill="#2f9e6f"/></pattern>
  <pattern id="pSitara" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#c8232c"/><circle cx="6" cy="6" r="3.6" fill="#1d3fb8"/><circle cx="6" cy="6" r="1.4" fill="#fbfbf8"/></pattern>
  <pattern id="pFlower" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#2f9e6f"/><circle cx="4" cy="4" r="2.4" fill="#ff9fb2"/><circle cx="10" cy="9" r="2" fill="#ffe66d"/></pattern>
  <pattern id="pToob" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="14" height="14" fill="#fb923c"/><path d="M0 4h14" stroke="#facc15" stroke-width="3"/><path d="M0 10h14" stroke="#f472b6" stroke-width="2"/></pattern>
  <pattern id="pRida" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#fbfbf8"/><path d="M0 3h10" stroke="#c8232c" stroke-width="2.4"/><path d="M0 7h10" stroke="#c8232c" stroke-width="1"/></pattern>
  <pattern id="pSefsari" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f7f0dc"/><path d="M2 0v8" stroke="#e0cf9a" stroke-width="1.4"/></pattern>
  <pattern id="pShiro" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#c8232c"/><rect width="5" height="5" fill="#15151c"/><rect x="5" y="5" width="5" height="5" fill="#15151c"/></pattern>`;

document.querySelector("svg defs")?.insertAdjacentHTML("beforeend", PEOPLE_DEFS);
