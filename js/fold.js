"use strict";
// ================= اطوِها! online: two players on two phones, everyone else in the room watches =================
// The same paper, ink and fold as the one-phone game (foldit/), drawn on a canvas; the host keeps the
// soldiers and decides every fold. Player 0 owns the bottom half, player 1 the top; each phone turns
// the sheet so its owner's half is at the bottom. A drop of ink is mirrored across the fold line: if it
// lands on an enemy soldier, he's crossed out and the shooter goes again.

const FH = 1.4, FMID = FH / 2, FSR = 0.052, FINK = { normal: 0.036, big: 0.072 }, FSAFE = FSR * 1.8, FEDGE = FSR, FGAP = 0.17, FTURN = 15000;
const PCOL = ["#1d3fb8", "#c8232c"];
const PAPER = { bg: "#fbfbf5", line: "#9dbee2", gap: 0.042, margin: "#e46b6b", fold: "#7c93b3", back: "#e9e9e1" };
const foldGeo = (fold) => { const a = fold.ang; return { c: { x: 0.5, y: fold.cy }, n: { x: -Math.sin(a), y: Math.cos(a) }, t: { x: Math.cos(a), y: Math.sin(a) } }; };
const fSide = (f, p) => (p.x - f.c.x) * f.n.x + (p.y - f.c.y) * f.n.y; // > 0 = player 0's side (bottom)
const fReflect = (f, p) => { const d = fSide(f, p); return { x: p.x - 2 * d * f.n.x, y: p.y - 2 * d * f.n.y }; };
const fOwn = (f, p, i, pad = 0) => (i === 0 ? fSide(f, p) > pad : fSide(f, p) < -pad);
const fIn = (p, pad = 0) => p.x > pad && p.x < 1 - pad && p.y > pad && p.y < FH - pad;
const fDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const fBase = { cy: FMID, ang: 0 };
// a spot where a soldier may stand: inside own half, away from the middle, the edges and the other soldiers
const fOkSpot = (p, i, others) => fIn(p, FEDGE) && fOwn(foldGeo(fBase), p, i, FSAFE) && others.every((o) => fDist(o, p) > FGAP);
function fRandom(i, n) {
  const out = []; let g = 0;
  while (out.length < n && g++ < 3000) { const p = { x: rnd(FEDGE, 1 - FEDGE), y: i === 0 ? rnd(FMID + FSAFE, FH - FEDGE) : rnd(FEDGE, FMID - FSAFE) }; if (fOkSpot(p, i, out)) out.push(p); }
  return out;
}
const fSeat = (S, id) => (S.duo || []).indexOf(id); // 0, 1, or -1 for someone watching

