// Ataque de La Reina Tejedora (v0.65, fase 2+): Hilos de Muerte.
// Cruzan la sala hilos de seda paralelos (uno pasa justo por ti): primero aparecen finos como aviso,
// luego se tensan y cortan. Hay que meterse entre dos hilos. En la fase 3 llega una segunda tanda cruzada.
import { rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { noise, sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hurtPlayer } from '../13-armadura.js';
import { quien } from '../14-enemigos.js';
import { bossIdle } from '../16-jefes.js';
import { shredShield } from '../23-elementos.js';
const HILO_LARGO = 1000, HILO_SEP = 92;
function tenderHilos(e, a, n) {
  const p = G.player, nx = -Math.sin(a), ny = Math.cos(a), off = rand(-.4, .4) * HILO_SEP;
  G.beams = [];
  for (let i = 0; i < n; i++) {
    const s = (i - (n - 1) / 2) * HILO_SEP + off, cx = p.x + nx * s, cy = p.y + ny * s;
    G.beams.push({ x: cx - Math.cos(a) * HILO_LARGO / 2, y: cy - Math.sin(a) * HILO_LARGO / 2, a, on: false, hilo: true, largo: HILO_LARGO, k: 0 });
  }
}
defBossMove('hilos', {
  hacer(e, dt, c) {
    const { p, ph3 } = c;
    e.timer += dt;
    const aviso = ph3 ? .8 : 1, corta = .3, tandas = ph3 ? 2 : 1, n = ph3 ? 5 : 4;
    const fase = Math.floor(e.timer / (aviso + corta + .15)), t = e.timer - fase * (aviso + corta + .15);
    if (fase >= tandas) { G.beams = []; bossIdle(e); return; }
    if (e.k === fase) { e.k++; tenderHilos(e, fase === 0 ? rand(0, Math.PI) : G.beams[0].a + Math.PI / 2, n); sfx(700, .5, 'triangle', .02, 300); }
    for (const b of G.beams) b.k = Math.min(1, t / aviso);
    const on = t >= aviso && t < aviso + corta;
    if (on && !G.beams[0].on) { sfx(1200, .15, 'sawtooth', .03, -900); noise(.15, .05, 3000); }
    for (const b of G.beams) b.on = on;
    if (on) for (const b of G.beams) {
      const dx = p.x - b.x, dy = p.y - b.y, along = dx * Math.cos(b.a) + dy * Math.sin(b.a), perp = Math.abs(-dx * Math.sin(b.a) + dy * Math.cos(b.a));
      if (along > 0 && along < b.largo && perp < 10) { shredShield(); hurtPlayer(1, quien(e)); }
    }
    if (t >= aviso + corta) for (const b of G.beams) b.on = false;
  }
});
