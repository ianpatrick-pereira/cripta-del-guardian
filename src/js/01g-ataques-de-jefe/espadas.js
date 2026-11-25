// Ataque del Guardián de la Cripta (v0.64): Lluvia de espadas espectrales.
// Caen espadas fantasma sobre los círculos de aviso, se clavan y agrietan el suelo (src/sprites/g_espada.png).
import { rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { G } from '../07-estado.js';
import { hazard } from '../14-enemigos.js';
import { bossIdle } from '../16-jefes.js';
defBossMove('espadas', {
  hacer(e, dt, c) {
    const { p, ph3 } = c;
    e.timer += dt;
    const n = ph3 ? 9 : 6;
    while (e.k < n && e.timer >= e.k * .14) {
      const t = .5, j = e.k === 0 ? 0 : 90;
      hazard(p.x + G.pv.x * t * .8 + rand(-j, j), p.y + G.pv.y * t * .8 + rand(-j, j), 40, .85, 1, '#c77dff',
        { shred: true, fx: 'g_espada', s: 3.6, fy: 18, fxT: .5, caida: 150 });
      e.k++;
    }
    if (e.timer > n * .14 + .6) bossIdle(e);
  }
});
