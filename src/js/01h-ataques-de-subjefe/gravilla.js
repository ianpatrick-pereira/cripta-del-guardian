// Ataque de Elemental de tierra: abanicos de piedras pequeñas
import { angTo, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { enemyShoot } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('gravilla', {
  hacer(e, dt, c) {
    const { p, ph2 } = c;
    e.timer += dt;
    const n = ph2 ? 3 : 2;
    if (e.timer > .4 && e.k < n && e.timer >= .4 + e.k * .5) {
      const A = angTo(e, p) + (e.k % 2 ? .1 : -.1);
      for (let i = -3; i <= 3; i++) enemyShoot(e, A + i * .16 + rand(-.03, .03), 230, 5, '#a88a68');
      e.k++; sfx(140, .12, 'square', .03, -60);
    }
    if (e.timer > .5 + n * .5) subIdle(e);
  }
});
