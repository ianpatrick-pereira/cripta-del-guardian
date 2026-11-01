// Ataque de jefe: charge
import { ctx } from '../00-inicio.js';
import { defBossMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { moveEnt, pushOutProps } from '../08-colisiones.js';
import { burst, damageProp, shake } from '../09-efectos.js';
import { leadAng } from '../14-enemigos.js';
import { bossIdle, bossRing } from '../16-jefes.js';
defBossMove('charge', {
  hacer(e, dt, c) {
    const { ph2, ph3, bcol } = c;
    e.timer += dt;
    const wind = ph2 ? .6 : .85;
    if (!e.reps) e.reps = ph3 ? 3 : 1;
    if (e.k === 0) {
      if (e.timer < wind - .25) e.ca = leadAng(e, ph2 ? 640 : 520, .5);
      if (e.timer >= wind) { e.k = 1; e.timer = 0; sfx(80, .3, 'sawtooth', .05); }
    } else {
      const sp = ph2 ? 640 : 520;
      const hit = moveEnt(e, Math.cos(e.ca) * sp * dt, Math.sin(e.ca) * sp * dt);
      const o = pushOutProps(e); if (o && o.kind !== 'merchant') damageProp(o, 99);
      if (hit || e.timer > .75) {
        if (hit) { shake(12); burst(e.x, e.y, '#7a6f8a', 16, 200); if (ph2) bossRing(e, 12, 170, bcol); }
        if (--e.reps > 0) { e.k = 0; e.timer = .3; } else bossIdle(e);
      }
    }
  },
  // aviso que se dibuja antes que el jefe
  aviso(e) {
    if (e.k !== 0) return;
    ctx.globalAlpha = .22; ctx.strokeStyle = '#d4474b'; ctx.lineWidth = e.r * 2;
    ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(e.ca) * 420, e.y + Math.sin(e.ca) * 420); ctx.stroke(); ctx.globalAlpha = 1;
  }
});
