"use strict";
  // ================= the yard =================
  const BELL = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 5c-7 0-11 5-11 12v7l-4 5h30l-4-5v-7C31 10 27 5 20 5z" fill="#1b2a4a"/><circle cx="20" cy="33" r="3.5" fill="#1b2a4a"/><path d="M12 12q2-4 6-5" stroke="#ffc933" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>';
  // the hero's eight: فسحة characters from js/people.js, faces only
  const CREW = [[0, 3, 1, 1, -4], [3, 1, 4, 0, 3], [2, 0, 3, 1, -2], [5, 7, 0, 3, 4], [8, 4, 2, 0, -5], [1, 5, 1, 1, 2], [6, 2, 4, 3, -3], [9, 6, 3, 1, 3]]
    .map(([k, c, e, m, r]) => ({ k, c, e, m, h: 0, r }));
  const ORG = "https://instagram.com/" + INSTA;
  let hubCat = "الكل";
  const roomOf = (g) => g.room || g.id;
  const isLive = (g) => !!ROOM_GAMES[roomOf(g)];
  function card(g) {
    const live = isLive(g), id = roomOf(g), name = live ? ROOM_GAMES[id].name : g.n;
    const badge = !live ? "قريبًا" : g.new ? "جديد" : "";
    return `<article class="hcard"><span class="hart">${g.ca}${badge ? `<b class="hbadge">${badge}</b>` : ""}</span><div class="hbody"><h3>${name}</h3><p>${g.l}</p>
      <div class="htags"><span>${g.ppl}</span><span>${g.t}</span><span>${g.cat}</span></div>
      <div class="hacts"><button type="button" class="hplay" ${live ? `data-play="${id}"` : "disabled"}>${live ? "افتح غرفة" : "قريبًا"}</button><button type="button" class="hinfo" data-info="${g.id}" aria-label="طريقة ${name}">؟</button></div>
      ${live && signedIn() && !canHost(id) ? `<button type="button" class="passnote" data-pass="${id}">خلصت جلستها المجانية · عندك كود؟</button>` : ""}
      ${live && id === "foldit" ? `<a class="solo" href="${FOLD_IT}">أو العبها على نفس الجوال، ولها لغز يومي</a>` : ""}</div></article>`;
  }
  function drawCards() {
    const box = $("hCards"); if (!box) return;
    box.innerHTML = CATALOG.filter((g) => hubCat === "الكل" || g.cat === hubCat).map(card).join("");
    box.querySelectorAll("[data-play]").forEach((b) => (b.onclick = () => { beep(700, 0.05); const id = b.dataset.play; hostGate(id, () => openGame(id)); }));
    box.querySelectorAll("[data-pass]").forEach((b) => (b.onclick = () => openPass(b.dataset.pass || null)));
    box.querySelectorAll("[data-info]").forEach((b) => (b.onclick = () => { const g = CATALOG.find((x) => x.id === b.dataset.info); isLive(g) ? openHow(roomOf(g)) : openSoon(g); }));
  }
  // a game that isn't in yet: what it is, and that it's on its way
  function openSoon(g) {
    $("modalCard").innerHTML = `<span class="hart" style="border:3px solid var(--navy);border-radius:18px;overflow:hidden">${g.ca}</span><h3>${g.n}</h3><p>${g.l}. ${g.ppl} · ${g.t}</p><p>قريبًا في فسحة، وأول ما تجهز تنفتح من هنا.</p><button type="button" class="pbtn" id="mClose">تمام</button>`;
    $("modal").hidden = false;
    $("mClose").onclick = () => ($("modal").hidden = true);
  }
  // iPhone and iPad Safari forget a site's storage after 7 days without a visit; a home-screen web app doesn't
  const TIP_KEY = "fos7a.tip.ios.v1";
  const iosSafari = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let tipNow = false;
  function wantTip() {
    if (tipNow) return true;
    if (!iosSafari() || navigator.standalone || window.Fos7aApp || !/Safari/.test(navigator.userAgent) || /CriOS|FxiOS|EdgiOS/.test(navigator.userAgent)) return false;
    try { if (localStorage.getItem(TIP_KEY)) return false; localStorage.setItem(TIP_KEY, "1"); } catch (e) { return false; }
    return (tipNow = true);
  }
  const SHARE = '<svg class="ico" viewBox="0 0 40 40" aria-hidden="true"><path d="M13 16h-3v19h20V16h-3" fill="none" stroke="#1b2a4a" stroke-width="3" stroke-linejoin="round"/><path d="M20 24V5M13 11l7-7 7 7" fill="none" stroke="#1b2a4a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 30h8" stroke="#ffc933" stroke-width="3" stroke-linecap="round"/></svg>';
  function renderHub() {
    const r = savedRoom();
    $("hub").innerHTML = `<div class="hub-in">
      <header class="hdr">
        <button type="button" class="logo" id="ringBell" aria-label="دق جرس الفسحة">${BELL}فسحة</button>
        <span class="hact"><button type="button" class="hjoin" id="hdrJoin">ادخل برمز</button><button type="button" class="hme" id="meChip" aria-label="حسابي">${avatar(me.av, 40)}</button></span>
      </header>
      ${wantTip() ? `<div class="htip" id="hTip">${SHARE}<p>أضف فسحة للشاشة الرئيسية: زر المشاركة ثم «إضافة إلى الشاشة الرئيسية». كذا يبقى دخولك محفوظ.</p><button type="button" id="hTipX">طيب</button></div>` : ""}
      <section class="hhero" id="top">
        <div class="hhero-t">
          <p class="hkick">ألعاب جماعية للجمعات والسهرات</p>
          <h1>فسحة</h1>
          <p class="hlead">المضيف يفتح غرفة، والكل يدخل من جواله برمز. بدون تحميل ولا تسجيل.</p>
          ${r ? `<div class="resume pop"><span>غرفتك <b dir="ltr">${esc(r.code)}</b> للحين مفتوحة</span><button type="button" class="hbtn" id="resumeBtn">رجّعها</button><button type="button" class="hbtn alt" id="dropRoom">قفلها</button></div>` : ""}
          <form class="hcode" id="joinForm"><input id="joinCode" maxlength="4" placeholder="ABCD" aria-label="رمز الغرفة" autocomplete="off" autocapitalize="characters"><button type="submit">ادخل</button></form>
          <div class="hlinks"><button type="button" class="joinlink" id="tvOpen">${ICON.screen}اعرضها على شاشة كبيرة</button>
            <button type="button" class="passline" data-pass="">${ICON.ticket}<span>${passActive() ? `تذكرتك فعالة لين ${passDay()}` : USER ? "عندك كود؟ فعّله هنا" : "عندك كود؟"}</span></button></div>
        </div>
        <div class="hcrew" aria-hidden="true">${CREW.map((a) => avatar(a, 116)).join("")}</div>
      </section>
      <div class="hchips" role="group" aria-label="التصنيفات">${CATALOG_CATS.map((c) => `<button type="button" class="hchip" data-cat="${c}" aria-pressed="${hubCat === c}">${c}</button>`).join("")}</div>
      <section class="hcards" id="hCards" aria-label="الألعاب"></section>
      <section class="horg"><div><b>للمدارس والجمعيات</b><p>مسابقة بأسئلتكم وشعاركم، على البروجكتر والكل من جواله.</p></div><a href="${ORG}" target="_blank" rel="noopener">تواصلوا معنا</a></section>
      <section class="hhow" aria-label="كيف تلعبون">${[["المضيف يفتح غرفة", "يختار لعبة ويطلع له رمز"], ["الكل يدخل من جواله", "بالرمز أو الباركود"], ["التلفاز يشرح ويعرض", "اختياري، بس يحلّيها"]].map(([t, d], k) => `<div class="hstep">${avatar(CREW[k + 1], 64)}<div><b>${t}</b><span>${d}</span></div></div>`).join("")}</section>
      <footer class="foot"><span>فسحة · <a href="privacy.html">الخصوصية</a> · <a href="${ORG}" target="_blank" rel="noopener">تواصل</a></span><span>ألعاب جماعية من جوالاتكم</span></footer>
    </div>`;
    drawCards();
    if ($("hTipX")) $("hTipX").onclick = () => { tipNow = false; $("hTip").remove(); };
    if ($("resumeBtn")) { $("resumeBtn").onclick = () => { beep(700, 0.05); resumeRoom(); }; $("dropRoom").onclick = () => { const r = savedRoom(); forgetRoom(); if (r) { const n = openRoom(r.code, () => {}, (st) => { if (st === "SUBSCRIBED") { n.send({ t: "state", s: { phase: "closed" } }); setTimeout(() => n.close(), 400); } }); } renderHub(); }; }
    $("tvOpen").onclick = () => { const c = cleanCode($("joinCode").value); if (c.length === 4) { beep(700, 0.05); openScreen(c); } else { $("joinCode").focus(); $("joinCode").placeholder = "الرمز أول"; } };
    $("joinForm").onsubmit = (e) => { e.preventDefault(); const c = cleanCode($("joinCode").value); if (c.length === 4) { beep(700, 0.05); openJoin(c); } else $("joinCode").focus(); };
    $("hdrJoin").onclick = () => { const i = $("joinCode"); i.scrollIntoView({ block: "center", behavior: "smooth" }); i.focus({ preventScroll: true }); };
    $("ringBell").onclick = () => { if (!soundOn) setSound(true); recess(); const b = $("hub"); b.classList.remove("ring"); void b.offsetWidth; b.classList.add("ring"); };
    $("meChip").onclick = () => openAccount();
    $("hub").querySelectorAll("[data-cat]").forEach((b) => (b.onclick = () => { hubCat = b.dataset.cat; $("hub").querySelectorAll("[data-cat]").forEach((x) => x.setAttribute("aria-pressed", x === b)); drawCards(); }));
    $("hub").querySelectorAll(".hlinks [data-pass]").forEach((b) => (b.onclick = () => openPass(null)));
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
      if (isRude(nm.value)) { nm.value = ""; nm.placeholder = "اختر اسم ثاني"; nm.focus(); beep(200, 0.2, "sawtooth", 0.06); buzz([40, 30, 40]); return; }
      me.name = nm.value.trim() || "أنا"; saveProfile(); beep(880, 0.08); (afterProfile || (() => { renderHub(); view("hub"); }))(); };
  }

