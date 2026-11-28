// Subjefe del piso 2: Matriarca del Limo
import { tr } from '../00b-textos.js';
import { rand } from '../01-utilidades.js';
import { defSub } from '../01a-registro.js';
import { G } from '../07-estado.js';
import { mkEnemy } from '../14-enemigos.js';
import { ANIM } from '../02-pixel-art.js';
defSub('matriarch', {
  piso: 2,
  datos: { name: tr('Matriarca del Limo'), spr: 'matriarch', s: 3.6, r: 26, hp: 290, speed: 62, tint: '#9be05a', minion: 'toxic', want: 120,
           p1: ['hop', 'spit', 'hop'], p2: ['hop', 'spit', 'bighop', 'summon'] },
  // se aplasta y se estira al moverse (con hoja HD lo hacen sus cuadros)
  forma(e, f) { if (ANIM[e.spr]) return; const q = Math.sin(e.t * 5) * .1; f.sx = 1 + q; f.sy = 1 - q; },
  // v0.65: el salto cuadro a cuadro: se aplasta para tomar impulso, se estira al despegar, bola en el aire, cae salpicando
  cuadro(e) {
    const c = ANIM[e.spr].caminar.cuadros;
    if (e.st === 'hop' || e.st === 'bighop' || e.st === 'hop2') {
      if (e.air) return c[e.timer < .12 ? 1 : 2];
      if (e.st === 'hop2' || e.k === 2) return e.timer < (e.st === 'bighop' ? .7 : .9) + .3 ? c[3] : null;
      return c[0];
    }
    return null;
  },
  // al morir suelta tres limos tóxicos
  alMorir(e) { for (let i = 0; i < 3; i++) G.enemies.push(mkEnemy('toxic', e.x + rand(-20, 20), e.y + rand(-20, 20), 1, false)); }
});
