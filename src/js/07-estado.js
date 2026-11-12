// ================= Estado =================
import { tr } from './00b-textos.js';
import { FLOOR, MW, TILE, pick, rand, randi, shuffle } from './01-utilidades.js';
import { ROOM_DEFS, roomList } from './01a-registro.js';
import { CHARS, CUR_CHAR, FLOORS, RELICS, relicFor, UPG, WEAPONS, rollWeapon, setCUR_CHAR,
  skinOf, starterW } from './03-datos-del-juego.js';
import { SAVE, writeSave } from './04-guardado.js';
import { buildMap, generate } from './06-generacion.js';
import { hitsWall } from './08-colisiones.js';
import { later, showBanner } from './09-efectos.js';
import { dropCoin } from './14-enemigos.js';
import { mkPet } from './19-companeros.js';
import { NARRATOR, noteFor } from './20-historia.js';
import { ach } from './21-logros-y-bestiario.js';
import { snapRun } from './22-guardar-partida.js';
import { totemElement } from './23-elementos.js';
import { updateAdapt } from './25-enemigos-que-se-adaptan.js';
import { SUB_UNLOCK, offerSpec } from './26-clases.js';
import { PACTS, offerPact } from './27-pactos-de-piso.js';
import { DARES } from './28-desafios-dentro-del-piso.js';
import { buildFloor } from './31-reto-diario.js';
let G = null, paused = false, started = false;
function rc(id) { return G ? G.player.relics.filter(r => r === id).length : 0; }

// el arma inicial comprada ocupa la primera ranura; si coincide con la segunda, esta pasa a ser la básica del personaje
function startKit(ch) {
  const k = ch.start.slice(), b = SAVE.startW;
  if (b && WEAPONS.some(w => w.id === b && w.rarity === 'common')) { if (k[1] === b) k[1] = k[0]; k[0] = b; }
  return k;
}
function newRun(charId) {
  const ch = CHARS[charId];
  setCUR_CHAR(charId);
  const p = {
    char: charId, spr: ch.spr, skin: skinOf(charId), x: 0, y: 0, r: 11,
    hp: ch.hp + SAVE.upg.hp, maxHp: ch.hp + SAVE.upg.hp, sh: ch.sh, maxSh: ch.sh, shT: 0, shAcc: 0,
    en: ch.en + SAVE.upg.en * 15, maxEn: ch.en + SAVE.upg.en * 15,
    inv: 0, slots: startKit(ch).map(starterW), cur: 0, cd: 0, aim: 0, charge: 0,
    dashT: 0, dashCd: 0, dvx: 0, dvy: 0, swing: null, walk: 0, mvx: 0, mvy: 1,
    relics: [], killCount: 0, abilCd: 0, elCd: 0, bulwarkT: 0, shadowT: 0, slow: 0, noEnT: 0, flip: false,
    cu: Object.fromEntries(Object.keys(UPG).filter(k => UPG[k].cls === charId).map(k => [k, SAVE.upg[k] || 0])),
    talents: [], spec: '', subK: 0, preK: 0, parryT: 0, parryCd: 0, revenge: 0, focus: 0, combo: 0, comboT: 0, veilT: 0, rageT: 0, backN: 0, meleeKills: 0, atkN: 0, chgN: 0,
  };
  G = {
    floor: 1, player: p, time: 0, kills: 0, coins: SAVE.upg.coin * 10, gems: 0, petKind: SAVE.pet, keys: 0, roomsCleared: 0, rerollF: 0, guia: null, circ: Math.min(SAVE.circSel || 0, SAVE.circ || 0),
    over: false, endT: 0, won: false, choice: null, darkT: 0, heartT: 0, diff: SAVE.diff, pv: { x: 0, y: 0 },
    crystals: { fire: 0, water: 0, air: 0, earth: 0 },
  };
  buildFloor(1);
}

