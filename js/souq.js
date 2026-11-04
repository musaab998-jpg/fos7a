"use strict";
// ================= سوق المدينة: a trading board game in the old market of Madinah =================
// Each team is a trading house with a trader walking the market street. Every round one question goes to
// everyone; a team's majority answer counts. Right, and the team picks how far to walk (1, 2 or 3 shops);
// wrong, one shop. Where it stops it buys or shares a shop, pays rent, extends or endows its shop, takes
// a deal card (halal choice = أجر), answers a fiqh question at the mosque, enters a mudaraba with the
// caravan, gives at the sabil or at بيت المال. Passing the market gate takes 2.5% zakat. Winner: wealth
// plus أجر × 5. The host keeps everything; the TV draws the town; each phone acts for its own house.

// ======================================================================================================
// SQ_SHARIA: every text in the game that touches the sharia, in one place, numbered like the review sheet
// «سوق المدينة: ورقة المراجعة الشرعية» (ص = أوراق الصفقة، ز = الزكاة وبيت المال، ع = العقود، ف = أسئلة المسجد،
// ن = نصوص عامة). A reviewer's correction goes into its line here and nowhere else.
// The numbers written inside the texts (+١٥ أجر، ٢٫٥٪، ٤٠٠ …) must match SQ_PTS below.
// ======================================================================================================
const SQ_SHARIA = {
  // ص١–ص٩: deal cards. a = the two choices in the order shown, ok = the one that agrees with the sharia,
  // cash = dinars now for each choice, later = dinars two rounds later for each choice, why = ruling and evidence.
  deals: [
    { id: "ص١", t: "عرض قرض", s: "تاجر يعرض عليكم قرضًا ٣٠٠ دينار، تردّونها ٣٦٠ بعد جولتين.", a: ["نرفض: هذه زيادة مشروطة", "نقبل: نحتاج المال"], ok: 0, cash: [0, 300], later: [0, -360],
      why: "كل زيادة مشروطة في القرض ربا. قال تعالى: ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾ [البقرة: ٢٧٥]." },
    { id: "ص٢", t: "ثمر لم ينضج", s: "مزارع يبيعكم ثمر نخله هذا الموسم، والبلح ما زال أخضر لم يبدُ صلاحه، بسعر رخيص.", a: ["نشتري الآن قبل غيرنا", "ننتظر حتى يبدو صلاحه"], ok: 1, cash: [-60, 0],
      why: "«نهى النبي ﷺ عن بيع الثمار حتى يبدو صلاحها» (متفق عليه)، لأن الثمر قد يتلف قبل نضجه فيكون غررًا." },
    { id: "ص٣", t: "النجش", s: "صديقك يبيع سلعة في المزاد، ويطلب منك أن تزايد عليها لترفع سعرها وأنت لا تريد شراءها.", a: ["نزايد لنساعده", "نعتذر عن ذلك"], ok: 1, cash: [40, 0],
      why: "هذا هو النجش، وقد قال ﷺ: «لا تناجشوا» (متفق عليه)، لأنه خداع للمشتري." },
    { id: "ص٤", t: "سَلَم في التمر", s: "تاجر يدفع لكم الآن ٢٠٠ دينار، على أن تسلّموه بعد جولتين ٥٠ صاعًا من تمر العجوة، موصوفًا ومعلوم القدر.", a: ["نقبل العقد", "نرفض: لا نبيع ما ليس عندنا"], ok: 0, cash: [200, 0], later: [-120, 0],
      why: "هذا عقد السَّلَم وهو جائز: «من أسلف في شيء فليسلف في كيل معلوم ووزن معلوم إلى أجل معلوم» (متفق عليه)." },
    { id: "ص٥", t: "حبس السلعة", s: "قلّ القماش في السوق، ويقترح أحدكم تخزين ما عندكم حتى يرتفع سعره كثيرًا ثم البيع.", a: ["نخزّنه ونربح أكثر", "نبيعه بسعر السوق"], ok: 1, cash: [80, 40],
      why: "هذا احتكار، وقال ﷺ: «لا يحتكر إلا خاطئ» (رواه مسلم)." },
    { id: "ص٦", t: "تلقّي الركبان", s: "قافلة قادمة إلى المدينة لم تصل السوق بعد، وتستطيعون الخروج إليها وشراء بضاعتها قبل أن يعرف أهلها سعر السوق.", a: ["نخرج إليها ونشتري رخيصًا", "ننتظرها في السوق"], ok: 1, cash: [90, 0],
      why: "«لا تلقّوا الركبان» (متفق عليه)، لما فيه من خداع البائع بجهله بسعر السوق." },
    { id: "ص٧", t: "عيب في البضاعة", s: "في بعض الأقمشة عيب صغير لا يُرى. المشتري لم يلاحظه.", a: ["نبيّن العيب ونخفض السعر", "نسكت، لم يسأل"], ok: 0, cash: [-30, 30],
      why: "قال ﷺ: «من غشّ فليس مني» (رواه مسلم)، والبيان واجب على البائع." },
    { id: "ص٨", t: "مرابحة", s: "مشترٍ يطلب منكم شراء جمل لم تملكوه بعد، ثم بيعه له بربح معلوم. تشترونه أولًا وتقبضونه، ثم تبيعونه.", a: ["نشتري الجمل ثم نبيعه بربح معلوم", "نبيعه له الآن قبل أن نملكه"], ok: 0, cash: [70, 70],
      why: "المرابحة جائزة إذا ملك البائع السلعة قبل بيعها، لقوله ﷺ: «لا تبع ما ليس عندك» (رواه أبو داود والترمذي)." },
    { id: "ص٩", t: "البيع على البيع", s: "مشترٍ اتفق مع جاركم على شراء تمر، فتعرضون عليه سعرًا أقل ليترك جاركم ويشتري منكم.", a: ["نعرض سعرًا أقل", "نتركه لجارنا"], ok: 1, cash: [60, 0],
      why: "قال ﷺ: «لا يبع بعضكم على بيع بعض» (متفق عليه)." },
  ],
  dealPrompt: "ورقة صفقة: <b>اختاروا ما يوافق الشرع</b>. بعض العروض مغرية!",
  stampOk: "يوافق الشرع", stampNo: "لا يجوز",

  // ف١–ف٨: questions at the mosque. o[a] is the answer counted right; the options are shuffled when shown.
  fiqh: [
    { id: "ف١", q: "ما مقدار زكاة عروض التجارة إذا بلغت النصاب وحال عليها الحول؟", o: ["ربع العشر (٢٫٥٪)", "العشر (١٠٪)", "نصف العشر (٥٪)", "الخمس (٢٠٪)"], a: 0 },
    { id: "ف٢", q: "في المضاربة، إذا خسر المال بلا تقصير من العامل، فعلى من الخسارة؟", o: ["على صاحب المال", "على العامل", "مناصفة بينهما", "على بيت المال"], a: 0 },
    { id: "ف٣", q: "ما الوقف؟", o: ["حبس الأصل وتسبيل المنفعة", "بيع الأصل بثمن مؤجل", "هبة المال لوارث", "قرض بلا أجل"], a: 0 },
    { id: "ف٤", q: "ما النجش؟", o: ["الزيادة في ثمن السلعة ممن لا يريد شراءها", "بيع السلعة بأقل من ثمنها", "تأجيل الثمن", "الشراء بالجملة"], a: 0 },
    { id: "ف٥", q: "ما الاحتكار المنهي عنه؟", o: ["حبس السلعة ليرتفع ثمنها على الناس", "بيع السلعة بربح", "شراء سلعة نادرة", "تخزين طعام البيت"], a: 0 },
    { id: "ف٦", q: "ما القرض الحسن؟", o: ["قرض يُردّ مثله بلا زيادة مشروطة", "قرض بزيادة يسيرة", "قرض يُردّ نصفه", "قرض للتجار فقط"], a: 0 },
    { id: "ف٧", q: "السَّلَم هو:", o: ["بيع موصوف في الذمة بثمن مقبوض في المجلس", "بيع حاضر بثمن مؤجل", "بيع بالمزاد", "تأجير دكان"], a: 0 },
    { id: "ف٨", q: "الإجارة عقد على:", o: ["منفعة معلومة بعوض معلوم", "عين مجهولة", "قرض بزيادة", "هبة بشرط"], a: 0 },
  ],
  fiqhPrompt: "مجلس علم: أجيبوا لتنالوا <b>+٢٠ أجر</b>.",

  // ز١–ز٧: zakat, بيت المال and the goodly loan
  zakatDone: "أخرجتم الزكاة",                                                     // ز١
  zakatLine: (z) => `${z} دينار (٢٫٥٪ من مالكم) ذهبت إلى بيت المال، و+١٠ أجر`,       // ز١
  zakatTag: "زكاة عروض التجارة",                                                  // ز١
  zakatRule: "ربع العشر من المال إذا بلغ النصاب وحال عليه الحول. في اللعبة: كل مرور بالباب حَول.", // ز١
  nisab: "نصاب الزكاة في اللعبة ٤٠٠ دينار.",                                        // ز٢
  zakatExplain: "كل مرور بباب السوق تُخرجون الزكاة ٢٫٥٪ لبيت المال. ومن بيت المال يُقرض المحتاج قرضًا حسنًا يردّه بلا زيادة.", // ز٣
  qardTitle: (n) => `قرض حسن ${n} دينار`,                                          // ز٤
  qardRule: "يُردّ مثله في نهاية اللعبة <b>بلا زيادة</b>. القرض الحسن قربة، والزيادة المشروطة فيه ربا.", // ز٤
  qardPhone: "تردّونه كما هو في النهاية، بلا فائدة",                                // ز٤
  broke: (house, n) => `<b>${house}</b> عجزت عن الدفع، فأقرضها بيت المال ${n} قرضًا حسنًا`, // ز٥
  donateBtn: "نتبرع بـ١٠٠", donateSub: "يُقرض منه المحتاجون، و+١٢ أجر",               // ز٦
  baitRule: "في بيت المال تُجمع الزكاة والصدقات، ومنه يُقرض المحتاج قرضًا حسنًا.",       // ز٦
  baitHud: "بيت المال: للزكاة والقرض الحسن",                                         // ز٦
  settleLine: "انتهت الجولات: تُردّ القروض بلا زيادة، ويُحسب أجر الأوقاف",            // ز٧
  settleRule: "القروض الحسنة تُردّ كما أُخذت، والديون تُسدَّد، ولكل وقف أجر جارٍ.",       // ز٧

  // ع١–ع٨: rent, partnership, mudaraba, waqf and charity
  ijaraTag: "الإجارة", ijaraRule: "عقد على منفعة معلومة بعوض معلوم: انتفعتم بالمكان فدفعتم أجرته.", // ع١
  rentFull: "مضاعفة لأنها تملك الشارع كله",                                         // ع٢
  rentKhan: "تزيد كلما ملكت خانات أكثر",                                            // ع٢
  emptyShop: "دكان فارغ. يمكن <b>شراؤه</b>، أو <b>المشاركة</b> فيه مع دار أخرى بالنصف.", // ع٣
  partSub: "مشاركة: نصف الثمن، ونصف الأجرة لكل شريك",                                // ع٣
  partRule: "<b>المشاركة</b> جائزة: لكل شريك من الربح والخسارة بقدر حصته في رأس المال.", // ع٣
  partAsk: (house, shop, n) => `<b>${house}</b> تعرض عليكم المشاركة في <b>${shop}</b>: تدفعون ${n} ولكم نصف أجرته.`, // ع٣
  caravanTitle: "مضاربة: قافلة إلى الشام",                                           // ع٤
  caravanRule: "تدفعون رأس المال، والتاجر يعمل به. إن ربحت القافلة فلكم <b>نصف الربح</b> مع رأس مالكم، وإن خسرت بلا تقصير فالخسارة على رأس المال.", // ع٤
  caravanWin: (n) => `لكم نصف الربح: ${n} مع رأس المال`,                              // ع٤
  caravanLoss: (n) => `ذهب نصف رأس المال: ${n}. والعامل خسر جهده`,                     // ع٤
  caravanAfter: "<b>المضاربة</b>: الربح بينهما على ما اتفقا، والخسارة على المال ما لم يفرّط العامل.", // ع٤
  waqfBtn: "نوقفه لله", waqfSub: "يخرج من ملككم، و+٨ أجر كل جولة حتى النهاية",          // ع٥
  waqfOffer: "ويمكنكم <b>وقفه</b>: يخرج من ملككم، وتذهب أجرته لبيت المال، ولكم أجر في كل جولة.", // ع٥
  waqfStamp: "وقف لله",                                                            // ع٦
  waqfHadith: "«إن شئتَ حبستَ أصلها وتصدّقتَ بها» قالها النبي ﷺ لعمر رضي الله عنه في أرضه بخيبر (متفق عليه).", // ع٦
  waqfShop: "هذا الدكان <b>وقف</b>: أصله محبوس، وأجرته تذهب إلى بيت المال.",            // ع٧
  waqfShopShort: "وقف: لا يُباع ولا يُشترى",                                         // ع٧
  sadaqaAsk: "عند السبيل رجل محتاج. هل تتصدقون؟", sadaqaBtn: "نتصدّق بـ٥٠", sadaqaSub: "+٨ أجر", // ع٨
  sadaqaHadith: "«ما نقصت صدقة من مال» (رواه مسلم).",                                // ع٨

  // ن١–ن٦: general texts and names
  welcomeTitle: "التجارة الحلال",                                                    // ن١
  welcome: (cap, r) => `ابدؤوا بـ${cap} دينار. اشتروا الدكاكين، وأجّروها، وادخلوا الصفقات بما يوافق الشرع. الفائز: أكثر الدُّور مالًا وأجرًا بعد ${r} جولات.`, // ن١
  dealsExplain: "في السوق عروض مغرية: قرض بفائدة، نجش، احتكار، غش… اختاروا ما يوافق الشرع فتنالوا الأجر، وتعرفوا الحكم ودليله.", // ن٢
  mudarabaExplain: "في القافلة تدخلون مضاربة: الربح بالاتفاق والخسارة على المال. ويمكنكم وقف دكانكم: يخرج من ملككم، ويجري لكم أجره كل جولة.", // ن٣
  winExplain: "بعد عدد الجولات المحدد تُردّ القروض، ويُحسب المال والدكاكين والأجر. التاجر الأمين هو من جمع الخيرين.", // ن٤
  winTitle: "التاجر الأمين",                                                         // ن٥
  winFormula: "المجموع = الثروة (المال والدكاكين بعد ردّ القروض) + الأجر × ٥",           // ن٥
  ajr: "أجر",                                                                       // ن٦
};
// the numbers behind the texts above
const SQ_PTS = { nisab: 400, zakat: 0.025, zakatAjr: 10, dealOk: 15, dealNo: 5, fiqh: 20, waqf: 8, donate: 100, donateAjr: 12, sadaqa: 50, sadaqaAjr: 8, ajrMult: 5, qardBelow: 300, qardMax: 300 };
const SQX = SQ_SHARIA;

