"use strict";
// ================= انكشف!: on the school stage, every name hidden under a nickname sticker =================
// Everyone (or every pair / trio) hides behind a secret nickname. Questions come, the results are read
// out by nickname, fastest first, and every result is a clue. The fastest right answer earns one
// accusation: name the people behind a sticker. Right, the sticker peels off; wrong, the accused gains.
// Who is behind which sticker never goes into the shared snapshot: the host tells each owner privately.

const AQ_MAX = 20;
const AQ_COLORS = ["#ff8fa3", "#8fc7ff", "#9be3b5", "#ffd27a", "#c9b3ff", "#ffb38a", "#7fe3e0", "#f6a6e0"];
const AQ_NICKS = ["ملك الأعذار", "البطريق الغامض", "أبو كبسة", "الطالب المثالي", "النعسان", "سفير الشاي", "كابتن الفسحة", "آخر من يعلم", "أبو العريف", "المتأخر دايماً", "حارس الثلاجة", "ملك الطقطقة", "الفيلسوف", "مدمن القهوة", "العبقري المجهول", "الكسلان الذكي", "المحقق كونان", "قناص الأسئلة", "الصقر", "الثعلب", "الدحيح", "صاحب الفزعة", "ملك الشاورما", "مكينة الضحك", "رادار الحارة", "أبو الأفكار", "الكابتن ماجد", "بطل الإجازة", "ملك الريموت", "الطباخ السري", "الرحالة", "صاحب النكتة البايخة", "القائد الخفي", "النينجا", "الوزير", "المستشار", "المذيع", "صاحب البخت", "أبو وجه بوكر", "الحكيم", "القط الشيرازي", "الجمل الصبور", "النملة الشغيلة", "البومة الساهرة", "الأسد النايم", "أبو سنابات", "نجم الاستراحة", "ملك البلوت", "السائق الحذر", "بطل الكشتة", "صاحب الواجب", "الهادي الخطير", "سيد الحلا", "المخطط الكبير", "أبو نومة", "حكم المباراة", "الضيف الثقيل", "شيف الشواء", "الموسوعة", "المتفائل"];
// «وش تفضل؟»: no right answer, but friends know each other's answers, so these are the best clues
const AQ_PREFS = [
  ["شاي ولا قهوة؟", ["شاي", "قهوة"]], ["بحر ولا بر؟", ["بحر", "بر"]], ["تصحى بدري ولا تسهر؟", ["أصحى بدري", "أسهر"]],
  ["صيف ولا شتاء؟", ["صيف", "شتاء"]], ["كبسة ولا مندي ولا برياني؟", ["كبسة", "مندي", "برياني"]], ["آيفون ولا أندرويد؟", ["آيفون", "أندرويد"]],
  ["تسافر بالطيارة ولا بالسيارة؟", ["طيارة", "سيارة"]], ["حلا ولا مالح؟", ["حلا", "مالح"]], ["في الجمعات تسمع ولا تتكلم؟", ["أسمع", "أتكلم"]],
  ["تخطط للسفر ولا تسافر فجأة؟", ["أخطط", "فجأة"]], ["بيتزا ولا برجر؟", ["بيتزا", "برجر"]], ["كرك ولا قهوة عربية؟", ["كرك", "قهوة عربية"]],
  ["جوالك على الصامت ولا الصوت؟", ["صامت", "صوت"]], ["تحب الزحمة ولا الهدوء؟", ["الزحمة", "الهدوء"]], ["تطبخ ولا تطلب؟", ["أطبخ", "أطلب"]],
  ["تمر ولا شوكولاتة؟", ["تمر", "شوكولاتة"]], ["وش فريقك؟", ["الهلال", "النصر", "الاتحاد", "الأهلي"]], ["تلعب ألعاب إلكترونية؟", ["إيه", "لا"]],
  ["أول شي تسويه إذا صحيت؟", ["أشوف الجوال", "أشرب قهوة", "أرجع أنام"]], ["وقتك المفضل؟", ["الصباح", "العصر", "الليل"]],
  ["تحب المفاجآت؟", ["إيه", "لا"]], ["في الطيارة: شباك ولا ممر؟", ["شباك", "ممر"]], ["آيس كريم: فانيلا ولا شوكولاتة؟", ["فانيلا", "شوكولاتة"]],
  ["الرياضة: تتفرج ولا تلعب؟", ["أتفرج", "ألعب", "ولا شي"]], ["رسايل مكتوبة ولا فويس؟", ["مكتوبة", "فويس"]], ["سيلفي ولا تصوّر غيرك؟", ["سيلفي", "أصوّر غيري"]],
  ["تقرأ التعليمات ولا تجرب على طول؟", ["أقرأ", "أجرب"]], ["في المطعم: نفس طلبك ولا تجرب جديد؟", ["نفس الطلب", "جديد"]], ["كشتة ولا استراحة؟", ["كشتة", "استراحة"]],
  ["نوع الأفلام اللي تحبه؟", ["أكشن", "كوميدي", "رعب"]], ["كم أخو وأخت عندك؟", ["٠ إلى ٢", "٣ إلى ٤", "٥ وأكثر"]], ["ترتيبك بين إخوانك؟", ["الكبير", "الأوسط", "الأصغر", "الوحيد"]],
  ["تنام والمكيف شغال ولا طافي؟", ["شغال", "طافي"]], ["قهوتك: بسكر ولا بدون؟", ["بسكر", "بدون"]], ["تمشي ولا نادي؟", ["مشي", "نادي", "ولا شي 😅"]],
  ["العيد: تنام الصبح ولا تطلع بدري؟", ["أنام", "أطلع بدري"]], ["تحب الأكل الحار؟", ["إيه", "لا"]], ["الواجب: أول شي ولا آخر لحظة؟", ["أول شي", "آخر لحظة"]],
];
const aqCats = () => QCATS.filter((c) => c !== "الأغلبية");
// every group size needs at least four stickers, or knowing your own team gives the game away
const AQ_SIZES = [["solo", 1, 4, "فردي"], ["pairs", 2, 8, "ثنائيات"], ["trios", 3, 12, "ثلاثيات"]];
const aqSizesFor = (n) => AQ_SIZES.filter((m) => n >= m[2]);
const aqModeFor = (S, n) => { const ok = aqSizesFor(n); if (S.mode !== "auto" && ok.some((m) => m[0] === S.mode)) return S.mode; return n >= 8 ? "pairs" : "solo"; };
const aqTag = (S, id) => S.tags.find((t) => t.id === id);
const aqMine = () => KL.my.aq && KL.S && KL.my.aq.sid === KL.S.sid ? KL.my.aq : null;
const aqStk = (t, extra = "") => (t ? `<span class="aq-stk ${t.wolf ? "wolf" : ""} ${extra}" style="--c:${AQ_COLORS[t.c % AQ_COLORS.length]}">${t.wolf ? "🐺 " : ""}${esc(t.n || "…")}</span>` : "");