ROOM_GAMES.foldit = {
  name: "اطوِها!", theme: "fold", min: 2, need: "يحتاج لاعبين", who: "لاعبين · والباقي يتفرجون",
  rules: ["كل لاعب يوزّع جنوده في نصفه من الورقة، وخصمه ما يشوفهم.", "في دورك تحط نقطة حبر في نصفك وتضغط «اطوِها!».", "تنطوي الورقة، والحبر ينطبع على الجهة الثانية ويشطب أي جندي تحته.", "إذا صبت يستمر دورك، وخط الطي يتحرك ويميل كل دور.", "عندك نقطة كبيرة ونقطتين مرة وحدة بس. جندي عليه لزقة يتحمل ضربة، وبقعة القهوة تشرب الحبر.", "أول واحد يشطب كل جنود خصمه يفوز، والباقين يتفرجون على الورقة كاملة."],
  setup(S) {
    Object.assign(S, { duo: H.players.map((p) => p.id).slice(0, 2), n: 4, best: 1, wins: [0, 0], match: 0 });
    H.army = [[], []];
  },
  joined(id) { const S = H.S; if (S.phase === "lobby" && S.duo.length < 2 && !S.duo.includes(id)) S.duo.push(id); },
  left(id) { const S = H.S; S.duo = S.duo.filter((x) => x !== id); },
  snap(S) {
    S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0;
    if (H.army && S.phase !== "lobby") S.army = H.army.map((side) => side.map((s) => ({ x: s.x, y: s.y, alive: s.alive, tape: s.tape })));
  },
  key: (S) => `${S.phase}:${S.match}:${(S.stamps || []).length}:${S.turn}:${S.phase === "aim" ? S.moves : ""}`,
  on(m) {
    const S = H.S, seat = fSeat(S, m.id);
    if (m.t === "fplace" && S.phase === "setup" && seat >= 0 && !S.ready[seat]) {
      const pts = Array.isArray(m.pts) ? m.pts.slice(0, S.n).map((p) => ({ x: +p.x, y: +p.y })) : [];
      const ok = pts.length === S.n && pts.every((p, k) => Number.isFinite(p.x) && Number.isFinite(p.y) && fOkSpot(p, seat, pts.slice(0, k)));
      H.army[seat] = (ok ? pts : fRandom(seat, S.n)).map((p) => ({ x: p.x, y: p.y, alive: true, tape: false }));
      S.ready[seat] = true;
      if (S.ready[0] && S.ready[1]) fBattle(); else hostSend();
    }
    if (m.t === "fdrop" && S.phase === "aim" && seat === S.turn) {
      const ink = ["normal", "big", "double"].includes(m.ink) ? m.ink : "normal";
      if (ink !== "normal" && !S.special[seat][ink]) return;
      const drops = (Array.isArray(m.drops) ? m.drops : []).slice(0, 2).map((d) => ({ x: +d.x, y: +d.y }));
      if (drops.length !== (ink === "double" ? 2 : 1)) return;
      const f = foldGeo(S.fold);
      if (!drops.every((d) => Number.isFinite(d.x) && Number.isFinite(d.y) && fIn(d) && fOwn(f, d, seat))) return;
      fShoot(drops, ink);
    }
  },
  lobbyPlayers(S) {
    return `<p class="muted" style="font-weight:700;color:var(--soft)">اللاعبين (${AR(S.players.length)})${isHost() ? " · اضغط تختار اللي يلعبون" : ""}</p>
      <div class="players">${S.players.map((p) => { const i = S.duo.indexOf(p.id); return `<button type="button" class="pl ${p.id === PID ? "me" : ""}" data-duo="${esc(p.id)}" ${isHost() ? "" : "disabled"} style="text-align:start">${face(p, 36)}<div class="grow"><div class="name">${esc(p.name)}</div><div class="tag" style="${i >= 0 ? `color:${PCOL[i]};font-weight:700` : ""}">${i >= 0 ? (i === 0 ? "يلعب بالأزرق" : "يلعب بالأحمر") : "يتفرج"}</div></div></button>`; }).join("")}</div>`;
  },
  lobby(S) {
    return `<p class="muted" style="font-weight:700;color:var(--soft)">كم جندي؟</p>
      <div class="chips pick">${[3, 4, 5].map((n) => `<button type="button" class="chip" data-fn="${n}" aria-pressed="${S.n === n}">${AR(n)}</button>`).join("")}</div>
      <p class="muted" style="font-weight:700;color:var(--soft)">كم مباراة؟</p>
      <div class="chips pick"><button type="button" class="chip" data-fb="1" aria-pressed="${S.best === 1}">وحدة</button><button type="button" class="chip" data-fb="3" aria-pressed="${S.best === 3}">أفضل من ٣</button></div>`;
  },
  bindLobby(S) {
    screen.querySelectorAll("[data-duo]").forEach((b) => (b.onclick = () => {
      const id = b.dataset.duo, d = H.S.duo;
      H.S.duo = d.includes(id) ? d.filter((x) => x !== id) : d.length < 2 ? [...d, id] : [d[1], id];
      beep(640, 0.04); hostSend();
    }));
    screen.querySelectorAll("[data-fn]").forEach((b) => (b.onclick = () => { H.S.n = +b.dataset.fn; beep(700, 0.04); hostSend(); }));
    screen.querySelectorAll("[data-fb]").forEach((b) => (b.onclick = () => { H.S.best = +b.dataset.fb; beep(700, 0.04); hostSend(); }));
    if (S.duo.length < 2) $("start").disabled = true;
  },
  start() { H.S.wins = [0, 0]; H.S.match = 0; fSetup(); },
  views: { setup: fvSetup, aim: fvPlay, shot: fvPlay, over: fvOver },
};

// ---------------- the host ----------------
function fSetup() {
  hClear();
  const S = H.S;
  S.match++;
  H.army = [[], []];
  Object.assign(S, { phase: "setup", ready: [false, false], turn: (S.match + 1) % 2, fold: { ...fBase }, stamps: [], last: null, winner: -1, coffee: [], moves: 0,
    special: [{ big: 1, double: 1 }, { big: 1, double: 1 }], stats: [{ f: 0, h: 0 }, { f: 0, h: 0 }] });
  H.deadline = 0;
  hostSend();
}
function fMoveFold() {
  const S = H.S, live = [0, 1].flatMap((i) => H.army[i].filter((s) => s.alive).map((s) => ({ ...s, i })));
  S.moves++;
  for (let scale = 1, k = 0; k < 4; k++, scale *= 0.6) {
    for (let j = 0; j < 12; j++) {
      const cand = { cy: FMID + rnd(-0.07, 0.07) * scale, ang: (rnd(-10, 10) * scale * Math.PI) / 180 };
      const f = foldGeo(cand);
      if (live.every((s) => fOwn(f, s, s.i, FSR * 1.15))) { S.fold = cand; return; }
    }
  }
  S.fold = { ...fBase };
}
function fAim() {
  const S = H.S;
  fMoveFold();
  S.phase = "aim"; H.deadline = now() + FTURN;
  hostSend();
}
function fBattle() {
  const S = H.S;
  // one soldier on each side wears tape (takes one hit), and each side gets a coffee stain that drinks ink
  for (const i of [0, 1]) {
    const mine = H.army[i]; mine[Math.floor(Math.random() * mine.length)].tape = true;
    let g = 0, c;
    do { c = { p: i, x: rnd(0.15, 0.85), y: i === 0 ? rnd(FMID + 0.12, FH - 0.1) : rnd(0.1, FMID - 0.12), r: rnd(0.06, 0.085), seed: Math.floor(Math.random() * 1e9) }; } while (g++ < 200 && mine.some((s) => fDist(s, c) < c.r + FSR * 1.4));
    S.coffee.push(c);
  }
  hEvery(() => { if (S.phase === "aim" && now() >= H.deadline) { S.turn = 1 - S.turn; S.last = { skipped: true }; fAim(); } }, 300);
  fAim();
}
function fShoot(drops, ink) {
  const S = H.S, f = foldGeo(S.fold), by = S.turn, foe = 1 - by, size = ink === "big" ? "big" : "normal";
  if (ink !== "normal") S.special[by][ink] = 0;
  S.stats[by].f++;
  const results = drops.map((d) => {
    const tp = fReflect(f, d), st = { p: by, x: tp.x, y: tp.y, sx: d.x, sy: d.y, size, seed: Math.floor(Math.random() * 1e9), res: "miss" };
    if (!fIn(tp)) st.res = "off";
    else if (S.coffee.some((c) => c.p === foe && fDist(c, tp) < c.r)) st.res = "coffee";
    else {
      let best = null, bd = 9;
      H.army[foe].forEach((s) => { if (s.alive) { const dd = fDist(s, tp); if (dd < bd) { bd = dd; best = s; } } });
      if (best && bd <= FSR + FINK[size] * 0.85) { if (best.tape) { best.tape = false; st.res = "tape"; } else { best.alive = false; st.res = "hit"; S.stats[by].h++; } }
      else if (best && bd <= FSR + FINK[size] + 0.08) st.res = "near";
    }
    return st;
  });
  S.stamps.push(...results);
  S.last = { by, ink, results, fold: { ...S.fold } };
  S.phase = "shot"; H.deadline = 0;
  hostSend();
  hLater(() => {
    if (!H.army[foe].some((s) => s.alive)) return fOver(by);
    if (!results.some((r) => r.res === "hit")) S.turn = foe;
    fAim();
  }, 2900);
}
function fOver(w) {
  hClear();
  const S = H.S;
  S.wins[w]++;
  S.winner = w;
  S.over = S.best === 1 || S.wins[w] >= 2;
  S.phase = "over";
  hostSend();
}

