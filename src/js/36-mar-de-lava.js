// ================= Mar de lava: lo que rodea la mazmorra =================
// textura de 256 px que se repite sin costuras; se dibuja una vez y luego solo se desplaza
import { ctx } from './00-inicio.js';
import { CRACK, DOOR, FLOOR, MH, MW, TAU, TILE, VOID, WALL, clamp, hash, rand } from './01-utilidades.js';
import { FLOORS } from './03-datos-del-juego.js';
import { G } from './07-estado.js';
import { gfxLevel, zoom } from './34-dibujo.js';
import { AMB, flame, hexA } from './35-ambiente.js';
const LAVA_T = 256;
// cada piso tiene su propio "mar" (src/datos/pisos/, bloque "mar"): lava, ciénaga, vacío con estrellas, agua helada...
const rgbOf = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const SEA_TEX = [];
function seaTex(fi) {
  if (SEA_TEX[fi]) return SEA_TEX[fi];
  const M = FLOORS[fi].mar, c = document.createElement('canvas'); c.width = c.height = LAVA_T;
  const g = c.getContext('2d');
  g.fillStyle = M.fondo; g.fillRect(0, 0, LAVA_T, LAVA_T);
  let seed = 7 + fi; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const wrap = (fn) => { for (const ox of [-LAVA_T, 0, LAVA_T]) for (const oy of [-LAVA_T, 0, LAVA_T]) fn(ox, oy); };
  const [hotC, midC, coldC] = M.manchas.map(rgbOf);
  // manchas calientes y zonas más frías; más tenues que antes para que el fondo no le gane al combate
  for (let i = 0; i < 46; i++) {
    const x = rnd() * LAVA_T, y = rnd() * LAVA_T, r = 14 + rnd() * 46, hot = rnd();
    const col = hot > .7 ? hotC : hot > .35 ? midC : coldC;
    wrap((ox, oy) => {
      const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
      gr.addColorStop(0, `rgba(${col},${hot > .7 ? .26 : .32})`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
    });
  }
  // costra: placas con un borde brillante
  for (let i = 0; i < 40; i++) {
    const x = rnd() * LAVA_T, y = rnd() * LAVA_T, n = 5 + (rnd() * 3 | 0), R = 7 + rnd() * 11, pts = [];
    for (let k = 0; k < n; k++) { const a = k / n * TAU + rnd() * .5; pts.push([Math.cos(a) * R * (.7 + rnd() * .4), Math.sin(a) * R * (.7 + rnd() * .4)]); }
    wrap((ox, oy) => {
      g.beginPath(); pts.forEach(([px, py], k) => k ? g.lineTo(x + ox + px, y + oy + py) : g.moveTo(x + ox + px, y + oy + py)); g.closePath();
      g.fillStyle = M.costra; g.fill();
      g.strokeStyle = M.grietas; g.lineWidth = 1.5; g.stroke();
    });
  }
  // puntitos de luz (chispas, esporas o estrellas)
  for (let i = 0; i < 70; i++) { const x = rnd() * LAVA_T, y = rnd() * LAVA_T; g.fillStyle = rnd() > .5 ? M.chispas[0] : M.chispas[1]; g.fillRect(x, y, rnd() > .85 ? 2 : 1.5, rnd() > .85 ? 2 : 1.5); }
  return SEA_TEX[fi] = c;
}

// bordes del mar de lava (vacío pegado a un muro): de ahí sale el vapor y se ven llamas
function buildLava() {
  const E = [], T = G.tiles;
  for (let ty = 1; ty < MH - 1; ty++) for (let tx = 1; tx < MW - 1; tx++) {
    if (T[ty * MW + tx] !== VOID) continue;
    if (T[ty * MW + tx - 1] === WALL || T[ty * MW + tx + 1] === WALL || T[(ty - 1) * MW + tx] === WALL || T[(ty + 1) * MW + tx] === WALL) E.push(tx, ty);
  }
  // máscara de 1 píxel por baldosa: el mar de lava brilla y atraviesa la oscuridad
  const m = document.createElement('canvas'); m.width = MW; m.height = MH;
  const mg = m.getContext('2d'), img = mg.createImageData(MW, MH);
  for (let i = 0; i < T.length; i++) if (T[i] === VOID) img.data[i * 4 + 3] = 255;
  mg.putImageData(img, 0, 0);
  G.lava = { edge: E, mask: m, fx: [], of: G.tiles };
}

function drawLavaSea(vx0, vy0, vx1, vy1) {
  if (!G.lava || G.lava.of !== G.tiles) buildLava();
  const t = G.time, M = FLOORS[G.fi].mar;
  // burbujas y llamas pegadas a los bordes
  const L = G.lava, FX = L.fx, dt = clamp(t - (L.t ?? t), 0, .05); L.t = t;
  const tile = (x, y) => G.tiles[Math.floor(y / TILE) * MW + Math.floor(x / TILE)];
  for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.life -= dt; f.y += f.vy * dt; f.x += f.vx * dt; if (f.life <= 0) FX.splice(i, 1); }
  const lo = !gfxLevel();
  if (dt > 0) {
    // burbujas en cualquier parte del mar
    for (let n = 0; n < 2; n++) {
      if (FX.length > (lo ? 30 : 60) || Math.random() > .6) break;
      const x = rand(vx0, vx1), y = rand(vy0, vy1);
      if (tile(x, y) === VOID) FX.push({ k: 'bub', x, y, vx: 0, vy: 0, life: rand(.8, 1.6), max: 0, r: rand(3, 8) });
    }
    // vapor que sale de los costados
    const E = L.edge;
    for (let n = 0; n < 3 && E.length; n++) {
      if (FX.length > (lo ? 40 : 80) || Math.random() > .7) break;
      const j = (Math.random() * E.length / 2 | 0) * 2, x = (E[j] + Math.random()) * TILE, y = (E[j + 1] + Math.random()) * TILE;
      if (x < vx0 - 40 || x > vx1 + 40 || y < vy0 - 40 || y > vy1 + 40) continue;
      FX.push({ k: 'steam', x, y, vx: rand(-8, 8), vy: rand(-34, -18), life: rand(1.6, 2.8), max: 0, r: rand(6, 11) });
    }
  }
  for (const f of FX) {
    if (!f.max) f.max = f.life;
    const k = 1 - f.life / f.max;
    if (f.k === 'bub') {
      // crece, brilla y revienta
      const r = f.r * Math.min(1, k * 1.6);
      if (k < .8) {
        ctx.fillStyle = M.burbujas; ctx.globalAlpha = .75; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = M.grietas; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = M.chispas[0]; ctx.fillRect(f.x - r * .45, f.y - r * .45, 2, 2);
      } else {
        const q = (k - .8) / .2;
        ctx.strokeStyle = M.grietas; ctx.globalAlpha = 1 - q; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 + q * .8), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
  }
}
// vapor y llamas de los bordes: por encima de los muros, debajo de los personajes
function drawLavaSteam(vx0, vy0, vx1, vy1) {
  if (!G.lava) return;
  const t = G.time, E = G.lava.edge, M = FLOORS[G.fi].mar;
  // llamas fijas en algunos bordes (una de cada pocas baldosas)
  if (M.llamas) for (let i = 0; i < E.length; i += 2) {
    const tx = E[i], ty = E[i + 1];
    if (hash(tx * 5 + 1, ty * 9 + 2) > .16) continue;
    const x = (tx + .5) * TILE, y = (ty + .8) * TILE;
    if (x < vx0 - 30 || x > vx1 + 30 || y < vy0 - 30 || y > vy1 + 40) continue;
    flame(x, y, M.llamas, 1.1 + .3 * Math.sin(t * 2 + tx), t, tx * 1.7 + ty);
  }
  for (const f of G.lava.fx) {
    if (f.k !== 'steam') continue;
    const k = 1 - f.life / f.max, a = Math.min(k * 4, 1) * (1 - k) * .2;
    ctx.fillStyle = hexA(M.vapor, a); ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 + k * 1.4), 0, TAU); ctx.fill();
  }
}

