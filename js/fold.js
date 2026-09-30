"use strict";
// ================= اطوِها! online: two players on two phones, everyone else in the room watches =================
// The sheet is 1 wide and FH tall. Player 0 owns the bottom half, player 1 the top; each phone turns
// the sheet so its owner's half is at the bottom. A drop of ink is mirrored across the fold line:
// if it lands on an enemy soldier, the soldier is crossed out and the shooter goes again.

const FH = 1.4, FMID = FH / 2, FSR = 0.052, FINK = 0.045, FSAFE = FSR * 1.8, FEDGE = FSR, FGAP = 0.15, FTURN = 20000;
const PCOL = ["#1d3fb8", "#c8232c"];
const foldGeo = (fold) => { const a = fold.ang; return { c: { x: 0.5, y: fold.cy }, n: { x: -Math.sin(a), y: Math.cos(a) } }; };
const fSide = (f, p) => (p.x - f.c.x) * f.n.x + (p.y - f.c.y) * f.n.y; // > 0 = player 0's side (bottom)
const fReflect = (f, p) => { const d = fSide(f, p); return { x: p.x - 2 * d * f.n.x, y: p.y - 2 * d * f.n.y }; };
const fOwn = (f, p, i, pad = 0) => (i === 0 ? fSide(f, p) > pad : fSide(f, p) < -pad);
const fDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const fBase = { cy: FMID, ang: 0 };
// a spot where a soldier may stand: inside own half, away from the middle, the edges and the other soldiers
const fOkSpot = (p, i, others) => p.x > FEDGE && p.x < 1 - FEDGE && p.y > FEDGE && p.y < FH - FEDGE && fOwn(foldGeo(fBase), p, i, FSAFE) && others.every((o) => fDist(o, p) > FGAP);
function fRandom(i, n) {
  const out = []; let g = 0;
  while (out.length < n && g++ < 2000) { const p = { x: rnd(FEDGE, 1 - FEDGE), y: i === 0 ? rnd(FMID + FSAFE, FH - FEDGE) : rnd(FEDGE, FMID - FSAFE) }; if (fOkSpot(p, i, out)) out.push(p); }
  return out;
}
const fSeat = (S, id) => (S.duo || []).indexOf(id); // 0, 1, or -1 for someone watching

