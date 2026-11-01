// ================= Historial de partidas =================
// Al terminar cada partida se guarda un resumen (las últimas 50). El menú muestra patrones:
// en qué piso caes con cada clase y qué te mata más.
import { tr } from './00b-textos.js';
import { $ } from './00-inicio.js';
import { esc } from './01-utilidades.js';
import { CHARS } from './03-datos-del-juego.js';
import { SAVE } from './04-guardado.js';
import { G } from './07-estado.js';
const HIST_MAX = 50;
function saveHistory(won) {
  const p = G.player, w = p.slots[p.cur];
  SAVE.hist = [{ fecha: Date.now(), clase: p.char, piso: G.floor, tiempo: Math.floor(G.time), bajas: G.kills, monedas: G.coins,
    gano: !!won, causa: won ? null : G.hitBy || null, arma: w ? w.name : null, dif: G.diff, diario: !!G.daily }, ...(SAVE.hist || [])].slice(0, HIST_MAX);
}
const mmss = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
function renderHistory() {
  const H = SAVE.hist || [];
  $('histCount').textContent = `· ${H.length} ${H.length === 1 ? tr('partida') : tr('partidas')}`;
  if (!H.length) { $('histList').innerHTML = tr('<div class="off"><b>Sin partidas aún</b>Cada partida que termines aparecerá aquí.</div>'); return; }
  const out = [];
  // por clase: partidas, piso medio y mejor piso
  for (const c of Object.keys(CHARS)) {
    const h = H.filter(x => x.clase === c); if (!h.length) continue;
    const media = h.reduce((a, x) => a + x.piso, 0) / h.length, mejor = Math.max(...h.map(x => x.piso)), v = h.filter(x => x.gano).length;
    out.push(tr`<div><b>${esc(CHARS[c].name)}</b>${h.length} ${h.length === 1 ? tr('partida') : tr('partidas')} · piso medio ${media.toFixed(1)} · mejor ${mejor}${v ? ` · ${v} ${v === 1 ? tr('victoria') : tr('victorias')}` : ''}</div>`);
  }
  // lo que más te derrota y el piso donde más caes
  const cuenta = k => { const m = {}; for (const x of H) if (!x.gano && x[k] != null) m[x[k]] = (m[x[k]] || 0) + 1; return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const causas = cuenta('causa'), pisos = cuenta('piso');
  if (causas.length) out.push(tr`<div><b>Lo que más te derrota</b>${causas.slice(0, 3).map(([n, k]) => `${esc(n)} (${k})`).join(' · ')}</div>`);
  if (pisos.length) out.push(tr`<div><b>Donde más caes</b>${pisos.slice(0, 3).map(([n, k]) => tr`piso ${n} (${k})`).join(' · ')}</div>`);
  // últimas partidas
  for (const x of H.slice(0, 8)) out.push(tr`<div class="${x.gano ? '' : 'off'}"><b>${x.gano ? '✓ ' : ''}${esc(CHARS[x.clase] ? CHARS[x.clase].name : x.clase)} · piso ${x.piso}</b>${mmss(x.tiempo)} · ${x.bajas} bajas${x.arma ? ' · ' + esc(x.arma) : ''}${x.causa ? tr(' · te derrotó: ') + esc(x.causa) : ''}</div>`);
  $('histList').innerHTML = out.join('');
}

export { renderHistory, saveHistory };
