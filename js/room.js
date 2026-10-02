"use strict";
// ================= rooms: one phone hosts, everyone else joins from any browser =================
// The host keeps the whole game and sends everyone a snapshot whenever something changes.
// Players only send what they did. One room can play every game: the host picks it in «وينكم!».

const MAX_PLAYERS = 30;
const ROOM_GAMES = {}; // each game file adds itself: khallast, khat, foldit

const KL = { role: null, code: "", net: null, S: null, gotAt: 0, view: "", my: {} };
const H = {};

const now = () => Date.now();
const who = (id) => (KL.S ? KL.S.players.find((p) => p.id === id) : null) || { name: "؟", av: me.av };
const isHost = () => KL.role === "host";
// what this phone did: the host handles it on the spot, everyone else sends it over
const act = (m) => (isHost() ? hostOn(m, true) : KL.net && KL.net.send(m));
const leftOf = (ms) => Math.max(0, ms - (now() - KL.gotAt)); // counts down locally from the host's snapshot
const clearKL = () => { (KL.timers || []).forEach((t) => { clearTimeout(t); clearInterval(t); }); KL.timers = []; };
const klLater = (fn, ms) => (KL.timers ||= []).push(setTimeout(fn, ms));
const klEvery = (fn, ms) => (KL.timers ||= []).push(setInterval(fn, ms));
const hClear = () => { (H.timers || []).forEach((t) => { clearTimeout(t); clearInterval(t); }); H.timers = []; };
const hLater = (fn, ms) => (H.timers ||= []).push(setTimeout(fn, ms));
const hEvery = (fn, ms) => (H.timers ||= []).push(setInterval(fn, ms));
const face = (p, s) => avatar(p.av || me.av, s);
const hostOnly = (html, wait = "بانتظار المضيف…") => (isHost() ? html : `<p class="muted" style="text-align:center">${wait}</p>`);
const shuffled = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
const THEME_COLOR = { khallast: "#fbf8ef", khat: "#22402f", fold: "#151c2d", trabee: "#e6e0d4", alqab: "#fffdf6", hisn: "#fbfdff" };

function leaveRoom(tell = true) {
  clearKL(); hClear(); clearInterval(KL.alive); yardQuiet(0.5); KL.rang = false; keepAwake(false); hostBanner(false);
  if (tell && isHost()) forgetRoom(); // closed on purpose: nothing to come back to
  if (KL.net) {
    if (tell) isHost() ? KL.net.send({ t: "state", s: { phase: "closed" } }) : KL.net.send({ t: "bye", id: PID });
    const n = KL.net; setTimeout(() => n.close(), 300);
  }
  Object.assign(KL, { role: null, code: "", net: null, S: null, view: "", my: {}, fv: null });
}

// ---------------- keeping the room alive ----------------
// The screen stays on while you're in a room, so the host's phone doesn't sleep and freeze the game.
let wakeLock = null;
async function keepAwake(on) {
  try {
    if (!on) { if (wakeLock) await wakeLock.release(); wakeLock = null; return; }
    if ("wakeLock" in navigator && !wakeLock && document.visibilityState === "visible") { wakeLock = await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release", () => (wakeLock = null)); }
  } catch (e) {}
}
// The host's game is saved on the phone after every change, so if the page is closed or the phone
// restarts, the host can open فسحة again and bring the same room back, with everyone still in it.
const ROOM_KEY = "fos7a.room.v1", ROOM_KEEP = 45 * 60 * 1000;
function saveRoom() {
  try {
    const keep = {};
    for (const [k, v] of Object.entries(H)) if (!["timers", "soon", "lastHello"].includes(k)) keep[k] = v instanceof Set ? { __set: [...v] } : v;
    localStorage.setItem(ROOM_KEY, JSON.stringify({ at: now(), code: KL.code, H: keep }));
  } catch (e) {}
}
function savedRoom() {
  try { const r = JSON.parse(localStorage.getItem(ROOM_KEY) || "null"); return r && now() - r.at < ROOM_KEEP && r.H && r.H.S ? r : null; } catch (e) { return null; }
}
function forgetRoom() { try { localStorage.removeItem(ROOM_KEY); } catch (e) {} }
function resumeRoom() {
  const r = savedRoom(); if (!r) return;
  leaveRoom(false);
  Object.assign(KL, { role: "host", code: r.code, my: {} });
  for (const k of Object.keys(H)) delete H[k];
  for (const [k, v] of Object.entries(r.H)) H[k] = v && v.__set ? new Set(v.__set) : v;
  H.timers = [];
  current = H.S.game; view("game");
  setTop("");
  show(`<div class="paper"><h2 style="font-size:26px">نرجّع الغرفة ${esc(r.code)}…</h2></div>`);
  KL.net = openRoom(r.code, (m) => hostOn(m, false), (st) => {
    if (st === "SUBSCRIBED" && !KL.resumed) { KL.resumed = true; ROOM_GAMES[H.S.game].resume?.(H.S); hostSend(); }
    else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT") offline();
  });
  KL.resumed = false;
  keepAwake(true);
}
// players: a note on top when the host has gone quiet, so nobody thinks the game is broken
function hostBanner(on) {
  let el = $("hostGone");
  if (!on) { if (el) el.remove(); return; }
  if (el) return;
  el = document.createElement("div"); el.id = "hostGone"; el.className = "hostgone";
  el.textContent = "المضيف انقطع… ننتظره يرجع";
  document.querySelector(".gshell")?.prepend(el);
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible" || !KL.role) return;
  keepAwake(true);
  if (isHost()) hostSend(); // catch everyone up after the phone was in the background
  else if (KL.net) KL.net.send({ t: "hello", id: PID });
});

