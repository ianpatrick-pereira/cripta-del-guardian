import { tr } from '../00b-textos.js';
import { TAU, angTo, rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { enemyShoot, flankPoint, mkEnemy, takeToken } from '../14-enemigos.js';
defEnemy('splitter', {
  orden: 14,
  stats: { hp: 16, r: 17, speed: 62, dmg: 1, spr: 'splitter', s: 2.9 },
  bestiario: { n: tr('Limo madre'), d: tr('Suelta anillos de ácido y al morir se parte en limos.') },
  sprite: {
    clave: 'splitter',
    mapa: 'slime',
    paleta: { k: '#2a1030', g: '#c06ad8', h: '#f0c8ff', e: '#2a1030' }
  },
  // Limo madre: lento y grande; al morir se parte en limos
  ia(e, c) {
    const { cdt, hidden, tgt, d, go } = c;
    e.cd -= cdt;
    const pulse = .4 + .6 * Math.abs(Math.sin(e.t * 2.4));
    go(angTo(e, flankPoint(e, tgt, d)), e.speed * pulse);
    if (!hidden && e.cd <= 0 && d < 200 && takeToken(e)) { const n = e.elite ? 10 : 7, off = rand(0, TAU); for (let i = 0; i < n; i++) enemyShoot(e, off + i * TAU / n, 120, 6, '#c06ad8'); e.cd = rand(2.4, 3.2); e.tok = false; sfx(200, .1, 'sine', .03, 150); }
  },
  forma(e, f) { const q = Math.sin(e.t * 4) * .1; f.sx = 1 + q; f.sy = 1 - q; },
  // al morir se parte en limos
  alMorir(e) { for (let i = 0; i < (e.elite ? 4 : 3); i++) G.enemies.push(mkEnemy('slime', e.x + rand(-14, 14), e.y + rand(-14, 14), 1, false)); }
});
