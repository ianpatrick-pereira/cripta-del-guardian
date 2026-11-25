// Ataque del Guardián de la Cripta (v0.64): Círculo de invocación.
// Se abren círculos de runas en el suelo (src/sprites/g_runas.png) y de ellos salen sus esbirros.
import { TAU, rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall } from '../08-colisiones.js';
import { bossIdle } from '../16-jefes.js';
defBossMove('invocar', {
  hacer(e, dt, c) {
    const { B } = c;
    if (e.k === 0) {
      e.k = 1;
      for (let i = 0; i < 3; i++) {
        const ang = rand(0, TAU), x = e.x + Math.cos(ang) * 90, y = e.y + Math.sin(ang) * 90;
        if (hitsWall(x, y, 12)) continue;
        G.markers.push({ x, y, t: .8, type: B.minion, depth: 3 });
        G.parts.push({ x, y, vx: 0, vy: 0, life: 1.15, max: 1.15, fx: 'g_runas', pre: .8, s: 4.4, color: '', size: 0 });
      }
      sfx(240, .4, 'triangle', .04, -150);
    }
    if (e.st_t < -.7) bossIdle(e);
  }
});