// ================= the market =================
const SQ_HOUSES = [
  { n: "دار الصقر", hx: "#1f4fa8", art: "falcon" },
  { n: "دار الخيل", hx: "#a8321f", art: "horse" },
  { n: "دار النخلة", hx: "#1d7a4a", art: "palm" },
  { n: "دار الهلال", hx: "#6b3fa0", art: "crescent" },
];
const SQ_GROUPS = { t: { n: "التمور", c: "#8a4b20" }, q: { n: "الأقمشة", c: "#2f6fb0" }, a: { n: "العطارة والفخار", c: "#b5652f" }, h: { n: "الحِرَف", c: "#6b5aa8" }, k: { n: "الخانات", c: "#2d6a5a" } };
const SQ_T = [
  { k: "gate", n: "باب السوق", ic: "gate", corner: 1 },
  { k: "shop", n: "تمر العجوة", ic: "dates", g: "t", price: 120 },
  { k: "deal", n: "صفقة", ic: "deal" },
  { k: "shop", n: "تمر البرني", ic: "dates", g: "t", price: 140 },
  { k: "shop", n: "خان الشام", ic: "khan", g: "k", price: 200 },
  { k: "bait", n: "بيت المال", ic: "bait", corner: 1 },
  { k: "shop", n: "البزّاز", ic: "cloth", g: "q", price: 180 },
  { k: "shop", n: "الحرير", ic: "cloth", g: "q", price: 200 },
  { k: "sadaqa", n: "السبيل", ic: "sadaqa" },
  { k: "shop", n: "الخيّاط", ic: "needle", g: "q", price: 220 },
  { k: "masjid", n: "المسجد", ic: "masjid", corner: 1 },
  { k: "shop", n: "العطّار", ic: "spice", g: "a", price: 260 },
  { k: "shop", n: "خان اليمن", ic: "khan", g: "k", price: 200 },
  { k: "shop", n: "الفخّار", ic: "jar", g: "a", price: 280 },
  { k: "deal", n: "صفقة", ic: "deal" },
  { k: "caravan", n: "القافلة", ic: "caravan", corner: 1 },
  { k: "shop", n: "الصرّاف", ic: "scale", g: "h", price: 320 },
  { k: "deal", n: "صفقة", ic: "deal" },
  { k: "shop", n: "الحدّاد", ic: "anvil", g: "h", price: 340 },
  { k: "shop", n: "خان العراق", ic: "khan", g: "k", price: 200 },
];
SQ_T.forEach((t, i) => { t.i = i; if (t.k === "shop") t.rent = t.g === "k" ? 50 : Math.round((t.price * 0.3) / 10) * 10; });
const SQ_TILE_SUB = { deal: "ورقة صفقة", sadaqa: "+أجر", gate: "الزكاة عند المرور", bait: "قرض حسن", masjid: "سؤال فقه", caravan: "مضاربة" };

const sqN = (n) => AR(Math.round(n).toLocaleString("en-US")).replace(/,/g, "٬");
const sqSG = (n) => `<span dir="ltr">${n > 0 ? "+" : "−"}${sqN(Math.abs(n))}</span>`;
const sqHouse = (t) => SQ_HOUSES[t] || SQ_HOUSES[0];
const sqTeamOf = (S, id) => (S.steams || {})[id] ?? -1;
const sqFullGroup = (S, tile, id) => tile.g && tile.g !== "k" && SQ_T.filter((x) => x.g === tile.g).every((x) => S.own[x.i] && S.own[x.i].id === id && S.own[x.i].partner === undefined);
function sqRent(S, i) {
  const tile = SQ_T[i], o = S.own[i];
  if (!o) return tile.rent || 0;
  if (tile.g === "k") { const n = SQ_T.filter((x) => x.g === "k" && S.own[x.i] && S.own[x.i].id === o.id).length; return 50 * 2 ** (n - 1); }
  return tile.rent * (sqFullGroup(S, tile, o.id) ? 2 : 1) * [1, 2, 3][o.ext || 0];
}
const sqWealth = (S, t) => { const c = S.cos[t]; return c.cash + Object.entries(S.own).filter(([, o]) => o.id === t || o.partner === t).reduce((s, [i, o]) => s + SQ_T[i].price * (1 + 0.5 * (o.ext || 0)) * (o.partner !== undefined ? 0.5 : 1), 0) - c.qard - c.debts.reduce((s, d) => s + d.amt, 0); };
const sqScore = (S, t) => Math.round(sqWealth(S, t) + S.cos[t].ajr * SQ_PTS.ajrMult);

