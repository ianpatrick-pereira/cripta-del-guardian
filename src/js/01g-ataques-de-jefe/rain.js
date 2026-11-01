// Ataque de jefe: rain
import { rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { G } from '../07-estado.js';
import { hazard } from '../14-enemigos.js';
import { bossIdle } from '../16-jefes.js';
defBossMove('rain', {
  hacer(e, dt, c) {
    const { p, ph3, bcol } = c;
    e.timer += dt;
    const n = ph3 ? 9 : 6;
    while (e.k < n && e.timer >= e.k * .14) {
      const t = .5, j = e.k === 0 ? 0 : 90;
      hazard(p.x + G.pv.x * t * .8 + rand(-j, j), p.y + G.pv.y * t * .8 + rand(-j, j), 44, .85, 1, bcol, { shred: true });
      e.k++;
    }
    if (e.timer > n * .14 + .6) bossIdle(e);
  }
});
