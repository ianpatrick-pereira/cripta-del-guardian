// Ataque de Elemental de aire: flechas de viento muy rápidas
import { angTo, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { enemyShoot } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('flechas', {
  hacer(e, dt, c) {
    const { p, S, ph2 } = c;
    e.timer += dt;
    const n = ph2 ? 5 : 4;
    if (e.timer > .3 && e.k < n && e.timer >= .3 + e.k * .28) {
      // apunta adonde vas a estar
      const t = .35, A = angTo(e, { x: p.x + G.pv.x * t, y: p.y + G.pv.y * t });
      for (let i = -1; i <= 1; i++) enemyShoot(e, A + i * .1 + rand(-.02, .02), 420, 4, S.pc, 1, 'arrow');
      e.k++; sfx(900, .06, 'triangle', .03, 500);
    }
    if (e.timer > .4 + n * .28) subIdle(e);
  }
});