// ---------------- sound: the same paper, pen and stamp noises as the one-phone game ----------------
let fAC = null;
const fCache = {};
const fEnv = (p, at, rel) => Math.max(0, Math.min(1, p < at ? p / at : p < rel ? 1 - ((p - at) / (rel - at)) * 0.6 : 0.4 * (1 - (p - rel) / (1 - rel))));
const FSFX = {
  place: [0.11, (t, p, n) => (n(0.35) * 0.5 + Math.sin(2 * Math.PI * 1400 * t) * 0.12 * (1 - p)) * fEnv(p, 0.05, 0.95)],
  drop: [0.14, (t, p) => Math.sin(2 * Math.PI * (900 - 650 * p) * t) * fEnv(p, 0.02, 0.9) * 0.45],
  fold: [0.55, (t, p, n) => (n(0.12 + 0.25 * p) * Math.sin(p * Math.PI) * 1.1 + (Math.random() > 0.965 ? Math.random() * 0.9 * Math.sin(p * Math.PI) : 0)) * 0.8],
  stamp: [0.32, (t, p, n) => Math.sin(2 * Math.PI * (110 - 60 * p) * t) * fEnv(p, 0.005, 0.5) * 0.95 + n(0.5) * fEnv(p, 0.01, 0.25) * 0.55],
  hit: [0.62, (t, p, n) => (p < 0.35 ? n(0.6) * Math.sin((p / 0.35) * 18 * Math.PI) ** 2 * 0.6 : 0) + (p > 0.2 ? (Math.sin(2 * Math.PI * 784 * t) * 0.5 + Math.sin(2 * Math.PI * 1175 * t) * 0.35 + Math.sin(2 * Math.PI * 1568 * t) * 0.15) * (1 - (p - 0.2) / 0.8) ** 2 * 0.55 : 0)],
  tape: [0.35, (t, p, n) => n(0.7) * fEnv(p, 0.02, 0.4) * 0.8],
  slurp: [0.4, (t, p) => Math.sin(2 * Math.PI * (300 - 220 * p) * t) * Math.sin(p * Math.PI) * 0.35],
  miss: [0.2, (t, p, n) => (Math.sin(2 * Math.PI * (180 - 70 * p) * t) * 0.6 + n(0.2) * 0.3) * fEnv(p, 0.01, 0.6) * 0.6],
  tick: [0.04, (t, p) => Math.sin(2 * Math.PI * 1800 * t) * (1 - p) * 0.2],
  win: [0.7, (t, p) => { const f = [523, 659, 784, 1046, 1318][Math.min(4, Math.floor(p * 5))]; return (Math.sin(2 * Math.PI * f * t) * 0.75 + Math.sin(4 * Math.PI * f * t) * 0.2) * 0.4; }],
  lose: [0.8, (t, p) => { const f = [392, 349, 294, 262][Math.min(3, Math.floor(p * 4))]; return Math.sin(2 * Math.PI * f * t) * 0.35; }],
};
function fPlay(name) {
  if (!soundOn) return;
  try {
    fAC ||= new (window.AudioContext || window.webkitAudioContext)();
    if (fAC.state === "suspended") fAC.resume();
    if (!fCache[name]) {
      const [dur, fn] = FSFX[name], n = Math.floor(fAC.sampleRate * dur), b = fAC.createBuffer(1, n, fAC.sampleRate), d = b.getChannelData(0);
      let last = 0; const noise = (k) => (last += (Math.random() * 2 - 1 - last) * k) * 1.6;
      for (let i = 0; i < n; i++) d[i] = fn(i / fAC.sampleRate, i / n, noise);
      fCache[name] = b;
    }
    const s = fAC.createBufferSource(); s.buffer = fCache[name]; s.connect(fAC.destination); s.start();
  } catch (e) {}
}

