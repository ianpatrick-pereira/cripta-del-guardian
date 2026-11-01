// Escudo de púas
import { TAU } from '../01-utilidades.js';
import { defWeapon } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { later } from '../09-efectos.js';
import { meleeHit } from '../11-jugador.js';
import { shieldBash } from '../12-armas-con-estilo-propio.js';
defWeapon('spiked', {
  orden: 37,
  datos: { name: 'Escudo de púas', type: 'melee', style: 'shield', shape: 'shield', rarity: 'uncommon', dmg: 3, cd: .42, range: 48, arc: 1.6, en: 1, chg: 'bash', chgEn: 12 },
  familia: 'knight',
  potencia: .85,
  estilo: {
    d: 'mientras atacas bloquea las balas de frente',
    esp: { n: 'Placas', d: 'bloquea en un ángulo mayor; al nivel 3 devuelve las balas' },
    el: { fire: 'Égida volcánica', water: 'Escudo de marea', air: 'Baluarte de viento', earth: 'Muralla de piedra' },
    // ataque normal
    ataque(p, w, { a, dmg }) {
      p.swing = { t: 0, dur: .14, a, arc: w.arc, range: w.range, dir: (p.swingDir = -(p.swingDir || 1)) };
      meleeHit(p, w, w.range, w.arc, dmg, 420, false);
      p.blockT = .5; sfx(150, .07, 'square', .03, -60);
    },
    // ataque cargado; S = estrellas (la habilidad elemental usa la forma de 5★)
    cargado(p, w, { a, S, dm }) {
      if (S >= 3) {
        p.dvx = Math.cos(a); p.dvy = Math.sin(a); p.dashT = .26; p.inv = Math.max(p.inv, .4);
        p.lunge = { dmg: dm(2.2), hit: new Set(), w, reps: 1, knives: 0, len: .26 };
        later(.27, () => shieldBash(p, w, 120, dm(2.4)));
      } else shieldBash(p, w, S === 2 ? 115 : 85, dm(S === 2 ? 2.4 : 2.1));
      if (S >= 4) later(S >= 3 ? .3 : .05, () => { for (let i = 0; i < 12; i++) { const an = i * TAU / 12; G.proj.push({ x: p.x, y: p.y, vx: Math.cos(an) * 360, vy: Math.sin(an) * 360, r: 6, dmg: dm(1), owner: 'player', kind: 'arrow', pierce: 1, hit: new Set(), life: .6, color: '#d8d0b8', src: w }); } });
      p.blockT = S === 5 ? 2.2 : S >= 2 ? 1.2 : .6;
    }
  }
});
