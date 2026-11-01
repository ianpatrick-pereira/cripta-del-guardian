// ================= Ambiente: decoración, vegetación y luces =================
// cada piso tiene su paleta de luz, plantas y objetos; edge = junto a los muros, open = en el centro de la sala
// la decoración de cada piso se diseña en src/datos/pisos/ (bloque "ambiente"); aquí se traduce al formato del motor
import { DATOS } from '../datos/index.js';
import { ctx } from './00-inicio.js';
import { CRACK, DOOR, FLOOR, MH, MW, TAU, TILE, VOID, WALL, clamp, hash, rand } from './01-utilidades.js';
import { FLOORS } from './03-datos-del-juego.js';
import { G } from './07-estado.js';
const AMB_COSAS = { huesos: 'bones', velas: 'candles', cristales: 'crystal', musgo: 'moss', hierba: 'grass', charcos: 'puddle', runas: 'rune', hongos: 'mushroom', espinas: 'thorn', escarcha: 'frost', lava: 'lava', flores: 'flowers', vidrios: 'glass', rosas: 'roses' };
const AMB_PART = { polvo: 'dust', esporas: 'spore', brasas: 'ember', nieve: 'snow', luciernagas: 'firefly', chispas: 'spark', petalos: 'petal' };
const AMB = DATOS.pisos.map(({ ambiente: d }) => {
  const tipos = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [AMB_COSAS[k], v]));
  return { torch: d.antorchas, glow: d.brillo, banner: d.estandartes, plant: d.plantas, flower: d.flores, puddle: d.charcos, mote: AMB_PART[d.particulas],
    gap: d.antorchaCada, web: d.telaranas, vine: d.enredaderas, vig: d.vineta, pe: d.densidadBordes, po: d.densidadCentro, edge: tipos(d.bordes), open: tipos(d.centro) };
});
const GLOW_MOTES = { firefly: 1, ember: 1, spark: 1, spore: 1 };
function pickW(obj, h) { let s = 0; for (const k in obj) s += obj[k]; let v = h * s; for (const k in obj) { v -= obj[k]; if (v <= 0) return k; } return Object.keys(obj)[0]; }
function hexA(c, a) { const n = parseInt(c.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }

function buildDecor() {
  const A = AMB[G.fi], D = [], L = [], T = G.tiles, horror = FLOORS[G.fi].horror;
  const at = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? VOID : T[y * MW + x];
  const isF = t => t === FLOOR || t === DOOR, solid = t => t === WALL || t === CRACK;
  const add = (kind, x, y, room, o) => { const d = { kind, x, y, room, ph: hash(x | 0, y | 0) * TAU, ...o }; D.push(d); return d; };
  const light = (x, y, r, c, room, f = 1) => L.push({ x, y, r, c, room, f, ph: hash(y | 0, x | 0) * TAU });
  for (const r of G.rooms) {
    const seed = G.floor * 97;
    // muros con cara visible (borde superior y pilares): antorchas, estandartes, cadenas y enredaderas
    for (let ty = r.y; ty < r.y + r.h - 1; ty++) for (let tx = r.x + 1; tx < r.x + r.w - 1; tx++) {
      if (at(tx, ty) !== WALL || !isF(at(tx, ty + 1))) continue;
      const x = tx * TILE + TILE / 2, y = ty * TILE + TILE, h = hash(tx * 7 + 3 + seed, ty * 13), top = ty === r.y;
      if (top ? (tx - r.x) % A.gap === 2 : h < .4) { add('torch', x, y, r); light(x, y - 18, horror ? 105 : 140, A.torch, r); continue; }
      if (!top) continue;
      if (h < .2) add('banner', x, y, r);
      else if (h < .2 + A.vine) add('vine', x - 9 + hash(tx, ty + 5) * 18, y, r, { len: 16 + hash(tx + 9, ty) * 30 });
      else if (h > .9) add('chain', x, y, r);
    }
    // braseros en las esquinas de las salas grandes
    const corners = [[r.x + 2, r.y + 2], [r.x + r.w - 3, r.y + 2], [r.x + 2, r.y + r.h - 3], [r.x + r.w - 3, r.y + r.h - 3]];
    const braz = r.w >= 17 && hash(r.gx + seed, r.gy) < (horror ? .35 : .7);
    const skip = new Set();
    if (braz) for (const [cx, cy] of corners) {
      if (at(cx, cy) !== FLOOR) continue;
      skip.add(cy * MW + cx);
      const x = cx * TILE + TILE / 2, y = cy * TILE + TILE / 2 + 6;
      if (horror) { add('candles', x, y, r); light(x, y - 8, 80, A.torch, r, .9); }
      else { add('brazier', x, y, r); light(x, y - 16, 175, A.torch, r); }
    }
    // telarañas en las esquinas de arriba
    if (hash(r.gx * 5 + seed, r.gy * 3) < A.web && at(r.x + 1, r.y + 1) === FLOOR) add('web', r.x * TILE + TILE * 2 - 1, (r.y + 1) * TILE, r, { dir: 1 });
    if (hash(r.gx * 3, r.gy * 5 + seed) < A.web && at(r.x + r.w - 2, r.y + 1) === FLOOR) add('web', (r.x + r.w - 1) * TILE - TILE + 1, (r.y + 1) * TILE, r, { dir: -1 });
    // suelo: plantas, huesos, velas, cristales, runas...
    for (let ty = r.y + 1; ty < r.y + r.h - 1; ty++) for (let tx = r.x + 1; tx < r.x + r.w - 1; tx++) {
      if (at(tx, ty) !== FLOOR || skip.has(ty * MW + tx)) continue;
      if (at(tx - 1, ty) === DOOR || at(tx + 1, ty) === DOOR || at(tx, ty - 1) === DOOR || at(tx, ty + 1) === DOOR) continue;
      const h = hash(tx * 31 + seed, ty * 19 + 5), h2 = hash(tx + 101, ty * 3 + seed), h3 = hash(tx * 3 + seed, ty + 77);
      const edge = solid(at(tx - 1, ty)) || solid(at(tx + 1, ty)) || solid(at(tx, ty - 1)) || solid(at(tx, ty + 1));
      const central = Math.abs(tx - r.tcx) <= 4 && Math.abs(ty - r.tcy) <= 3;
      let kind;
      if (edge && h < A.pe) kind = pickW(A.edge, h2);
      else if (!edge && !central && h < A.po) kind = pickW(A.open, h2);
      else if (central && h < A.po * .4 && (A.open.grass || A.open.moss)) kind = A.open.grass ? 'grass' : 'moss';
      else continue;
      const x = tx * TILE + 6 + h2 * 20, y = ty * TILE + 10 + h3 * 18;
      add(kind, x, y, r, { s: .8 + h3 * .5, c2: h > A.pe * .5 });
      if (kind === 'candles') light(x, y - 8, 75, A.torch, r, .8);
      else if (kind === 'crystal') light(x, y - 8, 85, A.glow, r, .85);
      else if (kind === 'mushroom') light(x, y - 4, 55, A.glow, r, .65);
      else if (kind === 'rune') light(x, y, 65, A.glow, r, .7);
      else if (kind === 'lava') light(x, y, 55, '#ff6a2a', r, .7);
      else if (kind === 'glass') light(x, y, 60, A.flower, r, .55);
    }
  }
  D.sort((a, b) => a.y - b.y);
  G.decor = D; G.lights = L; G.decorOf = G.tiles; G.motes = [];
}

// cuánto se inclina una planta: brisa suave + se aparta cuando el jugador pasa encima
function sway(d, k = 1) {
  let s = (Math.sin(G.time * 1.4 + d.ph + d.x * .02) * 2.2 + Math.sin(G.time * .55 + d.y * .03) * 1.3) * k;
  const p = G.player, dx = d.x - p.x, dy = d.y - p.y, q = dx * dx + dy * dy;
  if (q < 1000) s += (dx >= 0 ? 1 : -1) * (32 - Math.sqrt(q)) * .4 * k;
  return s;
}
// cada mata de pasto se dibuja una vez por inclinación (redondeada a 1 px) y se guarda: copiar una imagen es mucho más barato que trazar curvas
const BLADE = new Map();
function blades(x, y, n, hgt, col, sw, lw = 1.6) {
  const hh = Math.round(hgt), si = Math.max(-16, Math.min(16, Math.round(sw))), key = n + col + hh + ':' + si;
  let c = BLADE.get(key);
  if (!c) {
    const W = 52, H = hh + 4;
    c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2;
    const g = c.getContext('2d'); g.scale(2, 2); g.lineCap = 'round'; g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
    for (let i = 0; i < n; i++) {
      const o = i - (n - 1) / 2, bx = W / 2 + o * 2.6, by = H - 1, h2 = hh * (.72 + .28 * Math.sin(i * 2.3 + 1)), lean = o * 1.8;
      g.moveTo(bx, by); g.quadraticCurveTo(bx + lean * .5 + si * .3, by - h2 * .55, bx + lean + si, by - h2);
    }
    g.stroke();
    BLADE.set(key, c);
  }
  ctx.drawImage(c, x - 26, y - c.height / 2 + 1, c.width / 2, c.height / 2);
}
function flame(x, y, c, s, t, ph) {
  const f = .86 + .14 * Math.sin(t * 13 + ph) + .07 * Math.sin(t * 23 + ph * 2), lean = Math.sin(t * 3 + ph) * 1.2 * s;
  ctx.fillStyle = hexA(c, .22); ctx.beginPath(); ctx.arc(x, y - 4 * s, 10 * s * f, 0, TAU); ctx.fill();
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - 3.8 * s, y); ctx.quadraticCurveTo(x - 4 * s, y - 6 * s * f, x + lean, y - 12 * s * f); ctx.quadraticCurveTo(x + 4 * s, y - 6 * s * f, x + 3.8 * s, y); ctx.fill();
  ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.ellipse(x + lean * .3, y - 3 * s, 1.7 * s, 3.6 * s * f, 0, 0, TAU); ctx.fill();
}

