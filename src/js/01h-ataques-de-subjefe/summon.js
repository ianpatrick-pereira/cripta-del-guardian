// Ataque de subjefe: summon
import { TAU, pick, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall } from '../08-colisiones.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('summon', {
  hacer(e, dt, c) {
    const { S } = c;
    if (e.k === 0) {
      e.k = 1;
      for (let i = 0; i < 2; i++) { const ang = rand(0, TAU), x = e.x + Math.cos(ang) * 80, y = e.y + Math.sin(ang) * 80; if (!hitsWall(x, y, 12)) G.markers.push({ x, y, t: .8, type: Array.isArray(S.minion) ? pick(S.minion) : S.minion, depth: S.el ? 1 : 2, el: S.el }); }
      sfx(240, .4, 'triangle', .04, -150);
    }
    if (e.st_t < -.8) subIdle(e);
  }
});
