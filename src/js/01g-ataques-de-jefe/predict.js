// Ataque de jefe: predict
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { enemyShoot, leadAng } from '../14-enemigos.js';
import { bossIdle } from '../16-jefes.js';
defBossMove('predict', {
  hacer(e, dt, c) {
    const { ph3 } = c;
    e.timer += dt;
    const vol = ph3 ? 6 : 4;
    if (e.k < vol && e.timer >= e.k * .22) { const A = leadAng(e, 300, 1); for (let i = -1; i <= 1; i++) enemyShoot(e, A + i * .12, 300, 6, '#ffb36a'); e.k++; sfx(460, .05, 'square', .03); }
    if (e.timer > vol * .22 + .4) bossIdle(e);
  }
});