function drawDecor(vx0, vy0, vx1, vy1) {
  if (G.decorOf !== G.tiles) buildDecor();
  const A = AMB[G.fi], t = G.time;
  ctx.lineCap = 'round';
  for (const d of G.decor) {
    if (d.room && !d.room.visited) continue;
    const { x, y } = d;
    if (x < vx0 - 40 || x > vx1 + 40 || y < vy0 - 40 || y > vy1 + 60) continue;
    switch (d.kind) {
      case 'torch': {
        ctx.fillStyle = '#1e1812'; ctx.fillRect(x - 2, y - 13, 4, 9);
        ctx.fillStyle = '#6a5236'; ctx.fillRect(x - 5, y - 15, 10, 3); ctx.fillRect(x - 1, y - 6, 2, 3);
        flame(x, y - 15, A.torch, 1, t, d.ph);
        if (Math.random() < .025) G.parts.push({ x: x + rand(-2, 2), y: y - 26, vx: rand(-12, 12), vy: rand(-55, -30), life: .7, max: .7, color: A.torch, size: 2 });
        break;
      }
      case 'brazier': {
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 2, 13, 4, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#3a2e24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x - 4, y - 9); ctx.moveTo(x + 7, y); ctx.lineTo(x + 4, y - 9); ctx.moveTo(x, y + 1); ctx.lineTo(x, y - 9); ctx.stroke();
        ctx.fillStyle = '#4a3a2c'; ctx.beginPath(); ctx.moveTo(x - 11, y - 14); ctx.lineTo(x + 11, y - 14); ctx.lineTo(x + 7, y - 8); ctx.lineTo(x - 7, y - 8); ctx.fill();
        ctx.fillStyle = '#7a6040'; ctx.fillRect(x - 11, y - 15, 22, 2);
        ctx.fillStyle = '#ff9a3a'; ctx.fillRect(x - 8, y - 14, 16, 2);
        flame(x - 4, y - 14, A.torch, 1.1, t, d.ph); flame(x + 4, y - 14, A.torch, 1.15, t, d.ph + 2); flame(x, y - 15, A.torch, 1.4, t, d.ph + 4);
        if (Math.random() < .06) G.parts.push({ x: x + rand(-6, 6), y: y - 30, vx: rand(-15, 15), vy: rand(-70, -40), life: .9, max: .9, color: Math.random() < .5 ? A.torch : '#ffe2a0', size: 2 });
        break;
      }
      case 'banner': {
        const sw = Math.sin(t * 1.1 + d.ph) * 1.6;
        ctx.fillStyle = '#3a2c1c'; ctx.fillRect(x - 9, y - 16, 18, 2);
        ctx.fillStyle = A.banner; ctx.beginPath(); ctx.moveTo(x - 7, y - 14); ctx.lineTo(x + 7, y - 14); ctx.lineTo(x + 7 + sw, y + 9); ctx.lineTo(x + sw, y + 3); ctx.lineTo(x - 7 + sw, y + 9); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 3, y - 14, 4, 10);
        ctx.fillStyle = '#d8a84a'; ctx.fillRect(x - 7, y - 14, 14, 2);
        const ex = x + sw * .45, ey = y - 5;
        ctx.beginPath(); ctx.moveTo(ex, ey - 5); ctx.lineTo(ex + 3.5, ey); ctx.lineTo(ex, ey + 5); ctx.lineTo(ex - 3.5, ey); ctx.fill();
        ctx.fillStyle = A.banner; ctx.fillRect(ex - 1, ey - 1, 2, 2);
        break;
      }
      case 'chain': {
        ctx.strokeStyle = '#5e5664'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(x + Math.sin(t * .9 + d.ph) * i * .5, y - 13 + i * 4, i & 1 ? 1 : 1.8, 2.4, 0, 0, TAU); ctx.stroke(); }
        break;
      }
      case 'vine': {
        ctx.strokeStyle = A.plant[0]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 14);
        const pts = [];
        for (let k = 1; k <= 6; k++) { const yy = y - 14 + k * d.len / 6, xx = x + Math.sin(t * 1.2 + d.ph + k * .7) * k * .55; ctx.lineTo(xx, yy); pts.push([xx, yy]); }
        ctx.stroke();
        ctx.fillStyle = A.plant[1];
        pts.forEach(([xx, yy], k) => { ctx.beginPath(); ctx.ellipse(xx + (k & 1 ? 3 : -3), yy, 3, 1.6, k & 1 ? .5 : -.5, 0, TAU); ctx.fill(); });
        if (G.fi === 5) { ctx.fillStyle = A.flower; const [fx, fy] = pts[pts.length - 1]; ctx.fillRect(fx - 1.5, fy, 3, 3); }
        break;
      }
      case 'web': {
        const s = d.dir;
        ctx.strokeStyle = 'rgba(220,215,230,.22)'; ctx.lineWidth = 1; ctx.beginPath();
        for (let i = 0; i <= 4; i++) { const a = i / 4 * Math.PI / 2; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 26 * s, y + Math.sin(a) * 26); }
        for (const R of [8, 15, 22]) { for (let i = 0; i <= 4; i++) { const a = i / 4 * Math.PI / 2, px = x + Math.cos(a) * R * s, py = y + Math.sin(a) * R; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } }
        ctx.stroke();
        break;
      }
      case 'candles': {
        ctx.fillStyle = 'rgba(216,204,176,.3)'; ctx.beginPath(); ctx.ellipse(x, y, 10, 3, 0, 0, TAU); ctx.fill();
        for (let i = 0; i < 3; i++) {
          const cx = x + (i - 1) * 5, hh = 5 + ((i * 7 + d.ph * 3) | 0) % 6;
          ctx.fillStyle = '#d8ccb0'; ctx.fillRect(cx - 1.5, y - hh, 3, hh); ctx.fillStyle = '#b8a888'; ctx.fillRect(cx + .5, y - hh, 1, hh);
          const f = .85 + .15 * Math.sin(t * 15 + i * 2 + d.ph);
          ctx.fillStyle = hexA(A.torch, .3); ctx.beginPath(); ctx.arc(cx, y - hh - 3, 4 * f, 0, TAU); ctx.fill();
          ctx.fillStyle = A.torch; ctx.beginPath(); ctx.ellipse(cx, y - hh - 2.5, 1.4, 2.6 * f, 0, 0, TAU); ctx.fill();
        }
        break;
      }
      case 'bones': {
        ctx.fillStyle = '#c9c0aa';
        if (d.c2) { ctx.beginPath(); ctx.arc(x, y - 3, 4.2, 0, TAU); ctx.fill(); ctx.fillRect(x - 2.5, y, 5, 3); ctx.fillStyle = '#1a1620'; ctx.fillRect(x - 2.6, y - 4, 2, 2); ctx.fillRect(x + .6, y - 4, 2, 2); ctx.fillRect(x - .5, y - 1, 1, 1.5); }
        ctx.save(); ctx.translate(x + 9, y + 2); ctx.rotate(d.ph); ctx.fillStyle = '#b8af98';
        ctx.fillRect(-6, -1, 12, 2); ctx.beginPath(); ctx.arc(-6, -1, 1.6, 0, TAU); ctx.arc(-6, 1, 1.6, 0, TAU); ctx.arc(6, -1, 1.6, 0, TAU); ctx.arc(6, 1, 1.6, 0, TAU); ctx.fill();
        ctx.restore();
        break;
      }
      case 'crystal': {
        const p = .65 + .35 * Math.sin(t * 2 + d.ph);
        ctx.fillStyle = hexA(A.glow, .18 * p); ctx.beginPath(); ctx.arc(x, y - 6, 14, 0, TAU); ctx.fill();
        for (const [ox, hh, w] of [[-5, 9, 3], [5, 10, 3], [0, 15, 4]]) {
          ctx.fillStyle = hexA(A.glow, .55 + .3 * p); ctx.beginPath(); ctx.moveTo(x + ox - w, y); ctx.lineTo(x + ox - w * .6, y - hh * .7); ctx.lineTo(x + ox, y - hh); ctx.lineTo(x + ox + w, y); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x + ox - 1, y - hh * .8, 1, hh * .6);
        }
        break;
      }
      case 'mushroom': {
        const p = .6 + .4 * Math.sin(t * 1.6 + d.ph);
        for (const [ox, hh, rr] of [[0, 7, 4.5], [-6, 4, 3], [6, 5, 3.2]]) {
          ctx.fillStyle = '#c8c0a8'; ctx.fillRect(x + ox - 1, y - hh, 2, hh);
          ctx.fillStyle = hexA(A.glow, .25 * p); ctx.beginPath(); ctx.arc(x + ox, y - hh, rr + 4, 0, TAU); ctx.fill();
          ctx.fillStyle = hexA(A.glow, .75 + .25 * p); ctx.beginPath(); ctx.ellipse(x + ox, y - hh, rr, rr * .6, 0, Math.PI, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x + ox - 1, y - hh - rr * .4, 1.2, 1.2);
        }
        break;
      }
      case 'moss': {
        ctx.fillStyle = hexA(A.plant[0], .55);
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(x + Math.cos(d.ph + i * 1.7) * 7, y + Math.sin(d.ph + i * 2.3) * 4, 6 - i, 3.5 - i * .5, 0, 0, TAU); ctx.fill(); }
        ctx.fillStyle = hexA(A.plant[1], .45); ctx.beginPath(); ctx.ellipse(x + 2, y - 1, 3, 2, 0, 0, TAU); ctx.fill();
        break;
      }
      case 'grass': blades(x, y, 5, 10 * d.s, A.plant[d.c2 ? 1 : 0], sway(d)); blades(x + 3, y + 1, 3, 7 * d.s, A.plant[d.c2 ? 0 : 1], sway(d) * .8); break;
      case 'flowers': case 'roses': {
        const sw = sway(d);
        blades(x, y, 4, 9 * d.s, A.plant[1], sw * .7);
        ctx.fillStyle = A.flower;
        for (let i = 0; i < 3; i++) { const o = i - 1, fx = x + o * 4 + sw * (.8 + i * .1), fy = y - 10 * d.s - (i & 1) * 3; ctx.beginPath(); ctx.arc(fx, fy, d.kind === 'roses' ? 2.6 : 2, 0, TAU); ctx.fill(); }
        ctx.fillStyle = d.kind === 'roses' ? 'rgba(60,0,10,.6)' : '#fff2a0';
        for (let i = 0; i < 3; i++) { const o = i - 1; ctx.fillRect(x + o * 4 + sw * (.8 + i * .1) - .6, y - 10 * d.s - (i & 1) * 3 - .6, 1.2, 1.2); }
        break;
      }
      case 'thorn': {
        const sw = sway(d, .4);
        ctx.strokeStyle = A.plant[1]; ctx.lineWidth = 1.3; ctx.beginPath();
        for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * .45, L = 9 + i % 2 * 4; const ex = x + Math.cos(a) * L + sw, ey = y + Math.sin(a) * L; ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.moveTo(x + (ex - x) * .5, y + (ey - y) * .5); ctx.lineTo(x + (ex - x) * .5 + 3, y + (ey - y) * .5 - 2); }
        ctx.stroke();
        break;
      }
      case 'puddle': {
        ctx.fillStyle = A.puddle; ctx.beginPath(); ctx.ellipse(x, y, 11 * d.s, 5 * d.s, 0, 0, TAU); ctx.fill();
        const k = (t * .35 + d.ph) % 1;
        ctx.strokeStyle = `rgba(255,255,255,${.18 * (1 - k)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y, 3 + k * 8 * d.s, 1.5 + k * 3.5 * d.s, 0, 0, TAU); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x - 5 + Math.sin(t + d.ph) * 2, y - 2, 4, 1);
        break;
      }
      case 'rune': {
        const p = .5 + .5 * Math.sin(t * 1.3 + d.ph);
        ctx.save(); ctx.translate(x, y); ctx.scale(1, .55); ctx.rotate(t * .2 + d.ph);
        ctx.strokeStyle = hexA(A.glow, .25 + .35 * p); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.stroke();
        ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12); } ctx.closePath(); ctx.stroke();
        for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.fillStyle = hexA(A.glow, .4 + .5 * p); ctx.fillRect(Math.cos(a) * 15 - 1, Math.sin(a) * 15 - 1, 2, 2); }
        ctx.restore();
        break;
      }
      case 'lava': {
        const p = .55 + .45 * Math.sin(t * 2.2 + d.ph);
        ctx.strokeStyle = `rgba(255,${110 + 60 * p | 0},40,${.5 + .4 * p})`; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(x - 10, y - 3); ctx.lineTo(x - 4, y + 1); ctx.lineTo(x + 1, y - 4); ctx.lineTo(x + 9, y + 2); ctx.moveTo(x + 1, y - 4); ctx.lineTo(x + 3, y - 10);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,230,160,${.35 * p})`; ctx.lineWidth = .8; ctx.stroke();
        break;
      }
      case 'frost': {
        ctx.strokeStyle = 'rgba(200,230,255,.35)'; ctx.lineWidth = 1; ctx.beginPath();
        for (let i = 0; i < 3; i++) { const a = d.ph + i * Math.PI / 3; ctx.moveTo(x - Math.cos(a) * 6, y - Math.sin(a) * 4); ctx.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 4); }
        ctx.stroke();
        ctx.fillStyle = 'rgba(220,240,255,.18)'; ctx.beginPath(); ctx.ellipse(x + 8, y + 3, 7, 3, 0, 0, TAU); ctx.fill();
        if (Math.sin(t * 2 + d.ph * 5) > .97) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, y - 1, 2, 2); }
        break;
      }
      case 'glass': {
        // luz de vitral que cae sobre el suelo
        const p = .6 + .4 * Math.sin(t * .8 + d.ph), cols = [A.flower, A.glow, A.torch, '#7ab8ff'];
        for (let i = 0; i < 4; i++) {
          const ox = (i & 1) * 9 - 4.5, oy = (i >> 1) * 6 - 3;
          ctx.fillStyle = hexA(cols[i], .14 * p); ctx.beginPath(); ctx.moveTo(x + ox, y + oy - 4); ctx.lineTo(x + ox + 5, y + oy); ctx.lineTo(x + ox, y + oy + 4); ctx.lineTo(x + ox - 5, y + oy); ctx.fill();
        }
        break;
      }
    }
  }
  ctx.lineCap = 'butt';
}

