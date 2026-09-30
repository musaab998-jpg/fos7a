"use strict";
// ================= opening games, joining rooms =================
// Every game opens a room on this phone; the others join it by QR code or by typing the code.
function openGame(id) {
  current = id; clearTimers();
  $("gTitle").textContent = ROOM_GAMES[id].name; $("roomCode").textContent = "";
  view("game");
  const go = () => hostRoom(id);
  if (!me.name) return openProfile(() => { current = id; view("game"); go(); });
  go();
}
// A player arriving by QR code or typing the room code.
function openJoin(code) {
  code = cleanCode(code);
  if (code.length !== 4) return;
  current = "khallast";
  $("gTitle").textContent = "فسحة"; $("roomCode").textContent = code;
  view("game");
  const go = () => joinRoom(code);
  if (!me.name) return openProfile(() => { current = "khallast"; view("game"); go(); });
  go();
}
$("quit").onclick = () => {
  if (isHost() && KL.S && KL.S.players.length > 1 && !confirm("تقفل الغرفة على الكل؟")) return;
  clearTimers(); leaveRoom(); renderHub(); view("hub");
};
addEventListener("pagehide", () => { if (KL.net && !isHost()) KL.net.send({ t: "bye", id: PID }); });

// the Android app sends its back button here: leave the game first, then let the app close
window.fos7aBack = () => {
  if (!$("modal").hidden) { $("modal").hidden = true; return true; }
  if (!$("game").hidden || !$("profile").hidden) { $("quit").click(); return true; }
  return false;
};

document.querySelectorAll(".gtop [data-sound]").forEach((b) => (b.onclick = () => setSound(!soundOn)));
setSound(soundOn);
renderHub(); view("hub");
const startCode = cleanCode(new URLSearchParams(location.search).get("r"));
if (startCode.length === 4) openJoin(startCode);