ROOM_GAMES.alqab = {
  name: "انكشف!", theme: "alqab", min: 4, need: "يحتاج ٤ لاعبين على الأقل", who: "٤ إلى ٢٠ · أسئلة وتخمين",
  rules: ["كل واحد يختار لقب سري، ومحد يعرف لقب غيره.", "تطلع أسئلة، والنتائج تنكتب بالألقاب بس، مرتبة بالسرعة.", "أسرع واحد يجاوب صح ياخذ فرصة يتهم: يختار لقب ويقول مين صاحبه.", "صح؟ الملصق ينقشر وتاخذ نقاط. غلط؟ اللي اتهمته ياخذ نقاط وأنت ينخصم منك.", "أسئلة «وش تفضل؟» ما لها جواب صح، بس تكشف مين يحب وش.", "في الثنائيات والثلاثيات: شريكك سري، وتتهمون الفريق كامل.", "آخر لقب ما ينكشف صاحبه هو «الشبح» 👻 وياخذ نقاط كبيرة."],
  setup(S) { Object.assign(S, { mode: "auto", qn: 12, qtime: 15, picks: ["السعودية", "الخليج والعرب", "جغرافيا", "أكل", "كورة", "ألغاز", "عامة", "حيوانات"] }); },
  snap(S) {
    S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
    if (H.aq && S.phase === "nick") S.ready = H.aq.tags.filter((t) => t.n).length;
  },
  key: (S) => `${S.sid || ""}:${S.phase}:${S.qi || 0}:${S.res && S.res.gone ? 1 : 0}`,
  on(m) {
    const S = H.S, A = H.aq;
    if (!A || !m.id) return;
    const ti = A.of[m.id];
    if (m.t === "aqwho") return aqTellOne(m.id);
    if (ti === undefined) return; // joined after the start: watching only
    if (m.t === "aqnick" && S.phase === "nick") return aqNick(m.id, String(m.n || ""));
    if (m.t === "aqans" && S.phase === "q" && Number.isInteger(m.k) && m.k >= 0 && m.k < S.q.o.length && !A.ans[m.id]) {
      A.ans[m.id] = { k: m.k, t: now() - A.qStart };
      S.answered = Object.keys(A.ans).length;
      if (aqPlayers().every((id) => A.ans[id])) H.deadline = Math.min(H.deadline, now() + 500);
      return hostSendSoon();
    }
    if (m.t === "aqacc" && S.phase === "res" && S.res.chance === A.tags[ti].id && !S.res.gone) return aqAccuse(m.id, m.tag, m.ids);
  },
  direct(m) {
    if (m.t !== "aqyou") return;
    KL.my.aq = m;
    if (KL.S && KL.S.game === "alqab" && ROOM_GAMES.alqab.views[KL.S.phase]) ROOM_GAMES.alqab.views[KL.S.phase](KL.S, false);
  },
  lobby(S) {
    const n = S.players.length, ok = aqSizesFor(n).map((m) => m[0]);
    const h = (t) => `<p class="muted" style="font-weight:700;color:var(--soft)">${t}</p>`;
    const chips = (attr, list, cur, lab) => `<div class="chips pick">${list.map((v) => `<button type="button" class="chip" data-${attr}="${v}" aria-pressed="${cur === v}">${lab(v)}</button>`).join("")}</div>`;
    return `${h("الفرق")}<div class="chips pick"><button type="button" class="chip" data-aqm="auto" aria-pressed="${S.mode === "auto" || !ok.includes(S.mode)}">تلقائي (${AQ_SIZES.find((m) => m[0] === aqModeFor({ mode: "auto" }, n))[3]})</button>${AQ_SIZES.map(([id, , min, lab]) => `<button type="button" class="chip" data-aqm="${id}" aria-pressed="${S.mode === id && ok.includes(id)}" aria-disabled="${!ok.includes(id)}" data-min="${min}">${lab}${ok.includes(id) ? "" : ` (من ${AR(min)})`}</button>`).join("")}</div>
      <p class="aq-mhint" id="aqmHint" hidden></p>
      <p class="muted">كل لاعب يعرف فريقه، فلازم يكون فيه ٤ ألقاب على الأقل. الثنائيات من ٨ لاعبين، والثلاثيات من ١٢.</p>
      ${h("كم سؤال؟")}${chips("aqn", [8, 12, 16], S.qn, (v) => AR(v))}
      ${h("وقت الإجابة")}${chips("aqt", [10, 15, 20], S.qtime, (v) => `${AR(v)} ثانية`)}
      ${h("فئات الأسئلة")}<div class="chips pick">${aqCats().map((c) => `<button type="button" class="chip" data-aqc="${c}" aria-pressed="${S.picks.includes(c)}">${c}</button>`).join("")}</div>`;
  },
  bindLobby(S) {
    const set = (attr, key, num) => screen.querySelectorAll(`[data-${attr}]:not([aria-disabled="true"])`).forEach((b) => (b.onclick = () => { if (b.disabled) return; H.S[key] = num ? +b.dataset[attr] : b.dataset[attr]; beep(700, 0.04); hostSend(); }));
    // a size that needs more players explains itself instead of doing nothing
    screen.querySelectorAll('[data-aqm][aria-disabled="true"]').forEach((b) => (b.onclick = () => {
      const left = +b.dataset.min - H.players.length, hint = $("aqmHint"); buzz(30); beep(260, 0.08, "square", 0.05);
      if (hint) { hint.hidden = false; hint.textContent = `ال${b.textContent.replace(/\s*\(.*\)/, "")} تبي ${AR(+b.dataset.min)} لاعبين على الأقل. باقي ${AR(left)}، وإذا دخلوا تقدر تختارها.`; }
    }));
    set("aqm", "mode", false); set("aqn", "qn", true); set("aqt", "qtime", true);
    screen.querySelectorAll("[data-aqc]").forEach((b) => (b.onclick = () => { const c = b.dataset.aqc, p = H.S.picks; H.S.picks = p.includes(c) ? p.filter((x) => x !== c) : [...p, c]; beep(660, 0.04); hostSend(); }));
    const st = $("start");
    if (S.players.length > AQ_MAX) { st.disabled = true; st.textContent = `انكشف! لين ${AR(AQ_MAX)} لاعب`; }
    else if (!S.picks.length) { st.disabled = true; st.textContent = "اختر فئة وحدة على الأقل"; }
  },
  start: () => aqStart(),
  resume(S) {
    if (!(H.usedQ instanceof Set)) H.usedQ = new Set();
    if (!(H.usedP instanceof Set)) H.usedP = new Set();
    if (S.phase === "q") { if (now() >= H.deadline) aqResult(); else hEvery(() => { if (now() >= H.deadline) aqResult(); }, 200); }
    else if (S.phase === "res") { if (S.res.chance && !S.res.gone) aqArmChance(); else hLater(aqNext, 5000); }
    else if (S.phase === "rev") hLater(aqNext, 3000);
    H.players.forEach((p) => aqTellOne(p.id));
  },
  views: { nick: aqvNick, q: aqvQ, res: aqvRes, rev: aqvRev, end: aqvEnd },
};

