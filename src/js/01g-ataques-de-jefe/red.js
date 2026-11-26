// Ataque de La Reina Tejedora (v0.65): Red de la Tejedora.
// Lanza redes gigantes que caen al suelo donde vas a estar: te frenan mientras las pisas y,
// desde la fase 2, están empapadas de veneno y queman (ver G.zonas en 16b-zonas-de-jefe.js).
import { rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { D } from '../03-datos-del-juego.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { bossIdle } from '../16-jefes.js';
import { lanzarZona } from '../16b-zonas-de-jefe.js';
defBossMove('red', {
  hacer(e, dt, c) {
    const { p, ph2, ph3 } = c;
    e.timer += dt;
    if (e.k === 0 && e.timer >= .2) {
      e.k = 1;
      const n = ph3 ? 3 : ph2 ? 2 : 1, t = .7 * D().lead;
      for (let i = 0; i < n; i++) {
        const j = i === 0 ? 0 : 120;
        lanzarZona(e, 'red', p.x + G.pv.x * t + rand(-j, j), p.y + G.pv.y * t + rand(-j, j), { veneno: ph2, dura: ph3 ? 5.5 : 4.5 });
      }
      sfx(420, .2, 'triangle', .04, -260);
    }
    if (e.timer > 1.1) bossIdle(e);
  }
});
