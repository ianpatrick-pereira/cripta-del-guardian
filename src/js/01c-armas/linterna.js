// Linterna de almas (Nigromante, soporte, v0.69): disparo débil; cada baja te devuelve energía.
// El cargado deja una linterna que te cura mientras estás cerca (una cada 15 s).
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { addText, burst } from '../09-efectos.js';
import { shootPlayer } from '../11-jugador.js';
import { espLv } from '../12-armas-con-estilo-propio.js';
import { almaVuela } from '../37g-baculo-hd.js';
defWeapon('linterna', {
  orden: 54,
  datos: { name: tr('Linterna de almas'), type: 'staff', style: 'linterna', shape: 'staff', gem: '#9be0a0', rarity: 'uncommon', dmg: 2, cd: .45, speed: 400, pierce: 0, shots: 1, en: 1, chg: 'linterna', chgEn: 15 },
  familia: 'necro',
  potencia: .7,
  estilo: {
    d: tr('soporte: cada enemigo que mata te devuelve 6 de energía'),
    esp: { n: tr('Mecha larga'), d: tr('la linterna dura 2 s más por nivel') },
    el: { fire: tr('Linterna de brasas'), water: tr('Linterna de niebla'), air: tr('Linterna de fuegos fatuos'), earth: tr('Linterna de ámbar') },
    ataque(p, w, { a, dmg }) {
      shootPlayer(p, w, a, dmg, { color: '#9be0a0', ...almaVuela(w) });
      sfx(760, .05, 'sine', .02, -100);
    },
    // cargado: la linterna en el suelo cura 1 de vida cada 3 s si estás a menos de 100 px (2 cada 3 s desde 5★)
    cargado(p, w, { S }) {
      if ((p.linternaCd || 0) > G.time) {
        p.en += w.chgEn; addText(p.x, p.y - 26, tr`Linterna lista en ${Math.ceil(p.linternaCd - G.time)} s`, '#9be0a0', 12); return;
      }
      p.linternaCd = G.time + 15;
      const C = G.cls || (G.cls = { traps: [], clouds: [], fx: [] });
      const t = 6 + S + 2 * espLv(w);
      (C.linternas || (C.linternas = [])).push({ x: p.x, y: p.y + 6, t, max: t, tick: 1.5, cura: S === 5 ? 2 : 1, R: 100 });
      burst(p.x, p.y, '#9be0a0', 16, 140); sfx(500, .3, 'triangle', .04, 300);
    }
  }
});
