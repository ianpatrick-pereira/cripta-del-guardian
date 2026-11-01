// Mosquete
import { tr } from '../00b-textos.js';
import { rand } from '../01-utilidades.js';
import { defWeapon } from '../01a-registro.js';
import { noise, sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { moveEnt } from '../08-colisiones.js';
import { shake } from '../09-efectos.js';
import { shootPlayer } from '../11-jugador.js';
import { espLv } from '../12-armas-con-estilo-propio.js';
defWeapon('musket', {
  orden: 38,
  datos: { name: tr('Mosquete'), type: 'bow', style: 'musket', shape: 'musket', rarity: 'rare', dmg: 13, cd: 1.35, speed: 1150, pierce: 99, shots: 1, en: 4, chg: 'blast', chgEn: 18 },
  familia: 'archer',
  potencia: .9,
  estilo: {
    d: tr('recarga lenta; la bala atraviesa todo'),
    esp: { n: tr('Calibre'), d: tr('la bala estalla al chocar, más grande por nivel') },
    el: { fire: tr('Bala incendiaria'), water: tr('Disparo de géiser'), air: tr('Bala huracán'), earth: tr('Bala de granito') },
    // ataque normal
    ataque(p, w, { a, dmg }) {
      shootPlayer(p, w, a, dmg, { kind: 'ball', r: 5, pierce: 99, life: .9, color: '#ffe6a0', bounce: 0, boom: espLv(w) ? 26 + 16 * espLv(w) : 0 });
      moveEnt(p, -Math.cos(a) * 12, -Math.sin(a) * 12);
      for (let i = 0; i < 8; i++) G.parts.push({ x: p.x + Math.cos(a) * 30, y: p.y + Math.sin(a) * 30, vx: Math.cos(a + rand(-.5, .5)) * rand(40, 120), vy: Math.sin(a + rand(-.5, .5)) * rand(40, 120) - 20, life: .6, max: .6, color: 'rgba(200,196,210,.5)', size: 7 });
      shake(5); noise(.12, .07, 900); sfx(90, .15, 'sawtooth', .05, -40);
    },
    // ataque cargado; S = estrellas (la habilidad elemental usa la forma de 5★)
    cargado(p, w, { a, S, dm, col }) {
      const sp = w.speed;
      if (S <= 2) { const n = S === 2 ? 10 : 7, spr = S === 2 ? .12 : .1; for (let i = 0; i < n; i++) { const an = a + (i - (n - 1) / 2) * spr + rand(-.03, .03); shootPlayer(p, w, an, dm(.75), { kind: 'ball', r: 4, pierce: 1, life: .38, color: '#ffe6a0', bounce: 0, vx: Math.cos(an) * sp * .75, vy: Math.sin(an) * sp * .75 }); } }
      else if (S === 3) shootPlayer(p, w, a, dm(3), { kind: 'ball', r: 7, pierce: 99, life: 1, color: '#ff9a3a', bounce: 0, boom: 80 });
      else if (S === 4) shootPlayer(p, w, a, dm(3), { kind: 'ball', r: 7, pierce: 99, life: 1, color: '#ffe27a', bounce: 0, boom: 60, fx: 'chain' });
      else shootPlayer(p, w, a, dm(5), { kind: 'ball', r: 13, pierce: 99, life: 1.2, color: col, bounce: 0, boom: 140, vx: Math.cos(a) * sp * .7, vy: Math.sin(a) * sp * .7 });
      moveEnt(p, -Math.cos(a) * 30, -Math.sin(a) * 30);
      for (let i = 0; i < 16; i++) G.parts.push({ x: p.x + Math.cos(a) * 30, y: p.y + Math.sin(a) * 30, vx: Math.cos(a + rand(-.7, .7)) * rand(60, 200), vy: Math.sin(a + rand(-.7, .7)) * rand(60, 200), life: .8, max: .8, color: 'rgba(200,196,210,.5)', size: 9 });
      shake(10); noise(.3, .1, 500); sfx(60, .3, 'sawtooth', .06, -20);
    }
  }
});
