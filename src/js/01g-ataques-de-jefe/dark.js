// Ataque de jefe: dark
import { tr } from '../00b-textos.js';
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { showBanner } from '../09-efectos.js';
import { enemyShoot } from '../14-enemigos.js';
import { bossIdle } from '../16-jefes.js';
defBossMove('dark', {
  hacer(e, dt, c) {
    const { a } = c;
    e.timer += dt;
    if (e.k === 0) { G.darkT = 3.5; e.k = 1; showBanner(tr('La luz se apaga'), '#d4474b'); sfx(50, 1.2, 'sine', .08, -20); }
    if (e.k >= 1 && e.k < 5 && e.timer >= e.k * .6) { for (let i = -1; i <= 1; i++) enemyShoot(e, a + i * .25, 230, 6, '#ff5a3a'); e.k++; }
    if (e.timer > 3.2) bossIdle(e);
  }
});
