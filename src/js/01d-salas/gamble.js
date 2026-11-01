// Sala de apuestas
import { ctx } from '../00-inicio.js';
import { TAU } from '../01-utilidades.js';
import { defRoom } from '../01a-registro.js';
import { drawSpr } from '../02-pixel-art.js';
import { G } from '../07-estado.js';
import { startGamble } from '../30-sala-de-apuestas.js';
import { drawShadow } from '../36-mar-de-lava.js';
defRoom('gamble', {
  orden: 5,
  objeto: 'gamble',
  colocar(r) {
    r.type = 'event'; r.cleared = true;
    G.pickups.push({ kind: 'gamble', x: r.cx, y: r.cy, room: r, plays: 0, wins: 0, losses: 0 });
  },
  usable(it) { return !it.fight; },
  usar(p, it) {
    startGamble(it);
  },
  dibujar(it, b) {
    ctx.fillStyle = `rgba(122,63,191,${.16 + .08 * Math.sin(G.time * 3)})`; ctx.beginPath(); ctx.arc(it.x, it.y - 20, 42, 0, TAU); ctx.fill();
    if (!it.fight) { drawShadow(it.x, it.y - 28, 10); drawSpr('mage', it.x, it.y - 34 + Math.sin(G.time * 2) * 1.5, 2.4, { flip: G.player.x < it.x }); }
    ctx.fillStyle = '#4a2f24'; ctx.fillRect(it.x - 30, it.y - 8, 60, 20); ctx.fillStyle = '#2f6a3a'; ctx.fillRect(it.x - 27, it.y - 6, 54, 14);
    for (let i = 0; i < 2; i++) { const dx = it.x - 10 + i * 16, dy = it.y - 2 + Math.sin(G.time * 3 + i) * 1; ctx.fillStyle = '#ece4cf'; ctx.fillRect(dx, dy, 8, 8); ctx.fillStyle = '#2a2638'; ctx.fillRect(dx + 3, dy + 3, 2, 2); }
    { ctx.fillStyle = '#f0c040'; ctx.fillRect(it.x + 18, it.y - 2 + b * .5, 5, 6); }
  },
  aviso(it, key) {
    return [key + `Jugar a las tres cartas · quedan ${3 - it.plays} partidas`, 'Elige 1 de 3 cartas boca abajo: si aciertas ganas el doble de tu apuesta', '#b98cff'];
  }
});