// ---------------- drawing: foolscap, ballpoint ink, pen soldiers ----------------
function fSeeded(s) { s = s >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function fBlobPath(ctx, x, y, r, seed) {
  const R = fSeeded(seed), n = 14, pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, q = r * (0.8 + R() * 0.38); pts.push([x + Math.cos(a) * q, y + Math.sin(a) * q]); }
  ctx.beginPath();
  const mid = (i) => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2];
  ctx.moveTo(...mid(n - 1));
  for (let i = 0; i < n; i++) ctx.quadraticCurveTo(pts[i][0], pts[i][1], ...mid(i));
  ctx.closePath();
  return R;
}
function fHatch(ctx, x, y, r, spacing, angle, color, width, alpha) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(angle);
  const R = fSeeded(Math.floor(x * 7 + y * 13));
  for (let i = -r * 1.6; i < r * 1.6; i += spacing) { const j = (R() - 0.5) * spacing * 0.8; ctx.beginPath(); ctx.moveTo(-r * 1.6, i + j); ctx.lineTo(r * 1.6, i - j); ctx.stroke(); }
  ctx.restore();
}
// a blot of ballpoint ink with splatter and, for hits, drips
function fBlob(ctx, x, y, r, seed, color, alpha, drips = 0, dn = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
  const R = fBlobPath(ctx, x, y, r, seed); ctx.fill();
  ctx.save(); fBlobPath(ctx, x, y, r, seed); ctx.clip();
  fHatch(ctx, x, y, r, r * 0.13, -0.6, "rgba(255,255,255,.22)", r * 0.035, 1); fHatch(ctx, x, y, r, r * 0.21, -0.55, color, r * 0.05, 0.5);
  ctx.restore();
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, r * 0.05); ctx.globalAlpha = alpha * 0.8; fBlobPath(ctx, x, y, r, seed); ctx.stroke(); ctx.globalAlpha = alpha;
  for (let i = 0; i < 3 + Math.floor(R() * 3); i++) { const a = R() * Math.PI * 2, d = r * (1.2 + R() * 0.8); ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.06 + R() * 0.12), 0, 7); ctx.fill(); }
  for (let i = 0; i < drips; i++) { const dx = (R() - 0.5) * r * 1.2, len = r * (0.8 + R() * 1.6); ctx.lineWidth = r * (0.12 + R() * 0.1); ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x + dx, y + dn * r * 0.4); ctx.lineTo(x + dx, y + dn * (r * 0.4 + len)); ctx.stroke(); ctx.beginPath(); ctx.arc(x + dx, y + dn * (r * 0.4 + len), ctx.lineWidth * 0.8, 0, 7); ctx.fill(); }
  ctx.restore();
}
function fPaper(ctx, u, poly) {
  const w = u, h = FH * u;
  ctx.save();
  if (poly) { ctx.beginPath(); poly.forEach((p, i) => (i ? ctx.lineTo(p.x * u, p.y * u) : ctx.moveTo(p.x * u, p.y * u))); ctx.closePath(); ctx.clip(); }
  ctx.fillStyle = PAPER.bg; ctx.fillRect(0, 0, w, h);
  const R = fSeeded(91);
  ctx.fillStyle = "rgba(60,50,30,.035)"; for (let i = 0; i < 700; i++) ctx.fillRect(R() * w, R() * h, 1, 1);
  ctx.strokeStyle = PAPER.line; ctx.lineWidth = 1; ctx.beginPath(); for (let y = PAPER.gap * u; y < h - 0.02 * u; y += PAPER.gap * u) { ctx.moveTo(0, y); ctx.lineTo(w, y); } ctx.stroke();
  ctx.strokeStyle = PAPER.margin; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(w - 0.1 * u, 0); ctx.lineTo(w - 0.1 * u, h); ctx.stroke();
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(90,70,40,.08)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
function fSoldier(ctx, u, s, i, flip) {
  const x = s.x * u, y = s.y * u, r = FSR * u, col = s.alive ? PCOL[i] : "#8b93a3", w = Math.max(1.6, r * 0.13);
  ctx.save(); ctx.translate(x, y); if (flip) ctx.rotate(Math.PI); ctx.strokeStyle = col; ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (s.alive) { ctx.save(); ctx.globalAlpha = 0.18; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); ctx.restore(); }
  const hr = r * 0.3, hy = -r * 0.42;
  ctx.lineWidth = w * 0.85; ctx.globalAlpha = 0.92; ctx.beginPath();
  ctx.arc(0, hy, hr, 0, Math.PI * 2); ctx.moveTo(0, hy + hr); ctx.lineTo(0, r * 0.3);
  if (s.alive) { ctx.moveTo(-r * 0.55, -r * 0.02); ctx.lineTo(0, -r * 0.1); ctx.lineTo(r * 0.6, -r * 0.3); ctx.moveTo(r * 0.35, -r * 0.1); ctx.lineTo(r * 0.85, -r * 0.62); }
  else { ctx.moveTo(-r * 0.5, r * 0.3); ctx.lineTo(0, -r * 0.05); ctx.lineTo(r * 0.5, r * 0.3); }
  ctx.moveTo(-r * 0.4, r * 0.82); ctx.lineTo(0, r * 0.3); ctx.lineTo(r * 0.4, r * 0.82); ctx.stroke();
  ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-hr * 1.25, hy - hr * 0.2); ctx.quadraticCurveTo(0, hy - hr * 2.1, hr * 1.25, hy - hr * 0.2); ctx.closePath(); ctx.fill();
  if (s.tape && s.alive) { ctx.save(); ctx.rotate(-0.25); ctx.fillStyle = "rgba(236,226,190,.82)"; ctx.fillRect(-r * 1.15, -r * 0.28, r * 2.3, r * 0.56); ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(-r * 1.15, -r * 0.28, r * 2.3, r * 0.12); ctx.restore(); }
  if (!s.alive) { ctx.strokeStyle = PCOL[1 - i]; ctx.lineWidth = r * 0.16; ctx.beginPath(); ctx.moveTo(-r, -r); ctx.lineTo(r, r); ctx.moveTo(r, -r); ctx.lineTo(-r, r); ctx.stroke(); }
  ctx.restore();
}
function fCoffee(ctx, u, c) {
  const x = c.x * u, y = c.y * u, r = c.r * u;
  ctx.save();
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
  g.addColorStop(0, "rgba(139,90,43,.12)"); g.addColorStop(0.85, "rgba(139,90,43,.22)"); g.addColorStop(1, "rgba(120,72,30,.55)");
  ctx.fillStyle = g; fBlobPath(ctx, x, y, r, c.seed); ctx.fill(); ctx.strokeStyle = "rgba(110,66,28,.5)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
function fPrint(ctx, u, st, dn) {
  const r = FINK[st.size] * u, hit = st.res === "hit";
  const col = hit ? PCOL[st.p] : st.res === "coffee" ? "rgba(110,66,28,.8)" : "#5b6477";
  fBlob(ctx, st.x * u, st.y * u, r, st.seed, col, hit ? 0.92 : 0.5, hit ? 3 : 0, dn);
}
function fDropDot(ctx, u, d, i, size, pulse) {
  const x = d.x * u, y = d.y * u, r = FINK[size] * u;
  ctx.save(); ctx.fillStyle = PCOL[i]; ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.arc(x, y, r * (1.5 + 0.35 * pulse), 0, 7); ctx.fill(); ctx.restore();
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, "#fff"); g.addColorStop(0.2, PCOL[i]); g.addColorStop(1, PCOL[i]);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}
function fHalf(f, i) {
  const poly = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: FH }, { x: 0, y: FH }], keep = (p) => (i === 0 ? fSide(f, p) >= 0 : fSide(f, p) <= 0), out = [];
  for (let k = 0; k < 4; k++) {
    const a = poly[k], b = poly[(k + 1) % 4], ka = keep(a), kb = keep(b);
    if (ka) out.push(a);
    if (ka !== kb) { const da = fSide(f, a), db = fSide(f, b), t = da / (da - db); out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); }
  }
  return out;
}
const fClip = (ctx, u, poly) => { ctx.beginPath(); poly.forEach((p, k) => (k ? ctx.lineTo(p.x * u, p.y * u) : ctx.moveTo(p.x * u, p.y * u))); ctx.closePath(); ctx.clip(); };

