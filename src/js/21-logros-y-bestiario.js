// ================= Logros y bestiario =================
import { tr } from './00b-textos.js';
import { ENEMIES, enemyList } from './01a-registro.js';
import { SAVE, writeSave } from './04-guardado.js';
import { sfx } from './05-audio.js';
import { G, started } from './07-estado.js';
import { later } from './09-efectos.js';
import { NOTES } from './20-historia.js';
const ACH = {
  first:     { n: tr('Primera sangre'),       d: tr('Derrota a tu primer enemigo.'), g: 1 },
  sub:       { n: tr('Cazador de capitanes'), d: tr('Derrota a un subjefe.'), g: 2 },
  boss1:     { n: tr('Guardián caído'),       d: tr('Derrota al Guardián de la Cripta.'), g: 3 },
  boss3:     { n: tr('Luz recuperada'),       d: tr('Derrota al Devorador de Luz.'), g: 5 },
  win:       { n: tr('Conquistador'),         d: tr('Supera los tres pisos.'), g: 5 },
  nightmare: { n: tr('Sin miedo'),            d: tr('Supera los tres pisos en Pesadilla.'), g: 10 },
  deep5:     { n: tr('Abismo eterno'),        d: tr('Llega al piso 5.'), g: 5 },
  deep8:     { n: tr('Sin fondo'),            d: tr('Llega al piso 8.'), g: 10 },
  star5:     { n: tr('Leyenda'),              d: tr('Consigue un arma de 5★.'), g: 4 },
  forge:     { n: tr('Herrero'),              d: tr('Compra 5 mejoras en la forja.'), g: 2 },
  trial:     { n: tr('Superviviente'),        d: tr('Supera una sala de desafío.'), g: 2 },
  curse:     { n: tr('Pacto de sangre'),      d: tr('Usa un altar maldito.'), g: 1 },
  rescue:    { n: tr('Libertador'),           d: tr('Rescata a un prisionero.'), g: 2 },
  synergy:   { n: tr('Alquimista'),           d: tr('Activa una sinergia.'), g: 2 },
  lore:      { n: tr('Cronista'),             d: tr`Encuentra las ${NOTES.length} notas del diario.`, g: 6 },
  truth:     { n: tr('El círculo roto'),      d: tr('Sal de la cripta con el diario completo y conoce el final verdadero.'), g: 8 },
  pet:       { n: tr('Nunca solo'),           d: tr('Consigue un compañero.'), g: 1 },
  crystal:   { n: tr('Esencia elemental'),    d: tr('Consigue un cristal elemental.'), g: 2 },
  awaken:    { n: tr('Despertar'),            d: tr('Despierta la habilidad elemental de un arma.'), g: 4 },
  bestiary:  { n: tr('Naturalista'),          d: tr('Derrota a cada tipo de enemigo.'), g: 4 },
};
function ach(id) {
  if (!ACH[id] || SAVE.ach[id]) return;
  SAVE.ach[id] = true; SAVE.gems += ACH[id].g; writeSave();
  if (G && started) { (G.toasts = G.toasts || []).push({ txt: tr`Logro: ${ACH[id].n}  ·  +${ACH[id].g} ${ACH[id].g === 1 ? 'gema' : 'gemas'}`, t: 3.5 }); sfx(880, .15, 'triangle', .04, 400); later(.12, () => sfx(1320, .2, 'triangle', .04)); }
}
// la ficha de cada enemigo viene de su archivo de 01b-enemigos/
const BEAST = {};
for (const id of enemyList()) BEAST[id] = ENEMIES[id].bestiario;

export { ACH, BEAST, ach };
