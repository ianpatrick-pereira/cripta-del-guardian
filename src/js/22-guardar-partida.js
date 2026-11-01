// ================= Guardar partida =================
// se guarda al empezar cada piso; al continuar, se reanuda al inicio de ese piso
import { applyW, mkW } from './03-datos-del-juego.js';
import { selChar, setSelChar } from './04-guardado.js';
import { G, newRun } from './07-estado.js';
import { subLv, tl } from './26-clases.js';
import { DAILY, buildFloor } from './31-reto-diario.js';
function snapRun() {
  const p = G.player;
  return { floor: G.floor, char: p.char, diff: G.diff, hp: p.hp, maxHp: p.maxHp, en: p.en, maxEn: p.maxEn, relics: p.relics.slice(), cur: p.cur,
    slots: p.slots.map(w => ({ id: w.id, stars: w.stars, up: { ...w.up }, el: w.el, elC: w.elC, elLv: w.elLv, starter: !!w.starter })), crystals: { ...G.crystals }, pet: G.petKind, armor: p.armor || 0, talents: p.talents.slice(), spec: p.spec || '', subK: p.subK || 0, preK: p.preK || 0, cu: { ...p.cu }, daily: DAILY ? DAILY.date : '', coins: G.coins, keys: G.keys, gems: G.gems, kills: G.kills, time: G.time, wonOnce: !!G.wonOnce };
}
function resumeRun(s) {
  setSelChar(s.char); newRun(s.char);
  G.petKind = s.pet || ''; G.pet = null;
  Object.assign(G, { diff: s.diff, coins: s.coins, keys: s.keys, gems: s.gems, kills: s.kills, time: s.time, wonOnce: s.wonOnce });
  const p = G.player;
  Object.assign(p, { hp: s.hp, maxHp: s.maxHp, en: s.en, maxEn: s.maxEn, relics: s.relics.slice(), cur: s.cur });
  p.slots = s.slots.map(o => { const w = mkW(o.id, o.stars); w.up = { ...o.up }; w.el = o.el || null; w.elC = o.elC || 0; w.elLv = o.elLv || 0; w.starter = !!o.starter; return applyW(w); });
  G.crystals = { fire: 0, water: 0, air: 0, earth: 0, ...(s.crystals || {}) };
  p.armor = s.armor || 0;
  p.talents = (s.talents || []).slice(); p.spec = s.spec || ''; G.daily = s.daily || ''; p.subK = s.subK || 0; p.preK = s.preK || 0; p.cu = { ...(s.cu || {}) };
  if (p.spec === 'paladin') { const L = subLv(p); p.maxSh += (L >= 2) + (L >= 4); }
  if (tl('muro')) { p.maxSh++; p.sh++; }
  buildFloor(s.floor);
}

export { resumeRun, snapRun };
