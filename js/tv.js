"use strict";
// ================= شاشة العرض: a TV, a projector or an iPad that shows the room to everyone =================
// It joins the room like a phone but never as a player: it only listens to the host's snapshots, so it
// can't see anything a player's phone can't (every secret stays with the host in H).
// Everything is laid out on a 1600×900 stage that is zoomed to fill whatever screen it's on.
// Each game adds `tv: { phase: (S, fresh) => html }` (or `{ html, after }` when it has to touch the drawn page);
// a phase without one gets a plain card.
const TVW = 1600, TVH = 900;
const isScreen = () => KL.role === "screen";
const tvUrl = (code) => `${joinUrl(code)}&tv=1`;

function tvFit() { document.documentElement.style.setProperty("--tvz", Math.min(innerWidth / TVW, innerHeight / TVH)); }
tvFit();
addEventListener("resize", tvFit);

function openScreen(code) {
  code = cleanCode(code);
  if (code.length !== 4) return;
  current = "khallast";
  view("tv");
  screenRoom(code);
}
function screenRoom(code) {
  leaveRoom(false);
  Object.assign(KL, { role: "screen", code, my: {} });
  tvMsg(`نتصل بالغرفة ${esc(code)}…`, "ثواني بس.");
  KL.net = openRoom(code, (m) => { if (m && m.t === "state") apply(m.s); }, (st) => {
    if (st === "SUBSCRIBED") KL.net.send({ t: "hello", id: PID });
    else if ((st === "CHANNEL_ERROR" || st === "TIMED_OUT") && !KL.S) tvMsg("ما قدرنا نتصل", "تأكد إن النت شغال وجرّب مرة ثانية.", true);
  });
  klEvery(() => { if (!KL.S && KL.net) KL.net.send({ t: "hello", id: PID }); }, 1500);
  klLater(() => { if (!KL.S) tvMsg(`ما لقينا الغرفة ${esc(code)}`, "تأكد من الرمز، وإن المضيف فاتح الغرفة.", true); }, 8000);
  KL.alive = setInterval(() => { if (KL.S && KL.net && now() - KL.gotAt > 15000) KL.net.send({ t: "hello", id: PID }); }, 5000);
  keepAwake(true);
}
function tvMsg(title, sub, retry) {
  $("tv").innerHTML = `<div class="tv-stage"><div class="tv-msg"><div class="tv-bell">${BELL}</div><h1>${title}</h1><p>${sub}</p>
    ${retry ? `<div class="tv-row"><button type="button" class="tv-btn" id="tvRetry">جرّب مرة ثانية</button><button type="button" class="tv-btn ghost" id="tvHome">رجوع</button></div>` : ""}</div></div>`;
  if (retry) { $("tvRetry").onclick = () => screenRoom(KL.code); $("tvHome").onclick = tvLeave; }
}
function tvLeave() { leaveRoom(false); renderHub(); view("hub"); }

// ---------------- every snapshot ----------------
function renderTV(S, fresh) {
  const g = ROOM_GAMES[S.game];
  if (S.phase === "closed") return tvMsg("المضيف قفل الغرفة", "شكراً على اللعب!", false);
  // a game drawing on a canvas (اطوِها!) keeps its page until the view itself changes
  if (!fresh && g.tvKeep && S.phase !== "lobby" && $("tv").dataset.view === KL.view) return;
  $("tv").dataset.view = KL.view;
  const f = S.phase === "lobby" ? tvLobby : (g.tv && g.tv[S.phase]) || tvPlain;
  let body = "", after = null;
  try { body = f(S, fresh); } catch (e) { body = tvPlain(S); }
  if (body && typeof body === "object") ({ html: body, after } = body);
  const lobby = S.phase === "lobby";
  $("tv").innerHTML = `<div class="tv-stage">
    <header class="tv-top"><div class="tv-brand">${BELL}<b>فسحة</b><span>${g.name}</span></div>
      ${lobby ? "" : `<div class="tv-join"><span>تبون تدخلون؟<br>صوّروا الباركود أو اكتبوا الرمز</span><b dir="ltr">${esc(S.code)}</b><div class="tv-qr">${qrSvg(joinUrl(S.code))}</div></div>`}
      <button type="button" class="tv-x" id="tvMenu" aria-label="خيارات">⋯</button></header>
    <main class="tv-body ${fresh ? "in" : ""}">${body}</main></div>`;
  $("tvMenu").onclick = tvMenu;
  if (after) try { after(); } catch (e) {}
  tvTick();
}
function tvMenu() {
  $("modalCard").innerHTML = `<h3>شاشة العرض</h3><p>هذي الشاشة تعرض اللعبة للكل، واللاعبين يجاوبون من جوالاتهم.</p>
    <button type="button" class="pbtn" id="tvFull">ملء الشاشة</button><button type="button" class="pbtn alt" id="tvOut">اطلع من الغرفة</button><button type="button" class="pbtn alt" id="tvBack">رجوع</button>`;
  $("modal").hidden = false;
  $("tvFull").onclick = () => { $("modal").hidden = true; const el = document.documentElement; try { el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen && el.webkitRequestFullscreen(); } catch (e) {} };
  $("tvOut").onclick = () => { $("modal").hidden = true; tvLeave(); };
  $("tvBack").onclick = () => ($("modal").hidden = true);
}

