// 背景音：用 Web Audio 实时合成，不使用任何录音文件
// Ambient sound synthesized with Web Audio — no recorded audio files
let ctx = null;
let master = null;
let current = null; // { kind, nodes: [], timers: [] }

function noiseBuffer(type) {
  const len = ctx.sampleRate * 3;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (type === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
  }
  return buf;
}

function source(type) {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuffer(type);
  s.loop = true;
  s.start();
  return s;
}

function lfo(freq, depth, target, offset) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = freq;
  g.gain.value = depth;
  o.connect(g).connect(target);
  if (offset !== undefined) target.value = offset;
  o.start();
  return o;
}

function build(kind) {
  const nodes = [];
  const timers = [];
  const out = ctx.createGain();
  out.gain.value = 0;
  out.connect(master);
  nodes.push(out);
  const add = (...n) => nodes.push(...n);

  if (kind === 'rain') {
    const s = source('white');
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5000;
    const g = ctx.createGain(); g.gain.value = 0.18;
    s.connect(hp).connect(lp).connect(g).connect(out);
    add(s, hp, lp, g, lfo(0.2, 0.04, g.gain, 0.18));
  } else if (kind === 'waves') {
    const s = source('brown');
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
    const g = ctx.createGain();
    s.connect(lp).connect(g).connect(out);
    add(s, lp, g, lfo(0.09, 0.35, g.gain, 0.45), lfo(0.09, 300, lp.frequency, 700));
  } else if (kind === 'wind') {
    const s = source('white');
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9;
    const g = ctx.createGain(); g.gain.value = 0.22;
    s.connect(bp).connect(g).connect(out);
    add(s, bp, g, lfo(0.13, 260, bp.frequency, 600), lfo(0.07, 0.08, g.gain, 0.22));
  } else if (kind === 'hum') {
    const s = source('brown');
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 350;
    const g = ctx.createGain(); g.gain.value = 0.4;
    const o = ctx.createOscillator(); o.frequency.value = 58;
    const og = ctx.createGain(); og.gain.value = 0.03;
    s.connect(lp).connect(g).connect(out);
    o.connect(og).connect(out); o.start();
    add(s, lp, g, o, og);
  } else { // cafe
    const s = source('brown');
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.6;
    const g = ctx.createGain(); g.gain.value = 0.5;
    s.connect(bp).connect(g).connect(out);
    add(s, bp, g, lfo(0.3, 0.12, g.gain, 0.5));
    const clink = () => {
      if (!ctx) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const e = ctx.createGain();
      o.frequency.value = 2200 + Math.random() * 1400;
      e.gain.setValueAtTime(0.0001, t);
      e.gain.exponentialRampToValueAtTime(0.035, t + 0.005);
      e.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(e).connect(out);
      o.start(t); o.stop(t + 0.4);
      timers.push(setTimeout(clink, 1800 + Math.random() * 4500));
    };
    timers.push(setTimeout(clink, 1200));
  }
  out.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
  return { kind, nodes, timers, out };
}

function teardown(c) {
  if (!c) return;
  c.timers.forEach(clearTimeout);
  c.out.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
  setTimeout(() => c.nodes.forEach((n) => { try { n.stop && n.stop(); } catch { /* already stopped */ } try { n.disconnect(); } catch { /* ignore */ } }), 1500);
}

// kind: 'rain' | 'cafe' | 'waves' | 'wind' | 'hum' | null (off)
export function playAmbient(kind, volume = 0.5) {
  if (!kind) { stopAmbient(); return; }
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  master.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
  if (current && current.kind === kind) return;
  teardown(current);
  current = build(kind);
}

export function setVolume(v) { if (ctx && master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.1); }

export function stopAmbient() { if (ctx) { teardown(current); current = null; } }
