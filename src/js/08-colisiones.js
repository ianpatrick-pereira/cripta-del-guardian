// ================= Colisiones =================
import { DOOR, FLOOR, MH, MW, TILE, clamp } from './01-utilidades.js';
import { G } from './07-estado.js';
function solidAt(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true;
  const i = ty * MW + tx, t = G.tiles[i];
  if (t === FLOOR) return false;
  if (t === DOOR) { const r = G.doorRoom.get(i); return !!(r && r.locked); }
  return true;
}
function hitsWall(x, y, r) {
  const x0 = Math.floor((x - r) / TILE), x1 = Math.floor((x + r) / TILE);
  const y0 = Math.floor((y - r) / TILE), y1 = Math.floor((y + r) / TILE);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (!solidAt(tx, ty)) continue;
    const nx = clamp(x, tx * TILE, tx * TILE + TILE), ny = clamp(y, ty * TILE, ty * TILE + TILE);
    if ((x - nx) ** 2 + (y - ny) ** 2 < r * r) return true;
  }
  return false;
}
function moveEnt(e, dx, dy) {
  let hit = false;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 8));
  const sx = dx / steps, sy = dy / steps;
  for (let i = 0; i < steps; i++) {
    if (sx) { if (!hitsWall(e.x + sx, e.y, e.r)) e.x += sx; else hit = true; }
    if (sy) { if (!hitsWall(e.x, e.y + sy, e.r)) e.y += sy; else hit = true; }
  }
  return hit;
}
function pushOutProps(e) {
  let touched = null;
  for (const o of G.props) {
    if (o.dead || !o.solid) continue;
    const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy), min = e.r + o.r;
    if (d < min) {
      touched = o;
      const nx = d > .01 ? dx / d : 1, ny = d > .01 ? dy / d : 0;
      moveEnt(e, nx * (min - d), ny * (min - d));
    }
  }
  return touched;
}
function roomAt(x, y) {
  const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
  for (const r of G.rooms) if (tx >= r.x + 2 && tx <= r.x + r.w - 3 && ty >= r.y + 2 && ty <= r.y + r.h - 3) return r;
  return null;
}
// la sala completa (muros incluidos) que contiene el punto: fuera de todas, estás en un pasillo
function roomRectAt(x, y) {
  const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
  for (const r of G.rooms) if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) return r;
  return null;
}

export { hitsWall, moveEnt, pushOutProps, roomAt, roomRectAt, solidAt };