// ---------------- pieces the games share ----------------
// a bar and a number that count down on their own between snapshots (left = ms at the snapshot, T = full time)
const tvBar = (left, T) => `<div class="tv-bar"><i data-end="${KL.gotAt + left}" data-t="${T}"></i></div>`;
const tvSecs = (left) => `<b class="tv-secs" data-end="${KL.gotAt + left}">${AR(Math.ceil(left / 1000))}</b>`;
const tvMMSS = (ms) => { const s = Math.ceil(ms / 1000); return `${AR(Math.floor(s / 60))}:${AR(String(s % 60).padStart(2, "0"))}`; };
const tvClock = (left) => `<b class="tv-clock" data-end="${KL.gotAt + left}" data-fmt="mmss">${tvMMSS(left)}</b>`;
function tvTick() {
  clearInterval(KL.tvT);
  const go = () => {
    document.querySelectorAll("#tv [data-end]").forEach((el) => {
      const left = Math.max(0, +el.dataset.end - now());
      if (el.dataset.t) el.style.transform = `scaleX(${left / +el.dataset.t})`;
      else el.textContent = el.dataset.fmt === "mmss" ? tvMMSS(left) : AR(Math.ceil(left / 1000));
    });
  };
  go();
  if (document.querySelector("#tv [data-end]")) KL.tvT = setInterval(go, 200);
}
// who's in: faces with names, in a team's colour when the game has teams
const tvFaces = (ps, size = 64) => `<div class="tv-faces">${ps.map((p) => `<span class="tv-p">${face(p, size)}<small>${esc(p.name)}</small></span>`).join("") || '<span class="tv-dim">…</span>'}</div>`;
// a game with teams gives `tvTeams(S) => [{ n, c, ps }]`
const tvTeams = (list) => `<div class="tv-teams">${list.map((x) => `<div class="tv-team" style="--c:${x.c}"><h3>${x.n}</h3>${tvFaces(x.ps, 52)}</div>`).join("")}</div>`;

// «وينكم!» on the big screen: the QR and the code, who's in, and how the game goes
function tvLobby(S) {
  const g = ROOM_GAMES[S.game];
  return `<div class="tv-lobby">
    <section class="tv-door"><h1>وينكم!</h1><div class="tv-bigqr">${qrSvg(joinUrl(S.code))}</div>
      <p>صوّروا الباركود بكاميرا الجوال<br>أو ادخلوا فسحة واكتبوا الرمز</p><div class="tv-code" dir="ltr">${esc(S.code)}</div></section>
    <section class="tv-side"><h2>${g.name}</h2><ol class="tv-rules">${g.rules.slice(0, 5).map((r) => `<li>${r}</li>`).join("")}</ol>
      <h3>اللاعبين (${AR(S.players.length)})</h3>${g.tvTeams ? tvTeams(g.tvTeams(S)) : tvFaces(S.players)}</section></div>`;
}
// a phase no game has drawn for the TV yet: the game's name, and everyone in the room
function tvPlain(S) {
  const g = ROOM_GAMES[S.game];
  return `<div class="tv-plain"><h1>${g.name}</h1><p>اللعبة شغالة على الجوالات…</p>${tvFaces(S.players)}</div>`;
}
