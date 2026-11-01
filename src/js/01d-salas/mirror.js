// Sala espejo
import { ctx } from '../00-inicio.js';
import { defRoom } from '../01a-registro.js';
import { drawSpr } from '../02-pixel-art.js';
import { mkW } from '../03-datos-del-juego.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { burst, shake, showBanner } from '../09-efectos.js';
import { mkEnemy } from '../14-enemigos.js';
defRoom('mirror', {
  orden: 7,
  objeto: 'mirror',
  colocar(r) {
    r.type = 'event'; r.cleared = true;
    G.pickups.push({ kind: 'mirror', x: r.cx, y: r.cy - 20, room: r });
  },
  usable(it) { return !it.used; },
  usar(p, it) {
    if (!it.used) touchMirror(it);
  },
  dibujar(it, b) {
    ctx.fillStyle = '#3a2a24'; ctx.fillRect(it.x - 17, it.y - 40, 34, 54);
    const gl = ctx.createLinearGradient(it.x - 13, it.y - 36, it.x + 13, it.y + 10);
    gl.addColorStop(0, it.used ? '#2a2638' : '#9fb0d8'); gl.addColorStop(1, it.used ? '#1a1724' : '#4a4a7a');
    ctx.fillStyle = gl; ctx.fillRect(it.x - 13, it.y - 36, 26, 46);
    if (it.used) { ctx.strokeStyle = '#ece4cf'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(it.x - 10, it.y - 30); ctx.lineTo(it.x + 2, it.y - 10); ctx.lineTo(it.x - 4, it.y + 6); ctx.moveTo(it.x + 2, it.y - 10); ctx.lineTo(it.x + 11, it.y - 2); ctx.stroke(); }
    else { drawSpr(G.player.spr, it.x, it.y - 14, 1.6, { flip: true, alpha: .35 + .15 * Math.sin(G.time * 3) }); }
  },
  aviso(it, key) {
    return [key + 'Tocar el espejo', 'Pelea contra tu reflejo: gana una copia de tu arma con +1★', '#c77dff'];
  }
});

// sala espejo: tu reflejo pelea con tu misma arma
function touchMirror(it) {
  const p = G.player, w = p.slots[p.cur], r = it.room;
  it.used = true;
  const ranged = w.type !== 'melee';
  const e = mkEnemy(ranged ? 'mage' : 'brute', it.x, it.y + 50, 3, true);
  e.spr = p.spr; e.s = 2.4; e.mirror = true; e.mw = { id: w.id, stars: w.stars };
  e.hp = e.max = Math.round(e.max * 5); e.shield = Math.round(e.max * .3); e.dmg += 1;
  G.enemies.push(e);
  r.type = 'combat'; r.cleared = false; r.locked = true; r.wave = r.waves = 1;
  showBanner('Tu reflejo', '#c77dff', 'Vence a tu reflejo y obtén una copia mejorada de tu arma');
  shake(8); sfx(300, .6, 'sine', .06, -200); burst(it.x, it.y, '#c77dff', 30, 220);
}
function mirrorDefeated(e) {
  const st = Math.min(5, e.mw.stars + 1);
  G.pickups.push({ kind: 'weapon', x: e.x, y: e.y, weapon: mkW(e.mw.id, st), bob: 0 });
  showBanner('El reflejo se rompe', '#c77dff', `Copia de tu arma a ${st}★`);
}

export { mirrorDefeated };
