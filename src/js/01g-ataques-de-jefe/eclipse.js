// Ataque de El Devorador de Luz (v0.65, fase 2+): Eclipse.
// Apaga la luz y suelta zarcillos de sombra; en la oscuridad aparecen ojos rojos flotando a tu alrededor
// que te disparan bolas de sombra (los ojos viven en G.zonas, ver 16b-zonas-de-jefe.js).
import { tr } from '../00b-textos.js';
import { TAU, rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { showBanner } from '../09-efectos.js';
import { bossIdle } from '../16-jefes.js';
import { ojoSombra } from '../16b-zonas-de-jefe.js';
defBossMove('eclipse', {
  hacer(e, dt, c) {
    const { p, ph3 } = c;
    e.timer += dt;
    if (e.k === 0) {
      G.darkT = 3.5; e.k = 1; showBanner(tr('La luz se apaga'), '#d4474b'); sfx(50, 1.2, 'sine', .08, -20);
      G.parts.push({ x: e.x, y: e.y, vx: 0, vy: 0, life: .7, max: .7, fx: 'd_ola', s: 5, color: '', size: 0 });
      const n = ph3 ? 4 : 3, off = rand(0, TAU);
      for (let i = 0; i < n; i++) ojoSombra(e, p.x + Math.cos(off + i * TAU / n) * 150, p.y + Math.sin(off + i * TAU / n) * 120, .4 + i * .15);
    }
    if (e.timer > 3.2) bossIdle(e);
  }
});
