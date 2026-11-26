// Ataque de La Reina Tejedora (v0.65): Saco de Crías.
// Lanza sacos de huevos cerca de ti; laten un momento y revientan soltando arañas.
// Si ya hay muchos enemigos, lanza menos.
import { TAU, rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { bossIdle } from '../16-jefes.js';
import { lanzarZona } from '../16b-zonas-de-jefe.js';
defBossMove('crias', {
  hacer(e, dt, c) {
    const { p, B, ph3 } = c;
    e.timer += dt;
    if (e.k === 0 && e.timer >= .25) {
      e.k = 1;
      const n = G.enemies.length > 6 ? 1 : ph3 ? 3 : 2, a0 = rand(0, TAU);
      for (let i = 0; i < n; i++) {
        const a = a0 + i * TAU / n, R = rand(80, 130);
        lanzarZona(e, 'saco', p.x + Math.cos(a) * R, p.y + Math.sin(a) * R, { minion: B.minion, crias: 2 });
      }
      sfx(200, .25, 'sine', .04, -80);
    }
    if (e.timer > 1.1) bossIdle(e);
  }
});
