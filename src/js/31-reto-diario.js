// ================= Reto diario =================
import { SAVE, selChar, setSelChar } from './04-guardado.js';
import { G, buildFloor0, newRun } from './07-estado.js';
let DAILY = null;
const todayStr = () => new Date().toISOString().slice(0, 10);
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function dailyInfo(date = todayStr()) { const seed = hashStr('cripta-' + date); return { date, seed, char: ['knight', 'archer', 'rogue'][seed % 3] }; }
const dailyScore = () => (G.floor - 1) * 1000 + G.kills * 10 + G.coins + (G.won ? 3000 : 0);
// la mazmorra de cada piso sale de la semilla del día: todos juegan el mismo mapa
function buildFloor(n) {
  if (!DAILY) return buildFloor0(n);
  const R = Math.random; Math.random = mulberry32(DAILY.seed + n * 7919);
  try { return buildFloor0(n); } finally { Math.random = R; }
}
function startDaily() {
  const I = dailyInfo(); DAILY = I;
  // el reto es igual para todos: sin mejoras del altar, compañero ni arma inicial, en dificultad normal
  const keep = { upg: SAVE.upg, pet: SAVE.pet, startW: SAVE.startW, diff: SAVE.diff, circSel: SAVE.circSel };
  Object.assign(SAVE, { upg: { hp: 0, coin: 0, en: 0 }, pet: '', startW: '', diff: 'normal', circSel: 0 });
  setSelChar(I.char); newRun(I.char);
  Object.assign(SAVE, keep);
  G.daily = I.date;
}

// Otros módulos no pueden reasignar estas variables directamente (un import es de solo lectura): usan estas funciones.
function setDAILY(v) { return (DAILY = v); }

export { DAILY, buildFloor, dailyInfo, dailyScore, setDAILY, startDaily };
