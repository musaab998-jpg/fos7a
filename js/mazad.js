"use strict";
// ================= مزاد الأسئلة: a night trading hall where every question is a lot =================
// Each team is a trading house with the same capital. Every lot is a known venture: its category, its
// difficulty and its terms show before anyone bids. One negotiator per house (a different one each lot)
// bids on the capital the house stakes; the others are advisers who send suggestions from their phones.
// The winning house's advisers answer for it: right, and the stake comes back with an equal profit
// (double on a gold lot and the grand lot); wrong, and the stake is gone. Every other house that answers
// right gets +50. A house that runs out offers a member's work contract, or takes a قرض حسن.
// Sealed offers and advisers' suggestions never go into the shared snapshot: the host sends them only
// to the house they belong to.

const MZ_HOUSES = [
  { n: "دار الصقر", c: "#1f4fa8", art: "falcon" },
  { n: "دار الخيل", c: "#a8321f", art: "horse" },
  { n: "دار النخلة", c: "#1d7a4a", art: "palm" },
  { n: "دار الهلال", c: "#6b3fa0", art: "crescent" },
];
const MZ_TYPES = { open: ["مزاد مفتوح", "يرفع المفاوضون العرض، ومن يبقى أعلى بعد ٦ ثوانٍ يأخذها"], dutch: ["مزاد تنازلي", "يبدأ السعر عاليًا وينزل، وأول مفاوض يضغط «خذها» يأخذها"], sealed: ["عرض سري", "كل مفاوض يقدّم عرضًا واحدًا لا يراه غيره، ثم تُكشف العروض"] };
const MZ_T = { show: 7000, open: 11000, after: 6000, drop: 1300, sealed: 16000, reveal: 3200, sold: 3200, nobid: 3200, res: 7000, broke: 20000, mkt: 11000, done: 4500 };
const MZ_VENT = ["قافلة تمر إلى الشام", "سفينة بخور إلى البصرة", "حمولة قماش من دمشق", "فخّار إلى القاهرة", "قافلة توابل إلى حلب", "تجارة خيل إلى نجد", "سفينة لؤلؤ إلى عُمان", "قافلة صوف إلى بغداد", "كتب إلى القيروان", "عسل إلى صنعاء", "زيت زيتون من الخليل", "ملح إلى تمبكتو", "سجّاد إلى فاس", "بنّ من اليمن"];
// how hard a category's questions tend to be, shown as stars on the lot before bidding
const MZ_DIFF = { "عامة": 1, "أكل": 1, "حيوانات": 1, "ألغاز": 1, "كرتون": 1, "زمن الطيبين": 1, "السعودية": 1, "كورة": 1, "لهجات": 1, "أعلام الدول": 3, "تاريخ": 3, "الصحابة": 3, "لغتنا": 3, "علوم": 3, "فضاء": 3, "رياضيات": 3 };
const mzDiff = (c) => MZ_DIFF[c] || 2;
const MZ_DLAB = ["", "سهل", "متوسط", "صعب"];
const MZ_PH = [["show", "الصفقة"], ["bid", "المزايدة"], ["q", "الإجابة"], ["res", "الحساب"]];
const mzPhIdx = (p) => MZ_PH.findIndex((x) => x[0] === ({ sold: "bid", nobid: "bid", broke: "res", mkt: "res", mkt2: "res", loan: "res" }[p] || p));
const mzTeamOf = (S, id) => (S.mteams || {})[id] ?? -1;
const mzN = (n) => AR(Math.round(n).toLocaleString("en-US")).replace(/,/g, "٬");
const mzSG = (n) => `<span dir="ltr">${n > 0 ? "+" : n < 0 ? "−" : ""}${mzN(Math.abs(n))}</span>`;
const mzStep = (cap) => Math.max(100, Math.round(cap / 1000) * 100);
const mzLoanAmt = (S) => 5 * S.step;
const mzStars = (n) => `<span class="mz-stars" aria-label="صعوبة ${AR(n)} من ٣">${"★".repeat(n)}<span style="opacity:.25">${"★".repeat(3 - n)}</span></span>`;

// ---------------- drawings: crests, venture icons, the star band, the wax seal ----------------
const MZ_STAR8 = (r) => { let d = ""; for (let i = 0; i < 16; i++) { const a = (Math.PI / 8) * i - Math.PI / 2, rr = i % 2 ? r * 0.8 : r; d += `${i ? "L" : "M"}${(50 + rr * Math.cos(a)).toFixed(1)} ${(50 + rr * Math.sin(a)).toFixed(1)}`; } return d + "Z"; };
const MZ_CREST = (c, art) => `<path d="${MZ_STAR8(49)}" fill="#d4a64a"/><path d="${MZ_STAR8(45)}" fill="#7a5a1c"/><circle cx="50" cy="50" r="36" fill="${c}"/><circle cx="50" cy="50" r="36" fill="url(#mzShine)"/><circle cx="50" cy="50" r="31.5" fill="none" stroke="#f3d58a" stroke-width="1.2" stroke-dasharray="1.5 2.5" opacity=".8"/>${art}`;
const MZ_CREAM = "#f7ecd3";
const MZ_ART = {
  falcon: (c) => `<path d="M33 76 C29 62 29 46 38 36 C45 28 56 27 63 31 C67 33 70 36 72 40 L64 47 C62 52 60 57 60 62 C60 67 61 72 63 76 Z" fill="${MZ_CREAM}"/><path d="M62 31 C70 31 76 37 76 46 C74 43 71 42 68 44 C67 41 65 39 62 38 Z" fill="#d4a64a" stroke="#7a5a1c" stroke-width="1.2"/><circle cx="57" cy="39" r="4" fill="#1a120c"/><circle cx="57" cy="39" r="5.6" fill="none" stroke="#d4a64a" stroke-width="1.4"/><circle cx="58.3" cy="37.8" r="1.2" fill="#fff"/><path d="M55 44 C52 49 51 55 53 60 C56 55 58 50 58 45 Z" fill="#1a120c" opacity=".85"/><path d="M38 50 q4 3 8 1 M36 58 q5 3 10 1 M37 66 q5 3 11 1" stroke="${c}" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>`,
  horse: (c) => `<path d="M36 76 C34 64 36 54 42 46 C46 40 48 34 50 28 C52 24 56 22 60 24 C64 26 68 30 72 36 C75 40 76 44 74 47 C72 49 69 49 67 47 C64 45 61 45 59 48 C56 52 56 60 58 68 C59 72 60 74 62 76 Z" fill="${MZ_CREAM}"/><path d="M50 28 C46 32 42 38 40 46 C38 52 36 60 36 68" stroke="${c}" stroke-width="3" fill="none" opacity=".45"/><path d="M50 26 C44 30 40 36 37 44 C35 50 33 56 32 62 C36 54 40 46 46 38 Z" fill="#d4a64a"/><path d="M58 21 L56 14 L62 19 Z" fill="${MZ_CREAM}"/><circle cx="64" cy="33" r="2" fill="${c}"/><path d="M70 44 q2 1 3 0" stroke="${c}" stroke-width="1.6" fill="none"/>`,
  palm: () => `<path d="M48 76 C47 66 48 56 51 46" stroke="${MZ_CREAM}" stroke-width="5" fill="none" stroke-linecap="round"/><g fill="${MZ_CREAM}"><path d="M51 44 C42 36 32 36 25 42 C34 39 43 41 51 46Z"/><path d="M51 44 C60 35 70 35 77 41 C68 38 59 40 51 46Z"/><path d="M51 44 C47 33 40 27 31 26 C40 31 46 37 50 46Z"/><path d="M51 44 C56 33 63 27 72 27 C63 31 57 37 52 46Z"/><path d="M51 45 C43 46 37 51 34 58 C41 52 46 49 51 47Z"/><path d="M51 45 C59 46 65 51 68 58 C61 52 56 49 51 47Z"/></g><g fill="#d4a64a"><circle cx="48" cy="51" r="2.6"/><circle cx="53" cy="52" r="2.6"/><circle cx="50.5" cy="56" r="2.6"/></g>`,
  crescent: () => `<path d="M58 24 C42 26 32 38 32 52 C32 66 44 78 58 78 C50 74 44 64 44 52 C44 40 50 30 58 24 Z" fill="${MZ_CREAM}"/><path d="M64 40 L66.5 46.5 L73 47 L68 51.5 L69.5 58 L64 54.5 L58.5 58 L60 51.5 L55 47 L61.5 46.5 Z" fill="#d4a64a"/>`,
};
const MZ_EMB = MZ_HOUSES.map((h) => MZ_CREST(h.c, MZ_ART[h.art](h.c)));
const mzEmb = (t, cls = "") => `<svg class="mz-emb ${cls}" viewBox="0 0 100 100" aria-hidden="true">${MZ_EMB[t] || ""}</svg>`;
document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="mzShine" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs></svg>');
const MZ_VIC = {
  caravan: '<path d="M3 20c0-3 1-4 3-4l1-4c1-2 3-2 4 0l1 2h3l2-3c1-1 3-1 3 1v2l-2 2v4M7 16v4M15 16v4M18 12l2-2"/>',
  ship: '<path d="M3 16h18l-3 4H6zM12 4v12M12 4l6 9h-6M12 6l-5 7h5"/>',
  bale: '<path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8M8 6l8 4"/>',
  jar: '<path d="M9 3h6M10 3v3c-3 1-5 4-5 8a7 7 0 0 0 14 0c0-4-2-7-5-8V3M7 13h10"/>',
  horse: '<path d="M6 20l1-7c-2-1-3-3-2-5l4-4 2 2h3c3 0 5 3 5 6v8M10 13h6M15 20v-5"/>',
};
const mzVIcon = (v) => `<svg class="mz-cico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MZ_VIC[/قافلة/.test(v) ? "caravan" : /سفينة/.test(v) ? "ship" : /خيل/.test(v) ? "horse" : /فخّار|عسل|زيت|بنّ/.test(v) ? "jar" : "bale"]}</svg>`;
const MZ_ICON = {
  gavel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4l6 6M11 7l6 6M12.5 5.5l-4 4M17.5 10.5l-4 4M10 12l-7 7M3 21h9"/></svg>',
  hand: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7s-5-2-6.5-4.5L3 14a1.5 1.5 0 0 1 2.6-1.5L8 15"/></svg>',
  chat: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  crown: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/></svg>',
};
// فسحة's art for this game: the card on the home page and the square icon for the room header
const MZ_CARD = "<svg viewBox=\"0 0 300 200\" preserveAspectRatio=\"xMidYMid meet\" role=\"img\" aria-label=\"مزاد الأسئلة\"><defs><pattern id=\"c-mazad\" width=\"9\" height=\"9\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(30)\"><circle cx=\"4.5\" cy=\"4.5\" r=\"1.6\" fill=\"#000\" opacity=\".16\"/></pattern></defs><rect width=\"300\" height=\"200\" fill=\"#12302a\"/><rect width=\"300\" height=\"200\" fill=\"url(#c-mazad)\"/><circle cx=\"150\" cy=\"100\" r=\"86\" fill=\"#fff6dc\" opacity=\".1\"/><g transform=\"translate(88 38) scale(1.24)\"><g transform=\"rotate(-35 50 46)\"><rect x=\"24\" y=\"20\" width=\"52\" height=\"22\" rx=\"5\" fill=\"#fff6dc\"/><rect x=\"24\" y=\"20\" width=\"9\" height=\"22\" rx=\"3\" fill=\"#ffc933\"/><rect x=\"67\" y=\"20\" width=\"9\" height=\"22\" rx=\"3\" fill=\"#ffc933\"/><rect x=\"45\" y=\"42\" width=\"10\" height=\"46\" rx=\"4\" fill=\"#fff6dc\"/></g><rect x=\"14\" y=\"80\" width=\"46\" height=\"10\" rx=\"3\" fill=\"#ffc933\"/></g><g transform=\"translate(244 30) rotate(8)\"><rect x=\"-42\" y=\"-16\" width=\"84\" height=\"32\" rx=\"16\" fill=\"#ffc933\" stroke=\"#1b2a4a\" stroke-width=\"3\"/><text y=\"7\" text-anchor=\"middle\" font-family=\"Lalezar, sans-serif\" font-size=\"18\" fill=\"#1b2a4a\">جديد</text></g></svg>";
const MZ_GICON = "<svg viewBox=\"0 0 100 100\" aria-hidden=\"true\"><rect width=\"100\" height=\"100\" rx=\"24\" fill=\"#12302a\"/><g transform=\"translate(16 16) scale(.68)\"><g transform=\"rotate(-35 50 46)\"><rect x=\"24\" y=\"20\" width=\"52\" height=\"22\" rx=\"5\" fill=\"#fff6dc\"/><rect x=\"24\" y=\"20\" width=\"9\" height=\"22\" rx=\"3\" fill=\"#ffc933\"/><rect x=\"67\" y=\"20\" width=\"9\" height=\"22\" rx=\"3\" fill=\"#ffc933\"/><rect x=\"45\" y=\"42\" width=\"10\" height=\"46\" rx=\"4\" fill=\"#fff6dc\"/></g><rect x=\"14\" y=\"80\" width=\"46\" height=\"10\" rx=\"3\" fill=\"#ffc933\"/></g></svg>";
const mzTitle = () => { $("gTitle").innerHTML = `<span class="mz-gico">${MZ_GICON}</span>مزاد الأسئلة`; };
const MZ_SEAL = '<svg class="mz-seal" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 C62 4 70 12 80 14 C92 18 94 30 95 42 C97 55 92 64 88 74 C82 86 70 94 56 95 C42 97 30 92 20 86 C10 78 5 66 6 52 C6 38 8 26 18 17 C27 9 38 7 50 6Z" fill="#9b1f18"/><circle cx="50" cy="50" r="31" fill="#b42a20" stroke="#6e130e" stroke-width="3"/><text x="50" y="62" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="34" fill="#f3d9a8">عُقد</text></svg>';
const MZ_PAD = (c) => `<svg class="mz-paddle" viewBox="0 0 30 44" aria-hidden="true"><rect x="13" y="22" width="4" height="20" rx="2" fill="#8a5a2b"/><ellipse cx="15" cy="14" rx="13" ry="12.5" fill="#f7efe0" stroke="#d4a64a" stroke-width="2"/><ellipse cx="15" cy="14" rx="9" ry="8.5" fill="${c}"/></svg>`;

