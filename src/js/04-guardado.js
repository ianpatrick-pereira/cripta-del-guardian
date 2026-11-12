// ================= Guardado =================
import { CHARS, STAR_MUL, WEAPONS } from './03-datos-del-juego.js';
const SAVE_KEY = 'cripta-guardian-v1';
// Versión del formato del guardado. Súbela cuando cambie la forma de lo que se guarda
// y añade en SAVE_MIGRA el paso que convierte la versión anterior en la nueva.
const SAVE_VER = 3;
const SAVE_MIGRA = {
  2: s => s,  // v1 → v2: mismo formato; solo empieza a llevar número de versión
  3: s => ({ ...s, hist: Array.isArray(s.hist) ? s.hist : [] })   // v3: historial de partidas
};
const defaultSave = () => ({ ver: SAVE_VER, gems: 0, chars: { knight: true, archer: false, rogue: false }, upg: { hp: 0, coin: 0, en: 0 }, best: 0, wins: 0, diff: 'normal',
  ach: {}, kills: {}, found: {}, notes: {}, syn: {}, pets: {}, pet: '', startW: '', forged: 0, rescued: 0, run: null, hist: [], guia: false, circ: 0, circSel: 0, skins: {}, skin: {},
  opt: { music: .8, sfx: .8, shake: 1, gfx: 'auto' } });
// la partida en curso solo se conserva si todo lo que nombra sigue existiendo en esta versión
function runValid(r) {
  return !!r && typeof r === 'object' && Number.isFinite(r.floor) && !!CHARS[r.char] && Array.isArray(r.slots) && r.slots.length > 0
    && r.slots.every(o => o && WEAPONS.some(w => w.id === o.id) && o.stars >= 1 && o.stars <= STAR_MUL.length);
}
function migrateSave(s) {
  let v = s.ver || 1;
  if (v > SAVE_VER) { s.run = null; return s; }   // guardado de una versión más nueva: se respeta el progreso, no la partida
  try { while (v < SAVE_VER) { v++; if (SAVE_MIGRA[v]) s = SAVE_MIGRA[v](s); } } catch (_) { s.run = null; }
  s.ver = SAVE_VER;
  if (s.run && !runValid(s.run)) s.run = null;
  return s;
}
function loadSave() {
  try { let s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) { s = migrateSave(s); const d = defaultSave(); return { ...d, ...s, chars: { ...d.chars, ...s.chars }, upg: { ...d.upg, ...s.upg }, opt: { ...d.opt, ...s.opt } }; } } catch (_) {}
  return defaultSave();
}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (_) {} }
let SAVE = loadSave();
let selChar = 'knight';

// Otros módulos no pueden reasignar estas variables directamente (un import es de solo lectura): usan estas funciones.
function setSelChar(v) { return (selChar = v); }

export { SAVE, selChar, setSelChar, writeSave };
