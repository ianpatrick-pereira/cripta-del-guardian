// Ataque de Elemental de fuego: bolas de fuego que caen sobre ti y dejan el suelo ardiendo
import { angTo, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { enemyShoot, hazard } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('bolafuego', {
  hacer(e, dt, c) {
    const { p, S, ph2 } = c;
    e.timer += dt;
    const n = ph2 ? 4 : 3;
    if (e.timer > .35 && e.k < n && e.timer >= .35 + e.k * .4) {
      const t = .9, j = 30;
      hazard(p.x + G.pv.x * t * .7 + rand(-j, j), p.y + G.pv.y * t * .7 + rand(-j, j), 44, t, 1, S.pc, { owner: e, el: 'fire' });
      enemyShoot(e, angTo(e, p) + rand(-.15, .15), 190, 10, '#ffb04a');
      e.k++; sfx(180, .2, 'sawtooth', .04, -90);
    }
    if (e.timer > .5 + n * .4 + .6) subIdle(e);
  }
});
