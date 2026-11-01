import { tr } from '../00b-textos.js';
import { ctx } from '../00-inicio.js';
import { TAU, rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { D } from '../03-datos-del-juego.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hazard, takeToken, telegraph } from '../14-enemigos.js';
defEnemy('bomber', {
  orden: 12,
  stats: { hp: 10, r: 12, speed: 80, dmg: 1, spr: 'bomber', s: 2 },
  bestiario: { n: tr('Artificiero'), d: tr('Guarda distancia y lanza bombas; el círculo naranja marca dónde caen.') },
  esquiva: true,
  // Artificiero: guarda distancia y lanza bombas en arco; el círculo marca dónde caen
  ia(e, c) {
    const { dt, cdt, p, hidden, d, a, go, done } = c;
    e.cd -= cdt;
    if (e.st === 'walk') {
      const want = 230;
      go(d < want - 50 ? a + Math.PI + .5 : d > want + 70 ? a : a + Math.PI / 2 * (e.wob > Math.PI ? 1 : -1), e.speed);
      if (!hidden && e.cd <= 0 && d < 420 && takeToken(e)) telegraph(e, .5);
    } else if (e.st === 'tele') {
      e.st_t -= dt;
      if (e.st_t <= 0) {
        const n = e.elite ? 3 : 1;
        for (let i = 0; i < n; i++) { const t = .9, tx = p.x + G.pv.x * t * D().lead + (i ? rand(-70, 70) : 0), ty = p.y + G.pv.y * t * D().lead + (i ? rand(-70, 70) : 0); hazard(tx, ty, 46, .95, e.dmg, '#ff8a3a', { ring: G.floor >= 6 ? 6 : 0, owner: e }); }
        sfx(300, .15, 'triangle', .04, -150); done(.4, rand(2, 2.8));
      }
    }
  },
  encima(e, la, white) { if (e.st === 'tele') { ctx.fillStyle = '#2a2433'; ctx.beginPath(); ctx.arc(e.x, e.y - e.r - 8, 6, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff8a3a'; ctx.fillRect(e.x - 1, e.y - e.r - 18, 2, 5); } }
});
