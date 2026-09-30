"use strict";
// ================= the sound of recess: the school bell and the yard full of kids =================
// Everything is synthesized in the browser, so there are no audio files to load or license.
// Sound can be switched off from the speaker button; the choice is remembered.

const SOUND_KEY = "fos7a.sound.v1";
let soundOn = (() => { try { return localStorage.getItem(SOUND_KEY) !== "off"; } catch (e) { return true; } })();
function setSound(on) {
  soundOn = on;
  try { localStorage.setItem(SOUND_KEY, on ? "on" : "off"); } catch (e) {}
  if (!on) yardQuiet(0.2);
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

// ---- the yard: a crowd of kids talking, shouting and laughing ----
// Each voice is a buzzing pitch shaped by two moving "mouth" filters into syllable-like blobs.
const Y = { master: null, nodes: [], timer: 0 };
function yardVoice(a, out, t0, dur, opts) {
  const o = a.createOscillator(), f1 = a.createBiquadFilter(), f2 = a.createBiquadFilter(), g = a.createGain(), p = a.createStereoPanner ? a.createStereoPanner() : null;
  o.type = "sawtooth";
  const pitch = opts.pitch;
  f1.type = f2.type = "bandpass"; f1.Q.value = 6; f2.Q.value = 9;
  o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g);
  if (p) { p.pan.value = opts.pan; g.connect(p).connect(out); } else g.connect(out);
  g.gain.setValueAtTime(0, t0);
  let t = t0 + Math.random() * 0.4;
  const VOWELS = [[800, 1200], [400, 2200], [300, 900], [600, 1800], [350, 2600], [700, 1100]];
  while (t < t0 + dur) {
    const syl = opts.shout ? 0.18 + Math.random() * 0.3 : 0.09 + Math.random() * 0.16;
    const [a1, a2] = VOWELS[Math.floor(Math.random() * VOWELS.length)], lift = opts.shout ? 1.15 : 1;
    f1.frequency.setValueAtTime(a1 * lift, t); f2.frequency.setValueAtTime(a2 * lift, t);
    o.frequency.setValueAtTime(pitch * (0.9 + Math.random() * 0.25) * (opts.shout ? 1.35 : 1), t);
    o.frequency.linearRampToValueAtTime(pitch * (0.85 + Math.random() * 0.3) * (opts.shout ? 1.25 : 1), t + syl);
    const peak = opts.level * (0.5 + Math.random() * 0.5);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + syl * 0.3); g.gain.linearRampToValueAtTime(0, t + syl);
    t += syl + (Math.random() < 0.25 ? 0.25 + Math.random() * 0.7 : 0.02); // sometimes a pause between words
  }
  o.start(t0); o.stop(t0 + dur + 0.3);
  Y.nodes.push(o);
}
// a burst of laughter: short "ha" pulses
function yardLaugh(a, out, t0, pitch, pan, level) {
  const o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(), p = a.createStereoPanner ? a.createStereoPanner() : null;
  o.type = "sawtooth"; f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 3;
  o.connect(f).connect(g); if (p) { p.pan.value = pan; g.connect(p).connect(out); } else g.connect(out);
  const n = 4 + Math.floor(Math.random() * 4);
  g.gain.setValueAtTime(0, t0);
  for (let i = 0; i < n; i++) { const t = t0 + i * 0.15; o.frequency.setValueAtTime(pitch * (1.3 - i * 0.04), t); g.gain.linearRampToValueAtTime(level, t + 0.03); g.gain.linearRampToValueAtTime(0, t + 0.11); }
  o.start(t0); o.stop(t0 + n * 0.15 + 0.2);
  Y.nodes.push(o);
}
// the hiss of a busy yard behind the voices: footsteps, a ball, wind
function yardHiss(a, out, t0, dur, level) {
  const n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) { last += (Math.random() * 2 - 1 - last) * 0.06; d[i] = last * 2.4; }
  // a few thumps: a ball bouncing, someone jumping
  for (let k = 0; k < dur * 1.5; k++) { const at = Math.floor(Math.random() * (n - 3000)); for (let i = 0; i < 2600; i++) d[at + i] += Math.sin(i * 0.035) * Math.exp(-i / 500) * 0.5; }
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = b; f.type = "lowpass"; f.frequency.value = 1400; g.gain.value = level;
  s.connect(f).connect(g).connect(out); s.start(t0);
  Y.nodes.push(s);
}
function yardPlay(dur, level, crowd) {
  const a = audio(); if (!a) return;
  if (!Y.master) { Y.master = a.createGain(); Y.master.connect(a.destination); }
  const t0 = a.currentTime + 0.02, out = Y.master;
  for (let i = 0; i < crowd; i++) yardVoice(a, out, t0, dur, { pitch: 190 + Math.random() * 230, pan: Math.random() * 1.6 - 0.8, level: level * (0.35 + Math.random() * 0.4), shout: Math.random() < 0.18 });
  for (let i = 0; i < Math.ceil(dur / 2.5); i++) yardLaugh(a, out, t0 + Math.random() * dur, 260 + Math.random() * 200, Math.random() * 1.4 - 0.7, level * 0.5);
  yardHiss(a, out, t0, dur, level * 0.5);
  Y.nodes = Y.nodes.slice(-200);
}
// A burst of the yard: `swell` seconds of noise that fades in and out.
function yardBurst(dur = 3, vol = 0.5, crowd = 14) {
  if (!soundOn) return;
  const a = audio(); if (!a) return;
  yardPlay(dur, 0.6, crowd);
  const g = Y.master.gain, t = a.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(vol, t + 0.5); g.setValueAtTime(vol, t + dur - 0.8); g.linearRampToValueAtTime(0.0001, t + dur);
}
// The yard in the background while people wait in «وينكم!»: quiet, and it keeps going.
function yardAmbient(vol = 0.22) {
  if (!soundOn || Y.timer) return;
  const a = audio(); if (!a) return;
  const chunk = 6;
  const more = () => { if (!soundOn) return yardQuiet(0.3); yardPlay(chunk + 0.5, 0.6, 9); };
  more();
  const g = Y.master.gain, t = a.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(vol, t + 1.2);
  Y.timer = setInterval(more, chunk * 1000);
}
function yardQuiet(fade = 0.8) {
  clearInterval(Y.timer); Y.timer = 0;
  if (!Y.master || !ac) return;
  const g = Y.master.gain, t = ac.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0.0001, t + fade);
  const old = Y.nodes; Y.nodes = [];
  setTimeout(() => old.forEach((n) => { try { n.stop(); } catch (e) {} }), fade * 1000 + 100);
}

// ---- moments ----
// recess starts: the bell, then the yard
function recess() { ringBell(1.6); setTimeout(() => yardBurst(3.2, 0.5), 700); }
// back to class: the yard goes quiet and the bell rings for the game
function classStarts() { yardQuiet(0.6); ringBell(1.1, 0.7); }
// the end of a game: a cheer from the yard
function yardCheer() { if (!soundOn) return; yardBurst(2.6, 0.7, 20); }
