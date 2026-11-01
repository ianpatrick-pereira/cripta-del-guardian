// Ataque de subjefe: retreat
import { TAU } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { enemyShoot } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('retreat', {
  hacer(e, dt, c) {
    const { S, a, ph2, move } = c;
    e.timer += dt;
    if (e.timer < .35) move(a + Math.PI, 380);
    else if (e.k === 0) { e.k = 1; const n = ph2 ? 14 : 10; for (let i = 0; i < n; i++) enemyShoot(e, a + i * TAU / n, 170, 5, S.pc || '#f0e6c8'); sfx(300, .1, 'square', .03); }
    if (e.timer > .8) subIdle(e);
  }
});
