// Ataque de jefe: teleport
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G, freeSpot } from '../07-estado.js';
import { bossIdle, bossRing } from '../16-jefes.js';
defBossMove('teleport', {
  hacer(e, dt, c) {
    const { p, ph2, bcol } = c;
    e.timer += dt;
    if (e.k === 0) { e.fade = Math.max(0, 1 - e.timer / .4); if (e.timer >= .4) { e.k = 1; e.invuln = true; const s = freeSpot(G.bossRoom, 3, 0, p, 170); if (s) { e.x = s.x; e.y = s.y; } sfx(160, .3, 'sine', .04, -100); } }
    else { e.fade = Math.min(1, (e.timer - .4) / .3); if (e.k === 1 && e.timer >= .7) { e.k = 2; e.invuln = false; bossRing(e, ph2 ? 16 : 12, 170, bcol); } }
    if (e.timer > 1.1) { e.fade = 1; e.invuln = false; bossIdle(e); }
  }
});
