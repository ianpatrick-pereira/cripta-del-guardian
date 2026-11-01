// ================= Historia: notas del diario =================
import { tr } from './00b-textos.js';
import { DATOS } from '../datos/index.js';
import { $ } from './00-inicio.js';
import { esc } from './01-utilidades.js';
import { SAVE, writeSave } from './04-guardado.js';
import { sfx } from './05-audio.js';
import { G } from './07-estado.js';
import { keys, mouse, touch } from './10-entrada.js';
import { ach } from './21-logros-y-bestiario.js';
import { showEnd } from './33-bucle.js';
const NOTES = [
  { t: tr('Diario de Aldric · día 1'), b: tr('Mi hermana Elena bajó a la cripta hace tres lunas. En el pueblo dicen que nadie vuelve. Yo volveré, y la traeré conmigo.') },
  { t: tr('Garabato en la pared'), b: tr('EL GUARDIÁN NO PROTEGE LA CRIPTA. PROTEGE AL MUNDO DE LO QUE HAY ABAJO.') },
  { t: tr('Diario de Aldric · día 4'), b: tr('Encontré su capa enredada en telarañas. La Reina canta con la voz de Elena. Juro que la oí llamarme por mi nombre.') },
  { t: tr('Página arrancada'), b: tr('Las catacumbas recuerdan a cada visitante. Tejen sus recuerdos en seda y los cuelgan como trofeos. Si oyes tu nombre, no contestes.') },
  { t: tr('Diario de Aldric · día ¿?'), b: tr('Ya no sé cuántos días llevo aquí. La luz se apaga sola. Algo se come la luz y deja ojos en su lugar. Me miran incluso cuando duermo.') },
  { t: tr('Última página, letra temblorosa'), b: tr('Si alguien lee esto: el Guardián del primer piso llevaba mi armadura. Mi escudo. Mi cara. Yo soy el Guardián. Yo siempre fui el Guardián.') },
  { t: tr('Inscripción en el portal'), b: tr('Quien vence al Devorador ocupa su lugar en el círculo. La cripta no tiene fondo: solo tiene turnos.') },
  { t: tr('Nota sin firma'), b: tr('Elena no está perdida. Elena es la cripta. Cada sala que cruzas es una habitación de su casa.') },
  { t: tr('Tu propia letra'), b: tr('No recuerdas haberla escrito. «Diario, día 1: Mi hermana bajó a la cripta hace tres lunas…»') },
];
const NARRATOR = [tr('Algo respira bajo las losas…'), tr('Huele a seda húmeda y a carne vieja…'), tr('No dejes que se apague la luz'), tr('El frío conserva a los muertos… y su rencor'),
  tr('El martillo sigue sonando, aunque nadie lo sostiene'), tr('Las raíces beben de algo que aún late'), tr('Alguien reza tu nombre al revés'), tr('Ella te estaba esperando')];
function noteFor(slot) { // slot 0 = altar del tesoro, 1 = sala del subjefe
  if (G.cycle === 1 && G.fi < 3) return G.fi * 2 + slot;
  return slot === 0 ? 6 + ((G.floor - 4) % 3) : -1;
}
function openNote(id) {
  const N = NOTES[id]; if (!N) return;
  const fresh = !SAVE.notes[id];
  SAVE.notes[id] = true; writeSave();
  if (Object.keys(SAVE.notes).length >= NOTES.length) ach('lore');
  G.choice = { note: true, ids: [] };
  keys.clear(); mouse.down = mouse.right = false; touch.atk = touch.chg = false;
  $('noteEyebrow').textContent = fresh ? tr`Nota nueva · ${Object.keys(SAVE.notes).length}/${NOTES.length} en tu diario` : tr('Nota del diario');
  $('noteTitle').textContent = N.t; $('noteText').textContent = N.b;
  $('ovNote').hidden = false; sfx(300, .6, 'sine', .03, -100);
}
// ---------- los dos finales (textos en src/datos/finales.jsonc) ----------
// con todas las notas del diario: el final verdadero; si falta alguna, el otro
function openEpilogue() {
  const faltan = NOTES.length - Object.keys(SAVE.notes).length, F = faltan <= 0 ? DATOS.finales.completo : DATOS.finales.incompleto;
  if (faltan <= 0) ach('truth');
  $('epiEyebrow').textContent = F.etiqueta; $('epiTitle').textContent = F.titulo;
  $('epiText').innerHTML = F.texto.map(t => `<p class="lead">${esc(t)}</p>`).join('');
  $('epiHint').textContent = faltan > 0 ? tr`Te ${faltan === 1 ? tr('falta 1 página') : tr`faltan ${faltan} páginas`} del diario para conocer la verdad.` : '';
  $('ovEpi').hidden = false; sfx(180, 1.2, 'sine', .04, -60);
}
function closeEpilogue() { $('ovEpi').hidden = true; showEnd(); }
function closeNote() { if (G.choice && G.choice.note) G.choice = null; $('ovNote').hidden = true; }

export { NARRATOR, NOTES, closeEpilogue, closeNote, noteFor, openEpilogue, openNote };
