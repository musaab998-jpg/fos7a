"use strict";
// ================= talking to the other phones =================
// Every room is one Supabase Realtime broadcast channel: nothing is stored, messages only pass through.
// ?local=1 swaps it for a BroadcastChannel between tabs of one browser, for trying things out offline.
const NET = {
  url: "https://vgumebaadauvgfuepfyp.supabase.co",
  key: "sb_publishable_QKX3qRkeJM3DwXlBcDjRMQ_yLuSQ4vq",
  local: new URLSearchParams(location.search).has("local"),
};

// This phone's id in rooms, kept so a player who reloads the page comes back as themselves.
const PID = (() => {
  const k = "fos7a.pid.v1";
  try { const v = localStorage.getItem(k); if (v) return v; } catch (e) {}
  const v = "p" + Math.random().toString(36).slice(2, 10);
  try { localStorage.setItem(k, v); } catch (e) {}
  return v;
})();

let sbClient = null;
function openRoom(code, onMsg, onStatus) {
  if (NET.local || typeof supabase === "undefined") {
    const bc = new BroadcastChannel("fos7a-" + code);
    bc.onmessage = (e) => onMsg(e.data);
    setTimeout(() => onStatus("SUBSCRIBED"), 50);
    return { send: (m) => bc.postMessage(m), close: () => bc.close() };
  }
  sbClient ||= supabase.createClient(NET.url, NET.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    realtime: { params: { eventsPerSecond: 20 } },
  });
  const ch = sbClient.channel("fos7a:" + code, { config: { broadcast: { self: false } } });
  ch.on("broadcast", { event: "m" }, ({ payload }) => onMsg(payload));
  ch.subscribe((status) => onStatus(status));
  return {
    send: (m) => ch.send({ type: "broadcast", event: "m", payload: m }).catch(() => {}),
    close: () => { try { sbClient.removeChannel(ch); } catch (e) {} },
  };
}

const ROOM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newRoomCode = () => Array.from({ length: 4 }, () => ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)]).join("");
const cleanCode = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
const joinUrl = (code) => `${PUBLIC_URL}?r=${code}`;

// A QR code as inline SVG (qrcode-generator, bundled in vendor/).
function qrSvg(text) {
  try { const q = qrcode(0, "M"); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { return ""; }
}
