"use strict";
// ================= مين الغشاش؟: an exam with a cheater sitting in every class =================
// The players split into classes. Each class answers together (the majority's answer counts), but one
// of them (two in a big class) holds the cheat sheet: they see the right answer, and they win when the
// class gets it wrong. After every question the class sees who marked what; after every third, it
// inspects and votes on a suspect. Some honest students get a hint now and then, so knowing an answer
// proves nothing. Who cheats never goes into the shared snapshot: the host tells each phone privately.

const GH_MAX = 30;
const GH_CLS = [{ n: "أ", c: "#1d3fb8" }, { n: "ب", c: "#c8232c" }, { n: "ج", c: "#1f8a53" }, { n: "د", c: "#6b3fb8" }, { n: "هـ", c: "#d9730d" }];
const GH_LET = ["أ", "ب", "ج", "د", "هـ"];
const GH_EVERY = 3; // an inspection after every third question
const GH_PTS = { right: 10, catch: 30, framed: -10 }; // the class's points
const GH_CP = { wrong: 15, framed: 20, free: 50 }; // the cheater's own, revealed at the end
// one class for a small group; otherwise classes of four to six
const ghOk = (n) => [1, 2, 3, 4, 5].filter((k) => (k === 1 ? n <= 10 : Math.floor(n / k) >= 4));
const ghAuto = (n) => (n < 8 ? 1 : Math.min(5, Math.max(2, Math.round(n / 5)), Math.floor(n / 4)));
const ghCount = (S, n) => (S.nc !== "auto" && ghOk(n).includes(S.nc) ? S.nc : ghAuto(n));
const ghCheats = (size) => (size >= 7 ? 2 : 1);
const ghMine = () => (KL.my.gh && KL.S && KL.my.gh.sid === KL.S.sid ? KL.my.gh : null);
const ghName = (S, c) => (S.cls.length > 1 ? `فصل ${GH_CLS[c].n}` : "الفصل");

