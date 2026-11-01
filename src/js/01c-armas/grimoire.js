// Grimorio de huesos
import { rand } from '../01-utilidades.js';
import { defWeapon } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { shootPlayer } from '../11-jugador.js';
import { maxBones, summonBones } from '../12-armas-con-estilo-propio.js';
defWeapon('grimoire', {
  orden: 40,
  datos: { name: 'Grimorio de huesos', type: 'staff', style: 'grimoire', shape: 'book', gem: '#d8d0b8', rarity: 'epic', dmg: 4, cd: 1.1, speed: 420, pierce: 0, shots: 1, en: 7, chg: 'legion', chgEn: 25 },
  // sin familia: neutral para todas las clases
  familia: null,
  potencia: .4,
  estilo: {
    d: 'invoca esqueletos aliados por unos segundos',
    esp: { n: 'Osario', d: 'los esqueletos duran 2 s más y pegan un 15 % más' },
    el: { fire: 'Legión ardiente', water: 'Legión ahogada', air: 'Legión espectral', earth: 'Legión de piedra' },
    // ataque normal
    ataque(p, w, { a, dmg }) {
      if ((G.allies || []).filter(A => !A.merc).length < maxBones(w)) summonBones(p, w);
      else { for (let i = -1; i <= 1; i++) shootPlayer(p, w, a + i * .16, Math.max(1, Math.round(dmg * .6)), { kind: 'arrow', color: '#e8e0c8', r: 4, life: .9 }); sfx(700, .06, 'triangle', .03, -200); }
    },
    // ataque cargado; S = estrellas (la habilidad elemental usa la forma de 5★)
    cargado(p, w, { S, dm }) {
      const n = [3, 4, 0, 6, 4][S - 1];
      for (let i = 0; i < n; i++) summonBones(p, w, false, dm(1));
      if (S === 3 || S === 5) summonBones(p, w, true, dm(2.5));
      for (let i = 0; i < 14; i++) G.parts.push({ x: p.x + rand(-30, 30), y: p.y + rand(-10, 20), vx: 0, vy: -60, life: .7, max: .7, color: '#9be0a0', size: 4 });
      sfx(150, .5, 'triangle', .05, -60);
    }
  }
});
