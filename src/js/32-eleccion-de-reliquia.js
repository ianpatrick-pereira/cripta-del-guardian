// ================= Elección de reliquia =================
import { tr } from './00b-textos.js';
import { $ } from './00-inicio.js';
import { esc, fmtNum } from './01-utilidades.js';
import { RELICS } from './03-datos-del-juego.js';
import { sfx } from './05-audio.js';
import { G, randomRelics, rc } from './07-estado.js';
import { keys, mouse, touch } from './10-entrada.js';
import { critChance, dmgMul, maxEnergy } from './11-jugador.js';
import { armorSh, gainRelic } from './13-armadura.js';
import { SYNERGIES } from './18-sinergias.js';
import { SPECS, TALENTS, gainTalent, setSpec } from './26-clases.js';
import { PACTS, setPact } from './27-pactos-de-piso.js';

// las cifras que una reliquia puede cambiar; se comparan antes y después de tenerla
function statSnap() {
  const p = G.player;
  return [
    [tr('Daño'), '×' + fmtNum(dmgMul())],
    [tr('Crítico'), Math.round(Math.min(1, critChance()) * 100) + ' %'],
    [tr('Energía máx.'), String(maxEnergy(p))],
    [tr('Escudo máx.'), String(p.maxSh + rc('escudo') + armorSh(p))],
    [tr('Velocidad'), '+' + 15 * rc('botas') + ' %'],
  ];
}
// "Vida máx.: 8 → 10": el efecto de la reliquia en números
function relicPreview(id) {
  const p = G.player, out = [];
  if (id === 'corazon') out.push(tr`Vida máx.: ${p.maxHp} → ${p.maxHp + 2}`);
  const a = statSnap(); p.relics.push(id); const b = statSnap(); p.relics.pop();
  a.forEach(([n, v], i) => { if (v !== b[i][1]) out.push(`${n}: ${v} → ${b[i][1]}`); });
  return out;
}
// la sinergia que se activaría al tomar esta reliquia (y que aún no tienes)
function relicSynergy(id) {
  const p = G.player; p.relics.push(id);
  const s = SYNERGIES.find(s => !(G.syn && G.syn.has(s.id)) && s.ok());
  p.relics.pop();
  return s || null;
}
// volver a tirar: una vez por piso, solo en las reliquias, cuesta oro
const rerollCost = () => 15 + 5 * G.floor;
const canReroll = c => c && c.kind === 'relic' && G.rerollF !== G.floor;

function openChoice(eyebrow, title, ids, done, kind = 'relic') {
  ids = ids.filter(Boolean);
  if (!ids.length) { done(); return; }
  G.choice = { ids, done, kind };
  keys.clear(); mouse.down = mouse.right = false; touch.atk = touch.chg = false;
  $('choiceEyebrow').textContent = eyebrow; $('choiceTitle').textContent = title;
  renderChoice();
  $('ovChoice').hidden = false;
}
function renderChoice() {
  const { ids, kind } = G.choice;
  $('choiceCards').innerHTML = ids.map((id, i) => {
    const R = (kind === 'talent' ? TALENTS : kind === 'spec' ? SPECS : kind === 'pact' ? PACTS : RELICS)[id], n = kind === 'relic' ? G.player.relics.filter(x => x === id).length : 0;
    let extra = kind === 'spec' ? tr`<span class="abil">F · ${esc(R.abil)}: ${esc(R.abilDesc)}</span><span class="meta">Al subir de nivel (Nv1 a Nv5): ${esc(R.grow)}</span>` : n ? tr`<span class="abil">Ya tienes ${n}</span>` : '';
    let icon = '', cls = '', glow = '';
    if (kind === 'relic') {
      icon = `<span class="ric" style="border-color:${R.c};color:${R.c}">${esc(R.n[0])}</span>`;
      const pv = relicPreview(id);
      if (pv.length) extra += `<span class="nums">${pv.map(esc).join('<br>')}</span>`;
      const s = relicSynergy(id);
      if (s) { extra += tr`<span class="synx" style="color:${s.c}">✦ Activa la sinergia ${esc(s.n)}</span>`; cls = ' syn'; glow = `;--glow:${s.c}`; }
    }
    return `<button class="card choice${cls}" type="button" data-i="${i}" style="border-color:${R.c}${glow}"><span class="key">${i + 1}</span>${icon}<b style="color:${R.c}">${esc(R.n)}</b><span class="meta">${esc(R.d)}</span>${extra}</button>`;
  }).join('');
  $('choiceCards').querySelectorAll('button').forEach(b => b.addEventListener('click', () => pickChoice(+b.dataset.i)));
  const act = $('choiceAct');
  if (canReroll(G.choice)) {
    const cost = rerollCost();
    act.innerHTML = tr`<button class="ghost small" id="btnReroll" type="button" ${G.coins >= cost ? '' : 'disabled'}>↻ Volver a tirar · ${cost} monedas (tecla R, una vez por piso)</button>`;
    $('btnReroll').addEventListener('click', rerollChoice);
    act.hidden = false;
  } else { act.innerHTML = ''; act.hidden = true; }
}
function rerollChoice() {
  const c = G && G.choice; if (!canReroll(c)) return;
  const cost = rerollCost(); if (G.coins < cost) { sfx(120, .1, 'square', .03); return; }
  const ids = randomRelics(3).filter(Boolean); if (!ids.length) return;
  G.coins -= cost; G.rerollF = G.floor; c.ids = ids;
  sfx(500, .08, 'triangle', .04, 400);
  renderChoice();
}
function pickChoice(i) {
  const c = G && G.choice; if (!c || !c.ids[i]) return;
  G.choice = null; $('ovChoice').hidden = true;
  const id = c.ids[i];
  if (c.kind === 'talent') gainTalent(id); else if (c.kind === 'spec') setSpec(id); else if (c.kind === 'pact') setPact(id); else gainRelic(id);
  c.done();
}

export { openChoice, pickChoice, rerollChoice };
