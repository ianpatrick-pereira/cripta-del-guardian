// Ataque de subjefe: whirl
import { TAU, angTo, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { G } from '../07-estado.js';
import { moveEnt } from '../08-colisiones.js';
import { enemyShoot } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('whirl', {
  hacer(e, dt, c) {
    const { p, S } = c;
    // remolino: te arrastra hacia él mientras dispara anillos
    e.timer += dt;
    if (e.timer > .4 && e.timer < 2) {
      const ap = angTo(p, e); moveEnt(p, Math.cos(ap) * 110 * dt, Math.sin(ap) * 110 * dt);
      while (e.k * .3 < e.timer - .4) { const n = 8, off = e.k * .4; for (let i = 0; i < n; i++) enemyShoot(e, off + i * TAU / n, 140, 5, S.pc || S.tint); e.k++; }
      if (Math.random() < .6) { const an = rand(0, TAU), rr = rand(30, 120); G.parts.push({ x: e.x + Math.cos(an) * rr, y: e.y + Math.sin(an) * rr, vx: -Math.cos(an) * 120, vy: -Math.sin(an) * 120, life: .4, max: .4, color: S.tint, size: 3 }); }
    }
    if (e.timer > 2.3) subIdle(e);
  }
});
