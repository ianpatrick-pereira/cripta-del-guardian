import { tr } from '../00b-textos.js';
import { ANIM, animKey, drawSpr } from '../02-pixel-art.js';
import { TAU, rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall, roomAt } from '../08-colisiones.js';
import { burst } from '../09-efectos.js';
import { leadAng, takeToken, telegraph } from '../14-enemigos.js';
// v0.65: nube de niebla del Espectro al esfumarse y al reaparecer (solo dibujo)
function humoEspectro(x, y) { G.parts.push({ x, y, vx: 0, vy: 0, life: .5, max: .5, fx: 'w_humo', s: 2.4, color: '', size: 0 }); }
defEnemy('wraith', {
  orden: 9,
  stats: { hp: 8, r: 12, speed: 95, dmg: 1, spr: 'wraith', s: 2.3 },
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
          if (!hitsWall(nx, ny, e.r) && roomAt(nx, ny) === G.cur) { burst(e.x, e.y, '#c8dcec', 10, 120); humoEspectro(e.x, e.y - 8); humoEspectro(nx, ny - 8); e.x = nx; e.y = ny; e.alpha = 0; sfx(180, .3, 'sine', .03, 200); break; }
        }
        telegraph(e, .5);
      }
    } else if (e.st === 'tele') {
      e.st_t -= dt;
      if (e.st_t <= 0) { e.st = 'act'; e.st_t = .28; e.ca = leadAng(e, 430, .4); sfx(260, .15, 'sawtooth', .03, -100); }
    } else if (e.st === 'act') {
      e.st_t -= dt; go(e.ca, 430);
      // v0.65: deja una estela de niebla con zarpazos (solo dibujo)
      if ((e.estelaT = (e.estelaT || 0) - dt) <= 0) { e.estelaT = .06; G.parts.push({ x: e.x, y: e.y - 8, vx: 0, vy: 0, life: .35, max: .35, fx: 'w_estela', s: 2.4, rot: e.ca, color: '', size: 0 }); }
      if (e.st_t <= 0) done(.5, rand(2.4, 3.2));
    }
    e.alpha = Math.min(1, e.alpha + dt * 1.5);
  },
  // translúcido y flotando; con hoja HD casi opaco (el dibujo ya trae su niebla)
  forma(e, f) { f.alpha = (ANIM[e.spr] ? .82 + .12 * Math.sin(e.t * 4) : .55 + .2 * Math.sin(e.t * 4)) * e.alpha; f.oy = Math.sin(e.t * 3) * 3 - 6; },
  // v0.65: al embestir, el cuadro de lanzarse
  cuadro(e) { return ANIM[e.spr] && e.st === 'act' ? ANIM[e.spr].caminar.cuadros[3] : null; },
  // aviso antes de embestir: niebla con ojos morados detrás de él
  debajo(e) { if (e.st === 'tele' && ANIM.w_aviso) drawSpr(animKey('w_aviso', 'reposo', e.t), e.x, e.y - 14, 2.6, { alpha: .9, luz: .3 }); }
});
