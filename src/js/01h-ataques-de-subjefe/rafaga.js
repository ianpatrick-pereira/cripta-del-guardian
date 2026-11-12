// Ataque de Elemental de aire: ráfaga de viento en cono que hace daño y te lanza hacia atrás
import { TAU, angTo, dist, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { noise } from '../05-audio.js';
import { G } from '../07-estado.js';
import { elemHit, enemyShoot } from '../14-enemigos.js';
import { hurtPlayer } from '../13-armadura.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('rafaga', {
  hacer(e, dt, c) {
    const { p, S, ph2 } = c;
    e.timer += dt;
    if (e.k === 0) { e.k = 1; e.ca = angTo(e, p); e.tele = .5; }
    if (e.k === 1 && e.timer > .5) {
      e.k = 2;
      let da = Math.abs(angTo(e, p) - e.ca); if (da > Math.PI) da = TAU - da;
      if (!G.over && dist(e, p) < 260 && da < .55 && hurtPlayer(e.dmg, e.name)) elemHit('air', e);
      for (let i = -5; i <= 5; i++) enemyShoot(e, e.ca + i * .1, 330 + rand(-30, 30), 5, S.pc);
      for (let i = 0; i < 30; i++) { const an = e.ca + rand(-.5, .5), sp = rand(300, 560); G.parts.push({ x: e.x, y: e.y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: .5, max: .5, color: 'rgba(200,240,224,.8)', size: 3 }); }
      noise(.5, .08, 2600);
    }
    if (ph2 && e.k === 2 && e.timer > 1.1) { e.k = 1; e.timer = .5 - .01; e.ca = angTo(e, p); e.reps = (e.reps || 0) + 1; if (e.reps > 1) { e.k = 3; } }
    if (e.timer > 1.2 || e.k === 3) { e.reps = 0; subIdle(e); }
  }
});
