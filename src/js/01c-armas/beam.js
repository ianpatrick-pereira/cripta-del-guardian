// Rayo sostenido
import { rand } from '../01-utilidades.js';
import { defWeapon } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { shake } from '../09-efectos.js';
import { beamHit, beamLen, espLv } from '../12-armas-con-estilo-propio.js';
defWeapon('beam', {
  orden: 41,
  datos: { name: 'Rayo sostenido', type: 'staff', style: 'beam', shape: 'rod', gem: '#ff6ad8', rarity: 'epic', dmg: 2, cd: .2, speed: 0, pierce: 0, shots: 1, en: 1, chg: 'ray', chgEn: 25 },
  // sin familia: neutral para todas las clases
  familia: null,
  potencia: 1.2,
  estilo: {
    d: 'haz continuo que gasta energía mientras lo mantienes',
    esp: { n: 'Lente', d: '+15 % de alcance y un haz más ancho' },
    el: { fire: 'Rayo solar', water: 'Rayo abisal', air: 'Rayo de tormenta', earth: 'Rayo telúrico' },
    // ataque normal
    ataque(p, w, { a, dmg }) {
      const len = beamLen(p, a, 320 * (1 + .15 * espLv(w))), wd = 10 + 3 * espLv(w);
      beamHit(p, w, a, len, wd, dmg);
      p.beamVis = { a, len, t: w.cd + .06, wd };
      if (Math.random() < .3) sfx(900 + rand(0, 200), .05, 'sine', .015);
    },
    // ataque cargado; S = estrellas (la habilidad elemental usa la forma de 5★)
    cargado(p, w, { a, S, col }) {
      if (!G.pbeams) G.pbeams = [];
      const B = (an, o) => G.pbeams.push(Object.assign({ a: an, t: 1, max: 1, wd: 16, k: 1.6, rot: 0, tick: 0, len: 340, col, w }, o));
      if (S === 1) B(a, {});
      else if (S === 2) { B(a - .22, {}); B(a + .22, {}); }
      else if (S === 3) for (let i = -2; i <= 2; i++) B(a + i * .2, { wd: 12, k: 1.3 });
      else if (S === 4) B(a, { t: 1.3, max: 1.3, rot: 5.2, len: 300 });
      else B(a, { t: 1.6, max: 1.6, wd: 34, k: 3, len: 520, thru: true });
      shake(4); sfx(240, .6, 'sawtooth', .04, 600);
    }
  }
});
