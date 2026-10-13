"use strict";
// ================= hosts sign in once; one free session of every game, then a code =================
// Only the host is ever asked: joining a room needs no account. The free sessions and passes live on the
// server (Supabase functions fos7a_*) against the host's Google account, so clearing the browser doesn't reset them.
// ?local=1 (two tabs, no network) keeps everything on this phone instead, for trying things out.
const AUTH_KEY = "fos7a.auth.v1", ME_KEY = "fos7a.me.v1", AFTER_KEY = "fos7a.after.v1", INSTA = "fos7a.games";
const readJSON = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
let authC = null, USER = null;
let ME = readJSON(ME_KEY) || { played: [], until: null, admin: false }; // the last thing the server said, so a flaky connection doesn't lock anyone out

function authClient() {
  if (typeof supabase === "undefined") return null;
  return (authC ||= supabase.createClient(NET.url, NET.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce", storageKey: AUTH_KEY } }));
}
const signedIn = () => NET.local || !!USER;
const passUntil = () => (ME.until ? Date.parse(ME.until) || 0 : 0);
const passActive = () => passUntil() > Date.now();
const trialUsed = (game) => (ME.played || []).includes(game);
const canHost = (game) => signedIn() && (passActive() || !trialUsed(game));
const saveMe = () => writeJSON(ME_KEY, ME);

async function refreshMe() {
  if (NET.local || !USER) return;
  try {
    const { data, error } = await authClient().rpc("fos7a_me");
    if (!error && data) { ME = { ...data, uid: USER.id }; saveMe(); }
  } catch (e) {}
}
// a session counts once it reaches its final results, so a dropped connection doesn't use it up
function markPlayed(game) {
  if (passActive() || trialUsed(game)) return;
  ME.played = [...(ME.played || []), game]; saveMe();
  if (!NET.local && USER) authClient().rpc("fos7a_played", { p_game: game }).then(() => {}, () => {});
}
async function redeemCode(code) {
  if (NET.local || !USER) return { ok: false, why: NET.local ? "net" : "login" };
  try {
    const { data, error } = await authClient().rpc("fos7a_redeem", { p_code: code });
    if (error || !data) return { ok: false, why: "net" };
    if (data.ok) { ME.until = data.until; saveMe(); refreshMe(); }
    return data;
  } catch (e) { return { ok: false, why: "net" }; }
}

// Google sign-in. In the Android app Google won't sign in inside the app's page, so it opens in the
// browser and comes back through com.fos7a.app://auth, which the app hands to the page as ?code=…
async function signIn(game) {
  writeJSON(AFTER_KEY, { game: game || "", at: Date.now() });
  const c = authClient(); if (!c) return false;
  const app = !!window.Fos7aApp;
  const redirectTo = app ? "com.fos7a.app://auth" : location.origin + location.pathname;
  const { data, error } = await c.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: app, queryParams: { prompt: "select_account" } } });
  if (error) return false;
  if (app && data && data.url) { if (window.Fos7aApp.openUrl) window.Fos7aApp.openUrl(data.url); else location.href = data.url; }
  return true;
}
async function signOut() {
  try { await authClient()?.auth.signOut(); } catch (e) {}
  USER = null; ME = { played: [], until: null, admin: false }; saveMe();
}

// on every load: pick up the session (finishing a Google sign-in if we just came back from one)
async function initAuth() {
  if (NET.local) return;
  const c = authClient(); if (!c) return;
  let session = null;
  try { session = (await c.auth.getSession()).data.session; } catch (e) {}
  const q = new URLSearchParams(location.search);
  if (q.has("code") || q.has("error")) { q.delete("code"); q.delete("error"); q.delete("error_description"); q.delete("error_code"); history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "")); }
  USER = session ? session.user : null;
  if (USER && ME.uid && ME.uid !== USER.id) ME = { played: [], until: null, admin: false };
  c.auth.onAuthStateChange((_e, s) => { USER = s ? s.user : null; });
  if (USER) await refreshMe();
  if (typeof renderHub === "function" && !$("hub").hidden) renderHub();
  // carry on with whatever the host was opening when they went to sign in
  const after = readJSON(AFTER_KEY);
  try { localStorage.removeItem(AFTER_KEY); } catch (e) {}
  if (USER && after && Date.now() - after.at < 15 * 60000 && !$("hub").hidden) {
    if (after.game && ROOM_GAMES[after.game]) hostGate(after.game, () => openGame(after.game));
    else openPass(null);
  }
}

