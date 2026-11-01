// Ataque de jefe: burst
import { TAU } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { bossIdle, bossRing } from '../16-jefes.js';
defBossMove('burst', {
  hacer(e, dt, c) {
    const { ph2, bcol } = c;
    e.timer += dt;
    const rings = ph2 ? 3 : 2, n = ph2 ? 20 : 15;
    if (e.k < rings && e.timer >= e.k * .38) { bossRing(e, n, ph2 ? 180 : 160, bcol, e.k * (TAU / n / 2)); e.k++; sfx(160, .12, 'square', .04, -60); }
    if (e.timer > rings * .38 + .4) bossIdle(e);
  }
});
