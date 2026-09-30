"use strict";
// ================= the sound of recess: the school bell =================
// Everything is synthesized in the browser, so there are no audio files to load or license.
// Sound can be switched off from the speaker button; the choice is remembered.

const SOUND_KEY = "fos7a.sound.v1";
let soundOn = (() => { try { return localStorage.getItem(SOUND_KEY) !== "off"; } catch (e) { return true; } })();
function setSound(on) {
  soundOn = on;
  try { localStorage.setItem(SOUND_KEY, on ? "on" : "off"); } catch (e) {}
  document.querySelectorAll("[data-sound]").forEach((b) => { b.setAttribute("aria-pressed", String(on)); b.innerHTML = speakerIcon(on); b.setAttribute("aria-label", on ? "اكتم الصوت" : "شغّل الصوت"); });
}
const speakerIcon = (on) => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none"/>${on ? '<path d="M16 9q2 3 0 6M18.5 6.5q4 5.5 0 11"/>' : '<path d="M16 9l5 6M21 9l-5 6"/>'}</svg>`;

function audio() {
  try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume().catch(() => {}); return ac; } catch (e) { return null; }
}

// ---- the bell: an electric school bell, a hammer hitting a metal dome about 22 times a second ----
const bellCache = {};
function bellBuffer(a, dur) {
  const key = dur.toFixed(2);
  if (bellCache[key]) return bellCache[key];
  const sr = a.sampleRate, n = Math.floor(sr * (dur + 0.9)), b = a.createBuffer(2, n, sr), L = b.getChannelData(0), R = b.getChannelData(1);
  const f0 = 1180, parts = [[1, 0.55], [2.76, 0.3], [5.4, 0.16], [8.93, 0.07]], rate = 22;
  let noise = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr, ringing = t < dur;
    const ph = (t * rate) % 1, strike = ringing ? Math.exp(-ph * 9) : 0; // each hammer blow
    const env = ringing ? Math.min(1, t / 0.01) * (0.55 + 0.45 * strike) : Math.exp(-(t - dur) * 5.5) * 0.55; // rings on after the hammer stops
    let s = 0;
    for (const [k, amp] of parts) s += Math.sin(2 * Math.PI * f0 * k * t + Math.sin(2 * Math.PI * 5 * t) * 0.02 * k) * amp * (k > 3 ? Math.exp(-(ringing ? ph : t - dur) * 6) : 1);
    noise += (Math.random() * 2 - 1 - noise) * 0.5;
    const clank = ringing ? noise * Math.exp(-ph * 40) * 0.35 : 0;
    const v = (s * env + clank) * 0.33;
    L[i] = v; R[i] = v * 0.92 + (i > 40 ? L[i - 40] * 0.08 : 0); // a little room
  }
  return (bellCache[key] = b);
}
function ringBell(dur = 1.8, vol = 0.8) {
  if (!soundOn) return;
  const a = audio(); if (!a) return;
  try { const s = a.createBufferSource(), g = a.createGain(); s.buffer = bellBuffer(a, dur); g.gain.value = vol; s.connect(g).connect(a.destination); s.start(); } catch (e) {}
  buzz([120, 60, 120]);
}

// ---- moments ----
// only the bell: recess when a room opens, class when a game starts, and once more at the end
function recess() { ringBell(1.6); }
function classStarts() { ringBell(1.1, 0.7); }
function yardCheer() { ringBell(1.3, 0.75); }
function yardAmbient() {}
function yardQuiet() {}
