"use strict";
  const $ = (id) => document.getElementById(id);
  const AR = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const FOLD_IT = "foldit/";
  const PUBLIC_URL = "https://musaab998-jpg.github.io/fos7a/";

  // ---------------- characters: a face doodled in pen on a sticky note ----------------
  const NOTES = ["#ffe66d", "#ff9fb2", "#9be7a0", "#9fd3ff", "#ffbd6b", "#c9a7ff", "#f4f1e8", "#7ee0d0"];
  const K = 'stroke="#1c2433" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  const EYES = [
    { n: "نقط", s: '<circle cx="37" cy="46" r="4.5" fill="#1c2433"/><circle cx="63" cy="46" r="4.5" fill="#1c2433"/>' },
    { n: "مفتّحة", s: `<circle cx="37" cy="45" r="8" fill="#fff" ${K.replace('fill="none"', "")}/><circle cx="63" cy="45" r="8" fill="#fff" ${K.replace('fill="none"', "")}/><circle cx="39" cy="46" r="3.2" fill="#1c2433"/><circle cx="65" cy="46" r="3.2" fill="#1c2433"/>` },
    { n: "نعسان", s: `<path d="M30 46q7 5 14 0M56 46q7 5 14 0" ${K}/>` },
    { n: "مبسوط", s: `<path d="M30 49l7-7 7 7M56 49l7-7 7 7" ${K}/>` },
    { n: "غمزة", s: `<circle cx="37" cy="46" r="4.5" fill="#1c2433"/><path d="M56 46h14" ${K}/>` },
    { n: "زعلان", s: `<path d="M30 38l12 5M70 38l-12 5" ${K}/><circle cx="37" cy="48" r="4" fill="#1c2433"/><circle cx="63" cy="48" r="4" fill="#1c2433"/>` },
  ];
  const MOUTHS = [
    { n: "ابتسامة", s: `<path d="M36 64q14 12 28 0" ${K}/>` },
    { n: "ضحكة", s: '<path d="M34 62h32q-2 15-16 15t-16-15z" fill="#fff" stroke="#1c2433" stroke-width="4" stroke-linejoin="round"/>' },
    { n: "جدّي", s: `<path d="M39 68h22" ${K}/>` },
    { n: "مندهش", s: `<circle cx="50" cy="68" r="6" ${K}/>` },
    { n: "شنب", s: '<path d="M33 62q8-8 17-1q9-7 17 1q-8 7-17 1q-9 6-17-1z" fill="#1c2433"/><path d="M42 71q8 4 16 0" stroke="#1c2433" stroke-width="3.5" stroke-linecap="round" fill="none"/>' },
    { n: "لسان", s: `<path d="M36 64q14 10 28 0" ${K}/><path d="M46 69q4 9 8 0" fill="#ff6b81" stroke="#1c2433" stroke-width="3"/>` },
  ];
  const cloth = (fill, stroke) => `<path d="M6 36Q8 2 50 1Q92 2 94 36L98 74H84L82 32Q50 21 18 32L16 74H2Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="50" cy="15" rx="33" ry="6" fill="none" stroke="#111" stroke-width="4.5"/><ellipse cx="50" cy="22" rx="32" ry="5.5" fill="none" stroke="#111" stroke-width="4.5"/>`;
  const HATS = [
    { n: "بدون", s: "" },
    { n: "شماغ", s: cloth("url(#shm)", "#a81d25") },
    { n: "غترة", s: cloth("#fbfbf8", "#cfcfc6") },
    { n: "طاقية", s: '<path d="M22 27q28-24 56 0z" fill="#fff" stroke="#1c2433" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="20" r="1.8" fill="#9aa5bb"/><circle cx="50" cy="17" r="1.8" fill="#9aa5bb"/><circle cx="60" cy="20" r="1.8" fill="#9aa5bb"/>' },
    { n: "نظارة", s: '<rect x="25" y="37" width="22" height="14" rx="5" fill="#111"/><rect x="53" y="37" width="22" height="14" rx="5" fill="#111"/><path d="M47 43h6" stroke="#111" stroke-width="3"/><path d="M29 40l6 0" stroke="#fff" stroke-width="2" opacity=".5"/>' },
    { n: "قبعة تخرّج", s: '<path d="M16 21l34-13 34 13-34 13z" fill="#1c2433"/><path d="M31 25v8q19 9 38 0v-8" fill="#1c2433"/><path d="M82 21v15" stroke="#f4d64a" stroke-width="3" stroke-linecap="round"/><circle cx="82" cy="37" r="3" fill="#f4d64a"/>' },
    { n: "فيونكة", s: '<path d="M66 16l15-9v18zM66 16l-15-9v18z" fill="#e0457b" stroke="#1c2433" stroke-width="2"/><circle cx="66" cy="16" r="4.5" fill="#b8325f" stroke="#1c2433" stroke-width="2"/>' },
  ];
  // `a` can come from another phone, so every part is checked before it goes into the SVG
  const pick = (list, i) => list[Number.isInteger(i) && i >= 0 && i < list.length ? i : 0];
  function avatar(a, size) {
    a = a || {};
    const who = Number.isInteger(a.k) && a.k >= 0 && a.k < PEOPLE.length ? PEOPLE[a.k] : null;
    const hat = who ? "" : pick(HATS, a.h).s, glasses = !who && a.h === 4;
    const tilt = Math.max(-8, Math.min(8, Number(a.r) || -3));
    return `<svg class="av" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true"><g transform="rotate(${tilt} 50 50)">` +
      `<path d="M12 12h76v64L74 90H12z" fill="${pick(NOTES, a.c)}"/><path d="M88 76L74 90V76z" fill="rgba(0,0,0,.2)"/><path d="M12 12h76v7H12z" fill="rgba(0,0,0,.07)"/>` +
      (glasses ? "" : pick(EYES, a.e).s) + pick(MOUTHS, a.m).s + hat + (who ? who.s : "") + "</g></svg>";
  }

  // ---------------- tonight's sheet ----------------
  const CATS = [
    { id: "name", n: "اسم" }, { id: "animal", n: "حيوان" }, { id: "plant", n: "نبات" },
    { id: "thing", n: "جماد" }, { id: "country", n: "بلاد" }, { id: "food", n: "أكلة شعبية" },
    { id: "brand", n: "ماركة" }, { id: "job", n: "مهنة" }, { id: "city", n: "مدينة" },
    { id: "kitchen", n: "شي في المطبخ" }, { id: "player", n: "لاعب كورة" },
    { id: "excuse", n: "عذر للتأخير" }, { id: "gift", n: "هدية" },
  ];
  // answers the other players might write; "?" marks an answer people argue about, "!" a joke
  const DATA = {
    "م": { name: ["محمد", "منيرة", "مشاري", "مها"], animal: ["ماعز", "مها", "ماموث", "!مدير الشركة"], plant: ["موز", "مشمش", "مانجو"], thing: ["مفتاح", "مسطرة", "مكيف", "مخدة"], country: ["مصر", "المغرب", "ماليزيا", "?مسقط"], food: ["مندي", "مطبق", "مرقوق", "?مكرونة"], brand: ["مرسيدس", "ماكدونالدز", "مازدا", "المراعي"], job: ["مهندس", "معلم", "محامي", "!مدير نفسه"] },
    "ب": { name: ["بدر", "بشاير", "بندر", "باسل"], animal: ["بقرة", "بطة", "ببغاء", "بعير"], plant: ["بصل", "بطاطس", "بقدونس", "برتقال"], thing: ["باب", "بشت", "برواز", "!بطارية جوالي الخربانة"], country: ["البحرين", "البرازيل", "بريطانيا", "?بيروت"], food: ["بلاليط", "برياني", "بسبوسة", "?بيتزا"], brand: ["بيبسي", "بوما", "بنده", "بي إم دبليو"], job: ["بائع", "بنّاء", "بحّار", "!بطّال"] },
    "ج": { name: ["جاسم", "جود", "جواهر", "جمانة"], animal: ["جمل", "جرادة", "جاموس", "!جاري أبو فهد"], plant: ["جزر", "جرجير", "جوافة", "جوز"], thing: ["جوال", "جدار", "جزمة", "جرس"], country: ["الجزائر", "جيبوتي", "جورجيا", "?جدة"], food: ["جريش", "جمبري", "?جلي"], brand: ["جرير", "جيب", "?جالكسي"], job: ["جزار", "جندي", "جرّاح", "!جيمر محترف"] },
    "س": { name: ["سعود", "سارة", "سلطان", "سلمى"], animal: ["سلحفاة", "سمكة", "سنجاب", "!سواق الباص"], plant: ["سدر", "سبانخ", "سمسم", "سفرجل"], thing: ["سيارة", "سرير", "ساعة", "سجادة"], country: ["السعودية", "السودان", "سوريا", "سنغافورة"], food: ["سليق", "سمبوسة", "?سلطة"], brand: ["سامسونج", "سوني", "ستاربكس", "سابك"], job: ["سائق", "سبّاك", "سكرتير", "!سنابي مشهور"] },
  };
  const norm = (s) => s.trim().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, " ").replace(/^ال/, "");
  const startsRight = (s, L) => norm(s).startsWith(norm(L));
  function kindOf(text, L, cat) {
    const list = DATA[L][cat] || [];
    for (const x of list) { const clean = x.replace(/^[?!]/, ""); if (norm(clean) === norm(text)) return x[0] === "?" ? "argue" : x[0] === "!" ? "joke" : "good"; }
    return startsRight(text, L) ? "unknown" : "wrong";
  }


  // ---------------- players ----------------
  const me = { id: "me", name: "", av: { c: 0, e: 0, m: 0, h: 0, k: Math.floor(Math.random() * PEOPLE.length), r: -3 }, bot: false };
  let players = [me];
  const P = (id) => players.find((p) => p.id === id);
  const G = { mode: "classic", round: 0, rounds: 2, used: [], letter: "", ans: {}, timers: [], score: {}, stats: {} };
  function stat(id) { return (G.stats[id] ||= { first: 0, laughs: 0, rejected: 0, peeks: 0, accepted: 0, unique: 0, shared: 0 }); }
  const clearTimers = () => { G.timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); G.timers = []; };
  const later = (fn, ms) => G.timers.push(setTimeout(fn, ms));
  const every = (fn, ms) => G.timers.push(setInterval(fn, ms));


  // ---------------- sound ----------------
  let ac = null;
  function beep(f, d = 0.08, type = "sine", v = 0.12) {
    if (!soundOn) return;
    try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + d); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + d); } catch (e) {}
  }
  const buzz = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

  // ---------------- one profile for every game ----------------
  const PKEY = "fos7a.profile.v1";
  try { const saved = JSON.parse(localStorage.getItem(PKEY) || "null"); if (saved && saved.av) { me.name = saved.name || ""; Object.assign(me.av, saved.av); } } catch (e) {}
  const saveProfile = () => { try { localStorage.setItem(PKEY, JSON.stringify({ name: me.name, av: me.av })); } catch (e) {} };

  const screen = $("screen");
  const show = (html) => { screen.innerHTML = html; screen.scrollTop = 0; };
  const setTop = (t) => { $("topLeft").textContent = t; };
  let current = null; // the open game
  function view(v) {
    $("hub").hidden = v !== "hub"; $("profile").hidden = v !== "profile"; $("game").hidden = v !== "game";
    document.body.dataset.theme = v === "game" ? current : "hub";
    // inside the Android app the system bars follow the room's colour
    try { window.Fos7aApp?.setTheme({ khallast: "#fbf8ef", khat: "#22402f" }[document.body.dataset.theme] || "#fff6dc"); } catch (e) {}
    scrollTo(0, 0);
  }

