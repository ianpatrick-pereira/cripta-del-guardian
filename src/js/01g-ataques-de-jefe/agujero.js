// Ataque de El Devorador de Luz (v0.65, fase 3): Agujero Negro.
// Abre un agujero negro cerca de ti que te arrastra hacia él (en el centro quema) mientras el jefe dispara en espiral;
// al final se cierra de golpe y estalla en un anillo de disparos. El agujero vive en G.zonas (16b-zonas-de-jefe.js).
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall } from '../08-colisiones.js';
import { enemyShoot } from '../14-enemigos.js';
import { bossIdle } from '../16-jefes.js';
import { agujeroNegro } from '../16b-zonas-de-jefe.js';
defBossMove('agujero', {
  hacer(e, dt, c) {
    const { p, a } = c;
    e.timer += dt;
    if (e.k === 0) {
      e.k = 1;
      // entre el jefe y tú, un poco más cerca de ti
      let x = p.x + (e.x - p.x) * .3, y = p.y + (e.y - p.y) * .3;
      if (hitsWall(x, y, 30)) { x = (p.x + e.x) / 2; y = (p.y + e.y) / 2; }
      agujeroNegro(e, x, y, 3.6);
      sfx(60, 1.5, 'sawtooth', .05, -30);
    }
    // espiral lenta de sombras mientras te arrastra
    while (e.k < 13 && e.timer >= .4 + (e.k - 1) * .2) { for (let i = 0; i < 2; i++) { const pr = enemyShoot(e, a + e.k * .5 + i * Math.PI, 150, 6, '#ff3a5a'); pr.anim = 'd_orbe'; pr.ss = 1.5; } e.k++; }
    if (e.timer > 3) bossIdle(e);
  }
});
