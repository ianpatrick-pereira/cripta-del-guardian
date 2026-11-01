// Ataque de subjefe: volley
import { ctx } from '../00-inicio.js';
import { defSubMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { enemyShoot, leadAng } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';
defSubMove('volley', {
  hacer(e, dt, c) {
    const { S, ph2 } = c;
    e.timer += dt; e.aimA = leadAng(e, 270);
    const vols = ph2 ? 4 : 3, n = ph2 ? 5 : 4;
    if (e.timer > .5 && e.k < vols && e.timer >= .5 + e.k * .28) { for (let i = 0; i < n; i++) enemyShoot(e, e.aimA + (i - (n - 1) / 2) * .17, 270, 5, S.pc || '#f0e6c8'); e.k++; sfx(500, .05, 'triangle', .025, -200); }
    if (e.timer > .5 + vols * .28 + .3) subIdle(e);
  },
  // aviso que se dibuja antes que el subjefe
  aviso(e) {
    if (!(e.timer < .5 && e.aimA !== undefined)) return;
    ctx.strokeStyle = 'rgba(255,90,90,.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(e.aimA) * 260, e.y + Math.sin(e.aimA) * 260); ctx.stroke(); ctx.setLineDash([]);
  }
});
