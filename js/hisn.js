"use strict";
// ================= حرب الكراريس: battleships on the squared exercise-book paper =================
// Each team hides its fort (a commander, soldiers, heavy guns, a shield, a bomb, a radar) on its grid.
// Every question goes to all teams at once; each team that answers right gets a shot, fired by all of
// them together and resolved fastest first. The commander takes two hits; the last fort standing wins.
// A fort never goes into the shared snapshot: the host sends each team its own board, and everyone
// sees only the marks the shots have left.

const HZ_TEAMS = [{ n: "الأزرق", c: "#1d3fb8" }, { n: "الأحمر", c: "#c8232c" }, { n: "الأخضر", c: "#1f8a53" }, { n: "البنفسجي", c: "#6b3fb8" }, { n: "البرتقالي", c: "#d9730d" }];
const HZ_ROWS = ["أ", "ب", "ج", "د", "هـ", "و"];
const HZ_KINDS = ["cmd", "sol", "gun", "shd", "bmb", "rdr"];
const HZ_NAME = { cmd: "القائد", sol: "جندي", gun: "سلاح ثقيل", shd: "درع", bmb: "قنبلة", rdr: "رادار" };
const HZ_PTS = { sol: 20, gun: 40, rdr: 30, cmd: 0, shd: 0, bmb: 0 };
const HZ_SET = { 4: { cmd: 1, sol: 3, gun: 1, shd: 1, bmb: 1, rdr: 0, min: 4 }, 5: { cmd: 1, sol: 4, gun: 2, shd: 1, bmb: 1, rdr: 1, min: 5 }, 6: { cmd: 1, sol: 6, gun: 2, shd: 2, bmb: 2, rdr: 1, min: 7 } };
// minutes a match usually lasts, from a simulation of thousands of games (hisn_sim.py): [size][teams]
const HZ_EST = { 4: [0, 0, 7, 9, 12, 14], 5: [0, 0, 9, 13, 16, 19], 6: [0, 0, 12, 19, 23, 27] };
const hzAutoSize = (nt) => (nt <= 2 ? 6 : nt === 3 ? 5 : 4);
const hzSize = (S) => (S.size === "auto" ? hzAutoSize(S.nt) : +S.size);
const hzName = (n, c) => HZ_ROWS[Math.floor(c / n)] + AR((c % n) + 1);
const hzTeamOf = (S, id) => (S.hteams || {})[id] ?? -1;
const hzN4 = (n, c) => { const r = Math.floor(c / n), q = c % n; return [[r - 1, q], [r + 1, q], [r, q - 1], [r, q + 1]].filter(([a, b]) => a >= 0 && a < n && b >= 0 && b < n).map(([a, b]) => a * n + b); };
const hzN8 = (n, c) => { const r = Math.floor(c / n), q = c % n, o = []; for (let a = r - 1; a <= r + 1; a++) for (let b = q - 1; b <= q + 1; b++) if ((a !== r || b !== q) && a >= 0 && a < n && b >= 0 && b < n) o.push(a * n + b); return o; };
// what's still to place, and whether a board is complete and within the rules
function hzLeft(n, cells) { const left = { ...HZ_SET[n] }; delete left.min; cells.forEach((st) => st.forEach((k) => left[k]--)); return left; }
function hzCheck(n, cells) {
  if (!Array.isArray(cells) || cells.length !== n * n) return { ok: false };
  const left = hzLeft(n, cells);
  if (cells.some((st) => !Array.isArray(st) || st.length > 3 || st.some((k) => !HZ_KINDS.includes(k)))) return { ok: false };
  if (HZ_KINDS.some((k) => left[k] < 0)) return { ok: false };
  const used = cells.filter((st) => st.length).length, done = HZ_KINDS.every((k) => left[k] === 0);
  return { ok: true, done, used, enough: used >= HZ_SET[n].min, ready: done && used >= HZ_SET[n].min };
}
function hzRandom(n) {
  const set = HZ_SET[n], items = shuffled(HZ_KINDS.flatMap((k) => Array(set[k]).fill(k)));
  const used = Math.min(items.length, set.min + Math.floor(Math.random() * (items.length - set.min + 1)));
  const spots = shuffled([...Array(n * n).keys()]).slice(0, used), cells = Array.from({ length: n * n }, () => []);
  items.forEach((k, i) => { const c = i < used ? spots[i] : pickOne(spots.filter((s) => cells[s].length < 3)); cells[c].push(k); });
  return cells;
}
// the pieces, drawn in one style: navy outline, the team's colour, yellow details (currentColor is the team)
const HZ_SYMBOLS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<symbol id="hz-cmd" viewBox="0 0 40 40"><path d="M9 39v-5q0-6 11-6t11 6v5z" fill="currentColor" stroke="#1b2a4a" stroke-width="1.6" stroke-linejoin="round"/><path d="M9.5 31.5l4-1.6M30.5 31.5l-4-1.6" stroke="#ffc933" stroke-width="2.6" stroke-linecap="round"/><path d="M15.5 32.5l1.6 3.4M18.6 32.5l-1.5 3.4" stroke="#c8232c" stroke-width="1.3"/><circle cx="17.1" cy="36.2" r="1.7" fill="#ffc933" stroke="#1b2a4a" stroke-width=".8"/><circle cx="20" cy="21.4" r="6.9" fill="#f2c39b" stroke="#1b2a4a" stroke-width="1.6"/><circle cx="17.5" cy="21.2" r="1.05" fill="#1b2a4a"/><circle cx="22.5" cy="21.2" r="1.05" fill="#1b2a4a"/><path d="M16.2 24.6q1.9-1.5 3.8 0q1.9-1.5 3.8 0" fill="#1b2a4a" stroke="#1b2a4a" stroke-width="1.2" stroke-linejoin="round"/><path d="M19.4 6.5q-1.5-3.6 1.8-4.5q.4 2.6 1.8 4.3" fill="#c8232c" stroke="#1b2a4a" stroke-width="1.2" stroke-linejoin="round"/><path d="M10.6 19.4q0-11.6 9.4-11.6t9.4 11.6z" fill="currentColor" stroke="#1b2a4a" stroke-width="1.6" stroke-linejoin="round"/><path d="M9.2 19.4h21.6" stroke="#1b2a4a" stroke-width="2.4" stroke-linecap="round"/><path d="M20 10.4l1.25 2.5 2.75.4-2 1.95.47 2.75L20 16.7l-2.47 1.3.47-2.75-2-1.95 2.75-.4z" fill="#ffc933" stroke="#1b2a4a" stroke-width=".8" stroke-linejoin="round"/></symbol>
<symbol id="hz-sol" viewBox="0 0 40 40"><path d="M11 39v-5q0-5.6 9-5.6t9 5.6v5z" fill="currentColor" stroke="#1b2a4a" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 30l12 8" stroke="#1b2a4a" stroke-width="1.3" opacity=".55"/><circle cx="20" cy="21" r="6.6" fill="#f2c39b" stroke="#1b2a4a" stroke-width="1.6"/><circle cx="17.7" cy="21.3" r="1" fill="#1b2a4a"/><circle cx="22.3" cy="21.3" r="1" fill="#1b2a4a"/><path d="M18.2 24.3q1.8 1.2 3.6 0" fill="none" stroke="#1b2a4a" stroke-width="1.2" stroke-linecap="round"/><path d="M11.6 19.6q0-9.4 8.4-9.4t8.4 9.4z" fill="currentColor" stroke="#1b2a4a" stroke-width="1.6" stroke-linejoin="round"/><path d="M10.4 19.6h19.2" stroke="#1b2a4a" stroke-width="2.2" stroke-linecap="round"/><path d="M15 14.2q2-2 5-2.2" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".6"/></symbol>
<symbol id="hz-shd" viewBox="0 0 40 40"><path d="M20 4L33 8.6V19.4Q33 30.2 20 36.4Q7 30.2 7 19.4V8.6Z" fill="currentColor" stroke="#1b2a4a" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 8.2L29.4 11.6v7.8q0 7.8-9.4 12.6" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".45"/><path d="M12 11.4q3-1.6 6-2.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/><circle cx="20" cy="20" r="4.2" fill="#ffc933" stroke="#1b2a4a" stroke-width="1.4"/><circle cx="19" cy="19" r="1.2" fill="#fff" opacity=".8"/><circle cx="11.6" cy="12.2" r="1.1" fill="#ffc933" stroke="#1b2a4a" stroke-width=".7"/><circle cx="28.4" cy="12.2" r="1.1" fill="#ffc933" stroke="#1b2a4a" stroke-width=".7"/></symbol>
<symbol id="hz-gun" viewBox="0 0 40 40"><path d="M11.8 23.6L31 12.4l3.6 6.2-19.2 11.2z" fill="currentColor" stroke="#1b2a4a" stroke-width="1.6" stroke-linejoin="round"/><path d="M29.4 13.3l3.6 6.2" stroke="#ffc933" stroke-width="3"/><path d="M14.6 23.4L30 14.4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".55"/><path d="M6 36.6h22" stroke="#1b2a4a" stroke-width="2.2" stroke-linecap="round"/><circle cx="15.5" cy="29" r="7.2" fill="#ffc933" stroke="#1b2a4a" stroke-width="1.6"/><path d="M15.5 22.6v12.8M9.1 29h12.8M11 24.5l9 9M20 24.5l-9 9" stroke="#1b2a4a" stroke-width="1.1" opacity=".7"/><circle cx="15.5" cy="29" r="2.4" fill="currentColor" stroke="#1b2a4a" stroke-width="1.2"/></symbol>
<symbol id="hz-bmb" viewBox="0 0 40 40"><path d="M27.4 13.6q2.6-6.4 7.6-6" fill="none" stroke="#8a5a2b" stroke-width="2.2" stroke-linecap="round"/><path d="M35.2 3.6l1.1 2.7 2.8.6-2.4 1.6.3 2.9-2.2-1.9-2.6 1.2 1-2.7-1.9-2.1 2.9.1z" fill="#ffc933" stroke="#c8232c" stroke-width="1" stroke-linejoin="round"/><rect x="23.4" y="11.6" width="6.4" height="5.4" rx="1.2" transform="rotate(38 26.6 14.3)" fill="#1b2a4a"/><circle cx="18.6" cy="24.4" r="11.6" fill="currentColor" stroke="#1b2a4a" stroke-width="1.6"/><path d="M11.4 21.4q1.8-4.6 6.6-5.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/><circle cx="11.8" cy="25.6" r="1.2" fill="#fff" opacity=".5"/><path d="M8.6 30.2q10 5 20 0" fill="none" stroke="#ffc933" stroke-width="2.2" stroke-linecap="round"/></symbol>
<symbol id="hz-rdr" viewBox="0 0 40 40"><path d="M14 37.4l2.2-4.6h7.6l2.2 4.6z" fill="currentColor" stroke="#1b2a4a" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 38h22" stroke="#1b2a4a" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="18.4" r="15" fill="currentColor" stroke="#1b2a4a" stroke-width="1.6"/><circle cx="20" cy="18.4" r="11.4" fill="#1b2a4a"/><circle cx="20" cy="18.4" r="7.6" fill="none" stroke="#7fe0a6" stroke-width=".9" opacity=".55"/><circle cx="20" cy="18.4" r="3.8" fill="none" stroke="#7fe0a6" stroke-width=".9" opacity=".55"/><path d="M8.6 18.4h22.8M20 7v22.8" stroke="#7fe0a6" stroke-width=".7" opacity=".4"/><path d="M20 18.4L28.2 10.5A11.4 11.4 0 0 1 31.3 17.2z" fill="#ffc933" opacity=".9"/><path d="M20 18.4L28.2 10.5" stroke="#ffc933" stroke-width="1.6" stroke-linecap="round"/><circle cx="25.4" cy="22.4" r="1.7" fill="#ff5a6e" stroke="#fff" stroke-width=".6"/><circle cx="14.6" cy="13.8" r="1.2" fill="#7fe0a6"/><path d="M9.6 11.6q2.6-4.6 7.4-5.8" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"/></symbol>
<symbol id="hz-hit" viewBox="0 0 40 40"><path d="M7 8L33 32M33 7L8 33" stroke="#c8232c" stroke-width="5" stroke-linecap="round"/></symbol>
</svg>`;
document.body.insertAdjacentHTML("afterbegin", HZ_SYMBOLS);
const hzIc = (k) => `<svg class="hz-ic"><use href="#hz-${k}"/></svg>`;
const hzStack = (st) => (st.length > 1 ? `<span class="hz-stk n${st.length}">${st.map(hzIc).join("")}<b class="hz-cnt">${AR(st.length)}</b></span>` : st.length ? hzIc(st[0]) : "");
const hzChip = (t, extra = "") => `<span class="hz-chip ${extra}" style="--pen:${HZ_TEAMS[t].c}">${HZ_TEAMS[t].n}</span>`;

ROOM_GAMES.hisn = {
  name: "حرب الكراريس", theme: "hisn", min: 2, need: "يحتاج لاعب في فريقين على الأقل", who: "٢ إلى ٥ فرق · أسئلة وتصويب",
  rules: ["الفرق تخبي حصونها في شبكة مربعات: قائد وجنود وسلاح ثقيل ودرع وقنبلة ورادار. وتقدرون تحطون لين ٣ قطع في المربع.", "السؤال يطلع لكل الفرق مرة وحدة، وكل فريق يصوّت، وجواب الأغلبية هو جوابه.", "كل فريق يجاوب صح ياخذ ضربة على حصن يختاره، والأسرع يضرب أول.", "القائد يحتاج إصابتين، وإذا طاح طاح الحصن.", "الدرع يصد أول ضربة عليه وعلى اللي جنبه. القنبلة تنفجر على اللي ضربها. والرادار إذا انضرب يكشف اللي حوله ثواني.", "اللي يصيب سلاح ثقيل ياخذ ضربة ثقيلة: ٣ مربعات مرة وحدة.", "آخر حصن يبقى يفوز. وإذا خلص الوقت، الأكثر نقاط."],
  setup(S) {
    Object.assign(S, { nt: 2, size: "auto", qtime: 15, mins: 15, picks: ["السعودية", "الخليج والعرب", "جغرافيا", "علوم", "كورة", "ألغاز", "عامة", "أكل"] });
    H.ht ||= {};
    H.players.forEach((p) => { if (H.ht[p.id] === undefined) ROOM_GAMES.hisn.joined(p.id); });
  },
  joined(id) { const S = H.S, n = (t) => Object.values(H.ht).filter((x) => x === t).length; let best = 0; for (let t = 1; t < (S.nt || 2); t++) if (n(t) < n(best)) best = t; H.ht[id] = best; },
  left(id) { delete H.ht[id]; },
  snap(S) {
    S.hteams = {}; H.players.forEach((p) => (S.hteams[p.id] = Math.min(H.ht[p.id] ?? 0, (S.nt || 2) - 1)));
    S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
    S.matchLeft = H.matchEnd ? Math.max(0, H.matchEnd - now()) : 0;
  },
  key: (S) => `${S.sid || ""}:${S.phase}:${S.qi || 0}`,
  on(m) {
    const S = H.S, Z = H.hz, t = H.ht[m.id];
    if (!Z || !m.id) return;
    if (m.t === "hzwho") return hzTellOne(m.id);
    if (t === undefined || !S.teams.includes(t)) return;
    if (m.t === "hzset" && S.phase === "place" && !S.ready[t]) {
      const v = hzCheck(S.n, m.cells); if (!v.ok) return hzTellTeam(t);
      Z.boards[t] = m.cells.map((st) => st.slice()); hzTellTeam(t, m.id); return hostSendSoon();
    }
    if (m.t === "hzready" && S.phase === "place") {
      if (m.on && !hzCheck(S.n, Z.boards[t]).ready) return;
      S.ready[t] = !!m.on; hostSendSoon();
      if (S.teams.every((x) => S.ready[x])) { hClear(); hLater(hzBegin, 900); }
      return;
    }
    if (m.t === "hzvote" && S.phase === "q" && Number.isInteger(m.k) && m.k >= 0 && m.k < S.q.o.length) {
      Z.votes[m.id] = { k: m.k, at: now() - Z.qStart };
      hzTally(); hostSendSoon();
      if (hzVoters().every((id) => Z.votes[id])) H.deadline = Math.min(H.deadline, now() + 600);
      return;
    }
    if (m.t === "hzfire" && S.phase === "aim") {
      const slot = S.order.find((o) => o.t === t);
      if (!slot || Z.aims[t]) return;
      const f = +m.f, c = +m.c, heavy = !!m.heavy && (S.heavy[t] || 0) > 0;
      if (!S.teams.includes(f) || f === t || !S.live[f] || !Number.isInteger(c) || c < 0 || c >= S.n * S.n || !hzCanShoot(S, f, c)) return;
      Z.aims[t] = { f, c, heavy, by: m.id };
      S.aimed = Object.keys(Z.aims).map(Number); hostSendSoon();
      if (S.order.every((o) => Z.aims[o.t])) H.deadline = Math.min(H.deadline, now() + 400);
    }
  },
  direct(m) {
    if (m.t === "hzme") { KL.my.hz = m; const v = ROOM_GAMES.hisn.views[KL.S && KL.S.phase]; if (v && KL.S.game === "hisn") v(KL.S, false); }
    if (m.t === "hzradar") { KL.my.radar = { ...m, until: now() + 6000 }; const v = ROOM_GAMES.hisn.views[KL.S && KL.S.phase]; if (v && KL.S.game === "hisn") v(KL.S, false); }
  },
  lobbyPlayers(S) {
    const col = (t) => `<div class="kl-team" style="color:${HZ_TEAMS[t].c}"><b>الفريق ${HZ_TEAMS[t].n}</b>${S.players.filter((p) => hzTeamOf(S, p.id) === t).map((p) => `<button type="button" class="kl-p" data-hsw="${esc(p.id)}" ${isHost() ? "" : "disabled"}>${face(p, 30)}<span>${esc(p.name)}${p.id === PID ? " (أنت)" : ""}</span></button>`).join("") || '<span class="muted">…</span>'}</div>`;
    return `<p class="muted" style="font-weight:700;color:var(--soft)">الفرق (${AR(S.players.length)} لاعب)${isHost() ? " · اضغط على لاعب ينقله للفريق اللي بعده" : ""}</p><div class="kl-teams">${Array.from({ length: S.nt }, (_, t) => col(t)).join("")}</div>`;
  },
  lobby(S) {
    const chips = (attr, list, cur, lab) => `<div class="chips pick">${list.map((v) => `<button type="button" class="chip" data-${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${lab(v)}</button>`).join("")}</div>`;
    const h = (t) => `<p class="muted" style="font-weight:700;color:var(--soft)">${t}</p>`;
    const auto = hzAutoSize(S.nt), est = (n) => HZ_EST[n][S.nt];
    return `${h("كم فريق؟")}${chips("hnt", [2, 3, 4, 5], S.nt, (v) => AR(v))}
      ${h("حجم الشبكة")}${chips("hsz", ["auto", 4, 5, 6], S.size, (v) => (v === "auto" ? `تلقائي (${AR(auto)}×${AR(auto)})` : `${AR(v)}×${AR(v)} · ≈${AR(est(v))} د`))}
      <p class="muted">المدة المتوقعة مع ${AR(S.nt)} فرق: حوالي ${AR(est(hzSize(S)))} دقيقة.</p>
      ${h("حد الوقت")}${chips("hmin", [10, 15, 20, 0], S.mins, (v) => (v ? `${AR(v)} دقيقة` : "لين يبقى حصن"))}
      ${h("وقت الإجابة")}${chips("hqt", [10, 15, 20], S.qtime, (v) => `${AR(v)} ثانية`)}
      ${h("فئات الأسئلة")}<div class="chips pick">${QCATS.filter((c) => c !== "الأغلبية").map((c) => `<button type="button" class="chip" data-hcat="${c}" aria-pressed="${S.picks.includes(c)}">${c}</button>`).join("")}</div>`;
  },
  bindLobby(S) {
    const set = (attr, key, num) => screen.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { const v = b.dataset[attr]; H.S[key] = num && v !== "auto" ? +v : v; beep(700, 0.04); if (key === "nt") H.players.forEach((p, k) => (H.ht[p.id] = k % H.S.nt)); hostSend(); }));
    set("hnt", "nt", true); set("hsz", "size", true); set("hmin", "mins", true); set("hqt", "qtime", true);
    screen.querySelectorAll("[data-hcat]").forEach((b) => (b.onclick = () => { const c = b.dataset.hcat, p = H.S.picks; H.S.picks = p.includes(c) ? p.filter((x) => x !== c) : [...p, c]; beep(660, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-hsw]").forEach((b) => (b.onclick = () => { const id = b.dataset.hsw; H.ht[id] = ((H.ht[id] ?? 0) + 1) % H.S.nt; beep(640, 0.04); hostSend(); }));
    const used = new Set(Object.values(S.hteams || {}));
    if (used.size < 2 || !S.picks.length) $("start").disabled = true;
  },
  start: () => hzStart(),
  resume(S) {
    if (!(H.usedQ instanceof Set)) H.usedQ = new Set();
    if (S.phase === "place") hEvery(() => { if (now() >= H.deadline) hzBegin(); }, 500);
    else if (S.phase === "q") hEvery(() => { if (now() >= H.deadline) hzAfterQ(); }, 200);
    else if (S.phase === "aim") hEvery(() => { if (now() >= H.deadline) hzResolve(); }, 200);
    else if (S.phase === "res") hLater(hzNext, 3000);
    H.players.forEach((p) => hzTellOne(p.id));
  },
  views: { place: hzvPlace, q: hzvQ, aim: hzvAim, res: hzvRes, end: hzvEnd },
};

// ---------------- the host ----------------
function hzTell(id, m) { m.to = id; if (id === PID) ROOM_GAMES.hisn.direct(m); else if (KL.net) KL.net.send(m); }
const hzMembers = (t) => H.players.map((p) => p.id).filter((id) => H.ht[id] === t);
function hzTellOne(id, by) {
  const S = H.S, Z = H.hz; if (!Z) return;
  const t = H.ht[id];
  if (t === undefined || !S.teams.includes(t)) return hzTell(id, { t: "hzme", sid: S.sid, team: -1 });
  hzTell(id, { t: "hzme", sid: S.sid, team: t, cells: Z.boards[t], broken: Z.broken[t], by: by || "" });
}
const hzTellTeam = (t, by) => hzMembers(t).forEach((id) => hzTellOne(id, by));
const hzVoters = () => H.players.map((p) => p.id).filter((id) => H.S.teams.includes(H.ht[id]));

function hzStart() {
  hClear();
  const S = H.S, n = hzSize(S);
  const teams = [...new Set(H.players.map((p) => H.ht[p.id] ?? 0))].filter((t) => t < S.nt).sort();
  H.hz = { boards: Array.from({ length: S.nt }, () => Array.from({ length: n * n }, () => [])), broken: Array.from({ length: S.nt }, () => []), cmdHits: Array(S.nt).fill(0), taken: Array.from({ length: S.nt }, () => []), votes: {}, aims: {}, qStart: 0, hits: Array(S.nt).fill(0), booms: Array(S.nt).fill(0) };
  H.usedQ instanceof Set || (H.usedQ = new Set());
  Object.assign(S, { sid: Math.random().toString(36).slice(2, 8), phase: "place", n, teams, qi: 0, ready: Array(S.nt).fill(false), live: Array.from({ length: S.nt }, (_, t) => teams.includes(t)),
    pts: Array(S.nt).fill(0), heavy: Array(S.nt).fill(0), fog: Array.from({ length: S.nt }, () => Array(n * n).fill(null)), q: null, tally: null, order: [], aimed: [], feed: [], boards: null });
  H.deadline = now() + 75000; H.matchEnd = 0;
  hostSend();
  H.players.forEach((p) => hzTellOne(p.id));
  hEvery(() => { if (now() >= H.deadline) hzBegin(); }, 500);
}
// placement over: whatever a team didn't finish is placed for it, and the questions start
function hzBegin() {
  hClear();
  const S = H.S, Z = H.hz;
  if (S.phase !== "place") return;
  S.teams.forEach((t) => {
    const b = Z.boards[t];
    if (hzCheck(S.n, b).ready) return;
    // keep what they placed if it can be completed, otherwise a fresh random fort
    const left = hzLeft(S.n, b), items = shuffled(HZ_KINDS.flatMap((k) => Array(Math.max(0, left[k])).fill(k)));
    const cells = b.map((st) => st.slice());
    items.forEach((k) => { const empty = cells.map((st, c) => (st.length ? -1 : c)).filter((c) => c >= 0); const need = cells.filter((st) => st.length).length < HZ_SET[S.n].min; const c = need && empty.length ? pickOne(empty) : pickOne(cells.map((st, c) => (st.length < 3 ? c : -1)).filter((c) => c >= 0)); cells[c].push(k); });
    Z.boards[t] = hzCheck(S.n, cells).ready ? cells : hzRandom(S.n);
  });
  S.teams.forEach((t) => hzTellTeam(t));
  H.matchEnd = S.mins ? now() + S.mins * 60000 : 0;
  hzAsk();
}
function hzAsk() {
  hClear();
  const S = H.S, Z = H.hz;
  S.qi++;
  const d = drawQuestion(pickOne(S.picks.length ? S.picks : ["عامة"]), H.usedQ);
  Z.q = d; Z.votes = {}; Z.aims = {}; Z.qStart = now();
  S.q = { q: d.q, o: d.o, cat: d.cat }; S.tally = Array.from({ length: S.nt }, () => d.o.map(() => 0)); S.voted = [];
  S.phase = "q"; S.order = []; S.aimed = []; S.feed = []; S.answer = "";
  H.deadline = now() + S.qtime * 1000;
  hostSend();
  hEvery(() => { if (now() >= H.deadline) hzAfterQ(); }, 200);
}
function hzTally() {
  const S = H.S, Z = H.hz;
  S.tally = Array.from({ length: S.nt }, () => S.q.o.map(() => 0));
  Object.entries(Z.votes).forEach(([id, v]) => { const t = H.ht[id]; if (S.tally[t]) S.tally[t][v.k]++; });
  S.voted = Object.keys(Z.votes);
}
function hzAfterQ() {
  hClear();
  const S = H.S, Z = H.hz, right = Z.q.a;
  // each team's answer is its majority; its time is the first vote for that answer
  const res = S.teams.map((t) => {
    const ids = hzMembers(t).filter((id) => Z.votes[id]);
    if (!ids.length) return { t, k: -1, at: Infinity };
    const tally = S.q.o.map((_, k) => ids.filter((id) => Z.votes[id].k === k).length), k = argmax(tally);
    return { t, k, at: Math.min(...ids.filter((id) => Z.votes[id].k === k).map((id) => Z.votes[id].at)) };
  });
  res.forEach((r) => { if (r.k === right) S.pts[r.t] += 10; });
  S.answer = S.q.o[right];
  S.answers = res.map((r) => ({ t: r.t, k: r.k, ok: r.k === right, at: r.at === Infinity ? null : Math.round(r.at / 100) / 10 }));
  // a shot for every right answer; teams already out fire «ضربات دعم»
  S.order = res.filter((r) => r.k === right && S.teams.some((f) => f !== r.t && S.live[f])).sort((x, y) => x.at - y.at).map((r) => ({ t: r.t, support: !S.live[r.t] }));
  if (!S.order.length) { S.phase = "res"; S.feed = [{ m: "none" }]; hostSend(); return hLater(hzNext, 4500); }
  S.phase = "aim"; S.aimed = [];
  H.deadline = now() + 20000;
  hostSend();
  hEvery(() => { if (now() >= H.deadline) hzResolve(); }, 200);
}
// can this square still be shot? empty of marks, a blocked square (the shield took that one), or a wounded commander
function hzCanShoot(S, f, c) { const m = S.fog[f][c]; return !m || m.m === "blk" || m.m === "wnd"; }
function hzResolve() {
  hClear();
  const S = H.S, Z = H.hz;
  S.feed = [];
  S.order.forEach((o) => {
    const a = Z.aims[o.t];
    if (!a) { S.feed.push({ by: o.t, m: "late" }); return; }
    const cells = a.heavy ? hzLine(S.n, a.c) : [a.c];
    if (a.heavy) S.heavy[o.t]--;
    cells.forEach((c, i) => hzShoot(o.t, a.f, c, a.heavy && i > 0));
  });
  S.phase = "res"; H.deadline = 0;
  hostSend();
  S.teams.forEach((t) => hzTellTeam(t));
  hLater(hzNext, S.feed.some((e) => e.m === "rdr") ? 7000 : 5500);
}
const hzLine = (n, c) => { const r = Math.floor(c / n), q = Math.min(n - 2, Math.max(1, c % n)); return [q - 1, q, q + 1].map((x) => r * n + x); };
function hzShoot(by, f, c, extra) {
  const S = H.S, Z = H.hz, b = Z.boards[f], ev = { by, f, c, heavy: !!extra };
  if (!S.live[f]) return; // fell earlier this round
  if (!hzCanShoot(S, f, c)) { S.feed.push({ ...ev, m: "dup" }); return; }
  // a shield takes the first shot on its own square or the four next to it
  const sh = b.map((st, s) => (st.includes("shd") && !Z.broken[f].includes(s) && (s === c || hzN4(S.n, s).includes(c)) ? s : -1)).find((s) => s >= 0);
  if (sh !== undefined) { Z.broken[f].push(sh); S.fog[f][c] = { m: "blk" }; S.feed.push({ ...ev, m: "blk" }); return; }
  const st = b[c];
  if (!st.length) { S.fog[f][c] = { m: "miss" }; S.feed.push({ ...ev, m: "miss" }); return; }
  let pts = 0;
  if (!Z.taken[f].includes(c)) { Z.taken[f].push(c); st.forEach((k) => (pts += HZ_PTS[k])); if (st.includes("gun")) S.heavy[by] += st.filter((k) => k === "gun").length; }
  Z.hits[by]++;
  let m = "hit", note = "";
  if (st.includes("cmd")) {
    Z.cmdHits[f]++;
    if (Z.cmdHits[f] >= 2) { m = "dead"; pts += 100; S.live[f] = false; S.fog[f] = S.fog[f].map((x, k) => x || (b[k].length ? { m: "spot", items: b[k] } : null)); }
    else m = "wnd";
  }
  S.fog[f][c] = { m: m === "dead" ? "dead" : m === "wnd" ? "wnd" : "hit", items: st };
  S.pts[by] += pts;
  // the bomb goes off on whoever hit it: one of their own squares shows for everyone
  if (st.includes("bmb")) {
    Z.booms[by]++;
    const hidden = Z.boards[by].map((x, k) => (x.length && !S.fog[by][k] ? k : -1)).filter((k) => k >= 0);
    if (hidden.length) { const k = pickOne(hidden); S.fog[by][k] = { m: "spot", items: Z.boards[by][k] }; note = hzName(S.n, k); }
  }
  // the radar shows its neighbours to the team that hit it, for a few seconds
  if (st.includes("rdr")) hzMembers(by).forEach((id) => hzTell(id, { t: "hzradar", f, c, cells: hzN8(S.n, c).map((x) => ({ c: x, items: b[x] })) }));
  S.feed.push({ ...ev, m, items: st, pts, note, rdr: st.includes("rdr"), bmb: st.includes("bmb") });
}
function hzNext() {
  hClear();
  const S = H.S;
  if (S.phase !== "res") return;
  const alive = S.teams.filter((t) => S.live[t]);
  if (alive.length <= 1 || (H.matchEnd && now() >= H.matchEnd) || S.qi >= 60) return hzEnd();
  hzAsk();
}
function hzEnd() {
  hClear();
  const S = H.S, Z = H.hz;
  const alive = S.teams.filter((t) => S.live[t]);
  if (alive.length === 1) S.pts[alive[0]] += 150; // the last fort standing
  S.rank = S.teams.slice().sort((x, y) => (S.live[y] - S.live[x]) || (S.pts[y] - S.pts[x]));
  if (alive.length > 1) S.rank = S.teams.slice().sort((x, y) => S.pts[y] - S.pts[x]);
  S.won = S.rank[0]; S.byTime = alive.length > 1;
  S.boards = Z.boards; // every fort shows at the end
  const top = (a) => { const t = S.teams.slice().sort((x, y) => a[y] - a[x])[0]; return a[t] ? { t, n: a[t] } : null; };
  S.awards = { sniper: top(Z.hits), boom: top(Z.booms) };
  S.phase = "end"; H.deadline = 0; H.matchEnd = 0;
  hostSend();
}

// ---------------- every phone ----------------
const hzMine = () => (KL.my.hz && KL.S && KL.my.hz.sid === KL.S.sid ? KL.my.hz : null);
function hzAsk4Me() { if (!hzMine() && now() - (KL.my.hzAskedAt || 0) > 2500) { KL.my.hzAskedAt = now(); act({ t: "hzwho", id: PID }); } }
// one grid: o.cells = my own pieces (or a whole fort at the end), o.fog = the marks shots left
function hzGrid(S, o) {
  const n = S.n, pen = HZ_TEAMS[o.team].c;
  let h = `<span></span>` + Array.from({ length: n }, (_, c) => `<span class="hz-lab">${AR(c + 1)}</span>`).join("");
  for (let r = 0; r < n; r++) {
    h += `<span class="hz-lab">${HZ_ROWS[r]}</span>`;
    for (let q = 0; q < n; q++) {
      const c = r * n + q, mine = o.cells ? o.cells[c] : null, mk = o.fog ? o.fog[c] : null, rad = o.radar ? o.radar.find((x) => x.c === c) : null;
      let cls = "hz-cell", inner = "";
      if (mine && mine.length) { cls += " pc"; inner = hzStack(mine); if (o.broken && o.broken.includes(c)) cls += " broke"; }
      else if (mk && mk.items) { cls += " pc"; inner = hzStack(mk.items); }
      else if (rad && rad.items.length) { cls += " pc radar"; inner = hzStack(rad.items); }
      else if (rad) cls += " radar";
      if (mk) {
        cls += " " + mk.m;
        if (mk.m === "miss") inner += '<i class="hz-dot"></i>';
        else if (mk.m === "blk") inner += hzIc("shd").replace("hz-ic", "hz-ic blk");
        else if (mk.m !== "spot") inner += '<svg class="hz-x"><use href="#hz-hit"/></svg>';
      }
      if (o.guard && o.guard.has(c)) cls += " guard";
      if (o.pick && o.pick(c)) cls += " can";
      if (o.sel === c || (o.line && o.line.includes(c))) cls += " aim";
      h += `<button type="button" class="${cls}" data-hc="${c}" aria-label="${hzName(n, c)}" ${o.pick ? "" : 'tabindex="-1"'}>${inner}</button>`;
    }
  }
  return `<div class="hz-grid ${o.small ? "small" : ""}" style="--pen:${pen};grid-template-columns:16px repeat(${n}, minmax(0, 1fr))">${h}</div>`;
}
const hzGuard = (n, cells, broken = []) => { const g = new Set(); cells.forEach((st, s) => { if (st.includes("shd") && !broken.includes(s)) [s, ...hzN4(n, s)].forEach((x) => g.add(x)); }); return g; };
const hzScores = (S) => `<div class="hz-teams">${S.teams.map((t) => `<span class="hz-chip ${S.live[t] ? "" : "out"}" style="--pen:${HZ_TEAMS[t].c}">${HZ_TEAMS[t].n} <b>${AR(S.pts[t])}</b>${S.heavy[t] ? ` <small>💥${AR(S.heavy[t])}</small>` : ""}</span>`).join("")}</div>`;
const hzClock = (S) => (S.mins && S.phase !== "place" ? `<span class="hz-clock" id="hzClock"></span>` : "");
function hzTick(S) {
  klEvery(() => {
    const s = KL.S; if (!s || s.game !== "hisn") return;
    const el = $("hzClock"); if (el && s.mins) { const ms = leftOf(s.matchLeft), sec = Math.ceil(ms / 1000); el.textContent = `${AR(Math.floor(sec / 60))}:${AR(String(sec % 60).padStart(2, "0"))}`; }
    const t = $("hzLeft"); if (t) t.textContent = AR(Math.ceil(leftOf(s.left) / 1000));
    const bar = $("hzBar"); if (bar && s.phase === "q") bar.style.transform = `scaleX(${leftOf(s.left) / (s.qtime * 1000)})`;
  }, 250);
}

function hzvPlace(S, fresh) {
  hzAsk4Me();
  if (fresh) { clearKL(); KL.my.sel = null; beep(620, 0.06); hzTick(S); }
  setTop("التخبئة");
  const me2 = hzMine();
  if (!me2) return show('<p class="muted" style="text-align:center">لحظة…</p>');
  if (me2.team < 0) return show(`<div class="hz-card"><div class="hz-h">دخلت بعد البداية</div><p class="muted">تقدر تتفرج، وتلعب معهم الجولة الجاية.</p></div>`);
  const t = me2.team, cells = me2.cells, n = S.n, v = hzCheck(n, cells), left = hzLeft(n, cells);
  const mates = S.players.filter((p) => hzTeamOf(S, p.id) === t && p.id !== PID);
  const sel = KL.my.sel && left[KL.my.sel] > 0 ? KL.my.sel : null;
  const ready = S.ready[t];
  show(`
    <div class="hz-row"><div class="hz-h" style="color:${HZ_TEAMS[t].c}">خبّوا حصن ${HZ_TEAMS[t].n}</div><span class="hz-clock"><span id="hzLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</span> ث</span></div>
    ${mates.length ? `<div class="hz-mates">${mates.map((p) => face(p, 26)).join("")}<span>${mates.map((p) => esc(p.name)).join(" و")} معك. أي واحد منكم يحرك القطع، والباقين يشوفونها تتحرك.</span></div>` : ""}
    ${hzGrid(S, { team: t, cells, broken: me2.broken, guard: hzGuard(n, cells), pick: ready ? null : () => true })}
    <div class="hz-tray">${HZ_KINDS.filter((k) => HZ_SET[n][k]).map((k) => `<button type="button" class="hz-piece" data-hk="${k}" aria-pressed="${sel === k}" ${left[k] > 0 && !ready ? "" : "disabled"} style="--pen:${HZ_TEAMS[t].c}">${hzIc(k)}<span>${HZ_NAME[k]}</span><b>${AR(left[k])}</b></button>`).join("")}</div>
    <p class="hz-pen">${ready ? "جاهزين! ننتظر باقي الفرق…" : sel ? `اضغط مربع تحط فيه ${HZ_NAME[sel]}` : v.done ? (v.enough ? "كل القطع انحطت ✓" : `لازم القطع تكون في ${AR(HZ_SET[n].min)} مربعات على الأقل`) : "اختر قطعة وحطها، واضغط على مربع ترجّع آخر قطعة فيه. لين ٣ قطع في المربع."}</p>
    <p class="muted" style="text-align:center">المخطط: المربعات اللي يحميها الدرع. الفرق الجاهزة: ${AR(S.teams.filter((x) => S.ready[x]).length)} من ${AR(S.teams.length)}</p>
    <div class="hz-row2">${ready ? '<button type="button" class="btn btn-ghost" id="hzUnready">نبي نعدّل</button>' : `<button type="button" class="btn btn-ghost" id="hzRand">وزّع عشوائي</button><button type="button" class="btn btn-marker" id="hzReady" ${v.ready ? "" : "disabled"}>جاهزين</button>`}</div>
    ${isHost() ? '<button type="button" class="btn btn-ghost" id="hzGo">ابدأ الحين (والباقي يتوزع عشوائي)</button>' : ""}`);
  const send = (next) => { KL.my.hz = { ...me2, cells: next }; act({ t: "hzset", id: PID, cells: next }); hzvPlace(KL.S, false); };
  screen.querySelectorAll("[data-hk]").forEach((b) => (b.onclick = () => { KL.my.sel = KL.my.sel === b.dataset.hk ? null : b.dataset.hk; beep(700, 0.04); hzvPlace(KL.S, false); }));
  if (!ready) screen.querySelectorAll(".hz-grid [data-hc]").forEach((b) => (b.onclick = () => {
    const c = +b.dataset.hc, next = cells.map((st) => st.slice());
    if (sel) { if (next[c].length >= 3) { beep(200, 0.1); return; } next[c].push(sel); if (hzLeft(n, next)[sel] <= 0) KL.my.sel = null; beep(760, 0.04); }
    else if (next[c].length) { next[c].pop(); beep(520, 0.04); }
    else return;
    send(next);
  }));
  if ($("hzRand")) $("hzRand").onclick = () => { beep(880, 0.06); KL.my.sel = null; send(hzRandom(n)); };
  if ($("hzReady")) $("hzReady").onclick = () => { beep(880, 0.08); act({ t: "hzready", id: PID, on: true }); };
  if ($("hzUnready")) $("hzUnready").onclick = () => act({ t: "hzready", id: PID, on: false });
  if ($("hzGo")) $("hzGo").onclick = () => hzBegin();
}

function hzvQ(S, fresh) {
  hzAsk4Me();
  const me2 = hzMine(), t = me2 ? me2.team : -1, q = S.q;
  if (fresh) { clearKL(); KL.my.hv = undefined; beep(520, 0.06); hzTick(S); }
  setTop(`سؤال ${AR(S.qi)}`);
  const mine = t >= 0 ? S.tally[t] : null, total = mine ? Math.max(1, mine.reduce((x, y) => x + y, 0)) : 1;
  const mates = S.players.filter((p) => hzTeamOf(S, p.id) === t);
  show(`
    <div class="hz-row">${hzScores(S)}${hzClock(S)}</div>
    <div class="hz-q">
      <span class="hz-kind">${esc(q.cat)}</span>
      <div class="hz-qt">${esc(q.q)}</div>
      <div class="hz-timer"><i id="hzBar" style="transform:scaleX(${leftOf(S.left) / (S.qtime * 1000)})"></i></div>
      ${q.o.map((o, k) => `<button type="button" class="hz-opt" data-o="${k}" aria-pressed="${KL.my.hv === k}" ${t < 0 ? "disabled" : ""}><i style="width:${mine ? Math.round((mine[k] / total) * 100) : 0}%;background:${t >= 0 ? HZ_TEAMS[t].c : "#888"}22"></i><span>${esc(o)}</span><small>${mine && mine[k] ? AR(mine[k]) : ""}</small></button>`).join("")}
    </div>
    ${t >= 0 ? `<div class="hz-row"><span class="muted">${S.live[t] ? "كل الفرق تجاوب الحين. صح؟ ضربة لكم، والأسرع يضرب أول." : "حصنكم طاح، بس الجواب الصح يعطيكم ضربة دعم."}</span><span class="hz-faces">${mates.map((p) => `<span style="opacity:${S.voted.includes(p.id) ? 1 : 0.35}">${face(p, 24)}</span>`).join("")}</span></div>` : '<p class="muted" style="text-align:center">تتفرج على هذي الجولة</p>'}`);
  screen.querySelectorAll(".hz-opt:not([disabled])").forEach((b) => (b.onclick = () => { KL.my.hv = +b.dataset.o; beep(660, 0.05); act({ t: "hzvote", id: PID, k: KL.my.hv }); screen.querySelectorAll(".hz-opt").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
}

function hzvAim(S, fresh) {
  hzAsk4Me();
  const me2 = hzMine(), t = me2 ? me2.team : -1;
  const slot = S.order.find((o) => o.t === t), done = S.aimed.includes(t);
  if (fresh) { clearKL(); KL.my.aim = null; KL.my.heavy = false; hzTick(S); if (slot) { beep(880, 0.1); buzz([60, 40, 60]); } else beep(520, 0.06); }
  setTop("الضربات");
  const order = `<div class="hz-order">${S.answers.filter((a) => a.ok).sort((x, y) => (x.at ?? 99) - (y.at ?? 99)).map((a, k) => `<span>${AR(k + 1)}. ${hzChip(a.t)} <small dir="ltr">${a.at != null ? a.at.toFixed(1) + "s" : ""}</small></span>`).join("")}</div>`;
  if (!slot) {
    show(`${hzScores(S)}<div class="hz-h">الجواب: ${esc(S.answer)}</div>${order}
      <p class="hz-pen">${t >= 0 ? "ما جاوبتوا صح هالمرة… الفرق تصوّب عليكم الحين 😬" : "الفرق تصوّب…"}</p>
      ${t >= 0 && me2.cells ? hzGrid(S, { team: t, cells: me2.cells, fog: S.fog[t], broken: me2.broken, small: true }) : ""}
      <p class="muted" style="text-align:center">باقي <span id="hzLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</span> ث</p>`);
    return;
  }
  const foes = S.teams.filter((f) => f !== t && S.live[f]);
  let f = KL.my.aim ? KL.my.aim.f : foes[0];
  if (!foes.includes(f)) f = foes[0];
  const sel = KL.my.aim && KL.my.aim.f === f ? KL.my.aim.c : null;
  const heavy = KL.my.heavy && S.heavy[t] > 0;
  const line = heavy && sel != null ? hzLine(S.n, sel) : null;
  show(`
    ${hzScores(S)}
    <div class="hz-banner" style="--pen:${HZ_TEAMS[t].c}"><b>${slot.support ? "ضربة دعم!" : "دوركم تضربون!"}</b><span>الجواب: ${esc(S.answer)} · ترتيبكم ${AR(S.order.indexOf(slot) + 1)} · باقي <span id="hzLeft">${AR(Math.ceil(leftOf(S.left) / 1000))}</span> ث</span></div>
    ${done ? '<p class="hz-pen" style="text-align:center">انطلقت القذيفة! ننتظر الباقين…</p>' : `
    <div class="hz-teams">${foes.map((x) => `<button type="button" class="hz-chip ${x === f ? "on" : ""}" style="--pen:${HZ_TEAMS[x].c}" data-hf="${x}">${HZ_TEAMS[x].n}</button>`).join("")}</div>
    ${hzGrid(S, { team: f, fog: S.fog[f], pick: (c) => hzCanShoot(S, f, c), sel, line })}
    ${S.heavy[t] > 0 ? `<button type="button" class="btn btn-ghost" id="hzHeavy" aria-pressed="${heavy}">${heavy ? "✓ ضربة ثقيلة: ٣ مربعات في صف" : `ضربة ثقيلة (عندكم ${AR(S.heavy[t])})`}</button>` : ""}
    <button type="button" class="btn btn-marker hz-fire" id="hzFire" ${sel == null ? "disabled" : ""}>${sel == null ? "اختاروا مربع" : `اضرب ${hzName(S.n, sel)} 💥`}</button>`}`);
  if (done) return;
  screen.querySelectorAll("[data-hf]").forEach((b) => (b.onclick = () => { KL.my.aim = { f: +b.dataset.hf, c: null }; beep(700, 0.04); hzvAim(KL.S, false); }));
  screen.querySelectorAll(".hz-grid .can").forEach((b) => (b.onclick = () => { KL.my.aim = { f, c: +b.dataset.hc }; beep(760, 0.04); hzvAim(KL.S, false); }));
  if ($("hzHeavy")) $("hzHeavy").onclick = () => { KL.my.heavy = !KL.my.heavy; beep(600, 0.04); hzvAim(KL.S, false); };
  if ($("hzFire")) $("hzFire").onclick = () => { if (sel == null) return; $("hzFire").disabled = true; beep(988, 0.08); buzz(40); act({ t: "hzfire", id: PID, f, c: sel, heavy }); };
}

