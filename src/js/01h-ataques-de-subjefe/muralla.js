// Ataque de Elemental de tierra: levanta columnas de roca detrás de ti para cerrarte el paso
import { angTo, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { noise, sfx } from '../05-audio.js';
import { shake } from '../09-efectos.js';
import { subIdle } from '../15-subjefes.js';
import { raisePillar } from '../23b-poderes-elementales.js';
defSubMove('muralla', {
  hacer(e, dt, c) {
    const { p, ph2 } = c;
    e.timer += dt;
    if (e.k === 0 && e.timer > .5) {
      e.k = 1;
      // una jaula de columnas a tu alrededor con la salida mirando hacia él: o lo enfrentas o las rompes
      const toE = angTo(p, e), n = 10, gap = ph2 ? 1 : 2;
      for (let i = 0; i < n; i++) {
        if (Math.min(i, n - i) < gap) continue;
        const a = toE + i * 2 * Math.PI / n, d = 84 + rand(-5, 5);
        raisePillar(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d);
      }
      shake(8); noise(.4, .08, 250); sfx(60, .5, 'sawtooth', .05, -10);
    }
    if (e.timer > 1.1) subIdle(e);
  }
});
