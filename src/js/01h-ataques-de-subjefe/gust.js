// Ataque de subjefe: gust
import { angTo, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { G } from '../07-estado.js';
import { enemyShoot } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('gust', {
  hacer(e, dt, c) {
    const { p, S } = c;
    // ráfaga: viento que te empuja lejos mientras lanza cuchillas de aire
    e.timer += dt;
    if (e.timer > .5 && e.timer < 2.1) {
      const A = angTo(e, p);
      p.kbx = (p.kbx || 0) + Math.cos(A) * 900 * dt; p.kby = (p.kby || 0) + Math.sin(A) * 900 * dt;
      while (e.k * .22 < e.timer - .5) { const n = 3; for (let i = 0; i < n; i++) enemyShoot(e, A + (i - 1) * .3 + rand(-.05, .05), 300, 5, S.pc); e.k++; }
      if (Math.random() < .8) { const off = rand(-60, 60); G.parts.push({ x: e.x - Math.sin(A) * off, y: e.y + Math.cos(A) * off, vx: Math.cos(A) * 420, vy: Math.sin(A) * 420, life: .5, max: .5, color: 'rgba(200,240,224,.7)', size: 2 }); }
    }
    if (e.timer > 2.4) subIdle(e);
  }
});