function hzvRes(S, fresh) {
  hzAsk4Me();
  const me2 = hzMine(), t = me2 ? me2.team : -1;
  if (fresh) {
    clearKL(); hzTick(S);
    const big = S.feed.some((e) => e.m === "dead"), hitMe = S.feed.some((e) => e.f === t && (e.m === "hit" || e.m === "wnd" || e.m === "dead"));
    if (big) { beep(523, 0.1); setTimeout(() => beep(392, 0.1), 140); setTimeout(() => beep(262, 0.3), 280); buzz([80, 50, 80]); }
    else if (S.feed.some((e) => e.m === "hit" || e.m === "wnd")) { beep(200, 0.18, "sawtooth", 0.08); buzz(hitMe ? [60, 30, 60] : 40); }
    else beep(440, 0.08);
    if (KL.my.radar) klLater(() => { const s = KL.S; if (s && s.phase === "res") hzvRes(s, false); }, Math.max(0, KL.my.radar.until - now()) + 50);
  }
  setTop("وش صار؟");
  const line = (e) => {
    if (e.m === "none") return `<div class="hz-ev">محد جاوب صح هالمرة 🤷</div>`;
    if (e.m === "late") return `<div class="hz-ev">${hzChip(e.by)} ما لحقوا يضربون</div>`;
    const to = `${hzChip(e.by)} ← ${hzChip(e.f)} <b class="hz-sq">${hzName(S.n, e.c)}</b>`;
    const what = { miss: "فاضي", blk: `${hzIc("shd")}انصدّت بالدرع`, dup: "المربع انضرب قبلهم", hit: e.items ? e.items.map(hzIc).join("") + (e.items.length > 1 ? "كومة!" : `${HZ_NAME[e.items[0]]}!`) : "إصابة", wnd: `${(e.items || ["cmd"]).map(hzIc).join("")}جرحوا القائد!`, dead: `${(e.items || ["cmd"]).map(hzIc).join("")}طاح القائد!` }[e.m];
    return `<div class="hz-ev ${e.m === "dead" ? "dead" : e.bmb ? "boom" : ""}">${to} <span class="hz-what">${what}</span>${e.pts ? `<b class="p">+${AR(e.pts)}</b>` : ""}${e.bmb ? `<span class="muted hz-full">💥 قنبلة! انفجرت عليهم${e.note ? ` وانكشف مربع ${e.note} في حصنهم` : ""}.</span>` : ""}${e.rdr ? `<span class="muted hz-full">📡 رادار! ${e.by === t ? "شوفوا اللي حوله بسرعة…" : "شافوا اللي حوله ثواني."}</span>` : ""}</div>`;
  };
  const rad = KL.my.radar && KL.my.radar.until > now() && me2 && me2.team >= 0 ? KL.my.radar : null;
  const fell = S.feed.filter((e) => e.m === "dead").map((e) => e.f);
  show(`
    <div class="hz-row">${hzScores(S)}${hzClock(S)}</div>
    ${fell.length ? `<div class="hz-stamp">سقط حصن ${fell.map((x) => HZ_TEAMS[x].n).join(" و")}!</div>` : ""}
    <div class="hz-feed">${S.feed.map(line).join("")}</div>
    ${rad ? `<div class="hz-radar"><b>📡 رادار ${HZ_TEAMS[rad.f].n}</b> احفظوا اللي حوله!</div>${hzGrid(S, { team: rad.f, fog: S.fog[rad.f], radar: rad.cells, small: true })}` : ""}
    ${t >= 0 && me2.cells ? `<p class="muted">حصنكم:</p>${hzGrid(S, { team: t, cells: me2.cells, fog: S.fog[t], broken: me2.broken, small: true })}` : ""}
    ${t >= 0 && !S.live[t] ? '<p class="hz-pen" style="text-align:center">حصنكم طاح، بس كملوا تجاوبون: كل جواب صح ضربة دعم!</p>' : ""}`);
}

