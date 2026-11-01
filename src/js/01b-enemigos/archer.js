import { ctx } from '../00-inicio.js';
import { angTo, rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { later } from '../09-efectos.js';
import { blinkAway, enemyShoot, flankPoint, hazard, leadAng, takeToken, telegraph } from '../14-enemigos.js';
import { drawWeapon } from '../38-armadura-visual.js';
defEnemy('archer', {
  orden: 5,
  stats: { hp: 6, r: 12, speed: 85, dmg: 1, spr: 'skel', s: 2 },
  bestiario: { n: 'Esqueleto arquero', d: 'Busca línea de tiro y alterna disparo simple y abanico.' },
  sprite: {
    clave: 'skel',
    mapa: ['...kkkkkk...', '..kbbbbbbk..', '.kbbbbbbbbk.', '.kbeebbeebk.', '.kbbbkkbbbk.', '..kbbbbbbk..', '...kbkbkk...',
      '....kbbk....', '..kkbbbbkk..', '.kb.kbbk.bk.', '...kbbbbk...', '...kb..bk...', '...kb..bk...', '...kk..kk...'],
    paleta: { k: '#2a2433', b: '#ddd5bd', e: '#2a2433' }
  },
  esquiva: true,
  // Arqueros: buscan línea de tiro, mantienen distancia, apuntan anticipando y alternan disparo simple y abanico
  ia(e, c) {
    const { dt, cdt, p, hidden, d, a, hurt, go, done } = c;
    const mage = e.type === 'mage', want = (mage ? 210 : 230) + (hurt ? 90 : 0);
    if (mage) e.blinkCd = (e.blinkCd || 0) - dt;
    if (e.st === 'walk') {
      if (!e.dir) e.dir = Math.random() < .5 ? 1 : -1;
      if (Math.random() < dt * .4) e.dir = -e.dir;
      const side = a + Math.PI / 2 * e.dir;
      if (!e.los && !hidden) go(angTo(e, flankPoint(e, p, d)) * .5 + side * .5, e.speed);
      else if (d < want - 70) {
        if (mage && d < 95 && e.blinkCd <= 0 && blinkAway(e, 200)) e.blinkCd = 4;
        else go(a + Math.PI + Math.sin(e.t * 2) * .5, e.speed * 1.1);
      } else if (d > want + 90) go(a, e.speed);
      else go(side, e.speed * .65);
      e.shootT -= cdt;
      if (e.shootT <= 0 && e.los && !hidden && d < 420 && takeToken(e)) { telegraph(e, mage ? .55 : .5); e.pat = (e.pat || 0) + 1; }
    } else if (e.st === 'tele') {
      e.st_t -= dt; c.vx = c.vy = 0; e.aiming = true;
      e.aimA = leadAng(e, mage ? 170 : 260);
      if (e.st_t <= 0) {
        e.aiming = false;
        const A = e.aimA;
        if (!mage) {
          if (e.pat % 3 === 0) { const n = e.elite ? 5 : 3; for (let i = 0; i < n; i++) enemyShoot(e, A + (i - (n - 1) / 2) * .22, 240, 5, '#f0e6c8'); }
          else {
            enemyShoot(e, A, 260, 5, '#f0e6c8');
            if (e.elite) for (let k = 1; k <= 2; k++) later(k * .13, () => { if (!e.dead) enemyShoot(e, leadAng(e, 260), 260, 5, '#f0e6c8'); });
          }
          sfx(500, .05, 'triangle', .02, -200);
          e.shootT = rand(1.5, 2.2);
        } else {
          const m = e.pat % 3;
          if (m === 1) {
            // runa: círculos que estallan bajo tus pies y donde vas a pisar
            hazard(p.x, p.y, 40, .9, 1, '#9bff7a');
            const t = .7; hazard(p.x + G.pv.x * t, p.y + G.pv.y * t, 40, 1.1, 1, '#9bff7a');
            if (e.elite) hazard(p.x - G.pv.x * t, p.y - G.pv.y * t, 40, 1.3, 1, '#9bff7a');
          } else if (m === 2 && G.enemies.length < 8) {
            G.markers.push({ x: e.x + rand(-40, 40), y: e.y + rand(-40, 40), t: .8, type: G.fi === 1 ? 'toxic' : 'bat', depth: 1 });
          } else for (let i = -1; i <= 1; i++) enemyShoot(e, A + i * .3, 160, 6, '#9bff7a');
          sfx(330, .12, 'sine', .03, 200);
          e.shootT = rand(2, 2.7);
        }
        done(0, 0);
      }
    }
  },
  encima(e, la, white) {
      drawWeapon({ type: 'bow', rarity: 'common', id: 'short' }, e.x, e.y, la, .8);
      if (e.aiming) { const aa = e.aimA ?? la; ctx.strokeStyle = 'rgba(255,90,90,.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(aa) * 230, e.y + Math.sin(aa) * 230); ctx.stroke(); ctx.setLineDash([]); }
  }
});