// motas de ambiente: polvo, esporas, brasas, nieve, chispas, luciérnagas, pétalos
function tickMotes(vx0, vy0, vx1, vy1) {
  const A = AMB[G.fi], M = G.motes || (G.motes = []);
  const dt = clamp(G.time - (G.moteT ?? G.time), 0, .05); G.moteT = G.time;
  for (let i = M.length - 1; i >= 0; i--) {
    const m = M[i];
    m.life -= dt; m.x += m.vx * dt; m.y += m.vy * dt;
    if (m.wander) { m.vx += Math.sin(G.time * 1.3 + m.ph) * m.wander * dt; m.vy += Math.cos(G.time * 1.1 + m.ph * 1.7) * m.wander * dt; }
    if (m.life <= 0 || m.x < vx0 - 80 || m.x > vx1 + 80 || m.y < vy0 - 80 || m.y > vy1 + 80) M.splice(i, 1);
  }
  const want = FLOORS[G.fi].horror ? 18 : GLOW_MOTES[A.mote] ? 26 : 40;
  for (let n = 0; n < 3 && M.length < want && dt > 0; n++) {
    const x = rand(vx0, vx1), y = rand(vy0, vy1), tt = G.tiles[Math.floor(y / TILE) * MW + Math.floor(x / TILE)];
    if (tt !== FLOOR) continue;
    const rm = G.rooms.find(r => x >= r.x * TILE && x < (r.x + r.w) * TILE && y >= r.y * TILE && y < (r.y + r.h) * TILE);
    if (rm && !rm.visited) continue;
    const ty = A.mote, m = { x, y, ph: Math.random() * TAU, type: ty };
    if (ty === 'dust') Object.assign(m, { vx: rand(-6, 6), vy: rand(-5, 3), life: rand(4, 8), size: rand(1, 2), c: '#ffe6b4', wander: 6 });
    else if (ty === 'firefly') Object.assign(m, { vx: rand(-14, 14), vy: rand(-14, 14), life: rand(5, 9), size: 2, c: '#e8ff7a', wander: 26 });
    else if (ty === 'ember') Object.assign(m, { vx: rand(-10, 10), vy: rand(-38, -15), life: rand(2, 4), size: rand(1, 1.8), c: Math.random() < .5 ? '#ff7a2a' : A.torch, wander: 10 });
    else if (ty === 'snow') Object.assign(m, { vx: rand(4, 14), vy: rand(10, 22), life: rand(6, 9), size: rand(1.5, 2.5), c: '#eaf6ff', wander: 8 });
    else if (ty === 'spark') Object.assign(m, { vx: rand(-5, 5), vy: rand(-20, -8), life: rand(2, 4), size: 1.8, c: Math.random() < .7 ? '#d8a6ff' : '#ffd27a', wander: 6 });
    else if (ty === 'spore') Object.assign(m, { vx: rand(-6, 6), vy: rand(-12, -4), life: rand(4, 7), size: 2, c: '#b8ff9a', wander: 8 });
    else Object.assign(m, { vx: rand(8, 18), vy: rand(6, 14), life: rand(5, 8), size: 2.6, c: '#ff6a8a', wander: 10 });
    m.max = m.life; M.push(m);
  }
}
function moteAlpha(m) { return clamp(Math.min((m.max - m.life) / .8, m.life / .8), 0, 1); }
// motas que no brillan: se dibujan con el mundo (quedan en penumbra)
function drawMotesFlat() {
  for (const m of G.motes || []) {
    if (GLOW_MOTES[m.type]) continue;
    ctx.globalAlpha = moteAlpha(m) * (m.type === 'dust' ? .45 : .8); ctx.fillStyle = m.c;
    if (m.type === 'petal') { ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(G.time * 2 + m.ph); ctx.fillRect(-m.size, -m.size / 2, m.size * 2, m.size); ctx.restore(); }
    else ctx.fillRect(m.x - m.size / 2, m.y - m.size / 2, m.size, m.size);
  }
  ctx.globalAlpha = 1;
}
// motas que brillan: encima de la oscuridad, con suma de luz
function drawMotesGlow() {
  ctx.globalCompositeOperation = 'lighter';
  for (const m of G.motes || []) {
    if (!GLOW_MOTES[m.type]) continue;
    let a = moteAlpha(m);
    if (m.type === 'firefly') a *= .35 + .65 * Math.max(0, Math.sin(G.time * 2.4 + m.ph));
    ctx.fillStyle = m.c;
    if (m.type === 'firefly') { ctx.globalAlpha = a * .25; ctx.beginPath(); ctx.arc(m.x, m.y, m.size * 2.5, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = a; ctx.fillRect(m.x - m.size / 2, m.y - m.size / 2, m.size, m.size);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

export { AMB, drawDecor, drawMotesFlat, drawMotesGlow, flame, hexA, tickMotes };
