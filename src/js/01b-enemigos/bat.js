import { tr } from '../00b-textos.js';
import { angTo, rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { leadAng, takeToken, telegraph } from '../14-enemigos.js';
defEnemy('bat', {
  orden: 4,
  stats: { hp: 3, r: 10, speed: 150, dmg: 1, spr: 'bat', s: 2 },
  bestiario: { n: tr('Murciélago'), d: tr('Te rodea en círculo y se lanza en picada.') },
  esquiva: true,
  // Murciélagos: te rodean en círculo, se detienen un instante (aviso) y se lanzan en picada
  ia(e, c) {
    const { dt, cdt, hidden, tgt, d, hurt, go, done } = c;
    e.cd -= cdt; if (!e.dir) e.dir = Math.random() < .5 ? 1 : -1;
    if (e.st === 'walk') {
      e.orb = (e.orb ?? angTo(tgt, e)) + dt * 1.7 * e.dir;
      const R = hurt ? 190 : 120, tx = tgt.x + Math.cos(e.orb) * R, ty = tgt.y + Math.sin(e.orb) * R;
      go(Math.atan2(ty - e.y, tx - e.x) + Math.sin(e.t * 9) * .4, e.speed);
      if (!hidden && !hurt && e.cd <= 0 && d < 230 && takeToken(e)) telegraph(e, .38);
    } else if (e.st === 'tele') {
      e.st_t -= dt; go(e.t * 20, 30);
      if (e.st_t <= 0) { e.st = 'act'; e.st_t = .42; e.ca = leadAng(e, 360); sfx(900, .06, 'square', .02, -400); }
    } else if (e.st === 'act') {
      e.st_t -= dt; go(e.ca, 360);
      if (e.st_t <= 0) { e.dir = -e.dir; done(0, rand(1.3, 2.1)); }
    }
  },
  forma(e, f) { f.sy = .7 + .3 * Math.abs(Math.sin(e.t * 22)); f.oy = -6; }
});
