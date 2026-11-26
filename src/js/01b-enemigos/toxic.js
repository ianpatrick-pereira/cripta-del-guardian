import { tr } from '../00b-textos.js';
import { rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { G } from '../07-estado.js';
import { mkEnemy } from '../14-enemigos.js';
import { ANIM } from '../02-pixel-art.js';
// v0.65: con hoja HD los saltitos van cuadro a cuadro (fila «caminar»: se aplasta, se estira, en el aire, cae),
// al mismo ritmo que el impulso de su IA (|sin(t·3,2)|, ver slime.js). Antes de saltar se encoge y salta por el aire.
function saltoLimo(e, anda) {
  const A = ANIM[e.spr]; if (!A) return null;
  const c = A.caminar.cuadros;
  if (e.st === 'tele') return c[0];
  if (e.st === 'act') return c[e.st_t > .22 ? 1 : 2];
  if (!anda) return null;
  const f = ((e.t * 3.2) % Math.PI) / Math.PI;   // 0→1 en cada saltito
  return c[f < .18 ? 0 : f < .4 ? 1 : f < .78 ? 2 : 3];
}
// sin hoja, el dibujo se aplasta y estira por código; con hoja ya lo hacen sus cuadros
function formaLimo(e, f) { if (ANIM[e.spr]) return; const q = Math.sin(e.t * 6.4) * .12; f.sx = 1 + q; f.sy = 1 - q; }
defEnemy('toxic', {
  orden: 2,
  stats: { hp: 7, r: 13, speed: 80, dmg: 1, spr: 'toxic', s: 2 },
  bestiario: { n: tr('Limo tóxico'), d: tr('Al aterrizar suelta orbes; al morir se divide.') },
  // usa la misma IA que 'slime'
  ia: 'slime',
  forma: formaLimo,
  cuadro: saltoLimo,
  // al morir se divide en dos limitos
  alMorir(e) { for (let i = 0; i < 2; i++) G.enemies.push(mkEnemy('mini', e.x + rand(-10, 10), e.y + rand(-10, 10), 0, false)); }
});
export { formaLimo, saltoLimo };
