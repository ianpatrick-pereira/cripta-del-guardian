// Ataque de Elemental de agua: bolas de agua en ráfagas; donde caen dejan charcos
import { angTo, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { enemyShoot } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
import { addPuddle } from '../23b-poderes-elementales.js';
defSubMove('burbujas', {
  hacer(e, dt, c) {
    const { p, S, ph2 } = c;
    e.timer += dt;
    const n = ph2 ? 4 : 3;
    if (e.timer > .45 && e.k < n && e.timer >= .45 + e.k * .45) {
      const A = angTo(e, p);
      for (let i = -2; i <= 2; i++) enemyShoot(e, A + i * .14 + rand(-.03, .03), 210 + 15 * Math.abs(i), 8, S.pc);
      addPuddle(p.x + rand(-40, 40), p.y + rand(-40, 40), 38, 5);
      e.k++; sfx(420, .15, 'sine', .04, -260);
    }
    if (e.timer > .55 + n * .45) subIdle(e);
  }
});