// ---------------- the host ----------------
const aqPlayers = () => H.players.map((p) => p.id).filter((id) => H.aq.of[id] !== undefined);
// the private part of the game goes only to its owner (and to this phone directly when the host is the owner)
function aqTell(id, m) { m.to = id; if (id === PID) ROOM_GAMES.alqab.direct(m); else if (KL.net) KL.net.send(m); }
function aqTellOne(id) {
  const A = H.aq; if (!A) return;
  const ti = A.of[id];
  if (ti === undefined) return aqTell(id, { t: "aqyou", sid: H.S.sid, tag: null, pts: 0 });
  const t = A.tags[ti];
  aqTell(id, { t: "aqyou", sid: H.S.sid, tag: t.id, n: t.n, mates: t.members.filter((x) => x !== id), pts: A.pts[id] || 0 });
}
const aqTellTeam = (ti) => H.aq.tags[ti].members.forEach(aqTellOne);

function aqStart() {
  hClear();
  const S = H.S, ids = shuffled(H.players.map((p) => p.id)), n = ids.length;
  const mode = aqModeFor(S, n), size = AQ_SIZES.find((m) => m[0] === mode)[1];
  // as many groups as the size allows, sizes differing by one at most (an odd pair leaves a lone wolf)
  const groups = size === 1 ? n : Math.max(4, Math.round(n / size)), base = Math.floor(n / groups), extra = n % groups;
  const tags = [], of = {}; let at = 0;
  const colors = shuffled(AQ_COLORS.map((_, k) => k));
  for (let g = 0; g < groups; g++) {
    const members = ids.slice(at, at + base + (g < extra ? 1 : 0)); at += members.length;
    tags.push({ id: "t" + g, n: "", c: colors[g % colors.length], members });
    members.forEach((id) => (of[id] = g));
  }
  H.aq = { tags, of, pts: {}, ans: {}, hits: {}, framed: {} };
  H.usedQ instanceof Set || (H.usedQ = new Set());
  H.usedP instanceof Set || (H.usedP = new Set());
  Object.assign(S, { sid: Math.random().toString(36).slice(2, 8), phase: "nick", qi: 0, size, teams: size > 1, q: null, res: null, rev: null, ready: 0, answered: 0,
    tags: tags.map((t) => ({ id: t.id, size: t.members.length, n: "", c: t.c, out: false, who: null, wolf: size > 1 && t.members.length === 1 })) });
  H.deadline = 0;
  hostSend();
  H.players.forEach((p) => aqTellOne(p.id));
}
function aqNick(id, raw) {
  const S = H.S, A = H.aq, ti = A.of[id], t = A.tags[ti];
  const n = raw.replace(/\s+/g, " ").trim().slice(0, 22);
  const err = (e) => aqTell(id, { t: "aqyou", sid: S.sid, tag: t.id, n: t.n, mates: t.members.filter((x) => x !== id), pts: A.pts[id] || 0, err: e });
  if (n.length < 2) return err("اللقب قصير");
  if (isRude(n)) return err("اختر لقب ثاني");
  if (A.tags.some((x, k) => k !== ti && x.n && x.n.replace(/\s/g, "") === n.replace(/\s/g, ""))) return err("هذا اللقب مأخوذ، اختر غيره");
  t.n = n;
  aqTellTeam(ti);
  hostSendSoon();
  if (A.tags.every((x) => x.n)) { hClear(); hLater(aqBegin, 1200); }
}
// the host can start before everyone picked: the rest get a random sticker
function aqBegin() {
  const S = H.S, A = H.aq;
  if (S.phase !== "nick") return;
  const free = shuffled(AQ_NICKS.filter((x) => !A.tags.some((t) => t.n === x)));
  A.tags.forEach((t, k) => { if (!t.n) t.n = free.pop(); S.tags[k].n = t.n; });
  A.tags.forEach((_, k) => aqTellTeam(k));
  aqAsk();
}
function aqAsk() {
  hClear();
  const S = H.S, A = H.aq;
  S.qi++;
  const pref = S.qi % 3 === 2; // questions ٢، ٥، ٨…: «وش تفضل؟»
  if (pref) {
    let pool = AQ_PREFS.filter((p) => !H.usedP.has(p[0])); if (!pool.length) { H.usedP.clear(); pool = AQ_PREFS; }
    const [q, o] = pickOne(pool); H.usedP.add(q);
    S.q = { kind: "pref", q, o, cat: "وش تفضل؟" }; A.right = -1;
  } else {
    const d = drawQuestion(pickOne(S.picks.length ? S.picks : ["عامة"]), H.usedQ);
    S.q = { kind: "info", q: d.q, o: d.o, cat: d.cat }; A.right = d.a;
  }
  A.ans = {}; A.qStart = now(); S.answered = 0;
  S.phase = "q"; S.res = null; S.rev = null;
  H.deadline = now() + S.qtime * 1000;
  hostSend();
  hEvery(() => { if (now() >= H.deadline) aqResult(); }, 200);
}
function aqResult() {
  hClear();
  const S = H.S, A = H.aq, info = S.q.kind === "info", add = (id, n) => (A.pts[id] = (A.pts[id] || 0) + n);
  // the sheet, one row per sticker: every member's mark and time, fastest right answer first
  const rows = A.tags.map((t, ti) => {
    const marks = t.members.map((id) => { const a = A.ans[id]; return a ? { k: a.k, ok: info ? a.k === A.right : null, t: Math.round(a.t / 100) / 10 } : { k: -1, ok: false, t: null }; })
      .sort((x, y) => (y.ok - x.ok) || ((x.t ?? 1e9) - (y.t ?? 1e9)));
    const best = marks.find((x) => x.ok)?.t ?? null;
    return { tag: t.id, marks, best, ti };
  });
  rows.sort((x, y) => (x.best ?? 1e9) - (y.best ?? 1e9) || (y.marks.filter((m) => m.k >= 0).length - x.marks.filter((m) => m.k >= 0).length));
  let chance = null;
  if (info) {
    const right = aqPlayers().filter((id) => A.ans[id] && A.ans[id].k === A.right).sort((x, y) => A.ans[x].t - A.ans[y].t);
    right.forEach((id, k) => add(id, k === 0 ? 70 : 50));
    // the fastest right answer earns the accusation, from the third question on, if there's anyone left to accuse
    const first = right[0];
    if (first && S.qi >= 3) {
      const mine = A.of[first];
      if (A.tags.some((t, k) => k !== mine && !S.tags[k].out)) chance = A.tags[mine].id;
    }
  }
  S.res = { kind: S.q.kind, right: info ? A.right : -1, answer: info ? S.q.o[A.right] : "", rows: rows.map(({ tag, marks }) => ({ tag, marks })), chance, gone: false,
    counts: S.q.o.map((_, k) => aqPlayers().filter((id) => A.ans[id] && A.ans[id].k === k).length) };
  S.phase = "res";
  H.deadline = chance ? now() + 30000 : 0; // the accusation clock has to be in the snapshot everyone gets
  hostSend();
  H.players.forEach((p) => aqTellOne(p.id));
  if (chance) aqArmChance(); else hLater(aqNext, info ? 6500 : 7500);
}
function aqArmChance() {
  H.deadline = H.deadline > now() && H.S.phase === "res" ? H.deadline : now() + 30000;
  hEvery(() => { if (now() >= H.deadline && H.S.phase === "res" && !H.S.res.gone) { H.S.res.gone = true; H.deadline = 0; hClear(); hostSend(); hLater(aqNext, 1500); } }, 300);
}
function aqAccuse(by, tagId, ids) {
  const S = H.S, A = H.aq, ti = A.tags.findIndex((t) => t.id === tagId), mine = A.of[by];
  if (ti < 0 || ti === mine || S.tags[ti].out || !Array.isArray(ids)) return;
  const t = A.tags[ti], pick = [...new Set(ids.map(String))];
  if (pick.length !== t.members.length) return;
  // only people still hidden, and not yourself or your own team
  if (pick.some((id) => A.of[id] === undefined || A.of[id] === mine || S.tags[A.of[id]].out)) return;
  hClear(); H.deadline = 0;
  const add = (id, n) => (A.pts[id] = (A.pts[id] || 0) + n);
  const hits = pick.filter((id) => t.members.includes(id)).length;
  let outcome;
  if (hits === t.members.length) {
    outcome = "hit"; add(by, 200 + 20 * Math.max(0, S.qn - S.qi));
    A.hits[by] = (A.hits[by] || 0) + 1;
    Object.assign(S.tags[ti], { out: true, who: t.members, outQ: S.qi, by: A.tags[mine].id });
  } else if (hits > 0) outcome = "part";
  else { outcome = "miss"; add(by, -50); pick.forEach((id) => { add(id, 100); A.framed[id] = (A.framed[id] || 0) + 1; }); }
  S.res.gone = true;
  S.rev = { tag: t.id, by: A.tags[mine].id, ids: pick, outcome, hits, size: t.members.length };
  S.phase = "rev";
  hostSend();
  H.players.forEach((p) => aqTellOne(p.id));
  hLater(aqNext, outcome === "hit" ? 5200 : 4500);
}
function aqNext() {
  hClear();
  const S = H.S;
  if (S.phase !== "res" && S.phase !== "rev") return;
  if (S.qi >= S.qn || S.tags.filter((t) => !t.out).length <= 1) return aqEnd();
  aqAsk();
}
function aqEnd() {
  hClear();
  const S = H.S, A = H.aq, add = (id, n) => (A.pts[id] = (A.pts[id] || 0) + n);
  // whoever was never found is a ghost
  A.tags.forEach((t, k) => { if (!S.tags[k].out) t.members.forEach((id) => add(id, S.tags[k].wolf ? 600 : 300)); S.tags[k].who = t.members; });
  S.rank = aqPlayers().map((id) => ({ id, pts: A.pts[id] || 0, tag: A.tags[A.of[id]].id })).sort((x, y) => y.pts - x.pts);
  const top = (o) => { const e = Object.entries(o).sort((x, y) => y[1] - x[1])[0]; return e ? { id: e[0], n: e[1] } : null; };
  S.awards = { sleuth: top(A.hits), framed: top(A.framed) };
  S.phase = "end"; H.deadline = 0;
  hostSend();
  H.players.forEach((p) => aqTellOne(p.id));
}

