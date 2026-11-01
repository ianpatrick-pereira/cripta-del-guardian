// Ataque de subjefe: wave
import { angTo, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { noise, sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall } from '../08-colisiones.js';
import { enemyShoot } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('wave', {
  hacer(e, dt, c) {
    const { p, S, ph2 } = c;
    // ola: dos muros de agua con un hueco; si te tocan, te empapan
    e.timer += dt;
    if (e.timer > .55 && e.k < 2 && e.timer >= .55 + e.k * .7) {
      const A = angTo(e, p), px = -Math.sin(A), py = Math.cos(A), gap = rand(-3, 3) | 0, n = ph2 ? 13 : 11;
      for (let i = -(n >> 1); i <= n >> 1; i++) {
        if (Math.abs(i - gap) < 1.5) continue;
        const sx = e.x + px * i * 22, sy = e.y + py * i * 22;
        if (!hitsWall(sx, sy, 6)) enemyShoot({ x: sx, y: sy, r: 0 }, A, 150 + 10 * G.floor, 7, S.pc);
      }
      e.k++; sfx(260, .3, 'sine', .04, -120); noise(.25, .04, 900);
    }
    if (e.timer > 2.1) subIdle(e);
  }
});
