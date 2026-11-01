// ================= Logros y bestiario =================
import { ENEMIES, enemyList } from './01a-registro.js';
import { SAVE, writeSave } from './04-guardado.js';
import { sfx } from './05-audio.js';
import { G, started } from './07-estado.js';
import { later } from './09-efectos.js';
import { NOTES } from './20-historia.js';
const ACH = {
  first:     { n: 'Primera sangre',       d: 'Derrota a tu primer enemigo.', g: 1 },
  sub:       { n: 'Cazador de capitanes', d: 'Derrota a un subjefe.', g: 2 },
  boss1:     { n: 'Guardián caído',       d: 'Derrota al Guardián de la Cripta.', g: 3 },
  boss3:     { n: 'Luz recuperada',       d: 'Derrota al Devorador de Luz.', g: 5 },
  win:       { n: 'Conquistador',         d: 'Supera los tres pisos.', g: 5 },
  nightmare: { n: 'Sin miedo',            d: 'Supera los tres pisos en Pesadilla.', g: 10 },
  deep5:     { n: 'Abismo eterno',        d: 'Llega al piso 5.', g: 5 },
  deep8:     { n: 'Sin fondo',            d: 'Llega al piso 8.', g: 10 },
  star5:     { n: 'Leyenda',              d: 'Consigue un arma de 5★.', g: 4 },
  forge:     { n: 'Herrero',              d: 'Compra 5 mejoras en la forja.', g: 2 },
  trial:     { n: 'Superviviente',        d: 'Supera una sala de desafío.', g: 2 },
  curse:     { n: 'Pacto de sangre',      d: 'Usa un altar maldito.', g: 1 },
  rescue:    { n: 'Libertador',           d: 'Rescata a un prisionero.', g: 2 },
  synergy:   { n: 'Alquimista',           d: 'Activa una sinergia.', g: 2 },
  lore:      { n: 'Cronista',             d: `Encuentra las ${NOTES.length} notas del diario.`, g: 6 },
  truth:     { n: 'El círculo roto',      d: 'Sal de la cripta con el diario completo y conoce el final verdadero.', g: 8 },
  pet:       { n: 'Nunca solo',           d: 'Consigue un compañero.', g: 1 },
  crystal:   { n: 'Esencia elemental',    d: 'Consigue un cristal elemental.', g: 2 },
  awaken:    { n: 'Despertar',            d: 'Despierta la habilidad elemental de un arma.', g: 4 },
  bestiary:  { n: 'Naturalista',          d: 'Derrota a cada tipo de enemigo.', g: 4 },
};
function ach(id) {
  if (!ACH[id] || SAVE.ach[id]) return;
  SAVE.ach[id] = true; SAVE.gems += ACH[id].g; writeSave();
  if (G && started) { (G.toasts = G.toasts || []).push({ txt: `Logro: ${ACH[id].n}  ·  +${ACH[id].g} ${ACH[id].g === 1 ? 'gema' : 'gemas'}`, t: 3.5 }); sfx(880, .15, 'triangle', .04, 400); later(.12, () => sfx(1320, .2, 'triangle', .04)); }
}
// la ficha de cada enemigo viene de su archivo de 01b-enemigos/
const BEAST = {};
for (const id of enemyList()) BEAST[id] = ENEMIES[id].bestiario;

export { ACH, BEAST, ach };
