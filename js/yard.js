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
// Each voice is a soft buzz plus breath, shaped by three moving "mouth" filters into words that come in
// phrases, with pauses. The crowd goes through one bus: trimmed lows and highs, then a room echo, so it
// sounds like a schoolyard across the wall rather than a synthesizer in your ear.
const Y = { master: null, nodes: [], timer: 0, noise: null };
function yardBus(a) {
  if (Y.master) return Y.master;
  const m = a.createGain(), hp = a.createBiquadFilter(), lp = a.createBiquadFilter(), dry = a.createGain(), wet = a.createGain(), verb = a.createConvolver();
  m.gain.value = 0.0001; hp.type = "highpass"; hp.frequency.value = 170; lp.type = "lowpass"; lp.frequency.value = 3600;
  const len = Math.floor(a.sampleRate * 1.7), ir = a.createBuffer(2, len, a.sampleRate); // a walled yard: short, bright echo
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) * (i < 400 ? i / 400 : 1); }
  verb.buffer = ir; dry.gain.value = 0.72; wet.gain.value = 0.42;
  m.connect(hp).connect(lp); lp.connect(dry).connect(a.destination); lp.connect(verb).connect(wet).connect(a.destination);
  return (Y.master = m);
}
function yardNoise(a) {
  if (Y.noise) return Y.noise;
  const n = a.sampleRate * 2, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return (Y.noise = b);
}
const VOWELS = [[750, 1200, 2600], [400, 2100, 2900], [320, 900, 2400], [600, 1750, 2700], [330, 2500, 3100], [680, 1100, 2500], [500, 1500, 2600]];
function yardVoice(a, out, t0, dur, o) {
  const osc = a.createOscillator(), soft = a.createBiquadFilter(), breath = a.createBufferSource(), bg = a.createGain(), src = a.createGain();
  const lfo = a.createOscillator(), lfoG = a.createGain(), env = a.createGain(), pan = a.createStereoPanner ? a.createStereoPanner() : null;
  osc.type = "sawtooth"; soft.type = "lowpass"; soft.frequency.value = 2400;
  breath.buffer = yardNoise(a); breath.loop = true; bg.gain.value = 0.35;
  lfo.frequency.value = 4.5 + Math.random() * 2; lfoG.gain.value = o.pitch * 0.025; lfo.connect(lfoG).connect(osc.frequency);
  osc.connect(soft).connect(src); breath.connect(bg).connect(src);
  const fs = [0, 1, 2].map((k) => { const f = a.createBiquadFilter(), g = a.createGain(); f.type = "bandpass"; f.Q.value = [5, 7, 9][k]; g.gain.value = [1, 0.55, 0.25][k]; src.connect(f).connect(g).connect(env); return f; });
  if (pan) { pan.pan.value = o.pan; env.connect(pan).connect(out); } else env.connect(out);
  env.gain.setValueAtTime(0, t0);
  let t = t0 + Math.random() * 1.2;
  while (t < t0 + dur - 0.3) {
    // one phrase: a few words, the voice drifting down, then a breath
    const words = 3 + Math.floor(Math.random() * 6), start = o.pitch * (o.shout ? 1.4 : 1) * (0.95 + Math.random() * 0.15);
    for (let w = 0; w < words && t < t0 + dur - 0.3; w++) {
      const syl = o.shout ? 0.22 + Math.random() * 0.35 : 0.1 + Math.random() * 0.14, v = VOWELS[Math.floor(Math.random() * VOWELS.length)], lift = o.shout ? 1.12 : 1;
      fs.forEach((f, k) => f.frequency.setTargetAtTime(v[k] * lift, t, 0.03));
      osc.frequency.setTargetAtTime(start * (1 - (w / words) * 0.18) * (0.95 + Math.random() * 0.1), t, 0.04);
      const peak = o.level * (0.55 + Math.random() * 0.45) * (o.shout ? 1.5 : 1);
      env.gain.setTargetAtTime(peak, t, 0.025); env.gain.setTargetAtTime(peak * 0.25, t + syl * 0.7, 0.03);
      t += syl + Math.random() * 0.04;
    }
    env.gain.setTargetAtTime(0, t, 0.05);
    t += 0.35 + Math.random() * 1.1;
  }
  env.gain.setTargetAtTime(0, t0 + dur - 0.25, 0.08);
  for (const n of [osc, breath, lfo]) { n.start(t0); n.stop(t0 + dur + 0.4); Y.nodes.push(n); }
}
// a burst of laughter: breathy "ha ha ha" going down
function yardLaugh(a, out, t0, pitch, pan, level) {
  const osc = a.createOscillator(), breath = a.createBufferSource(), bg = a.createGain(), src = a.createGain(), f = a.createBiquadFilter(), env = a.createGain(), p = a.createStereoPanner ? a.createStereoPanner() : null;
  osc.type = "triangle"; breath.buffer = yardNoise(a); breath.loop = true; bg.gain.value = 0.6;
  osc.connect(src); breath.connect(bg).connect(src);
  f.type = "bandpass"; f.frequency.value = 1100; f.Q.value = 2.5;
  src.connect(f).connect(env); if (p) { p.pan.value = pan; env.connect(p).connect(out); } else env.connect(out);
  const n = 4 + Math.floor(Math.random() * 4), gap = 0.13 + Math.random() * 0.05;
  env.gain.setValueAtTime(0, t0);
  for (let i = 0; i < n; i++) { const t = t0 + i * gap; osc.frequency.setValueAtTime(pitch * (1.35 - i * 0.05), t); env.gain.setTargetAtTime(level * (1 - i * 0.08), t, 0.012); env.gain.setTargetAtTime(0, t + gap * 0.45, 0.02); }
  for (const x of [osc, breath]) { x.start(t0); x.stop(t0 + n * gap + 0.3); Y.nodes.push(x); }
}
// the yard behind the voices: a soft wash of footsteps and wind, and a ball bouncing now and then
function yardHiss(a, out, t0, dur, level) {
  const n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) { last += (Math.random() * 2 - 1 - last) * 0.04; d[i] = last * 2; }
  for (let k = 0; k < dur * 0.8; k++) { // a ball: bounces that come quicker and softer
    let at = Math.floor(Math.random() * n * 0.8), amp = 0.5, gapS = 0.45;
    for (let bnc = 0; bnc < 4 && at < n - 3000; bnc++) { for (let i = 0; i < 2400; i++) d[at + i] += Math.sin(i * 0.028) * Math.exp(-i / 380) * amp; at += Math.floor(gapS * a.sampleRate); amp *= 0.6; gapS *= 0.7; }
  }
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = b; f.type = "lowpass"; f.frequency.value = 900; g.gain.value = level;
  s.connect(f).connect(g).connect(out); s.start(t0);
  Y.nodes.push(s);
}
function yardPlay(dur, level, crowd) {
  const a = audio(); if (!a) return;
  const out = yardBus(a), t0 = a.currentTime + 0.02, each = level / Math.sqrt(crowd / 4); // more voices, each a bit quieter
  for (let i = 0; i < crowd; i++) yardVoice(a, out, t0, dur, { pitch: 200 + Math.random() * 220, pan: Math.random() * 1.6 - 0.8, level: each * (0.4 + Math.random() * 0.6), shout: Math.random() < 0.1 });
  for (let i = 0; i < Math.max(1, Math.round(dur / 3)); i++) yardLaugh(a, out, t0 + 0.5 + Math.random() * (dur - 1.5), 280 + Math.random() * 160, Math.random() * 1.4 - 0.7, each * 0.9);
  yardHiss(a, out, t0, dur, level * 0.35);
  Y.nodes = Y.nodes.slice(-400);
}
// A burst of the yard: `swell` seconds of noise that fades in and out.
function yardBurst(dur = 3.5, vol = 0.55, crowd = 16) {
  if (!soundOn) return;
  const a = audio(); if (!a) return;
  yardPlay(dur, 1.0, crowd);
  const g = Y.master.gain, t = a.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.exponentialRampToValueAtTime(vol, t + 0.9); g.setValueAtTime(vol, t + dur - 1.2); g.exponentialRampToValueAtTime(0.0001, t + dur);
}
// The yard in the background while people wait in «وينكم!»: quiet, and it keeps going.
function yardAmbient(vol = 0.18) {
  if (!soundOn || Y.timer) return;
  const a = audio(); if (!a) return;
  const chunk = 6;
  const more = () => { if (!soundOn) return yardQuiet(0.3); yardPlay(chunk + 1.5, 1.0, 12); };
  more();
  const g = Y.master.gain, t = a.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.exponentialRampToValueAtTime(vol, t + 2);
  Y.timer = setInterval(more, chunk * 1000);
}
function yardQuiet(fade = 0.8) {
  clearInterval(Y.timer); Y.timer = 0;
  if (!Y.master || !ac) return;
  const g = Y.master.gain, t = ac.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.exponentialRampToValueAtTime(0.0001, t + fade);
  const old = Y.nodes; Y.nodes = [];
  setTimeout(() => old.forEach((n) => { try { n.stop(); } catch (e) {} }), fade * 1000 + 100);
}

// ---- moments ----
// recess starts: the bell, then the yard
function recess() { ringBell(1.6); setTimeout(() => yardBurst(4, 0.55), 1100); }
// back to class: the yard goes quiet and the bell rings for the game
function classStarts() { yardQuiet(0.6); ringBell(1.1, 0.7); }
// the end of a game: a cheer from the yard
function yardCheer() { if (!soundOn) return; yardBurst(3.2, 0.7, 22); }
