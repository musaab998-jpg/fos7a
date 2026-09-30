"use strict";
// ================= opening games, joining rooms =================
const TITLES = { khallast: "خلّصت!", khat: "خط ثلاثة" };

// «ابدأ اللعب» on خلّصت! opens a room on this phone; خط ثلاثة is still the practice version with pretend players.
function openGame(id) {
  current = id; clearTimers(); if (typeof kClear === "function") kClear();
  $("gTitle").textContent = TITLES[id]; $("roomCode").textContent = "";
  view("game");
  const go = () => { if (id === "khallast") hostRoom(); else kLobby(); };
  if (!me.name) return openProfile(() => { current = id; view("game"); go(); });
  go();
}

// A player arriving by QR code or typing the room code.
function openJoin(code) {
  code = cleanCode(code);
  if (code.length !== 4) return;
  current = "khallast";
  $("gTitle").textContent = TITLES.khallast; $("roomCode").textContent = code;
  view("game");
  const go = () => joinRoom(code);
  if (!me.name) return openProfile(() => { current = "khallast"; view("game"); go(); });
  go();
}

$("quit").onclick = () => { clearTimers(); if (typeof kClear === "function") kClear(); leaveRoom(); renderHub(); view("hub"); };
addEventListener("pagehide", () => { if (KL.net && !isHost()) KL.net.send({ t: "bye", id: PID }); });

// the Android app sends its back button here: leave the game first, then let the app close
window.fos7aBack = () => {
  if (!$("modal").hidden) { $("modal").hidden = true; return true; }
  if (!$("game").hidden || !$("profile").hidden) { $("quit").click(); return true; }
  return false;
};

renderHub(); view("hub");
const startCode = cleanCode(new URLSearchParams(location.search).get("r"));
if (startCode.length === 4) openJoin(startCode);
