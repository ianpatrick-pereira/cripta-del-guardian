// Ataque de Elemental de aire: te atrae hacia él y, al final, suelta una ráfaga que hace daño y empuja
import { TAU, angTo, dist, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { noise, sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { burst, shake } from '../09-efectos.js';
import { elemHit, enemyShoot } from '../14-enemigos.js';
import { hurtPlayer } from '../13-armadura.js';
import { subIdle } from '../15-subjefes.js';
import { windPull } from '../23b-poderes-elementales.js';
defSubMove('atraer', {
  hacer(e, dt, c) {
    const { p, S, ph2 } = c;
    e.timer += dt;
    if (e.timer > .3 && e.timer < 1.7) {
      windPull(e, ph2 ? 170 : 130, dt);
      if (Math.random() < .7) { const an = rand(0, TAU), rr = rand(60, 170); G.parts.push({ x: e.x + Math.cos(an) * rr, y: e.y + Math.sin(an) * rr, vx: -Math.cos(an) * 260, vy: -Math.sin(an) * 260, life: .45, max: .45, color: 'rgba(200,240,224,.8)', size: 2 }); }
      if (Math.random() < dt * 5) noise(.2, .03, 2400);
    }
    if (e.k === 0 && e.timer > 1.7) {
      e.k = 1;
      // ráfaga: daña y empuja si estás cerca, y lanza un anillo de cuchillas de viento
      if (!G.over && dist(e, p) < 130 && hurtPlayer(e.dmg, e.name)) elemHit('air', e);
      for (let i = 0; i < (ph2 ? 16 : 12); i++) enemyShoot(e, i * TAU / (ph2 ? 16 : 12) + angTo(e, p), 260, 5, S.pc);
      burst(e.x, e.y, '#c8f0e0', 26, 320, 4, .5); shake(8); sfx(600, .3, 'sine', .05, -400);
    }
    if (e.timer > 2.1) subIdle(e);
  }
});
