// Ataque de El Devorador de Luz (v0.65): Fauces del Vacío (su teletransporte).
// Se hunde en un portal negro; bajo tus pies se abre otro y de él salen unas fauces que muerden (hay que salir del círculo);
// luego reaparece lejos de ti saliendo de un tercer portal y suelta un anillo de disparos.
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G, freeSpot } from '../07-estado.js';
import { bossIdle, bossRing } from '../16-jefes.js';
import { bocaVacio } from '../16b-zonas-de-jefe.js';
const portal = (x, y, life, s = 3.6) => G.parts.push({ x, y, vx: 0, vy: 0, life, max: life, fx: 'd_portal', pre: life - .5, s, color: '', size: 0 });
defBossMove('fauces', {
  hacer(e, dt, c) {
    const { p, ph2, bcol } = c;
    e.timer += dt;
    if (e.k === 0) {
      if (e.timer < dt * 1.5) { portal(e.x, e.y + 6, 1, 4.2); sfx(120, .4, 'sine', .05, -60); }
      e.fade = Math.max(0, 1 - e.timer / .45);
      if (e.timer >= .45) {
        e.k = 1; e.invuln = true;
        bocaVacio(e, p.x + G.pv.x * .25, p.y + G.pv.y * .25);
        const s = freeSpot(G.bossRoom, 3, 0, p, 170); if (s) { e.x = s.x; e.y = s.y; }
      }
    } else if (e.k === 1 && e.timer >= 1.25) { e.k = 2; portal(e.x, e.y + 6, .9, 4.2); sfx(160, .3, 'sine', .04, -100); }
    else if (e.k >= 2) {
      e.fade = Math.min(1, (e.timer - 1.25) / .3);
      if (e.k === 2 && e.timer >= 1.55) { e.k = 3; e.invuln = false; bossRing(e, ph2 ? 16 : 12, 170, bcol); }
    }
    if (e.timer > 1.9) { e.fade = 1; e.invuln = false; bossIdle(e); }
  }
});
