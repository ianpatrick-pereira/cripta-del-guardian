// Ataque del Guardián de la Cripta (v0.64): Púas de la cripta.
// Golpea el suelo y brotan anillos de púas de piedra que se alejan de él (src/sprites/g_puas.png).
// Cada anillo deja un hueco: hay que meterse en él.
import { TAU, angDiff, angTo, rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall } from '../08-colisiones.js';
import { shake } from '../09-efectos.js';
import { hazard } from '../14-enemigos.js';
import { bossIdle } from '../16-jefes.js';
defBossMove('puas', {
  hacer(e, dt, c) {
    const { ph3 } = c;
    e.timer += dt;
    const anillos = ph3 ? 4 : 3;
    if (e.k === 0) {
      e.k = 1; e.gap = angTo(e, G.player) + rand(-1.2, 1.2);
      shake(8); sfx(70, .35, 'sawtooth', .06);
      G.parts.push({ x: e.x, y: e.y + 10, vx: 0, vy: 0, life: .4, max: .4, fx: 'g_impacto', s: 5, color: '', size: 0 });
    }
    while (e.k <= anillos && e.timer >= .2 + (e.k - 1) * .32) {
      const R = 58 + e.k * 62, n = Math.round(TAU * R / 46), hueco = .5 - e.k * .04;
      for (let i = 0; i < n; i++) {
        const a = i * TAU / n; if (Math.abs(angDiff(a, e.gap)) < hueco) continue;
        const x = e.x + Math.cos(a) * R, y = e.y + Math.sin(a) * R; if (hitsWall(x, y, 8)) continue;
        hazard(x, y, 20, .6, 1, '#c77dff', { owner: e, fx: 'g_puas', s: 3, fy: 12, fxT: .6 });
      }
      e.gap += rand(-.45, .45); e.k++;
      sfx(110, .12, 'square', .03, -40);
    }
    if (e.timer > .2 + anillos * .32 + .9) bossIdle(e);
  }
});
