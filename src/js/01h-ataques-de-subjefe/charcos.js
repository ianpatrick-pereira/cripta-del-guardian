// Ataque de Elemental de agua: inunda el suelo a tu alrededor; los charcos te hacen resbalar
import { TAU, rand } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { noise } from '../05-audio.js';
import { hazard } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
import { addPuddle } from '../23b-poderes-elementales.js';
defSubMove('charcos', {
  hacer(e, dt, c) {
    const { p, S, ph2 } = c;
    e.timer += dt;
    if (e.k === 0) {
      e.k = 1; e.spots = [];
      const n = ph2 ? 5 : 4, off = rand(0, TAU);
      for (let i = 0; i < n; i++) { const a = off + i * TAU / n, d = i === 0 ? 0 : rand(60, 110); e.spots.push({ x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d }); }
      for (const s of e.spots) hazard(s.x, s.y, 46, .8, 1, S.tint, { owner: e });
    }
    if (e.k === 1 && e.timer > .8) { e.k = 2; for (const s of e.spots) addPuddle(s.x, s.y, 50, 7); noise(.4, .06, 700); }
    if (e.timer > 1.2) subIdle(e);
  }
});
