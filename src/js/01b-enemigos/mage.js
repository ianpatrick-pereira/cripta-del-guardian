import { tr } from '../00b-textos.js';
import { ctx } from '../00-inicio.js';
import { TAU } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
defEnemy('mage', {
  orden: 8,
  stats: { hp: 8, r: 12, speed: 70, dmg: 1, spr: 'mage', s: 2 },
  bestiario: { n: tr('Mago'), d: tr('Se teletransporta si te acercas y lanza runas bajo tus pies.') },
  esquiva: true,
  // usa la misma IA que 'archer'
  ia: 'archer',
  encima(e, la, white) { ctx.fillStyle = e.aiming ? '#ffffff' : '#9bff7a'; ctx.beginPath(); ctx.arc(e.x + (Math.cos(la) < 0 ? -13 : 13), e.y - 6 + Math.sin(e.t * 4) * 2, e.aiming ? 5 : 3.5, 0, TAU); ctx.fill(); }
});
