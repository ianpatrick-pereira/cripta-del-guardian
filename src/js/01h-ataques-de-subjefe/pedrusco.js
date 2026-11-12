// Ataque de Elemental de tierra: lanza un pedrusco que rueda hacia ti y estalla en área
import { angTo } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { shake } from '../09-efectos.js';
import { subIdle } from '../15-subjefes.js';
import { throwBoulder } from '../23b-poderes-elementales.js';
defSubMove('pedrusco', {
  hacer(e, dt, c) {
    const { p, ph2 } = c;
    e.timer += dt;
    if (e.k === 0) { e.k = 1; e.tele = .6; shake(3); }
    if (e.k === 1 && e.timer > .6) { e.k = 2; throwBoulder(e, angTo(e, p), e.dmg); }
    if (ph2 && e.k === 2 && e.timer > 1.3) { e.k = 3; throwBoulder(e, angTo(e, p) + .35, e.dmg); throwBoulder(e, angTo(e, p) - .35, e.dmg); }
    if (e.timer > (ph2 ? 2 : 1.4)) subIdle(e);
  }
});