ROOM_GAMES.ghash = {
  name: "مين الغشاش؟", theme: "ghash", min: 4, need: "يحتاج ٤ لاعبين على الأقل", who: "٤ إلى ٣٠ · أسئلة وشك",
  rules: [
    "تتقسمون فصول، وفي كل فصل غشاش بالسر معه ورقة الغش: يشوف الجواب الصح.",
    "كل سؤال يصوت عليه الفصل، وجواب الأغلبية هو جواب الفصل. تناقشوا بصوت عالي!",
    "الغشاش يكسب إذا غلط فصله، فيحاول يقنعكم بالجواب الغلط بدون ما ينكشف.",
    "بعد كل سؤال تشوفون مين صوت على وش. هذا دليلكم.",
    "بعض الأبرياء تجيهم «تلميحة» تشيل خيارين غلط، فمو كل واحد يعرف الجواب غشاش.",
    "كل ٣ أسئلة تفتيش: تصوتون على المشتبه فيه. مسكتوه؟ تنشق ورقته ويكمل معكم عادي. اتهمتوا بريء؟ الغشاش يكسب.",
  ],
  setup(S) { Object.assign(S, { nc: "auto", qn: 12, qtime: 20, picks: ["السعودية", "الخليج والعرب", "جغرافيا", "أكل", "كورة", "ألغاز", "عامة", "حيوانات"] }); },
  snap(S) { S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0; },
  key: (S) => `${S.sid || ""}:${S.phase}:${S.qi || 0}`,
  on(m) {
    const S = H.S, G = H.gh;
    if (!G || !m.id) return;
    if (m.t === "ghwho") return ghTellOne(m.id);
    const c = G.of[m.id];
    if (c === undefined) return; // joined after the start: watching only
    if (m.t === "ghvote" && S.phase === "q" && Number.isInteger(m.k) && m.k >= 0 && m.k < S.q.o.length) {
      const was = G.votes[m.id];
      if (was && was.k === m.k) return;
      G.votes[m.id] = { k: m.k, at: now() - G.qStart };
      S.voted = S.cls.map((_, k) => ghIn(k).filter((id) => G.votes[id]).length);
      // everyone marked: a few more seconds to change their minds, then the papers go in
      if (ghPlaying().every((id) => G.votes[id])) H.deadline = Math.min(H.deadline, now() + 5000);
      return hostSendSoon();
    }
    if (m.t === "ghsus" && S.phase === "insp" && !S.cls[c].clean) {
      const x = String(m.x || "");
      if (x === m.id || G.of[x] !== c || S.cls[c].caught.includes(x)) return;
      G.sus[m.id] = x;
      S.voted = S.cls.map((_, k) => ghIn(k).filter((id) => G.sus[id]).length);
      if (S.cls.every((cl, k) => cl.clean || ghIn(k).every((id) => G.sus[id]))) H.deadline = Math.min(H.deadline, now() + 1500);
      return hostSendSoon();
    }
  },
  direct(m) {
    if (m.t !== "ghyou") return;
    KL.my.gh = m; KL.my.ghDirty = true;
    const v = KL.S && KL.S.game === "ghash" && ROOM_GAMES.ghash.views[KL.S.phase];
    if (v) v(KL.S, false);
  },
  lobby(S) {
    const n = S.players.length, ok = ghOk(n), auto = ghAuto(n);
    const h = (t) => `<p class="muted" style="font-weight:700;color:var(--soft)">${t}</p>`;
    const chips = (attr, list, cur, lab) => `<div class="chips pick">${list.map((v) => `<button type="button" class="chip" data-${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${lab(v)}</button>`).join("")}</div>`;
    const lab = (k) => (k === 1 ? "فصل واحد" : `${AR(k)} فصول`);
    const nc = ghCount(S, n), size = Math.ceil(n / nc);
    return `${h("كم فصل؟")}<div class="chips pick"><button type="button" class="chip" data-gnc="auto" aria-pressed="${S.nc === "auto" || !ok.includes(S.nc)}">تلقائي (${lab(auto)})</button>${ok.map((k) => `<button type="button" class="chip" data-gnc="${k}" aria-pressed="${S.nc === k}">${lab(k)}</button>`).join("")}</div>
      <p class="muted">${n < 4 ? "تحتاجون ٤ لاعبين على الأقل." : `${lab(nc)}، في كل فصل ${AR(Math.floor(n / nc))}${n % nc ? ` إلى ${AR(size)}` : ""} طلاب و${size >= 7 ? "غشاشين يعرفون بعض" : "غشاش واحد"}. الفصول تتوزع عشوائي.`}</p>
      ${h("كم سؤال؟")}${chips("gqn", [9, 12, 15], S.qn, (v) => `${AR(v)} · ${AR(v / GH_EVERY)} تفتيش`)}
      ${h("وقت النقاش لكل سؤال")}${chips("gqt", [15, 20, 30], S.qtime, (v) => `${AR(v)} ثانية`)}
      ${h("فئات الأسئلة")}<div class="chips pick">${QCATS.filter((c) => c !== "الأغلبية").map((c) => `<button type="button" class="chip" data-gcat="${c}" aria-pressed="${S.picks.includes(c)}">${c}</button>`).join("")}</div>`;
  },
  bindLobby(S) {
    const set = (attr, key, num) => screen.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { const v = b.dataset[attr]; H.S[key] = num && v !== "auto" ? +v : v; beep(700, 0.04); hostSend(); }));
    set("gnc", "nc", true); set("gqn", "qn", true); set("gqt", "qtime", true);
    screen.querySelectorAll("[data-gcat]").forEach((b) => (b.onclick = () => { const c = b.dataset.gcat, p = H.S.picks; H.S.picks = p.includes(c) ? p.filter((x) => x !== c) : [...p, c]; beep(660, 0.04); hostSend(); }));
    const st = $("start");
    if (S.players.length > GH_MAX) { st.disabled = true; st.textContent = `مين الغشاش؟ لين ${AR(GH_MAX)} لاعب`; }
    else if (!S.picks.length) { st.disabled = true; st.textContent = "اختر فئة وحدة على الأقل"; }
  },
  start: () => ghStart(),
  resume(S) {
    if (!(H.usedQ instanceof Set)) H.usedQ = new Set();
    const tick = { role: ghAsk, q: ghAfterQ, insp: ghAfterInsp }[S.phase];
    if (tick) hEvery(() => { if (now() >= H.deadline) tick(); }, 250);
    else if (S.phase === "res" || S.phase === "rev") hLater(ghNext, 3000);
    H.players.forEach((p) => ghTellOne(p.id));
  },
  views: { role: ghvRole, q: ghvQ, res: ghvRes, insp: ghvInsp, rev: ghvRev, end: ghvEnd },
};

