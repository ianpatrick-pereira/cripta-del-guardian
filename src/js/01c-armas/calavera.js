// Calavera aullante (Nigromante, v0.69): calavera teledirigida que explota en llamas
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { shootPlayer } from '../11-jugador.js';
import { espLv } from '../12-armas-con-estilo-propio.js';
import { almaVuela } from '../37g-baculo-hd.js';
defWeapon('calavera', {
  orden: 52,
  datos: { name: tr('Calavera aullante'), type: 'staff', style: 'calavera', shape: 'book', gem: '#ff8a3a', rarity: 'rare', dmg: 6, cd: .75, speed: 260, pierce: 0, shots: 1, en: 5, chg: 'calavera', chgEn: 22 },
  familia: 'necro',
  potencia: .55,
  estilo: {
    d: tr('una calavera persigue al enemigo más cercano y explota en llamas'),
    esp: { n: tr('Aullido'), d: tr('+15 % de radio de la explosión por nivel') },
    el: { fire: tr('Calavera infernal'), water: tr('Calavera ahogada'), air: tr('Calavera chillona'), earth: tr('Calavera de piedra') },
    ataque(p, w, { a, dmg }) {
      shootPlayer(p, w, a, dmg, { fx: 'homing', boom: Math.round(50 * (1 + .15 * espLv(w))), quema: true, r: 7, life: 2.4, color: '#ff8a3a', ...almaVuela(w) });
      sfx(180, .2, 'sawtooth', .03, 120);
    },
    // cargado: una calavera grande que deja a todos ardiendo; más calaveras con las estrellas
    cargado(p, w, { a, S, dm }) {
      const R = Math.round(90 * (1 + .15 * espLv(w)));
      shootPlayer(p, w, a, dm(3), { fx: 'homing', boom: R, quema: true, r: 13, life: 3, color: '#ff6a3a', vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, ...almaVuela(w, true) });
      if (S >= 3) for (const k of [-1, 1]) shootPlayer(p, w, a + k * .6, dm(1.5), { fx: 'homing', boom: 55, quema: true, r: 8, life: 3, color: '#ff8a3a', ...almaVuela(w) });
      if (S === 5) for (const k of [-1, 1]) shootPlayer(p, w, a + Math.PI + k * .5, dm(1.5), { fx: 'homing', boom: 55, quema: true, r: 8, life: 3, color: '#ff8a3a', ...almaVuela(w) });
      sfx(120, .5, 'sawtooth', .05, 200);
    }
  }
});