// oscuridad con huecos de luz: la del jugador y la de cada antorcha, brasero, vela o cristal; luego las tiñe de color.
// Rendimiento: el mapa de luz se pinta a media resolución (la luz es suave, no se nota) y cada luz es un sprite
// de degradado ya dibujado, en vez de crear degradados nuevos en cada fotograma.
const lightCv = document.createElement('canvas'), lg = lightCv.getContext('2d');
const SPRITE_CACHE = {};
function radSprite(key, stops) {
  if (SPRITE_CACHE[key]) return SPRITE_CACHE[key];
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  for (const [o, col] of stops) gr.addColorStop(o, col);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return SPRITE_CACHE[key] = c;
}
const holeSpr = () => radSprite('hole', [[0, 'rgba(0,0,0,.82)'], [.4, 'rgba(0,0,0,.4)'], [1, 'rgba(0,0,0,0)']]);
const glowSpr = c => radSprite('g' + c, [[0, hexA(c, .2)], [.4, hexA(c, .07)], [1, hexA(c, 0)]]);
let vigCache = null;
function drawLighting(w, h, camX, camY, px, py, r0, r1, al, lk) {
  const LQ = gfxLevel() ? .5 : .25, lw = Math.max(1, Math.ceil(w * LQ)), lh = Math.max(1, Math.ceil(h * LQ));
  if (lightCv.width !== lw || lightCv.height !== lh) { lightCv.width = lw; lightCv.height = lh; }
  const t = G.time, vis = [];
  lg.setTransform(LQ, 0, 0, LQ, 0, 0);
  lg.globalCompositeOperation = 'copy'; lg.fillStyle = `rgba(6,5,9,${al})`; lg.fillRect(0, 0, w, h);
  lg.globalCompositeOperation = 'destination-out';
  // luz del jugador: un solo degradado por fotograma, en el lienzo pequeño
  const g = lg.createRadialGradient(px, py, r0 * zoom, px, py, r1 * zoom);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  lg.fillStyle = g; lg.fillRect(px - r1 * zoom, py - r1 * zoom, r1 * zoom * 2, r1 * zoom * 2);
  // el mar de lava da su propia luz: se ve aunque esté lejos del jugador
  if (G.lava) {
    const S = LQ * zoom * TILE;
    lg.setTransform(S, 0, 0, S, LQ * (w / 2 - camX * zoom), LQ * (h / 2 - camY * zoom));
    lg.imageSmoothingEnabled = true; lg.globalAlpha = (.62 + .08 * Math.sin(G.time * 1.3)) * Math.min(1, FLOORS[G.fi].mar.luz * 1.2) * lk;
    lg.drawImage(G.lava.mask, 0, 0);
    lg.globalAlpha = 1; lg.setTransform(LQ, 0, 0, LQ, 0, 0);
  }
  const hole = holeSpr();
  for (const L of G.lights || []) {
    if (L.room && !L.room.visited) continue;
    const sx = (L.x - camX) * zoom + w / 2, sy = (L.y - camY) * zoom + h / 2;
    const R = L.r * zoom * (.93 + .05 * Math.sin(t * 9 + L.ph) + .03 * Math.sin(t * 21 + L.ph));
    if (sx < -R || sx > w + R || sy < -R || sy > h + R) continue;
    lg.globalAlpha = L.f * lk; lg.drawImage(hole, sx - R, sy - R, R * 2, R * 2);
    vis.push(sx, sy, R, L);
  }
  // el color de cada luz y la viñeta van en el mismo lienzo: todo se pinta sobre el juego en una sola pasada
  lg.globalCompositeOperation = 'source-over';
  for (let i = 0; i < vis.length; i += 4) {
    const sx = vis[i], sy = vis[i + 1], R = vis[i + 2] * .85, L = vis[i + 3];
    lg.globalAlpha = L.f * lk; lg.drawImage(glowSpr(L.c), sx - R, sy - R, R * 2, R * 2);
  }
  lg.globalAlpha = 1;
  const vk = lw + 'x' + lh + ':' + G.fi;
  if (!vigCache || vigCache.k !== vk) {
    const c = document.createElement('canvas'); c.width = lw; c.height = lh;
    const x = c.getContext('2d'), v = x.createRadialGradient(lw / 2, lh / 2, Math.min(lw, lh) * .38, lw / 2, lh / 2, Math.max(lw, lh) * .78);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, AMB[G.fi].vig);
    x.fillStyle = v; x.fillRect(0, 0, lw, lh);
    vigCache = { k: vk, c };
  }
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.drawImage(vigCache.c, 0, 0);
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lightCv, 0, 0, lw / LQ, lh / LQ);
  ctx.restore();
}