// ---------------- the host ----------------
const ghIn = (c) => H.players.map((p) => p.id).filter((id) => H.gh.of[id] === c);
const ghPlaying = () => H.players.map((p) => p.id).filter((id) => H.gh.of[id] !== undefined);
const ghFree = (c) => H.gh.cheat[c].filter((id) => !H.S.cls[c].caught.includes(id)); // cheaters not caught yet
function ghTell(id, m) { m.to = id; if (id === PID) ROOM_GAMES.ghash.direct(m); else if (KL.net) KL.net.send(m); }
function ghTellOne(id) {
  const S = H.S, G = H.gh; if (!G) return;
  const c = G.of[id];
  if (c === undefined) return ghTell(id, { t: "ghyou", sid: S.sid, cls: -1 });
  const cheat = G.cheat[c].includes(id), caught = S.cls[c].caught.includes(id), q = S.phase === "q" ? S.qi : 0;
  ghTell(id, { t: "ghyou", sid: S.sid, cls: c, cheat, caught, mates: cheat ? G.cheat[c].filter((x) => x !== id) : [],
    sheet: cheat && !caught && q ? { qi: q, a: G.right } : null, hint: q && G.hint[id] ? { qi: q, x: G.hint[id] } : null });
}

function ghStart() {
  hClear();
  const S = H.S, ids = shuffled(H.players.map((p) => p.id)), n = ids.length, nc = ghCount(S, n);
  const of = {}, cheat = [], cls = [];
  for (let c = 0; c < nc; c++) {
    const members = ids.filter((_, k) => k % nc === c);
    members.forEach((id) => (of[id] = c));
    cheat.push(shuffled(members).slice(0, ghCheats(members.length)));
    cls.push({ members, n: cheat[c].length, pts: 0, caught: [], framed: [], clean: false });
  }
  H.gh = { of, cheat, votes: {}, sus: {}, hint: {}, right: -1, qStart: 0, cp: {}, detect: {}, framedN: {}, caughtAt: {} };
  H.usedQ instanceof Set || (H.usedQ = new Set());
  Object.assign(S, { sid: Math.random().toString(36).slice(2, 8), phase: "role", qi: 0, cls, q: null, res: null, rev: null, voted: cls.map(() => 0), end: null });
  H.deadline = now() + 14000;
  hostSend();
  H.players.forEach((p) => ghTellOne(p.id));
  hEvery(() => { if (now() >= H.deadline) ghAsk(); }, 250);
}
function ghAsk() {
  hClear();
  const S = H.S, G = H.gh;
  if (S.phase === "end") return;
  S.qi++;
  const d = drawQuestion(pickOne(S.picks.length ? S.picks : ["عامة"]), H.usedQ);
  S.q = { q: d.q, o: d.o, cat: d.cat }; G.right = d.a;
  // about half the classes: one honest student gets two wrong answers crossed out
  G.hint = {};
  const wrong = d.o.map((_, k) => k).filter((k) => k !== d.a);
  S.cls.forEach((cl, c) => {
    const honest = cl.members.filter((id) => !G.cheat[c].includes(id) || cl.caught.includes(id));
    if (honest.length && Math.random() < 0.55) G.hint[pickOne(honest)] = shuffled(wrong).slice(0, Math.min(2, wrong.length - 1) || 1).sort();
  });
  G.votes = {}; G.qStart = now();
  S.voted = S.cls.map(() => 0); S.res = null; S.rev = null; S.phase = "q";
  H.deadline = now() + S.qtime * 1000;
  hostSend();
  H.players.forEach((p) => ghTellOne(p.id));
  hEvery(() => { if (now() >= H.deadline) ghAfterQ(); }, 200);
}
// the class's answer is the one most of it marked; a tie goes to whichever was marked first
function ghPick(c) {
  const G = H.gh, vs = ghIn(c).map((id) => G.votes[id]).filter(Boolean);
  if (!vs.length) return -1;
  const n = {}, first = {};
  vs.forEach((v) => { n[v.k] = (n[v.k] || 0) + 1; first[v.k] = Math.min(first[v.k] ?? 1e12, v.at); });
  return +Object.keys(n).sort((a, b) => n[b] - n[a] || first[a] - first[b])[0];
}
function ghAfterQ() {
  hClear();
  const S = H.S, G = H.gh;
  if (S.phase !== "q") return;
  const add = (id, x) => (G.cp[id] = (G.cp[id] || 0) + x);
  const per = S.cls.map((cl, c) => {
    const pick = ghPick(c), ok = pick === G.right;
    if (ok) cl.pts += GH_PTS.right; else ghFree(c).forEach((id) => add(id, GH_CP.wrong));
    const votes = {}; cl.members.forEach((id) => { if (G.votes[id]) votes[id] = G.votes[id].k; });
    return { pick, ok, votes };
  });
  S.res = { right: G.right, cls: per };
  S.phase = "res"; H.deadline = now() + 8000;
  hostSend();
  H.players.forEach((p) => ghTellOne(p.id)); // the cheat sheet goes blank again
  hLater(ghNext, 8000);
}
function ghNext() {
  hClear();
  const S = H.S;
  if (S.phase !== "res" && S.phase !== "rev") return;
  if (S.phase === "res" && S.qi % GH_EVERY === 0 && S.cls.some((cl, c) => ghFree(c).length)) return ghInsp();
  // one class that caught its cheater has nothing left to play for
  if (S.qi >= S.qn || (S.cls.length === 1 && !ghFree(0).length)) return ghEnd();
  ghAsk();
}
function ghInsp() {
  const S = H.S, G = H.gh;
  G.sus = {};
  S.cls.forEach((cl, c) => (cl.clean = !ghFree(c).length));
  S.voted = S.cls.map(() => 0); S.phase = "insp";
  H.deadline = now() + 35000;
  hostSend();
  hEvery(() => { if (now() >= H.deadline) ghAfterInsp(); }, 250);
}
function ghAfterInsp() {
  hClear();
  const S = H.S, G = H.gh;
  if (S.phase !== "insp") return;
  const add = (o, id, x) => (o[id] = (o[id] || 0) + x);
  S.rev = S.cls.map((cl, c) => {
    if (cl.clean) return { clean: true };
    const sus = {}; ghIn(c).forEach((id) => { if (G.sus[id]) sus[id] = G.sus[id]; });
    const n = {}; Object.values(sus).forEach((x) => (n[x] = (n[x] || 0) + 1));
    const top = Object.entries(n).sort((a, b) => b[1] - a[1]);
    // no accusation without at least two votes and a clear leader
    if (!top.length || top[0][1] < 2 || (top[1] && top[1][1] === top[0][1])) return { acc: null, sus, tie: top.length > 0 };
    const acc = top[0][0], ok = ghFree(c).includes(acc);
    if (ok) {
      cl.caught.push(acc); cl.pts += GH_PTS.catch; G.caughtAt[acc] = S.qi;
      Object.entries(sus).forEach(([id, x]) => { if (x === acc && id !== acc) add(G.detect, id, 1); });
    } else {
      cl.framed.push(acc); cl.pts += GH_PTS.framed; add(G.framedN, acc, 1);
      ghFree(c).forEach((id) => add(G.cp, id, GH_CP.framed));
    }
    return { acc, ok, sus, n: top[0][1] };
  });
  S.phase = "rev"; H.deadline = 0;
  hostSend();
  H.players.forEach((p) => ghTellOne(p.id));
  hLater(ghNext, S.rev.some((r) => r.acc) ? 7000 : 5000);
}
function ghEnd() {
  hClear();
  const S = H.S, G = H.gh;
  S.cls.forEach((cl, c) => ghFree(c).forEach((id) => (G.cp[id] = (G.cp[id] || 0) + GH_CP.free)));
  const top = (o) => { const e = Object.entries(o).sort((x, y) => y[1] - x[1])[0]; return e && e[1] > 0 ? { id: e[0], n: e[1] } : null; };
  const cheats = S.cls.map((cl, c) => G.cheat[c].map((id) => ({ id, caught: cl.caught.includes(id), at: G.caughtAt[id] || 0, pts: G.cp[id] || 0 })));
  S.end = {
    cheats, rank: S.cls.map((_, c) => c).sort((a, b) => S.cls[b].pts - S.cls[a].pts),
    right: S.cls.map((cl) => Math.round((cl.pts - cl.caught.length * GH_PTS.catch - cl.framed.length * GH_PTS.framed) / GH_PTS.right)),
    awards: { cheat: top(G.cp), detect: top(G.detect), framed: top(G.framedN) },
  };
  S.phase = "end"; H.deadline = 0;
  hostSend();
}

