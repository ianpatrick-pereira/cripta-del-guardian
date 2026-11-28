// Ataque de La Reina Tejedora (v0.65, fase 3): Lluvia de Veneno.
// Bajan arañas colgando del techo sobre ti y sueltan gotas de veneno; donde caen queda un charco que quema.
import { rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { bossIdle } from '../16-jefes.js';
import { gotaVeneno } from '../16b-zonas-de-jefe.js';
defBossMove('veneno', {
  hacer(e, dt, c) {
    const { p } = c;
    e.timer += dt;
    const n = 7;
    while (e.k < n && e.timer >= .15 + e.k * .16) {
      const t = .5, j = e.k === 0 ? 0 : 100;
      gotaVeneno(e, p.x + G.pv.x * t * .8 + rand(-j, j), p.y + G.pv.y * t * .8 + rand(-j, j));
      e.k++;
      if (e.k % 2) sfx(520, .06, 'triangle', .02, -200);
    }
    if (e.timer > .15 + n * .16 + .9) bossIdle(e);
  }
});
