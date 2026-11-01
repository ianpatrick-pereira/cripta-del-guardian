// Ataque de subjefe: spit
import { defSubMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { enemyShoot, leadAng } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('spit', {
  hacer(e, dt, c) {
    const { S, ph2 } = c;
    e.timer += dt;
    const vols = ph2 ? 4 : 3;
    if (e.timer > .45 && e.k < vols && e.timer >= .45 + e.k * .35) { const A = leadAng(e, 160); for (let i = 0; i < 7; i++) enemyShoot(e, A + (i - 3) * .16, 160, 7, S.pc || '#9bff7a'); e.k++; sfx(330, .1, 'sine', .03, 200); }
    if (e.timer > .45 + vols * .35 + .3) subIdle(e);
  }
});
