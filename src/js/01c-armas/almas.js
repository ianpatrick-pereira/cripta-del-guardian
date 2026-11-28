// Báculo de almas (Nigromante, v0.69): un alma que salta en cadena a 2 enemigos cercanos
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { shootPlayer } from '../11-jugador.js';
import { almaVuela, cargadoAlmas } from '../37g-baculo-hd.js';
defWeapon('almas', {
  orden: 50,
  datos: { name: tr('Báculo de almas'), type: 'staff', style: 'almas', shape: 'staff', gem: '#b98cff', rarity: 'common', dmg: 3, cd: .42, speed: 430, pierce: 0, shots: 1, en: 2, chg: 'almas', chgEn: 12, fx: 'chain' },
  familia: 'necro',
  potencia: .75,
  estilo: {
    d: tr('el alma salta a 2 enemigos cercanos'),
    esp: { n: tr('Almas inquietas'), d: tr('+10 % de daño del alma por nivel') },
    el: { fire: tr('Báculo de almas ardientes'), water: tr('Báculo de almas ahogadas'), air: tr('Báculo de almas errantes'), earth: tr('Báculo de almas pétreas') },
    ataque(p, w, { a, dmg }) {
      shootPlayer(p, w, a, Math.round(dmg * (1 + .1 * ((w.up && w.up.esp) || 0))), { color: '#c9a8ff', ...almaVuela(w) });
      sfx(620, .06, 'sine', .025, -200);
    },
    // cargado: 3 almas a la vez (5 desde 3★), teledirigidas desde 4★
    cargado(p, w, { a, S, dm }) {
      const n = S >= 3 ? 5 : 3, o = { ...(S >= 4 ? { fx: 'homing', r: 8, life: 2.4 } : { r: 8 }), ...almaVuela(w, true) };
      cargadoAlmas(p, w);
      for (let i = 0; i < n; i++) shootPlayer(p, w, a + (i - (n - 1) / 2) * .22, dm(S === 5 ? 1.8 : 1.4), o);
      if (S === 5) for (let i = 0; i < n; i++) shootPlayer(p, w, a + Math.PI + (i - (n - 1) / 2) * .3, dm(1.4), o);
      sfx(420, .3, 'sine', .05, 400);
    }
  }
});
