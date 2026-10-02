"use strict";
// ================= الكنز: a treasure hunt around the real place, with the map on the TV =================
// The host picks the places (a rest house, a camp, a school or a home), prints a card for every team at
// every place and hides them where each card says. Each team walks its own order of places: its solvers
// crack a cipher on the phone that names the next place, its seekers find the card there and scan it,
// and the scan opens the next cipher. The host's screen (on the TV) shows the map and the race.
// Codes, routes and answers stay with the host; each team hears its own cipher privately.

const KZ_TEAMS = [{ n: "الأزرق", c: "#2f6fe0" }, { n: "الأحمر", c: "#e0442f" }, { n: "الأخضر", c: "#1f9a5a" }, { n: "البنفسجي", c: "#8b4fd8" }];
const KZ_ABC = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split("");
const KZ_SYM = "★▲●◆■♥♣♠☀☾✿✚✖✦◐◑⬟⬢♦☘⚑✪◉▼◀▶✈☂".split("");
const KZ_CODE_CHARS = "ACEFHKMNPRTXY34679";
const KZ_HINT_PEN = 45, KZ_SPOT_PEN = 30; // seconds a team must wait after a hint before it can answer or scan
// a word for each letter, for the «أول حرف» cipher
const KZ_WORDS = { ا: ["أرنب", "أسد", "إبريق"], ب: ["بطة", "برتقال", "باب"], ت: ["تمر", "تفاح", "تاج"], ث: ["ثوب", "ثعلب", "ثلج"], ج: ["جمل", "جبل", "جزر"], ح: ["حليب", "حصان", "حمامة"], خ: ["خبز", "خيمة", "خروف"], د: ["دلة", "دب", "دجاج"], ذ: ["ذهب", "ذرة", "ذيل"], ر: ["رمان", "ريشة", "رز"], ز: ["زيتون", "زرافة", "زر"], س: ["سمك", "سيارة", "سرير"], ش: ["شمس", "شاي", "شجرة"], ص: ["صقر", "صحن", "صندوق"], ض: ["ضفدع", "ضوء", "ضب"], ط: ["طائرة", "طماطم", "طبل"], ظ: ["ظرف", "ظبي", "ظل"], ع: ["عنب", "عصفور", "عسل"], غ: ["غزال", "غيمة", "غرفة"], ف: ["فيل", "فراولة", "فنجال"], ق: ["قمر", "قلم", "قهوة"], ك: ["كعك", "كتاب", "كرسي"], ل: ["ليمون", "لوز", "لبن"], م: ["موز", "مفتاح", "مسطرة"], ن: ["نخلة", "نعناع", "نمر"], ه: ["هدهد", "هلال", "هدية"], و: ["وردة", "ورقة", "وسادة"], ي: ["يمامة", "يقطين", "يد"] };
// what each place looks like in emoji, for the picture cipher
const KZ_EMO = { "المجلس": "☕🛋️🫖", "المطبخ": "🍳🔪🍽️", "الغرف": "🛏️🚪💤", "غرف التغيير": "🩳🚿🧺", "المسبح": "🏊💦🛟", "ملعب الكورة": "⚽🥅👟", "ملعب الطائرة": "🏐🏖️🤾", "بيت الشعر": "⛺🐪☕", "الشبة": "🔥🪵🌙", "خيمة المطبخ": "🍲⛺🔪", "خيام النوم": "🛌⛺🌙", "خزان الماء": "💧🛢️🚰", "الطعس": "⛰️🏜️🚩", "شجرة السمر": "🌳🏜️🐫", "ساحة الطابور": "🇸🇦🧍🧍", "الفصول": "📚✏️🧑‍🏫", "المكتبة": "📖📚🤫", "المختبر": "🧪🔬🥼", "الصالة الرياضية": "🏋️🏀🤸", "المقصف": "🥪🧃💰", "الصالة": "📺🛋️🍿", "غرفة النوم": "🛏️😴🌙", "الدرج": "🪜⬆️⬇️", "غرفة الغسيل": "🧺🫧👕", "الحوش": "🌿🌳☀️" };

