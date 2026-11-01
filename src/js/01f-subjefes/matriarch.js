// Subjefe del piso 2: Matriarca del Limo
import { rand } from '../01-utilidades.js';
import { defSub } from '../01a-registro.js';
import { G } from '../07-estado.js';
import { mkEnemy } from '../14-enemigos.js';
defSub('matriarch', {
  piso: 2,
  datos: { name: 'Matriarca del Limo', spr: 'toxic', s: 4.4, r: 26, hp: 290, speed: 62, tint: '#9be05a', minion: 'toxic', want: 120,
           p1: ['hop', 'spit', 'hop'], p2: ['hop', 'spit', 'bighop', 'summon'] },
  // se aplasta y se estira al moverse
  forma(e, f) { const q = Math.sin(e.t * 5) * .1; f.sx = 1 + q; f.sy = 1 - q; },
  // al morir suelta tres limos tóxicos
  alMorir(e) { for (let i = 0; i < 3; i++) G.enemies.push(mkEnemy('toxic', e.x + rand(-20, 20), e.y + rand(-20, 20), 1, false)); }
});