// ================= drawings: crests, tile icons and the 2.5D town =================
const SQ_STAR8 = (r) => { let d = ""; for (let i = 0; i < 16; i++) { const a = (Math.PI / 8) * i - Math.PI / 2, rr = i % 2 ? r * 0.8 : r; d += `${i ? "L" : "M"}${(50 + rr * Math.cos(a)).toFixed(1)} ${(50 + rr * Math.sin(a)).toFixed(1)}`; } return d + "Z"; };
const SQ_CREST = (c, art) => `<path d="${SQ_STAR8(49)}" fill="#d4a64a"/><path d="${SQ_STAR8(45)}" fill="#7a5a1c"/><circle cx="50" cy="50" r="36" fill="${c}"/><circle cx="50" cy="50" r="36" fill="url(#sq-shine)"/><circle cx="50" cy="50" r="31.5" fill="none" stroke="#f3d58a" stroke-width="1.2" stroke-dasharray="1.5 2.5" opacity=".8"/>${art}`;
const SQ_CREAM = "#f7ecd3";
const SQ_EMBLEM = {
  falcon: (c) => SQ_CREST(c, `<path d="M33 76 C29 62 29 46 38 36 C45 28 56 27 63 31 C67 33 70 36 72 40 L64 47 C62 52 60 57 60 62 C60 67 61 72 63 76 Z" fill="${SQ_CREAM}"/><path d="M62 31 C70 31 76 37 76 46 C74 43 71 42 68 44 C67 41 65 39 62 38 Z" fill="#d4a64a" stroke="#7a5a1c" stroke-width="1.2"/><circle cx="57" cy="39" r="4" fill="#1a120c"/><circle cx="57" cy="39" r="5.6" fill="none" stroke="#d4a64a" stroke-width="1.4"/><circle cx="58.3" cy="37.8" r="1.2" fill="#fff"/><path d="M55 44 C52 49 51 55 53 60 C56 55 58 50 58 45 Z" fill="#1a120c" opacity=".85"/><path d="M38 50 q4 3 8 1 M36 58 q5 3 10 1 M37 66 q5 3 11 1" stroke="${c}" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>`),
  horse: (c) => SQ_CREST(c, `<path d="M36 76 C34 64 36 54 42 46 C46 40 48 34 50 28 C52 24 56 22 60 24 C64 26 68 30 72 36 C75 40 76 44 74 47 C72 49 69 49 67 47 C64 45 61 45 59 48 C56 52 56 60 58 68 C59 72 60 74 62 76 Z" fill="${SQ_CREAM}"/><path d="M50 28 C46 32 42 38 40 46 C38 52 36 60 36 68" stroke="${c}" stroke-width="3" fill="none" opacity=".45"/><path d="M50 26 C44 30 40 36 37 44 C35 50 33 56 32 62 C36 54 40 46 46 38 Z" fill="#d4a64a"/><path d="M58 21 L56 14 L62 19 Z" fill="${SQ_CREAM}"/><circle cx="64" cy="33" r="2" fill="${c}"/><path d="M70 44 q2 1 3 0" stroke="${c}" stroke-width="1.6" fill="none"/>`),
  palm: (c) => SQ_CREST(c, `<path d="M48 76 C47 66 48 56 51 46" stroke="${SQ_CREAM}" stroke-width="5" fill="none" stroke-linecap="round"/><g fill="${SQ_CREAM}"><path d="M51 44 C42 36 32 36 25 42 C34 39 43 41 51 46Z"/><path d="M51 44 C60 35 70 35 77 41 C68 38 59 40 51 46Z"/><path d="M51 44 C47 33 40 27 31 26 C40 31 46 37 50 46Z"/><path d="M51 44 C56 33 63 27 72 27 C63 31 57 37 52 46Z"/><path d="M51 45 C43 46 37 51 34 58 C41 52 46 49 51 47Z"/><path d="M51 45 C59 46 65 51 68 58 C61 52 56 49 51 47Z"/></g><g fill="#d4a64a"><circle cx="48" cy="51" r="2.6"/><circle cx="53" cy="52" r="2.6"/><circle cx="50.5" cy="56" r="2.6"/></g>`),
  crescent: (c) => SQ_CREST(c, `<path d="M58 24 C42 26 32 38 32 52 C32 66 44 78 58 78 C50 74 44 64 44 52 C44 40 50 30 58 24 Z" fill="${SQ_CREAM}"/><path d="M64 40 L66.5 46.5 L73 47 L68 51.5 L69.5 58 L64 54.5 L58.5 58 L60 51.5 L55 47 L61.5 46.5 Z" fill="#d4a64a"/>`),
};
const sqEmblem = (t, size, cls = "") => { const h = sqHouse(t); return `<svg class="sq-emb ${cls}" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${SQ_EMBLEM[h.art](h.hx)}</svg>`; };
// a band of eight-pointed stars between two gold rules, and the shared gradients/patterns
(() => {
  const st = (cx, r) => { let d = ""; for (let k = 0; k < 16; k++) { const a = (Math.PI / 8) * k - Math.PI / 2, rr = k % 2 ? r * 0.72 : r; d += `${k ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(2)} ${(10 + rr * Math.sin(a)).toFixed(2)}`; } return d + "Z"; };
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><rect width="40" height="20" fill="#24533a"/><rect width="40" height="2" fill="#d4a64a"/><rect y="18" width="40" height="2" fill="#d4a64a"/><path d="${st(10, 7)}" fill="#3f8f5a" stroke="#d4a64a" stroke-width=".8"/><circle cx="10" cy="10" r="2.2" fill="#f3e7cf"/><path d="M26 10l4 -4l4 4l-4 4z" fill="none" stroke="#d4a64a" stroke-width="1"/><path d="M20 10h2M38 10h2" stroke="#d4a64a" stroke-width="1"/></svg>`;
  document.documentElement.style.setProperty("--sq-band", `url("data:image/svg+xml,${encodeURIComponent(s)}")`);
  document.body.insertAdjacentHTML("beforeend", '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="sq-shine" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient><pattern id="sq-shm" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fbfbf8"/><path d="M0 0h7M0 0v7" stroke="#c8232c" stroke-width="2.6"/></pattern></defs></svg>');
})();
// line icons for the tiles (24×24, currentColor)
const SQ_TI = {
  gate: '<path d="M4 21V9a8 8 0 0 1 16 0v12M8 21v-8a4 4 0 0 1 8 0v8M2 21h20"/>',
  bait: '<rect x="3" y="9" width="18" height="11" rx="1.5"/><path d="M3 9l2-4h14l2 4M12 9v11M9 14h6"/>',
  masjid: '<path d="M5 21v-7a7 7 0 0 1 14 0v7M3 21h18M12 7V4M10.5 5.5h3M2 21V10l1.5-2L5 10M19 10l1.5-2L22 10v11"/>',
  caravan: '<path d="M3 20c0-3 1-4 3-4l1-4c1-2 3-2 4 0l1 2h3l2-3c1-1 3-1 3 1v2l-2 2v4M7 16v4M15 16v4M18 12l2-2"/>',
  dates: '<path d="M12 3v4M8 5l4 2 4-2"/><ellipse cx="8" cy="12" rx="2.2" ry="3"/><ellipse cx="12.5" cy="13" rx="2.2" ry="3"/><ellipse cx="10" cy="18" rx="2.2" ry="3"/><ellipse cx="15" cy="18.5" rx="2.2" ry="3"/>',
  cloth: '<path d="M4 7h14a2 2 0 0 1 0 4H4zM6 11h14a2 2 0 0 1 0 4H6zM4 15h14a2 2 0 0 1 0 4H4z"/>',
  needle: '<path d="M5 19L19 5M16 4l4 4M4 20c4-1 6-6 2-8s-2-6 2-6"/>',
  spice: '<path d="M4 20l4-9 4 9M12 20l4-12 4 12M3 20h18"/>',
  jar: '<path d="M9 3h6M10 3v3c-3 1-5 4-5 8a7 7 0 0 0 14 0c0-4-2-7-5-8V3M7 13h10"/>',
  scale: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
  anvil: '<path d="M4 9h12c0 3 2 4 4 4v2H8l-2 3h8M2 9h2l2 4"/>',
  deal: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  sadaqa: '<path d="M7 11V6a2 2 0 0 1 4 0v5M11 9V4a2 2 0 0 1 4 0v7M3 13l3-2 4 5h6l3-3 2 2-4 6H9z"/>',
  khan: '<path d="M3 21V8l9-5 9 5v13M3 21h18M9 21v-6a3 3 0 0 1 6 0v6M7 10h2M15 10h2"/>',
  star: '<path d="M12 2l2.4 4.9 5.2-1.1-1.1 5.2L23 13l-4.5 2.4 1.1 5.2-5.2-1.1L12 24l-2.4-4.5-5.2 1.1 1.1-5.2L1 13l4.5-2.4-1.1-5.2 5.2 1.1z" fill="currentColor" stroke="none"/>',
};
const sqIc = (k, cls = "sq-ic") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SQ_TI[k]}</svg>`;

// the isometric town: an 8×8 block; the street is the ring of cells 1..6, the shops stand on the outer ring
const SQ_ISO = { W: 150, H: 75, OX: 800, OY: 246 };
const sqP = (x, y, z = 0) => [SQ_ISO.OX + ((x - y) * SQ_ISO.W) / 2, SQ_ISO.OY + ((x + y) * SQ_ISO.H) / 2 - z];
const sqPt = (a) => `${a[0].toFixed(1)},${a[1].toFixed(1)}`;
const sqPoly = (pts, fill, extra = "") => `<polygon points="${pts.map(sqPt).join(" ")}" fill="${fill}" ${extra}/>`;
const SQ_OUT = 'stroke="#5a3a1c" stroke-width="2" stroke-linejoin="round"';
const SQ_STREET = (() => { const s = []; for (let k = 0; k < 5; k++) s.push([6 - k, 6]); for (let k = 0; k < 5; k++) s.push([1, 6 - k]); for (let k = 0; k < 5; k++) s.push([1 + k, 1]); for (let k = 0; k < 5; k++) s.push([6, 1 + k]); return s; })();
const SQ_LOT = SQ_STREET.map(([x, y], i) => (i === 0 ? [7, 7] : i === 5 ? [0, 7] : i === 10 ? [0, 0] : i === 15 ? [7, 0] : y === 6 ? [x, 7] : x === 1 ? [0, y] : y === 1 ? [x, 0] : [7, y]));
function sqBox(x0, y0, x1, y1, h, c = {}, z = 0) {
  const top = c.top || "#ecd6a8", left = c.left || "#cfa46b", right = c.right || "#b98a55";
  return sqPoly([sqP(x0, y1, z), sqP(x1, y1, z), sqP(x1, y1, z + h), sqP(x0, y1, z + h)], left, SQ_OUT) +
    sqPoly([sqP(x1, y0, z), sqP(x1, y1, z), sqP(x1, y1, z + h), sqP(x1, y0, z + h)], right, SQ_OUT) +
    sqPoly([sqP(x0, y0, z + h), sqP(x1, y0, z + h), sqP(x1, y1, z + h), sqP(x0, y1, z + h)], top, SQ_OUT);
}
function sqFace(f, b, u, v) { const [x0, y0, x1, y1, h, z] = b; return f === "L" ? sqP(x0 + (x1 - x0) * u, y1, z + h * v) : sqP(x1, y0 + (y1 - y0) * u, z + h * v); }
function sqDoor(f, b, u0, u1, v1, fill = "#4a2c14") {
  const pts = [sqFace(f, b, u0, 0)];
  for (let k = 0; k <= 10; k++) { const a = Math.PI * (k / 10); pts.push(sqFace(f, b, (u0 + u1) / 2 - (Math.cos(a) * (u1 - u0)) / 2, v1 + Math.sin(a) * 0.2)); }
  pts.push(sqFace(f, b, u1, 0));
  return sqPoly(pts, fill, 'stroke="#3a2210" stroke-width="1.5"');
}
const sqSlit = (f, b, u, v) => sqPoly([sqFace(f, b, u - 0.04, v), sqFace(f, b, u + 0.04, v), sqFace(f, b, u + 0.04, v + 0.16), sqFace(f, b, u - 0.04, v + 0.16)], "#5a3a1c");
// the crenellated parapet of a Hijazi mud house
function sqParapet(b) {
  const [x0, y0, x1, y1, h, z] = b; let g = "";
  for (let k = 0; k < 5; k++) {
    const u = (k + 0.5) / 5;
    g += sqPoly([sqP(x0 + (x1 - x0) * (u - 0.07), y1, z + h), sqP(x0 + (x1 - x0) * u, y1, z + h + 12), sqP(x0 + (x1 - x0) * (u + 0.07), y1, z + h)], "#cfa46b", SQ_OUT);
    g += sqPoly([sqP(x1, y0 + (y1 - y0) * (u - 0.07), z + h), sqP(x1, y0 + (y1 - y0) * u, z + h + 12), sqP(x1, y0 + (y1 - y0) * (u + 0.07), z + h)], "#b98a55", SQ_OUT);
  }
  return g;
}
// a cloth awning over the door, in the colour of the shop's street
function sqAwning(f, b, u0, u1, v, col) {
  const [x0, y0, x1, y1, h, z] = b, out = 0.2, zz = z + h * v;
  const P = f === "L" ? [sqP(x0 + (x1 - x0) * u0, y1, zz), sqP(x0 + (x1 - x0) * u1, y1, zz), sqP(x0 + (x1 - x0) * u1, y1 + out, zz - 18), sqP(x0 + (x1 - x0) * u0, y1 + out, zz - 18)]
    : [sqP(x1, y0 + (y1 - y0) * u0, zz), sqP(x1, y0 + (y1 - y0) * u1, zz), sqP(x1 + out, y0 + (y1 - y0) * u1, zz - 18), sqP(x1 + out, y0 + (y1 - y0) * u0, zz - 18)];
  const m = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  let stripes = "";
  for (let k = 1; k < 6; k += 2) { const a = k / 6, a2 = (k + 1) / 6; stripes += sqPoly([m(P[0], P[1], a), m(P[0], P[1], a2), m(P[3], P[2], a2), m(P[3], P[2], a)], "rgba(255,255,255,.35)"); }
  return sqPoly(P, col, SQ_OUT) + stripes;
}
const sqPalm = (x, y, s = 1) => { const [px, py] = sqP(x, y); return `<g transform="translate(${px} ${py}) scale(${s})"><ellipse cx="0" cy="0" rx="22" ry="9" fill="#000" opacity=".15"/><path d="M0 0 Q-6 -50 4 -96" stroke="#7a5230" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M0 -20h6M-1 -40h6M1 -60h6M2 -78h6" stroke="#5a3a1c" stroke-width="2"/><g fill="#3f8f5a" stroke="#24533a" stroke-width="1.5"><path d="M4 -96q-34 -10 -54 12q26 -8 54 -6z"/><path d="M4 -96q34 -14 56 6q-26 -8 -56 -2z"/><path d="M4 -96q-14 -28 -40 -32q22 12 36 36z"/><path d="M4 -96q16 -28 40 -28q-22 10 -36 32z"/><path d="M4 -96q-30 4 -42 34q18 -20 42 -30z"/><path d="M4 -96q30 2 42 32q-18 -20 -42 -28z"/></g><g fill="#a0522d"><circle cx="-2" cy="-90" r="4"/><circle cx="7" cy="-89" r="4"/><circle cx="2" cy="-86" r="4"/></g></g>`; };
// a person in a thobe; a house's trader carries a little banner with its crest
function sqPerson(col, o = {}) {
  const head = o.f ? '<path d="M-9 -38 Q0 -54 9 -38 L10 -28 L-10 -28Z" fill="#1d1d24" stroke="#2b1a0e" stroke-width="1.5"/><circle cx="0" cy="-38" r="6" fill="#c98d5a"/>' : `<circle cx="0" cy="-39" r="7.5" fill="#c98d5a" stroke="#2b1a0e" stroke-width="1.5"/><path d="M-9 -40 Q0 -53 9 -40 L11 -30 L6 -36 L-6 -36 L-11 -30Z" fill="${o.cloth || "#fbfbf8"}" stroke="#2b1a0e" stroke-width="1.5"/><path d="M-8 -44.5h16" stroke="#2b1a0e" stroke-width="2.6" stroke-linecap="round"/>`;
  const flag = o.t !== undefined ? `<path d="M12 -8V-70" stroke="#6b3e1f" stroke-width="3" stroke-linecap="round"/><svg x="12" y="-80" width="26" height="26" viewBox="0 0 100 100">${SQ_EMBLEM[sqHouse(o.t).art](sqHouse(o.t).hx)}</svg>` : "";
  return `<ellipse cx="0" cy="0" rx="14" ry="5.5" fill="#000" opacity=".25"/><g class="sq-bod">${flag}<path d="M-11 -1 L-8 -31 Q0 -37 8 -31 L11 -1 Z" fill="${o.f ? "#1d1d24" : col}" stroke="#2b1a0e" stroke-width="2" stroke-linejoin="round"/>${o.f ? `<path d="M-6 -30 L-4 -2 M6 -30 L4 -2" stroke="${col}" stroke-width="3"/>` : '<path d="M-2 -31 L0 -18 L2 -31" stroke="#fff" stroke-width="1.5" fill="none"/>'}${head}</g>`;
}
// what stands on each lot
function sqBuilding(S, t, i) {
  const [lx, ly] = SQ_LOT[i], m = 0.1, front = ly === 7 || lx === 7, o = S.own[t.i], w = S.waqf[t.i] !== undefined, ext = (o && o.ext) || 0;
  const col = t.g ? SQ_GROUPS[t.g].c : "#2d6a5a", face = lx === 0 ? "R" : "L";
  let g = "";
  if (t.k === "gate") {
    g += sqBox(lx + 0.08, ly + 0.08, lx + 0.32, ly + 0.92, 120) + sqBox(lx + 0.68, ly + 0.08, lx + 0.92, ly + 0.92, 120);
    return g + sqBox(lx + 0.08, ly + 0.36, lx + 0.92, ly + 0.64, 34, {}, 120) + sqParapet([lx + 0.08, ly + 0.36, lx + 0.92, ly + 0.64, 34, 120]);
  }
  if (t.k === "masjid") {
    const b = [lx + 0.05, ly + 0.05, lx + 0.95, ly + 0.95, 96, 0];
    g += sqBox(...b.slice(0, 5)) + sqParapet(b) + sqDoor("L", b, 0.38, 0.62, 0.45) + sqDoor("R", b, 0.38, 0.62, 0.45) + sqSlit("L", b, 0.18, 0.55) + sqSlit("L", b, 0.82, 0.55);
    const [dx, dy] = sqP(lx + 0.5, ly + 0.5, 96);
    g += `<path d="M${dx - 52} ${dy} a52 56 0 0 1 104 0z" fill="#e8f0ea" stroke="#5a3a1c" stroke-width="2"/><path d="M${dx} ${dy - 56}v-18" stroke="#c9a24a" stroke-width="4"/><path d="M${dx - 6} ${dy - 80}a8 8 0 1 0 10 -2" fill="none" stroke="#c9a24a" stroke-width="3"/>`;
    const mb = [lx + 0.06, ly + 0.06, lx + 0.26, ly + 0.26];
    g += sqBox(...mb, 210, { top: "#f4e6c4", left: "#e0c48f", right: "#c9a874" }) + sqBox(mb[0] - 0.02, mb[1] - 0.02, mb[2] + 0.02, mb[3] + 0.02, 8, { top: "#f4e6c4" }, 150);
    const [mx, my] = sqP(lx + 0.16, ly + 0.16, 210);
    return g + `<path d="M${mx - 16} ${my} a16 22 0 0 1 32 0z" fill="#e8f0ea" stroke="#5a3a1c" stroke-width="2"/><path d="M${mx} ${my - 22}v-10" stroke="#c9a24a" stroke-width="3"/>`;
  }
  if (t.k === "bait") {
    const b = [lx + 0.1, ly + 0.1, lx + 0.9, ly + 0.9, 84, 0];
    g += sqBox(...b.slice(0, 5)) + sqParapet(b) + sqDoor("R", b, 0.3, 0.7, 0.42, "#6b3e1f") + sqSlit("L", b, 0.3, 0.55) + sqSlit("L", b, 0.7, 0.55);
    const [cx, cy] = sqFace("R", b, 0.5, 0.86);
    return g + `<g transform="translate(${cx} ${cy})"><circle r="13" fill="#d4a64a" stroke="#5a3a1c" stroke-width="2"/><circle r="6" fill="none" stroke="#3f2412" stroke-width="2"/></g>`;
  }
  if (t.k === "caravan") {
    g += sqPoly([sqP(lx + 0.1, ly + 0.15), sqP(lx + 0.8, ly + 0.15), sqP(lx + 0.8, ly + 0.6), sqP(lx + 0.1, ly + 0.6)], "rgba(0,0,0,.12)");
    const [ax, ay] = sqP(lx + 0.45, ly + 0.38);
    g += `<path d="M${ax - 70} ${ay + 10} L${ax} ${ay - 70} L${ax + 70} ${ay + 10} Z" fill="#3a2a22" stroke="#1d140f" stroke-width="2"/><path d="M${ax - 70} ${ay + 10} L${ax} ${ay - 70} L${ax + 8} ${ay + 18} Z" fill="#53402f"/><path d="M${ax - 50} ${ay - 6}h100M${ax - 30} ${ay - 30}h60" stroke="#c9a24a" stroke-width="3" stroke-dasharray="6 6"/>`;
    for (const [cxg, cyg, s] of [[0.35, 0.8, 1], [0.75, 0.75, 0.9]]) { const [cx, cy] = sqP(lx + cxg, ly + cyg); g += `<g transform="translate(${cx} ${cy}) scale(${s})"><ellipse rx="34" ry="8" fill="#000" opacity=".2"/><path d="M-26 0v-30M-14 0v-28M14 0v-28M24 0v-30" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/><path d="M-32 -30 Q-30 -54 -10 -50 Q0 -70 12 -52 Q28 -56 30 -34 Q30 -26 20 -26 L-28 -26 Q-34 -26 -32 -30Z" fill="#c8955a" stroke="#5a3a1c" stroke-width="2"/><path d="M28 -36 Q40 -48 38 -64 Q46 -70 50 -62 Q50 -56 44 -56 Q44 -40 34 -30" fill="#c8955a" stroke="#5a3a1c" stroke-width="2"/><path d="M-12 -52 l6 -10 6 10" fill="#a2552c" stroke="#5a3a1c" stroke-width="1.5"/></g>`; }
    return g;
  }
  if (t.k === "deal") {
    const [bx, by] = sqP(lx + 0.5, ly + 0.5);
    return `<g transform="translate(${bx} ${by})"><ellipse rx="40" ry="12" fill="#000" opacity=".15"/><path d="M-28 0v-64M28 0v-64" stroke="#6b3e1f" stroke-width="6" stroke-linecap="round"/><rect x="-38" y="-96" width="76" height="46" rx="4" fill="#8a5a2b" stroke="#3f2412" stroke-width="2"/><rect x="-30" y="-90" width="26" height="34" fill="#fbf3df" transform="rotate(-4 -17 -73)"/><rect x="2" y="-88" width="28" height="30" fill="#fff8e6" transform="rotate(3 16 -73)"/><path d="M-26 -82h18M-26 -76h14M-26 -70h18M6 -80h18M6 -74h14" stroke="#806849" stroke-width="2"/><circle cx="-17" cy="-90" r="3" fill="#b3261e"/><circle cx="16" cy="-88" r="3" fill="#b3261e"/></g>`;
  }
  if (t.k === "sadaqa") {
    const b = [lx + 0.25, ly + 0.25, lx + 0.75, ly + 0.75, 46, 0];
    g += sqBox(...b.slice(0, 5)) + sqDoor(face, b, 0.25, 0.75, 0.3, "#2a5c6b");
    const [dx, dy] = sqP(lx + 0.5, ly + 0.5, 46);
    g += `<path d="M${dx - 26} ${dy} a26 26 0 0 1 52 0z" fill="#e8d3a6" stroke="#5a3a1c" stroke-width="2"/>`;
    for (const [jx, jy] of [[0.18, 0.85], [0.85, 0.2]]) { const [px, py] = sqP(lx + jx, ly + jy); g += `<g transform="translate(${px} ${py})"><path d="M-8 0 Q-14 -14 -6 -22 L-6 -28 L6 -28 L6 -22 Q14 -14 8 0Z" fill="#b5652f" stroke="#5a3a1c" stroke-width="1.5"/></g>`; }
    return g;
  }
  // a shop or a khan
  if (front && t.g !== "k") {
    // the near rows are open stalls, low enough to see the street behind them
    g += sqBox(lx + 0.14, ly + 0.14, lx + 0.86, ly + 0.86, 26, { top: "#b98a55", left: "#8a5a2b", right: "#6b3e1f" });
    const goods = { t: ["#6b3e1f", "#8a4b20", "#a0522d"], q: ["#2f6fb0", "#d4a64a", "#b3261e"], a: ["#c27a3a", "#a2552c", "#e2b04a"], h: ["#9aa3ad", "#c9a24a", "#6b5aa8"] }[t.g];
    for (let k = 0; k < 6; k++) { const [gx, gy] = sqP(lx + 0.28 + (k % 3) * 0.22, ly + 0.32 + Math.floor(k / 3) * 0.3, 26); g += `<ellipse cx="${gx}" cy="${gy - 6}" rx="13" ry="9" fill="${goods[k % 3]}" stroke="#3a2210" stroke-width="1.5"/>`; }
    const hh = 74 + ext * 16;
    for (const [px, py] of [[0.16, 0.16], [0.84, 0.16], [0.84, 0.84], [0.16, 0.84]]) g += `<path d="M${sqPt(sqP(lx + px, ly + py))}L${sqPt(sqP(lx + px, ly + py, hh))}" stroke="#5a3a1c" stroke-width="4"/>`;
    g += sqPoly([sqP(lx + 0.08, ly + 0.08, hh), sqP(lx + 0.92, ly + 0.08, hh), sqP(lx + 0.92, ly + 0.92, hh - 14), sqP(lx + 0.08, ly + 0.92, hh - 14)], col, SQ_OUT + ' opacity=".93"');
    for (let k = 1; k < 6; k += 2) g += sqPoly([sqP(lx + 0.08 + k * 0.14, ly + 0.08, hh), sqP(lx + 0.08 + (k + 1) * 0.14, ly + 0.08, hh), sqP(lx + 0.08 + (k + 1) * 0.14, ly + 0.92, hh - 14), sqP(lx + 0.08 + k * 0.14, ly + 0.92, hh - 14)], "rgba(255,255,255,.28)");
    if (ext >= 1) g += sqBox(lx + 0.6, ly + 0.02, lx + 0.98, ly + 0.4, 34);
    if (ext >= 2) g += sqBox(lx + 0.02, ly + 0.6, lx + 0.4, ly + 0.98, 34);
  } else {
    const hb = t.g === "k" ? 92 : 70 + ext * 30, b = [lx + m, ly + m, lx + 1 - m, ly + 1 - m, hb, 0];
    g += sqBox(...b.slice(0, 5)) + sqParapet(b);
    if (ext >= 1) g += `<path d="M${sqPt(sqFace(face, b, 0, 0.55))}L${sqPt(sqFace(face, b, 1, 0.55))}" stroke="#b98a55" stroke-width="3"/>`;
    g += sqDoor(face, b, t.g === "k" ? 0.3 : 0.36, t.g === "k" ? 0.7 : 0.64, t.g === "k" ? 0.42 : 0.38) + sqSlit(face, b, 0.16, 0.6) + sqSlit(face, b, 0.84, 0.6);
    if (ext >= 2) g += sqSlit(face, b, 0.5, 0.82) + sqSlit(face, b, 0.3, 0.82) + sqSlit(face, b, 0.7, 0.82);
    if (t.g !== "k") g += sqAwning(face, b, 0.22, 0.78, ext >= 1 ? 0.48 : 0.62, col);
    else { const [kx, ky] = sqFace(face, b, 0.5, 0.92); g += `<path d="M${kx - 26} ${ky}h52" stroke="#2d6a5a" stroke-width="7"/>`; }
  }
  // the owner's flag on the roof (and the partner's under it); a waqf flies green
  const top = front && t.g !== "k" ? 74 + ext * 16 : t.g === "k" ? 92 : 70 + ext * 30;
  if (o) { const [fx, fy] = sqP(lx + 0.5, ly + 0.5, top); g += `<path d="M${fx} ${fy}v-46" stroke="#3a2210" stroke-width="3"/><path d="M${fx} ${fy - 46} l38 9 -38 9z" fill="${sqHouse(o.id).hx}" stroke="#2b1a0e" stroke-width="1.5"/>${o.partner !== undefined ? `<path d="M${fx} ${fy - 28} l26 6 -26 6z" fill="${sqHouse(o.partner).hx}" stroke="#2b1a0e" stroke-width="1.5"/>` : ""}`; }
  if (w) { const [fx, fy] = sqP(lx + 0.5, ly + 0.5, top); g += `<path d="M${fx} ${fy}v-40" stroke="#3a2210" stroke-width="3"/><path d="M${fx} ${fy - 40} l36 9 -36 9z" fill="#2f8a4c" stroke="#2b1a0e" stroke-width="1.5"/>`; }
  return g;
}
// the sign above each building: its name, its price or rent, and a star per extension
function sqSign(S, t, i, hl) {
  const [lx, ly] = SQ_LOT[i], o = S.own[t.i], w = S.waqf[t.i] !== undefined;
  const hgt = { gate: 168, masjid: 160, bait: 112, caravan: 104, deal: 104, sadaqa: 84 }[t.k];
  const z = hgt !== undefined ? hgt : ly === 7 || lx === 7 ? (t.g === "k" ? 120 : 100) : 112;
  const [x, y] = sqP(lx + 0.5, ly + 0.5, z + (o || w ? 44 : 0));
  const big = !!t.corner, col = t.g ? SQ_GROUPS[t.g].c : "#3f7d4e";
  const sub = w ? "وقف" : t.price ? (o ? `الأجرة ${sqN(sqRent(S, t.i))}` : `${sqN(t.price)} دينار`) : SQ_TILE_SUB[t.k];
  const wd = Math.max(t.n.length, sub.length) * (big ? 12 : 10) + 24, ht = big ? 48 : 42;
  return `<g transform="translate(${x.toFixed(1)} ${(y - 14).toFixed(1)})" class="sq-sg ${hl ? "hl" : ""}"><rect x="${-wd / 2}" y="${-ht}" width="${wd}" height="${ht}" rx="9" fill="${big ? "#24533a" : "#fffaf0"}" stroke="${hl ? "#d4a64a" : "#3f2412"}" stroke-width="${hl ? 5 : 2}"/>${t.g ? `<rect x="${-wd / 2 + 2}" y="${-ht + 2}" width="${wd - 4}" height="8" rx="4" fill="${col}"/>` : ""}<text y="${-ht + (big ? 25 : 23)}" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="${big ? 21 : 17}" fill="${big ? "#f3d58a" : "#3f2412"}">${t.n}</text><text y="-8" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-weight="700" font-size="${big ? 13.5 : 12}" fill="${big ? "#cfe8c9" : w ? "#2f8a4c" : "#806849"}">${sub}</text>${o && o.ext ? `<text x="${wd / 2 - 4}" y="${-ht - 4}" text-anchor="end" font-family="Lalezar" font-size="16" fill="#9b7424">${"★".repeat(o.ext)}</text>` : ""}</g>`;
}
// the whole town as one SVG; the traders walk in a layer of their own
function sqTown(S, hl) {
  let g = '<defs><pattern id="sq-cob" width="26" height="13" patternUnits="userSpaceOnUse"><rect width="26" height="13" fill="#d8c29a"/><path d="M0 6.5h26M13 0v6.5M0 13V6.5M26 13V6.5" stroke="#bfa678" stroke-width="1.5"/></pattern><pattern id="sq-plaza" width="40" height="20" patternUnits="userSpaceOnUse"><rect width="40" height="20" fill="#eadbb6"/><path d="M20 0 L40 10 L20 20 L0 10Z" fill="none" stroke="#d6c193" stroke-width="1.5"/></pattern><radialGradient id="sq-sky" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fbf1d8"/><stop offset="1" stop-color="#ecd5a3"/></radialGradient></defs>';
  g += '<rect width="1600" height="900" fill="url(#sq-sky)"/>';
  g += '<path d="M0 230 L120 170 L230 210 L330 140 L470 205 L560 180 L640 220 L0 260Z" fill="#d9c08f" opacity=".7"/><path d="M960 220 L1060 160 L1150 200 L1260 120 L1380 190 L1480 150 L1600 210 L1600 260 L960 240Z" fill="#d9c08f" opacity=".7"/>';
  g += sqPoly([sqP(-0.6, -0.6), sqP(8.6, -0.6), sqP(8.6, 8.6), sqP(-0.6, 8.6)], "#e3cb98", 'stroke="#c9ad74" stroke-width="3"');
  g += sqPoly([sqP(0, 0), sqP(8, 0), sqP(8, 8), sqP(0, 8)], "#dcc08a");
  g += sqPoly([sqP(1, 1), sqP(7, 1), sqP(7, 7), sqP(1, 7)], "url(#sq-cob)", 'stroke="#a88a58" stroke-width="2"');
  g += sqPoly([sqP(2, 2), sqP(6, 2), sqP(6, 6), sqP(2, 6)], "url(#sq-plaza)", 'stroke="#a88a58" stroke-width="2"');
  SQ_STREET.forEach(([x, y], i) => {
    const t = SQ_T[i], col = t.g ? SQ_GROUPS[t.g].c : null, on = hl === i;
    g += sqPoly([sqP(x + 0.04, y + 0.04), sqP(x + 0.96, y + 0.04), sqP(x + 0.96, y + 0.96), sqP(x + 0.04, y + 0.96)], on ? "rgba(212,166,74,.55)" : "rgba(255,255,255,.12)", `stroke="${on ? "#d4a64a" : "rgba(90,58,28,.25)"}" stroke-width="${on ? 5 : 1.5}"`);
    if (col) { const [lx, ly] = SQ_LOT[i], e = lx === 0 ? [sqP(x + 0.04, y + 0.04), sqP(x + 0.04, y + 0.96)] : ly === 0 ? [sqP(x + 0.04, y + 0.04), sqP(x + 0.96, y + 0.04)] : lx === 7 ? [sqP(x + 0.96, y + 0.04), sqP(x + 0.96, y + 0.96)] : [sqP(x + 0.04, y + 0.96), sqP(x + 0.96, y + 0.96)]; g += `<path d="M${sqPt(e[0])}L${sqPt(e[1])}" stroke="${col}" stroke-width="9" stroke-linecap="round"/>`; }
    if (i === 0) { const [ax, ay] = sqP(x + 0.5, y + 0.5); g += `<text x="${ax}" y="${ay + 8}" text-anchor="middle" font-family="Lalezar" font-size="24" fill="#8a6c40" opacity=".8">البداية</text>`; }
  });
  // the square: the fountain, palms and a few stalls, then the buildings back to front
  const items = [];
  items.push([4, 4, () => { const [fx, fy] = sqP(4, 4); return `<ellipse cx="${fx}" cy="${fy}" rx="96" ry="48" fill="#cdb88c" stroke="#5a3a1c" stroke-width="2"/><ellipse cx="${fx}" cy="${fy - 10}" rx="96" ry="48" fill="#e8d3a6" stroke="#5a3a1c" stroke-width="2"/><ellipse cx="${fx}" cy="${fy - 12}" rx="80" ry="38" fill="#8cc3c8"/><ellipse class="sq-rip" cx="${fx}" cy="${fy - 12}" rx="40" ry="19" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7"/><path d="M${fx - 9} ${fy - 12}v-46h18v46" fill="#e8d3a6" stroke="#5a3a1c" stroke-width="2"/><path d="M${fx} ${fy - 58} q-26 6 -30 30 M${fx} ${fy - 58} q26 6 30 30" stroke="#bfe6ea" stroke-width="4" fill="none"/>`; }]);
  for (const [x, y, s] of [[2.5, 2.6, 1], [5.5, 2.5, 0.9], [2.4, 5.4, 0.85], [5.6, 5.5, 0.8]]) items.push([x, y, () => sqPalm(x, y, s)]);
  for (const [x, y, c] of [[3.3, 2.6, "#b3261e"], [2.6, 3.6, "#2f6fb0"], [5.3, 4.4, "#3f7d4e"]]) items.push([x, y, () => { const [ux, uy] = sqP(x, y); return `<g transform="translate(${ux} ${uy})"><ellipse rx="30" ry="12" fill="#000" opacity=".15"/><path d="M0 0v-52" stroke="#5a3a1c" stroke-width="3"/><path d="M-36 -40 Q0 -76 36 -40 Q0 -50 -36 -40Z" fill="${c}" stroke="#3a2210" stroke-width="2"/><rect x="-18" y="-16" width="36" height="16" fill="#b98a55" stroke="#5a3a1c" stroke-width="1.5"/></g>`; }]);
  SQ_STREET.forEach((s, i) => items.push([SQ_LOT[i][0] + 0.5, SQ_LOT[i][1] + 0.5, () => sqBuilding(S, SQ_T[i], i)]));
  items.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[0] - b[0]);
  g += items.map((x) => x[2]()).join("");
  const npc = [["#fbfbf8", "M 650 470 L 950 470 L 800 545 L 650 470", 26], ["#b98a55", "M 960 520 L 760 420 L 640 480 L 960 520", 32], ["#e8e1cf", "M 700 560 L 900 560 L 820 420 L 700 560", 36]];
  g += npc.map(([c, d, s], k) => `<g>${sqPerson(c, { f: k === 2, cloth: k === 1 ? "url(#sq-shm)" : undefined })}<animateMotion dur="${s}s" repeatCount="indefinite" path="${d}"/></g>`).join("");
  g += SQ_STREET.map((s, i) => sqSign(S, SQ_T[i], i, hl === i)).join("");
  return g;
}
// where a house's trader stands on a street cell (four spots so they never overlap)
function sqTraderXY(t, pos) { const [x, y] = SQ_STREET[pos], off = [[0.32, 0.32], [0.68, 0.32], [0.68, 0.68], [0.32, 0.68]][t % 4]; return sqP(x + off[0], y + off[1]); }

// the game's card art and icon in فسحة's «الفسحة» identity (colour #b07a2e, an arch and a palm)
const SQ_CARD = "<svg viewBox=\"0 0 300 200\" role=\"img\" aria-label=\"سوق المدينة\"><defs><pattern id=\"c-souq\" width=\"9\" height=\"9\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(30)\"><circle cx=\"4.5\" cy=\"4.5\" r=\"1.6\" fill=\"#000\" opacity=\".16\"/></pattern></defs><rect width=\"300\" height=\"200\" fill=\"#b07a2e\"/><rect width=\"300\" height=\"200\" fill=\"url(#c-souq)\"/><circle cx=\"150\" cy=\"100\" r=\"86\" fill=\"#fff6dc\" opacity=\".1\"/><g transform=\"translate(88 38) scale(1.24)\"><rect x=\"10\" y=\"34\" width=\"50\" height=\"54\" fill=\"#fff6dc\"/><path d=\"M10 34h50\" stroke=\"#ffc933\" stroke-width=\"5\"/><path d=\"M24 88V64a11 11 0 0 1 22 0v24z\" fill=\"#b07a2e\"/><path d=\"M76 88q-3-24 3-42\" stroke=\"#fff6dc\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M79 46q-16-7-26 3q13-3 26 0zM79 46q16-7 24 4q-12-4-24-1zM79 46q-6-14-20-15q10 5 19 15zM79 46q6-14 20-14q-10 5-19 14z\" fill=\"#ffc933\"/></g><g transform=\"translate(244 30) rotate(8)\"><rect x=\"-42\" y=\"-16\" width=\"84\" height=\"32\" rx=\"16\" fill=\"#ffc933\" stroke=\"#1b2a4a\" stroke-width=\"3\"/><text y=\"7\" text-anchor=\"middle\" font-family=\"Lalezar, sans-serif\" font-size=\"18\" fill=\"#1b2a4a\">قريبًا</text></g></svg>";
const SQ_ICON = "<svg viewBox=\"0 0 100 100\" aria-hidden=\"true\"><rect width=\"100\" height=\"100\" rx=\"24\" fill=\"#b07a2e\"/><g transform=\"translate(16 16) scale(.68)\"><rect x=\"10\" y=\"34\" width=\"50\" height=\"54\" fill=\"#fff6dc\"/><path d=\"M10 34h50\" stroke=\"#ffc933\" stroke-width=\"5\"/><path d=\"M24 88V64a11 11 0 0 1 22 0v24z\" fill=\"#b07a2e\"/><path d=\"M76 88q-3-24 3-42\" stroke=\"#fff6dc\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M79 46q-16-7-26 3q13-3 26 0zM79 46q16-7 24 4q-12-4-24-1zM79 46q-6-14-20-15q10 5 19 15zM79 46q6-14 20-14q-10 5-19 14z\" fill=\"#ffc933\"/></g></svg>";
// the room's title bar carries the icon (room.js writes the name as text on every snapshot)
function sqHead() { const el = $("gTitle"); if (el && !el.querySelector(".sq-gico")) el.innerHTML = `<span class="sq-gico">${SQ_ICON}</span>${ROOM_GAMES.souq.name}`; }
function sqCardArt() { return `<div class="gart market">${SQ_CARD}</div>`; }

// ================= the room =================
ROOM_GAMES.souq = {
  name: "سوق المدينة", theme: "souq", min: 2, need: "يحتاج لاعب في دارين على الأقل", who: "٢ إلى ٤ دُور · تجارة وأسئلة",
  rules: [
    "كل فريق دار تجارية، ولها تاجر يمشي في سوق المدينة: دكاكين وخانات حول ساحة النافورة.",
    "كل جولة سؤال للجميع، وجواب الأغلبية هو جواب الدار. صح: تختارون تتقدمون ١ أو ٢ أو ٣. غلط: دكان واحد.",
    "الدكان الفارغ تشترونه أو تشاركون فيه دارًا أخرى بالنصف. ومن يقف على دكانكم يدفع لكم أجرته، وتتضاعف إذا ملكتم الشارع كله.",
    "الخانات الثلاثة أجرتها ٥٠ ثم ١٠٠ ثم ٢٠٠ كلما ملكتم منها أكثر. ومن يملك شارعًا كاملًا يوسّع دكانه: دكّة ثم مخزن.",
    SQX.dealsExplain,
    SQX.zakatExplain + " " + SQX.nisab,
    SQX.mudarabaExplain,
    "في كل دور يقرر «التاجر»: لاعب من الدار يتبدّل كل مرة. وإذا تأخر يقدر أي واحد من الدار يقرر بداله.",
    SQX.winExplain + " " + SQX.winFormula + ".",
  ],
  setup(S) {
    Object.assign(S, { nt: 3, rounds: 10, cap: 1000, qtime: 20, picks: ["السعودية", "الخليج والعرب", "جغرافيا", "عامة", "أكل", "حيوانات", "علوم", "ألغاز", "زمن الطيبين"] });
    H.st ||= {};
    H.players.forEach((p) => { if (H.st[p.id] === undefined) ROOM_GAMES.souq.joined(p.id); });
  },
  joined(id) {
    const S = H.S, live = S.phase !== "lobby" && S.teams ? S.teams : Array.from({ length: S.nt || 3 }, (_, t) => t);
    const n = (t) => Object.values(H.st).filter((x) => x === t).length;
    let best = live[0];
    for (const t of live) if (n(t) < n(best)) best = t;
    H.st[id] = best;
  },
  left(id) { delete H.st[id]; },
  snap(S) {
    S.steams = {}; H.players.forEach((p) => (S.steams[p.id] = Math.min(H.st[p.id] ?? 0, (S.nt || 3) - 1)));
    S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
    S.freeLeft = H.anyAt ? Math.max(0, H.anyAt - now()) : 0;
  },
  key: (S) => `${S.sid || ""}:${S.phase}:${S.round || 0}:${S.oi ?? ""}:${S.act && S.act.res ? 1 : 0}:${S.act && S.act.ask ? 1 : 0}`,
  on(m) {
    const S = H.S, Q = H.sq, t = H.st[m.id];
    if (!Q || !m.id || t === undefined || !S.teams || !S.teams.includes(t)) return;
    if (m.t === "sqvote" && S.phase === "q" && Number.isInteger(m.k) && m.k >= 0 && m.k < S.q.o.length) {
      Q.votes[m.id] = m.k; sqTally(); hostSendSoon();
      if (sqVoters().every((id) => Q.votes[id] !== undefined)) H.deadline = Math.min(H.deadline, now() + 700);
      return;
    }
    const mayDecide = t === S.turn && (m.id === (S.trader && S.trader.id) || now() >= H.anyAt);
    if (m.t === "sqstep" && S.phase === "walk" && mayDecide && [1, 2, 3].includes(m.n)) return sqMove(S.turn, m.n);
    if (m.t === "sqdo" && S.phase === "act" && S.act && !S.act.res && !S.act.ask && mayDecide && typeof m.a === "string") return sqDo(m.a);
    if (m.t === "sqpart" && S.phase === "act" && S.act && S.act.ask && !S.act.res && S.act.ask.who.includes(t) && m.yes) return sqPartner(t);
  },
  lobbyPlayers(S) {
    const col = (t) => `<div class="kl-team" style="color:${sqHouse(t).hx}"><b class="sq-lteam">${sqEmblem(t, 26)}${sqHouse(t).n}</b>${S.players.filter((p) => sqTeamOf(S, p.id) === t).map((p) => `<button type="button" class="kl-p" data-ssw="${esc(p.id)}" ${isHost() ? "" : "disabled"}>${face(p, 30)}<span>${esc(p.name)}${p.id === PID ? " (أنت)" : ""}</span></button>`).join("") || '<span class="muted">…</span>'}</div>`;
    return `<p class="muted" style="font-weight:700;color:var(--soft)">الدُّور (${AR(S.players.length)} لاعب)${isHost() ? " · اضغط على لاعب ينقله للدار اللي بعدها" : ""}</p><div class="kl-teams">${Array.from({ length: S.nt }, (_, t) => col(t)).join("")}</div>`;
  },
  lobby(S) {
    const chips = (attr, list, cur, lab) => `<div class="chips pick">${list.map((v) => `<button type="button" class="chip" data-${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${lab(v)}</button>`).join("")}</div>`;
    const h = (t) => `<p class="muted" style="font-weight:700;color:var(--soft)">${t}</p>`;
    return `${h("كم دار؟")}${chips("snt", [2, 3, 4], S.nt, (v) => `${AR(v)} دُور`)}
      ${h("كم جولة؟")}${chips("srd", [8, 10, 12], S.rounds, (v) => `${AR(v)} جولات`)}
      <p class="muted">كل جولة سؤال، ثم تتحرك كل دار وتتصرف. ${AR(10)} جولات بثلاث دُور نحو ${AR(12)} دقيقة. الدورة الكاملة حول السوق (وفيها الزكاة عند الباب) تحتاج عادة ${AR(8)} جولات أو أكثر.</p>
      ${h("رأس المال")}${chips("scap", [800, 1000, 1500], S.cap, (v) => `${sqN(v)} دينار`)}
      <p class="muted">أرخص دكان ${sqN(120)} وأغلاها ${sqN(340)}. ${SQX.nisab}</p>
      ${h("وقت الإجابة")}${chips("sqt", [15, 20, 25], S.qtime, (v) => `${AR(v)} ثانية`)}
      ${h("فئات الأسئلة")}<div class="chips pick">${QCATS.filter((c) => c !== "الأغلبية").map((c) => `<button type="button" class="chip" data-scat="${c}" aria-pressed="${S.picks.includes(c)}">${c}</button>`).join("")}</div>`;
  },
  bindLobby(S) {
    const set = (attr, key) => screen.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { H.S[key] = +b.dataset[attr]; beep(700, 0.04); if (key === "nt") H.players.forEach((p, k) => (H.st[p.id] = k % H.S.nt)); hostSend(); }));
    set("snt", "nt"); set("srd", "rounds"); set("scap", "cap"); set("sqt", "qtime");
    screen.querySelectorAll("[data-scat]").forEach((b) => (b.onclick = () => { const c = b.dataset.scat, p = H.S.picks; H.S.picks = p.includes(c) ? p.filter((x) => x !== c) : [...p, c]; beep(660, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-ssw]").forEach((b) => (b.onclick = () => { const id = b.dataset.ssw; H.st[id] = ((H.st[id] ?? 0) + 1) % H.S.nt; beep(640, 0.04); hostSend(); }));
    const used = new Set(Object.values(S.steams || {}));
    if (used.size < 2 || !S.picks.length) $("start").disabled = true;
  },
  start: () => sqStart(),
  resume(S) {
    if (!(H.usedQ instanceof Set)) H.usedQ = new Set();
    const tick = (fn) => hEvery(() => { if (now() >= H.deadline) fn(); }, 250);
    if (S.phase === "intro") hLater(sqRound, 2500);
    else if (S.phase === "q") tick(sqAfterQ);
    else if (S.phase === "ans") hLater(sqNextTurn, 2500);
    else if (S.phase === "walk") tick(() => sqMove(S.turn, 2));
    else if (S.phase === "move") hLater(sqLand, 1500);
    else if (S.phase === "act") { if (S.act && S.act.res) hLater(sqAfterAct, 2500); else if (S.act && S.act.ask) tick(() => sqPartner(-1)); else tick(sqTimeout); }
    else if (S.phase === "settle") hLater(sqEnd, 2500);
  },
  views: { intro: sqvPlay, q: sqvQ, ans: sqvAns, walk: sqvPlay, move: sqvPlay, act: sqvPlay, settle: sqvPlay, end: sqvEnd },
};

// ---------------- the host ----------------
const sqMembers = (t) => H.players.map((p) => p.id).filter((id) => H.st[id] === t);
const sqVoters = () => H.players.map((p) => p.id).filter((id) => H.S.teams.includes(H.st[id]));
function sqLog(html) { const S = H.S; S.narr = html; S.log = [html, ...(S.log || [])].slice(0, 5); }
function sqFx(t, cls, txt) { const S = H.S; if (!S.fx || S.fx.done) S.fx = { seq: (S.fx ? S.fx.seq : 0) + 1, d: {} }; (S.fx.d[t] ||= []).push([cls, txt]); }
const sqAjr = (n) => `${n > 0 ? "+" : "−"}${AR(Math.abs(n))} ${SQX.ajr}`;
function sqSend() { if (H.S.fx) H.S.fx.done = true; hostSend(); }

function sqStart() {
  hClear();
  const S = H.S;
  const teams = [...new Set(H.players.map((p) => H.st[p.id] ?? 0))].filter((t) => t < S.nt).sort();
  H.usedQ instanceof Set || (H.usedQ = new Set());
  H.sq = { votes: {}, rot: {}, dUsed: [], fUsed: [] };
  Object.assign(S, {
    sid: Math.random().toString(36).slice(2, 8), phase: "intro", teams, round: 0, oi: -1, turn: -1, trader: null,
    cos: Array.from({ length: S.nt }, () => ({ cash: S.cap, ajr: 0, pos: 0, qard: 0, debts: [] })),
    own: {}, waqf: {}, bait: 300, q: null, tally: {}, voted: [], answer: -1, picked: {}, order: [], move: null, act: null, log: [], narr: "", fx: null, rank: null,
  });
  sqLog(`أهلًا بكم في <b>سوق المدينة</b>! كل الدُّور عند باب السوق`);
  H.deadline = 0; H.anyAt = 0;
  sqSend();
  hLater(sqRound, 6500);
}
function sqRound() {
  hClear();
  const S = H.S, Q = H.sq;
  S.round++;
  if (S.round > S.rounds) return sqSettle();
  // what comes due at the start of a round: the waqf's reward, and the debts taken two rounds ago
  S.teams.forEach((t) => {
    const c = S.cos[t], w = Object.values(S.waqf).filter((x) => x === t).length;
    if (w) { c.ajr += w * SQ_PTS.waqf; sqFx(t, "a", sqAjr(w * SQ_PTS.waqf)); }
    c.debts.filter((d) => d.due <= S.round).forEach((d) => { c.cash -= d.amt; sqFx(t, "n", sqSG(-d.amt)); sqLog(`<b>${sqHouse(t).n}</b> سدّدت ${sqN(d.amt)} دينار: ${d.why}`); });
    c.debts = c.debts.filter((d) => d.due > S.round);
    if (c.cash < 0) sqBroke(t);
  });
  const d = drawQuestion(pickOne(S.picks.length ? S.picks : ["عامة"]), H.usedQ);
  Q.q = d; Q.votes = {};
  Object.assign(S, { phase: "q", q: { q: d.q, o: d.o, cat: d.cat }, tally: {}, voted: [], answer: -1, picked: {}, oi: -1, turn: -1, trader: null, move: null, act: null });
  S.teams.forEach((t) => (S.tally[t] = d.o.map(() => 0)));
  sqLog(`الجولة ${AR(S.round)}: سؤال للجميع`);
  S.qT = S.qtime * 1000; H.deadline = now() + S.qT; H.anyAt = 0;
  sqSend();
  hEvery(() => { if (now() >= H.deadline) sqAfterQ(); }, 200);
}
function sqTally() {
  const S = H.S, Q = H.sq;
  S.teams.forEach((t) => (S.tally[t] = S.q.o.map(() => 0)));
  Object.entries(Q.votes).forEach(([id, k]) => { const t = H.st[id]; if (S.tally[t]) S.tally[t][k]++; });
  S.voted = Object.keys(Q.votes);
}
function sqAfterQ() {
  hClear();
  const S = H.S, Q = H.sq;
  if (S.phase !== "q") return;
  sqTally();
  S.answer = Q.q.a;
  S.ok = {};
  S.teams.forEach((t) => { const k = S.tally[t].some((x) => x) ? argmax(S.tally[t]) : -1; S.picked[t] = k; S.ok[t] = k === S.answer; });
  // the house that moves first changes every round
  S.order = S.teams.map((_, k) => S.teams[(k + S.round - 1) % S.teams.length]);
  S.phase = "ans"; H.deadline = 0;
  sqLog(`الإجابة: <b>${esc(S.q.o[S.answer])}</b>`);
  sqSend();
  hLater(sqNextTurn, 4500);
}
function sqNextTurn() {
  hClear();
  const S = H.S, Q = H.sq;
  S.oi++;
  if (S.oi >= S.order.length) return sqRound();
  const t = S.order[S.oi], mem = H.players.filter((p) => H.st[p.id] === t);
  S.turn = t; S.move = null; S.act = null;
  const p = mem.length ? mem[(Q.rot[t] = (Q.rot[t] || 0) + 1) % mem.length] : null;
  S.trader = p ? { id: p.id, name: p.name } : null;
  if (!S.ok[t]) return sqMove(t, 1);
  S.phase = "walk";
  sqLog(`<b>${sqHouse(t).n}</b> أجابت صحيحًا وتختار مسيرها`);
  sqArm(p ? 30000 : 3000);
  sqSend();
  hEvery(() => { if (now() >= H.deadline) sqMove(t, 2); }, 250);
}
// the trader decides; after a while anyone in the house may
function sqArm(ms) { H.deadline = now() + ms; H.anyAt = now() + Math.min(12000, ms / 2); }
function sqMove(t, n) {
  hClear();
  const S = H.S, c = S.cos[t], from = c.pos;
  let z = 0;
  c.pos = (from + n) % 20;
  if (from + n >= 20 && c.cash >= SQ_PTS.nisab) {
    // passing the gate: zakat on the money held
    z = Math.round(c.cash * SQ_PTS.zakat); c.cash -= z; S.bait += z; c.ajr += SQ_PTS.zakatAjr;
    sqFx(t, "a", `زكاة ${sqN(z)}`);
  }
  S.move = { t, from, n, to: c.pos, z };
  S.phase = "move"; H.deadline = 0; H.anyAt = 0;
  sqLog(`<b>${sqHouse(t).n}</b> تتقدم ${AR(n)} ${n === 1 ? "دكانًا" : "دكاكين"}${z ? `، ومرّت بباب السوق: زكاة ${sqN(z)} دينار لبيت المال` : ""}`);
  sqSend();
  hLater(sqLand, 900 + n * 420 + (z ? 3200 : 0));
}

// ---------------- where the trader stops ----------------
const sqOpt = (k, b, s = "", dis = false) => ({ k, b, s, dis });
function sqLand() {
  hClear();
  const S = H.S, t = S.turn, c = S.cos[t], i = c.pos, tile = SQ_T[i], Q = H.sq;
  const A = { t, i, kind: tile.k, title: tile.n, desc: "", opts: [], res: null, ask: null };
  S.act = A; S.phase = "act"; S.move = null;
  if (tile.k === "shop") {
    const o = S.own[i];
    if (S.waqf[i] !== undefined) {
      const r = tile.rent; c.cash -= r; S.bait += r; sqFx(t, "n", sqSG(-r));
      sqLog(`<b>${tile.n}</b> ${SQX.waqfShopShort}: أجرته لبيت المال`);
      return sqResolve({ stamp: null, big: sqSG(-r), cls: "minus", line: "أجرة دكان الوقف، ذهبت إلى بيت المال", rule: { tag: "وقف", body: SQX.waqfShop } }, 4200);
    }
    if (o && o.id === t && o.partner === undefined) {
      const canExt = sqFullGroup(S, tile, t) && (o.ext || 0) < 2, cost = tile.price / 2;
      A.desc = `${canExt ? "تملكون الشارع كله، فيمكنكم <b>توسعة</b> الدكان فترتفع أجرته. " : ""}${SQX.waqfOffer}`;
      if (canExt) A.opts.push(sqOpt("x", `نوسّعه (${sqN(cost)})`, (o.ext || 0) ? "نبني مخزنًا: الأجرة ×٣" : "نبني دكّة: الأجرة ×٢", c.cash < cost));
      A.opts.push(sqOpt("w", SQX.waqfBtn, SQX.waqfSub), sqOpt("k", "نتركه كما هو", "يبقى لكم ويدرّ أجرة"));
      A.note = canExt ? "" : tile.g === "k" ? "الخانات لا تُوسَّع، وأجرتها تزيد كلما ملكتم خانات أكثر." : "التوسعة تفتح عندما تملكون كل دكاكين الشارع وحدكم.";
      sqLog(`<b>${sqHouse(t).n}</b> في ${tile.g === "k" ? "خانها" : "دكانها"} <b>${tile.n}</b>`);
      return sqWait();
    }
    if (o && (o.id === t || o.partner === t)) {
      sqLog(`<b>${sqHouse(t).n}</b> في دكان تشارك فيه: <b>${tile.n}</b>`);
      return sqResolve({ stamp: null, big: "شركاء", cls: "plus", line: `أنتم شركاء في ${tile.n} مع ${sqHouse(o.id === t ? o.partner : o.id).n}`, rule: { tag: "المشاركة", body: SQX.partRule } }, 3500);
    }
    if (o) {
      const r = sqRent(S, i), owner = o.id;
      c.cash -= r;
      if (o.partner !== undefined) { S.cos[owner].cash += r / 2; S.cos[o.partner].cash += r / 2; sqFx(owner, "p", sqSG(r / 2)); sqFx(o.partner, "p", sqSG(r / 2)); }
      else { S.cos[owner].cash += r; sqFx(owner, "p", sqSG(r)); }
      sqFx(t, "n", sqSG(-r));
      const why = tile.g === "k" ? ` (${SQX.rentKhan})` : o.ext ? ` (فيه ${o.ext === 1 ? "دكّة" : "دكّة ومخزن"})` : sqFullGroup(S, tile, owner) ? ` (${SQX.rentFull})` : "";
      A.desc = `الدكان لـ<b>${sqHouse(owner).n}</b>${o.partner !== undefined ? ` بالشراكة مع ${sqHouse(o.partner).n}` : ""}. الأجرة: <b>${sqN(r)}</b>${why}.`;
      sqLog(`<b>${sqHouse(t).n}</b> تدفع أجرة ${sqN(r)} لـ<b>${sqHouse(owner).n}</b>`);
      return sqResolve({ stamp: null, big: sqSG(-r), cls: "minus", line: `أجرة لـ${sqHouse(owner).n}`, rule: { tag: SQX.ijaraTag, body: SQX.ijaraRule } }, 4500);
    }
    const half = tile.price / 2, partners = S.teams.filter((x) => x !== t && S.cos[x].cash >= half);
    A.desc = SQX.emptyShop;
    A.opts.push(sqOpt("buy", `نشتريه كاملًا (${sqN(tile.price)})`, "لكم الأجرة كلها", c.cash < tile.price), sqOpt("part", `نشارك دارًا أخرى (${sqN(half)})`, SQX.partSub, c.cash < half || !partners.length), sqOpt("skip", "نتركه", "نحتفظ بمالنا"));
    sqLog(`<b>${sqHouse(t).n}</b> عند دكان فارغ: <b>${tile.n}</b>`);
    return sqWait();
  }
  if (tile.k === "deal") {
    const pool = SQX.deals.map((_, k) => k).filter((k) => !Q.dUsed.includes(k));
    const k = pickOne(pool.length ? pool : SQX.deals.map((_, j) => j));
    Q.dUsed = pool.length ? [...Q.dUsed, k] : [k];
    const d = SQX.deals[k];
    Object.assign(A, { card: k, title: d.t, desc: d.s, opts: d.a.map((x, j) => sqOpt(String(j), x)) });
    sqLog(`<b>${sqHouse(t).n}</b> سحبت ورقة صفقة`);
    return sqWait();
  }
  if (tile.k === "masjid") {
    const pool = SQX.fiqh.map((_, k) => k).filter((k) => !Q.fUsed.includes(k));
    const k = pickOne(pool.length ? pool : SQX.fiqh.map((_, j) => j));
    Q.fUsed = pool.length ? [...Q.fUsed, k] : [k];
    const f = SQX.fiqh[k], ord = shuffled(f.o.map((_, j) => j));
    Q.fa = ord.indexOf(f.a);
    Object.assign(A, { card: k, title: "مجلس علم في المسجد", desc: f.q, opts: ord.map((j, n) => sqOpt(String(n), f.o[j])) });
    sqLog(`<b>${sqHouse(t).n}</b> في المسجد: درس في فقه البيوع`);
    return sqWait();
  }
  if (tile.k === "bait") {
    if (c.cash < SQ_PTS.qardBelow && S.bait >= 200) {
      const amt = Math.min(SQ_PTS.qardMax, S.bait); S.bait -= amt; c.cash += amt; c.qard += amt; sqFx(t, "p", sqSG(amt));
      A.title = "بيت المال";
      sqLog(`<b>${sqHouse(t).n}</b> أخذت من بيت المال قرضًا حسنًا ${sqN(amt)}`);
      return sqResolve({ stamp: null, title: SQX.qardTitle(sqN(amt)), big: SQX.qardTitle(sqN(amt)), cls: "plus", line: SQX.qardPhone, rule: { tag: "القرض الحسن", body: SQX.qardRule } }, 5000);
    }
    A.title = "بيت المال"; A.desc = "مالكم يكفي. هل تتبرعون؟";
    A.opts.push(sqOpt("g", SQX.donateBtn, SQX.donateSub, c.cash < SQ_PTS.donate), sqOpt("n", "ليس الآن"));
    sqLog(`<b>${sqHouse(t).n}</b> عند بيت المال`);
    return sqWait();
  }
  if (tile.k === "caravan") {
    A.title = SQX.caravanTitle; A.desc = SQX.caravanRule;
    A.opts = [0, 100, 200, 300].map((v) => sqOpt(String(v), v ? `${sqN(v)} دينار` : "لا نشارك", v ? `ربح محتمل ${sqN(v / 2)}، أو خسارة نصفه` : "", v > c.cash));
    sqLog(`<b>${sqHouse(t).n}</b> عند القافلة: مضاربة إلى الشام`);
    return sqWait();
  }
  if (tile.k === "sadaqa") {
    A.title = "السبيل: سقاية الناس"; A.desc = SQX.sadaqaAsk;
    A.opts.push(sqOpt("g", SQX.sadaqaBtn, SQX.sadaqaSub, c.cash < SQ_PTS.sadaqa), sqOpt("n", "ليس الآن"));
    sqLog(`<b>${sqHouse(t).n}</b> عند السبيل`);
    return sqWait();
  }
  sqLog(`<b>${sqHouse(t).n}</b> عند باب السوق`);
  return sqResolve({ stamp: null, big: "باب السوق", cls: "", line: "استراحة عند الباب", rule: null }, 2500);
}
function sqWait() {
  const S = H.S;
  sqArm(S.trader ? 35000 : 3000);
  sqSend();
  hEvery(() => { if (now() >= H.deadline) sqTimeout(); }, 250);
}
// nobody decided in time: the choice that changes nothing
function sqTimeout() {
  const A = H.S.act; if (!A || A.res) return;
  const k = { shop: A.opts.some((o) => o.k === "skip") ? "skip" : "k", bait: "n", sadaqa: "n", caravan: "0" }[A.kind];
  if (k) return sqDo(k, true);
  sqDo("late", true);
}
function sqResolve(res, ms) {
  hClear();
  const S = H.S;
  S.act.res = res; S.act.ask = null; H.deadline = 0; H.anyAt = 0;
  sqSend();
  hLater(sqAfterAct, ms);
}
function sqDo(a, late) {
  const S = H.S, A = S.act, t = A.t, c = S.cos[t], tile = SQ_T[A.i], Q = H.sq;
  if (!A || A.res) return;
  const opt = A.opts.find((o) => o.k === a);
  if (!late && (!opt || opt.dis)) return;
  hClear();
  if (A.kind === "shop") {
    const o = S.own[A.i];
    if (a === "x" && o) {
      const cost = tile.price / 2; c.cash -= cost; o.ext = (o.ext || 0) + 1; sqFx(t, "n", sqSG(-cost));
      sqLog(`<b>${sqHouse(t).n}</b> وسّعت <b>${tile.n}</b>: الأجرة الآن ${sqN(sqRent(S, A.i))}`);
      return sqResolve({ stamp: "ok", stampText: o.ext === 1 ? "دكّة جديدة" : "مخزن جديد", big: `وسّعتم ${tile.n}`, cls: "plus", line: `الأجرة الآن ${sqN(sqRent(S, A.i))}`, rule: null }, 4200);
    }
    if (a === "w" && o) {
      delete S.own[A.i]; S.waqf[A.i] = t; c.ajr += SQ_PTS.waqf; sqFx(t, "a", sqAjr(SQ_PTS.waqf));
      sqLog(`<b>${sqHouse(t).n}</b> أوقفت <b>${tile.n}</b>!`);
      return sqResolve({ stamp: "ok", stampText: SQX.waqfStamp, big: `أوقفتم ${tile.n}`, cls: "ajrc", line: `${sqAjr(SQ_PTS.waqf)} الآن، و${sqAjr(SQ_PTS.waqf)} في كل جولة`, rule: { tag: "الوقف", body: SQX.waqfHadith } }, 5500);
    }
    if (a === "buy" && !o) {
      c.cash -= tile.price; S.own[A.i] = { id: t }; sqFx(t, "n", sqSG(-tile.price));
      sqLog(`<b>${sqHouse(t).n}</b> اشترت <b>${tile.n}</b>`);
      return sqResolve({ stamp: "ok", stampText: `بِيع لـ${sqHouse(t).n}`, big: `اشتريتم ${tile.n}`, cls: "plus", line: `كل من يقف عليه يدفع لكم ${sqN(sqRent(S, A.i))} أجرة`, rule: null }, 4000);
    }
    if (a === "part" && !o) {
      // the offer goes to every house that can pay half; the first to accept becomes the partner
      const half = tile.price / 2;
      A.ask = { who: S.teams.filter((x) => x !== t && S.cos[x].cash >= half), half };
      sqLog(`<b>${sqHouse(t).n}</b> تعرض المشاركة في <b>${tile.n}</b>`);
      H.deadline = now() + 20000; H.anyAt = 0;
      sqSend();
      hEvery(() => { if (now() >= H.deadline) sqPartner(-1); }, 250);
      return;
    }
    if (a === "w" || a === "k") { sqLog(`<b>${sqHouse(t).n}</b> أبقت <b>${tile.n}</b> كما هو`); return sqResolve({ stamp: null, big: "يبقى لكم", cls: "", line: "ويدرّ عليكم أجرته", rule: null }, 2500); }
    sqLog(`<b>${sqHouse(t).n}</b> تركت <b>${tile.n}</b>`);
    return sqResolve({ stamp: null, big: late ? "ما قرروا" : "تركتموه", cls: "", line: "احتفظتم بمالكم", rule: null }, 2500);
  }
  if (A.kind === "deal") {
    const d = SQX.deals[A.card];
    if (a === "late") { sqLog(`<b>${sqHouse(t).n}</b> ما قررت في الصفقة`); return sqResolve({ stamp: null, big: "ما قرروا", cls: "", line: "مرّت الصفقة", rule: { tag: SQX.stampOk, body: `${d.a[d.ok]}. ${d.why}` } }, 5000); }
    const pick = +a, right = pick === d.ok, money = d.cash[pick] || 0, later = d.later ? d.later[pick] : 0;
    c.cash += money;
    if (right) c.ajr += SQ_PTS.dealOk; else c.ajr = Math.max(0, c.ajr - SQ_PTS.dealNo);
    if (later) c.debts.push({ amt: -later, due: S.round + 2, why: d.t });
    sqFx(t, right ? "a" : "n", sqAjr(right ? SQ_PTS.dealOk : -SQ_PTS.dealNo)); if (money) sqFx(t, money > 0 ? "p" : "n", sqSG(money));
    A.pick = pick;
    sqLog(right ? `<b>${sqHouse(t).n}</b> اختارت ما يوافق الشرع` : `<b>${sqHouse(t).n}</b> اختارت ما لا يجوز`);
    return sqResolve({ stamp: right ? "ok" : "no", stampText: right ? SQX.stampOk : SQX.stampNo, chose: d.a[pick], big: sqAjr(right ? SQ_PTS.dealOk : -SQ_PTS.dealNo), cls: right ? "ajrc" : "minus", line: money || later ? `المال: ${money ? sqSG(money) : "٠"}${later ? `، وعليهم ${sqSG(later)} بعد جولتين` : ""}` : "", rule: { tag: right ? SQX.stampOk : SQX.stampNo, tagCls: right ? "ok" : "no", body: d.why } }, 8000);
  }
  if (A.kind === "masjid") {
    const pick = a === "late" ? -1 : +a, ok = pick === Q.fa;
    if (ok) { c.ajr += SQ_PTS.fiqh; sqFx(t, "a", sqAjr(SQ_PTS.fiqh)); }
    A.pick = pick; A.right = Q.fa;
    sqLog(ok ? `<b>${sqHouse(t).n}</b> أصابت في مجلس العلم` : `<b>${sqHouse(t).n}</b> لم تُصب في مجلس العلم`);
    return sqResolve({ stamp: ok ? "ok" : "no", stampText: ok ? sqAjr(SQ_PTS.fiqh) : "لم تُصب", big: ok ? sqAjr(SQ_PTS.fiqh) : "لم تُصيبوا", cls: ok ? "ajrc" : "minus", line: `الصواب: ${A.opts[Q.fa].b}`, rule: null }, 5500);
  }
  if (A.kind === "bait") {
    if (a === "g") { c.cash -= SQ_PTS.donate; S.bait += SQ_PTS.donate; c.ajr += SQ_PTS.donateAjr; sqFx(t, "a", sqAjr(SQ_PTS.donateAjr)); sqFx(t, "n", sqSG(-SQ_PTS.donate)); sqLog(`<b>${sqHouse(t).n}</b> تبرعت لبيت المال`); }
    return sqResolve({ stamp: a === "g" ? "ok" : null, stampText: "تبرّع", big: a === "g" ? `تبرّع بـ${sqN(SQ_PTS.donate)} دينار` : "مرور", cls: a === "g" ? "ajrc" : "", line: a === "g" ? sqAjr(SQ_PTS.donateAjr) : "", rule: { tag: "بيت المال", body: SQX.baitRule } }, 4000);
  }
  if (A.kind === "caravan") {
    const amt = +a || 0;
    if (!amt) { sqLog(`<b>${sqHouse(t).n}</b> لم تشارك في القافلة`); return sqResolve({ stamp: null, big: "لم تشاركوا", cls: "", line: "", rule: null }, 2500); }
    const good = Math.random() < 0.65, delta = good ? amt / 2 : -amt / 2;
    c.cash += delta; sqFx(t, good ? "p" : "n", sqSG(delta));
    A.amt = amt;
    sqLog(`قافلة <b>${sqHouse(t).n}</b> ${good ? "ربحت" : "خسرت"}: ${sqSG(delta)}`);
    return sqResolve({ stamp: good ? "ok" : "no", stampText: good ? "ربحت القافلة" : "خسرت القافلة", big: sqSG(delta), cls: good ? "plus" : "minus", line: good ? SQX.caravanWin(sqSG(delta)) : SQX.caravanLoss(sqSG(delta)), rule: { tag: "المضاربة", body: SQX.caravanAfter } }, 6000);
  }
  if (A.kind === "sadaqa") {
    if (a === "g") { c.cash -= SQ_PTS.sadaqa; c.ajr += SQ_PTS.sadaqaAjr; sqFx(t, "a", sqAjr(SQ_PTS.sadaqaAjr)); sqFx(t, "n", sqSG(-SQ_PTS.sadaqa)); sqLog(`<b>${sqHouse(t).n}</b> تصدّقت عند السبيل`); }
    return sqResolve({ stamp: a === "g" ? "ok" : null, stampText: "صدقة", big: a === "g" ? `تصدّقتم بـ${sqN(SQ_PTS.sadaqa)} دينار` : "مرّت", cls: a === "g" ? "ajrc" : "", line: a === "g" ? sqAjr(SQ_PTS.sadaqaAjr) : "", rule: { tag: "الصدقة", body: SQX.sadaqaHadith } }, 4000);
  }
  sqResolve({ stamp: null, big: "", cls: "", line: "", rule: null }, 2000);
}
// a house accepted the partnership (t), or nobody did (-1)
function sqPartner(p) {
  const S = H.S, A = S.act; if (!A || !A.ask || A.res) return;
  const t = A.t, tile = SQ_T[A.i], half = A.ask.half;
  if (p < 0 || S.cos[p].cash < half || S.cos[t].cash < half) {
    sqLog("لم توافق أي دار على الشراكة");
    return sqResolve({ stamp: null, big: "لا شريك", cls: "", line: "لم توافق أي دار على الشراكة، فبقي الدكان فارغًا", rule: null }, 3500);
  }
  S.cos[t].cash -= half; S.cos[p].cash -= half; S.own[A.i] = { id: t, partner: p };
  sqFx(t, "n", sqSG(-half)); sqFx(p, "n", sqSG(-half));
  A.partner = p;
  sqLog(`<b>${sqHouse(t).n}</b> و<b>${sqHouse(p).n}</b> تشاركتا في <b>${tile.n}</b>`);
  sqResolve({ stamp: "ok", stampText: "شراكة", big: `شراكة مع ${sqHouse(p).n}`, cls: "plus", line: `دفع كل شريك ${sqN(half)}، ولكل واحد نصف الأجرة`, rule: { tag: "المشاركة", body: SQX.partRule } }, 5000);
}
function sqBroke(t) {
  const S = H.S, c = S.cos[t];
  if (c.cash >= 0 || S.bait <= 0) return;
  const amt = Math.min(-c.cash + 100, S.bait); S.bait -= amt; c.cash += amt; c.qard += amt;
  sqFx(t, "p", sqSG(amt));
  sqLog(SQX.broke(sqHouse(t).n, sqN(amt)));
}
function sqAfterAct() {
  hClear();
  const S = H.S;
  if (S.act) sqBroke(S.act.t);
  S.teams.forEach((t) => sqBroke(t));
  sqNextTurn();
}
// the end: debts are paid, goodly loans repaid as they were taken
function sqSettle() {
  hClear();
  const S = H.S;
  S.teams.forEach((t) => { const c = S.cos[t]; c.debts.forEach((d) => (c.cash -= d.amt)); c.debts = []; c.cash -= c.qard; S.bait += c.qard; c.qard = 0; });
  Object.assign(S, { phase: "settle", turn: -1, trader: null, act: null, move: null });
  sqLog(SQX.settleLine);
  H.deadline = 0; H.anyAt = 0;
  sqSend();
  hLater(sqEnd, 5500);
}
function sqEnd() {
  hClear();
  const S = H.S;
  S.rank = S.teams.slice().sort((x, y) => sqScore(S, y) - sqScore(S, x));
  S.won = S.rank[0];
  S.phase = "end";
  sqSend();
}

// ---------------- every phone ----------------
const sqMy = (S) => sqTeamOf(S, PID);
function sqTop(S, t) {
  if (t < 0 || !S.cos || !S.cos[t] || !S.teams.includes(t)) return `<div class="sq-top"><div class="sq-r1"><div class="sq-nm"><b>سوق المدينة</b><small>تتفرج على السوق</small></div></div></div>`;
  const c = S.cos[t], mates = S.players.filter((p) => sqTeamOf(S, p.id) === t);
  const myTurn = S.turn === t && ["walk", "act"].includes(S.phase), iTrade = S.trader && S.trader.id === PID;
  return `<div class="sq-top" style="--hx:${sqHouse(t).hx}"><div class="sq-r1">${sqEmblem(t, 40)}<div class="sq-nm"><b>${sqHouse(t).n}</b><span class="sq-faces">${mates.map((p) => face(p, 24)).join("")}</span></div><div class="sq-purse"><div><small>المال</small><b>${sqN(c.cash)}</b></div><div class="a"><small>${SQX.ajr}</small><b>${AR(c.ajr)}</b></div></div></div>
    ${myTurn && S.trader ? `<div class="sq-role">${iTrade ? "دوركم، وأنت التاجر هذه المرة: القرار لك" : `دوركم، والتاجر هذه المرة: ${esc(S.trader.name)}`}</div>` : ""}</div>`;
}
// the market as a ring of 20 tiles on the phone, with every house's trader
function sqMini(S, hl) {
  const rc = (i) => (i <= 5 ? [6, 6 - i] : i <= 10 ? [6 - (i - 5), 1] : i <= 15 ? [1, 1 + (i - 10)] : [1 + (i - 15), 6]);
  const cells = SQ_T.map((tile, i) => {
    const [r, cc] = rc(i), o = S.own[i], w = S.waqf[i] !== undefined;
    const here = S.teams.filter((t) => S.cos[t].pos === i);
    const bd = o ? `box-shadow:inset 0 0 0 3px ${sqHouse(o.id).hx}${o.partner !== undefined ? `,inset 0 0 0 6px ${sqHouse(o.partner).hx}` : ""}` : "";
    return `<div class="sq-mt ${tile.corner ? "corner" : ""} ${w ? "waqf" : ""} ${hl === i ? "hl" : ""}" style="grid-row:${r};grid-column:${cc};${tile.g ? `--gc:${SQ_GROUPS[tile.g].c};` : ""}${bd}">${tile.g ? '<i class="band"></i>' : ""}${sqIc(tile.ic)}<span>${tile.n}</span>${here.length ? `<em>${here.map((t) => `<i style="background:${sqHouse(t).hx}"></i>`).join("")}</em>` : ""}</div>`;
  }).join("");
  return `<div class="sq-mini">${cells}<div class="sq-mc"><b>الجولة ${AR(Math.max(1, S.round || 1))} من ${AR(S.rounds)}</b><span>${SQX.baitHud}<br>${sqN(S.bait)} دينار</span></div></div>`;
}
const sqScores = (S) => `<div class="sq-chips">${S.teams.map((t) => `<span class="sq-chip" style="--hx:${sqHouse(t).hx}">${sqEmblem(t, 18)}${sqN(S.cos[t].cash)}<small>${AR(S.cos[t].ajr)} ${SQX.ajr}</small></span>`).join("")}</div>`;
function sqTick() {
  klEvery(() => {
    const s = KL.S; if (!s || s.game !== "souq") return;
    const el = $("sqLeft"); if (el) el.textContent = AR(Math.ceil(leftOf(s.left) / 1000));
    const bar = $("sqBar"); if (bar && s.phase === "q") bar.style.transform = `scaleX(${leftOf(s.left) / (s.qT || s.qtime * 1000)})`;
    const fr = $("sqFree"); if (fr) fr.textContent = AR(Math.ceil(leftOf(s.freeLeft) / 1000));
    if (["walk", "act"].includes(s.phase) && !KL.my.freed && s.freeLeft > 0 && leftOf(s.freeLeft) <= 0) { KL.my.freed = true; sqvPlay(s, false); }
  }, 250);
}
function sqvQ(S, fresh) {
  sqHead();
  const t = sqMy(S), q = S.q, mine = S.teams.includes(t);
  if (fresh) { clearKL(); KL.my.v = undefined; sqTick(); beep(880, 0.08); buzz(40); }
  setTop(`الجولة ${AR(S.round)}`);
  const tally = mine ? S.tally[t] : null;
  show(`${sqTop(S, t)}
    <div class="sq-body">
      <div class="sq-now">سؤال للجميع. صوّتوا، و<b>إجابة الأغلبية</b> هي إجابة داركم. الصحيحة تجعلكم تختارون كم تتقدمون.</div>
      <span class="sq-cat">${esc(q.cat)}</span><div class="sq-q">${esc(q.q)}</div>
      <div class="sq-tline"><i id="sqBar" style="transform:scaleX(${leftOf(S.left) / (S.qT || S.qtime * 1000)})"></i></div>
      <div class="sq-opts">${q.o.map((o, k) => `<button type="button" class="sq-opt" data-o="${k}" aria-pressed="${KL.my.v === k}" ${mine ? "" : "disabled"}><span>${esc(o)}</span><small>${tally && tally[k] ? AR(tally[k]) : ""}</small></button>`).join("")}</div>
      <p class="muted">${mine ? `صوّت ${AR(S.voted.filter((id) => sqTeamOf(S, id) === t).length)} من ${AR(S.players.filter((p) => sqTeamOf(S, p.id) === t).length)} في داركم · <span id="sqLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</span> ث` : "تتفرج الحين."}</p>
      ${sqMini(S, -1)}
    </div>`);
  screen.querySelectorAll(".sq-opt:not([disabled])").forEach((b) => (b.onclick = () => { KL.my.v = +b.dataset.o; beep(660, 0.05); act({ t: "sqvote", id: PID, k: KL.my.v }); screen.querySelectorAll(".sq-opt").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
}
function sqvAns(S, fresh) {
  sqHead();
  const t = sqMy(S), mine = S.teams.includes(t), ok = mine && S.ok[t];
  if (fresh) { clearKL(); if (mine) { if (ok) { beep(660, 0.08); setTimeout(() => beep(880, 0.12), 120); } else beep(220, 0.2, "triangle"); } }
  setTop("الإجابة");
  show(`${sqTop(S, t)}
    <div class="sq-body">
      <div class="sq-q">${esc(S.q.q)}</div>
      <div class="sq-opts">${S.q.o.map((o, k) => `<div class="sq-opt ${k === S.answer ? "ok" : mine && k === S.picked[t] ? "no" : ""}"><span>${esc(o)}</span><span class="sq-vs">${S.teams.filter((x) => S.picked[x] === k).map((x) => sqEmblem(x, 22)).join("")}</span></div>`).join("")}</div>
      ${mine ? `<div class="sq-res"><div class="big ${ok ? "plus" : "minus"}">${ok ? "صحيح! اختاروا مسيركم" : "خطأ… تتقدمون دكانًا واحدًا"}</div></div>` : ""}
      ${sqScores(S)}
    </div>`);
}
// what the stop is about, as a card: the same on the TV and the phones
function sqActCard(S, A) {
  const tile = SQ_T[A.i];
  const head = tile.k === "shop" ? `<div class="sq-shop" style="--gc:${SQ_GROUPS[tile.g].c}">${sqIc(tile.ic)}<div><b>${tile.n}</b><div class="sq-facts"><span>${SQ_GROUPS[tile.g].n}</span>${S.waqf[A.i] !== undefined ? "<span>وقف</span>" : `<span>الثمن ${sqN(tile.price)}</span><span>الأجرة ${sqN(sqRent(S, A.i))}</span>`}</div></div></div>` : `<div class="sq-t">${A.title}</div>`;
  return head + (A.desc ? `<div class="${tile.k === "deal" || tile.k === "masjid" ? "sq-q" : "sq-rule"}">${A.desc}</div>` : "");
}
const sqResCard = (A) => { const r = A.res; return `${r.stamp ? `<span class="sq-stamp ${r.stamp}">${r.stampText}</span>` : ""}${r.chose ? `<div class="sq-chose">«${r.chose}»</div>` : ""}<div class="sq-res"><div class="big ${r.cls}">${r.big}</div>${r.line ? `<span>${r.line}</span>` : ""}</div>${r.rule ? `<div class="sq-rulecard"><span class="tag ${r.rule.tagCls || "ok"}">${r.rule.tag}</span>${r.rule.body}</div>` : ""}`; };
function sqvPlay(S, fresh) {
  sqHead();
  const t = sqMy(S), mine = S.teams.includes(t), turn = S.turn, myTurn = mine && t === turn;
  const iTrade = S.trader && S.trader.id === PID, can = myTurn && (iTrade || leftOf(S.freeLeft) <= 0);
  if (fresh) {
    clearKL(); KL.my.freed = false; KL.my.sent = false; sqTick();
    if (myTurn && ["walk", "act"].includes(S.phase) && !(S.act && S.act.res)) { beep(880, 0.1); buzz([60, 40, 60]); }
    if (S.act && S.act.res) { if (S.act.res.stamp === "ok") { beep(660, 0.08); setTimeout(() => beep(990, 0.12), 110); } else if (S.act.res.stamp === "no") beep(200, 0.25, "triangle"); }
  }
  const who = turn >= 0 ? `<b style="color:${sqHouse(turn).hx}">${sqHouse(turn).n}</b>` : "";
  const wait = myTurn && !can ? `<p class="muted" style="text-align:center">${esc(S.trader ? S.trader.name : "")} يقرر. إذا تأخر تقدرون تقررون بعد <span id="sqFree">${AR(Math.ceil(leftOf(S.freeLeft) / 1000))}</span> ث</p>` : "";
  let body = "";
  if (S.phase === "intro") {
    setTop("سوق المدينة");
    body = `<div class="sq-card"><div class="sq-t">${SQX.welcomeTitle}</div><p>${SQX.welcome(sqN(S.cap), AR(S.rounds))}</p></div>${sqMini(S, -1)}`;
  } else if (S.phase === "walk") {
    setTop("المسير");
    if (myTurn) {
      const c = S.cos[t];
      const opt = (k) => { const tile = SQ_T[(c.pos + k) % 20], o = S.own[tile.i]; return `<button type="button" data-step="${k}" ${can && !KL.my.sent ? "" : "disabled"}><b>${AR(k)}</b>${sqIc(tile.ic, "sq-tic")}<small>${tile.n}${S.waqf[tile.i] !== undefined ? " (وقف)" : o ? (o.id === t || o.partner === t ? " (لكم)" : " (مؤجَّر)") : tile.price ? ` · ${sqN(tile.price)}` : ""}</small></button>`; };
      body = `<div class="sq-now">أجبتم صحيحًا! <b>إلى أين تتقدمون؟</b> انظروا أين يقع كل خيار.</div><div class="sq-steps">${[1, 2, 3].map(opt).join("")}</div>${wait}<p class="muted">الدكان الفارغ تستطيعون شراءه، ودكان غيركم تدفعون أجرته.</p>${sqMini(S, c.pos)}`;
    } else body = `<div class="sq-now">${who} تختار مسيرها…</div>${sqMini(S, S.cos[turn].pos)}${sqScores(S)}`;
  } else if (S.phase === "move") {
    setTop("المسير");
    const mv = S.move;
    body = `<div class="sq-now">${S.narr}</div>${mv.z && myTurn ? `<div class="sq-res"><div class="big ajrc">${SQX.zakatDone}</div><span>${SQX.zakatLine(sqN(mv.z))}</span></div><div class="sq-rulecard"><span class="tag ok">${SQX.zakatTag}</span>${SQX.zakatRule}</div>` : ""}${sqMini(S, mv.to)}`;
  } else if (S.phase === "act") {
    const A = S.act;
    setTop(SQ_T[A.i].n);
    const askMe = A.ask && mine && A.ask.who.includes(t);
    let ctl = "";
    if (A.res) ctl = sqResCard(A);
    else if (A.ask) ctl = askMe ? `<div class="sq-now">${SQX.partAsk(sqHouse(A.t).n, SQ_T[A.i].n, sqN(A.ask.half))}</div><div class="sq-choice"><button type="button" id="sqYes" ${KL.my.sent ? "disabled" : ""}><b>نقبل الشراكة (${sqN(A.ask.half)})</b><span>${SQX.partSub}</span></button></div><p class="muted">أول دار تقبل تصير الشريك. <span id="sqLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</span> ث</p>` : `<div class="sq-now">${myTurn ? "عرضتم المشاركة. ننتظر دارًا تقبل…" : `${who} تعرض المشاركة على الدُّور الأخرى…`} <span id="sqLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</span> ث</div>`;
    else if (myTurn) ctl = `${SQ_T[A.i].k === "deal" ? `<div class="sq-now">${SQX.dealPrompt}</div>` : SQ_T[A.i].k === "masjid" ? `<div class="sq-now">${SQX.fiqhPrompt}</div>` : ""}<div class="sq-choice">${A.opts.map((o) => `<button type="button" data-do="${o.k}" ${o.dis || !can || KL.my.sent ? "disabled" : ""}><b>${o.b}</b>${o.s ? `<span>${o.s}</span>` : ""}</button>`).join("")}</div>${A.note ? `<p class="muted">${A.note}</p>` : ""}${wait}`;
    else ctl = `<div class="sq-now">${who} تقرر…</div>${A.opts.length ? `<div class="sq-choice">${A.opts.map((o) => `<button type="button" disabled><b>${o.b}</b></button>`).join("")}</div>` : ""}`;
    body = `<div class="sq-card">${A.t !== t ? `<div class="sq-k">${sqEmblem(A.t, 22)}${sqHouse(A.t).n}</div>` : ""}${sqActCard(S, A)}</div>${ctl}${A.res || !myTurn ? sqScores(S) : ""}`;
  } else if (S.phase === "settle") {
    setTop("الحساب");
    body = `<div class="sq-card"><div class="sq-t">الحساب الأخير</div><p>${SQX.settleRule}</p></div>${sqScores(S)}`;
  }
  show(`${sqTop(S, t)}<div class="sq-body">${body}</div>`);
  screen.querySelectorAll("[data-step]").forEach((b) => (b.onclick = () => { KL.my.sent = true; beep(760, 0.05); act({ t: "sqstep", id: PID, n: +b.dataset.step }); sqvPlay(KL.S, false); }));
  screen.querySelectorAll("[data-do]").forEach((b) => (b.onclick = () => { KL.my.sent = true; beep(760, 0.05); act({ t: "sqdo", id: PID, a: b.dataset.do }); sqvPlay(KL.S, false); }));
  if ($("sqYes")) $("sqYes").onclick = () => { KL.my.sent = true; beep(880, 0.06); act({ t: "sqpart", id: PID, yes: true }); sqvPlay(KL.S, false); };
}
function sqvEnd(S, fresh) {
  sqHead();
  const t = sqMy(S), pos = S.rank.indexOf(t) + 1;
  if (fresh) { clearKL(); if (pos === 1) { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); } else beep(262, 0.4, "triangle", 0.12); }
  setTop("انتهى يوم السوق");
  show(`${sqTop(S, t)}<div class="sq-body">
    ${pos ? `<div class="sq-res"><div class="big">${pos === 1 ? `أنتم ${SQX.winTitle}!` : `المركز ${AR(pos)}`}</div><span>الثروة ${sqN(sqWealth(S, t))}، و${SQX.ajr} ${AR(S.cos[t].ajr)}</span></div>` : ""}
    <div class="sq-ranks">${S.rank.map((x, k) => `<div class="sq-rk ${x === t ? "me" : ""}"><span class="n">${AR(k + 1)}</span>${sqEmblem(x, 30)}<b>${sqHouse(x).n}</b><span>${sqN(sqWealth(S, x))}<small>الثروة</small></span><span class="a">${AR(S.cos[x].ajr)}<small>${SQX.ajr}</small></span><span class="s">${sqN(sqScore(S, x))}<small>المجموع</small></span></div>`).join("")}</div>
    <p class="muted">${SQX.winFormula}</p>
    ${isHost() ? '<button type="button" class="btn btn-marker" id="sqAgain">يوم سوق جديد</button>' : '<p class="muted" style="text-align:center">المضيف يقدر يبدأ يوم سوق جديد.</p>'}
    <button type="button" class="btn btn-ghost" id="sqHome">رجوع لفسحة</button></div>`);
  if ($("sqAgain")) $("sqAgain").onclick = () => hostAgain();
  $("sqHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}

// ---------------- the big screen: the town, the houses, and the card of the moment ----------------
ROOM_GAMES.souq.tvTeams = (S) => Array.from({ length: S.nt || 3 }, (_, t) => ({ n: sqHouse(t).n, c: sqHouse(t).hx, ps: S.players.filter((p) => sqTeamOf(S, p.id) === t) }));
const SQ_TV = { fx: 0, timers: [] };
function sqTvHouses(S) {
  const fx = S.fx && S.fx.seq !== SQ_TV.fx ? S.fx.d : null;
  return S.teams.map((t) => { const c = S.cos[t], shops = Object.entries(S.own).filter(([, o]) => o.id === t || o.partner === t).map(([i]) => +i), wq = Object.entries(S.waqf).filter(([, x]) => x === t).map(([i]) => +i);
    const voted = S.phase === "q" ? `<small class="sq-voted">صوّت ${AR(S.voted.filter((id) => sqTeamOf(S, id) === t).length)} من ${AR(S.players.filter((p) => sqTeamOf(S, p.id) === t).length)}</small>` : "";
    return `<div class="sq-house ${S.turn === t ? "turn" : ""}">${sqEmblem(t, 54)}<div><b>${sqHouse(t).n}</b><div class="sq-shops">${shops.map((i) => `<i style="--gc:${SQ_GROUPS[SQ_T[i].g].c}"></i>`).join("")}${wq.map((i) => `<i class="w" style="--gc:${SQ_GROUPS[SQ_T[i].g].c}"></i>`).join("")}${shops.length + wq.length ? "" : "<small>لا دكاكين بعد</small>"}</div>${voted}</div><div class="sq-vals"><span class="cash">${sqN(c.cash)}<small> دينار</small></span><span class="ajr">${sqIc("star", "sq-star")}${AR(c.ajr)} ${SQX.ajr}</span></div>${fx && fx[t] ? fx[t].map((d, k) => `<span class="sq-delta ${d[0]}" style="animation-delay:${k * 0.35}s">${d[1]}</span>`).join("") : ""}</div>`; }).join("");
}
function sqTvCard(S) {
  const P = S.phase;
  if (P === "intro") return `<div class="sq-ev"><div class="sq-t">${SQX.welcomeTitle}</div><div class="sq-q" style="font-weight:600">${SQX.welcome(sqN(S.cap), AR(S.rounds))}</div></div>`;
  if (P === "q" || P === "ans") {
    const done = P === "ans";
    return `<div class="sq-ev"><div class="sq-k">سؤال الجولة ${AR(S.round)} <span class="sq-cat">${esc(S.q.cat)}</span>${done ? "" : tvSecs(S.left)}</div><div class="sq-q">${esc(S.q.q)}</div>
      <div class="sq-evopts">${S.q.o.map((o, k) => `<div class="${done && k === S.answer ? "ok" : ""}">${esc(o)}<span class="sq-vs">${done ? S.teams.filter((x) => S.picked[x] === k).map((x) => sqEmblem(x, 30)).join("") : ""}</span></div>`).join("")}</div>
      ${done ? '<div class="sq-ev2">الإجابة الصحيحة: تتقدمون من ١ إلى ٣ دكاكين، تختارون أنتم. والخاطئة: دكان واحد.</div>' : tvBar(S.left, S.qT || S.qtime * 1000)}</div>`;
  }
  if (P === "walk") return `<div class="sq-ev small"><div class="sq-k">${sqEmblem(S.turn, 36)}${sqHouse(S.turn).n}</div><div class="sq-t">تختار مسيرها: ١ أو ٢ أو ٣</div>${S.trader ? `<div class="sq-ev2">التاجر: ${esc(S.trader.name)}</div>` : ""}</div>`;
  if (P === "move") { const mv = S.move; return mv.z ? `<div class="sq-ev small"><div class="sq-k">${sqEmblem(mv.t, 36)}${sqHouse(mv.t).n} مرّت بباب السوق</div><div class="sq-t">زكاة ${sqN(mv.z)} دينار</div><div class="sq-rule"><b>${SQX.zakatTag}</b>: ${SQX.zakatRule}</div></div>` : ""; }
  if (P === "act") {
    const A = S.act;
    return `<div class="sq-ev"><div class="sq-k">${sqEmblem(A.t, 36)}${sqHouse(A.t).n}${A.res && A.res.chose ? `: «${A.res.chose}»` : " عند"}</div>${sqActCard(S, A)}
      ${A.res ? `${A.res.stamp ? `<span class="sq-stamp ${A.res.stamp}">${A.res.stampText}</span>` : `<div class="sq-verdict">${A.res.big}</div>`}${A.res.line ? `<div class="sq-ev2">${A.res.line}</div>` : ""}${A.res.rule ? `<div class="sq-rule">${A.res.rule.body}</div>` : ""}`
        : A.ask ? `<div class="sq-ev2">تعرض المشاركة بالنصف على الدُّور الأخرى… ${tvSecs(S.left)}</div>`
        : A.opts.length ? `<div class="sq-evopts">${A.opts.map((o) => `<div class="${o.dis ? "dis" : ""}">${o.b}</div>`).join("")}</div>` : ""}</div>`;
  }
  if (P === "settle") return `<div class="sq-ev"><div class="sq-t">الحساب الأخير</div><div class="sq-rule">${SQX.settleRule}</div></div>`;
  return "";
}
function sqTvPlay(S, fresh) {
  const P = S.phase, hl = P === "act" ? S.act.i : P === "move" ? S.move.to : P === "walk" ? S.cos[S.turn].pos : null;
  const PH = [["q", "السؤال"], ["walk", "المسير"], ["act", "التصرّف"]], pi = P === "ans" ? 0 : P === "move" ? 1 : PH.findIndex((p) => p[0] === P);
  const pawns = S.teams.map((t) => { const pos = P === "move" && fresh && S.move.t === t ? S.move.from : S.cos[t].pos, [x, y] = sqTraderXY(t, pos); return `<g class="sq-pw" data-pawn="${t}" style="transform:translate(${x}px,${y}px)"><g transform="scale(1.25)">${sqPerson(sqHouse(t).hx, { t })}</g></g>`; }).join("");
  const html = `<div class="sq-tv">
    <svg class="sq-map" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style="direction:ltr" aria-hidden="true">${sqTown(S, hl)}</svg>
    <svg class="sq-map" id="sqPpl" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style="direction:ltr;pointer-events:none" aria-hidden="true">${pawns}</svg>
    <div class="sq-hud tl"><div class="sq-hd"><b>${SQ_ICON}سوق المدينة</b><small>الجولة ${AR(Math.max(1, S.round))} من ${AR(S.rounds)}</small></div><div class="sq-phs">${PH.map(([, n], i) => `<span class="${i === pi ? "on" : ""}">${n}</span>`).join("")}</div><div class="sq-bait">${sqIc("bait", "sq-bic")}<span>${SQX.baitHud}</span><b>${sqN(S.bait)}</b></div></div>
    <div class="sq-hud tr">${sqTvHouses(S)}</div>
    <div class="sq-hud bl sq-log"><h4>ما يجري في السوق</h4>${(S.log || []).map((x) => `<div>${x}</div>`).join("")}</div>
    <div class="sq-evwrap">${sqTvCard(S)}</div></div>`;
  return { html, after: () => {
    SQ_TV.timers.forEach(clearTimeout); SQ_TV.timers = [];
    if (S.fx) SQ_TV.fx = S.fx.seq;
    if (P !== "move" || !fresh) return;
    const mv = S.move, el = document.querySelector(`#sqPpl [data-pawn="${mv.t}"]`);
    if (!el) return;
    el.classList.add("walk");
    for (let k = 1; k <= mv.n; k++) SQ_TV.timers.push(setTimeout(() => { const [x, y] = sqTraderXY(mv.t, (mv.from + k) % 20); el.style.transform = `translate(${x}px,${y}px)`; if (k === mv.n) setTimeout(() => el.classList.remove("walk"), 380); }, 250 + (k - 1) * 400));
  } };
}
ROOM_GAMES.souq.tv = {
  intro: sqTvPlay, q: sqTvPlay, ans: sqTvPlay, walk: sqTvPlay, move: sqTvPlay, act: sqTvPlay, settle: sqTvPlay,
  end(S) {
    const rank = S.rank, mostAjr = S.teams.slice().sort((a, b) => S.cos[b].ajr - S.cos[a].ajr)[0], richest = S.teams.slice().sort((a, b) => sqWealth(S, b) - sqWealth(S, a))[0];
    return `<div class="sq-tv sq-end"><div class="sq-endin">
      <div class="sq-endk">${SQ_ICON}انتهى يوم السوق</div><div class="sq-endt">${sqHouse(rank[0]).n}: ${SQX.winTitle}</div>
      <div class="sq-endrows">${rank.map((t, i) => `<div class="sq-endrow ${i ? "" : "top"}" style="animation-delay:${0.3 + i * 0.25}s"><span class="n">${AR(i + 1)}</span>${sqEmblem(t, 70)}<b>${sqHouse(t).n}</b><span>الثروة<b>${sqN(sqWealth(S, t))}</b></span><span class="a">${SQX.ajr}<b>${AR(S.cos[t].ajr)}</b></span><span class="s">المجموع<b>${sqN(sqScore(S, t))}</b></span></div>`).join("")}</div>
      <div class="sq-endf">${SQX.winFormula}</div>
      <div class="sq-endaw">${[["أكثر الدُّور أجرًا", sqHouse(mostAjr).n], ["أكثرها مالًا", sqHouse(richest).n], ["الأوقاف", `${AR(Object.keys(S.waqf).length)} دكان`]].map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join("")}</div>
    </div></div>`;
  },
};
