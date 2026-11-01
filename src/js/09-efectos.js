// ================= Efectos =================
import { tr } from './00b-textos.js';
import { CRACK, FLOOR, MH, MW, TAU, TILE, angTo, dist, rand, randi } from './01-utilidades.js';
import { BOTIN } from './03-datos-del-juego.js';
import { SAVE } from './04-guardado.js';
import { noise, sfx } from './05-audio.js';
import { G, rc } from './07-estado.js';
import { hurtPlayer } from './13-armadura.js';
import { dropCoin, hurtEnemy } from './14-enemigos.js';
function burst(x, y, color, n = 8, sp = 140, size = 3, life = .45) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, s = rand(sp * .3, sp);
    G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(life * .6, life), max: life, color, size: rand(size * .6, size) });
  }
}
function addText(x, y, txt, color = '#ece4cf', size = 13) { G.texts.push({ x, y, txt: String(txt), color, life: .8, size }); }
function shake(v) { G.shake = Math.max(G.shake, v * SAVE.opt.shake); }
function showBanner(txt, color = '#ece4cf', sub = '') { G.banner = { txt, sub, color, t: 2.6 }; }
function later(t, fn) { G.timers.push({ t, fn }); }

function explode(x, y, R, dmg, fromPlayer) {
  burst(x, y, '#ffb36a', 26, 260, 5, .55); burst(x, y, '#4a4658', 14, 160, 6, .8);
  G.parts.push({ x, y, vx: 0, vy: 0, life: .18, max: .18, color: 'rgba(255,220,150,.6)', size: R * 1.6 });
  shake(11); noise(.45, .12, 700); sfx(70, .35, 'sawtooth', .05, -30);
  for (const e of G.enemies) if (!e.dead && dist(e, { x, y }) < R + e.r) hurtEnemy(e, dmg, angTo({ x, y }, e), 320, { explosion: true });
  const p = G.player;
  if (!fromPlayer && !rc('polvora') && dist(p, { x, y }) < R + p.r) hurtPlayer(2, tr('una explosión'));
  for (const o of G.props) if (!o.dead && o.kind !== 'merchant' && dist(o, { x, y }) < R + o.r) damageProp(o, 99);
  breakCracks(x, y, R + 10);
}
function breakCracks(x, y, R) {
  const t0x = Math.floor((x - R) / TILE), t1x = Math.floor((x + R) / TILE), t0y = Math.floor((y - R) / TILE), t1y = Math.floor((y + R) / TILE);
  let broke = false;
  for (let ty = t0y; ty <= t1y; ty++) for (let tx = t0x; tx <= t1x; tx++) {
    if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
    if (G.tiles[ty * MW + tx] !== CRACK) continue;
    const cx = (tx + .5) * TILE, cy = (ty + .5) * TILE;
    if (Math.hypot(cx - x, cy - y) > R + 16) continue;
    G.tiles[ty * MW + tx] = FLOOR; broke = true; G.tv = (G.tv || 0) + 1;
    burst(cx, cy, '#6a6280', 12, 180, 5, .7);
  }
  if (broke) {
    for (let i = 0; i < G.tiles.length; i++) if (G.tiles[i] === CRACK) {
      const tx = i % MW, ty = Math.floor(i / MW);
      if (Math.hypot((tx + .5) * TILE - x, (ty + .5) * TILE - y) < R + 80) G.tiles[i] = FLOOR;
    }
    addText(x, y - 20, tr('¡Pasaje secreto!'), '#c77dff', 16); sfx(300, .6, 'triangle', .05, 600); shake(8);
  }
}
function damageProp(o, d) {
  if (o.dead || o.kind === 'merchant') return;
  o.hp -= d; o.flash = .1;
  if (o.hp > 0) { sfx(200, .04, 'square', .02); return; }
  o.dead = true;
  if (o.kind === 'barrel') { later(.07, () => explode(o.x, o.y, 78, 7, false)); return; }
  burst(o.x, o.y, '#8a5a34', 12, 150, 4, .5); noise(.15, .05, 1500);
  const BC = BOTIN.caja;   // src/datos/botin.jsonc
  if (Math.random() < BC.monedas) for (let i = 0; i < randi(BC.cuantasMonedas[0], BC.cuantasMonedas[1]); i++) dropCoin(o.x, o.y);
  if (Math.random() < BC.energia) G.pickups.push({ kind: 'energy', x: o.x, y: o.y, vx: 0, vy: 0 });
  if (Math.random() < BC.pocion) G.pickups.push({ kind: 'potion', x: o.x, y: o.y });
  if (Math.random() < BC.llave) G.pickups.push({ kind: 'key', x: o.x, y: o.y });
}

export { addText, breakCracks, burst, damageProp, explode, later, shake, showBanner };