// ---------------- every phone ----------------
const ghFaces = (ids, s = 26) => ids.map((id) => face(who(id), s)).join("");
const ghChip = (S, c, extra = "") => `<span class="gh-chip ${extra}" style="--pen:${GH_CLS[c].c}">${ghName(S, c)}</span>`;
function ghAsk4Me() { if (!ghMine() && now() - (KL.my.ghAskedAt || 0) > 2500) { KL.my.ghAskedAt = now(); act({ t: "ghwho", id: PID }); } }
function ghHead(S) {
  const me2 = ghMine(), c = me2 ? me2.cls : -1;
  const pts = S.cls.length > 1 ? `<div class="gh-board">${S.cls.map((cl, k) => `<span class="gh-sc ${k === c ? "me" : ""}" style="--pen:${GH_CLS[k].c}">${GH_CLS[k].n}<b>${AR(cl.pts)}</b></span>`).join("")}</div>` : "";
  if (c < 0) return `${pts}<p class="muted">تتفرج على الاختبار، وتلعب معهم الجلسة الجاية.</p>`;
  const cl = S.cls[c];
  return `<div class="gh-me" style="--pen:${GH_CLS[c].c}">${ghChip(S, c, "on")}<span class="gh-faces">${ghFaces(cl.members.filter((id) => id !== PID), 24)}</span></div>${pts}`;
}
// the folded note: everyone has one and holds it to peek, so nobody can tell who has something on it
function ghNote(S) {
  const me2 = ghMine();
  if (!me2 || me2.cls < 0) return "";
  const q = S.q, sh = me2.sheet && me2.sheet.qi === S.qi ? me2.sheet : null, hint = me2.hint && me2.hint.qi === S.qi ? me2.hint : null;
  let inside;
  if (sh) inside = `<span class="gh-n1">ورقة الغش 🤫</span><span class="gh-n2">الجواب (${GH_LET[sh.a]}) ${esc(q.o[sh.a])}</span><small>صوّت صح أحياناً عشان ما تنكشف</small>`;
  else if (me2.cheat && me2.caught) inside = `<span class="gh-n1">ورقتك انشقت</span><small>انمسكت، فكمّل معهم عادي</small>`;
  else if (hint) inside = `<span class="gh-n1">تلميحة ✏️</span><span class="gh-n2">مو ${hint.x.map((k) => `(${GH_LET[k]})`).join(" ولا ")}</span><small>بس انتبه: اللي يعرف الجواب يبان غشاش!</small>`;
  else inside = `<span class="gh-n1">ورقتك فاضية</span><small>هالمرة ما عندك شي</small>`;
  return `<button type="button" class="gh-note" id="ghNote"><span class="gh-fold">اضغط مطوّل وغطّ الشاشة 👀</span><span class="gh-in">${inside}</span></button>`;
}
function ghBindNote() {
  const n = $("ghNote"); if (!n) return;
  const open = (on) => { const el = $("ghNote"); if (el) el.classList.toggle("open", on); KL.my.peek = on; };
  n.onpointerdown = (e) => { e.preventDefault(); open(true); buzz(15); };
  n.oncontextmenu = (e) => e.preventDefault();
  if (!ghBindNote.once) { ghBindNote.once = true; ["pointerup", "pointercancel", "blur"].forEach((ev) => window.addEventListener(ev, () => KL.my.peek && open(false))); }
  if (KL.my.peek) n.classList.add("open");
}
const ghTimer = () => '<div class="gh-timer"><i id="ghBar"></i></div>';
function ghRunTimer(S, total, fresh) {
  const set = () => { const s = KL.S, b = $("ghBar"); if (s && b) b.style.transform = `scaleX(${Math.max(0, leftOf(s.left) / total)})`; };
  if (fresh) klEvery(set, 200);
  set();
}

