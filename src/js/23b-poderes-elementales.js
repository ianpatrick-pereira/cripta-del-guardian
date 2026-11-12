// ================= Poderes de los Elementales (v0.57) =================
// Cada Elemental pelea solo, con su propio repertorio (ver los ataques el-* en 01h-ataques-de-subjefe/):
//   agua   → olas, bolas de agua y charcos que te hacen resbalar
//   fuego  → lanzallamas hacia un lado, bolas de fuego y suelo ardiendo
//   tierra → pedruscos que estallan en área, gravilla y columnas que cierran el paso (más duro y más lento)
//   aire   → más rápido, flechas de viento, empuja, atrae y suelta una ráfaga
// Aquí viven las cosas que dejan en el mundo: charcos, pedruscos y columnas.
import { ctx } from './00-inicio.js';
import { TAU, TILE, angTo, dist, rand } from './01-utilidades.js';
import { noise, sfx } from './05-audio.js';
import { G } from './07-estado.js';
import { hitsWall, moveEnt, solidAt } from './08-colisiones.js';
import { burst, shake } from './09-efectos.js';
import { elemHit, enemyShoot } from './14-enemigos.js';
import { hurtPlayer } from './13-armadura.js';

// charco: mientras lo pisas, te deslizas (ver el movimiento en 11-jugador.js)
function addPuddle(x, y, r = 46, t = 6) {
  if (hitsWall(x, y, 8)) return;
  (G.puddles || (G.puddles = [])).push({ x, y, r, t, max: t, wob: rand(0, TAU) });
}
// pedrusco: rueda hacia donde estabas y estalla en área al chocar o al llegar
function throwBoulder(e, a, dmg) {
  (G.boulders || (G.boulders = [])).push({ x: e.x + Math.cos(a) * e.r, y: e.y + Math.sin(a) * e.r, a, sp: 250, d: 0, max: 420, r: 18, dmg, src: e, spin: 0 });
  sfx(70, .4, 'sawtooth', .05, -20);
}
// columna de roca: sólida durante unos segundos; se puede romper a golpes
function raisePillar(x, y) {
  const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE), p = G.player;
  if (solidAt(tx, ty) || hitsWall(x, y, 14) || dist({ x, y }, p) < p.r + 30) return false;
  if (G.props.some(o => !o.dead && dist(o, { x, y }) < o.r + 22)) return false;
  G.props.push({ kind: 'roca', x, y, r: 16, hp: 18, solid: true, flash: 0, temp: 7, rise: 0 });
  burst(x, y, '#8a6a48', 10, 140, 4, .4);
  return true;
}
function updateElemPowers(dt) {
  const p = G.player, fight = !!G.elFight;
  if (G.puddles) {
    for (const c of G.puddles) {
      c.t -= dt;
      if (!G.over && dist(c, p) < c.r && p.dashT <= 0) p.slick = .35;
    }
    G.puddles = G.puddles.filter(c => c.t > 0 && fight);
  }
  if (G.boulders) {
    for (const b of G.boulders) {
      const step = b.sp * dt; b.d += step; b.spin += dt * 8;
      const nx = b.x + Math.cos(b.a) * step, ny = b.y + Math.sin(b.a) * step;
      const hitP = !G.over && dist(b, p) < b.r + p.r;
      if (hitsWall(nx, ny, b.r * .6) || b.d >= b.max || hitP || G.props.some(o => !o.dead && o.solid && dist(o, { x: nx, y: ny }) < o.r + b.r * .6)) {
        b.gone = true;
        // estallido en área + gravilla en anillo
        if (!G.over && dist(b, p) < 80 + p.r * .4 && hurtPlayer(b.dmg + 1, b.src.name)) elemHit('earth', b);
        for (let i = 0; i < 8; i++) enemyShoot({ x: b.x, y: b.y, r: 6 }, i * TAU / 8 + rand(-.1, .1), 170, 5, '#c09060');
        burst(b.x, b.y, '#8a6a48', 22, 220, 5, .5); shake(9); noise(.3, .08, 300);
        continue;
      }
      b.x = nx; b.y = ny;
      if (Math.random() < .5) G.parts.push({ x: b.x + rand(-8, 8), y: b.y + b.r * .6, vx: 0, vy: -20, life: .4, max: .4, color: '#6a5440', size: 3 });
    }
    G.boulders = G.boulders.filter(b => !b.gone && fight);
  }
  for (const o of G.props) if (o.kind === 'roca' && !o.dead) {
    o.rise = Math.min(1, (o.rise || 0) + dt * 5); o.temp -= dt;
    if (o.temp <= 0 || !fight) { o.dead = true; burst(o.x, o.y, '#8a6a48', 8, 120, 4, .4); }
  }
  p.slick = (p.slick || 0) - dt;
}
function drawPuddles() {
  if (!G.puddles) return;
  for (const c of G.puddles) {
    const k = Math.min(1, c.t / .8, (c.max - c.t) / .3);
    ctx.globalAlpha = .55 * k; ctx.fillStyle = '#2a6f9a';
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.r, c.r * .62, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = .5 * k; ctx.strokeStyle = '#9be0ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.r * (.55 + .1 * Math.sin(G.time * 3 + c.wob)), c.r * .34, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = .7 * k; ctx.fillStyle = '#e8f8ff'; ctx.fillRect(c.x - c.r * .4, c.y - c.r * .25, 8, 2);
    ctx.globalAlpha = 1;
  }
}
function drawBoulders() {
  if (!G.boulders) return;
  for (const b of G.boulders) {
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(b.x, b.y + b.r * .8, b.r, b.r * .4, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.spin);
    ctx.fillStyle = '#7a6046'; ctx.fillRect(-b.r, -b.r * .8, b.r * 2, b.r * 1.6); ctx.fillRect(-b.r * .8, -b.r, b.r * 1.6, b.r * 2);
    ctx.fillStyle = '#9a7a58'; ctx.fillRect(-b.r * .6, -b.r * .7, b.r * .7, b.r * .5);
    ctx.fillStyle = '#4e3c2a'; ctx.fillRect(b.r * .1, b.r * .2, b.r * .6, b.r * .35);
    ctx.restore();
  }
}
// columna: se dibuja desde drawProp
function drawPillar(o) {
  const h = 34 * (o.rise || 0), w = o.flash > 0;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(o.x, o.y + 6, 17, 7, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = w ? '#fff' : '#6a5440'; ctx.fillRect(o.x - 14, o.y + 6 - h, 28, h);
  ctx.fillStyle = w ? '#fff' : '#9a7a58'; ctx.fillRect(o.x - 16, o.y + 2 - h, 32, 8);
  ctx.fillStyle = '#4e3c2a'; ctx.fillRect(o.x - 6, o.y + 14 - h, 3, h * .6); ctx.fillRect(o.x + 5, o.y + 10 - h, 3, h * .4);
  if (o.temp < 1.5 && Math.floor(G.time * 10) % 2) { ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(o.x - 14, o.y + 6 - h, 28, h); }
}
// lanzallamas del Elemental de fuego: cono que gira despacio hacia ti
function flameCone(e, a, reach, half, dt) {
  const p = G.player, ox = e.x + Math.cos(a) * e.r, oy = e.y + Math.sin(a) * e.r;
  for (let i = 0; i < 6; i++) { const an = a + rand(-half, half) * .9, sp = reach * rand(2.4, 3.2); G.parts.push({ x: ox, y: oy, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: .36, max: .36, color: Math.random() < .35 ? '#ffd27a' : Math.random() < .5 ? '#ff8a3a' : '#e8402a', size: rand(5, 10) }); }
  const d = dist(p, { x: ox, y: oy });
  let da = Math.abs(angTo({ x: ox, y: oy }, p) - a); if (da > Math.PI) da = TAU - da;
  if (!G.over && d < reach && da < half + p.r / Math.max(30, d) && hurtPlayer(e.dmg, e.name)) elemHit('fire', e);
  // deja el suelo ardiendo por donde pasa
  e.burnAcc = (e.burnAcc || 0) + dt;
  if (e.burnAcc > .3) {
    e.burnAcc = 0;
    const r = rand(.45, .9) * reach, fx = ox + Math.cos(a) * r, fy = oy + Math.sin(a) * r;
    if (!hitsWall(fx, fy, 8)) (G.flames || (G.flames = [])).push({ x: fx, y: fy, r: 26, t: 3, fight: true });
  }
}
// empuja o atrae al jugador (aire)
function windPull(e, k, dt) {
  const p = G.player, a = angTo(p, e);
  moveEnt(p, Math.cos(a) * k * dt, Math.sin(a) * k * dt);
}

export { addPuddle, drawBoulders, drawPillar, drawPuddles, flameCone, raisePillar, throwBoulder, updateElemPowers, windPull };
