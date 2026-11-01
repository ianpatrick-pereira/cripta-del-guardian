// ================= Dibujo =================
let dpr = 1, zoom = 1;
// calidad gráfica: 2 alta (pantallas retina a resolución completa), 1 media, 0 baja (se dibuja a 3/4 y el navegador lo estira).
// En «auto» empieza en alta (en media si la pantalla es táctil: los celulares tienen muchos píxeles y poca
// potencia) y baja un nivel si el juego va lento varios segundos seguidos.
const GFX_DPR = [.75, 1, 2], GFX_NAME = { auto: 'Automática', 2: 'Alta', 1: 'Media', 0: 'Baja' };
const QL0 = window.matchMedia && matchMedia('(pointer: coarse)').matches ? 1 : 2;
let QL = QL0, perfEma = 16, slowT = 0;
const gfxLevel = () => SAVE.opt.gfx === 'auto' || SAVE.opt.gfx === undefined ? QL : +SAVE.opt.gfx;
function resize() {
  const r = frame.getBoundingClientRect();
  dpr = Math.min(GFX_DPR[gfxLevel()], window.devicePixelRatio || 1);
  cv.width = Math.max(1, Math.round(r.width * dpr));
  cv.height = Math.max(1, Math.round(r.height * dpr));
  zoom = clamp(Math.min(r.width / 720, r.height / 470), .62, 2.4);
}
new ResizeObserver(resize).observe(frame);
resize();

// salas tomadas por un elemento: color, suelo y partículas propias
function drawElemRooms(vx0, vy0, vx1, vy1) {
  for (const r of G.rooms) {
    if (!r.elTheme) continue;
    const X0 = r.x * TILE, Y0 = r.y * TILE, X1 = (r.x + r.w) * TILE, Y1 = (r.y + r.h) * TILE;
    if (X1 < vx0 || X0 > vx1 || Y1 < vy0 || Y0 > vy1) continue;
    const el = r.elTheme, c = ELEMS[el].c, t = G.time;
    for (let ty = r.y; ty < r.y + r.h; ty++) for (let tx = r.x; tx < r.x + r.w; tx++) {
      const tt = G.tiles[ty * MW + tx], x = tx * TILE, y = ty * TILE, h = hash(tx, ty);
      if (tt === WALL) { ctx.fillStyle = c + '22'; ctx.fillRect(x, y, TILE, TILE); continue; }
      if (tt !== FLOOR) continue;
      if (el === 'fire') {
        ctx.fillStyle = `rgba(120,30,10,.35)`; ctx.fillRect(x, y, TILE, TILE);
        if (h > .7) { ctx.fillStyle = `rgba(255,${120 + Math.floor(60 * Math.sin(t * 3 + h * 9))},40,${.45 + .25 * Math.sin(t * 4 + h * 20)})`; ctx.fillRect(x + 6, y + 14, 18, 2); ctx.fillRect(x + 14, y + 8, 2, 12); }
      } else if (el === 'water') {
        ctx.fillStyle = 'rgba(20,70,110,.38)'; ctx.fillRect(x, y, TILE, TILE);
        if (h > .75) { const k = (t * .8 + h * 5) % 1; ctx.strokeStyle = `rgba(140,210,255,${.5 * (1 - k)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x + 16, y + 16, 4 + k * 12, 2 + k * 5, 0, 0, TAU); ctx.stroke(); }
      } else if (el === 'air') {
        ctx.fillStyle = 'rgba(180,230,215,.12)'; ctx.fillRect(x, y, TILE, TILE);
        if (h > .7) { const off = ((t * 90 + h * 400) % 64) - 16; ctx.fillStyle = 'rgba(220,255,240,.35)'; ctx.fillRect(x + off, y + 10 + h * 10, 14, 1.5); }
      } else {
        ctx.fillStyle = 'rgba(90,60,30,.4)'; ctx.fillRect(x, y, TILE, TILE);
        if (h > .72) { ctx.fillStyle = '#6a5034'; ctx.fillRect(x + 8, y + 10, 10, 8); ctx.fillStyle = '#8a6a48'; ctx.fillRect(x + 9, y + 10, 6, 3); }
        else if (h > .55) { ctx.fillStyle = 'rgba(30,20,10,.5)'; ctx.fillRect(x + 4, y + 16, 22, 2); ctx.fillRect(x + 14, y + 8, 2, 10); }
      }
    }
    // partículas ambientales mientras estás en esa sala
    if (G.cur === r && Math.random() < .5) {
      const px = rand(X0 + TILE, X1 - TILE), py = rand(Y0 + TILE, Y1 - TILE);
      const P = { fire: [0, -40, '#ff8a3a'], water: [0, -15, '#8cd2ff'], air: [90, -10, '#dcfff0'], earth: [0, 20, '#8a6a48'] }[el];
      G.parts.push({ x: px, y: py, vx: P[0], vy: P[1], life: .9, max: .9, color: P[2], size: 3 });
    }
  }
}
