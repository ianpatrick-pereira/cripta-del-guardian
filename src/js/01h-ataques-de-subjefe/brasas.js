// Ataque de Elemental de fuego: una línea de suelo ardiendo que avanza hacia ti
import { angTo } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { noise } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall } from '../08-colisiones.js';
import { hazard } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('brasas', {
  hacer(e, dt, c) {
    const { p, S, ph2 } = c;
    e.timer += dt;
    if (e.k === 0) { e.k = 1; e.ca = angTo(e, p); e.n = 0; }
    const tot = ph2 ? 9 : 7;
    while (e.n < tot && e.timer > .3 + e.n * .09) {
      e.n++;
      for (const side of ph2 ? [-.35, 0, .35] : [0]) {
        const a = e.ca + side, d = e.r + e.n * 38, x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d;
        if (!hitsWall(x, y, 10)) hazard(x, y, 30, .45, 1, S.pc, { owner: e, el: 'fire' });
      }
      noise(.1, .03, 500);
    }
    if (e.timer > .3 + tot * .09 + .7) subIdle(e);
  }
});
