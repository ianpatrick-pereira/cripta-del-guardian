// Ataque de El Devorador de Luz (v0.65): Ojos Vigías.
// Invoca dos ojos vigías (torretas que flotan y disparan, enemigo «eye») y uno de sus espectros.
import { TAU, rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall } from '../08-colisiones.js';
import { bossIdle } from '../16-jefes.js';
defBossMove('vigias', {
  hacer(e, dt, c) {
    const { B } = c;
    if (e.k === 0) {
      e.k = 1;
      const off = rand(0, TAU);
      ['eye', 'eye', B.minion].forEach((type, i) => {
        const ang = off + i * TAU / 3, x = e.x + Math.cos(ang) * (type === 'eye' ? 120 : 90), y = e.y + Math.sin(ang) * (type === 'eye' ? 120 : 90);
        if (!hitsWall(x, y, 14)) G.markers.push({ x, y, t: .8, type, depth: 3 });
      });
      sfx(240, .4, 'triangle', .04, -150);
    }
    if (e.st_t < -.7) bossIdle(e);
  }
});