function buildFloor0(n) {
  const layout = generate();
  const { tiles, doorRoom } = buildMap(layout);
  const s = layout.start;
  Object.assign(G, {
    floor: n, fi: (n - 1) % 8, cycle: Math.floor((n - 1) / 8) + 1, tiles, doorRoom, rooms: layout.list, startRoom: s, bossRoom: layout.boss,
    enemies: [], proj: [], pickups: [], parts: [], texts: [], markers: [], props: [], timers: [], beams: [], bolts: [], hazards: [], tornados: [], allies: [], pbeams: [], cls: null, elFight: null, totems: 0,
    boss: null, cur: s, shake: 0, hitstop: 0, hurtFlash: 0, banner: null, waveDelay: 0, keyGiven: false, darkT: 0,
    cam: { x: s.cx, y: s.cy }, interact: null,
  });
  const p = G.player;
  p.x = s.cx; p.y = s.cy + 40; p.swing = null; p.charge = 0;
  s.visited = true;
  const f = n - 1, fi = (n - 1) % 8;
  for (const r of G.rooms) {
    if (r.type === 'treasure') G.pickups.push({ kind: 'altar', x: r.cx, y: r.cy, used: false });
    if (r.type === 'shop') {
      G.props.push({ kind: 'merchant', x: r.cx, y: r.cy - 70, r: 12, solid: true, hp: 1e9, flash: 0 });
      const items = [
        { t: 'potion', price: 12 + 4 * f },
        { t: 'key', price: 18 + 4 * f },
        { t: 'relic', relic: randomRelics(1)[0], price: 45 + 12 * f },
        { t: 'weapon', weapon: rollWeapon('shop'), price: 0 },
      ];
      items[3].price = 18 + 16 * items[3].weapon.stars + 8 * f;
      G.pickups.push({ kind: 'forge', x: r.cx, y: r.cy + 92 });
      items.forEach((it, i) => G.pickups.push({ kind: 'shop', item: it, x: r.cx + (i - 1.5) * 72, y: r.cy + 10 }));
    }
    if (r.type === 'secret') {
      G.pickups.push({ kind: 'relic', relic: randomRelics(1)[0], x: r.cx, y: r.cy });
      for (let i = 0; i < 10; i++) dropCoin(r.cx + rand(-60, 60), r.cy + rand(-30, 30));
      G.pickups.push({ kind: 'gem', x: r.cx - 40, y: r.cy + 30, vx: 0, vy: 0 });
      G.pickups.push({ kind: 'key', x: r.cx, y: r.cy + 44 });
    }
  }
  // subjefe: en la antesala del jefe (o en la sala de combate más profunda)
  const ante = layout.boss.links[0];
  const subRoom = ante && ante.type === 'combat' ? ante : G.rooms.filter(r => r.type === 'combat').sort((a, b) => b.depth - a.depth)[0];
  if (subRoom) { subRoom.sub = true; subRoom.waves = 1; }
  // desde el piso 4 hay subjefes extra (de pisos anteriores) en otras salas: 1 más, y 2 desde el piso 7
  const extraSubs = G.fi >= 6 ? 2 : G.fi >= 3 ? 1 : 0;
  shuffle(G.rooms.filter(r => r.type === 'combat' && !r.sub && r.depth >= 1)).slice(0, extraSubs).forEach(r => { r.sub = true; r.waves = 1; r.subK = G.fi + 1; r.subExtra = true; });
  // salas de evento: 2 o 3 de las de 01d-salas/
  const evKinds = shuffle(roomList()).slice(0, randi(2, 3));
  const evRooms = shuffle(G.rooms.filter(r => r.type === 'combat' && !r.sub && r.depth >= 1));
  evKinds.forEach((k, i) => {
    const r = evRooms[i]; if (!r) return;
    r.ev = k;
    ROOM_DEFS[k].colocar(r);   // cada sala se prepara en su archivo de 01d-salas/
  });
  // desafíos en 1 o 2 salas de combate
  G.dare = null;
  const dk = Object.keys(DARES).filter(k => !DARES[k].cls || DARES[k].cls === G.player.char);
  shuffle(G.rooms.filter(r => r.type === 'combat' && !r.sub && !r.ev && r.depth >= 1)).slice(0, randi(1, 2)).forEach(r => r.dare = pick(dk));
  // pacto del piso (desde el piso 2)
  G.pact = n >= 2 ? null : '';
  G.pactIds = n >= 2 ? shuffle(Object.keys(PACTS).filter(k => k !== 'none')).slice(0, 2) : null;
  if (n >= 2) later(2.4, offerPact);
  const tesoro = G.rooms.find(r => r.type === 'treasure'), n0 = noteFor(0);
  if (tesoro && n0 >= 0) G.pickups.push({ kind: 'note', id: n0, x: tesoro.cx + 70, y: tesoro.cy + 30 });
  G.chal = null; G.pet = mkPet(G.petKind); G.syn = null;
  // 3 tótems elementales por piso, repartidos al azar entre las salas de combate
  let tRooms = shuffle(G.rooms.filter(r => r.type === 'combat' && !r.sub));
  const nTot = n >= 4 ? 4 : 3;
  if (tRooms.length < nTot) tRooms = tRooms.concat(G.rooms.filter(r => r.sub));
  tRooms.slice(0, nTot).forEach(r => r.totemEl = totemElement());
  if (n >= 5) ach('deep5');
  if (n >= 8) ach('deep8');
  for (const r of G.rooms) {
    if (r.type !== 'combat') continue;
    const nCr = randi(2, 4), nBa = randi(1, 2);
    for (let i = 0; i < nCr + nBa; i++) {
      const pos = freeSpot(r, 2, 40);
      if (pos) G.props.push({ kind: i < nCr ? 'crate' : 'barrel', x: pos.x, y: pos.y, r: 12, hp: i < nCr ? 4 : 1, solid: true, flash: 0 });
    }
  }
  G.dx = null; updateAdapt(false);
  if (G.threat > 0) later(2.8, () => showBanner(tr('Los enemigos se adaptan'), '#d4474b', tr`Tu arsenal es fuerte: amenaza +${Math.round(G.threat * 100)} %`));
  G.snap = snapRun();
  if (started) { SAVE.run = G.snap; writeSave(); }
  if (!G.player.spec && G.player.preK >= SUB_UNLOCK) later(1.2, offerSpec);
  showBanner(tr`Piso ${n} · ${G.cycle > 1 ? tr('Abismo eterno · ') : ''}${FLOORS[fi].name}`, '#e3a24a', G.cycle > 1 ? tr('La cripta te recuerda…') : NARRATOR[fi]);
}

