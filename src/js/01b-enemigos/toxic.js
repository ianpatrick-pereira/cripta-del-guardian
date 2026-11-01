import { tr } from '../00b-textos.js';
import { rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { G } from '../07-estado.js';
import { mkEnemy } from '../14-enemigos.js';
defEnemy('toxic', {
  orden: 2,
  stats: { hp: 7, r: 13, speed: 80, dmg: 1, spr: 'toxic', s: 2 },
  bestiario: { n: tr('Limo tóxico'), d: tr('Al aterrizar suelta orbes; al morir se divide.') },
  // usa la misma IA que 'slime'
  ia: 'slime',
  forma(e, f) { const q = Math.sin(e.t * 6.4) * .12; f.sx = 1 + q; f.sy = 1 - q; },
  // al morir se divide en dos limitos
  alMorir(e) { for (let i = 0; i < 2; i++) G.enemies.push(mkEnemy('mini', e.x + rand(-10, 10), e.y + rand(-10, 10), 0, false)); }
});