const kzNorm = (s) => String(s || "").replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, " ").trim();
const kzBare = (s) => kzNorm(s).split(" ").map((w) => w.replace(/^ال/, "")).join("");
const kzLetters = (name) => kzNorm(name).split(" ").map((w) => [...w]);
const kzIdx = (c) => KZ_ABC.indexOf(c);
const kzMine = () => (KL.my.kz && KL.S && KL.my.kz.sid === KL.S.sid ? KL.my.kz : null);
const kzTeamOf = (S, id) => (S.kteams && S.kteams[id] !== undefined ? S.kteams[id] : -1);
const kzClock = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return AR(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`); };
const kzStartK = (() => { try { return (new URLSearchParams(location.search).get("k") || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6); } catch (e) { return ""; } })();

// ---------- ciphers ----------
// Every cipher hides a place's name. Letter ciphers come as tokens the solvers fill in one by one.
const KZ_KINDS = ["num", "rev", "sym", "emo", "next", "shuf", "first"];
const KZ_KIND_AR = { num: "أرقام بدل الحروف", rev: "كلام مقلوب", sym: "رموز", emo: "ألغاز صور", next: "الحرف اللي بعده", shuf: "حروف مبعثرة", first: "أول حرف" };
const KZ_KIND_HOW = { num: "كل رقم ترتيب حرف في الأبجدية. شوفوا جدول الأرقام في الدليل.", rev: "الكلام مكتوب من آخره لأوله.", sym: "كل رمز حرف. الدليل يكشف حروف أكثر كل ما حليتوا محطة.", emo: "الصور تدل على المكان، وعدد الخطوط عدد حروفه.", next: "كل حرف مكانه الحرف اللي بعده في الأبجدية. ارجعوا خطوة، والعجلة في الدليل تساعدكم.", shuf: "حروف كل كلمة مخلوطة، رتبوها.", first: "خذوا أول حرف من كل كلمة." };
function kzCipher(kind, name) {
  const W = kzLetters(name);
  if (kind === "num") return { kind, pad: true, tok: W.map((w) => w.map((c) => AR(kzIdx(c) + 1))) };
  if (kind === "sym") return { kind, pad: true, tok: W.map((w) => w.map((c) => KZ_SYM[kzIdx(c)])) };
  if (kind === "next") return { kind, pad: true, tok: W.map((w) => w.map((c) => KZ_ABC[(kzIdx(c) + 1) % KZ_ABC.length])) };
  if (kind === "rev") return { kind, text: W.map((w) => w.join("")).join(" ").split("").reverse().join("") };
  if (kind === "shuf") return { kind, text: W.map((w) => { let s = w.join(""); for (let i = 0; i < 8 && s === w.join(""); i++) s = shuffled(w).join(""); return s; }).join("   ") };
  if (kind === "first") return { kind, text: W.map((w) => w.map((c) => pickOne(KZ_WORDS[c] || [c])).join(" · ")).join("   /   ") };
  return { kind: "emo", text: KZ_EMO[name] || "❓", lens: W.map((w) => w.length) };
}

ROOM_GAMES.kanz = {
  name: "الكنز", theme: "kanz", min: 3, need: "يحتاج لاعبين اثنين على الأقل غير المضيف", who: "٢ إلى ٤ فرق · تدوير وفك شفرات",
  rules: [
    "المضيف يختار الأماكن ويطبع البطاقات، وكل بطاقة مكتوب عليها وين تتخبى.",
    "كل فريق له ترتيب مختلف للأماكن. الحلّالين يفكون شفرة تقول وين المكان الجاي.",
    "الباحثين يروحون للمكان ويمسحون بطاقة لون فريقهم، والمسح يفتح الشفرة اللي بعدها.",
    "التلميحة تساعد، بس بعدها تنتظرون شوي قبل ما تجاوبون أو تمسحون. وأول فريق يخلص كل الأماكن يلقى الكنز.",
  ],
  setup(S) {
    Object.assign(S, { nt: 2, venue: "rest", mins: 30, sel: [1, 2, 3, 4, 5, 6] });
    H.kt ||= {}; H.kzHide ||= {}; H.kzTreasure ||= "";
    H.players.forEach((p) => { if (p.id !== PID && H.kt[p.id] === undefined) ROOM_GAMES.kanz.joined(p.id); });
  },
  joined(id) { if (id === PID) return; const S = H.S, n = (t) => Object.values(H.kt).filter((x) => x === t).length; let best = 0; for (let t = 1; t < (S.nt || 2); t++) if (n(t) < n(best)) best = t; H.kt[id] = best; },
  left(id) { delete H.kt[id]; },
  snap(S) {
    S.kteams = {}; H.players.forEach((p) => { if (p.id !== PID && H.kt[p.id] !== undefined) S.kteams[p.id] = Math.min(H.kt[p.id], (S.nt || 2) - 1); });
    S.elapsed = H.kzStart ? now() - H.kzStart : 0;
    S.left = H.kzEnd ? Math.max(0, H.kzEnd - now()) : 0;
    if (S.tm) for (const t of S.teams || []) S.tm[t].lock = H.kzLock && H.kzLock[t] ? Math.max(0, H.kzLock[t] - now()) : 0;
  },
  key: (S) => `${S.sid || ""}:${S.phase}`,
  on(m) {
    const S = H.S, Z = H.kz;
    if (!Z || !m.id) return;
    if (m.t === "kzwho") return kzTellOne(m.id);
    const t = H.kt[m.id];
    if (t === undefined || !S.teams.includes(t)) return;
    if (m.t === "kzrole" && (m.r === "solve" || m.r === "seek")) { Z.roles[m.id] = m.r; S.roles = { ...Z.roles }; return hostSendSoon(); }
    if (S.phase !== "play") return;
    const T = S.tm[t];
    if (T.done) return;
    if (m.t === "kzans" && T.stage === "solve") return kzAnswer(t, m.id, String(m.a || ""));
    if (m.t === "kzhint") return kzHint(t);
    if (m.t === "kzcode") return kzCode(t, m.id, String(m.k || ""));
  },
  direct(m) {
    if (m.t !== "kzme") return;
    KL.my.kz = m; KL.my.kzDirty = true;
    const v = KL.S && KL.S.game === "kanz" && ROOM_GAMES.kanz.views[KL.S.phase];
    if (v) v(KL.S, false);
  },
  lobbyPlayers(S) {
    const col = (t) => `<div class="kl-team" style="color:${KZ_TEAMS[t].c}"><b>الفريق ${KZ_TEAMS[t].n}</b>${S.players.filter((p) => kzTeamOf(S, p.id) === t).map((p) => `<button type="button" class="kl-p" data-ksw="${esc(p.id)}" ${isHost() ? "" : "disabled"}>${face(p, 30)}<span>${esc(p.name)}${p.id === PID ? " (أنت)" : ""}</span></button>`).join("") || '<span class="muted">…</span>'}</div>`;
    const host = S.players.find((p) => kzTeamOf(S, p.id) < 0);
    return `<p class="muted" style="font-weight:700;color:var(--soft)">الفرق${isHost() ? " · اضغط على لاعب ينقله للفريق اللي بعده" : ""}</p><div class="kl-teams">${Array.from({ length: S.nt }, (_, t) => col(t)).join("")}</div>${host ? `<p class="muted">${esc(host.name)} المضيف: يدير اللعبة ويعرض الخريطة، وما يلعب مع فريق.</p>` : ""}`;
  },
  lobby(S) {
    const V = KZ_MAP.VENUES[S.venue], h = (t) => `<p class="muted" style="font-weight:700;color:var(--soft)">${t}</p>`;
    const chips = (attr, list, cur, lab) => `<div class="chips pick">${list.map((v) => `<button type="button" class="chip" data-${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${lab(v)}</button>`).join("")}</div>`;
    const places = V.st.slice(1).map(([n, ic], i) => { const k = i + 1, on = S.sel.includes(k); return `<div class="kz-pl ${on ? "on" : ""}"><button type="button" class="kz-pt" data-kpl="${k}" aria-pressed="${on}"><span aria-hidden="true">${ic}</span>${n}</button>${on && isHost() ? `<input class="kz-hide" data-khd="${k}" maxlength="60" value="${esc(kzHideText(S.venue, k))}" aria-label="مكان التخبئة في ${n}">` : on ? `<small>${esc(kzHideText(S.venue, k))}</small>` : ""}</div>`; }).join("");
    return `${h("وين تلعبون؟")}${chips("kvn", Object.keys(KZ_MAP.VENUES), S.venue, (k) => KZ_MAP.VENUES[k].n)}
      ${h(`الأماكن (${AR(S.sel.length)}) · وين تتخبى البطاقة في كل مكان`)}<div class="kz-places">${places}</div>
      <p class="muted">من ٣ إلى ٧ أماكن. عدّل مكان التخبئة لو تبي، وينطبع على البطاقة.</p>
      ${h("كم فريق؟")}${chips("knt", [2, 3, 4], S.nt, (v) => AR(v))}
      ${h("حد الوقت")}${chips("kmn", [20, 30, 45, 0], S.mins, (v) => (v ? `${AR(v)} دقيقة` : "بدون"))}
      ${isHost() ? `${h("الكنز الحقيقي (اختياري)")}<input class="kz-hide" id="kzTreasure" maxlength="80" placeholder="مثلاً: في شنطة السيارة البيضاء" value="${esc(H.kzTreasure || "")}"><p class="muted">ما يطلع إلا للفريق الفائز في آخر اللعبة.</p>` : ""}`;
  },
  bindLobby(S) {
    const set = (attr, key, num) => screen.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { const v = b.dataset[attr]; H.S[key] = num ? +v : v; if (key === "venue") H.S.sel = [1, 2, 3, 4, 5, 6]; if (key === "nt") H.players.forEach((p, k) => { if (p.id !== PID) H.kt[p.id] = (k - 1 + H.S.nt) % H.S.nt; }); beep(700, 0.04); hostSend(); }));
    set("kvn", "venue", false); set("knt", "nt", true); set("kmn", "mins", true);
    screen.querySelectorAll("[data-kpl]").forEach((b) => (b.onclick = () => { const k = +b.dataset.kpl, sel = H.S.sel; H.S.sel = sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k].sort((a, c) => a - c); beep(660, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-khd]").forEach((i) => (i.onchange = () => { H.kzHide[`${H.S.venue}:${i.dataset.khd}`] = i.value.trim(); hostSend(); }));
    if ($("kzTreasure")) $("kzTreasure").oninput = (e) => (H.kzTreasure = e.target.value.trim());
    screen.querySelectorAll("[data-ksw]").forEach((b) => (b.onclick = () => { const id = b.dataset.ksw; if (id === PID) return; H.kt[id] = ((H.kt[id] ?? 0) + 1) % H.S.nt; beep(640, 0.04); hostSend(); }));
    const used = new Set(Object.values(S.kteams || {})), st = $("start");
    if (S.sel.length < 3 || S.sel.length > 7) { st.disabled = true; st.textContent = "اختر من ٣ إلى ٧ أماكن"; }
    else if (used.size < 2) { st.disabled = true; st.textContent = "يحتاج لاعب في فريقين على الأقل"; }
  },
  start: () => kzStart(),
  resume(S) {
    if (S.phase === "play") hEvery(kzTick, 1000);
    H.players.forEach((p) => kzTellOne(p.id));
  },
  views: { print: kzvPrint, play: kzvPlay, end: kzvEnd },
};
const kzHideText = (venue, k) => (H.kzHide && H.kzHide[`${venue}:${k}`]) || (KZ_MAP.VENUES[venue].hide[k - 1] || "");

// ---------- the host ----------
function kzTell(id, m) { m.to = id; if (id === PID) ROOM_GAMES.kanz.direct(m); else if (KL.net) KL.net.send(m); }
const kzMembers = (t) => H.players.map((p) => p.id).filter((id) => id !== PID && H.kt[id] === t);
function kzTellOne(id) {
  const S = H.S, Z = H.kz; if (!Z) return;
  const t = H.kt[id];
  if (id === PID || t === undefined || !S.teams.includes(t)) return kzTell(id, { t: "kzme", sid: S.sid, team: -1 });
  const T = S.tm[t], route = Z.routes[t], k = route[T.at], name = k !== undefined ? kzStName(k) : "";
  const m = { t: "kzme", sid: S.sid, team: t, at: T.at, stage: T.stage, known: Z.known[t], step: T.at };
  if (!T.done) {
    m.cipher = Z.cipher[t]; m.reveal = Z.reveal[t]; m.revealText = kzRevealText(t);
    if (T.stage === "seek") { m.place = name; m.ic = kzStIc(k); m.spot = Z.spot[t] ? kzHideText(S.venue, k) : ""; }
  } else if (T.rank === 1 && H.kzTreasure && S.phase === "end") m.treasure = H.kzTreasure;
  kzTell(id, m);
}
const kzTellTeam = (t) => kzMembers(t).forEach(kzTellOne);
const kzStName = (k) => KZ_MAP.VENUES[H.S.venue].st[k][0];
const kzStIc = (k) => KZ_MAP.VENUES[H.S.venue].st[k][1];
function kzNewCode(used) { let c; do { c = Array.from({ length: 4 }, () => pickOne(KZ_CODE_CHARS.split(""))).join(""); } while (used.has(c)); used.add(c); return c; }

function kzStart() {
  hClear();
  const S = H.S, teams = [...new Set(H.players.filter((p) => p.id !== PID).map((p) => H.kt[p.id] ?? 0))].filter((t) => t < S.nt).sort();
  const base = shuffled(S.sel.slice()), n = base.length, used = new Set();
  // every team walks the same places, each starting at a different one, so they don't follow each other
  const routes = {}, codes = {};
  teams.forEach((t, i) => { routes[t] = base.map((_, j) => base[(j + i * Math.max(1, Math.floor(n / teams.length))) % n]); codes[t] = {}; S.sel.forEach((k) => (codes[t][k] = kzNewCode(used))); });
  // the symbol key starts with a few letters; every place solved adds its letters
  const known = {}; teams.forEach((t) => (known[t] = shuffled(KZ_ABC).slice(0, 4)));
  H.kz = { routes, codes, known, roles: {}, cipher: {}, reveal: {}, spot: {}, kindAt: {} };
  Object.assign(S, { sid: Math.random().toString(36).slice(2, 8), phase: "print", teams, n, roles: {}, feed: [], winner: -1,
    tm: Object.fromEntries(teams.map((t) => [t, { at: 0, stage: "solve", hints: 0, pen: 0, done: false, doneAt: 0, last: 0, rank: 0 }])) });
  teams.forEach((t, i) => kzSetCipher(t, i));
  H.kzStart = 0; H.kzEnd = 0; H.kzLock = {};
  hostSend();
  H.players.forEach((p) => kzTellOne(p.id));
}
function kzSetCipher(t, offset = 0) {
  const S = H.S, Z = H.kz, T = S.tm[t], k = Z.routes[t][T.at];
  if (k === undefined) return;
  const kind = KZ_KINDS[(T.at + (offset || t)) % KZ_KINDS.length];
  Z.cipher[t] = kzCipher(kind, kzStName(k)); Z.reveal[t] = []; Z.spot[t] = false;
}
function kzGo() { // the cards are hidden: the hunt starts
  const S = H.S; if (S.phase !== "print") return;
  S.phase = "play"; H.kzStart = now(); H.kzEnd = S.mins ? now() + S.mins * 60000 : 0;
  kzFeed("🏁 بدأ البحث!");
  hostSend(); H.players.forEach((p) => kzTellOne(p.id));
  hEvery(kzTick, 1000);
}
function kzTick() { const S = H.S; if (S.phase !== "play") return hClear(); if (H.kzEnd && now() >= H.kzEnd) return kzEnd(); hostSendSoon(); }
function kzFeed(text, t = -1) { const S = H.S; S.feed = [{ text, t, at: now() - (H.kzStart || now()) }, ...S.feed].slice(0, 8); }
function kzAnswer(t, id, a) {
  const S = H.S, Z = H.kz, T = S.tm[t], name = kzStName(Z.routes[t][T.at]);
  if (kzLocked(t)) return kzTell(id, { ...kzMeOf(t), bad: "locked" });
  if (kzBare(a) !== kzBare(name)) { kzTell(id, { ...kzMeOf(t), wrong: a }); return; }
  T.stage = "seek"; kzLearn(t, name);
  kzFeed(`🔓 الفريق ${KZ_TEAMS[t].n} فك الشفرة`, t);
  beep(880, 0.05); hostSend(); kzTellTeam(t);
}
const kzMeOf = (t) => { const id = kzMembers(t)[0]; const m = {}; if (id) { const S = H.S, Z = H.kz, T = S.tm[t]; Object.assign(m, { t: "kzme", sid: S.sid, team: t, at: T.at, stage: T.stage, known: Z.known[t], cipher: Z.cipher[t], reveal: Z.reveal[t], revealText: kzRevealText(t) }); } return m; };
const kzLocked = (t) => H.kzLock && H.kzLock[t] > now();
function kzLockFor(t, sec) { H.kzLock[t] = Math.max(H.kzLock[t] || 0, now()) + sec * 1000; hLater(() => { hostSend(); kzTellTeam(t); }, sec * 1000 + 50); }
function kzRevealText(t) {
  const S = H.S, Z = H.kz, k = Z.routes[t][S.tm[t].at]; if (k === undefined) return "";
  let i = 0; return kzLetters(kzStName(k)).map((w) => w.map((c) => (Z.reveal[t].includes(i++) ? c : "ـ")).join(" ")).join("   ");
}
function kzLearn(t, name) { const Z = H.kz, k = new Set(Z.known[t]); kzLetters(name).flat().forEach((c) => k.add(c)); Z.known[t] = [...k]; }
function kzHint(t) {
  const S = H.S, Z = H.kz, T = S.tm[t], name = kzStName(Z.routes[t][T.at]);
  if (T.stage === "solve") {
    const L = kzLetters(name).flat(), hidden = L.map((_, i) => i).filter((i) => !Z.reveal[t].includes(i));
    if (Z.reveal[t].length >= 2 || !hidden.length) return;
    const i = Z.reveal[t].length ? pickOne(hidden) : 0; Z.reveal[t].push(i);
    const k = new Set(Z.known[t]); k.add(L[i]); Z.known[t] = [...k];
    T.pen += KZ_HINT_PEN; T.hints++; kzLockFor(t, KZ_HINT_PEN); kzFeed(`💡 الفريق ${KZ_TEAMS[t].n} أخذ تلميحة`, t);
  } else if (T.stage === "seek" && !Z.spot[t]) { Z.spot[t] = true; T.pen += KZ_SPOT_PEN; T.hints++; kzLockFor(t, KZ_SPOT_PEN); kzFeed(`🔦 الفريق ${KZ_TEAMS[t].n} سأل وين بالضبط`, t); }
  hostSend(); kzTellTeam(t);
}
function kzCode(t, id, raw) {
  const S = H.S, Z = H.kz, T = S.tm[t], code = raw.toUpperCase().replace(/^.*[?&]K=/, "").replace(/[^A-Z0-9]/g, "").slice(0, 4);
  const k = Z.routes[t][T.at];
  if (code === Z.codes[t][k]) { if (kzLocked(t)) return kzTell(id, { ...kzMeOf(t), bad: "locked" }); return kzFound(t); }
  // whose card is it?
  for (const u of S.teams) for (const kk of S.sel) if (Z.codes[u][kk] === code) { kzTell(id, { ...kzMeOf(t), bad: u === t ? "early" : "other", badTeam: u }); return; }
  kzTell(id, { ...kzMeOf(t), bad: "wrong" });
}
function kzFound(t) {
  const S = H.S, Z = H.kz, T = S.tm[t], k = Z.routes[t][T.at];
  if (T.stage === "solve") kzLearn(t, kzStName(k)); // found it without solving: lucky them
  T.last = k; T.at++;
  kzFeed(`📍 الفريق ${KZ_TEAMS[t].n} لقى بطاقة ${kzStName(k)}`, t);
  if (T.at >= S.n) {
    T.done = true; T.doneAt = now() - H.kzStart; T.stage = "done";
    T.rank = S.teams.filter((u) => S.tm[u].done).length;
    if (T.rank === 1) { S.winner = t; kzFeed(`🏆 الفريق ${KZ_TEAMS[t].n} لقى الكنز!`, t); }
    beep(523, 0.1); setTimeout(() => beep(784, 0.2), 130);
    if (S.teams.every((u) => S.tm[u].done)) return kzEnd();
  } else { T.stage = "solve"; kzSetCipher(t); }
  hostSend(); kzTellTeam(t);
}
function kzEnd() {
  hClear();
  const S = H.S; if (S.phase === "end") return;
  const el = now() - (H.kzStart || now());
  S.rank = S.teams.slice().sort((a, b) => { const A = S.tm[a], B = S.tm[b]; if (A.done !== B.done) return A.done ? -1 : 1; if (A.done) return A.rank - B.rank; return B.at - A.at || A.pen - B.pen; });
  S.rank.forEach((t, i) => { if (!S.tm[t].done) S.tm[t].rank = i + 1; });
  S.final = el; S.phase = "end"; H.kzEnd = 0;
  S.treasure = !!H.kzTreasure;
  hostSend(); H.players.forEach((p) => kzTellOne(p.id));
}

// ---------- every phone ----------
function kzAsk4Me() { if (!kzMine() && now() - (KL.my.kzAskedAt || 0) > 2500) { KL.my.kzAskedAt = now(); act({ t: "kzwho", id: PID }); } }
const kzChip = (t) => `<span class="kz-chip" style="--c:${KZ_TEAMS[t].c}">${KZ_TEAMS[t].n}</span>`;
const kzBeads = (S, t) => `<span class="kz-beads" style="--c:${KZ_TEAMS[t].c}">${Array.from({ length: S.n }, (_, i) => `<i class="${i < S.tm[t].at ? "on" : ""}"></i>`).join("")}</span>`;

// The cards: one per team per place, grouped by place so the host hides them walking once around.
function kzCards(S) {
  const Z = H.kz, url = (code) => `${location.origin}${location.pathname}?r=${S.code}&k=${code}`;
  return S.sel.map((k) => ({ k, name: kzStName(k), ic: kzStIc(k), spot: kzHideText(S.venue, k), cards: S.teams.map((t) => ({ t, code: Z.codes[t][k], url: url(Z.codes[t][k]) })) }));
}
const kzQr = (text) => { try { const q = qrcode(0, "M"); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { return ""; } };
const kzPretty = (c) => `${c.slice(0, 2)}·${c.slice(2)}`;

function kzvPrint(S, fresh) {
  kzAsk4Me();
  if (fresh) { clearKL(); beep(620, 0.08); }
  setTop("التجهيز");
  if (isHost()) {
    const groups = kzCards(S);
    show(`
      <div class="kz-h">خبّوا البطاقات</div>
      <p class="muted">${AR(groups.length)} أماكن × ${AR(S.teams.length)} فرق = ${AR(groups.length * S.teams.length)} بطاقة. اطبعها، وامشِ على الأماكن، وخبّ بطاقات كل مكان في المكان المكتوب عليها.</p>
      <div class="kz-row2"><button type="button" class="btn btn-marker" id="kzPrintA4">اطبع على ورق A4</button><button type="button" class="btn btn-ghost" id="kzLabels">ملصقات للطابعة الصغيرة</button></div>
      <div class="kz-groups">${groups.map((g) => `<div class="kz-group"><div class="kz-gh"><span aria-hidden="true">${g.ic}</span><b>${g.name}</b><small>📍 ${esc(g.spot)}</small></div><div class="kz-gc">${g.cards.map((c) => `<div class="kz-card" style="--c:${KZ_TEAMS[c.t].c}"><span>${KZ_TEAMS[c.t].n}</span><div class="kz-qr">${kzQr(c.url)}</div><b>${kzPretty(c.code)}</b></div>`).join("")}</div></div>`).join("")}</div>
      <div class="kz-roles">${S.teams.map((t) => kzRoleLine(S, t)).join("")}</div>
      <button type="button" class="btn btn-marker" id="kzGo">خبّيتها كلها، يلا نبدأ! 🏁</button>`);
    $("kzGo").onclick = () => kzGo();
    $("kzPrintA4").onclick = () => kzPrintSheet(S, groups);
    $("kzLabels").onclick = () => kzLabelSheet(S, groups);
    return;
  }
  const me2 = kzMine(), t = me2 ? me2.team : -1;
  if (t < 0) return show(`<div class="kz-card-big"><div class="kz-h">المضيف يخبّي البطاقات…</div><p class="muted">تتفرج على هالجولة.</p></div>`);
  const role = (S.roles || {})[PID];
  show(`
    <div class="kz-card-big" style="--c:${KZ_TEAMS[t].c}">
      <div class="kz-team">${kzChip(t)}<span class="muted">${AR(S.n)} أماكن، ترتيبكم يختلف عن باقي الفرق</span></div>
      <div class="kz-h">وش دورك؟</div>
      <div class="kz-role-pick">
        <button type="button" data-kr="solve" aria-pressed="${role === "solve"}"><span aria-hidden="true">🧠</span><b>أحل الشفرات</b><small>تقعد مع الجوال وتفك الشفرة اللي تقول وين المكان</small></button>
        <button type="button" data-kr="seek" aria-pressed="${role === "seek"}"><span aria-hidden="true">🔦</span><b>أدوّر البطاقات</b><small>تروح للمكان وتلقى البطاقة وتمسحها</small></button>
      </div>
      ${kzRoleLine(S, t)}
      <p class="muted">المضيف يخبّي البطاقات الحين. لا تلحقونه 😄</p>
    </div>`);
  screen.querySelectorAll("[data-kr]").forEach((b) => (b.onclick = () => { beep(660, 0.05); act({ t: "kzrole", id: PID, r: b.dataset.kr }); }));
}
function kzRoleLine(S, t) {
  const ids = Object.keys(S.kteams || {}).filter((id) => S.kteams[id] === t), r = S.roles || {};
  const list = (k) => ids.filter((id) => r[id] === k).map((id) => face(who(id), 24)).join("") || '<span class="muted">—</span>';
  return `<div class="kz-rl" style="--c:${KZ_TEAMS[t].c}">${kzChip(t)}<span>🧠 ${list("solve")}</span><span>🔦 ${list("seek")}</span></div>`;
}

// A4: the browser's print dialog, with only the cards on the page
function kzPrintSheet(S, groups) {
  let el = $("kzPrintArea"); if (!el) { el = document.createElement("div"); el.id = "kzPrintArea"; document.body.appendChild(el); }
  el.innerHTML = groups.map((g) => g.cards.map((c) => `<div class="kzp-card" style="--c:${KZ_TEAMS[c.t].c}"><div class="kzp-head"><b>الكنز</b><span>الفريق ${KZ_TEAMS[c.t].n}</span></div><div class="kzp-qr">${kzQr(c.url)}</div><div class="kzp-code">${kzPretty(c.code)}</div><div class="kzp-spot">📍 ${g.name}: ${esc(g.spot)}</div></div>`).join("")).join("");
  document.body.classList.add("kz-printing");
  const done = () => document.body.classList.remove("kz-printing");
  window.addEventListener("afterprint", done, { once: true });
  try { window.print(); } catch (e) {}
  setTimeout(done, 60000);
}
// Labels for the pocket thermal printers: one black-and-white picture per card, 40×30 mm
function kzLabelCanvas(c, g) {
  const W = 480, Hh = 360, cv = document.createElement("canvas"); cv.width = W; cv.height = Hh;
  const x = cv.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, W, Hh); x.fillStyle = "#000";
  try { const q = qrcode(0, "M"); q.addData(c.url); q.make(); const n = q.getModuleCount(), s = Math.floor(250 / n); for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(16 + k * s, 16 + r * s, s, s); } catch (e) {}
  x.direction = "rtl"; x.textAlign = "right";
  x.font = "700 40px Lalezar, 'IBM Plex Sans Arabic', sans-serif"; x.fillText("الكنز", W - 18, 56);
  x.font = "700 30px 'IBM Plex Sans Arabic', sans-serif"; x.fillText(`الفريق ${KZ_TEAMS[c.t].n}`, W - 18, 104);
  x.fillRect(W - 186, 122, 168, 6);
  x.direction = "ltr"; x.textAlign = "center"; x.font = "700 40px ui-monospace, monospace"; x.fillText(kzPretty(c.code), 360, 190);
  x.direction = "rtl"; x.textAlign = "right"; x.font = "600 24px 'IBM Plex Sans Arabic', sans-serif";
  const line = `${g.name}: ${g.spot}`, words = line.split(" "); let row = "", y = 300;
  const rows = []; words.forEach((w) => { const t = row ? row + " " + w : w; if (x.measureText(t).width > W - 36) { rows.push(row); row = w; } else row = t; }); rows.push(row);
  rows.slice(0, 2).forEach((r, i) => x.fillText(r, W - 18, y + i * 30 - (rows.length > 1 ? 15 : 0)));
  return cv;
}
async function kzLabelSheet(S, groups) {
  const items = groups.flatMap((g) => g.cards.map((c) => ({ c, g })));
  const urls = items.map(({ c, g }) => kzLabelCanvas(c, g).toDataURL("image/png"));
  KL.my.kzLabels = urls;
  const box = document.createElement("div"); box.className = "kz-overlay"; box.id = "kzOverlay";
  box.innerHTML = `<div class="kz-ov-in"><div class="kz-h" style="font-size:24px">ملصقات ٤٠×٣٠ مم</div><p class="muted">افتح تطبيق الطابعة (Niimbot أو Phomemo)، واطبع الصور من ألبوم الجوال. الصور بالأبيض والأسود ومكتوب عليها اسم الفريق.</p>
    <button type="button" class="btn btn-marker" id="kzShareAll">احفظ الصور (${AR(urls.length)})</button><p class="muted" id="kzShareMsg"></p>
    <div class="kz-labels">${urls.map((u) => `<img src="${u}" alt="ملصق">`).join("")}</div><button type="button" class="btn btn-ghost" id="kzOvClose">رجوع</button></div>`;
  document.body.appendChild(box);
  $("kzOvClose").onclick = () => box.remove();
  $("kzShareAll").onclick = async () => {
    const msg = $("kzShareMsg");
    try {
      const files = await Promise.all(urls.map(async (u, i) => new File([await (await fetch(u)).blob()], `kanz-${i + 1}.png`, { type: "image/png" })));
      if (navigator.canShare && navigator.canShare({ files })) { await navigator.share({ files }); msg.textContent = ""; return; }
      if (window.Fos7aApp && window.Fos7aApp.shareImage) { urls.forEach((u) => window.Fos7aApp.shareImage(u)); return; }
      files.forEach((f) => { const a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); });
      msg.textContent = "انحفظت الصور ✓";
    } catch (e) { msg.textContent = e && e.name === "AbortError" ? "" : "ما قدرنا نحفظها كلها، اضغط مطوّل على كل صورة واحفظها"; }
  };
}

// ---------- the hunt ----------
function kzvPlay(S, fresh) {
  kzAsk4Me();
  if (isHost()) return kzvTV(S, fresh);
  const me2 = kzMine(), t = me2 ? me2.team : -1;
  if (t < 0) return kzvTV(S, fresh);
  const T = S.tm[t];
  if (fresh) { clearKL(); KL.my.kzTab = null; KL.my.kzPad = null; }
  // only the clock moves: keep the screen (and the camera) as it is
  if (!fresh && !KL.my.kzDirty && $("kzClock")) { $("kzClock").textContent = kzClock(kzElapsed(S)); return; }
  const prevKey = KL.my.kzKey, key = `${me2.at}:${me2.stage}`;
  if (prevKey !== key) { KL.my.kzKey = key; KL.my.kzPad = null; KL.my.kzTab = me2.stage === "seek" ? "scan" : (S.roles || {})[PID] === "seek" ? "scan" : "cipher"; if (prevKey) { beep(me2.stage === "seek" ? 880 : 660, 0.08); buzz(60); } }
  KL.my.kzDirty = false;
  const tab = KL.my.kzTab || "cipher";
  setTop(T.done ? "خلصتوا!" : `المكان ${AR(Math.min(T.at + 1, S.n))} من ${AR(S.n)}`);
  if (T.done) { kzStopCam(); return show(`<div class="kz-card-big" style="--c:${KZ_TEAMS[t].c}"><div class="kz-team">${kzChip(t)}${kzBeads(S, t)}</div><div class="kz-big">🧰✨</div><div class="kz-h" style="text-align:center">${T.rank === 1 ? "لقيتوا الكنز أول واحد! 🏆" : `خلصتوا، ترتيبكم ${AR(T.rank)}`}</div><p class="muted" style="text-align:center">وقتكم: ${kzClock(T.doneAt)}</p><p class="muted" style="text-align:center">استنوا الباقين، النتيجة تطلع على الشاشة.</p></div>`); }
  const tabs = `<div class="kz-tabs" role="tablist">${[["cipher", "🧠 الشفرة"], ["guide", "📖 الدليل"], ["scan", "🔦 البطاقة"]].map(([k, l]) => `<button type="button" role="tab" data-kt="${k}" aria-selected="${tab === k}">${l}</button>`).join("")}</div>`;
  const head = `<div class="kz-team">${kzChip(t)}${kzBeads(S, t)}<span class="kz-clock" id="kzClock">${kzClock(S.elapsed)}</span></div>`;
  let body = "";
  if (tab === "cipher") body = me2.stage === "seek" ? `<div class="kz-solved"><span aria-hidden="true">${me2.ic}</span><div><small>فكّيتوها! المكان:</small><b>${esc(me2.place)}</b></div></div><p class="muted">الباحثين يروحون الحين يدورون بطاقة ${KZ_TEAMS[t].n}.</p>` : kzCipherView(me2);
  if (tab === "guide") body = `<div class="seg kz-seg">${[["num", "أرقام"], ["sym", "رموز"], ["wheel", "العجلة"]].map(([k, l]) => `<button type="button" data-kg="${k}" aria-pressed="${(KL.my.kzGuide || "sym") === k}">${l}</button>`).join("")}</div><div id="kzGuide"></div>`;
  if (tab === "scan") body = kzScanView(me2);
  const lock = T.lock > 0 ? `<p class="kz-lock" id="kzLockMsg">⏳ تلميحة: ما تقدرون تجاوبون أو تمسحون لين يخلص العد <b id="kzLockN">${AR(Math.ceil(T.lock / 1000))}</b> ث</p>` : "";
  show(`${head}${lock}${tabs}${body}${me2.wrong ? `<p class="kz-bad">«${esc(me2.wrong)}» مو صح، جرّبوا مرة ثانية</p>` : ""}${me2.bad ? `<p class="kz-bad">${me2.bad === "other" ? `هذي بطاقة الفريق ${KZ_TEAMS[me2.badTeam].n} 😏 خلّوها مكانها` : me2.bad === "early" ? "هذي بطاقتكم، بس مو وقتها. ارجعوا لها بعدين 😉" : me2.bad === "locked" ? "انتظروا لين يخلص وقت التلميحة ⏳" : "الكود غلط، تأكدوا منه"}</p>` : ""}`);
  screen.querySelectorAll("[data-kt]").forEach((b) => (b.onclick = () => { KL.my.kzTab = b.dataset.kt; KL.my.kzDirty = true; if (b.dataset.kt !== "scan") kzStopCam(); kzvPlay(KL.S, false); }));
  if (tab === "cipher" && me2.stage === "solve") kzBindCipher(me2);
  if (tab === "guide") { screen.querySelectorAll("[data-kg]").forEach((b) => (b.onclick = () => { KL.my.kzGuide = b.dataset.kg; KL.my.kzDirty = true; kzvPlay(KL.S, false); })); kzGuide(KL.my.kzGuide || "sym", me2); }
  if (tab === "scan") kzBindScan(me2);
  if (fresh) klEvery(() => { const s = KL.S, el = $("kzClock"); if (s && s.phase === "play" && el && s.tm[t]) el.textContent = kzClock(kzElapsed(s)); const ln = $("kzLockN"); if (ln) { const left = Math.ceil((s.tm[t].lock - (now() - (KL.my.kzElAt || now()))) / 1000); ln.textContent = AR(Math.max(0, left)); } }, 1000);
  // a card scanned with the phone's own camera opens the room with its code: use it once
  if (kzStartK && !KL.my.kzUsedK && !T.done) { KL.my.kzUsedK = true; act({ t: "kzcode", id: PID, k: kzStartK }); }
}
// the snapshot carries the elapsed time; between snapshots the phone keeps counting
function kzElapsed(s) { if (KL.my.kzElBase !== s.elapsed) { KL.my.kzElBase = s.elapsed; KL.my.kzElAt = now(); } return s.elapsed + (now() - (KL.my.kzElAt || now())); }

function kzCipherView(me2) {
  const c = me2.cipher, L = [...(me2.reveal || [])];
  const pattern = me2.reveal && me2.reveal.length ? `<p class="kz-hint">💡 ${kzPattern(me2)}</p>` : "";
  let inner;
  if (c.pad) {
    const known = new Set(c.kind === "sym" ? me2.known : []);
    const flat = c.tok.flat(), pad = KL.my.kzPad || (KL.my.kzPad = c.tok.map((w) => w.map(() => "")));
    // letters the guide already knows go in by themselves (symbols only)
    if (c.kind === "sym") c.tok.forEach((w, wi) => w.forEach((s, ci) => { const ch = KZ_ABC[KZ_SYM.indexOf(s)]; if (known.has(ch) && !pad[wi][ci]) pad[wi][ci] = ch; }));
    const sel = KL.my.kzSel || [0, 0];
    inner = `<div class="kz-pad">${c.tok.map((w, wi) => w.map((s, ci) => `<div class="kz-cell"><button type="button" data-pw="${wi}" data-pc="${ci}" aria-pressed="${sel[0] === wi && sel[1] === ci}">${s}</button><span>${esc(pad[wi][ci])}</span></div>`).join("")).join('<div class="kz-gap"></div>')}</div>
      <div class="kz-kbd">${KZ_ABC.map((ch) => `<button type="button" data-ch="${ch}">${ch}</button>`).join("")}<button type="button" data-ch="" aria-label="امسح">⌫</button></div>`;
    void flat;
  } else {
    inner = `<div class="kz-ctext">${esc(c.text)}</div>${c.kind === "emo" ? `<div class="kz-lens">${c.lens.map((n) => Array.from({ length: n }, () => "<i></i>").join("")).join("<b></b>")}</div>` : ""}`;
  }
  return `<div class="kz-cipher"><span class="kz-kind">${KZ_KIND_AR[c.kind]}</span>${inner}<small>${KZ_KIND_HOW[c.kind]}</small></div>${pattern}
    <form class="kz-ans" id="kzAnsF"><input id="kzAns" maxlength="30" autocomplete="off" placeholder="وين المكان؟" value="${esc(c.pad ? (KL.my.kzPad || []).map((w) => w.join("")).join(" ").trim() : (KL.my.kzTyped || ""))}"><button type="submit" class="btn btn-marker">تحقق</button></form>
    <button type="button" class="btn btn-ghost" id="kzHint" ${L.length >= 2 ? "disabled" : ""}>💡 تلميحة: حرف من الجواب (تنتظرون ${AR(KZ_HINT_PEN)} ث)</button>`;
}
const kzPattern = (me2) => `<span dir="rtl">${esc(me2.revealText || "")}</span>`;
function kzBindCipher(me2) {
  const c = me2.cipher;
  if (c.pad) {
    screen.querySelectorAll("[data-pw]").forEach((b) => (b.onclick = () => { KL.my.kzSel = [+b.dataset.pw, +b.dataset.pc]; KL.my.kzDirty = true; kzvPlay(KL.S, false); }));
    screen.querySelectorAll("[data-ch]").forEach((b) => (b.onclick = () => {
      const pad = KL.my.kzPad, sel = KL.my.kzSel || [0, 0]; if (!pad) return;
      pad[sel[0]][sel[1]] = b.dataset.ch; beep(700, 0.03);
      if (b.dataset.ch) { const order = pad.flatMap((w, wi) => w.map((_, ci) => [wi, ci])); const i = order.findIndex(([a, b2]) => a === sel[0] && b2 === sel[1]); const nx = order.slice(i + 1).find(([a, b2]) => !pad[a][b2]); if (nx) KL.my.kzSel = nx; }
      KL.my.kzDirty = true; kzvPlay(KL.S, false);
    }));
  } else $("kzAns").oninput = (e) => (KL.my.kzTyped = e.target.value);
  $("kzAnsF").onsubmit = (e) => { e.preventDefault(); const a = $("kzAns").value.trim(); if (!a) return; beep(760, 0.05); act({ t: "kzans", id: PID, a }); };
  $("kzHint").onclick = () => { $("kzHint").disabled = true; act({ t: "kzhint", id: PID }); };
}

// the decoder guide: numbers, the symbols this team has learned so far, and the letter wheel
function kzGuide(kind, me2) {
  const el = $("kzGuide"); if (!el) return;
  if (kind === "num") el.innerHTML = `<p class="muted">كل حرف ورقمه في الأبجدية:</p><div class="kz-g28">${KZ_ABC.map((c, i) => `<span>${c}<small>${AR(i + 1)}</small></span>`).join("")}</div>`;
  if (kind === "sym") { const k = new Set(me2.known || []); el.innerHTML = `<p class="muted">انكشف ${AR(k.size)} من ٢٨. كل مكان تلقونه يكشف حروفه هنا:</p><div class="kz-g28">${KZ_ABC.map((c, i) => `<span class="${k.has(c) ? "" : "lock"}">${KZ_SYM[i]}<small>${k.has(c) ? c : "؟"}</small></span>`).join("")}</div>`; }
  if (kind === "wheel") {
    let n = KL.my.kzWheel ?? 1;
    el.innerHTML = `<div class="kz-wheel"><p class="muted">لشفرة «الحرف اللي بعده»: لف الدائرة. كل حرف برا يقابله حله جوا.</p><svg viewBox="-150 -150 300 300" id="kzWheel"></svg><div class="kz-wctl"><button type="button" id="kzWl" aria-label="لف">↻</button><span id="kzWn"></span><button type="button" id="kzWr" aria-label="لف للجهة الثانية">↺</button></div></div>`;
    const draw = () => {
      const ring = (r, col, size) => KZ_ABC.map((c, i) => { const a = (i * 360 / 28 - 90) * Math.PI / 180; return `<text x="${(r * Math.cos(a)).toFixed(1)}" y="${(r * Math.sin(a) + 6).toFixed(1)}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${col}">${c}</text>`; }).join("");
      $("kzWheel").innerHTML = `<circle r="146" fill="#fff4dc" stroke="#3a2810" stroke-width="3"/><circle r="112" fill="#3a2810"/><circle r="80" fill="#fff4dc"/>${ring(128, "#3a2810", 16)}<g style="transition:transform .3s" transform="rotate(${-n * 360 / 28})">${ring(96, "#ffe08a", 15)}</g><path d="M0 -150 L-8 -136 L8 -136Z" fill="#b3261e"/><text y="-8" text-anchor="middle" font-size="14" fill="#3a2810" font-weight="700">برا = الشفرة</text><text y="14" text-anchor="middle" font-size="14" fill="#3a2810" font-weight="700">جوا = الحل</text>`;
      $("kzWn").textContent = `الإزاحة: ${AR(n)}`; KL.my.kzWheel = n; };
    draw(); $("kzWl").onclick = () => { n = (n + 27) % 28; draw(); }; $("kzWr").onclick = () => { n = (n + 1) % 28; draw(); };
  }
}

// ---------- the card: camera scan or typing the code ----------
function kzScanView(me2) {
  const seek = me2.stage === "seek";
  return `${seek ? `<div class="kz-solved"><span aria-hidden="true">${me2.ic}</span><div><small>روحوا:</small><b>${esc(me2.place)}</b>${me2.spot ? `<em>📍 ${esc(me2.spot)}</em>` : ""}</div></div>` : `<p class="muted">الحلّالين ما فكّوا الشفرة للحين. إذا لقيتوا بطاقتكم بالصدفة امسحوها! 😉</p>`}
    <div class="kz-cam" id="kzCam"><video id="kzVideo" playsinline muted></video><div class="kz-frame"></div><button type="button" class="btn btn-marker" id="kzCamOn">📷 افتح الكاميرا وامسح البطاقة</button><p id="kzCamMsg"></p></div>
    <form class="kz-ans" id="kzCodeF"><input id="kzCode" maxlength="8" dir="ltr" autocomplete="off" placeholder="أو اكتب الكود: K7·M2"><button type="submit" class="btn btn-marker">فتح</button></form>
    ${seek ? `<button type="button" class="btn btn-ghost" id="kzSpot" ${me2.spot ? "disabled" : ""}>🔦 وين بالضبط؟ (تنتظرون ${AR(KZ_SPOT_PEN)} ث)</button>` : ""}`;
}
function kzBindScan(me2) {
  $("kzCodeF").onsubmit = (e) => { e.preventDefault(); const k = $("kzCode").value.trim(); if (k) { beep(760, 0.05); act({ t: "kzcode", id: PID, k }); } };
  if ($("kzSpot")) $("kzSpot").onclick = () => { $("kzSpot").disabled = true; act({ t: "kzhint", id: PID }); };
  $("kzCamOn").onclick = () => kzStartCam();
  if (KL.my.kzCamOn) kzStartCam();
}
async function kzStartCam() {
  const msg = $("kzCamMsg"), v = $("kzVideo"); if (!v) return;
  try {
    if (!KL.my.kzStream) KL.my.kzStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    v.srcObject = KL.my.kzStream; await v.play(); KL.my.kzCamOn = true; $("kzCam").classList.add("on");
    const det = "BarcodeDetector" in window ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null;
    if (!det && !window.jsQR) await new Promise((ok, no) => { const s = document.createElement("script"); s.src = "vendor/jsqr.js"; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    const cv = document.createElement("canvas"), cx = cv.getContext("2d", { willReadFrequently: true });
    clearInterval(KL.my.kzScanT);
    KL.my.kzScanT = setInterval(async () => {
      if (!v.videoWidth || KL.my.kzBusy) return;
      KL.my.kzBusy = true;
      try {
        let text = "";
        if (det) { const r = await det.detect(v); if (r[0]) text = r[0].rawValue; }
        else { const w = 480, h = Math.round(480 * v.videoHeight / v.videoWidth); cv.width = w; cv.height = h; cx.drawImage(v, 0, 0, w, h); const r = window.jsQR(cx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" }); if (r) text = r.data; }
        if (text && text !== KL.my.kzLastScan) { KL.my.kzLastScan = text; setTimeout(() => (KL.my.kzLastScan = ""), 4000); buzz(40); beep(990, 0.06); act({ t: "kzcode", id: PID, k: text }); }
      } catch (e) {}
      KL.my.kzBusy = false;
    }, 300);
  } catch (e) { if (msg) msg.textContent = "ما قدرنا نفتح الكاميرا. اسمحوا للموقع يستخدمها، أو اكتبوا الكود اللي تحت الباركود."; }
}
function kzStopCam() { clearInterval(KL.my.kzScanT); if (KL.my.kzStream) { KL.my.kzStream.getTracks().forEach((t) => t.stop()); KL.my.kzStream = null; } KL.my.kzCamOn = false; }

// ---------- the host's screen: the map and the race (put it on the TV) ----------
function kzvTV(S, fresh) {
  if (fresh) { clearKL(); }
  setTop(S.phase === "play" ? "الخريطة" : "");
  const board = S.teams.slice().sort((a, b) => (S.tm[b].done - S.tm[a].done) || (S.tm[b].at - S.tm[a].at) || (S.tm[a].pen - S.tm[b].pen)).map((t, i) => `<div class="kz-rb" style="--c:${KZ_TEAMS[t].c}"><span class="rk">${AR(i + 1)}</span><div><b>${KZ_TEAMS[t].n}</b><small>${S.tm[t].done ? "🏆 خلّص!" : S.tm[t].at ? `آخر مكان: ${esc(KZ_MAP.VENUES[S.venue].st[S.tm[t].last][0])}` : "في البداية"}${S.tm[t].lock ? " · ⏳" : ""}</small>${kzBeads(S, t)}</div></div>`).join("");
  const feed = (S.feed || []).slice(0, 5).map((f) => `<p>${esc(f.text)}</p>`).join("");
  if (!fresh && $("kzMapWrap")) { $("kzBoard").innerHTML = board + `<div class="kz-feed">${feed}</div>`; $("kzTvClock").textContent = S.left ? `باقي ${kzClock(S.left)}` : kzClock(S.elapsed); KZ_MAP.flags(S); return; }
  show(`<div class="kz-tv"><div class="kz-tvbar"><b>الكنز · ${KZ_MAP.VENUES[S.venue].t}</b><span id="kzTvClock">${S.left ? `باقي ${kzClock(S.left)}` : kzClock(S.elapsed)}</span></div>
    <div class="kz-tvbody"><div id="kzMapWrap">${KZ_MAP.svg(S)}</div><aside class="kz-board" id="kzBoard">${board}<div class="kz-feed">${feed}</div></aside></div></div>
    ${isHost() ? `<div class="kz-row2"><button type="button" class="btn btn-ghost" id="kzFull">⛶ ملء الشاشة</button><button type="button" class="btn btn-ghost" id="kzStop">إنهاء اللعبة</button></div><p class="muted">اربط الجوال بالتلفزيون (أو افتح نفس الغرفة من جهاز ثاني) عشان الكل يشوف الخريطة.</p>` : ""}`);
  KZ_MAP.steps(S); KZ_MAP.flags(S);
  if ($("kzStop")) { let armed = false; $("kzStop").onclick = () => { if (!armed) { armed = true; $("kzStop").textContent = "متأكد؟ اضغط مرة ثانية"; return; } kzEnd(); }; }
  if ($("kzFull")) $("kzFull").onclick = () => { const el = document.querySelector(".kz-tv"); try { el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen && el.webkitRequestFullscreen(); } catch (e) {} };
}

function kzvEnd(S, fresh) {
  kzAsk4Me(); kzStopCam();
  if (fresh) { clearKL(); beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.3), 240); }
  setTop("الكنز");
  const me2 = kzMine(), w = S.winner;
  const treasure = (isHost() && H.kzTreasure) || (me2 && me2.treasure);
  show(`<div class="kz-end">
      <div class="kz-big">🧰✨</div>
      <div class="kz-h" style="text-align:center;color:${w >= 0 ? KZ_TEAMS[w].c : "inherit"}">${w >= 0 ? `الفريق ${KZ_TEAMS[w].n} لقى الكنز!` : "خلص الوقت قبل ما أحد يلقى الكنز"}</div>
      ${treasure ? `<div class="kz-treasure">الكنز الحقيقي: <b>${esc(treasure)}</b></div>` : S.treasure && w >= 0 ? `<p class="muted" style="text-align:center">مكان الكنز الحقيقي وصل لجوالات الفريق الفائز 👀</p>` : ""}
      <div class="kz-ranks">${S.rank.map((t, i) => `<div class="kz-rk" style="--c:${KZ_TEAMS[t].c}"><span class="rk">${AR(i + 1)}</span>${kzChip(t)}<span>${S.tm[t].done ? kzClock(S.tm[t].doneAt) : `${AR(S.tm[t].at)} من ${AR(S.n)}`}</span><small>${S.tm[t].hints ? `${AR(S.tm[t].hints)} تلميحة` : "بدون تلميحات"}</small></div>`).join("")}</div>
    </div>
    ${isHost() ? '<button type="button" class="btn btn-marker" id="kzAgain">جولة جديدة بنفس الأماكن</button>' : '<p class="muted" style="text-align:center">المضيف يقدر يبدأ جولة جديدة.</p>'}
    <button type="button" class="btn btn-ghost" id="kzHome">رجوع لفسحة</button>`);
  if ($("kzAgain")) $("kzAgain").onclick = () => hostAgain();
  $("kzHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}

// ---------- the map on the TV ----------
// Four venues drawn as isometric dioramas; the host's screen shows the selected places, the trail and the teams.
const KZ_MAP = (() => {
// ---------- the maps ----------
const SUN = `<radialGradient id="sun" cx=".82" cy=".05" r=".9"><stop offset="0" stop-color="#fff2c4" stop-opacity=".7"/><stop offset=".55" stop-color="#ffd27a" stop-opacity=".1"/><stop offset="1" stop-color="#7a4a10" stop-opacity=".28"/></radialGradient>`;
const DEFS = `<defs>${SUN}
  <filter id="sh" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="6" dy="9" stdDeviation="5" flood-color="#4a2e0c" flood-opacity=".35"/></filter>
  <linearGradient id="water" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fe3f3"/><stop offset=".6" stop-color="#2fb0d3"/><stop offset="1" stop-color="#1b7fa6"/></linearGradient>
  <pattern id="mow" width="56" height="10" patternUnits="userSpaceOnUse"><rect width="56" height="10" fill="#3d9a4a"/><rect width="28" height="10" fill="#48a957"/></pattern>
  <pattern id="tent" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(90)"><rect width="16" height="16" fill="#2b231c"/><rect width="8" height="16" fill="#3a3027"/></pattern>
  <pattern id="sadu" width="24" height="12" patternUnits="userSpaceOnUse"><rect width="24" height="12" fill="#a3261f"/><path d="M0 6 L6 0 L12 6 L18 0 L24 6 L18 12 L12 6 L6 12Z" fill="#f2e1b6"/><path d="M6 6 L9 3 L12 6 L9 9Z" fill="#1d1712"/></pattern>
  <pattern id="deck" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#efe6d2"/><path d="M0 0H24V24" fill="none" stroke="#d8cbb0" stroke-width="2"/></pattern>
  <pattern id="carpet" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#9e2b25"/><path d="M9 2 L16 9 L9 16 L2 9Z" fill="#c9862b"/><circle cx="9" cy="9" r="2" fill="#f2e1b6"/></pattern>
  <pattern id="wood" width="60" height="14" patternUnits="userSpaceOnUse"><rect width="60" height="14" fill="#c99a63"/><path d="M0 13.5H60M30 0V14" stroke="#b5864f" stroke-width="1.5"/></pattern>
  <pattern id="tiles" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#ece6dc"/><path d="M0 0H30V30" fill="none" stroke="#d3cabb" stroke-width="2"/></pattern>
  <pattern id="asph" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#c9c2b4"/><circle cx="5" cy="6" r="1" fill="#b3ab9b"/><circle cx="14" cy="15" r="1.2" fill="#d8d2c5"/></pattern>
  <radialGradient id="fire"><stop offset="0" stop-color="#fff3b0"/><stop offset=".4" stop-color="#ffb030"/><stop offset="1" stop-color="#e2541a" stop-opacity="0"/></radialGradient>
  <radialGradient id="rays"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
</defs>`;
let seed = 7; const rnd = (a, b) => { seed = (seed * 9301 + 49297) % 233280; return a + (seed / 233280) * (b - a); };
const speck = (n, c1, c2) => { seed = 11; let s = ""; for (let i = 0; i < n; i++) s += `<circle cx="${rnd(0, 1200).toFixed(0)}" cy="${rnd(0, 700).toFixed(0)}" r="${rnd(.8, 2.4).toFixed(1)}" fill="${rnd(0, 1) > .5 ? c1 : c2}" opacity=".7"/>`; return s; };
// Four venues drawn as isometric dioramas on a 1000×1000 plan. Everything is placed in plan coordinates
// (x right-down, y left-down, z up) and projected, then painted back to front.
const P = (x, y, z = 0) => [600 + (x - y) * 0.56, 105 + (x + y) * 0.285 - z];
const pts = (a) => a.map(([x, y, z]) => P(x, y, z).map((v) => v.toFixed(1)).join(",")).join(" ");
const poly = (a, fill, extra = "") => `<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;
let scene = [];
const put = (k, svg) => scene.push({ k, svg });
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f)))); return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join(""); };
// a flat patch of ground (drawn under everything, in the order given)
let ground = [];
const gq = (x, y, w, d, fill, z = 0, extra = "") => ground.push(poly([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], fill, extra));
const gline = (x1, y1, x2, y2, c = "#fff", sw = 3, z = 0) => { const a = P(x1, y1, z), b = P(x2, y2, z); ground.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${sw}"/>`); };
const gcirc = (cx, cy, r, fill, z = 0, extra = "") => ground.push(poly(Array.from({ length: 28 }, (_, i) => [cx + r * Math.cos(i * Math.PI / 14), cy + r * Math.sin(i * Math.PI / 14), z]), fill, extra));
// a box with a roof colour and wall colour; faces toward the viewer only
function box(x, y, w, d, h, wall, top, opt = {}) {
  let s = poly([[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]], shade(wall, .92)) + poly([[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]], shade(wall, .74)) + poly([[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]], top);
  if (opt.parapet) s += poly([[x + 6, y + 6, h + .1], [x + w - 6, y + 6, h + .1], [x + w - 6, y + d - 6, h + .1], [x + 6, y + d - 6, h + .1]], shade(top, .9));
  if (opt.win) { const [n, c, rows] = opt.win; for (let r = 0; r < (rows || 1); r++) for (let i = 0; i < n; i++) { const u0 = (i + .25) * w / n, u1 = (i + .75) * w / n, v0 = h * (r + .35) / (rows || 1), v1 = h * (r + .7) / (rows || 1); s += poly([[x + u0, y + d, v0], [x + u1, y + d, v0], [x + u1, y + d, v1], [x + u0, y + d, v1]], c); } }
  if (opt.rwin) { const [n, c, rows] = opt.rwin; for (let r = 0; r < (rows || 1); r++) for (let i = 0; i < n; i++) { const u0 = (i + .25) * d / n, u1 = (i + .75) * d / n, v0 = h * (r + .35) / (rows || 1), v1 = h * (r + .7) / (rows || 1); s += poly([[x + w, y + u0, v0], [x + w, y + u1, v0], [x + w, y + u1, v1], [x + w, y + u0, v1]], shade(c, .85)); } }
  if (opt.door) { const [u, c] = opt.door; s += poly([[x + u, y + d, 0], [x + u + 26, y + d, 0], [x + u + 26, y + d, Math.min(44, h * .75)], [x + u, y + d, Math.min(44, h * .75)]], c); }
  put(x + w + y + d - (opt.back || 0), s);
}
// a gable roof (tents, sheds): ridge along x
function gable(x, y, w, d, h, r, roof, wall, side) {
  let s = poly([[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]], wall) + poly([[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]], shade(wall, .8));
  s += poly([[x, y, h], [x + w, y, h], [x + w, y + d / 2, h + r], [x, y + d / 2, h + r]], shade(roof, .82)) + poly([[x, y + d, h], [x + w, y + d, h], [x + w, y + d / 2, h + r], [x, y + d / 2, h + r]], roof) + poly([[x + w, y, h], [x + w, y + d, h], [x + w, y + d / 2, h + r]], side || shade(roof, .7));
  put(x + w + y + d, s);
}
function cyl(cx, cy, r, h, side, top) { const [X, Y] = P(cx, cy, 0), [, Yt] = P(cx, cy, h), rx = r * .79, ry = r * .4;
  put(cx + cy + r, `<rect x="${X - rx}" y="${Yt}" width="${2 * rx}" height="${Y - Yt}" fill="${side}"/><ellipse cx="${X}" cy="${Y}" rx="${rx}" ry="${ry}" fill="${side}"/><ellipse cx="${X}" cy="${Yt}" rx="${rx}" ry="${ry}" fill="${top}"/><ellipse cx="${X}" cy="${Yt}" rx="${rx * .7}" ry="${ry * .7}" fill="none" stroke="${shade(top, 1.2)}" stroke-width="3"/>`); }
function palm(x, y, h = 90) { const [X, Y] = P(x, y, 0), [, Yt] = P(x, y, h);
  put(x + y, `<ellipse cx="${X + 24}" cy="${Y + 4}" rx="34" ry="11" fill="#000" opacity=".16"/><path d="M${X} ${Y} Q ${X + 8} ${(Y + Yt) / 2} ${X + 2} ${Yt}" stroke="#7a5530" stroke-width="7" fill="none" stroke-linecap="round"/><g transform="translate(${X + 2} ${Yt})">${[0, 40, 80, 130, 180, 220, 260, 310].map((a, i) => `<path d="M0 0 Q 22 -14 40 6 Q 20 0 0 0" fill="${i % 2 ? "#2f7d3a" : "#46a052"}" transform="rotate(${a})"/>`).join("")}<circle r="5" fill="#7a5530"/></g>`); }
function tree(x, y, h = 50, r = 26, c = "#4f9a3f", flat) { const [X, Y] = P(x, y, 0), [, Yt] = P(x, y, h);
  put(x + y, `<ellipse cx="${X + 18}" cy="${Y + 4}" rx="${r * 1.1}" ry="${r * .45}" fill="#000" opacity=".16"/><rect x="${X - 3}" y="${Yt}" width="6" height="${Y - Yt}" fill="#6b4a25"/>${flat ? `<ellipse cx="${X}" cy="${Yt}" rx="${r * 1.5}" ry="${r * .5}" fill="${c}"/><ellipse cx="${X - 6}" cy="${Yt - 4}" rx="${r}" ry="${r * .3}" fill="${shade(c, 1.2)}"/>` : `<circle cx="${X}" cy="${Yt - r * .6}" r="${r}" fill="${c}"/><circle cx="${X - r * .35}" cy="${Yt - r}" r="${r * .45}" fill="${shade(c, 1.25)}"/>`}`); }
function car(x, y, c, along = "x") { const w = along === "x" ? 70 : 34, d = along === "x" ? 34 : 70; box(x, y, w, d, 14, c, shade(c, 1.05)); box(x + (along === "x" ? 16 : 4), y + (along === "x" ? 4 : 16), along === "x" ? 34 : 26, along === "x" ? 26 : 34, 26, "#33454f", "#253944"); }
function umbrella(x, y, c) { const [X, Y] = P(x, y, 0), [, Yt] = P(x, y, 60); put(x + y + 1, `<ellipse cx="${X + 20}" cy="${Y + 2}" rx="28" ry="10" fill="#000" opacity=".15"/><rect x="${X - 1.5}" y="${Yt}" width="3" height="${Y - Yt}" fill="#555"/><path d="M${X - 34} ${Yt + 8} Q ${X} ${Yt - 22} ${X + 34} ${Yt + 8} Q ${X} ${Yt + 18} ${X - 34} ${Yt + 8}Z" fill="${c}"/><path d="M${X - 34} ${Yt + 8} Q ${X - 12} ${Yt - 10} ${X} ${Yt - 7} L ${X} ${Yt + 13}Z" fill="#fff" opacity=".45"/>`); }
function fire(x, y) { const [X, Y] = P(x, y, 0); put(x + y, `<ellipse cx="${X}" cy="${Y}" rx="40" ry="20" fill="#7d756a"/><ellipse cx="${X}" cy="${Y}" rx="30" ry="14" fill="#3a2a1e"/><g class="flame"><path d="M${X - 14} ${Y} Q ${X - 12} ${Y - 30} ${X} ${Y - 46} Q ${X + 12} ${Y - 30} ${X + 14} ${Y} Z" fill="#ff9a2a"/><path d="M${X - 7} ${Y} Q ${X - 6} ${Y - 18} ${X} ${Y - 28} Q ${X + 6} ${Y - 18} ${X + 7} ${Y} Z" fill="#ffe27a"/></g><circle cx="${X}" cy="${Y - 10}" r="70" fill="url(#fire)" opacity=".55"/>`); }
function dome(x, y, r, c) { const [X, Y] = P(x, y, 0); put(x + y + r, `<ellipse cx="${X + 12}" cy="${Y + 4}" rx="${r * 1.05}" ry="${r * .42}" fill="#000" opacity=".18"/><path d="M${X - r * .8} ${Y} A ${r * .8} ${r * .75} 0 0 1 ${X + r * .8} ${Y} Z" fill="${c}"/><path d="M${X - r * .8} ${Y} A ${r * .8} ${r * .75} 0 0 1 ${X} ${Y - r * .75} L ${X} ${Y}Z" fill="#fff" opacity=".18"/><path d="M${X - r * .25} ${Y} Q ${X} ${Y - r * .35} ${X + r * .25} ${Y}Z" fill="${shade(c, .55)}"/>`); }
function lights(a) { const ps = a.map(([x, y]) => P(x, y, 70)); put(Math.max(...a.map(([x, y]) => x + y)), `<path d="M${ps.map((p) => p.join(" ")).join(" L")}" stroke="#4a3220" stroke-width="1.5" fill="none"/>${ps.map((p, i) => `<circle class="bulb" style="animation-delay:${(i % 5) * -.4}s" cx="${p[0]}" cy="${p[1] + 4}" r="4" fill="#ffe08a"/>`).join("")}${a.map(([x, y]) => { const b = P(x, y, 0), t = P(x, y, 72); return `<line x1="${b[0]}" y1="${b[1]}" x2="${t[0]}" y2="${t[1]}" stroke="#5a3a20" stroke-width="3"/>`; }).join("")}`); }
function wallRing(h, col, gate) { // the compound wall; the front walls stay low so the inside shows
  box(0, -16, 1000, 16, h, col, shade(col, 1.08), { back: 5000 }); box(-16, -16, 16, 1016, h, col, shade(col, 1.08), { back: 5000 });
  box(1000, -16, 14, 1016, 22, col, shade(col, 1.08), { back: 2000 }); const [g0, g1] = gate; box(-16, 1000, g0 + 16, 14, 22, col, shade(col, 1.08), { back: 2000 }); box(g1, 1000, 1014 - g1, 14, 22, col, shade(col, 1.08), { back: 2000 }); }
function hill(cx, cy, r, c) { for (let i = 0; i < 6; i++) { const rr = r * (1 - i * .15); put(cx + cy - r + i, poly(Array.from({ length: 30 }, (_, k) => [cx + rr * Math.cos(k * Math.PI / 15), cy + rr * Math.sin(k * Math.PI / 15), i * 12]), shade(c, 1 + i * .04), `stroke="${shade(c, 1.15)}" stroke-width="2"`)); } }

const VENUES = {
  rest: { n: "استراحة", t: "رحلة الاستراحة", chest: [420, 430], bg: "#e3c58a", fl: "#efd7a2",
    st: [["البوابة", "🚪", 660, 1000], ["المجلس", "☕", 200, 690], ["المطبخ", "🍳", 520, 760], ["الغرف", "🛏️", 230, 140], ["غرف التغيير", "🩳", 600, 130], ["المسبح", "🏊", 640, 450], ["ملعب الكورة", "⚽", 880, 230], ["ملعب الطائرة", "🏐", 880, 610]],
    hide: ["تحت المخدة الثالثة على يمين الباب", "ورا علبة الشاي في الدولاب الأعلى", "فوق المراية في الغرفة الأولى", "على باب الغرفة الثالثة من جوا", "تحت الكرسي الأقرب للسلّم", "ملصقة ورا العارضة اليسار", "مربوطة في عمود الشبكة من تحت"],
    build() {
      wallRing(46, "#d9b98a", [600, 720]);
      // the pool on its deck
      gq(480, 330, 300, 240, "#efe6d2"); gq(500, 350, 260, 200, "url(#water)", -2); for (let i = 0; i < 4; i++) gline(515, 380 + i * 42, 745, 380 + i * 42, "rgba(255,255,255,.45)", 2);
      gcirc(570, 420, 22, "#ff6fa1"); gcirc(570, 420, 12, "url(#water)"); gq(690, 470, 50, 18, "#ffd23f");
      // the football pitch and the volleyball court
      gq(780, 40, 200, 380, "url(#mow)"); gline(795, 55, 965, 55); gline(965, 55, 965, 405); gline(965, 405, 795, 405); gline(795, 405, 795, 55); gline(795, 230, 965, 230); gcirc(880, 230, 30, "none", 0, 'stroke="#fff" stroke-width="3"');
      gq(780, 470, 200, 280, "#f0cf86"); gline(795, 485, 965, 485); gline(965, 485, 965, 735); gline(965, 735, 795, 735); gline(795, 735, 795, 485);
      // the majlis seating in front of the tent
      gq(70, 640, 280, 150, "url(#carpet)"); gq(70, 640, 280, 14, "#7d1f1a"); gq(70, 776, 280, 14, "#7d1f1a");
      box(790, 112, 10, 40, 34, "#ffffff", "#ffffff"); box(790, 308, 10, 40, 34, "#ffffff", "#ffffff"); // goals
      box(800, 606, 6, 6, 56, "#3a2810", "#3a2810"); box(950, 606, 6, 6, 56, "#3a2810", "#3a2810"); put(1560, poly([[803, 609, 30], [953, 609, 30], [953, 609, 56], [803, 609, 56]], "rgba(255,255,255,.55)", 'stroke="#3a2810" stroke-width="1"'));
      gable(70, 470, 280, 160, 46, 40, "#2b231c", "#3a3027", "#1d1712"); put(1000, poly([[70, 630, 0], [350, 630, 0], [350, 630, 14], [70, 630, 14]], "url(#sadu)"));
      fire(210, 715); box(250, 690, 18, 14, 18, "#d4a330", "#e8b84a");
      box(60, 60, 360, 150, 92, "#f3e2c0", "#e7cfa2", { parapet: 1, win: [5, "#8fb3d9"], door: [40, "#8a5a33"] }); box(110, 80, 40, 26, 20, "#dfe6ea", "#eef2f4"); box(250, 90, 40, 26, 20, "#dfe6ea", "#eef2f4");
      box(470, 60, 220, 110, 74, "#5f97ad", "#7fb0c4", { parapet: 1, win: [4, "#ffe7a3"] });
      box(440, 680, 170, 150, 76, "#fbf4e4", "#e0d2b4", { parapet: 1, win: [2, "#9ad0e8"], door: [110, "#8a5a33"] }); box(570, 700, 20, 20, 30, "#6b4a25", "#7a5530");
      lights([[120, 600], [260, 590], [400, 560], [470, 520]]);
      umbrella(500, 600, "#ff8a3d"); umbrella(760, 330, "#2f9be0"); box(520, 580, 50, 18, 8, "#ffffff", "#f4f4f4"); box(700, 590, 50, 18, 8, "#ffffff", "#f4f4f4");
      palm(40, 420); palm(430, 260, 80); palm(330, 900); palm(860, 880, 100); palm(980, 440, 80); palm(130, 940, 70);
      car(560, 880, "#ffffff"); car(760, 900, "#c62d2d");
    } },

  camp: { n: "مخيم", t: "ليلة المخيم", chest: [470, 420], bg: "#d99a52", fl: "#e5ae66",
    st: [["السيارات", "🚙", 140, 900], ["بيت الشعر", "⛺", 260, 520], ["الشبة", "🔥", 560, 640], ["خيمة المطبخ", "🍲", 820, 800], ["خيام النوم", "🛌", 860, 440], ["خزان الماء", "💧", 640, 150], ["الطعس", "⛰️", 880, 160], ["شجرة السمر", "🌳", 300, 160]],
    hide: ["تحت المساند في الزاوية اليسار", "تحت أبعد كرسي عن النار", "داخل كرتون التمر", "في جيب باب الخيمة البرتقالية", "تحت الجالون الأزرق", "مدفونة شوي عند العصا في راس الطعس", "مربوطة في أوطى غصن"],
    build() {
      for (let i = 0; i < 14; i++) ground.push(`<path d="M${P(-100, i * 80)[0]} ${P(-100, i * 80)[1]} Q ${P(500, i * 80 - 60)[0]} ${P(500, i * 80 - 60)[1]} ${P(1100, i * 80)[0]} ${P(1100, i * 80)[1]}" stroke="#f0c47e" stroke-width="3" fill="none" opacity=".5"/>`);
      gcirc(520, 520, 470, "none", 0, 'stroke="#a8763f" stroke-width="5" stroke-dasharray="2 16" stroke-linecap="round"');
      hill(880, 160, 150, "#cf8f45"); box(878, 158, 4, 4, 130, "#3a2810", "#3a2810"); put(2000, poly([[882, 160, 128], [930, 160, 120], [882, 160, 108]], "#1f9a5a"));
      gq(90, 620, 340, 150, "url(#carpet)"); gq(90, 620, 340, 12, "#7d1f1a");
      gable(90, 420, 340, 190, 50, 44, "#2b231c", "#3a3027", "#1d1712"); put(1050, poly([[90, 610, 0], [430, 610, 0], [430, 610, 16], [90, 610, 16]], "url(#sadu)"));
      box(370, 640, 18, 14, 18, "#d4a330", "#e8b84a");
      fire(560, 640); [0, 1, 2, 3, 4, 5, 6].forEach((i) => { const a = i * Math.PI * 2 / 7; box(560 + 95 * Math.cos(a) - 12, 640 + 95 * Math.sin(a) - 12, 24, 24, 16, ["#2f6fe0", "#e0442f", "#1f9a5a", "#f2b230"][i % 4], shade(["#2f6fe0", "#e0442f", "#1f9a5a", "#f2b230"][i % 4], 1.15)); });
      gable(720, 720, 220, 150, 50, 40, "#efe1c0", "#e3d2ab"); box(740, 880, 60, 30, 26, "#b9814a", "#c99258");
      dome(800, 380, 80, "#f07b2e"); dome(930, 470, 70, "#2e8ad6"); dome(840, 560, 66, "#2e9e5b");
      cyl(640, 150, 70, 80, "#3b8fd4", "#5aa8e6"); box(730, 200, 22, 30, 32, "#f2b230", "#ffc94d"); box(760, 210, 22, 30, 32, "#2e8ad6", "#4aa3ea");
      tree(300, 160, 70, 34, "#6f8f3a", 1); tree(480, 110, 60, 28, "#7a9a40", 1); tree(80, 230, 55, 26, "#6f8f3a", 1);
      lights([[430, 560], [560, 520], [700, 520], [800, 520]]);
      car(70, 860, "#f4f1ea"); car(170, 940, "#2b2b2b");
    } },

  school: { n: "مدرسة", t: "يوم في المدرسة", chest: [500, 470], bg: "#bfb7a8", fl: "#d5cebf",
    st: [["البوابة", "🚌", 160, 1000], ["ساحة الطابور", "🇸🇦", 500, 600], ["الفصول", "📚", 420, 160], ["المكتبة", "📖", 150, 330], ["المختبر", "🧪", 150, 560], ["الصالة الرياضية", "🏋️", 880, 180], ["ملعب الكورة", "⚽", 880, 560], ["المقصف", "🥪", 560, 860]],
    hide: ["ورا علم الطابور، ملصقة على العمود", "تحت درج المعلم في فصل ٢/أ", "بين صفحات أكبر قاموس", "تحت المجهر الثاني", "في جيب كيس الكور", "ورا العارضة اليمين", "ورا لوحة الأسعار"],
    build() {
      wallRing(40, "#e2d6bf", [90, 250]);
      gq(300, 300, 420, 420, "#e7e1d4"); for (let i = 0; i < 6; i++) gline(330, 350 + i * 55, 690, 350 + i * 55, "#fff", 4);
      gq(780, 400, 200, 330, "url(#mow)"); gline(795, 415, 965, 415); gline(965, 415, 965, 715); gline(965, 715, 795, 715); gline(795, 715, 795, 415); gline(795, 565, 965, 565); gcirc(880, 565, 26, "none", 0, 'stroke="#fff" stroke-width="3"');
      gq(300, 760, 200, 160, "#f0cf86"); gline(310, 840, 490, 840, "#3a2810", 3);
      box(790, 470, 10, 40, 30, "#fff", "#fff"); box(790, 620, 10, 40, 30, "#fff", "#fff");
      box(305, 836, 5, 5, 46, "#3a2810", "#3a2810"); box(490, 836, 5, 5, 46, "#3a2810", "#3a2810"); put(1400, poly([[308, 839, 24], [493, 839, 24], [493, 839, 46], [308, 839, 46]], "rgba(255,255,255,.5)", 'stroke="#3a2810" stroke-width="1"'));
      box(60, 40, 700, 150, 140, "#f7efe0", "#e6dccb", { parapet: 1, win: [12, "#8fbde8", 2], door: [330, "#2f6fe0"] }); box(60, 40, 700, 22, 141, "#2f6fe0", "#2f6fe0");
      [0, 1, 2].forEach((i) => box(330 + i * 140, 220, 110, 50, 70, "#9fb3ba", "#e8f0f2"));
      box(40, 250, 200, 170, 90, "#efe4f8", "#d9c6ee", { parapet: 1, win: [4, "#8b4fd8"], rwin: [3, "#b796ec"] });
      box(40, 470, 200, 170, 90, "#e6f4ea", "#c4e3cd", { parapet: 1, win: [4, "#1f9a5a"], rwin: [3, "#7cc796"] });
      box(780, 40, 200, 300, 120, "#f3dcc8", "#e0763a", { win: [3, "#ffe7a3"], rwin: [5, "#ffe7a3"], door: [80, "#8a5a33"] }); for (let i = 0; i < 6; i++) put(1321 + i, poly([[780, 40 + i * 50, 120.5], [980, 40 + i * 50, 120.5], [980, 44 + i * 50, 120.5], [780, 44 + i * 50, 120.5]], "#c45f2a"));
      box(520, 780, 160, 120, 60, "#fff6e0", "#f2b230", { door: [60, "#8a5a33"] }); for (let i = 0; i < 8; i++) put(1401, poly([[520 + i * 20, 900, 60], [530 + i * 20, 900, 60], [530 + i * 20, 920, 46], [520 + i * 20, 920, 46]], i % 2 ? "#ffffff" : "#e0442f"));
      box(560, 940, 70, 16, 10, "#8a5a33", "#a06a3e"); box(650, 940, 70, 16, 10, "#8a5a33", "#a06a3e");
      box(497, 597, 6, 6, 170, "#8a8f94", "#8a8f94"); put(2000, `<g class="flagw">${poly([[503, 600, 168], [503, 680, 168], [503, 680, 120], [503, 600, 120]], "#1f7a3e")}</g>`);
      box(60, 900, 180, 60, 40, "#f5c400", "#ffd42e", { win: [5, "#2a3a44"] });
      tree(270, 470, 50, 22); tree(740, 780, 50, 22); tree(980, 900, 60, 26); tree(260, 960, 40, 20);
    } },

  home: { n: "بيت", t: "مغامرة في البيت", chest: [500, 590], bg: "#7fb86a", fl: "#8fc77a",
    st: [["المدخل", "🚪", 470, 840], ["المجلس", "🫖", 220, 600], ["الصالة", "📺", 500, 610], ["المطبخ", "🍳", 710, 600], ["غرفة النوم", "🛏️", 230, 230], ["الدرج", "🪜", 470, 220], ["غرفة الغسيل", "🧺", 690, 230], ["الحوش", "🌿", 920, 560]],
    hide: ["داخل الكيس اللي فيه الأكواب الورقية", "تحت الريموت… لا، ورا التلفزيون", "في الفريزر داخل علبة آيس كريم فاضية", "تحت المخدة اليمين", "تحت الدرجة الخامسة", "في جيب أي ثوب على المنشر", "تحت أصيص الريحان"],
    build() {
      gq(820, 0, 180, 1000, "#7ab364"); gq(860, 760, 120, 240, "#c9c2b4");
      // floors
      gq(100, 100, 280, 280, "url(#wood)"); gq(380, 100, 180, 280, "url(#tiles)"); gq(560, 100, 240, 280, "url(#tiles)");
      gq(100, 380, 280, 420, "url(#carpet)"); gq(380, 380, 240, 420, "url(#wood)"); gq(620, 380, 180, 420, "url(#tiles)");
      const W = "#efe3cc", T = "#fff6e4";
      // back walls tall, inner walls medium, front walls low (a dollhouse cut)
      box(86, 86, 728, 14, 90, W, T, { back: 5000 }); box(86, 86, 14, 728, 90, W, T, { back: 5000 });
      box(366, 100, 14, 230, 60, W, T); box(546, 100, 14, 230, 60, W, T); box(100, 366, 220, 14, 60, W, T); box(420, 366, 380, 14, 60, W, T);
      box(366, 440, 14, 360, 60, W, T); box(606, 380, 14, 160, 60, W, T); box(606, 640, 14, 160, 60, W, T);
      // bedroom
      box(140, 140, 180, 150, 26, "#f6f2ea", "#8fb3e8"); box(140, 140, 180, 40, 34, "#e8dcc8", "#fff"); box(320, 120, 40, 220, 80, "#b5864f", "#c99a63");
      // stairs
      for (let i = 0; i < 9; i++) box(400, 130 + i * 24, 140, 24, 8 + i * 8, "#efe6d2", "#d8cbb0");
      // laundry
      box(590, 130, 60, 60, 54, "#ffffff", "#f1f4f5"); box(670, 130, 60, 60, 54, "#ffffff", "#f1f4f5"); put(400, `<ellipse cx="${P(620, 190, 30)[0]}" cy="${P(620, 190, 30)[1]}" rx="14" ry="12" fill="#bcd7e6"/><ellipse cx="${P(700, 190, 30)[0]}" cy="${P(700, 190, 30)[1]}" rx="14" ry="12" fill="#bcd7e6"/>`); [0, 1, 2, 3].forEach((i) => box(600 + i * 45, 300, 30, 6, 40, ["#ff8fa3", "#8fc7ff", "#ffd27a", "#9be3b5"][i], "#fff"));
      // majlis
      box(110, 400, 250, 26, 22, "#d9b25a", "#e6c46e"); box(110, 426, 26, 360, 22, "#d9b25a", "#e6c46e"); box(190, 560, 100, 60, 18, "#6b4a25", "#7a5530"); box(220, 575, 16, 12, 16, "#d4a330", "#e8b84a");
      // living room
      box(400, 420, 200, 40, 34, "#4a6b8a", "#5a7fa2"); box(400, 460, 40, 160, 34, "#4a6b8a", "#5a7fa2"); box(470, 540, 90, 60, 18, "#8a5a33", "#a06a3e"); box(420, 760, 180, 20, 40, "#2a2a2a", "#1a1a1a");
      // kitchen
      box(640, 400, 140, 40, 46, "#a8b4b8", "#c3ccd0"); box(740, 440, 40, 260, 46, "#a8b4b8", "#c3ccd0"); box(640, 700, 60, 50, 90, "#e9eef0", "#ffffff"); box(650, 520, 70, 50, 34, "#c99a63", "#d8ab72");
      // garden: swing, flowers, car
      tree(900, 120, 70, 34); tree(940, 360, 60, 28, "#5aa64a"); [0, 1, 2, 3, 4].forEach((i) => gcirc(900 + i * 14, 560 + (i % 2) * 14, 8, "#e85d75"));
      box(880, 640, 6, 6, 70, "#7a5530", "#7a5530"); box(960, 640, 6, 6, 70, "#7a5530", "#7a5530"); box(880, 640, 86, 6, 6, "#7a5530", "#7a5530", { back: -70 });
      car(880, 820, "#ffffff", "y");
    } },
};


function catmull(ps) { let d = `M${ps[0][0]} ${ps[0][1]}`; for (let i = 0; i < ps.length - 1; i++) { const p0 = ps[i - 1] || ps[i], p1 = ps[i], p2 = ps[i + 1], p3 = ps[i + 2] || p2; d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`; } return d; }
const stations = (S) => VENUES[S.venue].st.map(([n, ic, x, y], k) => ({ n, ic, k, p: P(x, y, 0) }));
function svg(S) {
  const V = VENUES[S.venue], ST = stations(S), sel = ST.filter((s) => S.sel.includes(s.k)), C = P(V.chest[0], V.chest[1], 0);
  scene = []; ground = []; V.build(); scene.sort((a, b) => a.k - b.k);
  const label = (s, start) => `<g transform="translate(${s.p[0]} ${s.p[1] - 30})"><line y1="0" y2="30" stroke="#3a2810" stroke-width="2"/><ellipse cy="30" rx="10" ry="4" fill="#000" opacity=".3"/><circle r="22" fill="${start ? "#3a2810" : "#b3261e"}"/><circle r="17" fill="none" stroke="${start ? "#ffe08a" : "#e86d5c"}" stroke-width="2" stroke-dasharray="3 3"/><text y="7" text-anchor="middle" font-size="19">${start ? "🏁" : s.ic}</text><g transform="translate(0 -38)"><path d="M-62 -13 H62 L54 0 L62 13 H-62 L-54 0Z" fill="#fff4dc" stroke="#6b4a25" stroke-width="2"/><text y="5" text-anchor="middle" font-size="14" fill="#3a2810" font-weight="700">${start ? "البداية" : s.n}</text></g></g>`;
  const diamond = pts([[-40, -40, 0], [1040, -40, 0], [1040, 1040, 0], [-40, 1040, 0]]);
  return `<svg class="kz-map" viewBox="0 0 1200 700" role="img" aria-label="خريطة ${V.t}">${DEFS}
    <rect width="1200" height="700" fill="${V.bg}"/>${speck(260, shade(V.bg, .9), shade(V.bg, 1.08))}
    <polygon points="${diamond}" fill="${V.fl}"/><polygon points="${pts([[-40, 1040, 0], [1040, 1040, 0], [1040, 1040, -26], [-40, 1040, -26]])}" fill="${shade(V.fl, .7)}"/><polygon points="${pts([[1040, -40, 0], [1040, 1040, 0], [1040, 1040, -26], [1040, -40, -26]])}" fill="${shade(V.fl, .55)}"/>
    ${ground.join("")}
    <path id="kzTrail" d="${catmull([ST[0].p, ...sel.map((s) => s.p), C])}" fill="none" stroke="none"/><g id="kzSteps"></g>
    ${scene.map((o) => o.svg).join("")}
    <g transform="translate(${C[0]} ${C[1] - 10})"><circle r="70" fill="url(#rays)"/><g class="rayset">${[0, 30, 60, 90, 120, 150].map((a) => `<rect x="-3" y="-78" width="6" height="40" rx="3" fill="#ffe08a" opacity=".55" transform="rotate(${a})"/><rect x="-3" y="38" width="6" height="40" rx="3" fill="#ffe08a" opacity=".55" transform="rotate(${a})"/>`).join("")}</g>
      <g filter="url(#sh)"><rect x="-34" y="-14" width="68" height="40" rx="6" fill="#8a5427"/><path d="M-34 -14 Q0 -44 34 -14Z" fill="#a8672f"/><rect x="-34" y="-4" width="68" height="7" fill="#d4a330"/><rect x="-6" y="-8" width="12" height="16" rx="3" fill="#f2c94c"/></g>
      <g id="kzLock"><path d="M-40 18 Q0 34 40 18" stroke="#9aa3a8" stroke-width="5" fill="none" stroke-dasharray="8 4"/><g transform="translate(0 48)"><rect x="-58" y="-14" width="116" height="28" rx="14" fill="#3a2810"/><text y="6" text-anchor="middle" font-size="15" fill="#ffe08a" font-weight="700">الكنز مقفول 🔒</text></g></g></g>
    ${label(ST[0], true)}${sel.map((s) => label(s)).join("")}<g id="kzFlags"></g>
    <rect width="1200" height="700" fill="url(#sun)" pointer-events="none"/></svg>`;
}
function steps(S) {
  const p = document.getElementById("kzTrail"), g = document.getElementById("kzSteps"); if (!p || !g) return;
  const len = p.getTotalLength(), n = 90, lead = Math.max(0, ...S.teams.map((t) => S.tm[t].at)) / (S.n + 1);
  let out = "";
  for (let i = 1; i < n; i++) { const t = i / n, a = p.getPointAtLength(t * len), b = p.getPointAtLength(Math.min(len, t * len + 2)); const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90, side = i % 2 ? 4 : -4, done = t < lead, c = done ? "#b3261e" : "#4a3018";
    out += `<g transform="translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${ang.toFixed(0)}) translate(${side} 0) scale(1 .6)"><ellipse rx="3.4" ry="5.6" fill="${c}" opacity="${done ? .9 : .45}"/><circle cy="-8" r="1.7" fill="${c}" opacity="${done ? .9 : .45}"/></g>`; }
  g.innerHTML = out;
}
function flags(S) {
  const g = document.getElementById("kzFlags"); if (!g) return;
  const V = VENUES[S.venue], ST = stations(S), C = P(V.chest[0], V.chest[1], 0);
  g.innerHTML = S.teams.map((t, k) => { const T = S.tm[t], p = T.done ? C : T.at ? ST[T.last].p : ST[0].p, c = KZ_TEAMS[t].c;
    return `<g transform="translate(${p[0] + 30 + k * 7} ${p[1] - 8 - k * 5})"><g class="kz-pawn" style="animation-delay:${k * -.6}s"><ellipse cx="2" cy="40" rx="9" ry="3" fill="#000" opacity=".25"/><rect x="-2" y="-6" width="4" height="46" rx="2" fill="#3a2810"/><path d="M2 -6 h34 l-8 11 l8 11 h-34z" fill="${c}" stroke="#fff" stroke-width="2"/><text x="16" y="10" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">${AR(k + 1)}</text></g></g>`; }).join("");
  const lock = document.getElementById("kzLock"); if (lock) lock.style.display = S.winner >= 0 ? "none" : "";
  steps(S);
}
return { VENUES, svg, steps, flags };
})();