// ---------------- every phone ----------------
const aqFaces = (ids, s = 30) => ids.map((id) => face(who(id), s)).join("");
function aqBar(S) {
  return `<div class="aq-strip">${S.tags.map((t) => `<span class="aq-mini ${t.out ? "out" : ""}" title="${esc(t.n)}">${aqStk(t)}${t.out ? `<span class="aq-who">${aqFaces(t.who, 22)}</span>` : ""}</span>`).join("")}</div>`;
}
const aqMeLine = (S) => { const me2 = aqMine(); return me2 && me2.tag ? `<div class="aq-me">لقبك: ${aqStk(aqTag(S, me2.tag))}${me2.mates && me2.mates.length ? `<span class="aq-mates">مع ${aqFaces(me2.mates, 22)}</span>` : ""}<b>${AR(me2.pts || 0)}</b></div>` : ""; };
// a phone that reloaded (or joined late) asks the host again what its secret is
function aqAsk4Me(S) { if (!aqMine() && now() - (KL.my.aqAskedAt || 0) > 2500) { KL.my.aqAskedAt = now(); act({ t: "aqwho", id: PID }); } }

function aqvNick(S, fresh) {
  aqAsk4Me(S);
  if (fresh) { KL.my.aqPool = shuffled(AQ_NICKS).slice(0, 12); beep(620, 0.06); }
  setTop("قبل البداية");
  const me2 = aqMine(), t = me2 && me2.tag ? aqTag(S, me2.tag) : null;
  const total = S.tags.length;
  if (me2 && !me2.tag) return show(`<div class="aq-card"><div class="aq-h">دخلت بعد ما بدأت الجولة</div><p class="muted">تقدر تتفرج على الكشف، وتلعب معهم الجولة الجاية.</p></div>`);
  const pool = KL.my.aqPool || AQ_NICKS.slice(0, 12), draft = KL.my.aqDraft || "";
  // someone typing their own nickname keeps the keyboard: only the count moves
  if (!fresh && document.activeElement && document.activeElement.id === "aqIn" && $("aqReady")) { $("aqReady").innerHTML = `<b>${AR(S.ready || 0)}</b> من ${AR(total)} جاهزين`; return; }
  show(`
    <div class="aq-h">${S.teams ? "اختاروا اسم فريقكم السري" : "اختر لقبك السري"}</div>
    ${me2 && me2.mates && me2.mates.length ? `<div class="aq-secret">${aqFaces(me2.mates, 40)}<span>${me2.mates.length > 1 ? "شركاؤك" : "شريكك"} السري: ${me2.mates.map((id) => esc(who(id).name)).join(" و")}<small>محد يدري غيركم. واحد منكم يختار اسم الفريق، ولا تناظرون بعض كثير!</small></span></div>` : ""}
    ${me2 && me2.mates && !me2.mates.length && S.teams ? `<div class="aq-secret">🐺<span>أنت «الذئب الوحيد»<small>بدون شريك، وإذا ما انكشفت تاخذ نقاط الشبح مضاعفة.</small></span></div>` : ""}
    <p class="muted">${S.teams ? "محد يعرف اسم فريقكم غيركم." : "محد يعرف لقبك غيرك."} اختر من الملصقات أو اكتب من عندك.</p>
    <div class="aq-sheet">${pool.map((n, k) => `<button type="button" class="aq-stk" style="--c:${AQ_COLORS[k % AQ_COLORS.length]}" data-nk="${esc(n)}" aria-pressed="${me2 && me2.n === n}">${esc(n)}</button>`).join("")}</div>
    <form class="aq-write" id="aqForm"><input id="aqIn" maxlength="22" placeholder="أو اكتب ${S.teams ? "اسم فريقكم" : "لقبك"}…" value="${esc(draft)}" autocomplete="off"><button type="submit" class="btn btn-marker">هذا</button></form>
    ${me2 && me2.err ? `<p class="aq-pen">${esc(me2.err)}</p>` : me2 && me2.n ? `<p class="aq-pen">${S.teams ? "اسم فريقكم" : "ملصقك"}: ${esc(me2.n)} ✓</p>` : ""}
    <div class="aq-ready" id="aqReady"><b>${AR(S.ready || 0)}</b> من ${AR(total)} جاهزين</div>
    ${isHost() ? `<button type="button" class="btn btn-ghost" id="aqGo">ابدأ الحين (والباقين ياخذون ملصق عشوائي)</button>` : ""}`);
  screen.querySelectorAll("[data-nk]").forEach((b) => (b.onclick = () => { beep(700, 0.04); act({ t: "aqnick", id: PID, n: b.dataset.nk }); }));
  $("aqIn").oninput = (e) => (KL.my.aqDraft = e.target.value);
  $("aqForm").onsubmit = (e) => { e.preventDefault(); const v = $("aqIn").value.trim(); if (v) { beep(700, 0.04); act({ t: "aqnick", id: PID, n: v }); } };
  if ($("aqGo")) $("aqGo").onclick = () => aqBegin();
}

