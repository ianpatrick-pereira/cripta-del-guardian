// Cetro de escarcha (Nigromante, v0.69): abanico de esquirlas de hielo que frenan; el cargado congela alrededor
import { tr } from '../00b-textos.js';
import { TAU, dist } from '../01-utilidades.js';
import { defWeapon } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { burst, shake } from '../09-efectos.js';
import { shootPlayer } from '../11-jugador.js';
import { espLv } from '../12-armas-con-estilo-propio.js';
import { almaVuela, cargadoAlmas, sueloArma } from '../37g-baculo-hd.js';
defWeapon('escarcha', {
  orden: 51,
  datos: { name: tr('Cetro de escarcha'), type: 'staff', style: 'escarcha', shape: 'rod', gem: '#9bd8ff', rarity: 'uncommon', dmg: 2, cd: .5, speed: 480, pierce: 0, shots: 3, en: 3, chg: 'escarcha', chgEn: 18, fx: 'slow' },
  familia: 'necro',
  potencia: 1,
  estilo: {
    d: tr('abanico de esquirlas de hielo de corto alcance que frenan'),
    esp: { n: tr('Hielo eterno'), d: tr('las esquirlas llegan un 15 % más lejos por nivel') },
    el: { fire: tr('Cetro de vapor'), water: tr('Cetro glacial'), air: tr('Cetro de ventisca'), earth: tr('Cetro de permafrost') },
    ataque(p, w, { a, dmg }) {
      const life = .45 * (1 + .15 * espLv(w));
      for (let i = -1; i <= 1; i++) shootPlayer(p, w, a + i * .2, dmg, { life, r: 5, color: '#cfeeff', ...almaVuela(w) });
      sfx(1300, .05, 'triangle', .02, -500);
    },
    // cargado: tormenta de hielo alrededor; congela a los cercanos (más tiempo y más grande con las estrellas)
    cargado(p, w, { S, dm }) {
      const n = 12 + 2 * S, R = 110 + 15 * S, t = 1.2 + .15 * S;
      for (let i = 0; i < n; i++) shootPlayer(p, w, i * TAU / n, dm(1.2), { life: .55, r: 6, color: '#cfeeff', ...almaVuela(w) });
      for (const e of G.enemies) if (!e.dead && !e.air && dist(e, p) < R + e.r) { e.slowT = Math.max(e.slowT || 0, e.isBoss ? t / 2 : t); e.slowK = e.isBoss ? .5 : .08; burst(e.x, e.y, '#cfeeff', 5, 80); sueloArma(w, e); }
      cargadoAlmas(p, w, R);
      burst(p.x, p.y, '#9bd8ff', 24, 220); shake(4); sfx(1600, .3, 'triangle', .04, -1200);
    }
  }
});
