// ================= Forja =================
const FORGE = {
  dmg:  { n: 'Filo',       d: '+8 % de daño' },
  rate: { n: 'Cadencia',   d: 'ataca un 10 % más rápido' },
  chg:  { n: 'Carga',      d: '+20 % de daño del ataque cargado' },
  en:   { n: 'Eficiencia', d: '−1 energía por ataque y −12 % en la carga' },
};
const FORGE_MAX = 3;
const forgeCost = (w, k) => Math.round(((10 + 6 * w.stars) * (1 + .6 * (w.up[k] || 0)) + 6 * (G.floor - 1)) * (k === 'bones' ? 2.5 : 1));
// mejora exclusiva y cara del grimorio
const BONES_UP = { n: 'Legión mayor', d: '+1 esqueleto como máximo por nivel (mejora cara)' };
function openForge() {
  G.choice = { forge: true, ids: [] };
  keys.clear(); mouse.down = mouse.right = false; touch.atk = touch.chg = false;
  renderForge(); $('ovForge').hidden = false;
}
function renderForge() {
  $('forgeCoins').textContent = `Tienes ${G.coins} monedas y ${EL_ORDER.map(el => `${G.crystals[el]} ${ELEMS[el].n.toLowerCase()}`).join(', ')} en cristales. Las mejoras normales llegan hasta 4★; la infusión elemental es para armas de 3★ o más.`;
  $('forgeList').innerHTML = G.player.slots.map((w, i) => {
    const R = RARITY[w.rarity];
    const head = `<div class="hd"><b style="color:${R.c}">${esc(w.name)}</b><span style="color:${R.c}">${R.n}</span></div><div class="st">${esc(weaponStats(w))}</div>`;
    const elb = elemForgeHTML(w, i);
    if (w.stars >= 5) return `<div class="fw">${head}<div class="st">Arma legendaria: no admite mejoras normales.</div>${elb}</div>`;
    const ups = Object.entries(w.style ? { ...FORGE, esp: STYLE[w.style].esp, ...(w.style === 'grimoire' ? { bones: BONES_UP } : {}) } : FORGE).map(([k, f]) => {
      const lv = w.up[k] || 0, max = lv >= FORGE_MAX, cost = forgeCost(w, k), useless = k === 'en' && w.en === 0 && w.chgEn <= 4;
      return `<button class="small" type="button" data-s="${i}" data-k="${k}" ${!max && !useless && G.coins >= cost ? '' : 'disabled'}><b>${f.n} ${'●'.repeat(lv)}${'○'.repeat(FORGE_MAX - lv)}</b><span>${f.d}</span><span>${max ? 'Máximo' : cost + ' monedas'}</span></button>`;
    }).join('');
    return `<div class="fw">${head}<div class="ups">${ups}</div>${elb}</div>`;
  }).join('');
  $('forgeList').querySelectorAll('button[data-k]').forEach(b => b.addEventListener('click', () => forgeBuy(+b.dataset.s, b.dataset.k)));
  $('forgeList').querySelectorAll('button[data-el]').forEach(b => b.addEventListener('click', () => forgeElem(+b.dataset.s, b.dataset.el)));
}
// infusión elemental: armas de 3★ o más; 3 cristales despiertan la habilidad y cada cristal extra la sube de nivel (máx. Nv4)
function elemForgeHTML(w, i) {
  const C = G.crystals, have = EL_ORDER.filter(el => C[el] > 0);
  let body = '';
  if (w.stars < 3) body = `<span class="st">Requiere un arma de 3★ o más.</span>`;
  else if (!w.el) body = have.length
    ? have.map(el => `<button class="small" type="button" data-s="${i}" data-el="${el}" style="border-color:${ELEMS[el].c}"><b style="color:${ELEMS[el].c}">Infundir ${ELEMS[el].n.toLowerCase()}</b><span>1 cristal (tienes ${C[el]}) · el arma queda ligada a este elemento</span></button>`).join('')
    : `<span class="st">Vence a los Elementales de los tótems para conseguir cristales.</span>`;
  else {
    const E = ELEMS[w.el];
    if (w.elC < 3) body = `<button class="small" type="button" data-s="${i}" data-el="${w.el}" ${C[w.el] ? '' : 'disabled'}><b style="color:${E.c}">${E.n} ${'◆'.repeat(w.elC)}${'◇'.repeat(3 - w.elC)}</b><span>Añadir cristal (tienes ${C[w.el]}) · con 3 despierta ${esc(elAbName(w))}</span></button>`;
    else if (w.elLv < 4) body = `<button class="small" type="button" data-s="${i}" data-el="${w.el}" ${C[w.el] ? '' : 'disabled'}><b style="color:${E.c}">${esc(elAbName(w))} Nv${w.elLv} → Nv${w.elLv + 1}</b><span>${esc(elAbDesc(w))} · 1 cristal (tienes ${C[w.el]})</span></button>`;
    else body = `<span class="st" style="color:${E.c}">${esc(elAbName(w))} al nivel máximo.</span>`;
  }
  return `<div class="st" style="margin-top:8px"><b>Elemental</b></div><div class="ups">${body}</div>`;
}
function forgeElem(i, el) {
  const w = G.player.slots[i];
  if (!w || w.stars < 3 || !G.crystals[el] || (w.el && w.el !== el) || w.elLv >= 4) return;
  G.crystals[el]--;
  if (!w.el) w.el = el;
  if (w.elC < 3) { w.elC++; if (w.elC === 3) { w.elLv = 1; showBanner(`${w.name}: ${elAbName(w)}`, ELEMS[el].c, 'Habilidad elemental despertada · tecla R'); ach('awaken'); } }
  else w.elLv++;
  applyW(w);
  sfx(600, .3, 'triangle', .05, 600); later(.1, () => sfx(1200, .3, 'sine', .04));
  renderForge();
}
function forgeBuy(i, k) {
  const w = G.player.slots[i];
  if (!w || w.stars >= 5 || (w.up[k] || 0) >= FORGE_MAX || (k === 'esp' && !w.style) || (k === 'bones' && w.style !== 'grimoire')) return;
  const c = forgeCost(w, k); if (G.coins < c) return;
  G.coins -= c; w.up[k] = (w.up[k] || 0) + 1; applyW(w);
  SAVE.forged++; if (SAVE.forged >= 5) ach('forge');
  sfx(900, .08, 'square', .04, -300); later(.06, () => sfx(1300, .1, 'triangle', .04));
  renderForge();
}
function closeForge() { if (G.choice && G.choice.forge) G.choice = null; $('ovForge').hidden = true; updateAdapt(false); }
$('btnForgeClose').addEventListener('click', closeForge);

