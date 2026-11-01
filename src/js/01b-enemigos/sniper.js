import { tr } from '../00b-textos.js';
import { ctx } from '../00-inicio.js';
import { rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { enemyShoot, leadAng, takeToken, telegraph } from '../14-enemigos.js';
defEnemy('sniper', {
  orden: 18,
  stats: { hp: 9, r: 12, speed: 85, dmg: 1, spr: 'sniper', s: 2 },
  bestiario: { n: tr('Tirador'), d: tr('Apunta con un láser y dispara una bala muy rápida. Muévete cuando el láser se fije.') },
  sprite: {
    clave: 'sniper',
    mapa: 'archer',
    paleta: { k: '#141019', g: '#2a2a3a', f: '#d8d5bd', t: '#3a3a4a', b: '#6b4a2a', l: '#2a2a3a' }
  },
  esquiva: true,
  // Tirador: se aleja, apunta con un láser (deja de seguirte justo antes) y dispara una bala muy rápida
  ia(e, c) {
    const { dt, cdt, hidden, d, a, go, done } = c;
    e.cd -= cdt;
    if (e.st === 'walk') {
      const want = 330;
      go(d < want - 60 ? a + Math.PI + .3 : d > want + 80 ? a : a + Math.PI / 2, e.speed);
      if (!hidden && e.cd <= 0 && e.los && takeToken(e)) { telegraph(e, 1.1); e.aiming = true; }
    } else if (e.st === 'tele') {
      e.st_t -= dt; if (e.st_t > .28) e.aimA = leadAng(e, 620, .6);
      if (e.st_t <= 0) { e.aiming = false; enemyShoot(e, e.aimA, 620, 6, '#ff5a5a', e.dmg + (e.elite ? 1 : 0)); sfx(1200, .08, 'square', .04, -900); done(.5, rand(2.2, 3)); }
    }
  },
  debajo(e, la) { if (e.aiming && e.aimA !== undefined) { ctx.strokeStyle = e.st_t < .28 ? 'rgba(255,60,60,.9)' : 'rgba(255,90,90,.45)'; ctx.lineWidth = e.st_t < .28 ? 2.5 : 1.2; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(e.aimA) * 700, e.y + Math.sin(e.aimA) * 700); ctx.stroke(); } }
});
