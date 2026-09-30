"use strict";
  // ================= the yard =================
  const BELL = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 5c-7 0-11 5-11 12v7l-4 5h30l-4-5v-7C31 10 27 5 20 5z" fill="#1b2a4a"/><circle cx="20" cy="33" r="3.5" fill="#1b2a4a"/><path d="M12 12q2-4 6-5" stroke="#ffc933" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>';
  // what the cards say; the rules come from the games themselves (room.js)
  const GAMES = [
    { id: "khallast", line: "حرف، وخانات، وأول واحد يخلّص يوقّف الكل. وبعدها تصويت على الإجابات الغريبة.", tags: ["٢ إلى ٣٠ لاعب", "كتابة", "ضحك"], art: "notebook" },
    { id: "khat", line: "إكس أو على السبورة: كل مربع سؤال، وفريقك يصوّت على الجواب، والغلط يفتح فرصة سرقة.", tags: ["فريقين", "حتى ٣٠ لاعب", "أسئلة"], art: "chalk" },
    { id: "foldit", line: "لعبة الدفتر القديمة: نقطة حبر في نصفك، تنطوي الورقة، وتنطبع على جنود خصمك.", tags: ["لاعبين", "والباقي يتفرجون", "مهارة"], art: "desk", solo: FOLD_IT },
  ];
  function art(g) {
    if (g.art === "notebook") return `<div class="gart notebook"><svg viewBox="0 0 220 150" width="220" height="150" aria-hidden="true"><circle cx="170" cy="60" r="36" fill="#fff" stroke="#c8232c" stroke-width="4"/><text x="170" y="78" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="52" fill="#c8232c">م</text><text x="112" y="42" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="15" font-weight="700" fill="#1c2433">حيوان:</text><text x="58" y="42" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="17" font-weight="700" fill="#1d3fb8">ماعز</text><text x="112" y="84" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="15" font-weight="700" fill="#1c2433">أكلة:</text><text x="58" y="84" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="17" font-weight="700" fill="#1d3fb8">مندي</text><rect x="28" y="104" width="132" height="32" rx="10" fill="#c8232c" transform="rotate(-4 94 120)"/><text x="94" y="127" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="22" fill="#fff" transform="rotate(-4 94 120)">خلّصت!</text></svg></div>`;
    if (g.art === "chalk") return `<div class="gart chalk"><svg viewBox="0 0 150 150" width="150" height="150" aria-hidden="true"><g stroke="#f3f1e6" stroke-width="4" stroke-linecap="round" opacity=".85"><path d="M52 12v126M98 12v126M12 52h126M12 98h126"/></g><g stroke="#9cc8ff" stroke-width="6" stroke-linecap="round"><path d="M22 22l20 20M42 22l-20 20M68 68l14 14M82 68l-14 14M112 112l18 18M130 112l-18 18"/></g><circle cx="120" cy="32" r="12" fill="none" stroke="#ffa3a3" stroke-width="6"/><circle cx="32" cy="120" r="12" fill="none" stroke="#ffa3a3" stroke-width="6"/><path d="M18 18l118 118" stroke="#ffe27a" stroke-width="3" stroke-dasharray="6 6" opacity=".8"/></svg></div>`;
    return `<div class="gart desk"><svg viewBox="0 0 220 150" width="220" height="150" aria-hidden="true"><rect x="40" y="18" width="140" height="116" rx="4" fill="#fbfbf5"/><path d="M40 76h140" stroke="#7c93b3" stroke-width="2.5" stroke-dasharray="8 6"/><circle cx="96" cy="104" r="16" fill="#1d3fb8"/><circle cx="96" cy="48" r="16" fill="#1d3fb8" opacity=".4"/><g stroke="#c8232c" stroke-width="3" stroke-linecap="round" fill="none"><circle cx="146" cy="40" r="6"/><path d="M146 46v12M139 51h14M146 58l-5 8M146 58l5 8"/></g></svg></div>`;
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
        </div>
        <div class="crew" aria-hidden="true">${crew.map((p) => avatar(p.av, 74)).join("")}</div>
      </section>
      <section class="sec" id="games">
        <div class="sec-h"><i></i><h2>ألعابنا</h2></div>
        <div class="games">${GAMES.map((g) => `<article class="gcard">${art(g)}<div class="gbody"><h3>${ROOM_GAMES[g.id].name}</h3><p>${g.line}</p><div class="tags">${g.tags.map((t) => `<span>${t}</span>`).join("")}</div>
          <div class="gbtns"><button type="button" class="play" data-play="${g.id}">افتح غرفة</button><button type="button" class="info" data-info="${g.id}" aria-label="طريقة ${ROOM_GAMES[g.id].name}">؟</button></div>
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
          <details><summary>كم لاعب؟</summary><p>لين ٣٠ في الغرفة. «خط ثلاثة» يتقسمون فيها فريقين، و«اطوِها!» يلعبها اثنين والباقي يتفرجون.</p></details>
          <details><summary>نقدر نغيّر اللعبة بدون ما نطلع؟</summary><p>إيه. المضيف يختار اللعبة من شاشة «وينكم!»، والكل يبقى في نفس الغرفة.</p></details>
          <details><summary>كم تكلف؟</summary><p>مجانية وقت التجربة.</p></details>
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
    document.querySelectorAll("[data-play]").forEach((b) => (b.onclick = () => { beep(700, 0.05); openGame(b.dataset.play); }));
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

