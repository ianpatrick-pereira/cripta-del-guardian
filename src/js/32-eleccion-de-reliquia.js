// ================= Elección de reliquia =================
import { tr } from './00b-textos.js';
import { $ } from './00-inicio.js';
import { esc } from './01-utilidades.js';
import { RELICS } from './03-datos-del-juego.js';
import { G } from './07-estado.js';
import { keys, mouse, touch } from './10-entrada.js';
import { gainRelic } from './13-armadura.js';
import { SPECS, TALENTS, gainTalent, setSpec } from './26-clases.js';
import { PACTS, setPact } from './27-pactos-de-piso.js';
function openChoice(eyebrow, title, ids, done, kind = 'relic') {
  ids = ids.filter(Boolean);
  if (!ids.length) { done(); return; }
  G.choice = { ids, done, kind };
  keys.clear(); mouse.down = mouse.right = false; touch.atk = touch.chg = false;
  $('choiceEyebrow').textContent = eyebrow; $('choiceTitle').textContent = title;
  $('choiceCards').innerHTML = ids.map((id, i) => {
    const R = (kind === 'talent' ? TALENTS : kind === 'spec' ? SPECS : kind === 'pact' ? PACTS : RELICS)[id], n = kind === 'relic' ? G.player.relics.filter(x => x === id).length : 0;
    const extra = kind === 'spec' ? tr`<span class="abil">F · ${esc(R.abil)}: ${esc(R.abilDesc)}</span><span class="meta">Al subir de nivel (Nv1 a Nv5): ${esc(R.grow)}</span>` : n ? tr`<span class="abil">Ya tienes ${n}</span>` : '';
    return `<button class="card choice" type="button" data-i="${i}" style="border-color:${R.c}"><span class="key">${i + 1}</span><b style="color:${R.c}">${esc(R.n)}</b><span class="meta">${esc(R.d)}</span>${extra}</button>`;
  }).join('');
  $('choiceCards').querySelectorAll('button').forEach(b => b.addEventListener('click', () => pickChoice(+b.dataset.i)));
  $('ovChoice').hidden = false;
}
function pickChoice(i) {
  const c = G && G.choice; if (!c || !c.ids[i]) return;
  G.choice = null; $('ovChoice').hidden = true;
  const id = c.ids[i];
  if (c.kind === 'talent') gainTalent(id); else if (c.kind === 'spec') setSpec(id); else if (c.kind === 'pact') setPact(id); else gainRelic(id);
  c.done();
}

export { openChoice, pickChoice };
