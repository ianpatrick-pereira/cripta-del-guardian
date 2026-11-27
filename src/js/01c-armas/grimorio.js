// Grimorio de almas (Nigromante, v0.70; reemplaza a la Calavera aullante). Idea de Patrick:
// - Ataque: le arranca el alma a los 2 enemigos más cercanos (sin proyectil): daño, −50 % de velocidad 2 s
//   y −25 % de su daño 3 s. Cada alma arrancada se guarda (máximo 10) y gira a tu alrededor.
// - Cargado (especial): roba el alma a todos los enemigos de la sala y gasta las guardadas; cada alma guardada
//   suma +20 % de daño, frena más y quita más daño a los enemigos (hasta −55 %). Te da 1 corazón gris cada 2 almas.
// - R (idea de Patrick): suelta todas las almas guardadas en un alma gigante que avanza en línea recta y
//   atraviesa a todos; más almas = más daño y más grande. Sin almas, la R hace el poder elemental de siempre.
import { tr } from '../00b-textos.js';
import { angTo, dist } from '../01-utilidades.js';
import { defWeapon } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { dmgMul } from '../11-jugador.js';
import { G } from '../07-estado.js';
import { addText, shake } from '../09-efectos.js';
import { espLv } from '../12-armas-con-estilo-propio.js';
import { hurtEnemy } from '../14-enemigos.js';
import { arrancaAlma, cosechaFx } from '../37g-baculo-hd.js';

const ALMAS_MAX = 10, GRIS_MAX = 5;
/** deja al enemigo sin alma: más lento y pega menos durante un rato (a los jefes, la mitad del efecto) */
function sinAlma(e, slowT, slowK, debT, debK) {
  const b = e.isBoss ? .5 : 1;
  e.slowT = Math.max(e.slowT || 0, slowT * b); e.slowK = Math.min(e.slowK || 1, 1 - (1 - slowK) * b);
  e.almaK = Math.max(e.almaT > 0 ? e.almaK || 0 : 0, debK * b); e.almaT = Math.max(e.almaT || 0, debT);
}
defWeapon('grimorio', {
  orden: 52,
  datos: { name: tr('Grimorio de almas'), type: 'staff', style: 'grimorio', shape: 'book', gem: '#c9a8ff', rarity: 'rare', dmg: 4, cd: .6, speed: 0, pierce: 0, shots: 2, en: 3, chg: 'grimorio', chgEn: 25 },
  familia: 'necro',
  potencia: .8,
  estilo: {
    d: tr('arranca el alma a 2 enemigos: los frena y pegan un 25 % menos; guarda hasta 10 almas; R las lanza en un alma gigante'),
    esp: { n: tr('Hambre de almas'), d: tr('+10 % de alcance por nivel') },
    el: { fire: tr('Grimorio de ceniza'), water: tr('Grimorio ahogado'), air: tr('Grimorio de los lamentos'), earth: tr('Grimorio de piedra') },
    ataque(p, w, { dmg, cost }) {
      const R = 260 * (1 + .1 * espLv(w));
      const obj = G.enemies.filter(e => !e.dead && !e.air && dist(e, p) < R + e.r).sort((a, b) => dist(a, p) - dist(b, p)).slice(0, 2);
      if (!obj.length) { p.en += cost; p.cd = .25; if (p.noEnT <= 0) { addText(p.x, p.y - 26, tr('Nadie cerca'), '#c9a8ff', 12); p.noEnT = 1; } return; }
      for (const e of obj) {
        hurtEnemy(e, dmg, angTo(p, e), 40, { src: w });
        sinAlma(e, 2, .5, 3, .25);
        arrancaAlma(p, e);
      }
      p.almasN = Math.min(ALMAS_MAX, (p.almasN || 0) + obj.length);
      sfx(300, .18, 'sine', .04, -180); sfx(900, .1, 'triangle', .015, -600);
    },
    // R: el alma devoradora (devuelve false si no hay almas, y entonces la R usa el poder elemental)
    teclaR(p, w) {
      const n = p.almasN || 0; if (!n) return false;
      if (p.cd > 0) return true;
      const a = p.aim, dmg = Math.max(1, Math.round(w.dmg * (1 + .6 * n) * dmgMul())), sp = 360;
      G.proj.push({ x: p.x + Math.cos(a) * 18, y: p.y + Math.sin(a) * 18, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 12 + n * 1.2, dmg, owner: 'player', kind: 'power',
        pierce: 99, hit: new Set(), life: 1.6, color: '#c9a8ff', src: w, kb: 160 + n * 12, anim: 'gr_alma', ss: 1.6 + n * .2, rotOff: Math.PI / 2,
        alPegar: e => { sinAlma(e, 2, .5, 3, .25); arrancaAlma(p, e); } });
      addText(p.x, p.y - 32, tr`Alma devoradora ×${n}`, '#c9a8ff', 13);
      p.almasN = 0; p.cd = .4;
      if (p.spr === 'necro') { p.castAt = G.time; p.castFila = 'caminar'; }
      shake(3 + n * .3); sfx(220, .45, 'sine', .05, -140); sfx(620, .3, 'triangle', .02, -400);
      return true;
    },
    // especial: cosecha de almas en toda la sala, más fuerte cuantas más almas guardadas
    cargado(p, w, { dm }) {
      const n = p.almasN || 0;
      const obj = G.enemies.filter(e => !e.dead && !e.air);
      for (const e of obj) {
        hurtEnemy(e, dm(1.5 * (1 + .2 * n)), angTo(p, e), 120, { src: w, explosion: true });
        sinAlma(e, 2 + .3 * n, Math.max(.1, .5 - .04 * n), 3 + .3 * n, Math.min(.55, .25 + .03 * n));
      }
      for (const e of obj.slice(0, 12)) arrancaAlma(p, e);
      const g = Math.min(GRIS_MAX - (p.grisN || 0), Math.floor(n / 2));
      if (g > 0) { p.grisN = (p.grisN || 0) + g; addText(p.x, p.y - 34, tr`+${g} corazón gris`, '#cfcfd8', 13); }
      p.almasN = 0;
      cosechaFx(p, n);
      shake(5 + n * .4); sfx(160, .6, 'sawtooth', .05, -100); sfx(700, .4, 'sine', .03, -500);
    }
  }
});
