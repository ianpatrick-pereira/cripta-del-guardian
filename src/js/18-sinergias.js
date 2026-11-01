// ================= Sinergias =================
import { tr } from './00b-textos.js';
import { SAVE } from './04-guardado.js';
import { sfx } from './05-audio.js';
import { G, rc } from './07-estado.js';
import { showBanner } from './09-efectos.js';
import { ach } from './21-logros-y-bestiario.js';
const hasFx = f => G.player.slots.some(w => w.fx === f);
const SYNERGIES = [
  { id: 'infierno', n: tr('Infierno'),            c: '#ff8a3a', r: tr('Arma de fuego + Pólvora negra'),            d: tr('Los enemigos en llamas explotan al morir.'),                 ok: () => hasFx('burn') && rc('polvora') },
  { id: 'toxica',   n: tr('Tormenta tóxica'),     c: '#9be05a', r: tr('Bastón del rayo + veneno (arma o reliquia)'), d: tr('Los rayos en cadena envenenan.'),                             ok: () => hasFx('chain') && (rc('veneno') || hasFx('poison')) },
  { id: 'quebrar',  n: tr('Escarcha quebradiza'), c: '#9bd8ff', r: tr('Arma de hielo + Ojo del cazador o Piedra de afilar'), d: tr('Los enemigos ralentizados reciben +50 % de daño.'), ok: () => hasFx('slow') && (rc('ojo') || rc('piedra')) },
  { id: 'sangre',   n: tr('Sangre y acero'),      c: '#b0303a', r: tr('Arma que roba vida + Sangre de vampiro'),     d: tr('Doble robo de vida y te curas cada 8 bajas.'),               ok: () => G.player.slots.some(w => w.leech) && rc('vampiro') },
  { id: 'lluvia',   n: tr('Lluvia de flechas'),   c: '#e3a24a', r: tr('Carcaj extra + Flechas rebotantes'),          d: tr('Los arcos disparan 1 flecha más y rebotan 2 veces.'),        ok: () => rc('carcaj') && rc('rebote') },
  { id: 'viento',   n: tr('Filo del viento'),     c: '#9be0c8', r: tr('Onda cortante + Botas de viento'),            d: tr('Las ondas de espada son enormes y lo atraviesan todo.'),     ok: () => rc('onda') && rc('botas') },
  { id: 'arcano',   n: tr('Mente arcana'),        c: '#5aa4e8', r: tr('Un bastón + Batería arcana'),                 d: tr('Los bastones cuestan la mitad de energía.'),                 ok: () => G.player.slots.some(w => w.type === 'staff') && rc('bateria') },
  { id: 'erizo',    n: tr('Fortaleza erizo'),     c: '#7a9a5a', r: tr('Coraza de espinas + Escudo rúnico'),          d: tr('El doble de espinas y más dañinas.'),                        ok: () => rc('espinas') && rc('escudo') },
];
const syn = id => !!(G && G.syn && G.syn.has(id));
function updateSyn() {
  const now = new Set(SYNERGIES.filter(s => s.ok()).map(s => s.id));
  for (const s of SYNERGIES) if (now.has(s.id) && !(G.syn && G.syn.has(s.id))) {
    showBanner(tr('¡Sinergia! ') + s.n, s.c, s.d); sfx(700, .3, 'triangle', .05, 600);
    SAVE.syn[s.id] = true; ach('synergy');
  }
  G.syn = now;
}

export { SYNERGIES, syn, updateSyn };
