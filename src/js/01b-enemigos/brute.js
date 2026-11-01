import { tr } from '../00b-textos.js';
import { ctx } from '../00-inicio.js';
import { angTo, rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { moveEnt, pushOutProps } from '../08-colisiones.js';
import { burst, damageProp, shake } from '../09-efectos.js';
import { flankPoint, hazard, leadAng, takeToken } from '../14-enemigos.js';
defEnemy('brute', {
  orden: 6,
  stats: { hp: 15, r: 17, speed: 58, dmg: 2, spr: 'brute', s: 2.6 },
  bestiario: { n: tr('Bruto'), d: tr('Embiste de lejos; de cerca golpea el suelo.') },
  sprite: {
    clave: 'brute',
    mapa: ['.h..........h.', '.hh.kkkkkk.hh.', '..hkrrrrrrkh..', '..krrrrrrrrk..', '..kreerreerk..', '..krrrrrrrrk..', '..krrkkkkrrk..',
      '.kkrrrrrrrrkk.', 'krrrrrrrrrrrrk', 'krrkrrrrrrkrrk', 'krk.kddddk.krk', '...kddddddk...', '...krrk.krrk..', '...kkk..kkk...'],
    paleta: { k: '#2a0f0c', h: '#e8dcc0', r: '#c96a48', e: '#1b1822', d: '#4a3020' }
  },
  // Brutos: si estás lejos embisten; si estás cerca golpean el suelo (círculo rojo = sal de ahí)
  ia(e, c) {
    const { dt, cdt, hidden, tgt, d, go, done } = c;
    e.cd -= cdt;
    if (e.st === 'walk') {
      go(angTo(e, flankPoint(e, tgt, d)), e.speed);
      if (!hidden && e.cd <= 0 && takeToken(e)) {
        if (d < 95) { e.st = 'slam'; e.st_t = .6; e.tele = .6; hazard(e.x, e.y, 82, .6, e.elite ? 2 : 1, '#d4474b', { ring: G.floor >= 2 ? 8 : 0, owner: e }); }
        else if (d < 260) { e.st = 'wind'; e.st_t = .6; e.tele = .6; e.reps = e.elite ? 2 : 1; e.ca = leadAng(e, 400, .5); }
        else e.tok = false;
      }
    } else if (e.st === 'slam') {
      e.st_t -= dt;
      if (e.st_t <= 0) { shake(6); done(.55, rand(1.8, 2.6)); }
    } else if (e.st === 'wind') {
      e.st_t -= dt; if (e.st_t > .2) e.ca = leadAng(e, 400, .5);
      if (e.st_t <= 0) { e.st = 'charge'; e.st_t = .55; sfx(90, .2, 'sawtooth', .04); }
    } else if (e.st === 'charge') {
      e.st_t -= dt;
      if (moveEnt(e, Math.cos(e.ca) * 400 * dt, Math.sin(e.ca) * 400 * dt)) { e.st_t = 0; shake(5); burst(e.x, e.y, '#7a6f8a', 8); }
      const o = pushOutProps(e); if (o && o.kind !== 'merchant') damageProp(o, 99);
      if (e.st_t <= 0) {
        if (--e.reps > 0) { e.st = 'wind'; e.st_t = .35; e.tele = .35; }
        else { e.st = 'stun'; e.st_t = .6; e.cd = 2.4; e.tok = false; }
      }
    } else if (e.st === 'stun') { e.st_t -= dt; if (e.st_t <= 0) e.st = 'walk'; }
  },
  forma(e, f) { if (e.st === 'wind' && Math.floor(G.time * 16) % 2 === 0) f.sx = f.sy = 1.08; },
  encima(e, la, white) { if (e.st === 'wind') { ctx.globalAlpha = .25; ctx.strokeStyle = '#d4474b'; ctx.lineWidth = e.r * 2; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(e.ca) * 140, e.y + Math.sin(e.ca) * 140); ctx.stroke(); ctx.globalAlpha = 1; } }
});
