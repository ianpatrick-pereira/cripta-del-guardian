// ================= Generación =================
function generate() {
  for (let attempt = 0; attempt < 400; attempt++) {
    const cells = new Map(), list = [], edges = [];
    const add = (gx, gy) => { const r = { gx, gy, links: [] }; cells.set(gx + ',' + gy, r); list.push(r); return r; };
    add(2, 2);
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let guard = 0;
    while (list.length < 10 && guard++ < 800) {
      const from = Math.random() < .55 ? list[list.length - 1] : pick(list);
      const [dx, dy] = pick(DIRS), nx = from.gx + dx, ny = from.gy + dy;
      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID || cells.has(nx + ',' + ny)) continue;
      const to = add(nx, ny);
      from.links.push(to); to.links.push(from); edges.push([from, to]);
    }
    if (list.length < 10) continue;
    const start = list[0]; start.depth = 0;
    const q = [start];
    while (q.length) { const r = q.shift(); for (const n of r.links) if (n.depth === undefined) { n.depth = r.depth + 1; q.push(n); } }
    const leaves = list.filter(r => r !== start && r.links.length === 1).sort((a, b) => b.depth - a.depth);
    if (leaves.length < 2 || leaves[0].depth < 3) continue;
    const boss = leaves[0];
    for (const r of list) r.type = 'combat';
    start.type = 'start'; boss.type = 'boss';
    const rest = list.filter(r => r.type === 'combat' && !boss.links.includes(r));
    const leafRest = leaves.slice(1).filter(r => r.type === 'combat');
    const treasure = leafRest[0] || pick(rest);
    if (!treasure) continue;
    treasure.type = 'treasure';
    const shopCands = list.filter(r => r.type === 'combat' && r.depth >= 1 && r.depth <= 3);
    if (!shopCands.length) continue;
    pick(shopCands).type = 'shop';
    const secretCands = [];
    for (const r of list) {
      if (r.type === 'boss' || r.type === 'start') continue;
      for (const [dx, dy] of DIRS) {
        const nx = r.gx + dx, ny = r.gy + dy;
        if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID || cells.has(nx + ',' + ny)) continue;
        secretCands.push([r, nx, ny]);
      }
    }
    let secretEdge = null;
    if (secretCands.length) {
      const [par, nx, ny] = pick(secretCands);
      const s = add(nx, ny); s.type = 'secret'; s.depth = par.depth + 1;
      par.links.push(s); s.links.push(par);
      secretEdge = [par, s]; edges.push(secretEdge);
    }
    return { list, edges, start, boss, secretEdge };
  }
  throw new Error('No se pudo generar la mazmorra');
}