// every way into hosting goes through here
function hostGate(game, go) {
  if (!signedIn()) return openLogin(game);
  if (!canHost(game)) return openPass(game, go);
  go();
}

const GOOGLE = '<svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
function openLogin(game) {
  const g = game && ROOM_GAMES[game];
  $("modalCard").innerHTML = `
    <h3>سجّل دخولك وافتح الغرفة</h3>
    <p>المضيف بس يسجل، ومرة وحدة. كل لعبة لها جلسة مجانية على حسابك${g ? `، وأولها «${g.name}»` : ""}. واللي يدخلون غرفتك ما يحتاجون حساب.</p>
    <button type="button" class="pbtn gbtn" id="gIn">${GOOGLE}<span>ادخل بحساب قوقل</span></button>
    <p class="passmsg" id="gMsg" role="status"></p>
    <button type="button" class="pbtn alt" id="gBack">رجوع</button>`;
  $("modal").hidden = false;
  $("gBack").onclick = () => ($("modal").hidden = true);
  $("gIn").onclick = async () => { $("gIn").disabled = true; $("gMsg").textContent = "نفتح قوقل…"; if (!(await signIn(game))) { $("gIn").disabled = false; $("gMsg").textContent = "ما قدرنا نفتح قوقل، تأكد من النت وجرّب."; } };
}

const passDate = () => new Date(passUntil()).toLocaleString("ar-SA-u-nu-arab", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
// the card that shows up instead of starting a game whose free session is used
function openPass(game, then) {
  if (!signedIn()) return openLogin(game);
  const g = game && ROOM_GAMES[game];
  const card = $("modalCard");
  const draw = (msg = "") => {
    card.innerHTML = `
      <h3>${passActive() ? "تذكرتك فعالة" : g ? `خلصت جلستك المجانية في «${g.name}»` : "عندك كود؟"}</h3>
      ${passActive() ? `<p>كل الألعاب مفتوحة لين ${passDate()}.</p>` : `<p>كل لعبة لها جلسة مجانية وحدة. بعدها تفتح كل الألعاب بكود، وتقدر تاخذ واحد من حسابنا في انستقرام. واللي يدخلون غرفتك يلعبون مجاناً دائماً.</p>
      <form class="joinbox passbox" id="passForm"><input id="passCode" maxlength="12" placeholder="الكود" aria-label="الكود" autocomplete="off" autocapitalize="characters" dir="ltr"><button type="submit" class="hbtn">فعّل</button></form>
      <p class="passmsg" id="passMsg" role="status">${msg}</p>
      <a class="pbtn insta" href="https://instagram.com/${INSTA}" target="_blank" rel="noopener">تواصل معنا في انستقرام @${INSTA}</a>`}
      <button type="button" class="pbtn alt" id="passClose">${passActive() && then ? "يلا نلعب" : "رجوع"}</button>
      ${USER ? `<p class="whoami"><span dir="ltr">${esc(USER.email || "")}</span> · <button type="button" class="passnote" id="signOut">تسجيل خروج</button>${ME.admin ? ` · <a href="q9m4t.html">الأكواد</a>` : ""}</p>` : ""}`;
    $("modal").hidden = false;
    $("passClose").onclick = () => { $("modal").hidden = true; if (passActive() && then) then(); };
    if ($("signOut")) $("signOut").onclick = async () => { await signOut(); $("modal").hidden = true; if (!$("hub").hidden) renderHub(); };
    const f = $("passForm");
    if (f) f.onsubmit = async (e) => {
      e.preventDefault();
      const code = $("passCode").value.trim(); if (!code) return;
      f.querySelector("button").disabled = true; $("passMsg").textContent = "نتأكد…";
      const r = await redeemCode(code);
      if (r.ok) { beep(784, 0.1); setTimeout(() => beep(1047, 0.18), 110); draw(); if (!$("hub").hidden) renderHub(); return; }
      beep(200, 0.25, "sawtooth", 0.06);
      draw({ bad: "الكود غلط، تأكد منه.", used: "هذا الكود وصل لحده، انستخدم على كل الحسابات المسموحة.", expired: "هذا الكود انتهت مدته.", login: "سجّل دخولك أول.", net: "ما قدرنا نتأكد، تأكد من النت وجرّب." }[r.why] || "ما ضبط، جرّب مرة ثانية.");
    };
  };
  draw();
}