ROOM_GAMES.foldit = {
  name: "اطوِها!", theme: "khallast", min: 2, need: "يحتاج لاعبين", who: "لاعبين · والباقي يتفرجون",
  rules: ["كل لاعب يوزّع جنوده في نصفه من الورقة، وخصمه ما يشوفهم.", "في دورك تحط نقطة حبر في نصفك.", "تنطوي الورقة، والحبر ينطبع على الجهة الثانية ويشطب أي جندي تحته.", "إذا صبت يستمر دورك، وخط الطي يتحرك ويميل كل دور.", "أول واحد يشطب كل جنود خصمه يفوز.", "الباقين يتفرجون على الورقة كاملة."],
  setup(S) {
    const ids = H.players.map((p) => p.id);
    Object.assign(S, { duo: ids.slice(0, 2), n: 4, best: 1, wins: [0, 0], match: 0 });
    Object.assign(H, { army: [[], []] });
  },
  joined(id) { const S = H.S; if (S.phase === "lobby" && S.duo.length < 2 && !S.duo.includes(id)) S.duo.push(id); },
  left(id) { const S = H.S; S.duo = S.duo.filter((x) => x !== id); },
  snap(S) { S.left = H.deadline ? Math.max(0, H.deadline - now()) : 0; },
  key: (S) => `${S.phase}:${S.match}:${S.shots ? S.shots.length : 0}:${S.turn}`,
  on(m) {
    const S = H.S, seat = fSeat(S, m.id);
    if (m.t === "fplace" && S.phase === "setup" && seat >= 0 && !S.ready[seat]) {
      const pts = Array.isArray(m.pts) ? m.pts.slice(0, S.n).map((p) => ({ x: +p.x, y: +p.y })) : [];
      const ok = pts.length === S.n && pts.every((p, k) => Number.isFinite(p.x) && Number.isFinite(p.y) && fOkSpot(p, seat, pts.slice(0, k)));
      H.army[seat] = (ok ? pts : fRandom(seat, S.n)).map((p) => ({ ...p, alive: true }));
      S.ready[seat] = true;
      if (S.ready[0] && S.ready[1]) fBattle(); else hostSend();
    }
    if (m.t === "fdrop" && S.phase === "aim" && seat === S.turn) {
      const d = { x: +m.x, y: +m.y };
      if (!Number.isFinite(d.x) || !Number.isFinite(d.y) || !fOwn(foldGeo(S.fold), d, seat) || d.x < 0 || d.x > 1 || d.y < 0 || d.y > FH) return;
      fShoot(d);
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
  views: { setup: fvSetup, aim: fvSheet, shot: fvSheet, over: fvOver },
};

// ---------------- the host ----------------
function fSetup() {
  hClear();
  const S = H.S;
  S.match++;
  H.army = [[], []];
  Object.assign(S, { phase: "setup", ready: [false, false], turn: (S.match + 1) % 2, fold: { ...fBase }, shots: [], army: null, last: null, winner: -1 });
  H.deadline = 0;
  hostSend();
}
function fMoveFold() {
  const S = H.S, live = [0, 1].flatMap((i) => H.army[i].filter((s) => s.alive).map((s) => ({ ...s, i })));
  for (let scale = 1, k = 0; k < 4; k++, scale *= 0.6) {
    for (let j = 0; j < 12; j++) {
      const cand = { cy: FMID + rnd(-0.07, 0.07) * scale, ang: (rnd(-10, 10) * scale * Math.PI) / 180 };
      const f = foldGeo(cand);
      if (live.every((s) => fOwn(f, s, s.i, FSR * 1.15))) { S.fold = cand; return; }
    }
  }
  S.fold = { ...fBase };
}
// what everyone may see: crossed-out soldiers of both sides, and every soldier once the match is over
function fPublic() {
  const S = H.S;
  S.army = [0, 1].map((i) => H.army[i].map((s) => ({ x: s.x, y: s.y, alive: s.alive })));
}
function fBattle() {
  const S = H.S;
  fPublic();
  S.phase = "aim";
  fMoveFold();
  H.deadline = now() + FTURN;
  hEvery(() => { if (S.phase === "aim" && now() >= H.deadline) { S.turn = 1 - S.turn; fMoveFold(); H.deadline = now() + FTURN; S.last = { skipped: true }; hostSend(); } }, 300);
  hostSend();
}
function fShoot(d) {
  const S = H.S, f = foldGeo(S.fold), tp = fReflect(f, d), foe = 1 - S.turn;
  let best = null, bd = 9;
  H.army[foe].forEach((s) => { if (s.alive) { const dd = fDist(s, tp); if (dd < bd) { bd = dd; best = s; } } });
  const inside = tp.x >= 0 && tp.x <= 1 && tp.y >= 0 && tp.y <= FH;
  const hit = inside && best && bd <= FSR + FINK * 0.85;
  if (hit) best.alive = false;
  const shot = { by: S.turn, x: d.x, y: d.y, tx: tp.x, ty: tp.y, res: !inside ? "off" : hit ? "hit" : best && bd <= FSR + FINK + 0.08 ? "near" : "miss", fold: { ...S.fold } };
  S.shots.push(shot); S.last = shot;
  fPublic();
  S.phase = "shot"; H.deadline = 0;
  hostSend();
  hLater(() => {
    if (!H.army[foe].some((s) => s.alive)) return fOver(S.turn);
    if (!hit) S.turn = foe;
    fMoveFold();
    S.phase = "aim"; H.deadline = now() + FTURN;
    hostSend();
  }, 2200);
}
function fOver(w) {
  hClear();
  const S = H.S;
  S.wins[w]++;
  S.winner = w;
  S.over = S.best === 1 || S.wins[w] >= 2;
  S.army = [0, 1].map((i) => H.army[i].map((s) => ({ x: s.x, y: s.y, alive: s.alive })));
  S.reveal = true;
  S.phase = "over";
  hostSend();
}

// ---------------- every phone ----------------
// the sheet as SVG; `flip` turns it round for player 1 so their half is at the bottom
function fSheet(S, opts = {}) {
  const seat = fSeat(S, PID), flip = seat === 1, W = 300, U = W, Hh = FH * U;
  const P = (p) => (flip ? { x: (1 - p.x) * U, y: (FH - p.y) * U } : { x: p.x * U, y: p.y * U });
  const f = foldGeo(S.fold || fBase), a = P({ x: f.c.x - 2 * Math.cos(S.fold.ang), y: f.c.y - 2 * Math.sin(S.fold.ang) }), b = P({ x: f.c.x + 2 * Math.cos(S.fold.ang), y: f.c.y + 2 * Math.sin(S.fold.ang) });
  const soldier = (s, i, mine) => { const c = P(s), r = FSR * U; return `<g opacity="${s.alive ? 1 : 0.55}"><circle cx="${c.x}" cy="${c.y - r * 0.35}" r="${r * 0.42}" fill="none" stroke="${PCOL[i]}" stroke-width="3"/><path d="M${c.x} ${c.y + r * 0.07}v${r * 0.75}M${c.x - r * 0.5} ${c.y + r * 0.35}h${r}M${c.x} ${c.y + r * 0.82}l${-r * 0.4} ${r * 0.5}M${c.x} ${c.y + r * 0.82}l${r * 0.4} ${r * 0.5}" stroke="${PCOL[i]}" stroke-width="3" stroke-linecap="round" fill="none"/>${s.alive ? "" : `<path d="M${c.x - r} ${c.y - r}l${2 * r} ${2 * r}M${c.x + r} ${c.y - r}l${-2 * r} ${2 * r}" stroke="#111" stroke-width="4" stroke-linecap="round"/>`}</g>`; };
  // who sees which soldiers: your own always; the other side's only when crossed out, when watching, or at the end
  const armies = [0, 1].map((i) => {
    const list = opts.draft && i === seat ? opts.draft.map((p) => ({ ...p, alive: true })) : (S.army || [[], []])[i] || [];
    return list.filter((s) => seat < 0 || i === seat || !s.alive || S.reveal).map((s) => soldier(s, i, i === seat)).join("");
  }).join("");
  const blots = (S.shots || []).map((s, k) => { const d = P({ x: s.x, y: s.y }), t = P({ x: s.tx, y: s.ty }), last = k === S.shots.length - 1 && S.phase === "shot"; return `<circle cx="${d.x}" cy="${d.y}" r="${FINK * U}" fill="${PCOL[s.by]}" opacity=".25"/>${s.res !== "off" ? `<circle cx="${t.x}" cy="${t.y}" r="${FINK * U}" fill="${PCOL[s.by]}" opacity="${last ? 0.9 : 0.55}" ${last ? 'class="fpop"' : ""}/>` : ""}`; }).join("");
  const half = (i, color) => { // tint the half that belongs to player i
    const pts = [[0, 0], [1, 0], [1, FH], [0, FH]].map(([x, y]) => ({ x, y }));
    const keep = (p) => (i === 0 ? fSide(f, p) >= 0 : fSide(f, p) <= 0), out = [];
    pts.forEach((p, k) => { const q = pts[(k + 1) % 4]; if (keep(p)) out.push(p); if (keep(p) !== keep(q)) { const dp = fSide(f, p), dq = fSide(f, q), t = dp / (dp - dq); out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }); } });
    return `<path d="M${out.map((p) => { const c = P(p); return `${c.x} ${c.y}`; }).join("L")}Z" fill="${color}"/>`;
  };
  const drop = opts.drop ? (() => { const c = P(opts.drop); return `<circle cx="${c.x}" cy="${c.y}" r="${FINK * U}" fill="${PCOL[seat]}" opacity=".9"/>`; })() : "";
  return `<svg id="fsheet" viewBox="0 0 ${W} ${Hh}" style="display:block;margin:0 auto;height:min(56vh, calc((100vw - 32px) * 1.4), 600px);height:min(56dvh, calc((100vw - 32px) * 1.4), 600px);width:auto;aspect-ratio:300 / 420;max-width:100%;touch-action:none;background:#fffdf7;border-radius:8px;box-shadow:0 12px 26px -12px rgba(0,0,0,.6)">
    ${half(0, "rgba(29,63,184,.06)")}${half(1, "rgba(200,35,44,.06)")}
    ${Array.from({ length: Math.floor(Hh / 22) }, (_, k) => `<path d="M0 ${(k + 1) * 22}H${W}" stroke="#c7d7ea" stroke-width="1"/>`).join("")}
    <path d="M${a.x} ${a.y}L${b.x} ${b.y}" stroke="#7c93b3" stroke-width="2.5" stroke-dasharray="9 6"/>
    ${blots}${armies}${drop}</svg>`;
}
// a tap on the sheet, in sheet units (undoing the flip)
function fPoint(S, ev) {
  const svg = $("fsheet"), r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = ((ev.clientY - r.top) / r.height) * FH;
  return fSeat(S, PID) === 1 ? { x: 1 - x, y: FH - y } : { x, y };
}
const fName = (S, i) => esc(who(S.duo[i]).name);
const fHead = (S) => `<div class="row" style="justify-content:space-between"><span class="row" style="gap:6px;color:${PCOL[0]};font-weight:700">${face(who(S.duo[0]), 28)}${fName(S, 0)}${S.best === 3 ? ` ${AR(S.wins[0])}` : ""}</span><span class="row" style="gap:6px;color:${PCOL[1]};font-weight:700">${S.best === 3 ? `${AR(S.wins[1])} ` : ""}${fName(S, 1)}${face(who(S.duo[1]), 28)}</span></div>`;

