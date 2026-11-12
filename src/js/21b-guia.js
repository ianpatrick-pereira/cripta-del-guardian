// ================= Primer piso guiado =================
// En la primera partida (sin historial ni victorias) una tarjeta abajo enseña los controles paso a paso.
// Solo mira el estado del jugador: no toca la partida ni usa números aleatorios.
import { tr } from './00b-textos.js';
import { ctx } from './00-inicio.js';
import { SAVE, writeSave } from './04-guardado.js';
import { sfx } from './05-audio.js';
import { G } from './07-estado.js';
import { touch } from './10-entrada.js';

const PASOS = [
  { id: 'mover', pc: () => tr('Muévete con WASD o las flechas'), tc: () => tr('Muévete con el joystick de la izquierda'),
    listo: (p, g) => g.dist > 160 },
  { id: 'atacar', pc: () => tr('Ataca con clic izquierdo: apuntas con el ratón'), tc: () => tr('Pulsa ATACAR: apunta solo al enemigo más cercano'),
    listo: p => (p.atkN || 0) >= 3 },
  { id: 'cargar', pc: () => tr('Ataque cargado: mantén clic derecho y suelta'), tc: () => tr('Ataque cargado: mantén CARGA y suelta'),
    listo: p => (p.chgN || 0) >= 1 },
  { id: 'esquivar', pc: () => tr('Esquiva con Espacio: eres invulnerable un instante'), tc: () => tr('Pulsa ESQUIVA: eres invulnerable un instante'),
    listo: p => p.dashT > 0 },
  { id: 'habilidad', pc: () => tr('Habilidad de clase: tecla F (se recarga con el tiempo)'), tc: () => tr('Pulsa HABIL.: la habilidad de tu clase'),
    listo: p => p.abilCd > 0 },
  { id: 'sala', pc: () => tr('Cruza una puerta y limpia tu primera sala'), tc: () => tr('Cruza una puerta y limpia tu primera sala'),
    listo: () => G.roomsCleared >= 1 },
];

// la guía sale solo la primera vez, en el piso 1 y fuera del reto diario
const guiaActiva = () => !!G && !G.daily && G.floor === 1 && !SAVE.guia && !(SAVE.hist && SAVE.hist.length) && !SAVE.wins;

function updateGuide(dt) {
  if (!guiaActiva() || G.over || G.choice) return;
  const g = G.guia || (G.guia = { paso: 0, dist: 0, ok: 0, x: G.player.x, y: G.player.y });
  const p = G.player;
  g.dist += Math.hypot(p.x - g.x, p.y - g.y); g.x = p.x; g.y = p.y;
  if (g.ok > 0) { g.ok -= dt; if (g.ok <= 0) { g.paso++; if (g.paso >= PASOS.length) { SAVE.guia = true; writeSave(); } } return; }
  if (PASOS[g.paso].listo(p, g)) { g.ok = .9; sfx(880, .08, 'triangle', .04, 300); }
}

function drawGuide(w, h) {
  if (!guiaActiva() || !G.guia || G.guia.paso >= PASOS.length || G.over) return;
  const g = G.guia, P = PASOS[g.paso], txt = touch.on ? P.tc() : P.pc(), ok = g.ok > 0;
  ctx.font = '600 14px "Chakra Petch", ui-monospace, monospace';
  const bw = Math.min(w - 24, Math.max(260, ctx.measureText(txt).width + 48)), bh = 50;
  const x = (w - bw) / 2, y = touch.on ? 64 : h - 150;
  ctx.fillStyle = 'rgba(12,11,17,.85)'; ctx.fillRect(x, y, bw, bh);
  ctx.strokeStyle = ok ? '#6cc46a' : '#e3a24a'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, bw - 2, bh - 2);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '600 10px "Chakra Petch", ui-monospace, monospace'; ctx.fillStyle = '#9d95ab';
  ctx.fillText(tr`GUÍA · PASO ${g.paso + 1} DE ${PASOS.length}`, w / 2, y + 13);
  ctx.font = '600 14px "Chakra Petch", ui-monospace, monospace'; ctx.fillStyle = ok ? '#6cc46a' : '#ece4cf';
  ctx.fillText(ok ? '✓ ' + txt : txt, w / 2, y + 32);
  // puntos de progreso
  for (let i = 0; i < PASOS.length; i++) { ctx.fillStyle = i < g.paso || (i === g.paso && ok) ? '#6cc46a' : '#3a3548'; ctx.fillRect(x + bw - 12 - (PASOS.length - i) * 8, y + 9, 5, 5); }
}

export { drawGuide, updateGuide };