// Everything this phone may see on one half: its coffee, the ink printed there, soldiers, the wet drops.
function fContent(ctx, u, S, side, v) {
  const seat = fSeat(S, PID);
  for (const c of S.coffee || []) if (c.p === side) fCoffee(ctx, u, c);
  const stamps = (S.stamps || []).slice(0, v.stampsShown);
  for (const st of stamps) if (st.p === side) fBlob(ctx, st.sx * u, st.sy * u, FINK[st.size] * u * 0.55, st.seed + 7, PCOL[st.p], 0.3);
  for (const st of stamps) if (st.p !== side && st.res !== "off") fPrint(ctx, u, st, seat === 1 ? -1 : 1);
  // your own soldiers always; the other side's only when crossed out, when watching, or at the end
  const army = v.draft && side === seat ? v.draft.map((p) => ({ ...p, alive: true })) : ((S.army || [[], []])[side] || []);
  for (const s of army) if (seat < 0 || side === seat || !s.alive || S.phase === "over") fSoldier(ctx, u, s, side, seat === 1);
  for (const d of v.drops || []) if (v.dropSide === side) fDropDot(ctx, u, d, side, v.size, v.pulse);
}
function fRender(S, v) {
  const cv = $("fcv"); if (!cv) return;
  const ctx = cv.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2), u = cv.clientWidth;
  if (cv.width !== Math.round(u * dpr)) { cv.width = Math.round(u * dpr); cv.height = Math.round(u * FH * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, u, FH * u);
  ctx.save();
  if (v.fx) { const k = v.fx.k, cx = v.fx.x * u, cy = v.fx.y * u; ctx.translate(cx, cy); ctx.scale(1 + 0.12 * k, 1 + 0.12 * k); ctx.translate(-cx, -cy); ctx.translate((Math.random() - 0.5) * 10 * k, (Math.random() - 0.5) * 10 * k); }
  if (fSeat(S, PID) === 1) { ctx.translate(u, FH * u); ctx.rotate(Math.PI); }
  const fold = v.fold || S.fold || fBase, f = foldGeo(fold);
  for (const side of [0, 1]) {
    if (v.anim && v.anim.side === side) continue;
    const poly = fHalf(f, side);
    fPaper(ctx, u, poly);
    ctx.save(); fClip(ctx, u, poly); fContent(ctx, u, S, side, v); ctx.restore();
  }
  if (v.anim) {
    const a = v.anim, poly = fHalf(f, a.side), s = Math.cos(Math.PI * a.p);
    ctx.save(); fClip(ctx, u, fHalf(f, 1 - a.side)); ctx.fillStyle = `rgba(0,0,0,${0.35 * Math.sin(Math.PI * a.p)})`; ctx.fillRect(0, 0, u, FH * u); ctx.restore();
    // the flap: squash along the fold normal, flip past 90°
    ctx.save();
    ctx.translate(f.c.x * u, f.c.y * u); ctx.rotate(fold.ang); ctx.scale(1, s); ctx.rotate(-fold.ang); ctx.translate(-f.c.x * u, -f.c.y * u);
    if (s > 0) { fPaper(ctx, u, poly); ctx.save(); fClip(ctx, u, poly); fContent(ctx, u, S, a.side, v); ctx.fillStyle = `rgba(0,0,0,${0.2 * Math.sin(Math.PI * a.p)})`; ctx.fillRect(0, 0, u, FH * u); ctx.restore(); }
    else { ctx.save(); fClip(ctx, u, poly); ctx.fillStyle = PAPER.back; ctx.fillRect(0, 0, u, FH * u); ctx.strokeStyle = "rgba(0,0,0,.06)"; for (let i = -FH * u; i < u; i += 12) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + FH * u, FH * u); ctx.stroke(); } ctx.restore(); }
    ctx.restore();
  } else {
    ctx.save(); ctx.strokeStyle = PAPER.fold; ctx.lineWidth = 2; ctx.setLineDash([9, 7]); ctx.beginPath(); ctx.moveTo((f.c.x - f.t.x * 2) * u, (f.c.y - f.t.y * 2) * u); ctx.lineTo((f.c.x + f.t.x * 2) * u, (f.c.y + f.t.y * 2) * u); ctx.stroke(); ctx.restore();
  }
  if (v.fx) for (const pt of v.fx.parts) { ctx.fillStyle = pt.c; ctx.globalAlpha = Math.max(0, pt.life); ctx.beginPath(); ctx.arc(pt.x * u, pt.y * u, pt.r, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.restore();
}
// a tap on the sheet, in sheet units (undoing the flip)
function fPoint(S, ev) {
  const cv = $("fcv"), r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = ((ev.clientY - r.top) / r.height) * FH;
  return fSeat(S, PID) === 1 ? { x: 1 - x, y: FH - y } : { x, y };
}
const fName = (S, i) => esc(who(S.duo[i]).name);
const fHead = (S) => `<div class="row" style="justify-content:space-between"><span class="row" style="gap:6px;color:#8fb0ff;font-weight:700">${face(who(S.duo[0]), 30)}${fName(S, 0)}${S.best === 3 ? ` · ${AR(S.wins[0])}` : ""}</span><span class="row" style="gap:6px;color:#ff9aa0;font-weight:700">${S.best === 3 ? `${AR(S.wins[1])} · ` : ""}${fName(S, 1)}${face(who(S.duo[1]), 30)}</span></div>`;
const fBoard = () => `<div class="fwrap"><canvas id="fcv" class="fcv"></canvas><div id="ftoast" class="ftoast" hidden></div></div>`;
function fToast(msg, bg, fg = "#fff") {
  const el = $("ftoast"); if (!el) return;
  el.textContent = msg; el.style.background = bg; el.style.color = fg; el.hidden = false; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
  clearTimeout(fToast.t); fToast.t = setTimeout(() => { if ($("ftoast")) $("ftoast").hidden = true; }, 1500);
}
// the room is dark around the paper, like a desk at night
function fKeepDrawing(S, v) { const loop = () => { if (KL.fv !== v || !$("fcv")) return; v.pulse = (Math.sin(now() / 260) + 1) / 2; fRender(KL.S || S, v); requestAnimationFrame(loop); }; KL.fv = v; requestAnimationFrame(loop); }

function fvSetup(S, fresh) {
  const seat = fSeat(S, PID);
  if (fresh) { clearKL(); KL.my.draft = []; setTop(S.best === 3 ? `المباراة ${AR(S.match)}` : "رتّب جنودك"); }
  const mineReady = seat >= 0 && S.ready[seat];
  if (seat < 0 || mineReady) {
    KL.fv = null;
    show(`${fHead(S)}<div class="fcard" style="text-align:center;display:grid;gap:8px"><h2 style="font-size:26px">${seat < 0 ? "اللاعبين يرتبون جنودهم…" : "جنودك جاهزين"}</h2><p class="muted">${[0, 1].map((i) => `${fName(S, i)}: ${S.ready[i] ? "جاهز" : "يرتّب…"}`).join(" · ")}</p></div>`);
    return;
  }
  if (!fresh && $("fcv")) return;
  const v = { draft: KL.my.draft, stampsShown: 0 };
  show(`${fHead(S)}
    <p class="muted" style="text-align:center" id="fHint"></p>
    ${fBoard()}
    <div class="row"><button type="button" class="btn btn-ghost" id="fRand" style="flex:1">وزّعهم عشوائي</button><button type="button" class="btn btn-marker" id="fReady" style="flex:1.3"></button></div>`);
  const sync = () => {
    const d = KL.my.draft; v.draft = d;
    $("fHint").textContent = `اضغط في نصفك (تحت) تحط ${AR(S.n)} جنود، واضغط على جندي تشيله. خصمك ما يشوفهم.`;
    $("fReady").disabled = d.length !== S.n; $("fReady").textContent = d.length === S.n ? "جاهز" : `باقي ${AR(S.n - d.length)}`;
  };
  $("fcv").onpointerdown = (ev) => {
    const p = fPoint(S, ev), d = KL.my.draft, k = d.findIndex((s) => fDist(s, p) < FSR * 1.3);
    if (k >= 0) { d.splice(k, 1); fPlay("miss"); }
    else if (d.length < S.n && fOkSpot(p, seat, d)) { d.push(p); fPlay("place"); buzz(10); }
    else { fToast(d.length >= S.n ? "كذا عددهم كامل" : "بعيد عن النص والأطراف والجنود الثانين", "#e9ecf3", "#161d2c"); return; }
    sync();
  };
  $("fRand").onclick = () => { KL.my.draft = fRandom(seat, S.n); fPlay("place"); sync(); };
  $("fReady").onclick = () => { act({ t: "fplace", id: PID, pts: KL.my.draft }); fPlay("stamp"); };
  sync(); fKeepDrawing(S, v);
}
function fvPlay(S, fresh) {
  const seat = fSeat(S, PID), mine = S.phase === "aim" && seat === S.turn;
  if (!fresh) return;
  clearKL();
  if (S.phase === "aim") { KL.my.drops = []; KL.my.ink = "normal"; }
  const sp = seat >= 0 ? S.special[seat] : null;
  setTop(seat < 0 ? "تتفرج" : mine ? "دورك" : S.phase === "aim" ? "دور خصمك" : "");
  const turnCol = PCOL[S.phase === "shot" ? S.last.by : S.turn];
  show(`${fHead(S)}
    <div class="fturn" style="border-color:${turnCol};color:${S.phase === "shot" ? "#fff" : turnCol === PCOL[0] ? "#8fb0ff" : "#ff9aa0"}" id="fMsg">${S.phase === "shot" ? `${fName(S, S.last.by)} طوى الورقة…` : mine ? "حط نقطة حبر في نصفك" : `${fName(S, S.turn)} يصوّب…`}</div>
    ${fBoard()}
    ${mine ? `<div class="timer"><i id="fbar"></i></div>
      <div class="row">
        <button type="button" class="fink" data-ink="big" ${sp.big ? "" : "disabled"} aria-pressed="false">نقطة كبيرة${sp.big ? "" : " ✓"}</button>
        <button type="button" class="fink" data-ink="double" ${sp.double ? "" : "disabled"} aria-pressed="false">نقطتين${sp.double ? "" : " ✓"}</button>
        <button type="button" class="btn btn-marker" id="fGo" style="flex:1.4" disabled>اطوِها!</button>
      </div>` : `<p class="muted" style="text-align:center">${seat < 0 ? "تشوف جنود الاثنين. لا تفضح أحد 🤫" : "خط الطي يتحرك ويميل كل دور."}</p>`}`);
  const v = { stampsShown: (S.stamps || []).length, drops: [], dropSide: S.turn, size: "normal", pulse: 0 };
  if (S.phase === "shot") fAnimate(S, v); else fKeepDrawing(S, v);
  if (S.phase === "aim") {
    if (mine) { fPlay("drop"); buzz(30); }
    else if (S.last && S.last.skipped) fToast("خلص الوقت! الدور انتقل", "#e9962b");
  }
  if (!mine) return;
  const need = () => (KL.my.ink === "double" ? 2 : 1);
  const sync = () => { v.drops = KL.my.drops; v.size = KL.my.ink === "big" ? "big" : "normal"; $("fGo").disabled = KL.my.drops.length < need(); screen.querySelectorAll(".fink").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ink === KL.my.ink))); };
  $("fcv").onpointerdown = (ev) => {
    const p = fPoint(S, ev);
    if (!fOwn(foldGeo(S.fold), p, seat) || !fIn(p)) { fToast("الحبر يكون في نصفك بس", "#e9ecf3", "#161d2c"); return; }
    const d = KL.my.drops; if (d.length >= need()) d.shift(); d.push(p);
    fPlay("drop"); buzz(10); sync();
  };
  screen.querySelectorAll(".fink").forEach((b) => (b.onclick = () => { KL.my.ink = KL.my.ink === b.dataset.ink ? "normal" : b.dataset.ink; if (KL.my.drops.length > need()) KL.my.drops = KL.my.drops.slice(-need()); fPlay("place"); sync(); }));
  $("fGo").onclick = () => { if (KL.my.drops.length < need()) return; $("fGo").disabled = true; act({ t: "fdrop", id: PID, drops: KL.my.drops, ink: KL.my.ink }); };
  let lastSec = 99;
  klEvery(() => {
    const s = KL.S; if (!s || s.phase !== "aim") return;
    const left = leftOf(s.left), b = $("fbar"); if (b) b.style.transform = `scaleX(${left / FTURN})`;
    const sec = Math.ceil(left / 1000); if (sec <= 3 && sec < lastSec && sec > 0) { fPlay("tick"); buzz(15); } lastSec = sec;
  }, 150);
  sync();
}
// the fold everyone sees: the shooter's half closes over, prints, and opens again
function fAnimate(S, v) {
  const L = S.last, CLOSE = 560, HOLD = 220, OPEN = 520, t0 = performance.now();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  Object.assign(v, { fold: L.fold, drops: L.results.map((r) => ({ x: r.sx, y: r.sy })), dropSide: L.by, size: L.results[0].size, stampsShown: S.stamps.length - L.results.length, anim: { side: L.by, p: 0 } });
  KL.fv = v;
  fPlay("fold"); buzz(25);
  let printed = false;
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
  const step = (t) => {
    if (KL.fv !== v) return;
    const k = t - t0;
    v.anim.p = reduce ? (k < 200 ? 1 : 0) : k < CLOSE ? ease(k / CLOSE) : k < CLOSE + HOLD ? 1 : 1 - ease(Math.min(1, (k - CLOSE - HOLD) / OPEN));
    if (!printed && k >= (reduce ? 100 : CLOSE)) { printed = true; v.stampsShown = S.stamps.length; v.drops = []; fPlay("stamp"); buzz(90); }
    fRender(S, v);
    if (k < (reduce ? 300 : CLOSE + HOLD + OPEN)) requestAnimationFrame(step);
    else { v.anim = null; fAfter(S, v); }
  };
  requestAnimationFrame(step);
}
function fAfter(S, v) {
  const L = S.last, rs = L.results, hits = rs.filter((r) => r.res === "hit"), seat = fSeat(S, PID);
  const by = fName(S, L.by), msg = $("fMsg");
  let text;
  if (hits.length) {
    const h = hits[0], parts = [];
    for (let i = 0; i < 26; i++) { const a = Math.random() * 7, sp = rnd(0.004, 0.014); parts.push({ x: h.x, y: h.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rnd(2, 5), c: PCOL[h.p], life: 1 }); }
    v.fx = { x: h.x, y: h.y, k: 1, parts }; const t0 = performance.now();
    const step = (t) => { if (KL.fv !== v || !v.fx) return; const k = (t - t0) / 700; v.fx.k = Math.max(0, 1 - k); for (const p of v.fx.parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.0006; p.life -= 0.03; } fRender(S, v); if (k < 1) requestAnimationFrame(step); else { v.fx = null; fRender(S, v); } };
    requestAnimationFrame(step);
    fPlay("hit"); buzz([60, 40, 120]);
    text = hits.length > 1 ? "ضربتين بطية وحدة!" : seat === 1 - L.by ? "انشطب واحد من جنودك!" : "صبت! ويكمل دوره";
    fToast(text, PCOL[L.by]);
  } else if (rs.some((r) => r.res === "tape")) { fPlay("tape"); fToast(text = "اللزقة حمت الجندي!", "#b8a76a", "#2a2206"); }
  else if (rs.some((r) => r.res === "coffee")) { fPlay("slurp"); fToast(text = "القهوة شربت الحبر", "#7a4d22"); }
  else if (rs.every((r) => r.res === "off")) { fPlay("miss"); fToast(text = "طلعت برا الورقة", "#e9ecf3", "#161d2c"); }
  else if (rs.some((r) => r.res === "near")) { fPlay("miss"); fToast(text = "قريبة! قريبة!", "#e9962b"); }
  else { fPlay("miss"); fToast(text = "طاشت", "#e9ecf3", "#161d2c"); }
  if (msg) msg.textContent = `${by}: ${text}`;
}
function fvOver(S, fresh) {
  if (!fresh) return;
  clearKL(); setTop(S.over ? "انتهت" : `بعد المباراة ${AR(S.match)}`);
  const seat = fSeat(S, PID), w = S.over && S.best === 3 ? (S.wins[0] > S.wins[1] ? 0 : 1) : S.winner;
  fPlay(seat === w || seat < 0 ? "win" : "lose"); buzz([80, 60, 160]);
  const st = S.stats;
  show(`${fHead(S)}
    <div class="fcard pop" style="text-align:center;display:grid;gap:6px;justify-items:center">
      ${face(who(S.duo[w]), 70)}
      <h2 style="font-size:30px;color:${w === 0 ? "#8fb0ff" : "#ff9aa0"}">${seat === w ? "فزت!" : `فاز ${fName(S, w)}!`}</h2>
      <p class="muted">${[0, 1].map((i) => `${fName(S, i)}: ${AR(st[i].h)} صابت من ${AR(st[i].f)} طيّات`).join(" · ")}</p>
    </div>
    ${fBoard()}
    ${isHost() ? (S.over ? '<button type="button" class="btn btn-marker" id="fAgain">جلسة جديدة</button>' : `<button type="button" class="btn btn-marker" id="fNext">المباراة ${AR(S.match + 1)}</button>`) : '<p class="muted" style="text-align:center">بانتظار المضيف…</p>'}
    <button type="button" class="btn btn-ghost" id="fHome">رجوع لفسحة</button>`);
  fKeepDrawing(S, { stampsShown: S.stamps.length });
  if (isHost()) { if (S.over) $("fAgain").onclick = () => hostAgain(); else $("fNext").onclick = () => fSetup(); }
  $("fHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}