function paintTiles(ctx, tx0, ty0, tx1, ty1) {
  const P = FLOORS[G.fi].pal;
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    const t = G.tiles[ty * MW + tx], x = tx * TILE, y = ty * TILE;
    if (t === VOID) {
      ctx.drawImage(seaTex(G.fi), x % LAVA_T, y % LAVA_T, TILE, TILE, x, y, TILE, TILE);
      // sombra pegada a la mazmorra: separa la sala del fondo y lleva la vista al combate
      const d = wallDist(tx, ty);
      if (d) { ctx.fillStyle = `rgba(0,0,0,${d === 1 ? .55 : .3})`; ctx.fillRect(x, y, TILE, TILE); }
      continue;
    }
    if (t === FLOOR || t === DOOR) {
      ctx.fillStyle = (tx + ty) & 1 ? P.fa : P.fb;
      ctx.fillRect(x, y, TILE, TILE);
      const h = hash(tx, ty);
      // losas: juntas, borde iluminado, alguna más oscura y sombra que proyectan los muros
      if (h > .6 && h < .7) { ctx.fillStyle = 'rgba(0,0,0,.13)'; ctx.fillRect(x, y, TILE, TILE); }
      else if (h > .4 && h < .46) { ctx.fillStyle = 'rgba(255,235,210,.025)'; ctx.fillRect(x, y, TILE, TILE); }
      ctx.fillStyle = 'rgba(0,0,0,.24)'; ctx.fillRect(x, y, TILE, 1); ctx.fillRect(x, y, 1, TILE);
      ctx.fillStyle = 'rgba(255,240,220,.035)'; ctx.fillRect(x + 1, y + 1, TILE - 2, 1); ctx.fillRect(x + 1, y + 1, 1, TILE - 2);
      const up = ty > 0 ? G.tiles[(ty - 1) * MW + tx] : VOID, lf = G.tiles[ty * MW + tx - 1], rt = G.tiles[ty * MW + tx + 1];
      if (up === WALL || up === CRACK) { ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fillRect(x, y, TILE, 5); ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(x, y + 5, TILE, 6); }
      if (lf === WALL || lf === CRACK) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x, y, 5, TILE); }
      if (rt === WALL || rt === CRACK) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x + TILE - 5, y, 5, TILE); }
      if (h < .07) {
        // grietas variadas y menos frecuentes (antes todas tenían la misma forma y el suelo parecía una cuadrícula)
        ctx.fillStyle = P.crack; ctx.globalAlpha = .75; const v = Math.floor(h * 57) % 4, o = Math.floor(hash(ty, tx) * 12);
        if (v === 0) { ctx.fillRect(x + 5 + o, y + 9, 8, 2); ctx.fillRect(x + 11 + o, y + 11, 2, 5); }
        else if (v === 1) { ctx.fillRect(x + 8, y + 6 + o, 2, 6); ctx.fillRect(x + 10, y + 11 + o, 5, 2); ctx.fillRect(x + 15, y + 13 + o, 2, 3); }
        else if (v === 2) { ctx.fillRect(x + 4 + o, y + 18, 3, 2); ctx.fillRect(x + 7 + o, y + 16, 3, 2); ctx.fillRect(x + 10 + o, y + 17, 4, 2); }
        else { ctx.fillRect(x + 6 + o, y + 6 + o, 2, 2); ctx.fillRect(x + 9 + o, y + 9 + o, 2, 2); }
        ctx.globalAlpha = 1;
      }
      else if (h > .93) { ctx.fillStyle = P.sp; ctx.fillRect(x + 10, y + 12, 6, 4); }
      else if (h > .88 && G.fi === 1) { ctx.fillStyle = '#2f4a33'; ctx.fillRect(x + 4, y + 20, 8, 4); ctx.fillRect(x + 8, y + 16, 4, 4); }
      else if (h > .88 && G.fi === 2) { ctx.fillStyle = '#3a1418'; ctx.fillRect(x + 12, y + 8, 4, 4); ctx.fillRect(x + 16, y + 12, 4, 2); }
    } else {
      const below = ty + 1 < MH ? G.tiles[(ty + 1) * MW + tx] : VOID;
      const face = below === FLOOR || below === DOOR;
      ctx.fillStyle = P.wt; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(x, y, TILE, 2);
      if (face) {
        ctx.fillStyle = P.wf; ctx.fillRect(x, y + TILE - 13, TILE, 13);
        ctx.fillStyle = P.we; ctx.fillRect(x, y + TILE - 14, TILE, 2);
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + ((tx & 1) ? 6 : 20), y + TILE - 11, 2, 9);
        // ladrillos de la cara del muro
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x, y + TILE - 7, TILE, 1);
        ctx.fillRect(x + ((tx & 1) ? 14 : 28), y + TILE - 6, 1, 6);
        ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(x, y + TILE - 6, TILE, 1);
      } else {
        const hw = hash(tx + 7, ty + 3);
        if (hw > .75) { ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(x + 4 + hw * 14, y + 6 + hw * 10, 6, 4); }
        else if (hw < .2) { ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(x + 6 + hw * 40, y + 12, 8, 3); }
      }
      if (t === CRACK) {
        ctx.fillStyle = 'rgba(0,0,0,.55)';
        ctx.fillRect(x + 8, y + 6, 2, 8); ctx.fillRect(x + 10, y + 13, 6, 2); ctx.fillRect(x + 16, y + 14, 2, 8); ctx.fillRect(x + 18, y + 21, 6, 2);
        ctx.fillStyle = 'rgba(199,125,255,.10)'; ctx.fillRect(x, y, TILE, TILE);
      }
    }
  }
}

