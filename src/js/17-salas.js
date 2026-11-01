// ================= Salas =================
import { tr } from './00b-textos.js';
import { FLOOR, MH, MW, TAU, TILE, pick, rand } from './01-utilidades.js';
import { BOSSES, BOTIN, D, ENEMY, FLOORS, OLEADAS } from './03-datos-del-juego.js';
import { noise, sfx } from './05-audio.js';
import { G, freeSpot } from './07-estado.js';
import { hitsWall, roomAt } from './08-colisiones.js';
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
// en los pasillos, de vez en cuando, aparece alguna alimaña débil
const STRAYS = ['bat', 'slime', 'mini'];
function updateCorridor(dt) {
  const p = G.player, inCor = !roomAt(p.x, p.y);
  G.corK = (G.corK || 0) + ((inCor ? 1 : 0) - (G.corK || 0)) * Math.min(1, dt * 3);
  if (!inCor || G.over || G.choice) return;
  G.corT = (G.corT || 0) + dt;
  if (G.corT < (G.corNext || (G.corNext = rand(7, 13)))) return;
  G.corT = 0; G.corNext = rand(8, 15);
  if (Math.random() < .4 || G.enemies.filter(e => e.stray).length >= 3) return;
  const types = STRAYS.filter(t => ENEMY[t]), n = Math.random() < .3 ? 2 : 1;
  for (let k = 0; k < n; k++) for (let tries = 0; tries < 60; tries++) {
    const a = rand(0, TAU), d = rand(170, 280), x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d;
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    if (tx < 0 || ty < 0 || tx >= MW || ty >= MH || G.tiles[ty * MW + tx] !== FLOOR || roomAt(x, y) || hitsWall(x, y, 12)) continue;
    const e = mkEnemy(pick(types), x, y, 0, false);
    e.stray = true; e.hp = e.max = Math.max(4, Math.round(e.max * .45));
    G.enemies.push(e); burst(x, y, '#3a3448', 10, 80, 4, .5);
    break;
  }
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
