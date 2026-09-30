"use strict";
  // ================= خط ثلاثة: X-O on the chalkboard, one question per square =================
  const KCATS = ["ديرتنا", "أكل", "كورة", "جغرافيا", "الأغلبية", "عامية", "ألغاز", "تاريخ", "علوم"];
  const KLABEL = (c) => (c === "الأغلبية" ? "وش يقول الأغلبية؟" : c);
  // a: index of the right option; a = -1 means the room's majority decides
  const KQB = {
    "ديرتنا": [
      { q: "وين يقع قصر المصمك؟", o: ["جدة", "الرياض", "الدمام", "أبها"], a: 1 },
      { q: "وش المدينة اللي يسمونها «عروس البحر الأحمر»؟", o: ["ينبع", "جدة", "جازان", "الوجه"], a: 1 },
      { q: "وش اسم الموقع الأثري المشهور في العُلا؟", o: ["البتراء", "الحِجر", "تدمر", "جرش"], a: 1 },
    ],
    "أكل": [
      { q: "وش الأكلة اللي أساسها قمح مجروش؟", o: ["الكبسة", "الجريش", "المندي", "المطبق"], a: 1 },
      { q: "كرات عجين مقلية تنسقى بالدبس أو الشيرة، وش اسمها؟", o: ["لقيمات", "بسبوسة", "كنافة", "معمول"], a: 0 },
      { q: "المندي ينطبخ تقليدياً في؟", o: ["قدر ضغط", "حفرة في الأرض", "فرن كهربائي", "مقلاة"], a: 1 },
    ],
    "كورة": [
      { q: "كم لاعب لكل فريق داخل الملعب؟", o: ["٩", "١٠", "١١", "١٢"], a: 2 },
      { q: "كأس العالم ٢٠٢٢ أقيم في؟", o: ["الإمارات", "قطر", "السعودية", "مصر"], a: 1 },
      { q: "السعودية بتستضيف كأس العالم سنة؟", o: ["٢٠٣٠", "٢٠٣٤", "٢٠٢٦", "٢٠٣٨"], a: 1 },
    ],
    "جغرافيا": [
      { q: "وش عاصمة عُمان؟", o: ["صلالة", "صحار", "مسقط", "نزوى"], a: 2 },
      { q: "كم عدد دول مجلس التعاون الخليجي؟", o: ["٤", "٥", "٦", "٧"], a: 2 },
      { q: "وش البحر اللي بين السعودية ومصر؟", o: ["البحر الأحمر", "البحر المتوسط", "بحر العرب", "البحر الأسود"], a: 0 },
    ],
    "الأغلبية": [
      { q: "أحسن كبسة؟", o: ["لحم", "دجاج", "سمك", "ولا وحدة"], a: -1, w: [4, 4, 1, 1] },
      { q: "الشاي ولا القهوة العربية؟", o: ["الشاي", "القهوة", "الاثنين", "ولا واحد"], a: -1, w: [3, 3, 3, 1] },
      { q: "الكشتة أحسن في؟", o: ["البر", "البحر", "الاستراحة", "البيت"], a: -1, w: [4, 2, 3, 1] },
      { q: "أحسن وقت للطلعة؟", o: ["العصر", "المغرب", "بعد العشا", "الفجر"], a: -1, w: [1, 2, 4, 1] },
    ],
    "عامية": [
      { q: "وش معنى «أبشر»؟", o: ["من عيوني", "انتبه", "مع السلامة", "تعال"], a: 0 },
      { q: "«وش السالفة؟» يعني؟", o: ["وش القصة؟", "كم الساعة؟", "وين رايح؟", "كم السعر؟"], a: 0 },
      { q: "إذا أحد قال لك «يعطيك العافية»، وش ترد؟", o: ["صباح النور", "الله يعافيك", "تم", "مع السلامة"], a: 1 },
    ],
    "ألغاز": [
      { q: "شي كل ما زاد نقص؟", o: ["العمر", "الفلوس", "الأكل", "الماء"], a: 0 },
      { q: "شي له أسنان وما يعض؟", o: ["الأسد", "المشط", "القط", "التمساح"], a: 1 },
      { q: "شي يمشي بلا رجلين؟", o: ["الكرسي", "الساعة", "الباب", "الطاولة"], a: 1 },
    ],
    "تاريخ": [
      { q: "توحيد المملكة العربية السعودية أُعلن سنة؟", o: ["١٩٠٢", "١٩٣٢", "١٩٤٥", "١٩٦٠"], a: 1 },
      { q: "اليوم الوطني السعودي يوافق؟", o: ["٢٢ فبراير", "٢٣ سبتمبر", "٢ ديسمبر", "١٨ ديسمبر"], a: 1 },
      { q: "يوم التأسيس السعودي يوافق؟", o: ["٢٢ فبراير", "٢٣ سبتمبر", "١ محرم", "٩ أغسطس"], a: 0 },
    ],
    "علوم": [
      { q: "وش الكوكب اللي يسمونه الكوكب الأحمر؟", o: ["الزهرة", "المريخ", "المشتري", "زحل"], a: 1 },
      { q: "الماء يغلي عند مستوى سطح البحر على كم درجة مئوية؟", o: ["٨٠", "٩٠", "١٠٠", "١٢٠"], a: 2 },
      { q: "أكبر عضو في جسم الإنسان؟", o: ["الكبد", "الجلد", "القلب", "الرئة"], a: 1 },
    ],
  };
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const KS = { timers: [] };
  function kClear() { KS.timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); KS.timers = []; }
  const kLater = (fn, ms) => KS.timers.push(setTimeout(fn, ms));
  const kEvery = (fn, ms) => KS.timers.push(setInterval(fn, ms));
  const TEAM = () => ({ b: [me, BOTS[1], BOTS[2]], r: [BOTS[0], BOTS[3]] });
  const TN = { b: "الأزرق", r: "الأحمر" };
  const KP = (id) => [me, ...BOTS].find((p) => p.id === id);
  const kStat = (id) => (KS.st[id] ||= { told: 0, right: 0 });

  function kLobby() {
    kClear(); setTop("الغرفة");
    const all = TEAM(); let joined = 1;
    const shown = () => [me, BOTS[1], BOTS[0], BOTS[2], BOTS[3]].slice(0, joined).map((p) => p.id);
    const draw = () => {
      const ids = shown();
      const col = (k) => `<div class="k-team ${k}"><h3>الفريق ${TN[k]}</h3>${all[k].filter((p) => ids.includes(p.id)).map((p) => `<div class="k-p pop">${avatar(p.av, 34)}${esc(p.name)}${p === me ? " (أنت)" : ""}</div>`).join("") || '<span class="k-dim">…</span>'}</div>`;
      show(`
        <div class="k-card"><h2 class="k-h">وينكم!</h2><p class="k-dim">هذي تجربة مع لاعبين وهميين عشان تحس باللعبة. نسخة الربع الحقيقية جاية بعد «خلّصت!».</p></div>
        <div class="k-teams">${col("b")}${col("r")}</div>
        <p class="k-dim">السؤال والتصويت والنتيجة تطلع في جوال كل واحد. والتلفزيون، لو عندكم، يعرض السبورة للكل.</p>
        <button type="button" class="k-btn" id="kStart" ${joined < 5 ? "disabled" : ""}>${joined < 5 ? "ينتظر اللاعبين…" : "ابدأ"}</button>`);
      const s = $("kStart"); if (s) s.onclick = () => kNew();
    };
    draw();
    for (let i = 1; i < 5; i++) kLater(() => { joined = i + 1; beep(520 + i * 70, 0.06); draw(); }, 600 * i);
  }
  function kNew() {
    Object.assign(KS, { board: Array(9).fill(null), team: "b", used: new Set(), st: {}, turns: 0, win: null, sqCat: KCATS.slice() });
    beep(990, 0.15, "triangle", 0.15); kBoard();
  }
  const kCount = (t) => KS.board.filter((x) => x === t).length;
  function kWinner() { for (const l of LINES) { const [a, b, c] = l; if (KS.board[a] && KS.board[a] === KS.board[b] && KS.board[a] === KS.board[c]) return { t: KS.board[a], line: l }; } return null; }
  function kBoardHTML(hot = -1) {
    const w = KS.win ? KS.win.line : [];
    return `<div class="k-frame"><div class="k-board">${KS.board.map((m, i) => m
      ? `<div class="k-sq ${m} ${w.includes(i) ? "win" : ""}"><span class="m">${m === "b" ? "X" : "O"}</span></div>`
      : `<button type="button" class="k-sq open ${i === hot ? "hot" : ""}" data-sq="${i}">${KLABEL(KS.sqCat[i])}</button>`).join("")}</div></div>`;
  }
  function kBoard() {
    kClear(); setTop(`الدور ${AR(KS.turns + 1)}`);
    const mine = KS.team === "b";
    show(`
      <div class="k-score"><span class="b">الأزرق ${AR(kCount("b"))}</span><span class="k-dim" style="font-family:var(--f-body)">أول خط ثلاثة يفوز</span><span class="r">${AR(kCount("r"))} الأحمر</span></div>
      <div class="k-turn ${KS.team}">${mine ? "دوركم! اختاروا مربع" : "الفريق الأحمر يختار مربع…"}</div>
      ${kBoardHTML()}
      <p class="k-dim">${mine ? "في اللعبة الحقيقية أي واحد من الفريق يقترح المربع، والقائد يتبدّل كل دور." : "انتظر، وبعدها السؤال يطلع عندك."}</p>`);
    if (mine) screen.querySelectorAll("[data-sq]").forEach((b) => (b.onclick = () => { beep(700, 0.05); kAsk(+b.dataset.sq, "b", false); }));
    else kLater(() => {
      const open = KS.board.map((m, i) => (m ? -1 : i)).filter((i) => i >= 0);
      const wins = (t) => open.find((i) => LINES.some((l) => l.includes(i) && l.filter((x) => x !== i).every((x) => KS.board[x] === t)));
      let pick = wins("r"); if (pick === undefined) pick = wins("b"); if (pick === undefined) pick = open.includes(4) && Math.random() < 0.6 ? 4 : pickOne(open);
      screen.querySelector(".k-frame").outerHTML = kBoardHTML(pick);
      beep(600, 0.06);
      kLater(() => kAsk(pick, "r", false), 1100);
    }, 1400);
  }
  function kQuestion(i) {
    const cat = KS.sqCat[i], bank = KQB[cat];
    let q = bank.find((x) => !KS.used.has(x.q)) || pickOne(bank);
    KS.used.add(q.q); return { ...q, cat };
  }
  function kAsk(i, team, steal, q0, excluded) {
    kClear();
    const q = q0 || kQuestion(i), majority = q.a < 0;
    const teams = TEAM(), voters = majority ? [...teams.b, ...teams.r] : teams[team];
    const meVotes = voters.includes(me), T = majority ? 12 : steal ? 10 : 15, t0 = performance.now();
    const votes = {}; // player id -> option index
    setTop(steal ? "فرصة سرقة" : `الدور ${AR(KS.turns + 1)}`);
    const draw = () => {
      const counts = q.o.map((_, k) => Object.values(votes).filter((v) => v === k).length), total = Math.max(1, Object.keys(votes).length);
      const showBars = majority || team === "b";
      show(`
        <div class="k-turn ${team}">${steal ? `فرصة سرقة للفريق ${TN[team]}` : `دور الفريق ${TN[team]}`}${majority ? " · الكل يصوّت" : ""}</div>
        <div class="k-card" style="display:grid;gap:10px">
          <span class="k-cat">${KLABEL(q.cat)}</span>
          <div class="k-q">${esc(q.q)}</div>
          <div class="k-timer"><i id="kbar"></i></div>
          ${q.o.map((o, k) => `<button type="button" class="k-opt ${k === excluded ? "wrong" : ""}" data-o="${k}" aria-pressed="${votes.me === k}" ${!meVotes || k === excluded ? "disabled" : ""}><i style="width:${showBars ? Math.round((counts[k] / total) * 100) : 0}%"></i><span><b>${esc(o)}</b><small>${showBars && counts[k] ? AR(counts[k]) : ""}</small></span></button>`).join("")}
          ${majority ? '<p class="k-dim">ما فيه جواب صح: الصح هو اللي يختاره أكثر الحاضرين، وفريقكم لازم يتوقّعه.</p>' : ""}
        </div>
        <div class="row" style="justify-content:space-between;gap:8px"><span class="k-dim">${meVotes ? (votes.me === undefined ? "اختر جوابك" : "تقدر تغيّر لين يخلص الوقت") : `الفريق ${TN[team]} يصوّت…`}</span>
        <span class="k-faces">${voters.map((p) => `<span style="opacity:${votes[p.id] === undefined ? 0.35 : 1}">${avatar(p.av, 28)}</span>`).join("")}</span></div>`);
      screen.querySelectorAll(".k-opt:not([disabled])").forEach((b) => (b.onclick = () => { votes.me = +b.dataset.o; beep(660, 0.05); draw(); check(); }));
    };
    const check = () => { if (voters.every((p) => votes[p.id] !== undefined)) kLater(finish, 700); };
    let done = false;
    const finish = () => { if (done) return; done = true; kClear(); kReveal(i, team, steal, q, votes, excluded); };
    draw();
    voters.filter((p) => p.bot).forEach((p) => kLater(() => {
      if (majority) { const w = q.w.map((x, k) => (k === excluded ? 0 : x * rnd(0.6, 1.4))); let r = Math.random() * w.reduce((a, b) => a + b, 0); votes[p.id] = w.findIndex((x) => (r -= x) < 0); }
      else { const ok = Math.random() < p.skill * 0.85; const wrongs = q.o.map((_, k) => k).filter((k) => k !== q.a && k !== excluded); votes[p.id] = ok ? q.a : pickOne(wrongs); }
      beep(420, 0.03, "square", 0.03); draw(); check();
    }, rnd(1500, T * 650)));
    kEvery(() => { const left = Math.max(0, T - (performance.now() - t0) / 1000); const b = $("kbar"); if (b) b.style.transform = `scaleX(${left / T})`; if (left <= 0) finish(); }, 200);
  }
  function argmax(arr) { const m = Math.max(...arr); const idx = arr.map((v, k) => (v === m ? k : -1)).filter((k) => k >= 0); return pickOne(idx); }
  function kReveal(i, team, steal, q, votes, excluded) {
    const teams = TEAM(), majority = q.a < 0, other = team === "b" ? "r" : "b";
    const tally = (ids) => q.o.map((_, k) => ids.filter((id) => votes[id] === k).length);
    const teamIds = teams[team].map((p) => p.id).filter((id) => votes[id] !== undefined);
    const teamCounts = tally(teamIds);
    const teamAns = teamIds.length ? argmax(teamCounts) : -1;
    const allIds = Object.keys(votes);
    const right = majority ? argmax(tally(allIds)) : q.a;
    const ok = teamAns === right;
    if (!majority) teamIds.forEach((id) => { if (votes[id] === right) kStat(id).right++; });
    const told = !ok && !majority ? teamIds.filter((id) => votes[id] === right) : [];
    told.forEach((id) => kStat(id).told++);
    if (ok) KS.board[i] = team;
    let stealNext = !ok && !steal && !majority;
    let note = "";
    if (majority && !ok) { // no steal round: the other team's guess is already in
      const oIds = teams[other].map((p) => p.id).filter((id) => votes[id] !== undefined);
      if (oIds.length && argmax(tally(oIds)) === right && !steal) { KS.board[i] = other; note = `بس الفريق ${TN[other]} توقّع صح، والمربع راح لهم!`; }
    }
    const counts = majority ? tally(allIds) : teamCounts, total = Math.max(1, majority ? allIds.length : teamIds.length);
    if (ok) { beep(784, 0.1); setTimeout(() => beep(1047, 0.18), 110); buzz(60); } else { beep(200, 0.3, "sawtooth", 0.08); buzz([40, 30, 40]); }
    KS.win = kWinner();
    show(`
      <div class="k-turn ${team}">${ok ? `صح! المربع للفريق ${TN[team]}` : majority ? `الفريق ${TN[team]} ما توقّع الأغلبية` : `غلط! ${steal ? "والسرقة ما نجحت" : `فرصة سرقة للفريق ${TN[other]}`}`}</div>
      <div class="k-card" style="display:grid;gap:10px">
        <span class="k-cat">${KLABEL(q.cat)}</span>
        <div class="k-q">${esc(q.q)}</div>
        ${q.o.map((o, k) => `<div class="k-opt ${k === right ? "right" : k === teamAns || k === excluded ? "wrong" : ""}"><i style="width:${Math.round((counts[k] / total) * 100)}%"></i><span><b>${esc(o)}</b><small>${counts[k] ? AR(counts[k]) : ""}</small></span></div>`).join("")}
        <p class="k-dim">${majority ? `اختيار أغلب الحاضرين: «${esc(q.o[right])}».` : `جواب الفريق: «${teamAns >= 0 ? esc(q.o[teamAns]) : "ما جاوبوا"}».`} ${note}</p>
      </div>
      ${told.length ? `<div class="k-told pop">${told.map((id) => avatar(KP(id).av, 30)).join("")}<span>«قلت لكم!» ${told.map((id) => esc(KP(id).name)).join(" و")} صوّت صح +١</span></div>` : ""}
      <button type="button" class="k-btn" id="kNext">${stealNext ? `فرصة الفريق ${TN[other]}` : KS.win || !KS.board.includes(null) ? "النتيجة" : "كمّل"}</button>`);
    $("kNext").onclick = () => {
      if (stealNext) return kAsk(i, other, true, q, teamAns);
      KS.turns++;
      if (KS.win || !KS.board.includes(null) || KS.turns >= 16) return kEnd();
      KS.team = steal ? team : other; // after a steal the turn goes to the team that stole
      kBoard();
    };
  }
  function kEnd() {
    kClear(); setTop("انتهت");
    const b = kCount("b"), r = kCount("r");
    const w = KS.win ? KS.win.t : b > r ? "b" : r > b ? "r" : null;
    const everyone = [me, ...BOTS];
    const top = (key) => everyone.slice().sort((x, y) => kStat(y.id)[key] - kStat(x.id)[key])[0];
    const told = top("told"), right = top("right");
    if (w === "b") { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); } else beep(262, 0.4, "triangle", 0.12);
    show(`
      ${kBoardHTML()}
      <div class="k-card k-honor pop">
        <p class="k-dim">لوحة الشرف</p>
        <div class="big" style="color:${w === "b" ? "var(--tb)" : w === "r" ? "var(--tr)" : "var(--chalk-y)"}">${w ? `فاز الفريق ${TN[w]}!` : "تعادل!"}</div>
        <div class="k-faces">${(w ? TEAM()[w] : everyone).map((p) => avatar(p.av, 46)).join("")}</div>
        <div class="k-row">${avatar(right.av, 30)}<span>${esc(right.name)}</span><b>أكثر واحد جاوب صح (${AR(kStat(right.id).right)})</b></div>
        ${kStat(told.id).told ? `<div class="k-row">${avatar(told.av, 30)}<span>${esc(told.name)}</span><b>ملك «قلت لكم!» (${AR(kStat(told.id).told)})</b></div>` : ""}
        <div class="k-row">${avatar(me.av, 30)}<span>أنت</span><b>${AR(kStat("me").right)} صح · ${AR(kStat("me").told)} «قلت لكم!»</b></div>
      </div>
      <button type="button" class="k-btn" id="kAgain">جولة ثانية</button>
      <button type="button" class="k-btn ghost" id="kHome">رجوع لفسحة</button>`);
    $("kAgain").onclick = () => kNew();
    $("kHome").onclick = () => { renderHub(); view("hub"); };
  }

  renderHub(); view("hub");