function fvSetup(S, fresh) {
  const seat = fSeat(S, PID);
  if (fresh) { clearKL(); KL.my.draft = []; setTop(S.best === 3 ? `المباراة ${AR(S.match)}` : "رتّب جنودك"); }
  const mineReady = seat >= 0 && S.ready[seat];
  if (seat < 0 || mineReady) {
    show(`${fHead(S)}<div class="paper" style="text-align:center;display:grid;gap:8px"><h2 style="font-size:26px">${seat < 0 ? "اللاعبين يرتبون جنودهم…" : "جنودك جاهزين"}</h2><p class="pmuted">${[0, 1].map((i) => `${fName(S, i)}: ${S.ready[i] ? "جاهز" : "يرتّب…"}`).join(" · ")}</p></div>`);
    return;
  }
  const draw = () => {
    const d = KL.my.draft;
    show(`${fHead(S)}
      <p class="muted" style="text-align:center">اضغط في نصفك (تحت) تحط ${AR(S.n)} جنود، واضغط على جندي تشيله. خصمك ما يشوفهم.</p>
      ${fSheet(S, { draft: d })}
      <div class="row"><button type="button" class="btn btn-ghost" id="fRand" style="flex:1">وزّعهم عشوائي</button><button type="button" class="btn btn-marker" id="fReady" style="flex:1.3" ${d.length === S.n ? "" : "disabled"}>${d.length === S.n ? "جاهز" : `باقي ${AR(S.n - d.length)}`}</button></div>`);
    $("fsheet").onpointerdown = (ev) => {
      const p = fPoint(S, ev), k = d.findIndex((s) => fDist(s, p) < FSR * 1.3);
      if (k >= 0) { d.splice(k, 1); beep(420, 0.04); }
      else if (d.length < S.n && fOkSpot(p, seat, d)) { d.push(p); beep(700, 0.04); }
      else { beep(200, 0.06, "square", 0.05); return; }
      draw();
    };
    $("fRand").onclick = () => { KL.my.draft = fRandom(seat, S.n); beep(600, 0.05); draw(); };
    $("fReady").onclick = () => { act({ t: "fplace", id: PID, pts: KL.my.draft }); beep(880, 0.08); };
  };
  draw();
}
function fvSheet(S, fresh) {
  const seat = fSeat(S, PID), mine = S.phase === "aim" && seat === S.turn;
  if (fresh) { clearKL(); KL.my.drop = null; }
  setTop(seat < 0 ? "تتفرج" : mine ? "دورك" : S.phase === "aim" ? "دور خصمك" : "");
  const l = S.last, shot = S.phase === "shot" && l && !l.skipped;
  const said = shot ? { hit: "صبت! جندي انشطب", near: "قريبة!", miss: "طاشت", off: "طلعت برا الورقة" }[l.res] : "";
  const turnName = fName(S, S.turn);
  show(`${fHead(S)}
    <div class="k-turn" style="background:${PCOL[S.phase === "shot" && l ? l.by : S.turn]}1f;color:${PCOL[S.phase === "shot" && l ? l.by : S.turn]};font-weight:700;text-align:center;border-radius:12px;padding:6px" id="fMsg">${shot ? `${fName(S, l.by)}: ${said}` : mine ? "حط نقطة حبر في نصفك" : `${turnName} يصوّب…`}</div>
    ${fSheet(S, { drop: KL.my.drop && mine ? KL.my.drop : null })}
    ${mine ? `<div class="timer"><i id="fbar"></i></div><button type="button" class="btn btn-marker" id="fGo" ${KL.my.drop ? "" : "disabled"}>اطوِها!</button>` : `<p class="muted" style="text-align:center">${S.phase === "aim" ? "خط الطي يتحرك كل دور." : ""}</p>`}`);
  if (shot && fresh) { l.res === "hit" ? (beep(990, 0.15, "triangle", 0.15), buzz(90)) : beep(260, 0.2, "sawtooth", 0.06); }
  if (fresh && mine) { beep(700, 0.06); buzz(30); }
  if (!mine) return;
  $("fsheet").onpointerdown = (ev) => {
    const p = fPoint(S, ev);
    if (!fOwn(foldGeo(S.fold), p, seat)) { beep(200, 0.06, "square", 0.05); return; }
    KL.my.drop = p; beep(600, 0.04); fvSheet(KL.S, false);
  };
  $("fGo").onclick = () => { if (!KL.my.drop) return; const g = $("fGo"); if (g) g.disabled = true; act({ t: "fdrop", id: PID, x: KL.my.drop.x, y: KL.my.drop.y }); beep(520, 0.08); };
  if (fresh) klEvery(() => { const s = KL.S; if (!s || s.phase !== "aim") return; const b = $("fbar"); if (b) b.style.transform = `scaleX(${leftOf(s.left) / FTURN})`; }, 200);
}
function fvOver(S, fresh) {
  if (!fresh) return;
  clearKL(); setTop(S.over ? "انتهت" : `بعد المباراة ${AR(S.match)}`);
  const seat = fSeat(S, PID), w = S.over && S.best === 3 ? (S.wins[0] > S.wins[1] ? 0 : 1) : S.winner;
  if (seat === w) { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 120); setTimeout(() => beep(784, 0.25), 240); } else beep(262, 0.4, "triangle", 0.12);
  const hits = (i) => S.shots.filter((s) => s.by === i && s.res === "hit").length, folds = (i) => S.shots.filter((s) => s.by === i).length;
  show(`${fHead(S)}
    <div class="paper" style="text-align:center;display:grid;gap:6px;justify-items:center">
      ${face(who(S.duo[w]), 70)}
      <h2 style="font-size:28px;color:${PCOL[w]}">${seat === w ? "فزت!" : `فاز ${fName(S, w)}!`}</h2>
      <p class="pmuted">${[0, 1].map((i) => `${fName(S, i)}: ${AR(hits(i))} صابت من ${AR(folds(i))} طيّات`).join(" · ")}</p>
    </div>
    ${fSheet(S)}
    ${isHost() ? (S.over ? '<button type="button" class="btn btn-marker" id="fAgain">جلسة جديدة</button>' : `<button type="button" class="btn btn-marker" id="fNext">المباراة ${AR(S.match + 1)}</button>`) : '<p class="muted" style="text-align:center">بانتظار المضيف…</p>'}
    <button type="button" class="btn btn-ghost" id="fHome">رجوع لفسحة</button>`);
  if (isHost()) { if (S.over) $("fAgain").onclick = () => hostAgain(); else $("fNext").onclick = () => fSetup(); }
  $("fHome").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
}