// formas de sala: el contorno se recorta dentro de su caja
const ROOM_SHAPES = {
  rect:     { w: 17, h: 13, in: () => true },
  long:     { w: 21, h: 11, in: () => true },
  circle:   { w: 17, h: 15, in: (u, v) => u * u + v * v <= 1.05 },
  octagon:  { w: 17, h: 13, in: (u, v) => Math.abs(u) + Math.abs(v) <= 1.45 },
  diamond:  { w: 19, h: 15, in: (u, v) => Math.abs(u) + Math.abs(v) <= 1.12 },
  hexagon:  { w: 19, h: 13, in: (u, v) => Math.abs(u) + Math.abs(v) * .5 <= 1.05 },
  cross:    { w: 19, h: 15, in: (u, v) => Math.abs(u) <= .42 || Math.abs(v) <= .42 },
  pentagon: { w: 17, h: 15, in: (u, v) => {
    // pentágono con la punta hacia arriba
    const P = []; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * TAU / 5; P.push([Math.cos(a) * 1.12, Math.sin(a) * 1.18 + .12]); }
    for (let k = 0; k < 5; k++) { const [x1, y1] = P[k], [x2, y2] = P[(k + 1) % 5]; if ((x2 - x1) * (v - y1) - (y2 - y1) * (u - x1) < 0) return false; }
    return true; } },
};
const SHAPE_POOL = ['rect', 'rect', 'long', 'circle', 'pentagon', 'octagon', 'diamond', 'hexagon', 'cross'];
function buildMap(layout) {
  const tiles = new Uint8Array(MW * MH);
  const doorRoom = new Map(), doors = [];
  for (const r of layout.list) {
    const big = r.type === 'boss', small = r.type === 'secret';
    r.shape = r.type === 'combat' ? pick(SHAPE_POOL) : 'rect';
    const S = ROOM_SHAPES[r.shape];
    r.w = big ? 23 : small ? 11 : S.w; r.h = big ? 17 : small ? 9 : S.h;
    r.x = r.gx * CELL_W + Math.floor((CELL_W - r.w) / 2);
    r.y = r.gy * CELL_H + Math.floor((CELL_H - r.h) / 2);
    r.tcx = r.x + Math.floor(r.w / 2); r.tcy = r.y + Math.floor(r.h / 2);
    r.cx = (r.tcx + .5) * TILE; r.cy = (r.tcy + .5) * TILE;
    r.visited = false; r.locked = false; r.wave = 0;
    r.cleared = r.type !== 'combat' && r.type !== 'boss';
    const OS = OLEADAS.oleadasPorSala; r.waves = r.type === 'combat' ? (r.depth >= OS.profundidadDificil ? OS.dificil : OS.normal) : 0;
    const hx = (r.w - 2) / 2, hy = (r.h - 2) / 2, mx = r.x + (r.w - 1) / 2, my = r.y + (r.h - 1) / 2;
    for (let y = r.y + 1; y < r.y + r.h - 1; y++) for (let x = r.x + 1; x < r.x + r.w - 1; x++)
      if (S.in((x - mx) / hx, (y - my) / hy) || big || small) tiles[y * MW + x] = FLOOR;
  }
  // pasillos con curvas: tramos de 3 de ancho que solo rellenan el vacío
  const open = (x, y) => { const i = y * MW + x; if (tiles[i] === VOID) tiles[i] = FLOOR; };
  const carveH = (x0, x1, y) => { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let d = -1; d <= 1; d++) open(x, y + d); };
  const carveV = (x, y0, y1) => { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let d = -1; d <= 1; d++) open(x + d, y); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // posición de la puerta a lo largo de una pared (las salas con forma la llevan cerca del centro)
  const doorAt = (r, lo, hi, mid, lim) => { const k = r.shape === 'rect' || r.shape === 'long' || r.type !== 'combat' ? 99 : 2; return clamp(mid + randi(-Math.min(k, 4), Math.min(k, 4)), Math.max(lo, lim[0]), Math.min(hi, lim[1])); };
  for (const edge of layout.edges) {
    const [a, b] = edge, secret = edge === layout.secretEdge;
    const setDoor = (x, y, room) => {
      const i = y * MW + x;
      if (secret) tiles[i] = room === b ? FLOOR : CRACK;
      else { tiles[i] = DOOR; doorRoom.set(i, room); }
      doors.push([x, y, room]);
    };
    if (a.gy === b.gy) {
      const [L, R] = a.gx < b.gx ? [a, b] : [b, a];
      const top = L.gy * CELL_H, lim = [top + 2, top + CELL_H - 3];
      const y1 = doorAt(L, L.y + 2, L.y + L.h - 3, L.tcy, lim), y2 = doorAt(R, R.y + 2, R.y + R.h - 3, R.tcy, lim);
      const x0 = L.x + L.w, x1 = R.x - 1;
      if (x1 - x0 >= 5 && Math.random() < .55) {
        const xa = x0 + 1, xb = x1 - 1, up = Math.random() < .5;
        const yd = clamp(up ? Math.min(y1, y2) - randi(3, 6) : Math.max(y1, y2) + randi(3, 6), lim[0], lim[1]);
        carveH(x0, xa, y1); carveV(xa, y1, yd); carveH(xa, xb, yd); carveV(xb, yd, y2); carveH(xb, x1, y2);
      } else { const xm = randi(x0 + 1, x1 - 1); carveH(x0, xm, y1); carveV(xm, y1, y2); carveH(xm, x1, y2); }
      for (let d = -1; d <= 1; d++) { setDoor(L.x + L.w - 1, y1 + d, L); setDoor(R.x, y2 + d, R); }
      for (let d = -1; d <= 1; d++) {
        for (let x = L.x + L.w - 2; x > L.x && tiles[(y1 + d) * MW + x] !== FLOOR; x--) tiles[(y1 + d) * MW + x] = FLOOR;
        for (let x = R.x + 1; x < R.x + R.w - 1 && tiles[(y2 + d) * MW + x] !== FLOOR; x++) tiles[(y2 + d) * MW + x] = FLOOR;
      }
    } else {
      const [T, B] = a.gy < b.gy ? [a, b] : [b, a];
      const left = T.gx * CELL_W, m = Math.ceil((CELL_W - 17) / 2), lim = [left + m + 2, left + CELL_W - m - 3];
      const x1 = doorAt(T, T.x + 2, T.x + T.w - 3, T.tcx, lim), x2 = doorAt(B, B.x + 2, B.x + B.w - 3, B.tcx, lim);
      const y0 = T.y + T.h, y1 = B.y - 1;
      if (y1 - y0 >= 5 && Math.random() < .55) {
        const ya = y0 + 1, yb = y1 - 1, lf = Math.random() < .5;
        const xd = clamp(lf ? Math.min(x1, x2) - randi(3, 6) : Math.max(x1, x2) + randi(3, 6), lim[0], lim[1]);
        carveV(x1, y0, ya); carveH(x1, xd, ya); carveV(xd, ya, yb); carveH(xd, x2, yb); carveV(x2, yb, y1);
      } else { const ym = randi(y0 + 1, y1 - 1); carveV(x1, y0, ym); carveH(x1, x2, ym); carveV(x2, ym, y1); }
      for (let d = -1; d <= 1; d++) { setDoor(x1 + d, T.y + T.h - 1, T); setDoor(x2 + d, B.y, B); }
      for (let d = -1; d <= 1; d++) {
        for (let y = T.y + T.h - 2; y > T.y && tiles[y * MW + x1 + d] !== FLOOR; y--) tiles[y * MW + x1 + d] = FLOOR;
        for (let y = B.y + 1; y < B.y + B.h - 1 && tiles[y * MW + x2 + d] !== FLOOR; y++) tiles[y * MW + x2 + d] = FLOOR;
      }
    }
  }
  // columnas dentro de las salas de combate y del jefe
  const PATTERNS = [
    [],
    [[-5, -4], [-4, -4], [-5, -3], [-4, -3], [4, -4], [5, -4], [4, -3], [5, -3], [-5, 3], [-4, 3], [-5, 4], [-4, 4], [4, 3], [5, 3], [4, 4], [5, 4]],
    [[-3, -3], [3, -3], [-3, 3], [3, 3], [-6, -4], [6, -4], [-6, 4], [6, 4]],
    [[-6, -3], [-5, -3], [-4, -3], [4, -3], [5, -3], [6, -3], [-6, 3], [-5, 3], [-4, 3], [4, 3], [5, 3], [6, 3]],
    [[-4, -3], [4, -3], [-4, 3], [4, 3], [-3, -3], [3, 3]],
  ];
  for (const r of layout.list) {
    let pat = null;
    if (r.type === 'combat') pat = pick(PATTERNS);
    if (r.type === 'boss') pat = [[-7, -5], [-6, -5], [-7, -4], [-6, -4], [6, -5], [7, -5], [6, -4], [7, -4], [-7, 4], [-6, 4], [-7, 5], [-6, 5], [6, 4], [7, 4], [6, 5], [7, 5]];
    if (!pat) continue;
    for (const [dx, dy] of pat) {
      const x = r.tcx + dx, y = r.tcy + dy;
      if (tiles[y * MW + x] !== FLOOR || doors.some(([qx, qy]) => Math.max(Math.abs(qx - x), Math.abs(qy - y)) <= 3)) continue;
      tiles[y * MW + x] = WALL;
    }
  }
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (tiles[y * MW + x] !== VOID) continue;
    let near = false;
    for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
      const t = tiles[ny * MW + nx]; if (t === FLOOR || t === DOOR) { near = true; break; }
    }
    if (near) tiles[y * MW + x] = WALL;
  }
  return { tiles, doorRoom };
}

