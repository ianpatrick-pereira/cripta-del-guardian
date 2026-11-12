// Ataque de Elemental de fuego: lanzallamas hacia un lado que gira despacio hacia ti
import { angTo } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { noise, sfx } from '../05-audio.js';
import { subIdle } from '../15-subjefes.js';
import { flameCone } from '../23b-poderes-elementales.js';
defSubMove('lanzallamas', {
  hacer(e, dt, c) {
    const { p, ph2 } = c;
    e.timer += dt;
    // aviso: medio segundo apuntando antes de escupir
    if (e.k === 0) { e.k = 1; e.ca = angTo(e, p); e.tele = .55; sfx(110, .5, 'sawtooth', .04, 60); }
    if (e.timer > .55 && e.timer < 2.4) {
      const want = angTo(e, p); let da = want - e.ca; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      const turn = (ph2 ? 1.2 : .8) * dt; e.ca += Math.max(-turn, Math.min(turn, da));
      flameCone(e, e.ca, ph2 ? 240 : 210, .3, dt);
      if (Math.random() < dt * 6) noise(.14, .03, 700);
    }
    if (e.timer > 2.6) subIdle(e);
  }
});
