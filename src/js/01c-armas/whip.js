// Látigo de cadenas
import { TAU } from '../01-utilidades.js';
import { defWeapon } from '../01a-registro.js';
import { G } from '../07-estado.js';
import { later } from '../09-efectos.js';
import { espLv, whipCircle, whipLash } from '../12-armas-con-estilo-propio.js';
defWeapon('whip', {
  orden: 36,
  datos: { name: 'Látigo de cadenas', type: 'melee', style: 'whip', shape: 'whip', rarity: 'uncommon', dmg: 4, cd: .5, range: 130, arc: .4, en: 1, chg: 'lash', chgEn: 12 },
  familia: 'rogue',
  potencia: .9,
  estilo: {
    d: 'golpe largo en línea; atrae a enemigos pequeños',
    esp: { n: 'Cadena larga', d: '+20 % de alcance del látigo' },
    el: { fire: 'Látigo de brasas', water: 'Látigo de corriente', air: 'Látigo de tormenta', earth: 'Cadena sísmica' },
    // ataque normal
    ataque(p, w, { a, dmg }) {
      whipLash(p, w, a, w.range * (1 + .2 * espLv(w)), dmg, true);
    },
    // ataque cargado; S = estrellas (la habilidad elemental usa la forma de 5★)
    cargado(p, w, { S, dm, col }) {
      whipCircle(p, w, dm(2), S >= 3);
      if (S >= 2) later(.25, () => whipCircle(p, w, dm(1.6), S >= 3));
      if (S === 5) later(.5, () => whipCircle(p, w, dm(1.6), true));
      if (S >= 4) later(.15, () => { for (let i = 0; i < (S === 5 ? 14 : 10); i++) { const an = i * TAU / (S === 5 ? 14 : 10); G.proj.push({ x: p.x, y: p.y, vx: Math.cos(an) * 380, vy: Math.sin(an) * 380, r: 7, dmg: dm(1), owner: 'player', kind: 'wave', pierce: 2, hit: new Set(), life: .55, color: col, src: w }); } });
    }
  }
});
