"use strict";
// ================= one free session of every game, then a code =================
// Only the host is ever asked: joining a room is always free. The free sessions are counted on this
// phone; codes are checked by the server (Supabase functions fos7a_*), which counts how many phones used each.
const TRIAL_KEY = "fos7a.trial.v1", PASS_KEY = "fos7a.pass.v1", INSTA = "musaab998";
const readJSON = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const passUntil = () => { const p = readJSON(PASS_KEY); return p && p.until ? Date.parse(p.until) || 0 : 0; };
const passActive = () => passUntil() > Date.now();
const trialUsed = (game) => !!(readJSON(TRIAL_KEY) || {})[game];
const canHost = (game) => passActive() || !trialUsed(game);
// a session counts once it reaches its final results, so a dropped connection doesn't use it up
function markPlayed(game) { if (passActive()) return; const t = readJSON(TRIAL_KEY) || {}; if (!t[game]) { t[game] = Date.now(); writeJSON(TRIAL_KEY, t); } }

function sb() {
  if (typeof supabase === "undefined") return null;
  return (sbClient ||= supabase.createClient(NET.url, NET.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, realtime: { params: { eventsPerSecond: 20 } } }));
}
async function redeemCode(code) {
  const c = sb(); if (!c) return { ok: false, why: "net" };
  try {
    const { data, error } = await c.rpc("fos7a_redeem", { p_code: code, p_device: PID });
    if (error || !data) return { ok: false, why: "net" };
    if (data.ok) writeJSON(PASS_KEY, { until: data.until, code: String(code).toUpperCase() });
    return data;
  } catch (e) { return { ok: false, why: "net" }; }
}
const passDate = () => new Date(passUntil()).toLocaleString("ar-SA-u-nu-arab", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });

// the card that shows up instead of starting a game whose free session is used
function openPass(game, then) {
  const g = game && ROOM_GAMES[game];
  const card = $("modalCard");
  const draw = (msg = "") => {
    card.innerHTML = `
      <h3>${passActive() ? "تذكرتك فعالة" : g ? `خلصت جلستك المجانية في «${g.name}»` : "عندك كود؟"}</h3>
      ${passActive() ? `<p>كل الألعاب مفتوحة لين ${passDate()}.</p>` : `<p>كل لعبة لها جلسة مجانية وحدة. بعدها تفتح كل الألعاب بكود، وتقدر تاخذ واحد من حسابنا في انستقرام. واللي يدخلون غرفتك يلعبون مجاناً دائماً.</p>
      <form class="joinbox passbox" id="passForm"><input id="passCode" maxlength="12" placeholder="الكود" aria-label="الكود" autocomplete="off" autocapitalize="characters" dir="ltr"><button type="submit" class="hbtn">فعّل</button></form>
      <p class="passmsg" id="passMsg" role="status">${msg}</p>
      <a class="pbtn insta" href="https://instagram.com/${INSTA}" target="_blank" rel="noopener">تواصل معنا في انستقرام @${INSTA}</a>`}
      <button type="button" class="pbtn alt" id="passClose">${passActive() && then ? "يلا نلعب" : "رجوع"}</button>`;
    $("modal").hidden = false;
    $("passClose").onclick = () => { $("modal").hidden = true; if (passActive() && then) then(); };
    const f = $("passForm");
    if (f) f.onsubmit = async (e) => {
      e.preventDefault();
      const code = $("passCode").value.trim(); if (!code) return;
      f.querySelector("button").disabled = true; $("passMsg").textContent = "نتأكد…";
      const r = await redeemCode(code);
      if (r.ok) { beep(784, 0.1); setTimeout(() => beep(1047, 0.18), 110); draw(); if (typeof renderHub === "function" && !$("hub").hidden) renderHub(); return; }
      beep(200, 0.25, "sawtooth", 0.06);
      draw({ bad: "الكود غلط، تأكد منه.", used: "هذا الكود انستخدم على عدد الجوالات المسموح له.", expired: "هذا الكود انتهت مدته.", net: "ما قدرنا نتأكد، تأكد من النت وجرّب." }[r.why] || "ما ضبط، جرّب مرة ثانية.");
    };
  };
  draw();
}
