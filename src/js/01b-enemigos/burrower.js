import { tr } from '../00b-textos.js';
import { TAU, rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { burst, shake } from '../09-efectos.js';
import { enemyShoot, hazard, takeToken } from '../14-enemigos.js';
defEnemy('burrower', {
  orden: 15,
  stats: { hp: 14, r: 13, speed: 90, dmg: 1, spr: 'burrower', s: 2.2 },
  bestiario: { n: tr('Excavador'), d: tr('Se hunde, viaja bajo tus pies y emerge con un anillo de púas.') },
  sprite: {
    clave: 'burrower',
    mapa: 'spider',
    paleta: { k: '#1a120a', s: '#6a4a2a', r: '#ffb03a', l: '#8a6a48' }
  },
  // Excavador: se hunde (invulnerable), viaja bajo tus pies y emerge con un anillo de púas
  ia(e, c) {
    const { dt, cdt, hidden, d, a, go, done } = c;
    e.cd -= cdt;
    if (e.st === 'walk') {
      e.air = false; e.alpha = Math.min(1, (e.alpha || 0) + dt * 3);
      go(a + Math.PI / 2, e.speed * .6);
      if (!hidden && e.cd <= 0 && takeToken(e)) { e.st = 'dig'; e.st_t = 1.3; e.air = true; burst(e.x, e.y, '#8a6a48', 12, 140); sfx(80, .3, 'sawtooth', .03); }
    } else if (e.st === 'dig') {
      e.st_t -= dt; e.alpha = .15; go(a, 170);
      if (Math.random() < dt * 25) G.parts.push({ x: e.x + rand(-8, 8), y: e.y + rand(-4, 4), vx: rand(-30, 30), vy: -40, life: .4, max: .4, color: '#6a4a2a', size: 4 });
      if (e.st_t <= 0 || d < 30) { e.st = 'rise'; e.st_t = .55; e.tele = .55; hazard(e.x, e.y, 54, .55, e.dmg, '#ffb03a', { owner: e }); }
    } else if (e.st === 'rise') {
      e.st_t -= dt;
      if (e.st_t <= 0) { e.air = false; e.alpha = 1; const n = e.elite ? 14 : 10; for (let i = 0; i < n; i++) enemyShoot(e, i * TAU / n, 160, 5, '#ffb03a'); shake(4); done(.6, rand(2.2, 3)); }
    }
  },
  forma(e, f) { f.alpha = e.alpha ?? 1; }
});