// ---------------- hosting ----------------
function hostRoom(game) {
  leaveRoom(false);
  const code = newRoomCode();
  Object.assign(KL, { role: "host", code, my: {} });
  for (const k of Object.keys(H)) delete H[k];
  Object.assign(H, { players: [{ id: PID, name: me.name, av: { ...me.av }, host: true }], timers: [], S: { code, players: [], seq: 0 } });
  roomGame(game);
  setTop("");
  show(`<div class="paper"><h2 style="font-size:26px">نجهّز الغرفة…</h2></div>`);
  KL.net = openRoom(code, (m) => hostOn(m, false), (st) => { if (st === "SUBSCRIBED") hostSend(); else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT") offline(); });
  klLater(() => { if (!KL.S) hostSend(); }, 2500);
  keepAwake(true);
}
// the host switches the room to a game (or back to its «وينكم!») and keeps everyone in it
function roomGame(game) {
  hClear();
  const S = H.S;
  for (const k of Object.keys(S)) if (!["code", "players", "seq"].includes(k)) delete S[k];
  Object.assign(S, { game, phase: "lobby", round: 0 });
  ROOM_GAMES[game].setup(S);
}
function offline() {
  if (KL.S) return;
  show(`<div class="paper" style="display:grid;gap:10px"><h2 style="font-size:26px">ما قدرنا نتصل</h2><p class="pmuted">تأكد إن النت شغال وجرّب مرة ثانية.</p></div><button type="button" class="btn btn-marker" id="retry">جرّب مرة ثانية</button>`);
  $("retry").onclick = () => (isHost() ? hostRoom(current || "khallast") : joinRoom(KL.code));
}
function hostSend() {
  const S = H.S;
  clearTimeout(H.soon); H.soon = 0;
  S.players = H.players.map((p) => ({ id: p.id, name: p.name, av: p.av, host: !!p.host }));
  const g = ROOM_GAMES[S.game];
  if (g.snap) g.snap(S);
  S.seq++;
  const snap = JSON.parse(JSON.stringify(S));
  if (KL.net) KL.net.send({ t: "state", s: snap });
  H.lastSend = now();
  saveRoom();
  apply(snap);
}
// many small changes at once (joins, votes) go out as one snapshot
function hostSendSoon() { if (H.soon) return; H.soon = setTimeout(() => { H.soon = 0; if (KL.role === "host") hostSend(); }, 350); }
// `local` is true only for what this phone did itself; the network can never trigger host-only moves
function hostOn(m, local) {
  const S = H.S;
  if (!m || !m.t) return;
  switch (m.t) {
    case "join": {
      if (!m.p || !m.p.id) return;
      const p = H.players.find((x) => x.id === m.p.id), name = cleanName(String(m.p.name || "؟").slice(0, 12), p ? H.players.indexOf(p) + 1 : H.players.length + 1);
      if (p) Object.assign(p, { name, av: m.p.av, away: false });
      else if (H.players.length < MAX_PLAYERS) { H.players.push({ id: m.p.id, name, av: m.p.av }); beep(620, 0.06); ROOM_GAMES[S.game].joined?.(m.p.id); }
      return hostSendSoon();
    }
    case "hello": return now() - (H.lastSend || 0) > 4000 && hostSendSoon(); // one catch-up for everyone, not one per phone
    case "bye":
      if (S.phase === "lobby" && m.id !== PID) { H.players = H.players.filter((p) => p.id !== m.id); ROOM_GAMES[S.game].left?.(m.id); }
      return hostSend();
    default: ROOM_GAMES[S.game].on(m, local);
  }
}
function hostAgain() { roomGame(H.S.game); hostSend(); }

// ---------------- joining ----------------
function joinRoom(code) {
  leaveRoom(false);
  Object.assign(KL, { role: "player", code, my: {} });
  setTop("");
  show(`<div class="paper" style="display:grid;gap:8px"><h2 style="font-size:26px">ندخل الغرفة ${esc(code)}…</h2><p class="pmuted">ثواني بس.</p></div>`);
  KL.net = openRoom(code, (m) => {
    if (!m) return;
    if (m.t === "state") apply(m.s);
    else if (m.to === PID && KL.S) ROOM_GAMES[KL.S.game]?.direct?.(m);
  }, (st) => {
    if (st === "SUBSCRIBED") { KL.net.send({ t: "join", p: { id: PID, name: me.name, av: me.av } }); KL.net.send({ t: "hello", id: PID }); }
    else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT") offline();
  });
  klLater(() => {
    if (KL.S) return;
    show(`<div class="paper" style="display:grid;gap:10px"><h2 style="font-size:26px">ما لقينا الغرفة ${esc(code)}</h2><p class="pmuted">تأكد من الرمز، وإن المضيف فاتح الغرفة ومتصل بالنت.</p></div><button type="button" class="btn btn-marker" id="retry">جرّب مرة ثانية</button><button type="button" class="btn btn-ghost" id="back">رجوع</button>`);
    $("retry").onclick = () => joinRoom(code);
    $("back").onclick = () => { leaveRoom(); renderHub(); view("hub"); };
  }, 8000);
  // players who were away catch up; if the host stays silent, say so
  KL.alive = setInterval(() => {
    if (!KL.S || !KL.net || document.visibilityState !== "visible") return;
    const quiet = now() - KL.gotAt;
    if (quiet > 15000) KL.net.send({ t: "hello", id: PID });
    hostBanner(quiet > 30000);
  }, 5000);
  keepAwake(true);
}

// ---------------- what every phone shows ----------------
function apply(S) {
  if (!S) return;
  if (S.phase === "closed") { KL.S = null; clearKL(); show(`<div class="paper" style="display:grid;gap:10px"><h2 style="font-size:26px">المضيف قفل الغرفة</h2><p class="pmuted">شكراً على اللعب!</p></div><button type="button" class="btn btn-marker" id="back">رجوع لفسحة</button>`); $("back").onclick = () => { leaveRoom(false); renderHub(); view("hub"); }; return; }
  if (KL.S && S.seq < KL.S.seq) return;
  const g = ROOM_GAMES[S.game];
  if (!g) return;
  const prev = KL.S;
  KL.S = S; KL.gotAt = now();
  if (!isHost()) hostBanner(false);
  $("roomCode").textContent = S.code || "";
  $("gTitle").textContent = g.name;
  current = S.game;
  const theme = S.phase === "lobby" ? "khallast" : g.theme;
  if (document.body.dataset.theme !== theme) { document.body.dataset.theme = theme; try { window.Fos7aApp?.setTheme(THEME_COLOR[theme]); } catch (e) {} }
  if (!isHost() && prev && !S.players.some((p) => p.id === PID)) KL.net.send({ t: "join", p: { id: PID, name: me.name, av: me.av } });
  const viewKey = S.game + ":" + (g.key ? g.key(S) : S.phase + ":" + S.round);
  if (viewKey !== KL.view) { KL.view = viewKey; renderPhase(S, true); yardMoment(S, prev); } else renderPhase(S, false);
}
// recess in «وينكم!», the bell when a game starts, and a cheer at the end
const END_PHASE = { khallast: "cert", khat: "end", foldit: "over", trabee: "end", alqab: "end", hisn: "end" };
function yardMoment(S, prev) {
  if (S.phase === "lobby") {
    if (!KL.rang) { KL.rang = true; recess(); setTimeout(() => { if (KL.S && KL.S.phase === "lobby") yardAmbient(); }, 3800); }
    else yardAmbient();
  } else if (prev && prev.phase === "lobby") classStarts();
  else if (S.phase === END_PHASE[S.game] && (!("over" in S) || S.over)) { yardCheer(); if (isHost()) markPlayed(S.game); }
}
function renderPhase(S, fresh) {
  if (S.phase === "lobby") return vLobby(S, fresh);
  const f = ROOM_GAMES[S.game].views[S.phase];
  if (f) f(S, fresh);
}

// «وينكم!»: the code and QR, who's in, which game, and the game's own settings
function vLobby(S, fresh) {
  const g = ROOM_GAMES[S.game];
  setTop("الغرفة");
  const y = screen.scrollTop;
  const url = joinUrl(S.code);
  const n = S.players.length, enough = n >= g.min;
  show(`
    <div class="paper" style="display:grid;gap:10px;justify-items:center;text-align:center">
      <h2 style="font-size:30px">وينكم!</h2>
      ${isHost() ? `<div class="qr" style="width:180px;max-width:70%;background:#fff;border-radius:12px;padding:6px">${qrSvg(url)}</div><p class="pmuted">صوّروا الباركود بكاميرا الجوال، أو ادخلوا فسحة واكتبوا الرمز</p>` : `<p class="pmuted">دخلت! انتظر المضيف يبدأ.</p>`}
      <div style="font-family:var(--f-display);font-size:44px;letter-spacing:.18em;color:var(--ink-red);direction:ltr;line-height:1">${esc(S.code)}</div>
      ${isHost() ? `<button type="button" class="btn btn-ghost" id="shareLink" style="width:auto;padding:6px 16px;font-size:14px">أرسل الرابط</button>` : ""}
    </div>
    ${isHost() ? `<p class="muted" style="font-weight:700;color:var(--soft)">وش نلعب؟</p>
      <div class="modes gamepick">${Object.entries(ROOM_GAMES).map(([id, x]) => `<button type="button" class="mode" data-game="${id}" aria-pressed="${S.game === id}"><b>${x.name}</b><small>${canHost(id) ? x.who : "خلصت جلستها المجانية"}</small></button>`).join("")}</div>`
      : `<div class="paper" style="padding-block:12px"><h3 style="font-size:24px">${g.name}</h3><ol class="rules">${g.rules.map((r) => `<li>${r}</li>`).join("")}</ol></div>`}
    ${g.lobbyPlayers ? g.lobbyPlayers(S) : `<p class="muted" style="font-weight:700;color:var(--soft)">اللاعبين (${AR(n)})</p><div class="players">${S.players.map(plCard).join("")}</div>`}
    ${isHost() ? `${g.lobby ? g.lobby(S) : ""}
      <button type="button" class="btn btn-marker" id="start" ${enough ? "" : "disabled"}>${enough ? `ابدأ ${g.name}` : g.need}</button>` : ""}`);
  screen.scrollTop = fresh ? 0 : y;
  if (!isHost()) return;
  $("shareLink").onclick = async () => { const text = `تعال العب معنا في فسحة، ادخل الغرفة ${S.code}: ${url}`; try { if (window.Fos7aApp) window.Fos7aApp.share(text); else if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); $("shareLink").textContent = "انسخ الرابط"; } } catch (e) {} };
  screen.querySelectorAll("[data-game]").forEach((b) => (b.onclick = () => { if (b.dataset.game === S.game) return; beep(700, 0.04); roomGame(b.dataset.game); hostSend(); }));
  if (g.bindLobby) g.bindLobby(S);
  $("start").onclick = () => { if (!canHost(S.game)) return openPass(S.game, () => g.start()); beep(880, 0.08); g.start(); };
}
const plCard = (p) => `<div class="pl ${p.id === PID ? "me" : ""}">${face(p, 36)}<div class="grow"><div class="name">${esc(p.name)}</div><div class="tag">${p.host ? "المضيف" : p.id === PID ? "أنت" : "جاهز"}</div></div></div>`;
