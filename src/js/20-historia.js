// ================= Historia: notas del diario =================
const NOTES = [
  { t: 'Diario de Aldric · día 1', b: 'Mi hermana Elena bajó a la cripta hace tres lunas. En el pueblo dicen que nadie vuelve. Yo volveré, y la traeré conmigo.' },
  { t: 'Garabato en la pared', b: 'EL GUARDIÁN NO PROTEGE LA CRIPTA. PROTEGE AL MUNDO DE LO QUE HAY ABAJO.' },
  { t: 'Diario de Aldric · día 4', b: 'Encontré su capa enredada en telarañas. La Reina canta con la voz de Elena. Juro que la oí llamarme por mi nombre.' },
  { t: 'Página arrancada', b: 'Las catacumbas recuerdan a cada visitante. Tejen sus recuerdos en seda y los cuelgan como trofeos. Si oyes tu nombre, no contestes.' },
  { t: 'Diario de Aldric · día ¿?', b: 'Ya no sé cuántos días llevo aquí. La luz se apaga sola. Algo se come la luz y deja ojos en su lugar. Me miran incluso cuando duermo.' },
  { t: 'Última página, letra temblorosa', b: 'Si alguien lee esto: el Guardián del primer piso llevaba mi armadura. Mi escudo. Mi cara. Yo soy el Guardián. Yo siempre fui el Guardián.' },
  { t: 'Inscripción en el portal', b: 'Quien vence al Devorador ocupa su lugar en el círculo. La cripta no tiene fondo: solo tiene turnos.' },
  { t: 'Nota sin firma', b: 'Elena no está perdida. Elena es la cripta. Cada sala que cruzas es una habitación de su casa.' },
  { t: 'Tu propia letra', b: 'No recuerdas haberla escrito. «Diario, día 1: Mi hermana bajó a la cripta hace tres lunas…»' },
];
const NARRATOR = ['Algo respira bajo las losas…', 'Huele a seda húmeda y a carne vieja…', 'No dejes que se apague la luz', 'El frío conserva a los muertos… y su rencor',
  'El martillo sigue sonando, aunque nadie lo sostiene', 'Las raíces beben de algo que aún late', 'Alguien reza tu nombre al revés', 'Ella te estaba esperando'];
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
  $('noteEyebrow').textContent = fresh ? `Nota nueva · ${Object.keys(SAVE.notes).length}/${NOTES.length} en tu diario` : 'Nota del diario';
  $('noteTitle').textContent = N.t; $('noteText').textContent = N.b;
  $('ovNote').hidden = false; sfx(300, .6, 'sine', .03, -100);
}
function closeNote() { if (G.choice && G.choice.note) G.choice = null; $('ovNote').hidden = true; }

