"use strict";
  // ================= the yard =================
  const BELL = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 5c-7 0-11 5-11 12v7l-4 5h30l-4-5v-7C31 10 27 5 20 5z" fill="#1b2a4a"/><circle cx="20" cy="33" r="3.5" fill="#1b2a4a"/><path d="M12 12q2-4 6-5" stroke="#ffc933" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>';
  // what the cards say; the rules come from the games themselves (room.js)
  const GAMES = [
    { id: "khallast", line: "حرف، وخانات، وأول واحد يخلّص يوقّف الكل. وبعدها تصويت على الإجابات الغريبة.", tags: ["٢ إلى ٣٠ لاعب", "كتابة", "ضحك"], art: "notebook" },
    { id: "khat", line: "إكس أو على السبورة: كل مربع سؤال، وفريقك يصوّت على الجواب، والغلط يفتح فرصة سرقة.", tags: ["فريقين", "حتى ٣٠ لاعب", "أسئلة"], art: "chalk" },
    { id: "trabee", line: "حوش المدرسة بلاط: اختاروا بلاطة، جاوبوا صح ولوّنوها هي واللي حولها بطباشيركم. والغلط يروح للفريق الثاني.", tags: ["٢ إلى ٤ فرق", "حتى ٣٠ لاعب", "أسئلة"], art: "yard" },
    { id: "foldit", line: "لعبة الدفتر القديمة: نقطة حبر في نصفك، تنطوي الورقة، وتنطبع على جنود خصمك.", tags: ["لاعبين", "والباقي يتفرجون", "مهارة"], art: "desk", solo: FOLD_IT },
  ];
  function art(g) {
    if (g.art === "notebook") return `<div class="gart notebook"><svg viewBox="0 0 220 150" width="220" height="150" aria-hidden="true"><circle cx="170" cy="60" r="36" fill="#fff" stroke="#c8232c" stroke-width="4"/><text x="170" y="78" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="52" fill="#c8232c">م</text><text x="112" y="42" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="15" font-weight="700" fill="#1c2433">حيوان:</text><text x="58" y="42" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="17" font-weight="700" fill="#1d3fb8">ماعز</text><text x="112" y="84" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="15" font-weight="700" fill="#1c2433">أكلة:</text><text x="58" y="84" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="17" font-weight="700" fill="#1d3fb8">مندي</text><rect x="28" y="104" width="132" height="32" rx="10" fill="#c8232c" transform="rotate(-4 94 120)"/><text x="94" y="127" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="22" fill="#fff" transform="rotate(-4 94 120)">خلّصت!</text></svg></div>`;
    if (g.art === "chalk") return `<div class="gart chalk"><svg viewBox="0 0 150 150" width="150" height="150" aria-hidden="true"><g stroke="#f3f1e6" stroke-width="4" stroke-linecap="round" opacity=".85"><path d="M52 12v126M98 12v126M12 52h126M12 98h126"/></g><g stroke="#9cc8ff" stroke-width="6" stroke-linecap="round"><path d="M22 22l20 20M42 22l-20 20M68 68l14 14M82 68l-14 14M112 112l18 18M130 112l-18 18"/></g><circle cx="120" cy="32" r="12" fill="none" stroke="#ffa3a3" stroke-width="6"/><circle cx="32" cy="120" r="12" fill="none" stroke="#ffa3a3" stroke-width="6"/><path d="M18 18l118 118" stroke="#ffe27a" stroke-width="3" stroke-dasharray="6 6" opacity=".8"/></svg></div>`;
    if (g.art === "yard") {
      // a corner of the yard: chalked tiles in perspective, a cone, chalk sticks and the folded question note
      const C = ["#ff5a6e", "#3e8bff", "#2fbf71", "#ff9f1c"], own = ["..00.11", ".0001111", "2200.31", "22.3333", ".2..33."], ctr = { "1,2": 1, "3,0": 1, "3,4": 1 };
      let tiles = "";
      own.forEach((row, r) => [...row.padEnd(7, ".")].slice(0, 7).forEach((o, c) => {
        const x = 8 + c * 26, y = 6 + r * 26, f = o === "." ? "#d9d3c7" : C[+o];
        tiles += `<rect x="${x}" y="${y}" width="23" height="23" rx="3" fill="${f}"/>${o === "." ? "" : `<rect x="${x}" y="${y}" width="23" height="23" rx="3" fill="url(#yhatch)"/>`}${ctr[r + "," + c] ? `<circle cx="${x + 11.5}" cy="${y + 11.5}" r="6.5" fill="none" stroke="#fff" stroke-width="2.4"/>` : ""}`;
      }));
      return `<div class="gart yard"><svg viewBox="0 0 220 150" width="250" height="170" aria-hidden="true"><defs><pattern id="yhatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 0h4" stroke="#fff" stroke-opacity=".35" stroke-width="1"/></pattern></defs>
        <g transform="translate(14 8) skewX(-8) rotate(-4 95 70)"><rect x="2" y="0" width="190" height="138" rx="9" fill="#b3aa98"/><rect x="2" y="134" width="190" height="6" rx="3" fill="#1b2a4a" opacity=".18"/>${tiles}
          <g transform="translate(164 59)"><ellipse cx="11.5" cy="20" rx="12" ry="3" fill="#1b2a4a" opacity=".2"/><path d="M11.5 -2l7 20h-14z" fill="#ff7a1a"/><path d="M7.6 9h7.8l1.4 4h-10.6z" fill="#fff"/><rect x="1" y="17" width="21" height="4" rx="1.5" fill="#e0640c"/></g></g>
        <g transform="rotate(-18 40 128)"><rect x="18" y="122" width="34" height="9" rx="4.5" fill="#ff5a6e"/><rect x="18" y="122" width="34" height="3" rx="1.5" fill="#fff" opacity=".35"/></g>
        <g transform="rotate(8 70 136)"><rect x="52" y="131" width="28" height="9" rx="4.5" fill="#3e8bff"/><rect x="52" y="131" width="28" height="3" rx="1.5" fill="#fff" opacity=".35"/></g>
        <g transform="translate(6 -4) scale(.9) rotate(7 186 30)"><path d="M160 10h44v38h-36l-8-8z" fill="#fff" stroke="#1b2a4a" stroke-width="2.5" stroke-linejoin="round"/><path d="M160 40l8 0v8z" fill="#e8dcc0" stroke="#1b2a4a" stroke-width="2" stroke-linejoin="round"/><text x="183" y="38" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="28" fill="#1b2a4a">؟</text></g>
      </svg></div>`;
    }
    // اطوِها: a notebook page under the lamp, the top half folding down onto the soldiers, a ballpoint blob, a pen
    return `<div class="gart desk"><svg viewBox="0 0 220 150" width="250" height="170" aria-hidden="true"><defs><linearGradient id="dflap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dbe6"/><stop offset="1" stop-color="#fbfbf5"/></linearGradient></defs>
      <ellipse cx="110" cy="80" rx="96" ry="66" fill="#ffd678" opacity=".05"/>
      <g transform="rotate(-5 110 80)">
        <rect x="56" y="83" width="116" height="64" rx="3" fill="#000" opacity=".35"/>
        <rect x="52" y="78" width="116" height="64" rx="3" fill="#fbfbf5"/>
        <g stroke="#c7d7ea" stroke-width="1.2">${[90, 102, 114, 126].map((y) => `<path d="M52 ${y}h116"/>`).join("")}</g><path d="M150 78v64" stroke="#e46b6b" stroke-width="1.4"/>
        <path d="M95 112c-2-9 5-15 13-13 7-4 15 2 13 9 6 5 2 14-6 13-4 6-13 6-16 0-7 1-10-5-4-9z" fill="#1d3fb8"/><circle cx="128" cy="100" r="3" fill="#1d3fb8"/><circle cx="88" cy="122" r="2.2" fill="#1d3fb8"/><circle cx="133" cy="118" r="1.6" fill="#1d3fb8"/><path d="M108 125q1 7-1 11" stroke="#1d3fb8" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M52 78h116l-10 -46h-96z" fill="url(#dflap)"/><g stroke="#c7d7ea" stroke-width="1" opacity=".8">${[68, 58, 48, 38].map((y, k) => `<path d="M${54 + (78 - y) * 0.2} ${y}h${112 - (78 - y) * 0.4}"/>`).join("")}</g>
        <g stroke="#c8232c" stroke-width="2.4" stroke-linecap="round" fill="none"><circle cx="84" cy="50" r="4.5"/><path d="M84 55v9M78.5 58h11M84 64l-4 6M84 64l4 6"/><circle cx="132" cy="54" r="4.5"/><path d="M132 59v9M126.5 62h11M132 68l-4 6M132 68l4 6"/></g>
        <path d="M76 54c-1-6 4-10 9-7 5-3 10 2 8 7 4 3 0 9-5 7-3 4-9 3-10-1-4 0-5-4-2-6z" fill="#1d3fb8" opacity=".6"/>
        <path d="M44 78h132" stroke="#ffc933" stroke-width="2.4" stroke-dasharray="7 5"/>
        <path d="M184 60q8 18 0 34" stroke="#ffc933" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M178 90l6 6 5-7" stroke="#ffc933" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g transform="rotate(32 40 120)"><rect x="12" y="116" width="60" height="8" rx="4" fill="#e9edf5"/><rect x="12" y="116" width="14" height="8" rx="3" fill="#1d3fb8"/><path d="M72 116l9 4-9 4z" fill="#c9cfdb"/><circle cx="81" cy="120" r="1.4" fill="#1d3fb8"/></g>
    </svg></div>`;
  }
  function renderHub() {
    const crew = [me, ...[24, 35, 1, 17, 30].map((k, i) => ({ av: { c: (i * 3 + 1) % NOTES.length, e: i % EYES.length, m: (i + 1) % MOUTHS.length, h: 0, k, r: i % 2 ? 3 : -3 } }))];
    $("hub").innerHTML = `<div class="hub-in">
      <header class="hdr">
        <button type="button" class="logo" id="ringBell" aria-label="دق جرس الفسحة">${BELL}فسحة</button>
        <nav class="nav"><a href="#games">الألعاب</a><a href="#faq">الأسئلة</a></nav>
        <span class="row" style="gap:8px"><button type="button" class="sndbtn" data-sound aria-pressed="${soundOn}" aria-label="${soundOn ? "اكتم الصوت" : "شغّل الصوت"}">${speakerIcon(soundOn)}</button><button type="button" class="me-chip" id="meChip">${avatar(me.av, 30)}<span>${me.name ? esc(me.name) : "سوّ شخصيتك"}</span></button></span>
      </header>
      <section class="hero" id="top">
        <div>
          <p class="kick">ألعاب جماعية للجمعات</p>
          <h1>فسحة</h1>
          <p class="lead">دق الجرس! المضيف يفتح غرفة، والكل يدخل من جواله برمز. بدون تحميل ولا تسجيل، والتلفزيون اختياري.</p>
          <div class="hero-btns"><button type="button" class="hbtn bellbtn" id="heroBell">${BELL}دق الجرس</button><a class="hbtn" href="#games">اختاروا لعبة</a><button type="button" class="hbtn alt" id="heroMe">شخصيتك</button></div>
          ${(() => { const r = savedRoom(); return r ? `<div class="resume pop"><span>غرفتك <b dir="ltr">${esc(r.code)}</b> للحين مفتوحة</span><button type="button" class="hbtn" id="resumeBtn">رجّعها</button><button type="button" class="hbtn alt" id="dropRoom">قفلها</button></div>` : ""; })()}
          <form class="joinbox" id="joinForm"><input id="joinCode" maxlength="4" placeholder="رمز الغرفة" aria-label="رمز الغرفة" autocomplete="off" autocapitalize="characters"><button type="submit" class="hbtn">ادخل</button></form>
          <p style="margin-top:10px">${passActive() ? `<button type="button" class="passchip" data-pass="">✓ تذكرتك فعالة</button>` : `<button type="button" class="passnote" data-pass="" style="font-size:14px">عندك كود؟</button>`}</p>
        </div>
        <div class="crew" aria-hidden="true">${crew.map((p) => avatar(p.av, 74)).join("")}</div>
      </section>
      <section class="sec" id="games">
        <div class="sec-h"><i></i><h2>ألعابنا</h2></div>
        <div class="games">${GAMES.map((g) => `<article class="gcard">${art(g)}<div class="gbody"><h3>${ROOM_GAMES[g.id].name}</h3><p>${g.line}</p><div class="tags">${g.tags.map((t) => `<span>${t}</span>`).join("")}</div>
          <div class="gbtns"><button type="button" class="play" data-play="${g.id}">افتح غرفة</button><button type="button" class="info" data-info="${g.id}" aria-label="طريقة ${ROOM_GAMES[g.id].name}">؟</button></div>
          ${!canHost(g.id) ? `<button type="button" class="passnote" data-pass="${g.id}">خلصت جلستها المجانية · عندك كود؟</button>` : ""}
          ${g.solo ? `<a class="solo" href="${g.solo}">أو العبها على نفس الجوال، ولها لغز يومي</a>` : ""}</div></article>`).join("")}</div>
      </section>
      <section class="sec">
        <div class="sec-h"><i></i><h2>كيف تلعبون</h2></div>
        <div class="steps">
          <div class="step"><b>١</b><h3>المضيف يفتح غرفة</h3><p>يختار لعبة ويطلع له رمز من أربع حروف.</p></div>
          <div class="step"><b>٢</b><h3>الكل يدخل من جواله</h3><p>بالرمز أو الرابط، ويختار اسمه وشخصيته. بدون تطبيق ولا حساب.</p></div>
          <div class="step"><b>٣</b><h3>كل شي يطلع في الجوال</h3><p>الأسئلة والتصويت والنتائج عند كل واحد. وإذا عندكم تلفزيون يصير عرض إضافي.</p></div>
        </div>
      </section>
      <section class="sec" id="faq">
        <div class="sec-h"><i></i><h2>أسئلة</h2></div>
        <div class="faq">
          <details><summary>لازم أحمّل تطبيق؟</summary><p>لا. تدخلون من متصفح الجوال بالرمز، واللي يبي التطبيق يقدر ينزله.</p></details>
          <details><summary>نحتاج تلفزيون أو بروجكتر؟</summary><p>لا. كل شي يطلع في جوال كل لاعب: الأسئلة والتصويت والنتائج. التلفزيون عرض إضافي بس.</p></details>
          <details><summary>كم لاعب؟</summary><p>لين ٣٠ في الغرفة. «خط ثلاثة» يتقسمون فيها فريقين، و«ترابيع» لين أربع فرق، و«اطوِها!» يلعبها اثنين والباقي يتفرجون.</p></details>
          <details><summary>نقدر نغيّر اللعبة بدون ما نطلع؟</summary><p>إيه. المضيف يختار اللعبة من شاشة «وينكم!»، والكل يبقى في نفس الغرفة.</p></details>
          <details><summary>كم تكلف؟</summary><p>كل لعبة لها جلسة مجانية. بعدها يفتح المضيف كل الألعاب بكود، تاخذه من حسابنا في انستقرام <a href="https://instagram.com/fos7a.games" target="_blank" rel="noopener">@fos7a.games</a>. واللي يدخلون الغرفة يلعبون مجاناً دائماً.</p></details>
          <details><summary>وش تحفظون عني؟</summary><p>ولا شي على سيرفر. اسمك وشخصيتك في جوالك بس، واللعب يمر بين جوالات الغرفة ويروح. التفاصيل في <a href="privacy.html">صفحة الخصوصية</a>.</p></details>
        </div>
      </section>
      <footer class="foot"><span>فسحة · <a href="privacy.html">الخصوصية</a></span><span>ألعاب جماعية من جوالاتكم</span></footer>
    </div>`;
    if ($("resumeBtn")) { $("resumeBtn").onclick = () => { beep(700, 0.05); resumeRoom(); }; $("dropRoom").onclick = () => { const r = savedRoom(); forgetRoom(); if (r) { const n = openRoom(r.code, () => {}, (st) => { if (st === "SUBSCRIBED") { n.send({ t: "state", s: { phase: "closed" } }); setTimeout(() => n.close(), 400); } }); } renderHub(); }; }
    $("joinForm").onsubmit = (e) => { e.preventDefault(); const c = cleanCode($("joinCode").value); if (c.length === 4) { beep(700, 0.05); openJoin(c); } else $("joinCode").focus(); };
    $("ringBell").onclick = $("heroBell").onclick = () => { if (!soundOn) setSound(true); recess(); const b = $("hub"); b.classList.remove("ring"); void b.offsetWidth; b.classList.add("ring"); };
    document.querySelectorAll("[data-sound]").forEach((b) => (b.onclick = () => setSound(!soundOn)));
    $("meChip").onclick = $("heroMe").onclick = () => openProfile(() => { renderHub(); view("hub"); });
    document.querySelectorAll("[data-play]").forEach((b) => (b.onclick = () => { beep(700, 0.05); const id = b.dataset.play; if (!canHost(id)) return openPass(id, () => openGame(id)); openGame(id); }));
    document.querySelectorAll("[data-pass]").forEach((b) => (b.onclick = () => openPass(b.dataset.pass || null)));
    document.querySelectorAll("[data-info]").forEach((b) => (b.onclick = () => { const g = ROOM_GAMES[b.dataset.info]; $("modalCard").innerHTML = `<h3>${g.name}</h3><ol>${g.rules.map((r) => `<li>${r}</li>`).join("")}</ol><button type="button" class="pbtn" id="mClose">فهمت</button>`; $("modal").hidden = false; $("mClose").onclick = () => ($("modal").hidden = true); }));
  }
  $("modal").addEventListener("click", (e) => { if (e.target === $("modal")) $("modal").hidden = true; });

  // ================= your character =================
  let tab = "k", afterProfile = null;
  function openProfile(done) { afterProfile = done; view("profile"); drawProfile(); }
  function drawProfile() {
    const list = tab === "k" ? PEOPLE.map((x, i) => ({ i, a: { ...me.av, k: i }, n: x.land, t: `${x.name}: ${x.wear}` })) :
      tab === "c" ? NOTES.map((_, i) => ({ i, a: { ...me.av, c: i }, n: "" })) :
      tab === "e" ? EYES.map((x, i) => ({ i, a: { ...me.av, e: i, h: me.av.h === 4 ? 0 : me.av.h }, n: x.n })) :
      tab === "m" ? MOUTHS.map((x, i) => ({ i, a: { ...me.av, m: i }, n: x.n })) :
      [];
    $("profile").innerHTML = `<div class="prof">
      <div class="hdr" style="padding-block:4px"><span class="logo" style="font-size:28px">${BELL}فسحة</span></div>
      <div class="pcard">
        <h2 style="font-size:30px">شخصيتك</h2>
        <p style="font-size:14px;color:#3c4a6b">اختر شخصيتك من ٢٢ دولة عربية، وغيّر لون الورقة والوجه على كيفك. تطلع جنب اسمك في كل ألعاب فسحة.</p>
        <div class="builder" style="margin-top:12px">
          <div>${avatar(me.av, 110)}</div>
          <div class="field"><label for="nm">اسمك</label><input id="nm" value="${esc(me.name)}" maxlength="12" placeholder="مثلاً: ${PEOPLE[me.av.k]?.name || "مصعب"}" autocomplete="off"></div>
        </div>
      </div>
      <div>
        <div class="ptabs" role="tablist">${[["k", "الشخصية"], ["c", "لون الورقة"], ["e", "العيون"], ["m", "الفم"]].map(([k, n]) => `<button type="button" class="ptab" role="tab" data-tab="${k}" aria-selected="${tab === k}">${n}</button>`).join("")}</div>
        <div class="popts">${list.map((o) => `<button type="button" class="popt" data-set="${o.i}" aria-pressed="${me.av[tab] === o.i}" aria-label="${o.t || o.n || "لون " + (o.i + 1)}"${o.t ? ` title="${o.t}"` : ""}>${avatar(o.a, 52)}${o.n ? `<small>${o.n}</small>` : ""}</button>`).join("")}</div>
      </div>
      <button type="button" class="pbtn alt" id="shuffle">شخصية عشوائية</button>
      <button type="button" class="pbtn" id="saveMe">حفظ</button>
    </div>`;
    const nm = $("nm");
    nm.addEventListener("input", () => { me.name = nm.value.trim(); });
    $("profile").querySelectorAll(".ptab").forEach((b) => (b.onclick = () => { tab = b.dataset.tab; drawProfile(); }));
    $("profile").querySelectorAll(".popt").forEach((b) => (b.onclick = () => { me.av[tab] = +b.dataset.set; if (tab === "e" && me.av.h === 4) me.av.h = 0; if (tab === "k") me.av.h = 0; beep(700, 0.04); drawProfile(); }));
    $("shuffle").onclick = () => { me.av = { c: Math.floor(rnd(0, NOTES.length)), e: Math.floor(rnd(0, EYES.length)), m: Math.floor(rnd(0, MOUTHS.length)), h: 0, k: Math.floor(rnd(0, PEOPLE.length)), r: -3 }; beep(600, 0.05); drawProfile(); };
    $("saveMe").onclick = () => {
      if (isRude(nm.value)) { nm.value = ""; nm.placeholder = "اختر اسم ثاني 🙂"; nm.focus(); beep(200, 0.2, "sawtooth", 0.06); buzz([40, 30, 40]); return; }
      me.name = nm.value.trim() || "أنا"; saveProfile(); beep(880, 0.08); (afterProfile || (() => { renderHub(); view("hub"); }))(); };
  }