function hzvEnd(S, fresh) {
  const me2 = hzMine(), t = me2 ? me2.team : hzTeamOf(S, PID);
  if (fresh) { clearKL(); if (S.won === t) { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); } else beep(262, 0.4, "triangle", 0.12); }
  setTop("انتهت");
  const w = S.won, aw = S.awards || {};
  const pod = [S.rank[1], S.rank[0], S.rank[2]].map((x, k) => (x === undefined ? "" : `<div style="background:${HZ_TEAMS[x].c};height:${[58, 80, 42][k]}px">${AR([2, 1, 3][k])}</div>`)).join("");
  show(`
    <div class="hz-h" style="text-align:center;color:${HZ_TEAMS[w].c}">${S.byTime ? `خلص الوقت! فاز ${HZ_TEAMS[w].n} بالنقاط` : `صمد حصن ${HZ_TEAMS[w].n}!`}</div>
    <div class="hz-podium">${pod}</div>
    <div class="hz-ranks">${S.rank.map((x, k) => `<div class="hz-rk ${x === t ? "me" : ""}"><span class="n">${AR(k + 1)}</span>${hzChip(x, S.live[x] ? "" : "out")}<b>${AR(S.pts[x])}</b></div>`).join("")}</div>
    ${aw.sniper ? `<div class="hz-aw"><span>أشطر قنّاص</span><b>${HZ_TEAMS[aw.sniper.t].n} · ${AR(aw.sniper.n)} إصابات</b></div>` : ""}
    ${aw.boom ? `<div class="hz-aw"><span>أكثر فريق طاح في القنابل</span><b>${HZ_TEAMS[aw.boom.t].n} · ${AR(aw.boom.n)}</b></div>` : ""}
    <p class="muted">الحصون كلها:</p>
    <div class="hz-all">${S.teams.map((x) => `<div>${hzChip(x)}${hzGrid(S, { team: x, cells: S.boards[x], fog: S.fog[x], small: true })}</div>`).join("")}</div>
    ${isHost() ? '<button type="button" class="btn btn-marker" id="hzAgain">جلسة جديدة بنفس الربع</button>' : '<p class="muted" style="text-align:center">المضيف يقدر يبدأ جلسة جديدة.</p>'}
    <button type="button" class="btn btn-ghost" id="hzHome">رجوع لفسحة</button>`);
  if ($("hzAgain")) $("hzAgain").onclick = () => hostAgain();
  $("hzHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}
