import { tr } from '../00b-textos.js';
import { dist, rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { burst } from '../09-efectos.js';
import { enemyShoot, leadAng, takeToken, telegraph } from '../14-enemigos.js';
defEnemy('priest', {
  orden: 16,
  stats: { hp: 14, r: 12, speed: 72, dmg: 1, spr: 'priest', s: 2.2 },
  bestiario: { n: tr('Sacerdote hueco'), d: tr('Da escudos y cura a sus aliados. Mátalo primero.') },
  sprite: {
    clave: 'priest',
    mapa: 'mage',
    paleta: { k: '#140a0a', p: '#d8d0b8', g: '#ffd27a', b: '#c77dff' }
  },
  // Sacerdote: se queda atrás y protege a sus aliados con escudos; si te acercas, huye
  ia(e, c) {
    const { dt, cdt, hidden, d, a, go, done } = c;
    e.cd -= cdt; e.shootT -= cdt;
    if (e.st === 'walk') {
      const want = 260;
      go(d < want - 60 ? a + Math.PI + .4 : d > want + 80 ? a : a + Math.PI / 2, e.speed);
      if (!hidden && e.cd <= 0 && takeToken(e)) telegraph(e, .8);
      else if (!hidden && e.shootT <= 0 && e.los) { for (let i = -1; i <= 1; i++) enemyShoot(e, leadAng(e, 200) + i * .25, 200, 6, '#ffd27a'); e.shootT = rand(2, 3); sfx(600, .06, 'sine', .02); }
    } else if (e.st === 'tele') {
      e.st_t -= dt;
      if (e.st_t <= 0) {
        for (const o of G.enemies) if (!o.dead && o !== e && !o.isBoss && dist(o, e) < 240) { o.shield = Math.max(o.shield || 0, Math.round(o.max * .35)); o.hp = Math.min(o.max, o.hp + Math.round(o.max * .15)); burst(o.x, o.y, '#9bd8ff', 6, 90); }
        G.parts.push({ x: e.x, y: e.y, vx: 0, vy: 0, life: .5, max: .5, color: 'rgba(155,216,255,.25)', size: 120 });
        sfx(900, .3, 'sine', .04, 300); done(.3, rand(4.5, 5.5));
      }
    }
  }
});
