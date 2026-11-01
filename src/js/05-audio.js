// ================= Audio =================
import { pick } from './01-utilidades.js';
import { FLOORS } from './03-datos-del-juego.js';
import { SAVE } from './04-guardado.js';
import { G, paused, started } from './07-estado.js';
let AC = null, muted = false, noiseBuf = null;
function sfx(f, d = .08, type = 'square', v = .04, slide = 0) {
  if (!AC || muted) return;
  const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
  g.gain.setValueAtTime(Math.max(.0002, v * SAVE.opt.sfx), t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02);
}
function noise(d = .3, v = .08, freq = 900) {
  if (!AC || muted) return;
  if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
  const t = AC.currentTime, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = freq;
  g.gain.setValueAtTime(Math.max(.0002, v * SAVE.opt.sfx), t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  s.connect(f).connect(g).connect(AC.destination); s.start(t); s.stop(t + d + .05);
}
const midi = n => 440 * Math.pow(2, (n - 69) / 12);
const Music = { next: 0, step: 0 };
function note(n, t, d, type, v) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(midi(n), t);
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(Math.max(.0002, v * SAVE.opt.music), t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .05);
}
function musicTick() {
  if (!AC || muted || !G || !started || paused || G.over) { if (AC) Music.next = AC.currentTime + .1; return; }
  const fl = FLOORS[G.fi].music, boss = !!G.boss;
  const tempo = boss ? fl.tempo * 1.45 : fl.tempo, eighth = 60 / tempo / 2;
  if (Music.next < AC.currentTime) Music.next = AC.currentTime + .05;
  const prog = [0, -4, -2, -5];
  while (Music.next < AC.currentTime + .2) {
    const s = Music.step, t = Music.next, bar = Math.floor(s / 8) % 4, root = fl.root + prog[bar];
    if (fl.horror && !boss) {
      if (s % 16 === 0) note(root - 12, t, eighth * 14, 'sine', .05);
      if (s % 8 === 5 && Math.random() < .5) note(root + 24 + pick([0, 1, 6, 7]), t, eighth * 3, 'sine', .012);
    } else {
      if (s % 4 === 0) note(root - 12, t, eighth * 3.5, 'triangle', .07);
      const arp = [0, 3, 7, 12, 7, 3, 10, 7];
      note(root + 12 + arp[s % 8], t, eighth * .9, 'square', boss ? .014 : .009);
      if (boss && s % 2 === 0) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + .12); g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.0001, t + .15); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + .2); }
    }
    Music.next += eighth; Music.step++;
  }
}

// Otros módulos no pueden reasignar estas variables directamente (un import es de solo lectura): usan estas funciones.
function setAC(v) { return (AC = v); }
function setMuted(v) { return (muted = v); }

export { AC, musicTick, muted, noise, setAC, setMuted, sfx };