function ghvRole(S, fresh) {
  ghAsk4Me();
  if (fresh) { clearKL(); beep(520, 0.08); setTimeout(() => beep(660, 0.1), 140); }
  setTop("دورك");
  const me2 = ghMine(), c = me2 ? me2.cls : -1;
  let inside = "", note = "";
  if (me2 && c >= 0) {
    const n = S.cls[c].n;
    inside = me2.cheat
      ? `<span class="gh-n1">أنت الغشاش 🤫</span><span class="gh-n2">معك ورقة الغش</span><small>كل سؤال بتشوف الجواب الصح. خلّ ${ghName(S, c)} يغلط بدون ما تنكشف.${me2.mates.length ? `<br>شريكك في الغش: <b>${me2.mates.map((id) => esc(who(id).name)).join(" و")}</b>` : ""}</small>`
      : `<span class="gh-n1">أنت طالب مجتهد ✏️</span><span class="gh-n2">${n > 1 ? "في فصلك غشاشين" : "في فصلك غشاش"}</span><small>راقبوا مين يصوت على وش، وكل ٣ أسئلة فيه تفتيش.</small>`;
    note = `<button type="button" class="gh-note big" id="ghNote"><span class="gh-fold">اضغط مطوّل وشوف دورك 👀<small>غطّ الشاشة عن اللي جنبك</small></span><span class="gh-in">${inside}</span></button>`;
  }
  show(`
    <div class="gh-paper">
      <div class="gh-form"><span>الاسم: <b>${esc(who(PID).name)}</b></span><span>${c < 0 ? "متفرج" : S.cls.length > 1 ? `الفصل: <b style="color:${GH_CLS[c].c}">${GH_CLS[c].n}</b>` : `${AR(S.cls[0].members.length)} طلاب`}</span></div>
      <div class="gh-h" style="text-align:center">ملف القضية</div>
      ${note || '<p class="muted" style="text-align:center">دخلت بعد ما بدأ الاختبار، تقدر تتفرج.</p>'}
      ${ghTimer()}
    </div>
    <div class="gh-classes">${S.cls.map((cl, k) => `<div class="gh-cl" style="--pen:${GH_CLS[k].c}">${ghChip(S, k)}<span class="gh-faces">${ghFaces(cl.members, 26)}</span><small>${cl.n > 1 ? "غشاشين" : "غشاش"}</small></div>`).join("")}</div>
    ${isHost() ? '<button type="button" class="btn btn-marker" id="ghGo">ابدأ الاختبار</button>' : ""}`);
  ghBindNote();
  if ($("ghGo")) $("ghGo").onclick = () => ghAsk();
  ghRunTimer(S, 14000, fresh);
}

