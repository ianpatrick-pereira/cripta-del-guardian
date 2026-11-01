import { tr } from '../00b-textos.js';
import { TAU, rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall, roomAt } from '../08-colisiones.js';
import { burst } from '../09-efectos.js';
import { leadAng, takeToken, telegraph } from '../14-enemigos.js';
defEnemy('wraith', {
  orden: 9,
  stats: { hp: 8, r: 12, speed: 95, dmg: 1, spr: 'wraith', s: 2 },
  bestiario: { n: tr('Espectro'), d: tr('Se esfuma y reaparece a tu espalda.') },
  esquiva: true,
  // Espectros: se esfuman, reaparecen a tu espalda, avisan y embisten
  ia(e, c) {
    const { dt, cdt, p, hidden, a, hurt, go, done } = c;
    e.cd -= cdt;
    if (e.st === 'walk') {
      go(a, e.speed * (hurt ? -.8 : .7));
      if (!hidden && e.cd <= 0 && takeToken(e)) {
        const back = p.aim + Math.PI, cands = [back, back + .7, back - .7, rand(0, TAU)];
        for (const ang of cands) {
          const nx = p.x + Math.cos(ang) * 95, ny = p.y + Math.sin(ang) * 95;
          if (!hitsWall(nx, ny, e.r) && roomAt(nx, ny) === G.cur) { burst(e.x, e.y, '#c8dcec', 10, 120); e.x = nx; e.y = ny; e.alpha = 0; sfx(180, .3, 'sine', .03, 200); break; }
        }
        telegraph(e, .5);
      }
    } else if (e.st === 'tele') {
      e.st_t -= dt;
      if (e.st_t <= 0) { e.st = 'act'; e.st_t = .28; e.ca = leadAng(e, 430, .4); sfx(260, .15, 'sawtooth', .03, -100); }
    } else if (e.st === 'act') {
      e.st_t -= dt; go(e.ca, 430);
      if (e.st_t <= 0) done(.5, rand(2.4, 3.2));
    }
    e.alpha = Math.min(1, e.alpha + dt * 1.5);
  },
  forma(e, f) { f.alpha = (.55 + .2 * Math.sin(e.t * 4)) * e.alpha; f.oy = Math.sin(e.t * 3) * 3 - 4; }
});
