import { tr } from '../00b-textos.js';
import { defEnemy } from '../01a-registro.js';
import { formaLimo, saltoLimo } from './toxic.js';
defEnemy('mini', {
  orden: 3,
  stats: { hp: 2, r: 8, speed: 115, dmg: 1, spr: 'toxic', s: 1.3 },
  bestiario: { n: tr('Limito'), d: tr('Pequeño y rápido. Persigue sin descanso.') },
  // usa la misma IA que 'slime'
  ia: 'slime',
  forma: formaLimo,
  cuadro: saltoLimo
});