function inCross(r, tx, ty) { return Math.abs(tx - r.tcx) <= 2 || Math.abs(ty - r.tcy) <= 2; }
function freeSpot(r, margin = 2, minProp = 30, avoid = null, minAvoid = 0) {
  for (let tries = 0; tries < 80; tries++) {
    const tx = randi(r.x + margin, r.x + r.w - 1 - margin), ty = randi(r.y + margin, r.y + r.h - 1 - margin);
    if (G.tiles[ty * MW + tx] !== FLOOR) continue;
    if (minProp > 35 && inCross(r, tx, ty)) continue;
    const x = (tx + .5) * TILE, y = (ty + .5) * TILE;
    if (hitsWall(x, y, 13)) continue;
    if (G.props.some(o => !o.dead && Math.hypot(o.x - x, o.y - y) < minProp)) continue;
    if (avoid && Math.hypot(avoid.x - x, avoid.y - y) < minAvoid) continue;
    return { x, y };
  }
  return null;
}
// sorteo de reliquias: solo las que sirven a tu clase; las propias de tu clase pesan el doble (v0.60)
function randomRelics(n) {
  const owned = G ? G.player.relics : [], ch = G ? G.player.char : CUR_CHAR;
  const pool = Object.keys(RELICS).filter(id => !(RELICS[id].u && owned.includes(id)) && relicFor(id, ch));
  const bag = pool.flatMap(id => RELICS[id].cls && RELICS[id].cls.length === 1 ? [id, id] : [id]);
  return [...new Set(shuffle(bag))].slice(0, n);
}

// Otros módulos no pueden reasignar estas variables directamente (un import es de solo lectura): usan estas funciones.
function setPaused(v) { return (paused = v); }
function setStarted(v) { return (started = v); }

export { G, buildFloor0, freeSpot, newRun, paused, randomRelics, rc, setPaused, setStarted, started };