function aqvQ(S, fresh) {
  aqAsk4Me(S);
  if (fresh) { clearKL(); KL.my.aqk = undefined; beep(520, 0.06); }
  const q = S.q, me2 = aqMine(), playing = !!(me2 && me2.tag);
  setTop(`سؤال ${AR(S.qi)} من ${AR(S.qn)}`);
  show(`
    ${aqMeLine(S)}
    <div class="aq-q">
      <span class="aq-kind ${q.kind}">${q.kind === "pref" ? "وش تفضل؟" : `معلومات · ${esc(q.cat)}`}</span>
      <div class="aq-qt">${esc(q.q)}</div>
      <div class="aq-timer"><i id="aqBar"></i></div>
      ${q.o.map((o, k) => `<button type="button" class="aq-opt" data-o="${k}" aria-pressed="${KL.my.aqk === k}" ${!playing || KL.my.aqk !== undefined ? "disabled" : ""}>${esc(o)}</button>`).join("")}
    </div>
    <p class="aq-pen">${q.kind === "pref" ? "ما فيه جواب صح، بس جوابك ينكتب تحت لقبك" : S.qi >= 3 ? "أسرع جواب صح ياخذ فرصة يتهم… بس لقبه يطلع أول الكشف!" : `التخمين يبدأ من السؤال الثالث`}</p>
    <p class="muted" style="text-align:center">جاوب ${AR(S.answered || 0)} من ${AR(S.tags.reduce((x, t) => x + t.size, 0))}</p>
    ${aqBar(S)}`);
  screen.querySelectorAll(".aq-opt:not([disabled])").forEach((b) => (b.onclick = () => { KL.my.aqk = +b.dataset.o; beep(660, 0.05); buzz(20); act({ t: "aqans", id: PID, k: KL.my.aqk }); screen.querySelectorAll(".aq-opt").forEach((x) => { x.disabled = true; x.setAttribute("aria-pressed", String(x === b)); }); }));
  if (fresh) klEvery(() => { const s = KL.S, b = $("aqBar"); if (s && s.phase === "q" && b) b.style.transform = `scaleX(${leftOf(s.left) / (s.qtime * 1000)})`; }, 200);
  const b = $("aqBar"); if (b) b.style.transform = `scaleX(${leftOf(S.left) / (S.qtime * 1000)})`;
}

