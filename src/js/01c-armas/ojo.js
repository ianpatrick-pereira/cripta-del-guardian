// Ojo del abismo (Nigromante, v0.69): rayo continuo que pega más cuanto más tiempo lo mantienes
import { tr } from '../00b-textos.js';
import { rand } from '../01-utilidades.js';
import { defWeapon } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { shake } from '../09-efectos.js';
import { beamHit, beamLen, espLv } from '../12-armas-con-estilo-propio.js';
defWeapon('ojo', {
  orden: 53,
  datos: { name: tr('Ojo del abismo'), type: 'staff', style: 'ojo', shape: 'rod', gem: '#a050ff', rarity: 'epic', dmg: 2, cd: .2, speed: 0, pierce: 0, shots: 1, en: 1, chg: 'ray', chgEn: 25 },
  familia: 'necro',
  potencia: 1.05,
  estilo: {
    d: tr('rayo continuo que gasta energía; pega hasta el doble si lo mantienes 2 s'),
    esp: { n: tr('Mirada fija'), d: tr('+15 % de alcance y un rayo más ancho') },
    el: { fire: tr('Ojo del sol negro'), water: tr('Ojo abisal'), air: tr('Ojo de la tormenta'), earth: tr('Ojo de obsidiana') },
    ataque(p, w, { a, dmg }) {
      // mientras sigues disparando sin parar, el rayo se calienta: hasta ×2 en 2 s
      p.ojoK = G.time - (p.ojoT || 0) < .35 ? Math.min(1, (p.ojoK || 0) + w.cd / 2) : 0; p.ojoT = G.time;
      const len = beamLen(p, a, 320 * (1 + .15 * espLv(w))), wd = 10 + 3 * espLv(w) + 6 * p.ojoK;
      beamHit(p, w, a, len, wd, Math.max(1, Math.round(dmg * (1 + p.ojoK))));
      p.beamVis = { a, len, t: w.cd + .06, wd };
      if (Math.random() < .3) sfx(500 + 400 * p.ojoK + rand(0, 100), .05, 'sine', .015);
    },
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
