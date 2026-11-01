// Bumerán
import { tr } from '../00b-textos.js';
import { TAU } from '../01-utilidades.js';
import { defWeapon } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { throwIt, thrownOut } from '../12-armas-con-estilo-propio.js';
defWeapon('boomer', {
  orden: 35,
  datos: { name: tr('Bumerán'), type: 'bow', style: 'boomer', shape: 'boomer', rarity: 'common', dmg: 3, cd: .35, speed: 520, pierce: 99, shots: 1, en: 1, chg: 'boomer', chgEn: 8 },
  familia: 'archer',
  potencia: 1.6,
  estilo: {
    // cobra la energía en ataque() al lanzar, no antes
    cobraAlLanzar: true,
    d: tr('va y vuelve; atrápalo para volver a lanzarlo'),
    esp: { n: tr('Vuelo'), d: tr('+25 % de distancia y vuelve más rápido') },
    el: { fire: tr('Bumerán ígneo'), water: tr('Bumerán de marea'), air: tr('Bumerán ciclón'), earth: tr('Bumerán de roca') },
    // ataque normal
    ataque(p, w, { a, dmg, cost }) {
      if (thrownOut('boomer')) { p.cd = .05; return; }
      if (p.en >= cost) p.en -= cost;
      throwIt(p, w, 'boomer', a, dmg, { main: 'boomer' }); sfx(600, .08, 'triangle', .03, 300);
    },
    // ataque cargado; S = estrellas (la habilidad elemental usa la forma de 5★)
    cargado(p, w, { a, S, dm, col }) {
      const throwN = (n, sp, k) => { for (let i = 0; i < n; i++) throwIt(p, w, 'boomer', a + (i - (n - 1) / 2) * sp, dm(k), { color: col }); };
      if (S === 1) throwN(2, .3, 1.6);
      else if (S === 2) throwN(3, .28, 1.6);
      else if (S === 3) { throwN(2, .3, 1.5); throwIt(p, w, 'boomer', 0, dm(1.4), { orbit: { a: 0, R: 62, t: 2.6 }, color: col }); }
      else if (S === 4) { throwN(3, .28, 1.5); for (let i = 0; i < 2; i++) throwIt(p, w, 'boomer', 0, dm(1.4), { orbit: { a: i * Math.PI, R: 62, t: 3 }, color: col }); }
      else { for (let i = 0; i < 8; i++) throwIt(p, w, 'boomer', a + i * TAU / 8, dm(1.6), { color: col }); for (let i = 0; i < 2; i++) throwIt(p, w, 'boomer', 0, dm(1.5), { orbit: { a: i * Math.PI, R: 70, t: 3.4 }, color: col }); }
      sfx(500, .2, 'triangle', .05, 400);
    }
  }
});