ROOM_GAMES.mazad = {
  name: "مزاد الأسئلة", theme: "mazad", min: 2, need: "يحتاج لاعب في دارين على الأقل", who: "٢ إلى ٤ دُور · مزايدة وأسئلة",
  rules: [
    "كل فريق دار تجارية، وكل الدُّور تبدأ بنفس رأس المال. الدار الأغنى في النهاية تفوز.",
    "كل صفقة معروفة قبل المزايدة: بضاعتها، وفئة سؤالها وصعوبته، وشروط ربحها.",
    "في كل صفقة واحد من كل دار هو المفاوض، ويتبدّل كل صفقة. هو وحده يزايد، والباقين مستشارين يقترحون عليه من جوالاتهم.",
    "المزاد ثلاثة أنواع: مفتوح (إذا مرّت ٦ ثوانٍ بلا عرض جديد: مرة… مرتين… عُقدت!)، وتنازلي ينزل فيه السعر، وعرض سري لا يشوفه أحد. والصفقة الأخيرة هي الكبرى.",
    "سؤال الصفقة للكل: المستشارون يصوّتون، وجواب الأغلبية هو جواب الدار، والمفاوض ما يجاوب.",
    "الدار اللي أخذت الصفقة: صح؟ يرجع رأس مالها ومعه ربح مثله (ضعفه في الصفقة الذهبية والكبرى). غلط؟ يروح رأس المال. وكل دار ثانية تجاوب صح تاخذ ٥٠.",
    "إذا نفد مال دار: تعرض عقد عمل أحد أعضائها على الدُّور الثانية، والأجرة لها، أو تاخذ قرض حسن من بيت المال يُرد في النهاية بلا زيادة.",
  ],
  setup(S) {
    Object.assign(S, { nt: 3, cap: 1000, nlots: 8, qtime: 25, picks: ["السعودية", "الخليج والعرب", "جغرافيا", "علوم", "كورة", "ألغاز", "عامة", "أكل", "حيوانات", "زمن الطيبين"] });
    H.ht ||= {};
    H.players.forEach((p) => { if (H.ht[p.id] === undefined) ROOM_GAMES.mazad.joined(p.id); });
  },
  joined(id) {
    const S = H.S, pool = S.phase !== "lobby" && Array.isArray(S.teams) && S.teams.length ? S.teams : Array.from({ length: S.nt || 3 }, (_, t) => t);
    const n = (t) => Object.values(H.ht).filter((x) => x === t).length;
    H.ht[id] = pool.reduce((b, t) => (n(t) < n(b) ? t : b), pool[0]);
  },
  left(id) { delete H.ht[id]; },
  snap(S) {
    S.mteams = {}; H.players.forEach((p) => (S.mteams[p.id] = Math.min(H.ht[p.id] ?? 0, (S.nt || 3) - 1)));
    S.left = H.deadline ? Math.max(0, Math.min(H.deadline - now(), 3600000)) : 0;
  },
  key: (S) => `${S.sid || ""}:${S.phase}:${S.k ?? ""}:${S.reveal ? 1 : 0}:${S.broke ?? ""}`,
  on(m) {
    const S = H.S, Z = H.mz, t = H.ht[m.id];
    if (!Z || !m.id) return;
    if (m.t === "mzwho") return mzTellOne(m.id);
    if (t === undefined || !S.teams.includes(t)) return;
    const neg = S.neg && S.neg[t] === m.id, amt = Math.round(+m.amount);
    if (m.t === "mzbid" && S.phase === "bid" && S.btype === "open" && neg && S.lead !== t && amt >= 100 && amt > S.price && amt <= S.cash[t]) {
      S.price = amt; S.lead = t; S.lastBid[t] = amt; S.T = MZ_T.after; H.deadline = now() + MZ_T.after;
      (Z.sugg[t] || []).forEach((s) => { if (s.amount === amt) s.done = true; });
      mzTellTeam(t); return hostSend();
    }
    if (m.t === "mztake" && S.phase === "bid" && S.btype === "dutch" && neg && S.lead < 0 && S.cash[t] >= S.price) {
      S.lead = t; S.lastBid[t] = S.price; H.deadline = now() + 1500; S.T = 1500;
      return hostSend();
    }
    if (m.t === "mzseal" && S.phase === "bid" && S.btype === "sealed" && !S.reveal && neg && !Z.sealed[t] && (amt === 0 || (amt >= 100 && amt <= S.cash[t]))) {
      Z.sealed[t] = { a: amt, at: now() }; S.sealedIn[t] = true;
      if (S.teams.every((x) => S.sealedIn[x] || !S.neg[x])) H.deadline = Math.min(H.deadline, now() + 700);
      mzTellTeam(t); return hostSend();
    }
    if (m.t === "mzsug" && S.phase === "bid" && !neg && !S.reveal && Number.isFinite(amt) && amt >= 0) {
      const p = H.players.find((x) => x.id === m.id);
      Z.sugg[t] = (Z.sugg[t] || []).filter((s) => s.id !== m.id).concat({ id: m.id, name: p ? p.name : "", amount: amt, at: now() });
      return mzTellTeam(t);
    }
    if (m.t === "mzvote" && S.phase === "q" && mzVoters(t).includes(m.id) && Number.isInteger(m.k) && m.k >= 0 && m.k < S.q.o.length) {
      (Z.votes[t] ||= {})[m.id] = { k: m.k, at: Z.votes[t][m.id] ? Z.votes[t][m.id].at : now() };
      (S.votes[t] ||= {})[m.id] = m.k;
      if (S.teams.every((x) => mzVoters(x).every((id) => Z.votes[x] && Z.votes[x][id]))) H.deadline = Math.min(H.deadline, now() + 900);
      return hostSendSoon();
    }
    if (S.phase === "broke" && t === S.broke) {
      if (m.t === "mzloan") return mzLoan(t, "chose");
      const mem = mzMembers(t);
      if (m.t === "mzsell" && mem.length > 1 && mem.includes(m.who)) {
        const p = H.players.find((x) => x.id === m.who);
        S.sale = { t, id: m.who, name: p.name, av: p.av, price: 0, lead: -1, bids: Array(S.nt).fill(0) };
        return mzPhase("mkt", MZ_T.mkt);
      }
    }
    if (m.t === "mzbuy" && S.phase === "mkt" && S.sale && t !== S.sale.t && neg && amt >= 100 && amt > S.sale.price && amt <= S.cash[t] - 100) {
      Object.assign(S.sale, { price: amt, lead: t }); S.sale.bids[t] = amt; S.T = MZ_T.after; H.deadline = now() + MZ_T.after;
      return hostSend();
    }
  },
  direct(m) {
    if (m.t !== "mzme" || !KL.S || m.sid !== KL.S.sid) return;
    KL.my.mz = m;
    if (KL.S.game === "mazad" && ["bid", "show"].includes(KL.S.phase)) renderPhase(KL.S, false);
  },
  lobbyPlayers(S) {
    const col = (t) => `<div class="kl-team mz-lteam" style="color:${MZ_HOUSES[t].c}"><b>${mzEmb(t)}${MZ_HOUSES[t].n}</b>${S.players.filter((p) => mzTeamOf(S, p.id) === t).map((p) => `<button type="button" class="kl-p" data-msw="${esc(p.id)}" ${isHost() ? "" : "disabled"}>${face(p, 30)}<span>${esc(p.name)}${p.id === PID ? " (أنت)" : ""}</span></button>`).join("") || '<span class="muted">…</span>'}</div>`;
    return `<p class="muted" style="font-weight:700;color:var(--soft)">الدُّور (${AR(S.players.length)} لاعب)${isHost() ? " · اضغط على لاعب ينقله للدار اللي بعدها" : ""}</p><div class="kl-teams">${Array.from({ length: S.nt }, (_, t) => col(t)).join("")}</div>`;
  },
  lobby(S) {
    const chips = (attr, list, cur, lab) => `<div class="chips pick">${list.map((v) => `<button type="button" class="chip" data-${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${lab(v)}</button>`).join("")}</div>`;
    const h = (t) => `<p class="muted" style="font-weight:700;color:var(--soft)">${t}</p>`;
    return `${h("كم دار؟")}${chips("mnt", [2, 3, 4], S.nt, (v) => `${AR(v)} دُور`)}
      ${h("رأس مال كل دار")}${chips("mcap", [1000, 3000, 5000], S.cap, (v) => `${mzN(v)} دينار`)}
      <p class="muted">مال أقل = إفلاس أسرع وسوق عقود أنشط.</p>
      ${h("كم صفقة؟")}${chips("mlots", [6, 8, 12], S.nlots, (v) => AR(v))}
      <p class="muted">كل خامس صفقة ذهبية، والأخيرة هي الكبرى، وربحهما مضاعف. ${AR(S.nlots)} صفقات تاخذ تقريبًا ${AR(Math.round(S.nlots * 1.8))} دقيقة.</p>
      ${h("وقت الإجابة")}${chips("mqt", [15, 20, 25], S.qtime, (v) => `${AR(v)} ثانية`)}
      ${h("فئات الأسئلة")}<div class="chips pick">${QCATS.filter((c) => c !== "الأغلبية").map((c) => `<button type="button" class="chip" data-mcat="${c}" aria-pressed="${S.picks.includes(c)}">${c}</button>`).join("")}</div>`;
  },
  bindLobby(S) {
    const set = (attr, key) => screen.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { H.S[key] = +b.dataset[attr]; beep(700, 0.04); if (key === "nt") H.players.forEach((p, k) => (H.ht[p.id] = k % H.S.nt)); hostSend(); }));
    set("mnt", "nt"); set("mcap", "cap"); set("mlots", "nlots"); set("mqt", "qtime");
    screen.querySelectorAll("[data-mcat]").forEach((b) => (b.onclick = () => { const c = b.dataset.mcat, p = H.S.picks; H.S.picks = p.includes(c) ? p.filter((x) => x !== c) : [...p, c]; beep(660, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-msw]").forEach((b) => (b.onclick = () => { const id = b.dataset.msw; H.ht[id] = ((H.ht[id] ?? 0) + 1) % H.S.nt; beep(640, 0.04); hostSend(); }));
    const used = new Set(Object.values(S.mteams || {}));
    if (used.size < 2 || !S.picks.length) $("start").disabled = true;
  },
  start: () => mzStart(),
  resume() {
    if (!(H.usedQ instanceof Set)) H.usedQ = new Set();
    if (H.S.phase !== "end") hEvery(mzTick, 200);
    H.players.forEach((p) => mzTellOne(p.id));
  },
};

// ---------------- the host ----------------
function mzTell(id, m) { m.to = id; if (id === PID) ROOM_GAMES.mazad.direct(m); else if (KL.net) KL.net.send(m); }
const mzMembers = (t) => H.players.map((p) => p.id).filter((id) => H.ht[id] === t);
// who answers for a house: everyone but the negotiator, unless the negotiator is alone
const mzVoters = (t) => { const m = mzMembers(t); return m.length > 1 ? m.filter((id) => id !== H.S.neg[t]) : m; };
// a house's private sheet: its advisers' suggestions and its own sealed offer
function mzTellOne(id) {
  const S = H.S, Z = H.mz; if (!Z) return;
  const t = H.ht[id];
  const sealed = Z.sealed[t];
  mzTell(id, { t: "mzme", sid: S.sid, k: S.k, sugg: (Z.sugg[t] || []).map((s) => ({ id: s.id, name: s.name, amount: s.amount, done: !!s.done })), sealed: sealed ? sealed.a : null });
}
const mzTellTeam = (t) => mzMembers(t).forEach((id) => mzTellOne(id));

function mzStart() {
  hClear();
  const S = H.S, n = S.nlots;
  const teams = [...new Set(H.players.map((p) => H.ht[p.id] ?? 0))].filter((t) => t < S.nt).sort();
  H.usedQ instanceof Set || (H.usedQ = new Set());
  const picks = S.picks.length ? S.picks : ["عامة"], cats = shuffled(picks), vs = shuffled(MZ_VENT), hard = picks.filter((c) => mzDiff(c) === 3);
  const qs = [], lots = [];
  for (let k = 0; k < n; k++) {
    const big = k === n - 1, cat = big && hard.length ? pickOne(hard) : cats[k % cats.length];
    qs.push(drawQuestion(cat, H.usedQ));
    lots.push({ v: vs[k % vs.length], cat, stars: mzDiff(cat), big, gold: big || (k + 1) % 5 === 0, type: big ? "open" : k % 4 === 1 ? "dutch" : k % 4 === 3 ? "sealed" : "open" });
  }
  H.mz = { qs, votes: {}, sealed: {}, sugg: {}, rot: Array(S.nt).fill(0), bold: null, dear: null, brokeQ: [], dropAt: 0 };
  Object.assign(S, { sid: Math.random().toString(36).slice(2, 8), teams, lots, k: -1, step: mzStep(S.cap), cash: Array(S.nt).fill(S.cap), loan: Array(S.nt).fill(0), right: Array(S.nt).fill(0), awards: null, rank: null });
  mzLot(0);
  hEvery(mzTick, 200);
}
function mzPhase(p, ms) { const S = H.S; S.phase = p; S.T = ms; H.deadline = now() + ms; hostSend(); }
function mzLot(k) {
  const S = H.S, Z = H.mz, L = S.lots[k];
  S.k = k; S.neg = {};
  S.teams.forEach((t) => { const m = mzMembers(t); if (m.length) S.neg[t] = m[Z.rot[t]++ % m.length]; });
  Object.assign(S, { btype: L.type, price: 0, lead: -1, lastBid: Array(S.nt).fill(0), sealedIn: Array(S.nt).fill(false), reveal: null, q: null, ans: -1, final: null, delta: null, ok: null, votes: {}, sale: null, broke: -1, loanT: null, drop: 0 });
  Z.votes = {}; Z.sealed = {}; Z.sugg = {};
  mzPhase("show", MZ_T.show);
  S.teams.forEach((t) => mzTellTeam(t));
}
function mzBid() {
  const S = H.S, Z = H.mz;
  if (S.btype === "dutch") {
    const top = Math.max(...S.teams.map((t) => S.cash[t]));
    S.price = Math.max(3 * S.step, Math.min(Math.round((top * 0.8) / 50) * 50, 15 * S.step));
    S.drop = Math.max(50, Math.round(S.step / 2 / 50) * 50);
    Z.dropAt = now() + MZ_T.drop;
    S.phase = "bid"; S.T = MZ_T.drop; H.deadline = now() + 3600000; hostSend();
  } else mzPhase("bid", S.btype === "sealed" ? MZ_T.sealed : MZ_T.open);
}
// one loop for every phase: whatever is due happens here, so a resumed room only needs this running
function mzTick() {
  const S = H.S, Z = H.mz;
  if (!Z || S.game !== "mazad" || S.phase === "lobby" || S.phase === "end") return;
  if (S.phase === "bid" && S.btype === "dutch" && S.lead < 0 && now() >= Z.dropAt) {
    if (S.price - S.drop < 100) { H.deadline = now(); }
    else { S.price -= S.drop; Z.dropAt = now() + MZ_T.drop; hostSend(); }
  }
  if (now() < H.deadline) return;
  ({ show: mzBid, bid: () => (S.btype === "sealed" && !S.reveal ? mzReveal() : mzClose()), sold: mzAsk, nobid: mzNext, q: mzResult, res: mzAfterRes, broke: () => mzLoan(S.broke, "late"), mkt: mzSaleEnd, mkt2: mzAfterBroke, loan: mzAfterBroke }[S.phase] || (() => {}))();
}
// sealed offers open together; the highest of at least 100 wins, the earlier one on a tie
function mzReveal() {
  const S = H.S, Z = H.mz;
  S.reveal = Array(S.nt).fill(null);
  S.teams.forEach((t) => { const s = Z.sealed[t]; S.reveal[t] = s ? s.a : 0; S.lastBid[t] = s ? s.a : 0; });
  const best = S.teams.filter((t) => Z.sealed[t] && Z.sealed[t].a >= 100).sort((a, b) => Z.sealed[b].a - Z.sealed[a].a || Z.sealed[a].at - Z.sealed[b].at)[0];
  if (best !== undefined) { S.lead = best; S.price = Z.sealed[best].a; }
  mzPhase("bid", MZ_T.reveal);
}
function mzClose() {
  const S = H.S, Z = H.mz;
  if (S.lead < 0) return mzPhase("nobid", MZ_T.nobid);
  if (!Z.bold || S.price > Z.bold.amount) Z.bold = { t: S.lead, amount: S.price };
  mzPhase("sold", MZ_T.sold);
}
function mzAsk() {
  const S = H.S, d = H.mz.qs[S.k];
  S.q = { q: d.q, o: d.o, cat: d.cat }; S.votes = {}; H.mz.votes = {};
  mzPhase("q", S.qtime * 1000);
}
// the house's answer: the most votes; a tie goes to whoever voted first among the tied
function mzPick(t) {
  const v = H.mz.votes[t] || {}, list = Object.values(v);
  if (!list.length) return -1;
  const n = H.S.q.o.map(() => 0); list.forEach((x) => n[x.k]++);
  const best = Math.max(...n), top = n.map((x, k) => (x === best ? k : -1)).filter((k) => k >= 0);
  return top.length === 1 ? top[0] : list.filter((x) => top.includes(x.k)).sort((a, b) => a.at - b.at)[0].k;
}
function mzResult() {
  const S = H.S, a = H.mz.qs[S.k].a, b = S.lead, L = S.lots[S.k], gain = L.gold ? 2 * S.price : S.price;
  S.ans = a; S.final = Array(S.nt).fill(-1); S.ok = Array(S.nt).fill(false); S.delta = Array(S.nt).fill(0);
  S.teams.forEach((t) => {
    S.final[t] = mzPick(t); S.ok[t] = S.final[t] === a;
    if (S.ok[t]) S.right[t]++;
    S.delta[t] = t === b ? (S.ok[t] ? gain : -S.price) : S.ok[t] ? 50 : 0;
    S.cash[t] += S.delta[t];
  });
  mzPhase("res", MZ_T.res);
}
function mzAfterRes() {
  const S = H.S;
  if (S.k >= S.lots.length - 1) return mzEnd();
  H.mz.brokeQ = S.teams.filter((t) => S.cash[t] < 100);
  mzAfterBroke();
}
function mzAfterBroke() {
  const S = H.S, q = H.mz.brokeQ;
  S.sale = null; S.loanT = null;
  if (!q.length) return mzNext();
  const t = q.shift();
  S.broke = t;
  if (mzMembers(t).length < 2) return mzLoan(t, "solo");
  mzPhase("broke", MZ_T.broke);
}
// قرض حسن from بيت المال: paid back at the end, exactly as it was lent
function mzLoan(t, why) {
  const S = H.S, a = mzLoanAmt(S);
  S.cash[t] += a; S.loan[t] += a; S.broke = t; S.loanT = { t, a, why };
  mzPhase("loan", MZ_T.done);
}
function mzSaleEnd() {
  const S = H.S, s = S.sale, Z = H.mz;
  if (!s || s.lead < 0) return mzLoan(s ? s.t : S.broke, "nobody");
  S.cash[s.lead] -= s.price; S.cash[s.t] += s.price;
  if (H.players.some((p) => p.id === s.id)) H.ht[s.id] = s.lead;
  if (!Z.dear || s.price > Z.dear.amount) Z.dear = { name: s.name, av: s.av, amount: s.price, from: s.t, to: s.lead };
  mzPhase("mkt2", MZ_T.done);
}
function mzNext() { const S = H.S; if (S.k + 1 >= S.lots.length) return mzEnd(); mzLot(S.k + 1); }
function mzEnd() {
  hClear();
  const S = H.S, Z = H.mz;
  S.rank = S.teams.slice().sort((x, y) => (S.cash[y] - S.loan[y]) - (S.cash[x] - S.loan[x]));
  const most = S.teams.slice().sort((x, y) => S.right[y] - S.right[x])[0];
  S.awards = { bold: Z.bold, dear: Z.dear, most: S.right[most] ? { t: most, n: S.right[most] } : null };
  S.phase = "end"; S.T = 0; H.deadline = 0;
  hostSend();
}

// ---------------- pieces every screen uses ----------------
const mzLeft = () => leftOf(KL.S ? KL.S.left : 0);
// «مرة… مرتين… عُقدت!»: what the auctioneer is saying, from the time left and whether anyone has bid
function mzCall(left, lead) {
  if (left <= 0) return lead < 0 ? "انتهى الوقت" : "عُقدت!";
  if (lead < 0) return left < 4000 ? "لا عروض؟" : "من يبدأ؟";
  if (left > 4000) return "المزايدة مفتوحة";
  return left > 2000 ? "مرة…" : "مرتين…";
}
// countdowns that move on their own between snapshots: numbers, bars, the gavel ring and the call
function mzTickEls(root) {
  const S = KL.S; if (!S || S.game !== "mazad") return;
  const left = mzLeft(), T = S.T || 1;
  root.querySelectorAll("[data-mz]").forEach((el) => {
    const k = el.dataset.mz;
    if (k === "secs") el.textContent = AR(Math.ceil(left / 1000));
    else if (k === "bar") el.style.transform = `scaleX(${Math.min(1, left / T)})`;
    else if (k === "ring") { el.style.strokeDashoffset = String(289 * (1 - Math.min(1, left / T))); el.closest(".mz-ring")?.classList.toggle("hot", left < 2000); }
    else if (k === "call") { const lead = S.phase === "mkt" ? S.sale.lead : S.lead; el.textContent = mzCall(left, lead); el.classList.toggle("hot", left < 2000); }
  });
}
const mzRing = (txt) => `<div class="mz-ring"><svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="46"/><circle class="fg" cx="50" cy="50" r="46" data-mz="ring"/></svg><span class="call" data-mz="call">${txt}</span></div>`;
const mzGain = (L) => (L.gold ? "ضعفا رأس المال" : "مثل رأس المال");
const mzName = (t) => MZ_HOUSES[t].n;
function mzNarr(S) {
  const L = S.lots[S.k], b = S.lead, N = (t) => `<b>${mzName(t)}</b>`;
  if (S.phase === "show") return `${L.big ? "<b>الصفقة الكبرى</b>: " : `الصفقة ${AR(S.k + 1)}: `}<b>${L.v}</b>، ${MZ_TYPES[L.type][0]}`;
  if (S.phase === "bid") {
    if (S.btype === "dutch") return b >= 0 ? `${N(b)}: <b>خذها بـ${mzN(S.price)}!</b>` : "مزاد تنازلي! السعر ينزل، وأول مفاوض يضغط «خذها» يأخذها";
    if (S.btype === "sealed") return S.reveal ? "كُشفت العروض!" : "عرض سري! كل مفاوض يقدّم عرضًا واحدًا لا يراه غيره";
    return b >= 0 ? `${N(b)}: <b>${mzN(S.price)}</b>!` : "المزايدة مفتوحة! المفاوضون يزايدون من جوالاتهم";
  }
  if (S.phase === "sold") return `عُقدت! ${N(b)} تدخل الصفقة برأس مال ${mzN(S.price)} دينار`;
  if (S.phase === "nobid") return "ما دخلها أحد، فأُلغيت الصفقة";
  if (S.phase === "q") return `سؤال الصفقة! ${N(b)} تجيب على رأس مالها، والبقية على المكافأة. المفاوضون لا يجيبون`;
  if (S.phase === "res") return S.ok[b] ? `نجحت تجارة ${N(b)}: ربحت ${mzN(S.delta[b])} من السوق` : `خسرت تجارة ${N(b)}: ذهب رأس مالها ${mzN(S.price)}`;
  if (S.phase === "broke") return `نفد مال ${N(S.broke)}! تعرض عقد عمل أحد أعضائها، أو تاخذ قرضًا حسنًا`;
  if (S.phase === "mkt") return `<b>سوق العقود:</b> ${N(S.sale.t)} تعرض عقد عمل ${esc(S.sale.name)}`;
  if (S.phase === "mkt2") return `<b>${esc(S.sale.name)}</b> يعمل الآن مع ${N(S.sale.lead)}، والأجرة ${mzN(S.sale.price)} لداره`;
  if (S.phase === "loan") return S.loanT.why === "nobody" ? `ما تقدّم أحد. أقرض بيت المال ${N(S.loanT.t)} ${mzN(S.loanT.a)} قرضًا حسنًا` : `أقرض بيت المال ${N(S.loanT.t)} ${mzN(S.loanT.a)} قرضًا حسنًا`;
  return "";
}

// ---------------- every phone ----------------
const mzMine = () => { const S = KL.S, m = KL.my.mz; return m && S && m.sid === S.sid && m.k === S.k ? m : { sugg: [], sealed: null }; };
function mzAsk4Me() { const m = KL.my.mz, S = KL.S; if ((!m || m.sid !== S.sid || m.k !== S.k) && now() - (KL.my.mzAskedAt || 0) > 2500) { KL.my.mzAskedAt = now(); act({ t: "mzwho", id: PID }); } }
const mzP = (S, id) => S.players.find((p) => p.id === id) || { name: "؟", av: me.av };
const mzMemb = (S, t) => S.players.filter((p) => mzTeamOf(S, p.id) === t);
const mzLotMini = (S) => { const L = S.lots[S.k]; return `<div class="mz-mlot ${L.gold ? "gold" : ""}"><span class="ci">${mzVIcon(L.v)}</span><div><span class="mz-muted">الصفقة ${AR(S.k + 1)} من ${AR(S.lots.length)}، ${MZ_TYPES[L.type][0]}${L.big ? "، الكبرى" : L.gold ? "، ذهبية" : ""}</span><b>${L.v}</b><span class="mz-muted">سؤالها في «${L.cat}» </span>${mzStars(L.stars)}</div><span class="no">${AR(S.k + 1)}</span></div>`; };
function mzHead(S, t) {
  const L = S.lots[S.k], p = S.phase, nid = S.neg ? S.neg[t] : null, iNeg = nid === PID, mem = mzMemb(S, t);
  const showRole = nid && ["show", "bid", "sold", "nobid", "q"].includes(p);
  const solo = mem.length === 1;
  const role = !showRole ? "" : iNeg ? `<div class="mz-role neg">${MZ_ICON.hand}<span>${solo ? "أنت المفاوض، وأنت وحدك في الدار: تزايد وتجيب" : "أنت المفاوض في هذه الصفقة: تزايد ولا تجيب"}</span></div>` : `<div class="mz-role adv">${MZ_ICON.chat}${face(mzP(S, nid), 26)}<span>${esc(mzP(S, nid).name)} هو المفاوض. أنت مستشار: تقترح وتجيب</span></div>`;
  const pi = mzPhIdx(p);
  return `<div class="mz-top"><div class="r1">${mzEmb(t)}<div class="nm"><b>${mzName(t)}</b><small>${mem.map((x) => esc(x.name)).join("، ")}</small></div><div class="mz-wallet"><small>رأس مالكم</small><b>${mzN(S.cash[t])}</b></div></div>${role}
    ${L && p !== "end" ? `<div class="mz-dots">${MZ_PH.map(([, n], i) => `<span class="${i === pi ? "on" : ""}">${n}</span>`).join("")}</div>` : '<div style="height:6px"></div>'}</div>`;
}
function mzvPlay(S, fresh) {
  const t = mzTeamOf(S, PID);
  if (fresh) {
    clearKL(); KL.my.vote = undefined;
    klEvery(() => mzTickEls(screen), 200);
    if (S.phase === "bid" && S.neg && S.neg[t] === PID) { beep(880, 0.1); buzz([60, 40, 60]); }
    else if (S.phase === "sold") { beep(196, 0.25, "triangle", 0.14); setTimeout(() => beep(147, 0.3, "triangle", 0.12), 140); }
    else if (S.phase === "res") { const d = S.delta ? S.delta[t] : 0; if (d > 0) { beep(659, 0.1); setTimeout(() => beep(880, 0.15), 120); } else if (d < 0) beep(196, 0.35, "sawtooth", 0.08); }
    else beep(560, 0.05);
  }
  if (["show", "bid"].includes(S.phase)) mzAsk4Me();
  mzTitle();
  setTop(MZ_PH[mzPhIdx(S.phase)] ? MZ_PH[mzPhIdx(S.phase)][1] : "");
  const y = screen.scrollTop;
  if (!S.teams.includes(t)) { show(`<div class="mz-card"><b>دخلت بعد البداية</b><p class="mz-muted">تقدر تتفرج، وتلعب معهم المزاد الجاي.</p></div>`); return; }
  show(mzHead(S, t) + `<div class="mz-body">${mzBody(S, t)}</div>`);
  if (!fresh) screen.scrollTop = y;
  mzTickEls(screen);
  mzBind(S, t);
}
function mzBody(S, t) {
  const L = S.lots[S.k], P = S.phase, nid = S.neg ? S.neg[t] : null, iNeg = nid === PID, negName = esc(mzP(S, nid).name);
  if (P === "show") return `<div class="mz-now">صفقة جديدة! فكّروا: <b>كم رأس مال</b> تدخلون به، وسؤالها في «${L.cat}»؟</div>${mzLotMini(S)}
    <div class="mz-card"><b>${MZ_TYPES[L.type][0]}</b><div class="mz-muted">${MZ_TYPES[L.type][1]}.</div></div>
    <div class="mz-card"><b>شروط الصفقة</b><div class="mz-terms"><span>إن أصبتم <b class="p">ربح ${mzGain(L)}</b></span><span>إن أخطأتم <b class="n">يذهب رأس المال</b></span></div></div>
    <div class="mz-card"><b>${iNeg ? "أنت المفاوض هذه المرة." : `المفاوض هذه المرة: ${negName}.`}</b><div class="mz-muted">${iNeg ? "أنت تزايد، وأصحابك يقترحون عليك. وعند السؤال هم يجيبون وأنت تتفرّج." : "تقدر تقترح عليه مبلغ، وعند السؤال أنت ومن معك تجيبون عن الدار."}</div></div>`;
  if (P === "bid") return mzBidBody(S, t, iNeg, negName);
  if (P === "sold" || P === "nobid") {
    const b = S.lead;
    return `${mzLotMini(S)}<div class="mz-res"><div class="big">${P === "nobid" ? "لا عروض" : b === t ? "الصفقة لكم!" : `الصفقة لـ${mzName(b)}`}</div>${P === "sold" ? `<span class="mz-led">${mzN(S.price)}<small>دينار</small></span>` : ""}<span class="mz-muted">${P === "nobid" ? "ما دخلها أحد، فأُلغيت" : b === t ? "السؤال جاي. يجيب المستشارون، والمفاوض يتفرّج." : "تقدرون تجاوبون بعد، والصحيحة تعطيكم مكافأة ٥٠"}</span></div>`;
  }
  if (P === "q" || P === "res") {
    const b = S.lead, buyer = b === t, mates = mzMemb(S, t), myVotes = (S.votes || {})[t] || {};
    const voters = mates.length > 1 ? mates.filter((p) => p.id !== nid) : mates, iVote = voters.some((p) => p.id === PID);
    const gain = L.gold ? 2 * S.price : S.price;
    const top = buyer ? `<div class="mz-card" style="text-align:center"><b>دخلتم الصفقة بـ ${mzN(S.price)}</b><div class="mz-muted">الصحيحة ${mzSG(gain)}، والخاطئة ${mzSG(-S.price)}</div></div>` : `<div class="mz-card" style="text-align:center"><b>${mzName(b)} دخلت الصفقة</b><div class="mz-muted">جاوبوا بعد: الصحيحة تعطيكم مكافأة ٥٠</div></div>`;
    const who = (k) => voters.filter((p) => myVotes[p.id] === k).map((p) => face(p, 22)).join("");
    if (P === "q") {
      const head = !iVote ? `<div class="mz-watch">أنت المفاوض: زايدت، و<b>أصحابك يجيبون</b>. لا تصوّت، وساعدهم بالكلام بس!</div>` : `<div class="mz-now">${voters.length === 1 ? "أنت تجيب عن الدار." : `المستشارون يصوّتون، و<b>جواب الأغلبية</b> هو جواب داركم.${nid && mates.length > 1 ? ` ${negName} المفاوض لا يجيب.` : ""}`}</div>`;
      const mine = KL.my.vote ?? myVotes[PID];
      return `${top}${head}<div class="mz-q">${esc(S.q.q)}</div><div class="mz-tline"><i data-mz="bar"></i></div>
        <div class="mz-opts">${S.q.o.map((o, k) => iVote ? `<button type="button" class="mz-opt" data-mzv="${k}" aria-pressed="${mine === k}"><span>${esc(o)}</span><span class="vv">${who(k)}</span></button>` : `<div class="mz-opt"><span>${esc(o)}</span><span class="vv">${who(k)}</span></div>`).join("")}</div>
        <p class="mz-muted" style="text-align:center"><span data-mz="secs"></span> ثانية</p>`;
    }
    const d = S.delta[t], f = S.final[t];
    return `<div class="mz-q">${esc(S.q.q)}</div><div class="mz-opts">${S.q.o.map((o, k) => `<div class="mz-opt ${k === S.ans ? "ok" : k === f ? "no" : ""}"><span>${esc(o)}</span><span class="vv">${who(k)}</span></div>`).join("")}</div>
      <div class="mz-res"><div class="big ${d > 0 ? "plus" : d < 0 ? "minus" : ""}">${d ? mzSG(d) : "ما تغيّر شي"}</div><span class="mz-muted">${buyer ? (S.ok[t] ? "نجحت الصفقة: رجع رأس المال ومعه الربح" : f < 0 ? "ما جاوبتم، فخسرت الصفقة: راح رأس المال للسوق" : "خسرت الصفقة: راح رأس المال للسوق") : S.ok[t] ? "مكافأة السوق على الإجابة الصحيحة" : "ما أصبتم هالمرة"}</span></div>`;
  }
  if (P === "broke") {
    const mem = mzMemb(S, S.broke);
    if (S.broke !== t) return `<div class="mz-now"><b>${mzName(S.broke)}</b> نفد مالها، وتختار: تعرض عقد عمل أحد أعضائها، أو تاخذ قرضًا حسنًا.</div><div class="mz-res">${mzEmb(S.broke, "xl")}<span class="mz-led red">${mzN(S.cash[S.broke])}</span><span class="mz-chipst broke">مفلسة</span></div>`;
    return `<div class="mz-now">نفد مالكم! اختاروا واحد من اثنين، وأي واحد منكم يقدر يختار:</div>
      <div class="mz-card"><b>عقد عمل</b><div class="mz-muted">واحد منكم يعمل مع الدار اللي تدفع أكثر، والأجرة لداركم.</div><div class="mz-sell">${mem.map((p) => `<button type="button" class="mz-btn ghost" data-mzsell="${esc(p.id)}">${face(p, 28)}<span>اعرض عقد ${esc(p.name)}</span></button>`).join("")}</div></div>
      <div class="mz-card"><b>قرض حسن</b><div class="mz-muted">${mzN(mzLoanAmt(S))} دينار من بيت المال، تُردّ في النهاية بلا زيادة.</div><button type="button" class="mz-btn" id="mzLoan">خذوا القرض الحسن</button></div>
      <p class="mz-muted" style="text-align:center">إذا ما اخترتم خلال <span data-mz="secs"></span> ثانية، ياخذون لكم القرض.</p>`;
  }
  if (P === "mkt" || P === "mkt2") {
    const s = S.sale, lead = s.lead;
    const head = `<div class="mz-now">${s.t === t ? "نفد مالكم! عرضتم <b>عقد عمل</b>." : `<b>سوق العقود:</b> نفد مال ${mzName(s.t)}، وتعرض عقد عمل.`}</div><div class="mz-card mz-crow">${face(s, 64)}<div><span class="mz-muted">عقد عمل</span><div class="mz-h">${esc(s.name)}</div><span class="mz-muted">من ${mzName(s.t)}، والأجرة لها</span></div></div>
      <div class="mz-price"><div class="top"><span>سعر العقد</span>${P === "mkt" ? '<span class="pcall" data-mz="call"></span>' : ""}</div><span class="n">${s.price ? mzN(s.price) : "—"} <small>دينار</small></span><span class="by">${lead >= 0 ? `${mzEmb(lead)}${lead === t ? "داركم" : mzName(lead)}` : "لا عروض"}</span>${P === "mkt" ? '<div class="mz-pbar"><i data-mz="bar"></i></div>' : ""}</div>`;
    if (P === "mkt2") return `${head}<div class="mz-res"><div class="big">${esc(s.name)} يعمل الآن مع ${mzName(lead)}</div></div>`;
    if (s.t === t) return `${head}<div class="mz-card mz-muted">انتظروا العروض…</div>`;
    if (!iNeg) return `${head}<div class="mz-card mz-muted">${negName} هو المفاوض، وهو اللي يقرر التعاقد.</div>`;
    const nx = (a) => (s.price || 0) + a * S.step, max = S.cash[t] - 100;
    return `${head}<div class="mz-bids">${[1, 2, 3].map((a) => `<button type="button" class="mz-bid" data-mzbuy="${nx(a)}" ${lead === t || nx(a) > max ? "disabled" : ""}>${mzN(nx(a))}<small>دينار</small></button>`).join("")}</div><p class="mz-muted">تدفعون من رأس مالكم، ويبقى معكم ١٠٠ على الأقل.</p>`;
  }
  if (P === "loan") {
    const l = S.loanT;
    return `<div class="mz-res"><div class="big">قرض حسن لـ${mzName(l.t)}</div><span class="mz-led">${mzN(l.a)}<small>دينار</small></span><span class="mz-muted">${l.why === "nobody" ? "ما تقدّم أحد على العقد، فأقرضهم بيت المال" : l.why === "solo" ? "الدار ما فيها غير عضو واحد، فأقرضها بيت المال" : "من بيت المال"}، وتُردّ ${mzN(l.a)} في النهاية بلا زيادة</span></div><div class="mz-card mz-muted">كل زيادة مشروطة في القرض ربا، لذلك يُردّ القرض كما هو.</div>`;
  }
  return "";
}
function mzBidBody(S, t, iNeg, negName) {
  const lead = S.lead, mine = lead === t, my = mzMine(), cash = S.cash[t], step = S.step;
  const sugg = my.sugg.filter((s) => s.id !== PID), sent = my.sugg.find((s) => s.id === PID);
  if (S.btype === "dutch") {
    const box = `<div class="mz-price"><div class="top"><span>مزاد تنازلي</span><span class="pcall">ينزل كل ثانية</span></div><span class="n">${mzN(S.price)} <small>دينار ↓</small></span><span class="by">${lead >= 0 ? `${mzEmb(lead)}${mine ? "أخذتوها!" : `أخذتها ${mzName(lead)}`}` : "ما أخذها أحد للحين"}</span></div>`;
    if (iNeg) return `${mzLotMini(S)}${box}<div class="mz-bids"><button type="button" class="mz-bid all" id="mzTake" ${lead >= 0 || cash < S.price ? "disabled" : ""}>خذها بـ${mzN(S.price)}<small>${cash < S.price ? "مالكم ما يكفي للحين" : "كل ما انتظرت رخصت، وممكن يسبقك غيرك"}</small></button></div>${sugg.length ? `<div class="mz-sugg">${sugg.map((s) => `<div>${face(mzP(S, s.id), 26)}<span>${esc(s.name)}: خذها الحين!</span></div>`).join("")}</div>` : ""}`;
    return `${mzLotMini(S)}${box}<div class="mz-now">${negName} هو اللي يضغط. قل له متى ياخذها.</div><div class="mz-bids"><button type="button" class="mz-bid adv all" data-mzsug="${S.price}" ${lead >= 0 || sent ? "disabled" : ""}>قل له: خذها الحين!<small>${sent ? "وصله اقتراحك" : `بـ${mzN(S.price)} دينار`}</small></button></div>`;
  }
  if (S.btype === "sealed") {
    if (S.reveal) {
      return `${mzLotMini(S)}<div class="mz-price"><div class="top"><span>كُشفت العروض</span></div>${S.teams.map((x) => `<span class="by">${mzEmb(x)}${mzName(x)}<b style="margin-inline-start:auto">${S.reveal[x] ? mzN(S.reveal[x]) : "ما عرضت"}</b></span>`).join("")}</div>
        <div class="mz-res"><div class="big">${lead < 0 ? "ما أحد عرض" : mine ? "عرضكم الأعلى!" : `الأعلى: ${mzName(lead)}`}</div></div>`;
    }
    const n = S.teams.filter((x) => S.sealedIn[x]).length;
    const sb = `<div class="mz-price"><div class="top"><span>عرض سري</span><span class="pcall">${AR(n)} من ${AR(S.teams.length)} قدّموا</span></div><span class="n">${my.sealed != null ? (my.sealed ? mzN(my.sealed) : "ما عرضتم") : "؟"} <small>دينار</small></span><span class="by">ما تشوف عروض الدُّور الثانية لين تنكشف</span><div class="mz-pbar"><i data-mz="bar"></i></div></div>`;
    const amts = [1, 2, 3, 4, 5, 7].map((a) => a * step).filter((a) => a <= cash);
    if (S.sealedIn[t]) return `${mzLotMini(S)}${sb}<div class="mz-card mz-muted">قدّمت داركم عرضها. ننتظر البقية…</div>`;
    if (iNeg) return `${mzLotMini(S)}${sb}<div class="mz-now">عرض واحد بس، وما ينفع تغيّره.</div><div class="mz-sealrow">${amts.map((a) => `<button type="button" class="mz-bid" data-mzseal="${a}">${mzN(a)}<small>دينار</small></button>`).join("")}${cash > amts[amts.length - 1] ? `<button type="button" class="mz-bid all" data-mzseal="${cash}">كل ما لدينا<small>${mzN(cash)} دينار</small></button>` : ""}<button type="button" class="mz-bid ghost all" data-mzseal="0">لا نعرض</button></div>${sugg.length ? `<div class="mz-sugg">${sugg.map((s) => `<div>${face(mzP(S, s.id), 26)}<span>${esc(s.name)}: اعرض ${mzN(s.amount)}</span><button type="button" data-mzseal="${s.amount}" ${s.amount > cash || s.amount < 100 ? "disabled" : ""}>اعرض</button></div>`).join("")}</div>` : ""}`;
    return `${mzLotMini(S)}${sb}<div class="mz-now">${negName} بيقدّم عرض واحد. اقترح عليه مبلغ.</div><div class="mz-sealrow">${amts.map((a) => `<button type="button" class="mz-bid adv" data-mzsug="${a}">اقترح ${mzN(a)}</button>`).join("")}</div>${sent ? `<div class="mz-card mz-muted">أرسلت لـ${negName}: ${mzN(sent.amount)}</div>` : ""}`;
  }
  const base = S.price || 0, opts = base ? [1, 2.5, 5] : [1, 3, 5], val = (a) => base + a * step;
  const price = `<div class="mz-price"><div class="top"><span>العرض الحالي</span><span class="pcall" ${mine ? "" : 'data-mz="call"'}>${mine ? "عرضكم الأعلى" : ""}</span></div><span class="n">${base ? mzN(base) : "—"} <small>دينار</small></span><span class="by">${lead >= 0 ? `${mzEmb(lead)}${mine ? "داركم" : mzName(lead)}` : "لا عروض للحين"}</span><div class="mz-pbar"><i data-mz="bar"></i></div></div>`;
  if (iNeg) {
    const sg = sugg.filter((s) => s.amount > base && !mine);
    return `${mzLotMini(S)}${price}<div class="mz-bids">${opts.map((a) => `<button type="button" class="mz-bid" data-mzbid="${val(a)}" ${val(a) > cash || mine ? "disabled" : ""}>${base ? `زِد ${mzN(a * step)}` : mzN(val(a))}<small>${base ? `= ${mzN(val(a))}` : "افتح المزاد"}</small></button>`).join("")}<button type="button" class="mz-bid all" data-mzbid="${cash}" ${cash <= base || cash < 100 || mine ? "disabled" : ""}>كل ما لدينا<small>${mzN(cash)} دينار</small></button></div>
      ${sg.length ? `<div class="mz-sugg">${sg.map((s) => `<div>${face(mzP(S, s.id), 26)}<span>${esc(s.name)}: اعرض ${mzN(s.amount)}</span><button type="button" data-mzbid="${s.amount}" ${s.amount > cash ? "disabled" : ""}>اعرض</button></div>`).join("")}</div>` : '<p class="mz-muted">تطلع هنا اقتراحات أصحابك.</p>'}`;
  }
  return `${mzLotMini(S)}${price}<div class="mz-now">${negName} هو اللي يزايد. اختر مبلغ، ويطلع له اقتراحك.</div><div class="mz-bids">${opts.map((a) => `<button type="button" class="mz-bid adv" data-mzsug="${val(a)}" ${val(a) > cash || mine ? "disabled" : ""}>اقترح ${mzN(val(a))}<small>${base ? `زيادة ${mzN(a * step)}` : "يفتح المزاد"}</small></button>`).join("")}</div>${sent ? `<div class="mz-card mz-muted">أرسلت لـ${negName}: اعرض ${mzN(sent.amount)}${sent.done ? "، وأخذ باقتراحك!" : ""}</div>` : ""}`;
}
function mzBind(S, t) {
  const on = (sel, fn) => screen.querySelectorAll(sel).forEach((b) => (b.onclick = () => { if (!b.disabled) fn(b); }));
  on("[data-mzbid]", (b) => { beep(880, 0.06); buzz(30); act({ t: "mzbid", id: PID, amount: +b.dataset.mzbid }); });
  on("#mzTake", () => { beep(988, 0.08); buzz(40); act({ t: "mztake", id: PID }); });
  on("[data-mzseal]", (b) => { beep(880, 0.06); act({ t: "mzseal", id: PID, amount: +b.dataset.mzseal }); screen.querySelectorAll("[data-mzseal]").forEach((x) => (x.disabled = true)); });
  on("[data-mzsug]", (b) => {
    const a = +b.dataset.mzsug; beep(700, 0.05);
    const m = mzMine(); KL.my.mz = { ...m, sid: S.sid, k: S.k, sugg: m.sugg.filter((s) => s.id !== PID).concat({ id: PID, name: me.name, amount: a }) };
    act({ t: "mzsug", id: PID, amount: a }); renderPhase(KL.S, false);
  });
  on("[data-mzv]", (b) => { KL.my.vote = +b.dataset.mzv; beep(660, 0.05); act({ t: "mzvote", id: PID, k: KL.my.vote }); screen.querySelectorAll("[data-mzv]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  on("[data-mzsell]", (b) => { beep(760, 0.06); act({ t: "mzsell", id: PID, who: b.dataset.mzsell }); });
  on("#mzLoan", () => { beep(660, 0.06); act({ t: "mzloan", id: PID }); });
  on("[data-mzbuy]", (b) => { beep(880, 0.06); act({ t: "mzbuy", id: PID, amount: +b.dataset.mzbuy }); });
}
function mzvEnd(S, fresh) {
  const t = mzTeamOf(S, PID), A = S.awards || {};
  if (fresh) { clearKL(); if (S.rank[0] === t) { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); } else beep(262, 0.4, "triangle", 0.12); }
  setTop("النهاية"); mzTitle();
  const net = (x) => S.cash[x] - S.loan[x], pos = S.rank.indexOf(t) + 1;
  show(`${S.teams.includes(t) ? mzHead(S, t) : ""}<div class="mz-body">
    ${pos ? `<div class="mz-res"><div class="big">${pos === 1 ? "أنتم الأغنى!" : `المركز ${AR(pos)}`}</div><span class="mz-led">${mzN(net(t))}<small>دينار</small></span>${S.loan[t] ? `<span class="mz-muted">بعد ردّ القرض الحسن ${mzN(S.loan[t])} بلا زيادة</span>` : ""}</div>` : ""}
    <div class="mz-card mz-rank">${S.rank.map((x, k) => `<div class="${x === t ? "me" : ""}"><span class="rk">${AR(k + 1)}</span>${mzEmb(x)}<b>${mzName(x)}</b><span class="mz-led sm">${mzN(net(x))}</span></div>`).join("")}</div>
    <div class="mz-awards">${mzAwards(S).map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join("")}</div>
    ${isHost() ? '<button type="button" class="mz-btn" id="mzAgain">مزاد جديد بنفس الربع</button>' : '<p class="mz-muted" style="text-align:center">المضيف يقدر يبدأ مزاد جديد.</p>'}
    <button type="button" class="mz-btn ghost" id="mzHome">رجوع لفسحة</button></div>`);
  if ($("mzAgain")) $("mzAgain").onclick = () => hostAgain();
  $("mzHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}
const mzAwards = (S) => { const A = S.awards || {}; return [["أجرأ عرض", A.bold ? `${mzName(A.bold.t)}، ${mzN(A.bold.amount)}` : "ما فيه"], ["أغلى عقد عمل", A.dear ? `${esc(A.dear.name)}، ${mzN(A.dear.amount)}` : "ما صار انتقال"], ["أكثر دار أصابت", A.most ? `${mzName(A.most.t)}، ${AR(A.most.n)}` : "ما فيه"]]; };
ROOM_GAMES.mazad.views = { show: mzvPlay, bid: mzvPlay, sold: mzvPlay, nobid: mzvPlay, q: mzvPlay, res: mzvPlay, broke: mzvPlay, mkt: mzvPlay, mkt2: mzvPlay, loan: mzvPlay, end: mzvEnd };

// ---------------- the big screen: the lot card, the price panel, and every house's standing ----------------
ROOM_GAMES.mazad.tvTeams = (S) => Array.from({ length: S.nt || 3 }, (_, t) => ({ n: MZ_HOUSES[t].n, c: MZ_HOUSES[t].c, ps: S.players.filter((p) => mzTeamOf(S, p.id) === t) }));
function mztLotCard(S, anim, stampIn) {
  const L = S.lots[S.k], open = ["sold", "q", "res"].includes(S.phase);
  return `<div class="mz-lotcard ${L.gold ? "gold" : ""} ${anim ? "in" : ""}">${L.big ? '<span class="ribbon">الصفقة الكبرى: ربحها مضاعف</span>' : L.gold ? '<span class="ribbon">ذهبية: ربحها مضاعف</span>' : ""}
    <span class="no">الصفقة</span><span class="num">${AR(S.k + 1)}<small> من ${AR(S.lots.length)}</small></span>
    <span class="ci">${mzVIcon(L.v)}</span><span class="cat">${L.v}</span><span class="diff">سؤالها في «${L.cat}» ${mzStars(L.stars)}</span>
    <span class="terms"><span><span>إن أصبتم</span><span class="p">ربح ${mzGain(L)}</span></span><span><span>إن أخطأتم</span><span class="n">يذهب رأس المال</span></span></span>
    <span class="ttype">${MZ_TYPES[L.type][0]}</span>${open ? MZ_SEAL.replace("mz-seal", `mz-seal ${stampIn ? "anim" : ""}`) : ""}</div>`;
}
function mztLanes(S, mk) {
  const s = S.sale, price = mk ? s.price : S.price, leadT = mk ? s.lead : S.lead, inBid = S.phase === "bid";
  const list = mk ? S.teams.filter((t) => t !== s.t) : S.teams;
  return `<div class="mz-lanes" style="--n:${list.length}">${list.map((t) => {
    const lead = leadT === t, ty = mk ? "open" : S.btype, cash = S.cash[t], nid = S.neg && S.neg[t], np = nid ? mzP(S, nid) : null;
    const out = !lead && (ty === "dutch" ? cash < price : ty === "sealed" ? cash < 100 : mk ? cash - 100 < (price || 0) + S.step : cash < (price ? price + 1 : 100));
    let lb, tag;
    if (inBid && ty === "sealed") { lb = S.reveal ? (S.reveal[t] ? mzN(S.reveal[t]) : "—") : S.sealedIn[t] ? "●●●" : "—"; tag = S.reveal ? (S.reveal[t] ? (lead ? "الأعلى" : "عرضها") : "ما عرضت") : S.sealedIn[t] ? "قدّمت عرضها" : "تفكّر…"; }
    else if (inBid && ty === "dutch" && !lead) { lb = "—"; tag = out ? "مالها ما يكفي" : "تنتظر"; }
    else { const last = mk ? s.bids[t] : S.lastBid[t]; lb = last ? mzN(last) : "—"; tag = lead ? (ty === "dutch" ? "أخذتها!" : "أعلى عرض") : out ? "مالها ما يكفي" : last ? "تجاوزها غيرها" : "ما عرضت"; }
    return `<div class="mz-lane ${lead ? "lead" : ""} ${out ? "out" : ""}">${lead ? MZ_PAD(MZ_HOUSES[t].c) : ""}${mzEmb(t)}${np ? `<span class="ng">${face(np, 34)}</span>` : ""}<b>${mzName(t)}</b><small>المفاوض: ${np ? esc(np.name) : "—"}</small><span class="lb">${lb}</span><span class="tag">${tag}</span></div>`;
  }).join("")}</div>`;
}
function mztPanel(S) {
  const P = S.phase, L = S.lots[S.k];
  if (P === "show") return `<div class="mz-panel"><span class="lab">صفقة جديدة على الطاولة</span><div class="mz-venture">${L.v}</div><span class="lab">${MZ_TYPES[L.type][0]}: ${MZ_TYPES[L.type][1]}</span><span class="lab">مفاوضو هذه الصفقة: يزايدون ولا يجيبون</span>
    <div class="mz-negs">${S.teams.map((t) => { const np = S.neg[t] ? mzP(S, S.neg[t]) : null; return `<div>${mzEmb(t)}${np ? face(np, 40) : ""}<span>${np ? esc(np.name) : "—"}<small>${mzName(t)}</small></span></div>`; }).join("")}</div></div>`;
  if (P === "bid" && S.btype === "dutch") return `<div class="mz-panel"><span class="lab">مزاد تنازلي: السعر ينزل، وأول مفاوض يضغط «خذها» يأخذها</span><div class="prow"><div class="mz-led big">${mzN(S.price)}<small>دينار ↓</small></div></div>${mztLanes(S, false)}</div>`;
  if (P === "bid" && S.btype === "sealed") {
    const n = S.teams.filter((t) => S.sealedIn[t]).length;
    return `<div class="mz-panel"><span class="lab">عرض سري: كل مفاوض يقدّم عرضًا واحدًا من جواله</span><div class="prow"><div class="mz-led big ${S.reveal && S.lead >= 0 ? "bump" : "dim"}">${S.reveal ? (S.lead >= 0 ? mzN(S.price) : "—") : "؟ ؟ ؟"}<small>دينار</small></div>${S.reveal ? "" : `<div class="mz-ring"><svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="46"/><circle class="fg" cx="50" cy="50" r="46" data-mz="ring"/></svg><span class="call">${AR(n)} من ${AR(S.teams.length)}</span></div>`}</div>${mztLanes(S, false)}</div>`;
  }
  if (["bid", "sold", "nobid", "mkt", "mkt2"].includes(P)) {
    const mk = P === "mkt" || P === "mkt2", price = mk ? S.sale.price : S.price;
    return `<div class="mz-panel"><span class="lab">${mk ? "سعر العقد" : "العرض الحالي"}</span><div class="prow"><div class="mz-led big ${price ? "" : "dim"}">${price ? mzN(price) : "—"}<small>دينار</small></div>${P === "bid" || P === "mkt" ? mzRing("") : ""}</div>${mztLanes(S, mk)}</div>`;
  }
  if (P === "q" || P === "res") {
    const b = S.lead, done = P === "res", gain = L.gold ? 2 * S.price : S.price;
    const who = (k) => S.teams.filter((t) => S.final && S.final[t] === k).map((t) => mzEmb(t)).join("");
    const answered = S.teams.filter((t) => { const v = (S.votes || {})[t] || {}; return Object.keys(v).length > 0; }).length;
    return `<div class="mz-panel qpanel"><div class="buyer">${mzEmb(b)}${mzName(b)} دخلت الصفقة بـ ${mzN(S.price)}<span class="stakes"><span class="p">صحيح ${mzSG(gain)}</span><span class="n">خطأ ${mzSG(-S.price)}</span></span></div>
      <div class="q">${esc(S.q.q)}</div><div class="qopts">${S.q.o.map((o, k) => `<div class="${done ? (k === S.ans ? "ok" : "no") : ""}">${esc(o)}<span class="vs">${done ? who(k) : ""}</span></div>`).join("")}</div>
      ${done ? `<div class="verdict ${S.ok[b] ? "p" : "n"}">${S.ok[b] ? `نجحت الصفقة! ${mzName(b)} ربحت ${mzSG(S.delta[b])}` : `خسرت الصفقة: ${mzName(b)} ${mzSG(S.delta[b])}`}</div>` : `<div class="tbar"><i data-mz="bar"></i></div><div class="lab" style="text-align:center">المستشارون يجيبون، والمفاوضون لا يجيبون. ${AR(answered)} من ${AR(S.teams.length)} بدأت تصوّت · <b data-mz="secs"></b></div>`}</div>`;
  }
  if (P === "broke" || P === "loan") {
    const t = P === "loan" ? S.loanT.t : S.broke;
    return `<div class="mz-panel center">${mzEmb(t, "xl")}<span class="mz-led big ${P === "broke" ? "red" : ""}">${mzN(S.cash[t])}<small>دينار</small></span>${P === "broke" ? `<span class="mz-chipst broke">مفلسة</span><span class="lab">${mzName(t)} تختار: عقد عمل أحد أعضائها، أو قرض حسن من بيت المال · <b data-mz="secs"></b></span>` : `<span class="lab">قرض حسن ${mzN(S.loanT.a)} من بيت المال، يُردّ في النهاية بلا زيادة</span>`}</div>`;
  }
  return "";
}
function mztBoard(S) {
  const P = S.phase, rank = S.teams.slice().sort((a, b) => S.cash[b] - S.cash[a]), max = Math.max(...S.teams.map((t) => S.cash[t]), S.cap);
  const status = (t) => {
    if (S.cash[t] < 100) return '<span class="mz-chipst broke">مفلسة</span>';
    if ((P === "bid" || P === "sold") && S.lead === t) return '<span class="mz-chipst lead">أعلى عرض</span>';
    if ((P === "q" || P === "res") && S.lead === t) return '<span class="mz-chipst lead">دخلت الصفقة</span>';
    if (P === "q") return `<span class="mz-chipst">${Object.keys((S.votes || {})[t] || {}).length ? "تصوّت" : "تفكّر…"}</span>`;
    return "";
  };
  return `<h4>الترتيب<small>رأس المال ${mzN(S.cap)}</small></h4>${rank.map((t, i) => `<div class="mz-brow ${(P === "bid" || P === "sold") && S.lead === t ? "lead" : ""}" style="--c:${MZ_HOUSES[t].c}"><span class="rk">${AR(i + 1)}</span>${mzEmb(t)}<div style="min-width:0"><div class="nm"><span>${mzName(t)}</span>${status(t)}</div><div class="cash">${mzN(S.cash[t])}${P === "res" && S.delta && S.delta[t] ? `<span class="delta ${S.delta[t] > 0 ? "p" : "n"}">${mzSG(S.delta[t])}</span>` : ""}</div><div class="meter"><i style="width:${Math.max(2, (Math.max(0, S.cash[t]) / max) * 100)}%"></i></div>
    <div class="who">${mzMemb(S, t).map((p) => `<span class="${S.neg && S.neg[t] === p.id ? "neg" : ""}">${face(p, 24)}</span>`).join("")}${S.loan[t] ? `<span class="loan">قرض حسن ${mzN(S.loan[t])}</span>` : ""}</div></div></div>`).join("")}`;
}
function mztHead(S) {
  const pi = mzPhIdx(S.phase);
  return `<div class="mz-th"><div class="mz-logo">${MZ_GICON}<div><b>مزاد الأسئلة</b><small>${S.phase === "end" ? "انتهى المزاد" : `الصفقة ${AR(S.k + 1)} من ${AR(S.lots.length)}`}</small></div></div>
      <div class="mz-lots">${S.lots.map((L, k) => `<i class="${k < S.k || S.phase === "end" ? "done" : k === S.k ? "now" : ""} ${L.gold ? "g" : ""}">${AR(k + 1)}</i>`).join("")}</div>
      <div class="mz-phs">${S.phase === "end" ? "" : MZ_PH.map(([, n], i) => `<span class="${i === pi ? "on" : ""}">${n}</span>`).join("")}</div></div>`;
}
function mztPlay(S, fresh) {
  const P = S.phase, mk = P === "mkt" || P === "mkt2";
  const left = mk ? `<div class="mz-contract ${fresh ? "in" : ""}"><span class="k">عقد عمل</span>${face(S.sale, 120)}<span class="nm">${esc(S.sale.name)}</span><span class="from">من ${mzEmb(S.sale.t)} ${mzName(S.sale.t)}</span><span class="sig">يعمل مع من يدفع أكثر، والأجرة لـ${mzName(S.sale.t)}</span></div>` : mztLotCard(S, fresh && P === "show", fresh && P === "sold");
  const stamp = P === "sold" ? '<div class="mz-sold"><span>عُقدت!</span></div>' : P === "mkt2" ? `<div class="mz-sold"><span class="ok">يعمل مع ${mzName(S.sale.lead)}!</span></div>` : P === "nobid" ? '<div class="mz-sold"><span>أُلغيت</span></div>' : "";
  const narr = mzNarr(S);
  return { html: `<div class="mzt">${mztHead(S)}
    <div class="mz-main"><div class="mz-stage"><div>${left}</div><div>${mztPanel(S)}</div></div><div class="mz-board">${mztBoard(S)}</div></div>
    ${narr ? `<div class="mz-narr"><div>${narr}</div></div>` : ""}${fresh ? stamp : stamp.replace("mz-sold", "mz-sold still")}</div>`,
    after: () => { const tv = $("tv"); clearInterval(KL.mzT); mzTickEls(tv); KL.mzT = setInterval(() => (KL.S && KL.S.game === "mazad" ? mzTickEls(tv) : clearInterval(KL.mzT)), 200); } };
}
function mztEnd(S) {
  const net = (x) => S.cash[x] - S.loan[x], r = S.rank, order = [r[1], r[0], r[2]].filter((x) => x !== undefined), HT = [11, 7.5, 5];
  return `<div class="mzt">${mztHead(S)}<div class="mz-endh"><small>انتهى المزاد</small><b>${mzName(r[0])} الأغنى!</b></div>
    <div class="mz-podium">${order.map((t) => { const k = r.indexOf(t); return `<div class="pp" style="animation-delay:${0.3 + (2 - k) * 0.35}s">${k === 0 ? `<span class="crown">${MZ_ICON.crown}</span>` : ""}${mzEmb(t, k === 0 ? "p1" : "p2")}<b>${mzName(t)}</b><span class="mz-led">${mzN(net(t))}</span>${S.loan[t] ? `<small>بعد ردّ قرض ${mzN(S.loan[t])}</small>` : ""}<div class="blk" style="height:${HT[k]}cqw">${AR(k + 1)}</div></div>`; }).join("")}</div>
    <div class="mz-endaw">${mzAwards(S).map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join("")}</div>${r.length > 3 ? `<div class="mz-endrest">${r.slice(3).map((t, k) => `<span>${AR(k + 4)}. ${mzName(t)} ${mzN(net(t))}</span>`).join("")}</div>` : ""}</div>`;
}
ROOM_GAMES.mazad.tv = { show: mztPlay, bid: mztPlay, sold: mztPlay, nobid: mztPlay, q: mztPlay, res: mztPlay, broke: mztPlay, mkt: mztPlay, mkt2: mztPlay, loan: mztPlay, end: mztEnd };
