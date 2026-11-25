// Ataque del Guardián de la Cripta (v0.64): Embestida real.
// Como la carga, pero deja una estela de copias fantasma y al chocar levanta polvo y piedras (src/sprites/g_impacto.png).
import { ctx } from '../00-inicio.js';
import { defBossMove } from '../01a-registro.js';
import { ANIM, mobKey } from '../02-pixel-art.js';
import { BOSSES } from '../03-datos-del-juego.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { moveEnt, pushOutProps } from '../08-colisiones.js';
import { burst, damageProp, shake } from '../09-efectos.js';
import { leadAng } from '../14-enemigos.js';
import { bossIdle, bossRing } from '../16-jefes.js';
const impacto = (x, y, s) => G.parts.push({ x, y, vx: 0, vy: 0, life: .4, max: .4, fx: 'g_impacto', s, color: '', size: 0 });
defBossMove('embestida', {
  hacer(e, dt, c) {
    const { ph2, ph3, bcol } = c;
    e.timer += dt;
    const wind = ph2 ? .6 : .85;
    if (!e.reps) e.reps = ph3 ? 3 : ph2 ? 2 : 1;
    if (e.k === 0) {
      if (e.timer < wind - .25) e.ca = leadAng(e, ph2 ? 640 : 520, .5);
      if (e.timer >= wind) { e.k = 1; e.timer = 0; sfx(80, .3, 'sawtooth', .05); impacto(e.x, e.y + 14, 3.2); }
    } else {
      const sp = ph2 ? 640 : 520;
      const hit = moveEnt(e, Math.cos(e.ca) * sp * dt, Math.sin(e.ca) * sp * dt);
      const o = pushOutProps(e); if (o && o.kind !== 'merchant') damageProp(o, 99);
      // estela: copias moradas del Guardián que se desvanecen
      e.ghT = (e.ghT || 0) - dt;
      const B = BOSSES[e.kind];
      if (e.ghT <= 0 && B.spr) { e.ghT = .05; G.parts.push({ x: e.x, y: e.y - 10, vx: 0, vy: 0, life: .32, max: .32, ghost: ANIM[B.spr + '_atq'] ? ANIM[B.spr + '_atq'].caminar.cuadros[1] : mobKey(B.spr, e.t || G.time, true, false), s: B.s || 4, flip: Math.cos(e.ca) < 0, color: '', size: 0 }); }
      // zarpazos en el suelo por donde pasa (el dibujo va en diagonal: se gira para seguir la carga)
      e.estD = (e.estD || 0) + sp * dt;
      if (e.estD > 44) { e.estD = 0; G.parts.push({ x: e.x, y: e.y + 16, vx: 0, vy: 0, life: 1.4, max: 1.4, fx: 'g_estela', pre: .55, s: 2.6, rot: e.ca + Math.PI / 4, color: '', size: 0 }); }
      if (hit || e.timer > .75) {
        if (hit) { shake(12); burst(e.x, e.y, '#7a6f8a', 16, 200); impacto(e.x + Math.cos(e.ca) * e.r, e.y + Math.sin(e.ca) * e.r, 5.5); if (ph2) bossRing(e, 12, 170, bcol); }
        if (--e.reps > 0) { e.k = 0; e.timer = .3; } else bossIdle(e);
      }
    }
  },
  // aviso: la franja por donde va a pasar
  aviso(e) {
    if (e.k !== 0) return;
    ctx.globalAlpha = .22; ctx.strokeStyle = '#d4474b'; ctx.lineWidth = e.r * 2;
    ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(e.ca) * 420, e.y + Math.sin(e.ca) * 420); ctx.stroke(); ctx.globalAlpha = 1;
  }
});
