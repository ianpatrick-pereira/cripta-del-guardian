// Tomo de protección (Nigromante, soporte, v0.69): ráfaga corta de chispas. El cargado te envuelve en una barrera
// que absorbe 2 golpes y refleja las balas (una cada 12 s)
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { addText, burst } from '../09-efectos.js';
import { shootPlayer } from '../11-jugador.js';
import { espLv } from '../12-armas-con-estilo-propio.js';
defWeapon('tomo', {
  orden: 55,
  datos: { name: tr('Tomo de protección'), type: 'staff', style: 'tomo', shape: 'book', gem: '#ffd27a', rarity: 'rare', dmg: 2, cd: .38, speed: 520, pierce: 0, shots: 4, en: 2, chg: 'tomo', chgEn: 15 },
  familia: 'necro',
  potencia: 1.15,
  estilo: {
    d: tr('soporte: ráfaga corta de chispas; el cargado te protege'),
    esp: { n: tr('Sello'), d: tr('la barrera dura 1 s más por nivel') },
    el: { fire: tr('Tomo de llamas'), water: tr('Tomo de las mareas'), air: tr('Tomo de los vientos'), earth: tr('Tomo de piedra') },
    ataque(p, w, { a, dmg }) {
      for (let i = 0; i < 4; i++) shootPlayer(p, w, a + (i - 1.5) * .16, dmg, { life: .42, r: 5, color: '#ffe8a0' });
      sfx(1100, .04, 'square', .015, -400);
    },
    // cargado: barrera de 4 s que absorbe 2 golpes (3 desde 4★) y refleja las balas
    cargado(p, w, { S }) {
      if ((p.tomoCd || 0) > G.time) {
        p.en += w.chgEn; addText(p.x, p.y - 26, tr`Barrera lista en ${Math.ceil(p.tomoCd - G.time)} s`, '#ffd27a', 12); return;
      }
      p.tomoCd = G.time + 12;
      p.bulwarkT = 4 + .3 * (S - 1) + espLv(w); p.barreraN = S >= 4 ? 3 : 2;
      addText(p.x, p.y - 30, tr('Barrera'), '#ffd27a', 13);
      burst(p.x, p.y, '#ffd27a', 20, 160); sfx(700, .4, 'triangle', .05, 300);
    }
  }
});
