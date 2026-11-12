// ================= Menús =================
import { IDIOMA, IDIOMAS, setIdioma, tr } from './00b-textos.js';
import { $ } from './00-inicio.js';
import { esc } from './01-utilidades.js';
import { WEAPON_DEFS, roomList } from './01a-registro.js';
import { BOSSES, CHARS, CUR_CHAR, D, DIFFS, FLOORS, RARITY, START_COST, UPG, W, WEAPONS, mkW, rollWeapon,
  setCUR_CHAR, starterW, weaponStats } from './03-datos-del-juego.js';
import { SAVE, selChar, setSelChar, writeSave } from './04-guardado.js';
import { AC, setAC } from './05-audio.js';
import { G, newRun, paused, setPaused, setStarted, started } from './07-estado.js';
import { keys, mouse, setWantAbil, setWantDash, setWantElem, touch, wantAbil, wantDash,
  wantElem } from './10-entrada.js';
import { maxBones } from './12-armas-con-estilo-propio.js';
import { gainRelic, hurtPlayer, interact } from './13-armadura.js';
import { hurtEnemy, killEnemy, mkEnemy } from './14-enemigos.js';
import { SUBS } from './15-subjefes.js';
import { SYNERGIES } from './18-sinergias.js';
import { PETS } from './19-companeros.js';
import { NOTES, closeEpilogue, closeNote } from './20-historia.js';
import { ACH, BEAST, ach } from './21-logros-y-bestiario.js';
import { resumeRun } from './22-guardar-partida.js';
import { EL_ORDER } from './23-elementos.js';
import { closeForge, forgeBuy, openForge } from './24-forja.js';
import { SPECS, SUB_UNLOCK, gainTalent, offerTalent, setSpec, subLv } from './26-clases.js';
import { setPact } from './27-pactos-de-piso.js';
import { GAM_SVG, gamBetVal, gamLeave, gamPick, gamPlace, gamStep, gamTick } from './30-sala-de-apuestas.js';
import { DAILY, buildFloor, dailyInfo, setDAILY, startDaily } from './31-reto-diario.js';
import { pickChoice } from './32-eleccion-de-reliquia.js';
import { relicChips, update } from './33-bucle.js';
import { GFX_NAME, QL, QL0, resize, setQL, setSlowT, slowT } from './34-dibujo.js';
import { render } from './38-armadura-visual.js';
import { renderHistory } from './38b-historial.js';
function renderMenu() {
  setCUR_CHAR(selChar);
  $('charCards').innerHTML = Object.entries(CHARS).map(([id, c]) => {
    const own = SAVE.chars[id];
    return tr`<button class="card${selChar === id ? ' sel' : ''}${own ? '' : ' locked'}" type="button" data-c="${id}">
      <b>${esc(c.name)}</b>
      <span class="abil">${esc(c.role)}</span>
      <span class="meta">${c.hp + SAVE.upg.hp} vida · ${c.sh} escudo · ${c.en + SAVE.upg.en * 15} energía · velocidad ${c.speed}</span>
      <span class="meta">Empieza con ${c.start.map(s => W(s).name).join(tr(' y '))}</span>
      <span class="meta">${esc(c.mech)}</span>
      <span class="meta">Subclases: ${Object.values(SPECS).filter(S => S.cls === id).map(S => `${S.n} (${S.d.replace('.', '').toLowerCase()})`).join(', ')}. Se desbloquea tras ${SUB_UNLOCK} bajas y luego crece con cada enemigo que matas.</span>
      <span class="meta">Armas afines (+30 %): ${esc(c.fam)}. Las de otra clase −30 %; bastones neutrales.</span>
      <span class="abil">${esc(c.abil)}: ${esc(c.abilDesc)}</span>
      ${own ? '' : tr`<span class="gems">Desbloquear · ${c.cost} gemas</span>`}
    </button>`;
  }).join('');
  $('charCards').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.c, c = CHARS[id];
    if (!SAVE.chars[id]) {
      if (SAVE.gems < c.cost) { b.querySelector('.gems').textContent = tr`Te faltan ${c.cost - SAVE.gems} gemas`; return; }
      SAVE.gems -= c.cost; SAVE.chars[id] = true; writeSave();
    }
    // las mejoras de clase de otro personaje se devuelven al cambiar
    for (const [k, u] of Object.entries(UPG)) if (u.cls && u.cls !== id && SAVE.upg[k]) { SAVE.gems += u.cost.slice(0, SAVE.upg[k]).reduce((a, b) => a + b, 0); SAVE.upg[k] = 0; }
    writeSave();
    setSelChar(id); renderMenu();
  }));
  // compañeros
  $('petCards').innerHTML = /** @type {[string, any][]} */ ([['', { n: tr('Ninguno'), d: tr('Vas solo.'), c: '#9d95ab', cost: 0 }], ...Object.entries(PETS)]).map(([id, P]) => {
    const own = !id || SAVE.pets[id];
    return `<button class="card${SAVE.pet === id ? ' sel' : ''}${own ? '' : ' locked'}" type="button" data-p="${id}"><b style="color:${P.c}">${esc(P.n)}</b><span class="meta">${esc(P.d)}</span>${own ? (id ? tr('<span class="gems">Listo para la próxima partida</span>') : '') : tr`<span class="gems">Llevar · ${P.cost} gemas</span>`}</button>`;
  }).join('');
  $('petCards').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.p;
    if (id && !SAVE.pets[id]) {
      const refund = SAVE.pet && SAVE.pets[SAVE.pet] ? PETS[SAVE.pet].cost : 0;
      if (SAVE.gems + refund < PETS[id].cost) { b.querySelector('.gems').textContent = tr`Te faltan ${PETS[id].cost - SAVE.gems - refund} gemas`; return; }
      SAVE.gems += refund - PETS[id].cost; SAVE.pets = { [id]: true }; ach('pet');
    }
    if (!id && SAVE.pet && SAVE.pets[SAVE.pet]) { SAVE.gems += PETS[SAVE.pet].cost; SAVE.pets = {}; }
    SAVE.pet = id; writeSave(); renderMenu();
  }));
  // arma inicial
  const found = WEAPONS.filter(w => w.rarity === 'common');
  $('swCount').textContent = tr`· ${found.length} armas grises`;
  $('swList').innerHTML = tr`<button class="small${!SAVE.startW ? ' sel' : ''}" type="button" data-w="">La del personaje · gratis</button>` +
    found.map(w => `<button class="small${SAVE.startW === w.id ? ' sel' : ''}" type="button" data-w="${w.id}" style="color:${RARITY[w.rarity].c}">${esc(w.name)} · ${SAVE.startW === w.id ? tr('comprada') : START_COST[w.rarity] + tr(' gemas')}</button>`).join('');
  $('swList').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.w; if (id === SAVE.startW) return;
    const refund = SAVE.startW ? START_COST[WEAPONS.find(w => w.id === SAVE.startW).rarity] : 0;
    const cost = id ? START_COST[WEAPONS.find(w => w.id === id).rarity] : 0;
    if (SAVE.gems + refund < cost) { b.textContent = tr`Te faltan ${cost - SAVE.gems - refund} gemas`; return; }
    SAVE.gems += refund - cost; SAVE.startW = id; writeSave(); renderMenu();
  }));
  // logros, bestiario, diario, sinergias
  const nAch = Object.keys(ACH).filter(k => SAVE.ach[k]).length;
  $('achCount').textContent = `· ${nAch}/${Object.keys(ACH).length}`;
  $('achList').innerHTML = Object.entries(ACH).map(([k, A]) => `<div class="${SAVE.ach[k] ? '' : 'off'}"><b>${SAVE.ach[k] ? '✓ ' : ''}${esc(A.n)}</b>${esc(A.d)} · +${A.g} ${A.g === 1 ? tr('gema') : tr('gemas')}</div>`).join('');
  const beasts = [...Object.entries(BEAST).map(([k, B]) => [k, B.n, B.d]), ...Object.values(SUBS).map(S => ['sub:' + S.sk, S.name, tr('Subjefe.')]), ...Object.entries(BOSSES).map(([k, B]) => ['boss:' + k, B.name, tr('Jefe de piso.')])];
  $('beastCount').textContent = `· ${beasts.filter(b => SAVE.kills[b[0]]).length}/${beasts.length}`;
  $('beastList').innerHTML = beasts.map(([k, n, d]) => SAVE.kills[k] ? tr`<div><b>${esc(n)}</b>${esc(d)} Derrotados: ${SAVE.kills[k]}</div>` : tr`<div class="off"><b>???</b>Aún no lo has derrotado.</div>`).join('');
  $('noteCount').textContent = `· ${Object.keys(SAVE.notes).length}/${NOTES.length}`;
  $('noteList').innerHTML = NOTES.map((N, i) => SAVE.notes[i] ? `<div><b>${esc(N.t)}</b>${esc(N.b)}</div>` : tr`<div class="off"><b>Página perdida</b>Sigue explorando la cripta.</div>`).join('');
  $('synCount').textContent = `· ${SYNERGIES.filter(S => SAVE.syn[S.id]).length}/${SYNERGIES.length}`;
  $('synList').innerHTML = SYNERGIES.map(S => `<div class="${SAVE.syn[S.id] ? '' : 'off'}"><b style="color:${SAVE.syn[S.id] ? S.c : 'inherit'}">${esc(S.n)}</b>${esc(S.r)}: ${esc(S.d)}</div>`).join('');
  renderHistory();
  renderOpts('menuOpts');
  $('btnContinue').hidden = !SAVE.run;
  if (SAVE.run) $('btnContinue').textContent = tr`Continuar · piso ${SAVE.run.floor} (${CHARS[SAVE.run.char].name})`;
  $('btnStart').textContent = SAVE.run ? tr('Nueva partida') : tr('Entrar a la cripta');
  { const I = dailyInfo(), rec = SAVE.daily && SAVE.daily.date === I.date ? SAVE.daily.best : 0;
    $('btnDaily').textContent = tr`Reto diario · ${CHARS[I.char].name}${rec ? tr` · récord ${rec}` : ''}`;
    $('btnDaily').title = tr('La misma mazmorra para todos hoy, con clase fija, sin mejoras del altar y en dificultad Guardián'); }
  $('diffCards').innerHTML = Object.entries(DIFFS).map(([id, d]) =>
    `<button class="card${SAVE.diff === id ? ' sel' : ''}" type="button" data-d="${id}"><b>${esc(d.name)}</b><span class="meta">${esc(d.desc)}</span></button>`).join('');
  $('diffCards').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { SAVE.diff = b.dataset.d; writeSave(); renderMenu(); }));
  $('upgList').innerHTML = Object.entries(UPG).filter(([, u]) => !u.cls || u.cls === selChar).map(([id, u]) => {
    const lv = SAVE.upg[id] || 0, maxed = lv >= u.max, cost = u.cost[lv];
    return `<div class="upg${u.cls ? ' cls' : ''}"><div class="nm">${u.cls ? `<em>${esc(CHARS[u.cls].name)}</em> ` : ''}${esc(u.name)}<span>${esc(u.desc)}</span></div>
      <div class="dots">${Array.from({ length: u.max }, (_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</div>
      <button class="small" type="button" data-u="${id}" ${maxed || SAVE.gems < cost ? 'disabled' : ''}>${maxed ? tr('Máximo') : (cost === 1 ? tr`Mejorar · ${cost} gema` : tr`Mejorar · ${cost} gemas`)}</button></div>`;
  }).join('');
  $('upgList').insertAdjacentHTML('afterbegin', tr('<p class="hint">Las mejoras, el compañero y el arma inicial que compres valen solo para la próxima partida. Las gemas se guardan siempre. Las mejoras con el nombre de la clase cambian según el personaje que elijas; si cambias de personaje se te devuelven.</p>'));
  $('upgList').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.u, u = UPG[id], lv = SAVE.upg[id] || 0;
    if (lv >= u.max || SAVE.gems < u.cost[lv]) return;
    SAVE.gems -= u.cost[lv]; SAVE.upg[id] = lv + 1; writeSave(); renderMenu();
  }));
  const extra = SAVE.best ? tr` · récord: piso ${SAVE.best}${SAVE.wins ? tr` · ${SAVE.wins} victorias` : ''}` : '';
  $('gemCount').textContent = (SAVE.gems === 1 ? tr('1 gema') : tr`${SAVE.gems} gemas`) + extra;
}
function renderOpts(id) {
  const o = SAVE.opt;
  $(id).innerHTML = tr`<label>Música <input type="range" min="0" max="1" step=".05" value="${o.music}" data-o="music"></label>
    <label>Efectos <input type="range" min="0" max="1" step=".05" value="${o.sfx}" data-o="sfx"></label>
    <label><input type="checkbox" data-o="shake" ${o.shake < 1 ? 'checked' : ''}> Reducir la sacudida de pantalla</label>
    <label><input type="checkbox" data-o="fps" ${o.fps ? 'checked' : ''}> Mostrar fotogramas por segundo (FPS)</label>
    <label>Calidad gráfica <select data-o="gfx">${['auto', '2', '1', '0'].map(k => `<option value="${k}" ${String(o.gfx || 'auto') === k ? 'selected' : ''}>${GFX_NAME[k]}</option>`).join('')}</select></label>`
    // el idioma no se traduce: se ve igual en todos para poder encontrarlo
    + `<label>Idioma · Language <select data-o="idioma">${Object.entries(IDIOMAS).map(([k, n]) => `<option value="${k}" ${k === IDIOMA ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`;
  $(id).querySelectorAll('input, select').forEach(inp => inp.addEventListener('input', () => {
    if (inp.dataset.o === 'idioma') { setIdioma(inp.value); return; }
    if (inp.tagName === 'SELECT') { o.gfx = inp.value; setQL(QL0); setSlowT(0); resize(); }
    else if (inp.dataset.o === 'fps') o.fps = inp.checked; else if (inp.type === 'checkbox') o.shake = inp.checked ? .3 : 1; else o[inp.dataset.o] = +inp.value;
    writeSave();
  }));
}
function setPause(v) {
  if (!started || !G || G.over || G.choice) return;
  setPaused(v); $('ovPause').hidden = !v;
  keys.clear(); mouse.down = mouse.right = false; touch.atk = touch.chg = false;
  if (v) {
    renderOpts('pauseOpts');
    $('pauseSyn').innerHTML = G.syn && G.syn.size ? SYNERGIES.filter(S => G.syn.has(S.id)).map(S => `<span class="hint" style="color:${S.c}">◆ ${esc(S.n)}: ${esc(S.d)}</span>`).join('<br>') : '';
    $('pauseInfo').textContent = tr`Piso ${G.floor} · ${FLOORS[G.fi].name} · ${CHARS[G.player.char].name} · ${D().name}`;
    $('pauseRelics').innerHTML = relicChips(G.player.relics);
    $('btnResume').focus();
  }
}
function togglePause() { setPause(!paused); }
function toMenu() {
  if (G && started && !G.keepRun) SAVE.run = null;
  if (G && started && !G.gemsBanked) { SAVE.gems += Math.round(G.gems * D().gem); SAVE.best = Math.max(SAVE.best, G.floor); writeSave(); }
  $('ovEnd').hidden = true; $('ovEpi').hidden = true; $('ovPause').hidden = true; $('ovChoice').hidden = true; $('ovGamble').hidden = true; $('ovForge').hidden = true; $('ovNote').hidden = true; setPaused(false); setStarted(false);
  $('touch').hidden = true;
  newRun(selChar);
  renderMenu(); $('ovStart').hidden = false; $('ovStart').scrollTop = 0;
}
$('btnStart').addEventListener('click', () => {
  try { setAC(AC || new (window.AudioContext || window.webkitAudioContext)()); AC.resume && AC.resume(); } catch (_) { setAC(null); }
  $('ovStart').hidden = true; setStarted(true); setPaused(false);
  if (touch.on) $('touch').hidden = false;
  setDAILY(null); newRun(selChar);
  SAVE.upg = { hp: 0, coin: 0, en: 0 }; SAVE.pet = ''; SAVE.pets = {}; SAVE.startW = ''; writeSave();
});
$('btnDaily').addEventListener('click', () => {
  try { setAC(AC || new (window.AudioContext || window.webkitAudioContext)()); AC.resume && AC.resume(); } catch (_) { setAC(null); }
  $('ovStart').hidden = true; setStarted(true); setPaused(false);
  if (touch.on) $('touch').hidden = false;
  startDaily();
  SAVE.run = G.snap; writeSave();
});
$('btnResume').addEventListener('click', () => setPause(false));
$('btnMenu').addEventListener('click', toMenu);
$('btnSaveQuit').addEventListener('click', () => { if (!G || !G.snap) return; SAVE.run = G.snap; G.keepRun = true; G.gemsBanked = true; writeSave(); toMenu(); });
$('btnContinue').addEventListener('click', () => {
  if (!SAVE.run) return;
  try { setAC(AC || new (window.AudioContext || window.webkitAudioContext)()); AC.resume && AC.resume(); } catch (_) { setAC(null); }
  $('ovStart').hidden = true; setStarted(true); setPaused(false);
  if (touch.on) $('touch').hidden = false;
  setDAILY(SAVE.run.daily ? dailyInfo(SAVE.run.daily) : null);
  // si la partida guardada no se puede reanudar, se descarta sin tocar las gemas ni el progreso
  try { resumeRun(SAVE.run); } catch (err) { console.warn(tr('Partida guardada incompatible, se descarta'), err); SAVE.run = null; writeSave(); if (G) { G.keepRun = true; G.gemsBanked = true; } toMenu(); }
});
$('btnNoteClose').addEventListener('click', closeNote);
$('btnEpiClose').addEventListener('click', closeEpilogue);
$('gamCards').querySelectorAll('.gcard').forEach(c => { c.querySelector('.gback').innerHTML = GAM_SVG.back; c.addEventListener('click', () => gamPick(+c.dataset.i)); });
$('gamMinus').addEventListener('click', () => gamStep(-10));
$('gamPlus').addEventListener('click', () => gamStep(10));
$('gamBet').addEventListener('change', () => { $('gamBet').value = gamBetVal(); });
$('gamGo').addEventListener('click', gamPlace);
$('gamLeave').addEventListener('click', gamLeave);
$('btnAgain').addEventListener('click', toMenu);

renderMenu();
newRun('knight');

// ayuda para pruebas desde la consola
window.__cripta = {
  state: () => G,
  toBoss() { const r = G.bossRoom; for (const x of G.rooms) { x.cleared = true; x.visited = true; } r.cleared = false; G.player.x = r.cx; G.player.y = r.cy + 150; G.cam.x = G.player.x; G.cam.y = G.player.y; },
  floor(n) { buildFloor(n); },
  relic(id) { gainRelic(id); },
  armor(st) { G.pickups.push({ kind: 'armor', stars: st, x: G.player.x + 30, y: G.player.y }); },
  weapon(id, st = 1) { G.player.slots[G.player.cur] = mkW(id, st); },
  weapons: () => WEAPONS.map(w => w.id),
  weaponInfo: () => WEAPONS.map(w => ({ id: w.id, n: w.name, r: w.rarity, t: w.type, fam: (WEAPON_DEFS[w.id] || {}).familia || null })),
  roll: src => rollWeapon(src),
  spawn(t, x, y) { G.enemies.push(mkEnemy(t, x, y, 1, false)); },
  toEvent(k) { const r = G.rooms.find(r => r.ev === k); if (!r) return false; G.player.x = r.cx; G.player.y = r.cy + 60; G.cam.x = r.cx; G.cam.y = r.cy; return true; },
  kill(e) { killEnemy(e); },
  totemRooms: () => G.rooms.filter(r => r.totemEl).map(r => r.totemEl),
  starter: id => starterW(id),
  totem(el) { const p = G.player; G.pickups.push({ kind: 'totem', el, x: p.x, y: p.y + 40, rise: 1 }); },
  crystals(n) { for (const el of EL_ORDER) G.crystals[el] = n; },
  run(id) { setDAILY(null); setSelChar(id); newRun(id); },
  hit(e, d, a) { hurtEnemy(e, d, a, 0, { src: G.player.slots[G.player.cur], melee: true }); },
  hurt(d) { return hurtPlayer(d); },
  stats: w => weaponStats(w),
  killW(e) { killEnemy(e, G.player.slots[G.player.cur]); },
  maxBones: w => maxBones(w),
  forgeBuy: (i, k) => forgeBuy(i, k),
  openForge: () => openForge(),
  subLv: () => subLv(),
  daily: () => { startDaily(); return dailyInfo(); },
  pact(id) { setPact(id); },
  useIt(it) { interact(G.player, it); },
  gam: () => G.gam,
  gamPick: i => gamPick(i),
  gamPlace: () => gamPlace(),
  use(kind) { const it = G.pickups.find(x => x.kind === kind && !x.gone); if (it) interact(G.player, it); return it || null; },
  toRoomEv(k) { const r = G.rooms.find(r => r.ev === k); if (!r) return null; G.player.x = r.cx; G.player.y = r.cy + 60; G.cam.x = r.cx; G.cam.y = r.cy; return r.ev; },
  talent(id) { gainTalent(id); },
  spec(id) { setSpec(id); },
  offerTalent: () => offerTalent(),
  toSub() { const r = G.rooms.find(r => r.sub); G.player.x = r.cx; G.player.y = r.cy + 120; G.cam.x = G.player.x; G.cam.y = G.player.y; },
  // control para las pruebas automáticas (juego/pruebas/): el bot juega con los mandos táctiles, que apuntan solos
  bot(o) {
    touch.on = true; touch.atk = !!o.atk; touch.chg = !!o.chg;
    if (o.mv) { touch.stickId = 1; touch.ox = touch.oy = 0; touch.x = o.mv[0] * 46; touch.y = o.mv[1] * 46; } else touch.stickId = null;
    if (o.dash) setWantDash(true);
    if (o.abil) setWantAbil(true);
    if (o.elem) setWantElem(true);
  },
  // cierra cualquier elección abierta tomando la primera opción, para que el bot siga jugando
  resolve() {
    const c = G.choice; if (!c) return false;
    if (c.note) closeNote(); else if (c.forge) closeForge(); else if (c.gamble) { gamLeave(); if (G.choice === c) G.choice = null; } else pickChoice(0);
    return true;
  },
  // avanza la simulación sin dibujar (n fotogramas de 1/60 s); render() dibuja uno
  sim(n) { for (let i = 0; i < n; i++) { if (started && !paused && G) update(1 / 60); if (started && G && G.gam) gamTick(1 / 60); } },
  render: () => render(),
  roomIds: () => roomList(),
  flags: () => ({ paused, started }),
};

export { setPause, togglePause };
