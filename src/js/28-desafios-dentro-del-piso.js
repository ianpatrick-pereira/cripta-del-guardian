// ================= Desafíos dentro del piso =================
import { tr } from './00b-textos.js';
import { sfx } from './05-audio.js';
import { G } from './07-estado.js';
import { addText, showBanner } from './09-efectos.js';
const DARES = {
  nohit:  { d: tr('Despeja la sala sin recibir daño') },
  fast:   { d: tr('Despeja la sala en menos de 30 s'), t: 30 },
  nodash: { d: tr('Despeja la sala sin esquivar') },
  parry:  { d: tr('Haz 3 desvíos'), need: 3, cls: 'knight' },
  far:    { d: tr('Mata a 5 enemigos desde lejos'), need: 5, cls: 'archer' },
  back:   { d: tr('Golpea 8 veces por la espalda'), need: 8, cls: 'rogue' },
};
function dareStart(room) {
  if (!room.dare) return;
  const D0 = DARES[room.dare];
  G.dare = { room, kind: room.dare, n: 0, t: 0, fail: false };
  showBanner(tr('Desafío'), '#ffd27a', D0.d + tr(' · premio: cofre dorado'));
}
function dareFail(why) {
  if (!G.dare || G.dare.fail) return;
  G.dare.fail = true; addText(G.player.x, G.player.y - 36, tr('Desafío fallido') + (why ? ': ' + why : ''), '#d4474b', 13); sfx(140, .3, 'square', .04, -60);
}
function dareCount(kind) { if (G.dare && G.dare.kind === kind && !G.dare.fail) G.dare.n++; }
function dareClear(room) {
  const Dg = G.dare; if (!Dg || Dg.room !== room) return;
  G.dare = null;
  const D0 = DARES[Dg.kind];
  const ok = !Dg.fail && (!D0.need || Dg.n >= D0.need) && (!D0.t || Dg.t <= D0.t);
  if (!ok) { if (!Dg.fail) addText(G.player.x, G.player.y - 36, tr('Desafío fallido'), '#d4474b', 13); return; }
  showBanner(tr('¡Desafío cumplido!'), '#ffd27a', tr('Cofre dorado y llave'));
  G.pickups.push({ kind: 'chest', gold: true, x: room.cx + 60, y: room.cy + 40, opened: false, minR: 'rare' }, { kind: 'key', x: room.cx + 20, y: room.cy + 40 });
  sfx(880, .3, 'triangle', .05, 400);
}
function dareText() {
  const Dg = G.dare; if (!Dg) return '';
  const D0 = DARES[Dg.kind];
  return tr('Desafío: ') + D0.d + (D0.need ? ` (${Dg.n}/${D0.need})` : D0.t ? ` (${Math.max(0, Math.ceil(D0.t - Dg.t))} s)` : '') + (Dg.fail ? tr(' · fallido') : '');
}

export { DARES, dareClear, dareCount, dareFail, dareStart, dareText };
