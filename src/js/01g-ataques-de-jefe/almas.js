// Ataque del Guardián de la Cripta (v0.64): Espiral de almas.
// De su corona salen almas moradas con calavera (src/sprites/g_alma.png) que giran en espiral hacia afuera.
import { TAU } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { enemyShoot } from '../14-enemigos.js';
import { bossIdle } from '../16-jefes.js';
defBossMove('almas', {
  hacer(e, dt, c) {
    const { ph2 } = c;
    e.timer += dt;
    const brazos = ph2 ? 4 : 3, paso = ph2 ? .075 : .085;
    while (e.k * paso < e.timer && e.timer < 2.4) {
      const base = e.k * .31;
      for (let i = 0; i < brazos; i++) {
        const pr = enemyShoot(e, base + i * TAU / brazos, 150, 7, '#c77dff');
        pr.y -= 30; pr.anim = 'g_alma'; pr.ss = 2.3;   // salen de la corona
      }
      e.k++;
      if (e.k % 4 === 0) sfx(260 + (e.k % 20) * 12, .05, 'triangle', .018);
    }
    if (e.timer > 2.8) bossIdle(e);
  }
});