function ghvQ(S, fresh) {
  ghAsk4Me();
  const me2 = ghMine(), c = me2 ? me2.cls : -1, q = S.q;
  if (fresh) { clearKL(); KL.my.ghk = undefined; KL.my.peek = false; beep(560, 0.06); }
  // someone else voting only moves the count, so a finger on the note or an option isn't interrupted
  if (!fresh && !KL.my.ghDirty && $("ghOpts")) { const el = $("ghVoted"); if (el && c >= 0) el.textContent = `صوّت ${AR(S.voted[c] || 0)} من ${AR(S.cls[c].members.length)}`; ghRunTimer(S, S.qtime * 1000, false); return; }
  KL.my.ghDirty = false;
  const next = GH_EVERY - ((S.qi - 1) % GH_EVERY) - 1;
  setTop(`س${AR(S.qi)} من ${AR(S.qn)}`);
  show(`
    ${ghHead(S)}
    <div class="gh-paper">
      <div class="gh-qn"><span>س${AR(S.qi)}</span><small>${esc(q.cat)}</small></div>
      <div class="gh-qt">${esc(q.q)}</div>
      ${ghTimer()}
      <div class="gh-opts" id="ghOpts">${q.o.map((o, k) => `<button type="button" class="gh-opt" data-o="${k}" aria-pressed="${KL.my.ghk === k}" ${c < 0 ? "disabled" : ""}><i>${GH_LET[k]}</i><span>${esc(o)}</span></button>`).join("")}</div>
      ${c >= 0 ? `<p class="muted" style="text-align:center" id="ghVoted">صوّت ${AR(S.voted[c] || 0)} من ${AR(S.cls[c].members.length)}</p>` : ""}
    </div>
    ${ghNote(S)}
    <p class="gh-pen">${next ? `التفتيش بعد ${next === 1 ? "سؤال" : "سؤالين"}` : "بعد هالسؤال: تفتيش!"} · تقدر تغيّر صوتك لين يخلص الوقت</p>`);
  screen.querySelectorAll(".gh-opt:not([disabled])").forEach((b) => (b.onclick = () => {
    const k = +b.dataset.o; if (KL.my.ghk === k) return;
    KL.my.ghk = k; beep(660, 0.05); buzz(15); act({ t: "ghvote", id: PID, k });
    screen.querySelectorAll(".gh-opt").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));
  ghBindNote();
  ghRunTimer(S, S.qtime * 1000, fresh);
}

function ghvRes(S, fresh) {
  ghAsk4Me();
  const me2 = ghMine(), c = me2 ? me2.cls : -1, r = S.res, q = S.q;
  const mine = c >= 0 ? r.cls[c] : null;
  if (fresh) { clearKL(); if (mine && mine.ok) { beep(784, 0.1); setTimeout(() => beep(1047, 0.16), 110); } else beep(260, 0.25, "triangle", 0.1); }
  setTop("التصحيح");
  const card = (k, big) => {
    const x = r.cls[k];
    const rows = q.o.map((o, i) => { const ids = Object.keys(x.votes).filter((id) => x.votes[id] === i); return `<div class="gh-mk ${i === r.right ? "right" : ""} ${i === x.pick ? "pick" : ""}"><i>${GH_LET[i]}</i><span class="t">${esc(o)}</span><span class="gh-faces">${ghFaces(ids, big ? 26 : 20)}</span></div>`; }).join("");
    const none = S.cls[k].members.filter((id) => x.votes[id] === undefined);
    return `<div class="gh-res ${big ? "big" : ""}" style="--pen:${GH_CLS[k].c}">
      <div class="gh-row">${ghChip(S, k)}<span class="gh-stamp ${x.ok ? "ok" : "no"}">${x.ok ? `صح +${AR(GH_PTS.right)}` : x.pick < 0 ? "ما جاوبوا" : "غلط"}</span></div>
      ${big ? rows : ""}${big && none.length ? `<p class="muted">ما صوّت: ${none.map((id) => esc(who(id).name)).join("، ")}</p>` : ""}</div>`;
  };
  show(`
    ${ghHead(S)}
    <div class="gh-paper">
      <p class="muted" style="margin:0">${esc(q.q)}</p>
      <div class="gh-ans">الجواب: <b>(${GH_LET[r.right]}) ${esc(q.o[r.right])}</b></div>
    </div>
    ${c >= 0 ? card(c, true) : ""}
    ${S.cls.map((_, k) => (k === c ? "" : card(k, S.cls.length === 1))).join("")}
    ${c >= 0 ? `<p class="gh-pen">${mine.ok ? "طيب… بس الغشاش يقدر يصوت صح عشان يتخبى." : "مين اللي دفّكم على الغلط؟ 🤨"}</p>` : ""}
    ${isHost() ? '<button type="button" class="btn btn-marker" id="ghNext">كمّل</button>' : ""}`);
  if ($("ghNext")) $("ghNext").onclick = () => ghNext();
}

function ghvInsp(S, fresh) {
  ghAsk4Me();
  const me2 = ghMine(), c = me2 ? me2.cls : -1;
  if (fresh) { clearKL(); KL.my.ghsus = null; beep(330, 0.12, "square", 0.06); setTimeout(() => beep(330, 0.12, "square", 0.06), 220); buzz([60, 40, 60]); }
  setTop("التفتيش");
  const cl = c >= 0 ? S.cls[c] : null;
  if (!fresh && !KL.my.ghDirty && cl && $("ghVoted")) { $("ghVoted").textContent = `صوّت ${AR(S.voted[c] || 0)} من ${AR(cl.members.length)}`; ghRunTimer(S, 35000, false); return; }
  KL.my.ghDirty = false;
  let body;
  if (!cl) body = '<p class="muted" style="text-align:center">الفصول تفتش…</p>';
  else if (cl.clean) body = `<div class="gh-paper"><div class="gh-h" style="text-align:center">${ghName(S, c)} نظيف ✨</div><p class="muted" style="text-align:center">مسكتوا ${cl.n > 1 ? "غشاشينكم" : "غشاشكم"}، استنوا الباقين.</p></div>`;
  else {
    const can = cl.members.filter((id) => id !== PID && !cl.caught.includes(id));
    body = `<div class="gh-paper">
      <div class="gh-stamp big">تفتيش!</div>
      <p style="text-align:center;margin:0">مين ${cl.n - cl.caught.length > 1 ? "واحد من الغشاشين" : "الغشاش"} في ${ghName(S, c)}؟ تناقشوا وصوتوا.</p>
      <div class="gh-pick">${can.map((id) => `<button type="button" data-gx="${esc(id)}" aria-pressed="${KL.my.ghsus === id}">${face(who(id), 46)}<span>${esc(who(id).name)}</span>${cl.framed.includes(id) ? "<small>مظلوم قبل</small>" : ""}</button>`).join("")}</div>
      ${ghTimer()}
      <p class="muted" style="text-align:center" id="ghVoted">صوّت ${AR(S.voted[c] || 0)} من ${AR(cl.members.length)}</p>
      <p class="muted" style="text-align:center;font-size:13px">يبي صوتين على الأقل، والتعادل يعني ما فيه اتهام. صح: +${AR(GH_PTS.catch)} · مظلوم: ${AR(Math.abs(GH_PTS.framed))}− والغشاش يكسب</p>
    </div>`;
  }
  show(`${ghHead(S)}${body}`);
  screen.querySelectorAll("[data-gx]").forEach((b) => (b.onclick = () => {
    KL.my.ghsus = b.dataset.gx; beep(660, 0.05); buzz(15); act({ t: "ghsus", id: PID, x: b.dataset.gx });
    screen.querySelectorAll("[data-gx]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));
  ghRunTimer(S, 35000, fresh);
}

function ghvRev(S, fresh) {
  const me2 = ghMine(), c = me2 ? me2.cls : -1;
  if (fresh) {
    clearKL();
    const r = c >= 0 ? S.rev[c] : null;
    if (r && r.acc && r.ok) { beep(523, 0.08); setTimeout(() => beep(784, 0.1), 120); setTimeout(() => beep(1047, 0.2), 260); buzz(80); }
    else if (r && r.acc) { beep(200, 0.3, "sawtooth", 0.08); buzz([40, 30, 40]); }
    else beep(440, 0.1);
  }
  setTop("النتيجة");
  const card = (k, big) => {
    const r = S.rev[k];
    if (r.clean) return big ? "" : `<div class="gh-res" style="--pen:${GH_CLS[k].c}"><div class="gh-row">${ghChip(S, k)}<span class="muted">نظيف ✨</span></div></div>`;
    const votes = Object.entries(r.sus || {});
    const head = !r.acc
      ? `<div class="gh-row">${ghChip(S, k)}<span class="gh-stamp">${r.tie ? "ما اتفقتوا" : "ما فيه اتهام"}</span></div>`
      : `<div class="gh-row">${ghChip(S, k)}<span class="gh-stamp ${r.ok ? "ok" : "no"}">${r.ok ? "انمسك الغشاش!" : "مظلوم!"}</span></div>
         <div class="gh-acc">${face(who(r.acc), big ? 64 : 36)}<b>${esc(who(r.acc).name)}</b>${r.ok ? `<span>${big ? `انشقت ورقته · +${AR(GH_PTS.catch)}` : ""}</span>` : `<span>${big ? `بريء! ${AR(Math.abs(GH_PTS.framed))}−` : ""}</span>`}</div>`;
    return `<div class="gh-res ${big ? "big" : ""}" style="--pen:${GH_CLS[k].c}">${head}
      ${big && votes.length ? `<div class="gh-votes">${votes.map(([a, b]) => `<span>${face(who(a), 20)}←${face(who(b), 20)}</span>`).join("")}</div>` : ""}</div>`;
  };
  const r = c >= 0 ? S.rev[c] : null;
  show(`${ghHead(S)}
    ${c >= 0 ? card(c, true) : ""}
    ${r && r.acc && !r.ok ? `<p class="gh-pen" style="text-align:center">${S.cls[c].n > 1 ? "الغشاشين" : "الغشاش"} لسا بينكم… 😈</p>` : ""}
    ${S.cls.map((_, k) => (k === c ? "" : card(k, false))).join("")}`);
}

function ghvEnd(S, fresh) {
  if (fresh) { clearKL(); beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); }
  setTop("المحضر");
  const E = S.end, me2 = ghMine(), c = me2 ? me2.cls : -1, one = S.cls.length === 1;
  const won = one ? E.cheats[0].every((x) => x.caught) : null, best = E.rank[0];
  const title = one ? (won ? "الفصل مسك الغشاش! 🎉" : "الغشاش فاز! 😈") : `${ghName(S, best)} الأول! 🎉`;
  const cheatLine = (x) => `<div class="gh-ch ${x.caught ? "" : "free"}">${face(who(x.id), 40)}<span><b>${esc(who(x.id).name)}</b><small>${x.caught ? `انمسك في التفتيش ${AR(x.at / GH_EVERY)}` : "ما انمسك 😈"}</small></span><i>${AR(x.pts)}</i></div>`;
  const aw = E.awards || {}, award = (t, a, unit) => (a ? `<div class="gh-aw"><span>${t}</span><b>${face(who(a.id), 24)}${esc(who(a.id).name)}${unit ? ` · ${AR(a.n)} ${unit}` : ""}</b></div>` : "");
  show(`
    <div class="gh-paper">
      <div class="gh-form"><span>محضر الوكيل</span><span>${AR(S.qi)} سؤال</span></div>
      <div class="gh-h" style="text-align:center;color:${one ? (won ? "#1f8a53" : "#c8232c") : GH_CLS[best].c}">${title}</div>
      ${!one ? `<div class="gh-ranks">${E.rank.map((k, i) => `<div class="gh-rk ${k === c ? "me" : ""}" style="--pen:${GH_CLS[k].c}"><span class="n">${AR(i + 1)}</span>${ghChip(S, k)}<small>${AR(E.right[k])} صح</small><b>${AR(S.cls[k].pts)}</b></div>`).join("")}</div>` : `<p class="muted" style="text-align:center">جاوبتوا ${AR(E.right[0])} من ${AR(S.qi)} صح · النقاط ${AR(S.cls[0].pts)}</p>`}
    </div>
    <p class="muted" style="font-weight:700">الغشاشين:</p>
    ${S.cls.map((_, k) => `<div class="gh-res" style="--pen:${GH_CLS[k].c}">${one ? "" : ghChip(S, k)}${E.cheats[k].map(cheatLine).join("")}</div>`).join("")}
    ${award("أشطر غشاش", aw.cheat, "نقطة")}${award("المحقق", aw.detect, "مسكة")}${award("أكثر واحد انظلم", aw.framed, "")}
    ${isHost() ? '<button type="button" class="btn btn-marker" id="ghAgain">اختبار جديد بنفس الربع</button>' : '<p class="muted" style="text-align:center">المضيف يقدر يبدأ اختبار جديد.</p>'}
    <button type="button" class="btn btn-ghost" id="ghHome">رجوع لفسحة</button>`);
  if ($("ghAgain")) $("ghAgain").onclick = () => hostAgain();
  $("ghHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}