function aqvRes(S, fresh) {
  aqAsk4Me(S);
  const r = S.res, me2 = aqMine(), myTag = me2 && me2.tag;
  if (fresh) { clearKL(); const mine = r.rows.find((x) => x.tag === myTag); const ok = mine && mine.marks.some((m) => m.ok); if (r.kind === "info") { if (ok) { beep(784, 0.1); setTimeout(() => beep(1047, 0.16), 110); } else beep(260, 0.25, "triangle", 0.1); } else beep(620, 0.08); KL.my.acc = { tag: null, ids: [] }; }
  setTop(`نتيجة السؤال ${AR(S.qi)}`);
  const chanceMine = r.chance && r.chance === myTag && !r.gone;
  const chanceTag = r.chance ? aqTag(S, r.chance) : null;
  const mark = (m) => (r.kind === "pref" ? "" : m.k < 0 ? '<span class="aq-mark n">—</span>' : `<span class="aq-mark ${m.ok ? "y" : "n"}">${m.ok ? "✓" : "✗"}</span>`);
  const sheet = r.kind === "info"
    ? `<div class="aq-roll">${r.rows.map((row, k) => { const t = aqTag(S, row.tag); return `<div class="aq-r ${row.tag === myTag ? "me" : ""}"><span class="n">${AR(k + 1)}</span><span>${aqStk(t)}${t.out ? `<span class="aq-who">${aqFaces(t.who, 20)}</span>` : ""}</span><span class="t">${row.marks.map((m) => (m.ok && m.t != null ? `${m.t.toFixed(1)}s` : "")).filter(Boolean).join(" · ") || "—"}</span><span class="m">${row.marks.map(mark).join("")}</span></div>`; }).join("")}</div>`
    : `<div class="aq-prefs">${S.q.o.map((o, k) => { const who2 = r.rows.flatMap((row) => row.marks.filter((m) => m.k === k).map(() => row.tag)); return `<div class="aq-pref"><b>${esc(o)}</b><div>${who2.map((id) => aqStk(aqTag(S, id))).join("") || '<span class="muted">ولا أحد</span>'}</div></div>`; }).join("")}</div>`;
  show(`
    ${aqMeLine(S)}
    <div class="aq-h">${r.kind === "info" ? "كشف السؤال" : "وش اختار كل لقب؟"}</div>
    ${r.kind === "info" ? `<p class="muted">الجواب: <b>${esc(r.answer)}</b></p>` : `<p class="muted">${esc(S.q.q)}</p>`}
    ${sheet}
    ${chanceMine ? aqAccuseBox(S, me2) : r.chance ? `<div class="aq-chance"><span class="aq-pen">${r.gone ? "راحت الفرصة!" : "فرصة الاتهام لـ"}</span> ${aqStk(chanceTag)} ${r.gone ? "" : `<span class="muted" id="aqLeft"></span>`}</div>` : r.kind === "info" && S.qi < 3 ? '<p class="aq-pen">التخمين يبدأ من السؤال الثالث</p>' : ""}
    ${isHost() && !(r.chance && !r.gone) ? '<button type="button" class="btn btn-marker" id="aqNext">كمّل</button>' : ""}`);
  if ($("aqNext")) $("aqNext").onclick = () => aqNext();
  if (chanceMine) aqBindAccuse(S, me2);
  if (fresh && r.chance && !r.gone) klEvery(() => { const el = $("aqLeft"), s = KL.S; if (el && s && s.phase === "res") el.textContent = `${AR(Math.ceil(leftOf(s.left) / 1000))} ث`; }, 500);
  if (fresh && chanceMine) buzz([60, 40, 60]);
}
// accusing: pick a sticker, then as many people as are behind it
function aqAccuseBox(S, me2) {
  const a = KL.my.acc || { tag: null, ids: [] }, t = a.tag ? aqTag(S, a.tag) : null;
  const myTeam = [PID, ...(me2.mates || [])];
  const out = new Set(S.tags.filter((x) => x.out).flatMap((x) => x.who || []));
  const people = S.players.filter((p) => !myTeam.includes(p.id));
  return `<div class="aq-acc">
    <div class="aq-pen" style="font-size:22px">فرصتك تتهم! <span class="muted" id="aqLeft"></span></div>
    <div class="aq-sheet">${S.tags.filter((x) => !x.out && x.id !== me2.tag).map((x) => `<button type="button" class="aq-stk" style="--c:${AQ_COLORS[x.c % AQ_COLORS.length]}" data-at="${x.id}" aria-pressed="${a.tag === x.id}">${x.wolf ? "🐺 " : ""}${esc(x.n)}${x.size > 1 ? ` <small>(${AR(x.size)})</small>` : ""}</button>`).join("")}</div>
    ${t ? `<p class="muted">${t.size > 1 ? `اختر ${AR(t.size)} لاعبين` : "اختر اللاعب"}:</p>
    <div class="aq-pick">${people.map((p) => `<button type="button" data-ap="${esc(p.id)}" aria-pressed="${a.ids.includes(p.id)}" ${out.has(p.id) ? "disabled" : ""}>${face(p, 44)}<span>${esc(p.name)}</span></button>`).join("")}</div>
    <button type="button" class="btn btn-marker" id="aqAcc" ${a.ids.length === t.size ? "" : "disabled"}>${a.ids.length === t.size ? `«${esc(t.n)}» ${t.size > 1 ? "هم" : "هو"} ${a.ids.map((id) => esc(who(id).name)).join(" و")}!` : "اختر"}</button>
    <p class="muted" style="text-align:center">صح: +${AR(200 + 20 * Math.max(0, S.qn - S.qi))} لك · غلط: −٥٠ لك و+١٠٠ للي اتهمته</p>` : ""}
  </div>`;
}
function aqBindAccuse(S, me2) {
  const redraw = () => aqvRes(KL.S, false);
  screen.querySelectorAll("[data-at]").forEach((b) => (b.onclick = () => { KL.my.acc = { tag: b.dataset.at, ids: [] }; beep(700, 0.04); redraw(); }));
  screen.querySelectorAll("[data-ap]").forEach((b) => (b.onclick = () => {
    const a = KL.my.acc, t = aqTag(KL.S, a.tag), id = b.dataset.ap;
    if (a.ids.includes(id)) a.ids = a.ids.filter((x) => x !== id); else { a.ids.push(id); if (a.ids.length > t.size) a.ids.shift(); }
    beep(660, 0.04); redraw();
  }));
  if ($("aqAcc")) $("aqAcc").onclick = () => { const a = KL.my.acc; $("aqAcc").disabled = true; beep(880, 0.08); act({ t: "aqacc", id: PID, tag: a.tag, ids: a.ids }); };
}

