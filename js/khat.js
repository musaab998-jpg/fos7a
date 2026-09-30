"use strict";
// ================= خط ثلاثة: X-O on the chalkboard, one question per square, two teams voting =================
const KCATS = ["السعودية", "عواصم", "جغرافيا", "أكل", "كورة", "رياضات", "الأغلبية", "لهجات", "أمثال", "لغتنا", "ألغاز", "تاريخ", "علوم", "جسم الإنسان", "حيوانات", "رياضيات", "تقنية", "عامة"];
const KLABEL = (c) => (c === "الأغلبية" ? "وش يقول الأغلبية؟" : c);
// a: index of the right option; a = -1 means the room's majority decides (w: how a crowd tends to pick)
const KQB = {
  "السعودية": [
    { q: "وين يقع قصر المصمك؟", o: ["جدة", "الرياض", "الدمام", "أبها"], a: 1 },
    { q: "وش المدينة اللي يسمونها «عروس البحر الأحمر»؟", o: ["ينبع", "جدة", "جازان", "الوجه"], a: 1 },
    { q: "وش اسم الموقع الأثري المشهور في العُلا؟", o: ["البتراء", "الحِجر", "تدمر", "جرش"], a: 1 },
    { q: "أكبر صحراء رملية في السعودية؟", o: ["النفود", "الدهناء", "الربع الخالي", "الصمّان"], a: 2 },
    { q: "المدينة اللي يسمونها «عروس المصايف»؟", o: ["أبها", "الطائف", "الباحة", "تبوك"], a: 1 },
    { q: "مشروع «نيوم» يقع في منطقة؟", o: ["تبوك", "الرياض", "مكة المكرمة", "جازان"], a: 0 },
    { q: "الدمام تطل على؟", o: ["البحر الأحمر", "بحر العرب", "الخليج العربي", "البحر المتوسط"], a: 2 },
    { q: "يوم التأسيس السعودي يوافق؟", o: ["٢٢ فبراير", "٢٣ سبتمبر", "١ محرم", "٩ أغسطس"], a: 0 },
  ],
  "عواصم": [
    { q: "عاصمة المغرب؟", o: ["الدار البيضاء", "مراكش", "الرباط", "فاس"], a: 2 },
    { q: "عاصمة السودان؟", o: ["الخرطوم", "أم درمان", "بورتسودان", "كسلا"], a: 0 },
    { q: "عاصمة الإمارات؟", o: ["دبي", "أبوظبي", "الشارقة", "العين"], a: 1 },
    { q: "عاصمة ليبيا؟", o: ["بنغازي", "طرابلس", "مصراتة", "سبها"], a: 1 },
    { q: "عاصمة موريتانيا؟", o: ["نواذيبو", "أطار", "نواكشوط", "كيفة"], a: 2 },
    { q: "عاصمة عُمان؟", o: ["صلالة", "صحار", "مسقط", "نزوى"], a: 2 },
    { q: "عاصمة تركيا؟", o: ["إسطنبول", "أنقرة", "إزمير", "بورصة"], a: 1 },
    { q: "عاصمة أستراليا؟", o: ["سيدني", "ملبورن", "كانبرا", "بيرث"], a: 2 },
  ],
  "جغرافيا": [
    { q: "كم عدد دول مجلس التعاون الخليجي؟", o: ["٤", "٥", "٦", "٧"], a: 2 },
    { q: "وش البحر اللي بين السعودية ومصر؟", o: ["البحر الأحمر", "البحر المتوسط", "بحر العرب", "البحر الأسود"], a: 0 },
    { q: "أكبر دولة عربية مساحة؟", o: ["السعودية", "السودان", "الجزائر", "ليبيا"], a: 2 },
    { q: "النهرين اللي يمرون بالعراق؟", o: ["دجلة والفرات", "النيل والأردن", "العاصي والليطاني", "بردى والنيل"], a: 0 },
    { q: "المضيق اللي بين عُمان وإيران؟", o: ["باب المندب", "هرمز", "جبل طارق", "البوسفور"], a: 1 },
    { q: "البحر الميت يقع بين؟", o: ["الأردن وفلسطين", "مصر والسودان", "لبنان وسوريا", "العراق والكويت"], a: 0 },
    { q: "أطول نهر في العالم حسب المشهور؟", o: ["الأمازون", "النيل", "الفرات", "المسيسيبي"], a: 1 },
  ],
  "أكل": [
    { q: "وش الأكلة اللي أساسها قمح مجروش؟", o: ["الكبسة", "الجريش", "المندي", "المطبق"], a: 1 },
    { q: "كرات عجين مقلية تنسقى بالدبس أو الشيرة، وش اسمها؟", o: ["لقيمات", "بسبوسة", "كنافة", "معمول"], a: 0 },
    { q: "الكسكس أكلة مشهورة في؟", o: ["المغرب العربي", "الخليج", "الشام", "القرن الأفريقي"], a: 0 },
    { q: "المنسف الأكلة الوطنية في؟", o: ["مصر", "الأردن", "عُمان", "تونس"], a: 1 },
    { q: "الكشري أكلة مشهورة في؟", o: ["لبنان", "العراق", "مصر", "اليمن"], a: 2 },
    { q: "التبولة أساسها؟", o: ["البقدونس", "الأرز", "العدس", "البطاطس"], a: 0 },
    { q: "ليش سمّوا المقلوبة «مقلوبة»؟", o: ["لأنها تنقلب من القدر وقت التقديم", "لأنها تنقلى", "لأنها تنقدم باردة", "لأنها بدون رز"], a: 0 },
    { q: "المندي ينطبخ تقليدياً في؟", o: ["قدر ضغط", "حفرة في الأرض", "فرن كهربائي", "مقلاة"], a: 1 },
  ],
  "كورة": [
    { q: "كم لاعب لكل فريق داخل الملعب؟", o: ["٩", "١٠", "١١", "١٢"], a: 2 },
    { q: "كأس العالم ٢٠٢٢ أقيم في؟", o: ["الإمارات", "قطر", "السعودية", "مصر"], a: 1 },
    { q: "السعودية بتستضيف كأس العالم سنة؟", o: ["٢٠٣٠", "٢٠٣٤", "٢٠٢٦", "٢٠٣٨"], a: 1 },
    { q: "كم دقيقة الشوط الواحد؟", o: ["٣٠", "٤٠", "٤٥", "٦٠"], a: 2 },
    { q: "أول منتخب عربي وصل نصف نهائي كأس العالم؟", o: ["مصر", "السعودية", "المغرب", "تونس"], a: 2 },
    { q: "السعودية فازت على الأرجنتين في كأس العالم سنة؟", o: ["٢٠١٨", "٢٠٢٢", "٢٠١٤", "١٩٩٤"], a: 1 },
    { q: "البطاقة اللي تطرد اللاعب؟", o: ["الصفراء", "الحمراء", "الخضراء", "الزرقاء"], a: 1 },
    { q: "ضربة الجزاء تنلعب من كم متر تقريباً؟", o: ["٩", "١١", "١٥", "١٨"], a: 1 },
  ],
  "رياضات": [
    { q: "كم لاعب لكل فريق في كرة السلة داخل الملعب؟", o: ["٥", "٦", "٧", "١١"], a: 0 },
    { q: "الرياضة اللي فيها «كش ملك»؟", o: ["الدامة", "الشطرنج", "البلوت", "الكيرم"], a: 1 },
    { q: "الألعاب الأولمبية الصيفية تنقام كل؟", o: ["سنتين", "٣ سنوات", "٤ سنوات", "٥ سنوات"], a: 2 },
    { q: "كم لاعب لكل فريق في الكرة الطائرة داخل الملعب؟", o: ["٥", "٦", "٧", "٩"], a: 1 },
    { q: "اللعبة اللي تنلعب بمضرب وريشة؟", o: ["التنس", "الريشة الطائرة", "البيسبول", "الهوكي"], a: 1 },
    { q: "في البولينج، إذا طاحت كل القوارير من أول رمية اسمها؟", o: ["سبير", "سترايك", "هاتريك", "أيس"], a: 1 },
  ],
  "الأغلبية": [
    { q: "أحسن كبسة؟", o: ["لحم", "دجاج", "سمك", "ولا وحدة"], a: -1, w: [4, 4, 1, 1] },
    { q: "الشاي ولا القهوة؟", o: ["الشاي", "القهوة", "الاثنين", "ولا واحد"], a: -1, w: [3, 3, 3, 1] },
    { q: "الطلعة أحسن في؟", o: ["البر", "البحر", "الاستراحة", "البيت"], a: -1, w: [4, 2, 3, 1] },
    { q: "أحسن وقت للطلعة؟", o: ["العصر", "المغرب", "بعد العشا", "الفجر"], a: -1, w: [1, 2, 4, 1] },
    { q: "الشتا ولا الصيف؟", o: ["الشتا", "الصيف", "الربيع", "ما يفرق"], a: -1, w: [5, 1, 3, 1] },
    { q: "أحلى شي في الجمعة؟", o: ["السوالف", "الأكل", "الألعاب", "الضحك"], a: -1, w: [3, 4, 2, 3] },
    { q: "التمر المفضّل؟", o: ["سكري", "خلاص", "عجوة", "برحي"], a: -1, w: [4, 3, 2, 2] },
    { q: "تنام بدري ولا تسهر؟", o: ["أنام بدري", "أسهر", "على حسب", "ما أنام"], a: -1, w: [2, 4, 3, 1] },
  ],
  "لهجات": [
    { q: "بالسعودي «أبشر» يعني؟", o: ["من عيوني", "انتبه", "مع السلامة", "تعال"], a: 0 },
    { q: "بالسعودي «وش السالفة؟» يعني؟", o: ["وش القصة؟", "كم الساعة؟", "وين رايح؟", "كم السعر؟"], a: 0 },
    { q: "بالمصري «إزيّك؟» يعني؟", o: ["كيف حالك؟", "وين رايح؟", "كم عمرك؟", "وش اسمك؟"], a: 0 },
    { q: "بالشامي «شو بدّك؟» يعني؟", o: ["وين أنت؟", "وش تبي؟", "متى تجي؟", "كم تبي؟"], a: 1 },
    { q: "بالمغربي «بزّاف» يعني؟", o: ["شوي", "كثير", "بعدين", "بسرعة"], a: 1 },
    { q: "بالعراقي «شكو ماكو؟» يعني؟", o: ["وش الأخبار؟", "كم الساعة؟", "وين المفتاح؟", "مين هو؟"], a: 0 },
    { q: "بالكويتي «شلونك؟» يعني؟", o: ["وش لونك المفضّل؟", "كيف حالك؟", "وين بيتك؟", "متى تنام؟"], a: 1 },
    { q: "إذا أحد قال لك «يعطيك العافية»، وش ترد؟", o: ["صباح النور", "الله يعافيك", "تم", "مع السلامة"], a: 1 },
  ],
  "أمثال": [
    { q: "كمّل المثل: «القرد في عين أمه…»", o: ["غزال", "حلو", "كبير", "ذكي"], a: 0 },
    { q: "كمّل المثل: «اللي ما يعرف الصقر…»", o: ["يشويه", "يطيّره", "يبيعه", "يخاف منه"], a: 0 },
    { q: "كمّل المثل: «الجار قبل…»", o: ["السفر", "الدار", "الأكل", "الطريق"], a: 1 },
    { q: "كمّل المثل: «من جدّ…»", o: ["نام", "وجد", "فاز", "تعب"], a: 1 },
    { q: "كمّل المثل: «العجلة من…»", o: ["الإنسان", "الزمان", "الشيطان", "السيارة"], a: 2 },
    { q: "كمّل المثل: «يا غريب…»", o: ["كن أديب", "ارجع لأهلك", "خذ حذرك", "لا تتأخر"], a: 0 },
    { q: "كمّل المثل: «رزق الهبل على…»", o: ["الأغنياء", "المجانين", "الناس", "أهله"], a: 1 },
  ],
  "لغتنا": [
    { q: "جمع «كتاب»؟", o: ["كتب", "كتابات", "كواتب", "كتيّبات"], a: 0 },
    { q: "ضد «قريب»؟", o: ["سريع", "بعيد", "جديد", "كبير"], a: 1 },
    { q: "كم عدد حروف اللغة العربية؟", o: ["٢٦", "٢٨", "٣٠", "٢٩"], a: 1 },
    { q: "مفرد «أقلام»؟", o: ["قلامة", "مقلمة", "قلم", "أقلم"], a: 2 },
    { q: "«لغة الضاد» لقب اللغة؟", o: ["الفارسية", "العربية", "التركية", "الأردية"], a: 1 },
    { q: "جمع «بيت»؟", o: ["بيوت", "بيتات", "بياتة", "بيتون"], a: 0 },
    { q: "ضد «الصعب»؟", o: ["الثقيل", "السهل", "الطويل", "القوي"], a: 1 },
  ],
  "ألغاز": [
    { q: "شي كل ما زاد نقص؟", o: ["العمر", "الفلوس", "الأكل", "الماء"], a: 0 },
    { q: "شي له أسنان وما يعض؟", o: ["الأسد", "المشط", "القط", "التمساح"], a: 1 },
    { q: "شي يمشي بلا رجلين؟", o: ["الكرسي", "الساعة", "الباب", "الطاولة"], a: 1 },
    { q: "شي كل ما أخذت منه كبر؟", o: ["البحر", "الحفرة", "الكيس", "البالون"], a: 1 },
    { q: "شي تكسره بدون ما تلمسه؟", o: ["الزجاج", "البيض", "الوعد", "القلم"], a: 2 },
    { q: "شي له رقبة وما له راس؟", o: ["الزرافة", "القارورة", "القميص", "الشمعة"], a: 1 },
    { q: "شي له عين وحدة وما يشوف؟", o: ["الإبرة", "القرصان", "الكاميرا", "الساعة"], a: 0 },
  ],
  "تاريخ": [
    { q: "توحيد المملكة العربية السعودية أُعلن سنة؟", o: ["١٩٠٢", "١٩٣٢", "١٩٤٥", "١٩٦٠"], a: 1 },
    { q: "الأهرامات بناها؟", o: ["الرومان", "المصريون القدماء", "الفينيقيون", "الأنباط"], a: 1 },
    { q: "مدينة البتراء بناها؟", o: ["الأنباط", "الفراعنة", "العثمانيون", "الأمويون"], a: 0 },
    { q: "عاصمة الدولة الأموية؟", o: ["بغداد", "دمشق", "القاهرة", "قرطبة"], a: 1 },
    { q: "عاصمة الدولة العباسية؟", o: ["دمشق", "البصرة", "بغداد", "الكوفة"], a: 2 },
    { q: "مخترع الهاتف؟", o: ["أديسون", "غراهام بيل", "نيوتن", "تسلا"], a: 1 },
    { q: "أول إنسان مشى على القمر؟", o: ["يوري غاغارين", "نيل أرمسترونغ", "باز ألدرين", "مايكل كولينز"], a: 1 },
    { q: "أول رائد فضاء عربي؟", o: ["سلطان بن سلمان", "هزاع المنصوري", "محمد فارس", "ريانة برناوي"], a: 0 },
  ],
  "علوم": [
    { q: "وش الكوكب اللي يسمونه الكوكب الأحمر؟", o: ["الزهرة", "المريخ", "المشتري", "زحل"], a: 1 },
    { q: "الماء يغلي عند مستوى سطح البحر على كم درجة مئوية؟", o: ["٨٠", "٩٠", "١٠٠", "١٢٠"], a: 2 },
    { q: "الرمز الكيميائي للماء؟", o: ["CO2", "H2O", "O2", "NaCl"], a: 1 },
    { q: "كم كوكب في المجموعة الشمسية؟", o: ["٧", "٨", "٩", "١٠"], a: 1 },
    { q: "أقرب نجم للأرض؟", o: ["الشمس", "القمر", "المريخ", "الشعرى"], a: 0 },
    { q: "النبات يصنع غذاءه بعملية اسمها؟", o: ["التنفس", "البناء الضوئي", "الهضم", "التبخر"], a: 1 },
    { q: "الغاز اللي نحتاجه نتنفسه عشان نعيش؟", o: ["الأكسجين", "النيتروجين", "الهيليوم", "ثاني أكسيد الكربون"], a: 0 },
  ],
  "جسم الإنسان": [
    { q: "أكبر عضو في جسم الإنسان؟", o: ["الكبد", "الجلد", "القلب", "الرئة"], a: 1 },
    { q: "كم عظمة في جسم الإنسان البالغ؟", o: ["١٥٦", "٢٠٦", "٣٠٦", "١٠٦"], a: 1 },
    { q: "العضو اللي يضخ الدم؟", o: ["الرئة", "القلب", "الكبد", "الكلية"], a: 1 },
    { q: "كم سن عند الإنسان البالغ عادة؟", o: ["٢٨", "٣٢", "٣٠", "٣٦"], a: 1 },
    { q: "أطول عظمة في الجسم؟", o: ["عظمة الفخذ", "العمود الفقري", "الجمجمة", "عظمة الذراع"], a: 0 },
    { q: "كم رئة عند الإنسان؟", o: ["١", "٢", "٣", "٤"], a: 1 },
  ],
  "حيوانات": [
    { q: "أسرع حيوان بري؟", o: ["الأسد", "الفهد", "الحصان", "الغزال"], a: 1 },
    { q: "أكبر حيوان على الأرض؟", o: ["الفيل", "الحوت الأزرق", "الزرافة", "القرش"], a: 1 },
    { q: "صغير الجمل اسمه؟", o: ["مهر", "حُوار", "جرو", "عجل"], a: 1 },
    { q: "كم رجل للعنكبوت؟", o: ["٦", "٨", "١٠", "٤"], a: 1 },
    { q: "بيت النحل اسمه؟", o: ["خلية", "عرين", "وكر", "جحر"], a: 0 },
    { q: "صوت الأسد اسمه؟", o: ["نهيق", "زئير", "نباح", "صهيل"], a: 1 },
    { q: "صوت الحصان اسمه؟", o: ["صهيل", "خوار", "ثغاء", "مواء"], a: 0 },
  ],
  "رياضيات": [
    { q: "٧ × ٨ = ؟", o: ["٥٤", "٥٦", "٦٤", "٤٨"], a: 1 },
    { q: "نص الـ ٩٠؟", o: ["٤٠", "٤٥", "٥٠", "٣٥"], a: 1 },
    { q: "كم دقيقة في ساعتين ونص؟", o: ["١٢٠", "١٥٠", "١٤٠", "١٦٠"], a: 1 },
    { q: "١٠٠ ÷ ٤ = ؟", o: ["٢٥", "٢٠", "٣٠", "٤٠"], a: 0 },
    { q: "كم ضلع للشكل السداسي؟", o: ["٥", "٦", "٧", "٨"], a: 1 },
    { q: "١٥٪ من ٢٠٠؟", o: ["١٥", "٢٠", "٣٠", "٤٥"], a: 2 },
    { q: "كم ثانية في الدقيقتين؟", o: ["٦٠", "١٠٠", "١٢٠", "٢٠٠"], a: 2 },
  ],
  "تقنية": [
    { q: "مؤسس مايكروسوفت؟", o: ["ستيف جوبز", "بيل غيتس", "إيلون ماسك", "مارك زوكربيرغ"], a: 1 },
    { q: "«الواي فاي» هو؟", o: ["شبكة لاسلكية", "شاحن", "كاميرا", "بطارية"], a: 0 },
    { q: "الشركة اللي تصنع الآيفون؟", o: ["سامسونج", "أبل", "هواوي", "سوني"], a: 1 },
    { q: "١ جيجابايت كم ميجابايت تقريباً؟", o: ["١٠٠", "١٠٠٠", "١٠", "١٠٠٠٠"], a: 1 },
    { q: "«USB» هو؟", o: ["منفذ توصيل", "لغة برمجة", "شبكة اجتماعية", "نظام تشغيل"], a: 0 },
    { q: "نظام تشغيل جوالات سامسونج؟", o: ["iOS", "أندرويد", "ويندوز", "لينكس للكمبيوتر"], a: 1 },
  ],
  "عامة": [
    { q: "كم يوم في السنة الكبيسة؟", o: ["٣٦٤", "٣٦٥", "٣٦٦", "٣٦٠"], a: 2 },
    { q: "ألوان إشارة المرور من فوق لتحت؟", o: ["أحمر، أصفر، أخضر", "أخضر، أصفر، أحمر", "أحمر، أخضر، أصفر", "أصفر، أحمر، أخضر"], a: 0 },
    { q: "كم ساعة في اليوم؟", o: ["١٢", "٢٤", "٤٨", "٢٠"], a: 1 },
    { q: "إذا خلطت أزرق مع أصفر يطلع؟", o: ["أخضر", "بنفسجي", "برتقالي", "بني"], a: 0 },
    { q: "كم شهر فيه ٢٨ يوم على الأقل؟", o: ["١", "٢", "٦", "١٢"], a: 3 },
    { q: "أي شهر هجري يصوم فيه المسلمين؟", o: ["شعبان", "رمضان", "شوال", "محرم"], a: 1 },
  ],
};

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
  rules: ["اللاعبين يتقسمون فريقين، أزرق وأحمر.", "الفريق اللي عليه الدور يختار مربع، وكل مربع فئة.", "السؤال يطلع عند الكل، والفريق يصوّت خلال ١٥ ثانية، وجواب الأغلبية هو جواب الفريق.", "صح؟ المربع لكم. غلط؟ الفريق الثاني ياخذ فرصة يسرقه.", "في مربع «وش يقول الأغلبية؟» الصح هو اللي اختاره أكثر الحاضرين.", "أول فريق يكمل خط ثلاثة يفوز باللوحة."],
  setup(S) {
    Object.assign(S, { picks: KCATS.slice(), best: 1, wins: { b: 0, r: 0 }, boardNo: 0 });
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
      <div class="chips pick"><button type="button" class="chip" data-best="1" aria-pressed="${S.best === 1}">لوحة وحدة</button><button type="button" class="chip" data-best="3" aria-pressed="${S.best === 3}">أفضل من ٣</button></div>
      <p class="muted" style="font-weight:700;color:var(--soft)">فئات المربعات (اختر ٣ على الأقل)</p>
      <div class="chips pick">${KCATS.map((c) => `<button type="button" class="chip" data-kc="${c}" aria-pressed="${S.picks.includes(c)}">${KLABEL(c)}</button>`).join("")}</div>`;
  },
  bindLobby(S) {
    screen.querySelectorAll("[data-sw]").forEach((b) => (b.onclick = () => { const id = b.dataset.sw; H.team[id] = kOther(H.team[id] || "b"); beep(640, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-best]").forEach((b) => (b.onclick = () => { H.S.best = +b.dataset.best; beep(700, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-kc]").forEach((b) => (b.onclick = () => { const c = b.dataset.kc, p = H.S.picks; H.S.picks = p.includes(c) ? p.filter((x) => x !== c) : [...p, c]; beep(660, 0.04); hostSend(); }));
    const t = Object.values(S.teams || {});
    if (!t.includes("b") || !t.includes("r") || S.picks.length < 3) $("start").disabled = true;
  },
  resume(S) { if (!(H.usedQ instanceof Set)) H.usedQ = new Set(); if (S.phase === "ask") kFinish(); },
  start() { Object.assign(H.S, { wins: { b: 0, r: 0 }, boardNo: 0 }); H.kst = {}; H.usedQ = new Set(); kNewBoard(); },
  views: { pick: kvPick, ask: kvAsk, res: kvRes, end: kvEnd },
};

// ---------------- the host ----------------
function kNewBoard() {
  hClear();
  const S = H.S;
  S.boardNo++;
  let deck = []; while (deck.length < 9) deck = deck.concat(shuffled(S.picks));
  Object.assign(S, { phase: "pick", board: Array(9).fill(null), sq: deck.slice(0, 9), team: S.boardNo % 2 ? "b" : "r", turns: 0, win: null, ask: null, res: null });
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
  let q = q0;
  if (!q) { const bank = KQB[cat]; q = bank.find((x) => !H.usedQ.has(x.q)) || pickOne(bank); H.usedQ.add(q.q); q = { ...q, cat }; }
  H.q = q; H.votes = {};
  const maj = q.a < 0, T = maj ? 12000 : steal ? 10000 : 15000;
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
  if (ok) S.board[a.i] = team;
  else if (maj) { // no steal round here: the other team's guess is already in
    const oIds = allIds.filter((id) => H.team[id] === other);
    if (oIds.length && argmax(tally(oIds)) === right) { S.board[a.i] = other; note = `بس الفريق ${TN[other]} توقّع صح، والمربع راح لهم!`; }
  }
  S.win = kWinner(S.board);
  const counts = maj ? tally(allIds) : tally(teamIds);
  S.res = { ok, right, teamAns, told, note, counts, total: Math.max(1, maj ? allIds.length : teamIds.length), stealNext: !ok && !a.steal && !maj, answer: q.o[right] ?? "" };
  S.phase = "res";
  hostSend();
}
function kNext() {
  const S = H.S, a = S.ask;
  if (S.phase === "res") {
    if (S.res.stealNext) return hostAsk(a.i, kOther(a.team), true, H.q, S.res.teamAns);
    S.turns++;
    if (S.win || !S.board.includes(null) || S.turns >= 16) return kBoardEnd();
    S.team = a.steal ? a.team : kOther(a.team); // after a steal the turn goes to the team that stole
    S.phase = "pick"; S.ask = null; S.res = null;
    return hostSend();
  }
  if (S.phase === "end" && !S.over) return kNewBoard();
}
function kBoardEnd() {
  const S = H.S, b = kCount(S.board, "b"), r = kCount(S.board, "r");
  const w = S.win ? S.win.t : b > r ? "b" : r > b ? "r" : null;
  if (w) S.wins[w]++;
  const need = S.best === 3 ? 2 : 1;
  S.boardWin = w;
  S.over = S.wins.b >= need || S.wins.r >= need || S.boardNo >= (S.best === 3 ? 5 : 1);
  const st = H.kst, top = (key) => { const id = Object.keys(st).sort((x, y) => st[y][key] - st[x][key])[0]; return id && st[id][key] > 0 ? { id, n: st[id][key] } : null; };
  S.honor = { right: top("right"), told: top("told"), mine: {} };
  Object.keys(st).forEach((id) => (S.honor.mine[id] = st[id]));
  S.phase = "end";
  hostSend();
}

// ---------------- every phone ----------------
function kBoardHTML(S, pickable) {
  const w = S.win ? S.win.line : [];
  return `<div class="k-frame"><div class="k-board">${S.board.map((m, i) => m
    ? `<div class="k-sq ${m} ${w.includes(i) ? "win" : ""}"><span class="m">${m === "b" ? "X" : "O"}</span></div>`
    : `<button type="button" class="k-sq open" data-sq="${i}" ${pickable ? "" : "disabled"}>${KLABEL(S.sq[i])}</button>`).join("")}</div></div>`;
}
const kScore = (S) => `<div class="k-score"><span class="b">الأزرق ${AR(kCount(S.board, "b"))}</span><span class="k-dim" style="font-family:var(--f-body)">${S.best === 3 ? `لوحة ${AR(S.boardNo)} · ${AR(S.wins.b)}-${AR(S.wins.r)}` : "أول خط ثلاثة يفوز"}</span><span class="r">${AR(kCount(S.board, "r"))} الأحمر</span></div>`;
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
  const last = S.win || !S.board.includes(null) || S.turns + 1 >= 16;
  show(`
    <div class="k-turn ${a.team}">${r.ok ? `صح! المربع للفريق ${TN[a.team]}` : a.maj ? `الفريق ${TN[a.team]} ما توقّع الأغلبية` : `غلط! ${a.steal ? "والسرقة ما نجحت" : `فرصة سرقة للفريق ${TN[other]}`}`}</div>
    <div class="k-card" style="display:grid;gap:10px">
      <span class="k-cat">${KLABEL(q.cat)}</span>
      <div class="k-q">${esc(q.q)}</div>
      ${q.o.map((o, k) => `<div class="k-opt ${k === r.right ? "right" : k === r.teamAns || k === a.excluded ? "wrong" : ""}"><i style="width:${Math.round((r.counts[k] / r.total) * 100)}%"></i><span><b>${esc(o)}</b><small>${r.counts[k] ? AR(r.counts[k]) : ""}</small></span></div>`).join("")}
      <p class="k-dim">${a.maj ? `اختيار أغلب الحاضرين: «${esc(r.answer)}».` : `جواب الفريق: «${r.teamAns >= 0 ? esc(q.o[r.teamAns]) : "ما جاوبوا"}».`} ${r.note}</p>
    </div>
    ${r.told.length ? `<div class="k-told pop">${r.told.map((id) => face(who(id), 28)).join("")}<span>«قلت لكم!» ${r.told.map((id) => esc(who(id).name)).join(" و")} صوّت صح</span></div>` : ""}
    ${isHost() ? `<button type="button" class="k-btn" id="kNext">${r.stealNext ? `فرصة الفريق ${TN[other]}` : last ? "النتيجة" : "كمّل"}</button>` : '<p class="k-dim" style="text-align:center">بانتظار المضيف…</p>'}`);
  if (isHost()) $("kNext").onclick = () => kNext();
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
