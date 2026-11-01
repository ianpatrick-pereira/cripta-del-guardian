// Sala de palancas
import { ctx } from '../00-inicio.js';
import { TAU } from '../01-utilidades.js';
import { defRoom } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G, randomRelics } from '../07-estado.js';
import { shake, showBanner } from '../09-efectos.js';
import { dropCoin } from '../14-enemigos.js';
defRoom('levers', {
  orden: 4,
  objeto: 'lever',
  colocar(r) {
    r.type = 'event'; r.cleared = true;
    leverRoom(r);
  },
  usable(it) { return !it.room.solved; },
  usar(p, it) {
    pullLever(it);
  },
  dibujar(it, b) {
    const on = it.room.lev[it.i], hx = it.x + (on ? 10 : -10);
    if (on) { ctx.fillStyle = 'rgba(155,224,200,.18)'; ctx.beginPath(); ctx.arc(it.x, it.y - 6, 20, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#3a3448'; ctx.fillRect(it.x - 11, it.y + 4, 22, 8); ctx.fillStyle = '#4e4660'; ctx.fillRect(it.x - 13, it.y + 1, 26, 4);
    ctx.strokeStyle = '#8c8a96'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(it.x, it.y + 4); ctx.lineTo(hx, it.y - 16); ctx.stroke();
    ctx.fillStyle = on ? '#9be0c8' : '#d4474b'; ctx.beginPath(); ctx.arc(hx, it.y - 17, 5, 0, TAU); ctx.fill();
  },
  aviso(it, key) {
    return [key + 'Mover palanca', 'Enciéndelas todas (verde): cada una mueve también a sus vecinas', '#9be0c8'];
  }
});

// palancas: cada una mueve también a sus vecinas; enciéndelas todas
function leverRoom(r) {
  r.lev = [1, 0, 1, 1];
  do { r.lev = [0, 0, 0, 0].map(() => Math.random() < .5 ? 1 : 0); } while (r.lev.every(v => v));
  for (let i = 0; i < 4; i++) G.pickups.push({ kind: 'lever', i, room: r, x: r.cx + (i - 1.5) * 56, y: r.cy - 10 });
}
function pullLever(it) {
  const r = it.room; if (r.solved) return;
  for (const j of [it.i - 1, it.i, it.i + 1]) if (j >= 0 && j < 4) r.lev[j] ^= 1;
  sfx(260, .08, 'square', .04, 120);
  if (r.lev.every(v => v)) {
    r.solved = true;
    showBanner('¡Mecanismo resuelto!', '#9be0c8', 'Se abre un compartimento secreto');
    G.pickups.push({ kind: 'relic', relic: randomRelics(1)[0], x: r.cx, y: r.cy + 50 });
    for (let i = 0; i < 8; i++) dropCoin(r.cx, r.cy + 50);
    G.pickups.push({ kind: 'gem', x: r.cx + 30, y: r.cy + 60, vx: 0, vy: 0 });
    shake(5); sfx(600, .4, 'triangle', .05, 600);
  }
}