function aqvRev(S, fresh) {
  const v = S.rev, t = aqTag(S, v.tag), by = aqTag(S, v.by), me2 = aqMine();
  if (fresh) {
    clearKL();
    if (v.outcome === "hit") { beep(523, 0.08); setTimeout(() => beep(784, 0.1), 120); setTimeout(() => beep(1047, 0.2), 260); buzz(80); }
    else if (v.outcome === "part") { beep(660, 0.12); setTimeout(() => beep(660, 0.12), 180); }
    else { beep(200, 0.3, "sawtooth", 0.08); buzz([40, 30, 40]); }
  }
  setTop("الكشف");
  const names = v.ids.map((id) => esc(who(id).name)).join(" و");
  const body = v.outcome === "hit"
    ? `<div class="aq-reveal"><span class="aq-name">${aqFaces(v.ids, 56)}<span>${names}</span></span>${aqStk(t, "peel")}</div>
       <div class="aq-stamp">انكشف!</div>
       <div class="aq-pts"><span>${aqStk(by)} كشف${t.size > 1 ? "هم" : "ه"}</span><b>+${AR(200 + 20 * Math.max(0, S.qn - S.qi))}</b></div>
       <p class="muted" style="text-align:center">${t.size > 1 ? "يكملون" : "يكمل"} يجاوب${t.size > 1 ? "ون" : ""} ويجمع${t.size > 1 ? "ون" : ""} نقاط، بس محد يقدر يتهم${t.size > 1 ? "هم" : "ه"}.</p>`
    : v.outcome === "part"
      ? `<div class="aq-reveal">${aqStk(t)}<span class="aq-name">${aqFaces(v.ids, 48)}</span></div>
         <div class="aq-hint">${v.size === 2 ? "واحد منهم صح… 👀" : `${AR(v.hits)} من ${AR(v.size)} صح… 👀`}</div>
         <p class="aq-pen" style="text-align:center">الملصق باقي، بس صار فيه دليل</p>`
      : `<div class="aq-reveal">${aqStk(t)}<span class="aq-name">${aqFaces(v.ids, 48)}</span></div>
         <div class="aq-stamp miss">غلط!</div>
         <div class="aq-pts"><span>${names} ${v.ids.length > 1 ? "انتهموا" : "انتهم"} ظلم</span><b>+${AR(100)}</b></div>
         <div class="aq-pts dash"><span>${aqStk(by)}</span><b class="minus">−٥٠</b></div>`;
  show(`${aqMeLine(S)}<div class="aq-h" style="text-align:center">«${esc(t.n)}» ${t.size > 1 ? "هم" : "هو"}…</div>${body}${aqBar(S)}`);
}

