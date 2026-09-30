"use strict";
  // ================= the yard =================
  const BELL = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 5c-7 0-11 5-11 12v7l-4 5h30l-4-5v-7C31 10 27 5 20 5z" fill="#1b2a4a"/><circle cx="20" cy="33" r="3.5" fill="#1b2a4a"/><path d="M12 12q2-4 6-5" stroke="#ffc933" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>';
  const GAMES = [
    { id: "khallast", name: "خلّصت!", line: "حرف، وخانات، وأول واحد يخلّص يوقّف الكل. وبعدها تصويت على الإجابات الغريبة.", tags: ["٣ إلى ١٢ لاعب", "كتابة", "ضحك"], art: "notebook",
      rules: ["تفتح غرفة من جوالك، والباقين يصوّرون الباركود ويدخلون من متصفح جوالهم بدون تطبيق.", "تختار «الورقة» (٤ خانات) أو «خانة خانة» (سريعة).", "يطلع حرف عند الكل، وكل واحد يكتب في جواله.", "أول واحد يعبّي كل شي يضغط «خلّصت!»، والباقين عندهم ٥ ثواني.", "الإجابات المعروفة تنقبل تلقائي، والغريبة تنعرض للتصويت بدون أسماء.", "الإجابة الوحيدة ١٠، المكررة ٥، وأضحك إجابة تاخذ ٥ زيادة.", "في النهاية كل واحد ياخذ شهادة بلقب."] },
    { id: "khat", name: "خط ثلاثة", line: "إكس أو على السبورة: كل مربع سؤال، وفريقك يصوّت على الجواب. للحين تجربة مع لاعبين وهميين.", tags: ["فريقين", "معلومات", "تصويت"], art: "chalk",
      rules: ["فريقين، أزرق وأحمر، والدور بالتناوب.", "فريقك يختار مربع، وكل مربع فئة.", "السؤال يطلع عند الكل، وفريقك يصوّت خلال ١٥ ثانية، وإجابة الأغلبية هي إجابتكم.", "صح؟ المربع لكم. غلط؟ الفريق الثاني ياخذ فرصة يسرقه.", "اللي صوّت صح وفريقه غلط ياخذ نقطة «قلت لكم!».", "مربع «وش يقول الأغلبية؟» ما له جواب صحيح: الصح هو اللي اختاره أكثر الحاضرين.", "أول فريق يسوي خط ثلاثة يفوز."] },
    { id: "foldit", name: "اطوِها!", line: "لعبة الدفتر القديمة: نقطة حبر في نصفك، تطوي الورقة، وتنطبع على جنود خصمك. ولها لغز يومي.", tags: ["لاعبين", "مهارة", "لغز يومي"], art: "desk", ext: FOLD_IT,
      rules: ["كل لاعب يوزّع جنوده في نصفه من الورقة.", "تحط نقطة حبر في نصفك، وتقدّر بعينك وين بتنطبع.", "تطوي الورقة، والحبر ينطبع على الجهة الثانية.", "خط الطي يتحرك ويميل كل دور.", "إذا صبت يستمر دورك."] },
  ];
  function art(g) {
    if (g.art === "notebook") return `<div class="gart notebook"><svg viewBox="0 0 220 150" width="220" height="150" aria-hidden="true"><circle cx="170" cy="60" r="36" fill="#fff" stroke="#c8232c" stroke-width="4"/><text x="170" y="78" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="52" fill="#c8232c">م</text><text x="112" y="42" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="15" font-weight="700" fill="#1c2433">حيوان:</text><text x="58" y="42" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="17" font-weight="700" fill="#1d3fb8">ماعز</text><text x="112" y="84" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="15" font-weight="700" fill="#1c2433">أكلة:</text><text x="58" y="84" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="17" font-weight="700" fill="#1d3fb8">مندي</text><rect x="28" y="104" width="132" height="32" rx="10" fill="#c8232c" transform="rotate(-4 94 120)"/><text x="94" y="127" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="22" fill="#fff" transform="rotate(-4 94 120)">خلّصت!</text></svg></div>`;
    if (g.art === "chalk") return `<div class="gart chalk"><svg viewBox="0 0 150 150" width="150" height="150" aria-hidden="true"><g stroke="#f3f1e6" stroke-width="4" stroke-linecap="round" opacity=".85"><path d="M52 12v126M98 12v126M12 52h126M12 98h126"/></g><g stroke="#9cc8ff" stroke-width="6" stroke-linecap="round"><path d="M22 22l20 20M42 22l-20 20M68 68l14 14M82 68l-14 14M112 112l18 18M130 112l-18 18"/></g><circle cx="120" cy="32" r="12" fill="none" stroke="#ffa3a3" stroke-width="6"/><circle cx="32" cy="120" r="12" fill="none" stroke="#ffa3a3" stroke-width="6"/><path d="M18 18l118 118" stroke="#ffe27a" stroke-width="3" stroke-dasharray="6 6" opacity=".8"/></svg></div>`;
    return `<div class="gart desk"><svg viewBox="0 0 220 150" width="220" height="150" aria-hidden="true"><rect x="40" y="18" width="140" height="116" rx="4" fill="#fbfbf5"/><path d="M40 76h140" stroke="#7c93b3" stroke-width="2.5" stroke-dasharray="8 6"/><circle cx="96" cy="104" r="16" fill="#1d3fb8"/><circle cx="96" cy="48" r="16" fill="#1d3fb8" opacity=".4"/><g stroke="#c8232c" stroke-width="3" stroke-linecap="round" fill="none"><circle cx="146" cy="40" r="6"/><path d="M146 46v12M139 51h14M146 58l-5 8M146 58l5 8"/></g></svg></div>`;
  }
  function renderHub() {
    const crew = [me, ...BOTS];
    $("hub").innerHTML = `<div class="hub-in">
      <header class="hdr">
        <a class="logo" href="#top" aria-label="فسحة">${BELL}فسحة</a>
        <nav class="nav"><a href="#games">الألعاب</a><a href="#plans">الاشتراكات</a><a href="#faq">الأسئلة</a></nav>
        <button type="button" class="me-chip" id="meChip">${avatar(me.av, 30)}<span>${me.name ? esc(me.name) : "سوّ شخصيتك"}</span></button>
      </header>
      <section class="hero" id="top">
        <div>
          <p class="kick">ألعاب جماعية للجمعات</p>
          <h1>فسحة</h1>
          <p class="lead">دق الجرس! المضيف يفتح غرفة، والكل يدخل من جواله برمز. بدون تحميل ولا تسجيل، والتلفزيون اختياري.</p>
          <div class="hero-btns"><a class="hbtn" href="#games">اختاروا لعبة</a><button type="button" class="hbtn alt" id="heroMe">شخصيتك</button></div>
          <form class="joinbox" id="joinForm"><input id="joinCode" maxlength="4" placeholder="رمز الغرفة" aria-label="رمز الغرفة" autocomplete="off" autocapitalize="characters"><button type="submit" class="hbtn">ادخل</button></form>
        </div>
        <div class="crew" aria-hidden="true">${crew.map((p) => avatar(p.av, 74)).join("")}</div>
      </section>
      <section class="sec" id="games">
        <div class="sec-h"><i></i><h2>ألعابنا</h2></div>
        <div class="games">${GAMES.map((g) => `<article class="gcard">${art(g)}<div class="gbody"><h3>${g.name}</h3><p>${g.line}</p><div class="tags">${g.tags.map((t) => `<span>${t}</span>`).join("")}</div>
          <div class="gbtns">${g.ext ? `<a class="play" href="${g.ext}">العب</a>` : `<button type="button" class="play" data-play="${g.id}">${g.id === "khallast" ? "افتح غرفة" : "جرّبها"}</button>`}<button type="button" class="info" data-info="${g.id}" aria-label="طريقة ${g.name}">؟</button></div></div></article>`).join("")}</div>
      </section>
      <section class="sec">
        <div class="sec-h"><i></i><h2>كيف تلعبون</h2></div>
        <div class="steps">
          <div class="step"><b>١</b><h3>المضيف يفتح غرفة</h3><p>يختار لعبة ويطلع له رمز من أربع حروف.</p></div>
          <div class="step"><b>٢</b><h3>الكل يدخل من جواله</h3><p>بالرمز أو الرابط، ويختار اسمه وشخصيته. بدون تطبيق ولا حساب.</p></div>
          <div class="step"><b>٣</b><h3>كل شي يطلع في الجوال</h3><p>الأسئلة والتصويت والنتائج عند كل واحد. وإذا عندكم تلفزيون يصير عرض إضافي.</p></div>
        </div>
      </section>
      <section class="sec" id="plans">
        <div class="sec-h"><i></i><h2>اشتراكات فسحة</h2></div>
        <div class="plans">
          <div class="plan"><h3>مجاني</h3><div class="price">٠</div><ul><li>جولة وحدة من كل لعبة</li><li>لين ٤ لاعبين</li><li>اطوِها ولغز اليوم</li></ul></div>
          <div class="plan star"><h3>ليلة</h3><div class="price">٩٫٩٩ <small>ر.س لـ ١٢ ساعة</small></div><ul><li>كل الألعاب بلا حدود</li><li>لين ١٢ لاعب</li><li>المضيف بس يدفع</li></ul></div>
          <div class="plan"><h3>شهر</h3><div class="price">١٩٫٩٩ <small>ر.س بالشهر</small></div><ul><li>كل اللي في «ليلة» طول الشهر</li><li>باقات خانات وأسئلة موسمية</li><li>ألوان وقبعات خاصة للشخصية</li></ul></div>
        </div>
        <p class="note">الأسعار مثال للمقارنة، نحددها بعدين.</p>
      </section>
      <section class="sec" id="faq">
        <div class="sec-h"><i></i><h2>أسئلة</h2></div>
        <div class="faq">
          <details><summary>لازم أحمّل تطبيق؟</summary><p>لا. تدخلون من متصفح الجوال بالرمز، واللي يبي التطبيق يقدر ينزله.</p></details>
          <details><summary>نحتاج تلفزيون أو بروجكتر؟</summary><p>لا. كل شي يطلع في جوال كل لاعب: الأسئلة والتصويت والنتائج. التلفزيون عرض إضافي بس.</p></details>
          <details><summary>مين يدفع؟</summary><p>اللي يفتح الغرفة بس. الباقين يدخلون مجاناً بدون حساب.</p></details>
          <details><summary>كم لاعب؟</summary><p>من ٣ لين ١٢، و«خط ثلاثة» يتقسمون فيها فريقين.</p></details>
          <details><summary>هذي النسخة الحقيقية؟</summary><p>هذا نموذج للتجربة: اللاعبين الثانين وهميين، والأسعار أمثلة.</p></details>
        </div>
      </section>
      <footer class="foot"><span>فسحة · اسم مبدئي</span><span>ألعاب جماعية من جوالاتكم</span></footer>
    </div>`;
    $("joinForm").onsubmit = (e) => { e.preventDefault(); const c = cleanCode($("joinCode").value); if (c.length === 4) { beep(700, 0.05); openJoin(c); } else $("joinCode").focus(); };
    $("meChip").onclick = $("heroMe").onclick = () => openProfile(() => { renderHub(); view("hub"); });
    document.querySelectorAll("[data-play]").forEach((b) => (b.onclick = () => { beep(700, 0.05); openGame(b.dataset.play); }));
    document.querySelectorAll("[data-info]").forEach((b) => (b.onclick = () => { const g = GAMES.find((x) => x.id === b.dataset.info); $("modalCard").innerHTML = `<h3>${g.name}</h3><ol>${g.rules.map((r) => `<li>${r}</li>`).join("")}</ol><button type="button" class="pbtn" id="mClose">فهمت</button>`; $("modal").hidden = false; $("mClose").onclick = () => ($("modal").hidden = true); }));
  }
  $("modal").addEventListener("click", (e) => { if (e.target === $("modal")) $("modal").hidden = true; });

  // ================= your character =================
  let tab = "c", afterProfile = null;
  function openProfile(done) { afterProfile = done; view("profile"); drawProfile(); }
  function drawProfile() {
    const list = tab === "c" ? NOTES.map((_, i) => ({ i, a: { ...me.av, c: i }, n: "" })) :
      tab === "e" ? EYES.map((x, i) => ({ i, a: { ...me.av, e: i, h: me.av.h === 4 ? 0 : me.av.h }, n: x.n })) :
      tab === "m" ? MOUTHS.map((x, i) => ({ i, a: { ...me.av, m: i }, n: x.n })) :
      HATS.map((x, i) => ({ i, a: { ...me.av, h: i }, n: x.n }));
    $("profile").innerHTML = `<div class="prof">
      <div class="hdr" style="padding-block:4px"><span class="logo" style="font-size:28px">${BELL}فسحة</span></div>
      <div class="pcard">
        <h2 style="font-size:30px">شخصيتك</h2>
        <p style="font-size:14px;color:#3c4a6b">وجه ترسمه بالقلم على ورقة لاصقة. يطلع جنب اسمك في كل ألعاب فسحة.</p>
        <div class="builder" style="margin-top:12px">
          <div>${avatar(me.av, 110)}</div>
          <div class="field"><label for="nm">اسمك</label><input id="nm" value="${esc(me.name)}" maxlength="12" placeholder="مثلاً: مصعب" autocomplete="off"></div>
        </div>
      </div>
      <div>
        <div class="ptabs" role="tablist">${[["c", "لون الورقة"], ["e", "العيون"], ["m", "الفم"], ["h", "على الراس"]].map(([k, n]) => `<button type="button" class="ptab" role="tab" data-tab="${k}" aria-selected="${tab === k}">${n}</button>`).join("")}</div>
        <div class="popts">${list.map((o) => `<button type="button" class="popt" data-set="${o.i}" aria-pressed="${me.av[tab] === o.i}" aria-label="${o.n || "لون " + (o.i + 1)}">${avatar(o.a, 52)}${o.n ? `<small>${o.n}</small>` : ""}</button>`).join("")}</div>
      </div>
      <button type="button" class="pbtn alt" id="shuffle">شخصية عشوائية</button>
      <button type="button" class="pbtn" id="saveMe">حفظ</button>
    </div>`;
    const nm = $("nm");
    nm.addEventListener("input", () => { me.name = nm.value.trim(); });
    $("profile").querySelectorAll(".ptab").forEach((b) => (b.onclick = () => { tab = b.dataset.tab; drawProfile(); }));
    $("profile").querySelectorAll(".popt").forEach((b) => (b.onclick = () => { me.av[tab] = +b.dataset.set; if (tab === "e" && me.av.h === 4) me.av.h = 0; beep(700, 0.04); drawProfile(); }));
    $("shuffle").onclick = () => { me.av = { c: Math.floor(rnd(0, NOTES.length)), e: Math.floor(rnd(0, EYES.length)), m: Math.floor(rnd(0, MOUTHS.length)), h: Math.floor(rnd(0, HATS.length)), r: -3 }; beep(600, 0.05); drawProfile(); };
    $("saveMe").onclick = () => { me.name = nm.value.trim() || "أنا"; saveProfile(); beep(880, 0.08); (afterProfile || (() => { renderHub(); view("hub"); }))(); };
  }

