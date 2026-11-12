// ================= Elección de reliquia =================
import { tr } from './00b-textos.js';
import { $ } from './00-inicio.js';
import { esc } from './01-utilidades.js';
import { RELICS } from './03-datos-del-juego.js';
import { sfx } from './05-audio.js';
import { G, randomRelics } from './07-estado.js';
import { keys, mouse, touch } from './10-entrada.js';
import { gainRelic } from './13-armadura.js';
import { SYNERGIES } from './18-sinergias.js';
import { SPECS, TALENTS, gainTalent, setSpec } from './26-clases.js';
import { PACTS, setPact } from './27-pactos-de-piso.js';
import { iconURL } from './31b-iconos.js';

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
    const R = (kind === 'talent' ? TALENTS : kind === 'spec' ? SPECS : kind === 'pact' ? PACTS : RELICS)[id];
    // la subclase conserva su explicación (cambia tu forma de pelear); el resto es imagen + título + una línea
    if (kind === 'spec') {
      const extra = tr`<span class="abil">F · ${esc(R.abil)}: ${esc(R.abilDesc)}</span><span class="meta">Al subir de nivel (Nv1 a Nv5): ${esc(R.grow)}</span>`;
      return `<button class="card choice" type="button" data-i="${i}" style="border-color:${R.c}"><span class="key">${i + 1}</span><b style="color:${R.c}">${esc(R.n)}</b><span class="meta">${esc(R.d)}</span>${extra}</button>`;
    }
    const n = kind === 'relic' ? G.player.relics.filter(x => x === id).length : 0;
    let tags = n ? tr`<span class="tag">Ya tienes ${n}</span>` : '', cls = '', glow = '';
    const s = kind === 'relic' ? relicSynergy(id) : null;
    if (s) { tags += tr`<span class="tag synx" style="color:${s.c}">✦ Sinergia: ${esc(s.n)}</span>`; cls = ' syn'; glow = `;--glow:${s.c}`; }
    return `<button class="card choice pic${cls}" type="button" data-i="${i}" style="border-color:${R.c}${glow}"><span class="key">${i + 1}</span>` +
      `<img class="cico" src="${iconURL(id, R.c)}" alt=""><b style="color:${R.c}">${esc(R.n)}</b><span class="short">${esc(R.d)}</span>${tags}</button>`;
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
