// Ataque de jefe: gapring
import { TAU, angDiff, rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { enemyShoot } from '../14-enemigos.js';
import { bossIdle } from '../16-jefes.js';
defBossMove('gapring', {
  hacer(e, dt, c) {
    const { ph3, bcol } = c;
    // anillos con un hueco: hay que encontrar la abertura
    e.timer += dt;
    const rings = ph3 ? 3 : 2;
    if (e.k < rings && e.timer >= e.k * .55) {
      const n = 34;
      for (let i = 0; i < n; i++) { const ang = i * TAU / n; if (Math.abs(angDiff(ang, e.gap)) < .42) continue; enemyShoot(e, ang, 150, 6, bcol); }
      e.gap += (Math.random() < .5 ? 1 : -1) * rand(.6, 1.1); e.k++; sfx(200, .12, 'square', .04, -60);
    }
    if (e.timer > rings * .55 + .3) bossIdle(e);
  }
});
