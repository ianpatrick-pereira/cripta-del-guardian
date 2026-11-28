// Ataque de subjefe: summon
import { TAU, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall } from '../08-colisiones.js';
import { subIdle, subMinion } from '../15-subjefes.js';
defSubMove('summon', {
  hacer(e, dt, c) {
    const { S } = c;
    if (e.k === 0) {
      e.k = 1;
      for (let i = 0; i < 2; i++) { const ang = rand(0, TAU), x = e.x + Math.cos(ang) * 80, y = e.y + Math.sin(ang) * 80; if (!hitsWall(x, y, 12)) { G.markers.push({ x, y, t: .8, type: subMinion(S), depth: S.el ? 1 : 2, el: S.el }); if (S.efectos && S.efectos.circulo) G.parts.push({ x, y, vx: 0, vy: 0, life: 1.2, max: 1.2, fx: S.efectos.circulo, pre: .8, s: 3, color: '', size: 0 }); } }
      sfx(240, .4, 'triangle', .04, -150);
    }
    if (e.st_t < -.8) subIdle(e);
  }
});
