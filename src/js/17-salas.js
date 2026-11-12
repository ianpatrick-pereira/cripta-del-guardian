// ================= Salas =================
import { tr } from './00b-textos.js';
import { FLOOR, MH, MW, TILE, pick, rand } from './01-utilidades.js';
import { BOSSES, BOTIN, D, ENEMY, FLOORS, OLEADAS } from './03-datos-del-juego.js';
import { noise, sfx } from './05-audio.js';
import { G, freeSpot } from './07-estado.js';
import { hitsWall, roomAt, roomRectAt } from './08-colisiones.js';
import { addText, burst, later, shake, showBanner } from './09-efectos.js';
import { mkEnemy } from './14-enemigos.js';
import { SUBS } from './15-subjefes.js';
import { noteFor } from './20-historia.js';
import { updateAdapt } from './25-enemigos-que-se-adaptan.js';
import { dareClear, dareStart } from './28-desafios-dentro-del-piso.js';
function spawnWave(room) {
  const fl = FLOORS[G.fi];
  // las cantidades se ajustan en src/datos/oleadas.jsonc
  const E = OLEADAS.enemigos, PD = OLEADAS.pisosDuros;
  const d = room.depth, n0 = Math.max(E.minimo, E.base + E.porProfundidad * Math.min(d, E.profundidadMaxima) + E.porOleada * room.wave + E.porPiso * (G.floor - 1) + D().count);
  // en los pisos duros salen menos enemigos, pero mucho más duros (ver mkEnemy)
  const n = G.floor >= PD.desdePiso ? Math.max(E.minimo, Math.round(n0 * PD.factorCantidad)) : n0;
  const pool = d < OLEADAS.profundidadLejos ? fl.pool1 : fl.pool2;
  const p = G.player;
  for (let i = 0; i < n; i++) {
    const pos = freeSpot(room, 2, 20, p, 150) || freeSpot(room, 2, 20) || { x: room.cx, y: room.cy };
    G.markers.push({ x: pos.x, y: pos.y, t: .8 + i * .05, type: pick(pool), depth: d, elite: Math.random() < fl.elite + D().elite });
  }
}
function startEncounter(room) {
  room.locked = true; room.wave = 0;
  updateAdapt(true);
  sfx(110, .25, 'square', .05, -40); shake(4);
  if (room.type === 'boss') {
    G.markers.push({ x: room.cx, y: room.cy - 40, t: 1.6, type: 'boss', depth: 5 });
    showBanner(BOSSES[FLOORS[G.fi].boss].name, '#d4474b', tr`Jefe del piso ${G.floor}`);
  } else if (room.sub) {
    const S = SUBS[room.subK || G.fi + 1];
    room.wave = room.waves;
    G.markers.push({ x: room.cx, y: room.cy - 30, t: 1.4, type: 'sub', k: room.subK || G.fi + 1 });
    for (let i = 0; i < (G.diff === 'hard' ? 3 : 2); i++) {
      const pos = freeSpot(room, 2, 20, G.player, 150);
      if (pos) G.markers.push({ x: pos.x, y: pos.y, t: 1.2 + i * .1, type: S.minion, depth: 1 });
    }
    showBanner(S.name, '#e3a24a', tr('Subjefe'));
  } else { G.waveDelay = .5; dareStart(room); }
}
function clearRoom(room) {
  room.locked = false; room.cleared = true; G.roomsCleared++;
  dareClear(room);
  sfx(520, .3, 'triangle', .05, 400);
  addText(G.player.x, G.player.y - 30, tr('Sala despejada'), '#e3a24a', 15);
  let x = room.cx, y = room.cy;
  if (Math.hypot(G.player.x - x, G.player.y - y) < 50) y -= 70;
  if (!G.keyGiven) { G.keyGiven = true; G.pickups.push({ kind: 'key', x: x + 34, y }); }
  const r = Math.random();
  // tótem elemental: emerge del suelo en algunas salas despejadas
  if (room.totemEl) {
    G.totems++;
    const tx = room.cx, ty = room.cy + 70;
    G.pickups.push({ kind: 'totem', el: room.totemEl, x: tx, y: ty, rise: 0 });
    room.totemEl = null;
    later(.6, () => { shake(6); noise(.6, .07, 300); addText(tx, ty - 60, tr('Un tótem emerge de la tierra…'), '#c77dff', 13); });
  }
  if (G.pet && G.pet.kind === 'fairy' && G.player.hp < G.player.maxHp) { G.player.hp++; addText(G.player.x, G.player.y - 44, tr('+1 vida (hada)'), '#ffe27a', 12); }
  if (room.sub) {
    G.pickups.push({ kind: 'chest', gold: true, x, y, opened: false, minR: 'rare' }, { kind: 'key', x: x - 34, y });
    const n1 = noteFor(1); if (n1 >= 0) G.pickups.push({ kind: 'note', id: n1, x: x + 60, y: y + 40 });
  }
  else if (r < BOTIN.salaDespejada.cofreDorado) G.pickups.push({ kind: 'chest', gold: true, x, y, opened: false, minR: 'rare' });
  else if (r < BOTIN.salaDespejada.cofreDorado + BOTIN.salaDespejada.cofre) G.pickups.push({ kind: 'chest', x, y, opened: false, minR: room.depth >= 3 || G.floor > 1 ? 'uncommon' : 'common' });
}
// los pasillos: cada tramo entre dos salas es una zona aparte. La primera vez que entras en uno,
// hay un 75 % de que lo ronde un grupo de 3 a 5 bichos pequeños del tipo del piso.
const COR_GRUPO = { prob: .75, min: 3, max: 5 };
function corridorMap() {
  if (G.corFor === G.tiles) return;
  const lab = new Int16Array(MW * MH).fill(-1), inRect = (tx, ty) => G.rooms.some(r => tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h);
  const zones = [];
  for (let i = 0; i < MW * MH; i++) {
    if (lab[i] >= 0 || G.tiles[i] !== FLOOR || inRect(i % MW, (i / MW) | 0)) continue;
    const id = zones.length, cells = [], st = [i]; lab[i] = id;
    while (st.length) {
      const c = st.pop(); cells.push(c);
      const cx = c % MW, cy = (c / MW) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy, n = ny * MW + nx;
        if (nx < 0 || ny < 0 || nx >= MW || ny >= MH || lab[n] >= 0 || G.tiles[n] !== FLOOR || inRect(nx, ny)) continue;
        lab[n] = id; st.push(n);
      }
    }
    zones.push(cells);
  }
  G.corFor = G.tiles; G.corLab = lab; G.corZones = zones; G.corDone = new Set();
}
function corridorGroup(zone) {
  const p = G.player, fl = FLOORS[G.fi];
  const types = (fl.pool1 || []).filter(t => ENEMY[t]);
  if (!types.length) return;
  const type = pick(types);
  // casillas del tramo lejos del jugador, preferiblemente hacia delante
  const spots = G.corZones[zone].map(c => ({ x: (c % MW + .5) * TILE, y: (((c / MW) | 0) + .5) * TILE }))
    .filter(s => { const d = Math.hypot(s.x - p.x, s.y - p.y); return d > 150 && d < 460 && !hitsWall(s.x, s.y, 12); });
  if (!spots.length) return;
  const ahead = spots.filter(s => (s.x - p.x) * G.pv.x + (s.y - p.y) * G.pv.y > 0);
  const pool = ahead.length >= 3 ? ahead : spots, c = pick(pool);
  const n = COR_GRUPO.min + Math.floor(Math.random() * (COR_GRUPO.max - COR_GRUPO.min + 1));
  for (let k = 0; k < n; k++) {
    // el grupo aparece junto: cada uno en una casilla cercana a la elegida
    const near = pool.filter(s => Math.hypot(s.x - c.x, s.y - c.y) < 70), s = pick(near.length ? near : pool);
    const x = s.x + rand(-8, 8), y = s.y + rand(-8, 8);
    const e = mkEnemy(type, x, y, 0, false);
    e.stray = true; e.hp = e.max = Math.max(4, Math.round(e.max * .45)); e.s *= .75; e.r *= .8;
    G.enemies.push(e); burst(x, y, '#3a3448', 10, 80, 4, .5);
  }
}
function updateCorridor(dt) {
  const p = G.player, inCor = !roomRectAt(p.x, p.y);
  G.corK = (G.corK || 0) + ((inCor ? 1 : 0) - (G.corK || 0)) * Math.min(1, dt * 3);
  if (!inCor || G.over || G.choice || !G.tiles || G.sinPasillos) return;   // sinPasillos: lo usan las pruebas de armas
  corridorMap();
  const z = G.corLab[Math.floor(p.y / TILE) * MW + Math.floor(p.x / TILE)];
  if (z < 0 || G.corDone.has(z)) return;
  G.corDone.add(z);
  if (Math.random() < COR_GRUPO.prob) corridorGroup(z);
}
function updateRooms(dt) {
  const p = G.player;
  updateCorridor(dt);
  if (G.dare) G.dare.t += dt;
  const room = roomAt(p.x, p.y);
  if (room && room !== G.cur) {
    G.cur = room;
    if (room.type === 'secret' && !room.visited) { showBanner(tr('Sala secreta'), '#c77dff'); sfx(600, .4, 'triangle', .04, 400); }
    if (room.type === 'shop' && !room.visited) addText(room.cx, room.cy - 104, tr('¡Bienvenido, viajero!'), '#e3a24a', 14);
    room.visited = true;
    if (!room.cleared && !room.locked) startEncounter(room);
  }
  const r = G.cur;
  if (r && r.locked && r.type === 'combat' && !r.cleared && !G.enemies.some(e => !e.stray) && G.markers.length === 0) {
    if (r.wave < r.waves) { G.waveDelay -= dt; if (G.waveDelay <= 0) { r.wave++; spawnWave(r); G.waveDelay = .8; } }
    else clearRoom(r);
  }
}

export { updateRooms };
