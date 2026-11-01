// Prisionero
import { tr } from '../00b-textos.js';
import { ctx } from '../00-inicio.js';
import { rand } from '../01-utilidades.js';
import { defRoom } from '../01a-registro.js';
import { drawSpr } from '../02-pixel-art.js';
import { rollWeapon } from '../03-datos-del-juego.js';
import { SAVE } from '../04-guardado.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { addText, burst } from '../09-efectos.js';
import { ach } from '../21-logros-y-bestiario.js';
import { drawShadow } from '../36-mar-de-lava.js';
defRoom('prisoner', {
  orden: 3,
  objeto: 'prisoner',
  colocar(r) {
    G.pickups.push({ kind: 'prisoner', x: r.cx, y: r.cy - 60, room: r });
  },
  usable(it) { return true; },
  usar(p, it) {
    if (!it.room.cleared) { addText(it.x, it.y - 34, tr('Despeja la sala para liberarlo'), '#e3a24a', 12); return; }
    it.gone = true; SAVE.rescued++; ach('rescue');
    addText(it.x, it.y - 34, tr('¡Gracias, viajero! Toma esto.'), '#9be0c8', 13);
    burst(it.x, it.y, '#9be0c8', 18, 160);
    G.pickups.push({ kind: 'weapon', x: it.x - 30, y: it.y + 20, weapon: rollWeapon('gold'), bob: 0 });
    G.pickups.push({ kind: 'gem', x: it.x + 20, y: it.y + 20, vx: rand(-60, 60), vy: rand(-60, 60) });
    sfx(700, .3, 'triangle', .04, 400);
  },
  dibujar(it, b) {
    drawShadow(it.x, it.y + 2, 10);
    drawSpr('archer', it.x, it.y - 4 + Math.sin(G.time * 2) * 1, 2, { flip: G.player.x < it.x, alpha: .85 });
    ctx.strokeStyle = '#8a84a0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(it.x - 10, it.y + 2); ctx.lineTo(it.x - 22, it.y - 30); ctx.moveTo(it.x + 10, it.y + 2); ctx.lineTo(it.x + 22, it.y - 30); ctx.stroke();
  },
  aviso(it, key) {
    return [key + (it.room.cleared ? tr('Liberar al prisionero') : tr('Prisionero encadenado')), it.room.cleared ? tr('Te dará una recompensa') : tr('Despeja la sala primero'), '#9be0c8'];
  }
});