function aqvEnd(S, fresh) {
  const me2 = aqMine();
  if (fresh) { clearKL(); beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); }
  setTop("انتهت");
  const myTag = S.tags.find((t) => (t.who || []).includes(PID));
  const mine = S.rank.find((x) => x.id === PID);
  const ghost = myTag && !myTag.out;
  const p = who(PID), fem = !!(p.av && Number.isInteger(p.av.k) && PEOPLE[p.av.k] && PEOPLE[p.av.k].woman), tt = (m, f) => (fem ? f : m);
  const cert = myTag ? `<div class="aq-cert">
      <span class="aq-school">مدرسة فسحة · كشف الألقاب</span>
      <span class="aq-ttl">شهادة تقدير</span>
      ${face(p, 76)}
      <span class="aq-h" style="font-size:28px">${esc(p.name)}</span>
      <span class="muted">${tt("حمل", "حملت")}${myTag.size > 1 ? tt(" مع فريقه", " مع فريقها") : ""} طوال الجلسة ${myTag.size > 1 ? "اسم" : "لقب"}</span>
      ${ghost ? `<span class="aq-stk" style="--c:${AQ_COLORS[myTag.c % AQ_COLORS.length]}">الشبح 👻 · ${esc(myTag.n)}</span><span class="muted">${tt("ولم يكتشفه أحد", "ولم يكتشفها أحد")}</span>` : `${aqStk(myTag)}<span class="muted">${tt("وانكشف", "وانكشفت")} في السؤال ${AR(myTag.outQ)}</span>`}
      <div class="aq-sign"><span>المعلم<i>فسحة</i></span><span>النقاط<i>${AR(mine ? mine.pts : 0)}</i></span></div>
    </div>` : "";
  const aw = S.awards || {};
  show(`
    ${cert}
    <div class="aq-roll end">${S.rank.map((x, k) => { const t = aqTag(S, x.tag); return `<div class="aq-r ${x.id === PID ? "me" : ""}"><span class="n">${AR(k + 1)}</span><span class="aq-rank">${face(who(x.id), 28)}<b>${esc(who(x.id).name)}</b>${aqStk(t)}${t.out ? "" : " 👻"}</span><span class="t">${AR(x.pts)}</span></div>`; }).join("")}</div>
    ${aw.sleuth ? `<div class="aq-aw"><span>أشطر محقق</span><b>${face(who(aw.sleuth.id), 24)}${esc(who(aw.sleuth.id).name)} · ${AR(aw.sleuth.n)}</b></div>` : ""}
    ${aw.framed ? `<div class="aq-aw"><span>أكثر واحد انتهم ظلم</span><b>${face(who(aw.framed.id), 24)}${esc(who(aw.framed.id).name)} · ${AR(aw.framed.n)}</b></div>` : ""}
    ${myTag ? '<button type="button" class="btn btn-marker" id="aqStory">احفظ شهادتي للستوري 📸</button><p class="muted" id="aqStoryMsg" style="text-align:center"></p>' : ""}
    ${isHost() ? '<button type="button" class="btn btn-marker" id="aqAgain">جلسة جديدة بنفس الربع</button>' : '<p class="muted" style="text-align:center">المضيف يقدر يبدأ جلسة جديدة.</p>'}
    <button type="button" class="btn btn-ghost" id="aqHome">رجوع لفسحة</button>`);
  if ($("aqAgain")) $("aqAgain").onclick = () => hostAgain();
  if ($("aqStory")) $("aqStory").onclick = () => aqShareStory({ p, fem, tag: myTag, pts: mine ? mine.pts : 0, ghost });
  $("aqHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}

// ---------------- the certificate as a story picture ----------------
// Drawn on a 1080×1920 canvas in the page's own fonts, then handed to the phone's share sheet
// (straight to Instagram where the browser allows it), the app's share bridge, or a download.
async function aqStoryCanvas({ p, fem, tag, pts, ghost }) {
  const W = 1080, Hh = 1920, cv = document.createElement("canvas"); cv.width = W; cv.height = Hh;
  const c = cv.getContext("2d"), tt = (m, f) => (fem ? f : m);
  try { await Promise.all(["700 60px Lalezar", "700 40px 'IBM Plex Sans Arabic'", "500 40px 'IBM Plex Sans Arabic'", "700 60px 'Aref Ruqaa'"].map((f) => document.fonts.load(f))); } catch (e) {}
  const D = "Lalezar, 'IBM Plex Sans Arabic', sans-serif", B = "'IBM Plex Sans Arabic', Tahoma, sans-serif", PEN = "'Aref Ruqaa', Lalezar, serif";
  const NAVY = "#1b2a4a", RED = "#c8232c";
  c.direction = "rtl"; c.textAlign = "center"; c.textBaseline = "alphabetic";
  const rr = (x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const text = (t, x, y, font, color) => { c.font = font; c.fillStyle = color; c.fillText(t, x, y); };
  // the school stage: velvet pleats, a spotlight from above, the wooden floor and the gold fringe
  for (let x = 0; x < W; x += 54) { const g = c.createLinearGradient(x, 0, x + 54, 0); g.addColorStop(0, "#4d0812"); g.addColorStop(0.55, "#8e1726"); g.addColorStop(1, "#4d0812"); c.fillStyle = g; c.fillRect(x, 0, 54, Hh); }
  c.fillStyle = "rgba(30,4,8,.35)"; c.fillRect(0, 0, W, Hh);
  const sp = c.createRadialGradient(W / 2, 0, 40, W / 2, 300, 1100); sp.addColorStop(0, "rgba(255,236,190,.45)"); sp.addColorStop(1, "rgba(255,236,190,0)"); c.fillStyle = sp; c.fillRect(0, 0, W, Hh);
  c.fillStyle = "#7a4a22"; c.fillRect(0, Hh - 300, W, 300); c.strokeStyle = "#5a3418"; c.lineWidth = 5; [Hh - 300, Hh - 200, Hh - 100].forEach((y) => { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); });
  c.fillStyle = "#6a0e19"; c.fillRect(0, 0, W, 70); c.strokeStyle = "#e0b04a"; c.lineWidth = 8; for (let x = 0; x < W; x += 60) { c.beginPath(); c.arc(x + 30, 70, 30, 0, Math.PI); c.fillStyle = "#6a0e19"; c.fill(); c.stroke(); }
  // فسحة and the game's name at the top
  rr(W / 2 - 150, 150, 300, 96, 48); c.fillStyle = "#ffc933"; c.fill(); c.lineWidth = 7; c.strokeStyle = NAVY; c.stroke();
  text("فسحة", W / 2, 222, `400 66px ${D}`, NAVY);
  text("انكشف!", W / 2, 360, `700 104px ${PEN}`, "#ffd36b");
  // the certificate
  const X = 100, Y = 430, CW = W - 200, CH = 1150;
  c.fillStyle = "#fff"; rr(X, Y, CW, CH, 10); c.fill();
  c.strokeStyle = NAVY; c.lineWidth = 6; rr(X, Y, CW, CH, 10); c.stroke();
  c.lineWidth = 3; rr(X + 22, Y + 22, CW - 44, CH - 44, 6); c.stroke();
  text("مدرسة فسحة · كشف الألقاب", W / 2, Y + 110, `700 38px ${B}`, "#5d6887");
  text("شهادة تقدير", W / 2, Y + 220, `400 104px ${D}`, NAVY);
  // the player's own character
  const svg = face(p, 340).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg[^>]*>)/, `$1<defs>${typeof PEOPLE_DEFS === "string" ? PEOPLE_DEFS : ""}</defs>`);
  try {
    const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    await img.decode(); c.drawImage(img, W / 2 - 170, Y + 260, 340, 340);
  } catch (e) {}
  text(p.name, W / 2, Y + 690, `400 96px ${D}`, NAVY);
  text(`${tt("حمل", "حملت")}${tag.size > 1 ? tt(" مع فريقه", " مع فريقها") : ""} طوال الجلسة ${tag.size > 1 ? "اسم" : "لقب"}`, W / 2, Y + 770, `500 42px ${B}`, "#5d6887");
  // the sticker
  const label = ghost ? `الشبح 👻 · ${tag.n}` : tag.n;
  c.font = `700 54px ${B}`; const tw = Math.min(CW - 140, c.measureText(label).width + 90);
  c.save(); c.translate(W / 2, Y + 860); c.rotate(-0.05);
  c.shadowColor = "rgba(27,42,74,.25)"; c.shadowBlur = 16; c.shadowOffsetY = 6;
  rr(-tw / 2 - 8, -58, tw + 16, 116, 18); c.fillStyle = "#fff"; c.fill(); c.shadowColor = "transparent";
  rr(-tw / 2, -50, tw, 100, 14); c.fillStyle = AQ_COLORS[tag.c % AQ_COLORS.length]; c.fill();
  c.fillStyle = NAVY; c.fillText(label, 0, 18, tw - 40); c.restore();
  text(ghost ? tt("ولم يكتشفه أحد", "ولم يكتشفها أحد") : `${tt("وانكشف", "وانكشفت")} في السؤال ${AR(tag.outQ || 0)}`, W / 2, Y + 975, `500 42px ${B}`, "#5d6887");
  // signatures in the teacher's red pen
  text("المعلم", X + CW - 150, Y + 1050, `500 34px ${B}`, "#5d6887"); text("فسحة", X + CW - 150, Y + 1110, `700 58px ${PEN}`, RED);
  text("النقاط", X + 150, Y + 1050, `500 34px ${B}`, "#5d6887"); text(AR(pts), X + 150, Y + 1110, `700 58px ${PEN}`, RED);
  // the stamp
  if (!ghost) { c.save(); c.translate(W / 2 + 250, Y + 330); c.rotate(-0.16); c.strokeStyle = RED; c.lineWidth = 7; rr(-150, -62, 300, 112, 16); c.stroke(); text("انكشف!", 0, 22, `700 74px ${PEN}`, RED); c.restore(); }
  text("العبوها من جوالاتكم", W / 2, 1700, `700 46px ${B}`, "#fff3e3");
  c.direction = "ltr"; text("@fos7a.games", W / 2, 1775, `700 44px ${B}`, "#ffd36b");
  return cv;
}
async function aqShareStory(d) {
  const msg = $("aqStoryMsg"), btn = $("aqStory");
  if (btn) btn.disabled = true; if (msg) msg.textContent = "نجهز الصورة…";
  try {
    const cv = await aqStoryCanvas(d);
    const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
    const file = new File([blob], "fos7a-inkashaf.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: "انكشفت في فسحة 😄 @fos7a.games" }); if (msg) msg.textContent = ""; }
    else if (window.Fos7aApp && window.Fos7aApp.shareImage) { window.Fos7aApp.shareImage(cv.toDataURL("image/png")); if (msg) msg.textContent = ""; }
    else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); if (msg) msg.textContent = "انحفظت الصورة، انشرها ستوري 📸"; }
  } catch (e) { if (msg) msg.textContent = e && e.name === "AbortError" ? "" : "ما قدرنا نجهز الصورة، صوّر الشاشة بدالها 📸"; }
  if (btn) btn.disabled = false;
}