// distancia (1 o 2 baldosas) de un vacío a la mazmorra; 0 si está más lejos
function wallDist(tx, ty) {
  let best = 0;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const x = tx + dx, y = ty + dy;
    if (x < 0 || y < 0 || x >= MW || y >= MH || G.tiles[y * MW + x] === VOID) continue;
    const d = Math.max(Math.abs(dx), Math.abs(dy));
    if (!best || d < best) best = d;
  }
  return best;
}
// el suelo y los muros no cambian: se dibujan una vez por bloques de 8×8 baldosas y luego solo se copian
const CH = 8;
function tileChunk(cx, cy) {
  const key = cy * 64 + cx, C = G.chunks;
  let c = C.get(key);
  if (c !== undefined) return c;
  if (C.size > 160) C.clear();   // no acumular memoria: se vuelven a dibujar cuando hagan falta
  const tx0 = cx * CH, ty0 = cy * CH, tx1 = Math.min(MW - 1, tx0 + CH - 1), ty1 = Math.min(MH - 1, ty0 + CH - 1);
  let empty = true;
  // (con 2 baldosas de margen: la sombra del borde de la mazmorra puede caer en este bloque)
  for (let ty = Math.max(0, ty0 - 2); ty <= Math.min(MH - 1, ty1 + 2) && empty; ty++) for (let tx = Math.max(0, tx0 - 2); tx <= Math.min(MW - 1, tx1 + 2); tx++) if (G.tiles[ty * MW + tx] !== VOID) { empty = false; break; }
  if (empty) { const T = seaTex(G.fi); C.set(key, T); return T; }   // un bloque solo de fondo es la textura misma (mide lo mismo)
  c = document.createElement('canvas'); c.width = c.height = CH * TILE;
  const g = c.getContext('2d'); g.translate(-tx0 * TILE, -ty0 * TILE);
  paintTiles(g, tx0, ty0, tx1, ty1);
  C.set(key, c); return c;
}
function drawTiles(vx0, vy0, vx1, vy1) {
  if (G.chunksOf !== G.tiles || G.chunksV !== G.tv) { G.chunks = new Map(); G.chunksOf = G.tiles; G.chunksV = G.tv; }
  const cx0 = Math.max(0, Math.floor(vx0 / TILE / CH)), cx1 = Math.floor(Math.min(MW - 1, vx1 / TILE) / CH);
  const cy0 = Math.max(0, Math.floor(vy0 / TILE / CH)), cy1 = Math.floor(Math.min(MH - 1, vy1 / TILE) / CH);
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
    const c = tileChunk(cx, cy);
    if (c) ctx.drawImage(c, cx * CH * TILE, cy * CH * TILE);
  }
  ctx.restore();
  // rejas de las puertas cerradas: cambian durante el juego, se dibujan aparte
  for (const [i, r] of G.doorRoom) {
    if (!r.locked) continue;
    const x = (i % MW) * TILE, y = Math.floor(i / MW) * TILE;
    if (x < vx0 - TILE || x > vx1 || y < vy0 - TILE || y > vy1) continue;
    ctx.fillStyle = 'rgba(227,162,74,.16)'; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = '#e3a24a';
    for (let k = 0; k < 3; k++) ctx.fillRect(x + 6 + k * 9, y + 2, 3, TILE - 4);
  }
}
function drawShadow(x, y, r) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + r * .8, r * .9, r * .35, 0, 0, TAU); ctx.fill(); }

export { drawLavaSea, drawLavaSteam, drawLighting, drawShadow, drawTiles, radSprite };
