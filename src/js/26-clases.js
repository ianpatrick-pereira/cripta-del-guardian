// ================= Clases: mecánicas, talentos y especialización =================
import { tr } from './00b-textos.js';
import { ctx } from './00-inicio.js';
import { TAU, TILE, angDiff, angTo, clamp, dist, rand } from './01-utilidades.js';
import { CHARS, cu } from './03-datos-del-juego.js';
import { SAVE, writeSave } from './04-guardado.js';
import { noise, sfx } from './05-audio.js';
import { G, randomRelics, rc, started } from './07-estado.js';
import { solidAt } from './08-colisiones.js';
import { addText, burst, explode, later, shake, showBanner } from './09-efectos.js';
import { maxEnergy, nearestEnemy, reflect } from './11-jugador.js';
import { hurtEnemy } from './14-enemigos.js';
import { pact } from './27-pactos-de-piso.js';
import { dareCount, dareFail } from './28-desafios-dentro-del-piso.js';
import { openChoice } from './32-eleccion-de-reliquia.js';
function tl(id) { return !!(G && G.player && G.player.talents && G.player.talents.includes(id)); }
// daño de referencia del arma actual (normaliza armas muy rápidas o de varios proyectiles)
function bestDmg(p) { const w = p.slots[p.cur]; return w.dmg * (w.shots || 1) * Math.max(1, .4 / w.cd); }

const TALENTS = {
  vigor:     { cls: 'knight', n: tr('Vigor'),             c: '#d4474b', d: tr('+2 de vida máxima y te cura 2.') },
  muro:      { cls: 'knight', n: tr('Muro de acero'),     c: '#8fb7d9', d: tr('+1 de escudo máximo.') },
  furia:     { cls: 'knight', n: tr('Rencor'),            c: '#d4474b', d: tr('La Represalia hace +100 % en vez de +50 %.') },
  egida:     { cls: 'knight', n: tr('Égida'),             c: '#ffd27a', d: tr('La ventana de desvío dura más y se recarga en 1 s (antes 2,5 s).') },
  contra:    { cls: 'knight', n: tr('Contragolpe'),       c: '#ffd27a', d: tr('El contraataque del desvío es más grande, hace más daño y aturde.') },
  puas:      { cls: 'knight', n: tr('Púas de hierro'),    c: '#7a9a5a', d: tr('Al recibir daño, dañas a los enemigos que tienes al lado.') },
  embestida: { cls: 'knight', n: tr('Embestida'),         c: '#e3a24a', d: tr('La carga con escudo hace el triple de daño y aturde.') },
  aguante:   { cls: 'knight', n: tr('Aguante'),           c: '#8fb7d9', d: tr('Tu escudo empieza a recargarse antes y el doble de rápido.') },
  sed:       { cls: 'knight', n: tr('Sed de batalla'),    c: '#b0303a', d: tr('Cada 12 bajas cuerpo a cuerpo recuperas 1 de vida.') },
  ojo2:      { cls: 'archer', n: tr('Ojo de halcón'),     c: '#ffd27a', d: tr('+15 % de probabilidad de crítico.') },
  rafaga:    { cls: 'archer', n: tr('Ráfaga'),            c: '#ffd27a', d: tr('La concentración se llena un 60 % más rápido.') },
  perfora:   { cls: 'archer', n: tr('Puntas perforantes'), c: '#c9a46a', d: tr('Tus flechas atraviesan 1 enemigo más.') },
  cazador:   { cls: 'archer', n: tr('Cazador'),           c: '#6cc46a', d: tr('+30 % de daño a enemigos lejanos.') },
  hielo:     { cls: 'archer', n: tr('Flecha helada'),     c: '#9bd8ff', d: tr('La flecha dorada ralentiza a todo lo que atraviesa.') },
  rebote2:   { cls: 'archer', n: tr('Rebote'),            c: '#e3a24a', d: tr('Tus flechas rebotan una vez más en las paredes.') },
  carcaj2:   { cls: 'archer', n: tr('Carcaj doble'),      c: '#c9a46a', d: tr('Los arcos disparan 1 flecha más.') },
  voltereta: { cls: 'archer', n: tr('Voltereta de tiro'), c: '#e3a24a', d: tr('Al esquivar disparas un abanico de 5 flechas.') },
  frio:      { cls: 'archer', n: tr('Sangre fría'),       c: '#9bd8ff', d: tr('Recibir daño solo vacía la mitad de la concentración y vas un 10 % más rápido.') },
  verdugo:   { cls: 'rogue',  n: tr('Verdugo'),           c: '#d4474b', d: tr('+60 % de daño a enemigos con menos del 30 % de vida.') },
  toxina:    { cls: 'rogue',  n: tr('Toxina'),            c: '#9be05a', d: tr('Todos tus golpes envenenan.') },
  frenesi:   { cls: 'rogue',  n: tr('Frenesí'),           c: '#bb7cf0', d: tr('El combo llega hasta +100 % y tarda más en perderse.') },
  sombra:    { cls: 'rogue',  n: tr('Paso sombrío'),      c: '#8a84a0', d: tr('La invisibilidad del parpadeo dura 1,2 s.') },
  sangre:    { cls: 'rogue',  n: tr('Sed de sangre'),     c: '#b0303a', d: tr('Cada 8 golpes por la espalda recuperas 1 de vida.') },
  filo:      { cls: 'rogue',  n: tr('Puñalada'),          c: '#bb7cf0', d: tr('Los golpes por la espalda hacen ×3 en vez de ×2.') },
  humo:      { cls: 'rogue',  n: tr('Bomba de humo'),     c: '#8a84a0', d: tr('Al matar, el humo ralentiza a los enemigos cercanos.') },
  punales:   { cls: 'rogue',  n: tr('Puñales'),           c: '#d8e0ff', d: tr('Al esquivar lanzas 6 puñales a tu alrededor.') },
  acecho:    { cls: 'rogue',  n: tr('Acecho'),            c: '#ffd27a', d: tr('El primer golpe a un enemigo intacto hace ×2,5.') },
};
// subclases: se eligen al entrar a la cripta y suben de nivel (Nv1 a Nv5) con cada enemigo que matas
const SPECS = {
  paladin:   { cls: 'knight', n: tr('Paladín'),       c: '#ffe27a', d: tr('Protección y curación.'), abil: tr('Juicio'), cd: 15,
               abilDesc: tr('Te cura, te vuelve invulnerable 1,5 s y un anillo sagrado daña y empuja a todo lo cercano.'),
               grow: tr('el anillo es más grande y cura más; +1 escudo máximo en Nv2 y Nv4; te curas 1 cada pocas bajas.') },
  berserker: { cls: 'knight', n: tr('Berserker'),     c: '#d4474b', d: tr('Fuerza bruta.'), abil: tr('Furia'), cd: 16,
               abilDesc: tr('Unos segundos con más daño, +20 % de velocidad y ataques un 30 % más rápidos.'),
               grow: tr('+5 % de daño por nivel; la Furia dura más y pega más; desde Nv3 cada baja en Furia te cura.') },
  guardian:  { cls: 'knight', n: tr('Guardián'),      c: '#8fb7d9', d: tr('Defensa y contraataque.'), abil: tr('Baluarte'), cd: 14,
               abilDesc: tr('Invulnerable unos segundos; las balas que te tocan rebotan.'),
               grow: tr('el Desvío se recarga antes y su contraataque pega más; el Baluarte dura más.') },
  sniper:    { cls: 'archer', n: tr('Francotirador'), c: '#ffd27a', d: tr('Precisión a distancia.'), abil: tr('Disparo mortal'), cd: 10,
               abilDesc: tr('Un rayo que cruza la sala y daña a todo lo que toca.'),
               grow: tr('+6 % de daño a enemigos lejanos por nivel; el Disparo mortal pasa de ×7 a ×11.') },
  trapper:   { cls: 'archer', n: tr('Trampero'),      c: '#c9a46a', d: tr('Control del terreno.'), abil: tr('Trampas'), cd: 9,
               abilDesc: tr('Coloca trampas que explotan y ralentizan al pisarlas.'),
               grow: tr('más trampas y más daño; al matar puede quedar una trampa en el suelo.') },
  ranger:    { cls: 'archer', n: tr('Explorador'),    c: '#6cc46a', d: tr('Cadencia y movimiento.'), abil: tr('Lluvia de flechas'), cd: 10,
               abilDesc: tr('Oleadas de flechas en todas direcciones.'),
               grow: tr('+4 % de cadencia y +10 % de Concentración por nivel; una oleada más por nivel.') },
  shade:     { cls: 'rogue',  n: tr('Danzante'),      c: '#bb7cf0', d: tr('Velocidad.'), abil: tr('Danza de sombras'), cd: 12,
               abilDesc: tr('Saltas a la espalda de varios enemigos cercanos y los apuñalas.'),
               grow: tr('+4 % de velocidad y esquiva −6 % por nivel; la Danza alcanza a un enemigo más por nivel.') },
  poisoner:  { cls: 'rogue',  n: tr('Envenenador'),   c: '#9be05a', d: tr('Veneno.'), abil: tr('Nube tóxica'), cd: 11,
               abilDesc: tr('Lanza una nube venenosa que daña y ralentiza.'),
               grow: tr('todos tus golpes envenenan y el veneno pega más por nivel; la nube es más grande y dura más.') },
  ghost:     { cls: 'rogue',  n: tr('Espectro'),      c: '#8a84a0', d: tr('Invisibilidad.'), abil: tr('Sombra'), cd: 12,
               abilDesc: tr('Invisible, más rápido y todo golpe es crítico.'),
               grow: tr('el parpadeo te oculta más tiempo; golpear invisible hace más daño por nivel; la Sombra dura más.') },
};
const SUB_UNLOCK = 30;            // bajas para poder elegir subclase
const SUB_T = [15, 40, 80, 140];   // bajas para Nv2, Nv3, Nv4 y Nv5
function subLv(p = G.player) { return p.spec ? 1 + SUB_T.filter(t => (p.subK || 0) >= t).length : 0; }
const subIs = id => G && G.player && G.player.spec === id;
const CLS = () => G.cls || (G.cls = { traps: [], clouds: [], fx: [] });

function offerTalent() {
  if (!G || G.over) return;
  if (G.choice) { later(1, offerTalent); return; }
  const p = G.player;
  const pool = Object.keys(TALENTS).filter(k => TALENTS[k].cls === p.char && !p.talents.includes(k)).sort(() => Math.random() - .5);
  if (!pool.length) { openChoice(tr('Subjefe derrotado'), tr('Elige una reliquia'), randomRelics(3), () => {}); return; }
  openChoice(tr`Talento de ${CHARS[p.char].name}`, tr('Elige un talento'), pool.slice(0, 3), () => {}, 'talent');
}
function gainTalent(id) {
  const p = G.player, T = TALENTS[id];
  if (!T || p.talents.includes(id)) return;
  p.talents.push(id);
  if (id === 'vigor') { p.maxHp += 2; p.hp = Math.min(p.maxHp, p.hp + 2); }
  if (id === 'muro') { p.maxSh++; p.sh++; }
  showBanner(T.n, T.c, tr('Talento'));
  burst(p.x, p.y, T.c, 20, 180);
  sfx(440, .15, 'triangle', .05, 300); later(.12, () => sfx(660, .2, 'triangle', .05, 300));
}
function offerSpec() {
  if (!G || G.over || G.player.spec) return;
  if (G.choice) { later(1, offerSpec); return; }
  const ids = Object.keys(SPECS).filter(k => SPECS[k].cls === G.player.char);
  openChoice(tr('Subclase · la barra azul crece con cada enemigo que mates'), tr`${CHARS[G.player.char].name}: elige tu camino`, ids, () => {}, 'spec');
}
function setSpec(id) {
  const p = G.player, S = SPECS[id];
  if (!S) return;
  p.spec = id; p.abilCd = 0;
  if (G.snap) G.snap.spec = id;
  if (started && SAVE.run) { SAVE.run.spec = id; writeSave(); }
  showBanner(S.n, S.c, tr`Nueva habilidad F: ${S.abil}`);
  burst(p.x, p.y, S.c, 30, 220);
  sfx(330, .3, 'triangle', .06, 400);
}

function specAbility(p) {
  const sp = p.spec, w = p.slots[p.cur], base = bestDmg(p), C = CLS(), L = subLv(p);
  if (sp === 'paladin') {
    const R = 130 + 15 * L, heal = 1 + Math.floor(L / 2);
    p.hp = Math.min(p.maxHp, p.hp + heal); p.inv = Math.max(p.inv, 1.5);
    addText(p.x, p.y - 30, tr`+${heal} vida`, '#6cc46a', 13);
    for (const e of G.enemies) if (!e.dead && !e.air && dist(e, p) < R + e.r) hurtEnemy(e, Math.round(base * (2.5 + .5 * L)), angTo(p, e), 420, { cls: true, explosion: true });
    G.proj = G.proj.filter(pr => pr.owner === 'player' || dist(pr, p) > R);
    C.fx.push({ ring: true, x: p.x, y: p.y, r: R, t: .45, max: .45, c: '#ffe27a' });
    shake(8); sfx(600, .5, 'triangle', .06, 500);
  } else if (sp === 'berserker') {
    p.rageT = 4 + L; p.rageMul = 1.4 + .08 * L; addText(p.x, p.y - 30, tr('¡Furia!'), '#d4474b', 15); shake(6);
    burst(p.x, p.y, '#d4474b', 24, 200); sfx(90, .5, 'sawtooth', .06, 60);
  } else if (sp === 'guardian') {
    const t = 2 + .5 * L;
    p.bulwarkT = t; p.inv = Math.max(p.inv, t); sfx(300, .4, 'triangle', .06, 300); burst(p.x, p.y, '#8fb7d9', 18, 160);
  } else if (sp === 'sniper') {
    const a = p.aim, dx = Math.cos(a), dy = Math.sin(a);
    let len = 0;
    while (len < 1000 && !solidAt(Math.floor((p.x + dx * len) / TILE), Math.floor((p.y + dy * len) / TILE))) len += 10;
    for (const e of G.enemies) {
      if (e.dead || e.air) continue;
      const t = clamp((e.x - p.x) * dx + (e.y - p.y) * dy, 0, len), px = p.x + dx * t, py = p.y + dy * t;
      if (Math.hypot(e.x - px, e.y - py) < e.r + 12) hurtEnemy(e, Math.round(base * (6 + L)), a, 300, { cls: true, src: w });
    }
    C.fx.push({ x: p.x, y: p.y, x2: p.x + dx * len, y2: p.y + dy * len, t: .4, max: .4, c: '#ffd27a', wd: 12 });
    shake(9); sfx(1400, .3, 'sawtooth', .06, -1200);
  } else if (sp === 'trapper') {
    const n = 2 + Math.ceil(L / 2);
    for (let i = 0; i < n; i++) {
      const a = p.aim + (i - (n - 1) / 2) * .6, d = 46;
      C.traps.push({ x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, t: 25, arm: .5, dmg: Math.max(3, Math.round(base * (2.5 + .25 * L))) });
    }
    while (C.traps.length > 4 + L) C.traps.shift();
    sfx(300, .12, 'square', .04, -100);
  } else if (sp === 'ranger') {
    for (let wv = 0; wv < 2 + L; wv++) later(wv * .2, () => {
      for (let i = 0; i < 20; i++) {
        const a = i * TAU / 20 + wv * .15;
        G.proj.push({ x: p.x, y: p.y, vx: Math.cos(a) * 560, vy: Math.sin(a) * 560, r: 4, dmg: Math.max(3, Math.round(bestDmg(p) * .6)), owner: 'player', kind: 'arrow', pierce: 1, hit: new Set(), life: 1.1, color: '#6cc46a', bounce: rc('rebote') });
      }
      sfx(700, .08, 'triangle', .04, -300);
    });
  } else if (sp === 'shade') {
    const tg = G.enemies.filter(e => !e.dead && !e.air && dist(e, p) < 340).sort((a, b) => dist(a, p) - dist(b, p)).slice(0, 2 + L);
    if (!tg.length) { p.abilCd = 1; addText(p.x, p.y - 26, tr('No hay nadie cerca'), '#9d95ab', 12); return; }
    p.inv = Math.max(p.inv, tg.length * .14 + .3); p.veilT = Math.max(p.veilT, tg.length * .14 + .4);
    tg.forEach((e, i) => later(i * .14, () => {
      if (e.dead || G.over) return;
      const f = e.face2 ?? angTo(p, e), bx = e.x - Math.cos(f) * (e.r + 14), by = e.y - Math.sin(f) * (e.r + 14);
      burst(p.x, p.y, '#3a3348', 8, 120, 4);
      if (!solidAt(Math.floor(bx / TILE), Math.floor(by / TILE))) { p.x = bx; p.y = by; }
      p.aim = angTo(p, e);
      hurtEnemy(e, Math.round(base * 3), angTo(p, e), 200, { cls: true, src: w, back: true, melee: true });
      sfx(700, .06, 'sawtooth', .04, -500);
    }));
  } else if (sp === 'poisoner') {
    const t = nearestEnemy(p, 320), x = t ? t.x : p.x + Math.cos(p.aim) * 160, y = t ? t.y : p.y + Math.sin(p.aim) * 160;
    C.clouds.push({ x, y, r: 80 + 8 * L, t: 4 + L, max: 4 + L, tick: 0, dmg: Math.max(1, Math.round(base * (.4 + .05 * L))) });
    sfx(160, .5, 'sine', .05, -60); noise(.4, .04, 600);
  } else if (sp === 'ghost') {
    p.shadowT = 2 + .5 * L; sfx(200, .5, 'sine', .05, -120); burst(p.x, p.y, '#3a3348', 20, 140, 5);
  }
}
// cada baja hace crecer la subclase
function subKill(p, e) {
  if (!p.spec) {
    p.preK = (p.preK || 0) + 1;
    if (p.preK === SUB_UNLOCK) { showBanner(tr('Subclase desbloqueada'), '#4a7dff', tr('Elige tu camino')); later(1, offerSpec); }
    return;
  }
  const before = subLv(p); p.subK = (p.subK || 0) + 1;
  const L = subLv(p), S = SPECS[p.spec];
  if (L > before) {
    // v0.59: cada nivel también sube tus estadísticas: +1 de vida máxima y +8 % de daño (ver dmgMul)
    p.maxHp += 1; p.hp = Math.min(p.maxHp, p.hp + 1);
    showBanner(tr`${S.n} Nv${L}`, S.c, tr`+1 vida máxima · +8 % de daño · ${S.abil} más fuerte`);
    burst(p.x, p.y, S.c, 26, 200); sfx(520, .2, 'triangle', .05, 400);
    if (p.spec === 'paladin' && (L === 2 || L === 4)) { p.maxSh++; p.sh++; }
  }
  if (p.spec === 'paladin' && L >= 2 && p.subK % (16 - 2 * L) === 0 && p.hp < p.maxHp) { p.hp++; addText(p.x, p.y - 22, '+1', '#ffe27a'); }
  if (p.spec === 'berserker' && L >= 3 && p.rageT > 0 && p.hp < p.maxHp) { p.hp++; addText(p.x, p.y - 22, '+1', '#d4474b'); }
  if (p.spec === 'trapper' && Math.random() < .05 * L) { CLS().traps.push({ x: e.x, y: e.y, t: 20, arm: .6, dmg: Math.max(3, Math.round(bestDmg(p) * 2.5)) }); }
}
// esquiva propia de cada clase
function classDash(p) {
  if (G.dare && G.dare.kind === 'nodash') dareFail(tr('esquivaste'));
  if (p.char === 'archer' && tl('voltereta')) for (let i = 0; i < 5; i++) {
    const a = p.aim + (i - 2) * .2;
    G.proj.push({ x: p.x, y: p.y, vx: Math.cos(a) * 560, vy: Math.sin(a) * 560, r: 4, dmg: Math.max(1, Math.round(bestDmg(p) * .5)), owner: 'player', kind: 'arrow', pierce: 0, hit: new Set(), life: .7, color: '#e3a24a' });
  }
  if (p.char === 'rogue') {
    p.veilT = Math.max(p.veilT, (tl('sombra') ? 1.2 : .45) + .1 * cu('r_veil') + (subIs('ghost') ? .15 * subLv(p) : 0));
    burst(p.x, p.y, '#3a3348', 12, 130, 4);
    if (tl('punales')) for (let i = 0; i < 6; i++) {
      const a = i * TAU / 6;
      G.proj.push({ x: p.x, y: p.y, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, r: 4, dmg: Math.max(1, Math.round(bestDmg(p) * .6)), owner: 'player', kind: 'arrow', pierce: 1, hit: new Set(), life: .45, color: '#d8e0ff' });
    }
  }
}
// el Caballero embiste con el escudo al esquivar
function shieldCharge(p) {
  const strong = tl('embestida'), dmg = Math.max(2, Math.round(bestDmg(p) * (strong ? 2.4 : .8) * (1 + .2 * cu('k_bash'))));
  for (const e of G.enemies) {
    if (e.dead || e.air || p.dashHit.has(e) || dist(e, p) > e.r + p.r + 10) continue;
    p.dashHit.add(e);
    hurtEnemy(e, dmg, Math.atan2(p.dvy, p.dvx), 420, { cls: true, melee: true });
    if (strong && !e.isBoss) e.slowT = Math.max(e.slowT || 0, 1.2);
    shake(3); sfx(140, .08, 'square', .04, -40);
  }
}
// Concentración del Tirador
function focusShot(p, w) {
  if (p.focus >= 100) {
    p.focus = 0;
    const a = p.aim, dmg = Math.max(3, Math.round(bestDmg(p) * (3 + .4 * cu('a_gold')) * (1 + .5 * rc('punta'))));
    G.proj.push({ x: p.x + Math.cos(a) * 14, y: p.y + Math.sin(a) * 14, vx: Math.cos(a) * 900, vy: Math.sin(a) * 900, r: 6, dmg, owner: 'player', kind: 'power', pierce: 99, hit: new Set(), life: 1.2, color: '#ffd27a', src: w, fx: tl('hielo') ? 'slow' : undefined, focus: true });
    addText(p.x, p.y - 30, tr('Disparo concentrado'), '#ffd27a', 12);
    burst(p.x, p.y, '#ffd27a', 10, 160); sfx(1000, .12, 'triangle', .05, -400);
  } else p.focus = Math.min(100, p.focus + 12 * clamp(w.cd / .4, .5, 2.5) * (tl('rafaga') ? 1.6 : 1) * (1 + .1 * cu('a_focus') + (subIs('ranger') ? .1 * subLv(p) : 0)) * (1 + .35 * rc('pluma')));
}
// Desvío del Caballero: el golpe se anula y contraataca
function parry(p) {
  const big = tl('contra'), R = big ? 130 : 80, dmg = Math.max(2, Math.round(bestDmg(p) * (big ? 2.5 : 1.5) * (subIs('guardian') ? 1 + .15 * subLv(p) : 1)));
  dareCount('parry');
  p.parryCd = Math.max(.5, (tl('egida') ? 1 : 2.5) - .3 * cu('k_parry') - (subIs('guardian') ? .2 * subLv(p) : 0)) * (rc('broquel') ? .6 : 1); p.parryT = 0; p.inv = .35;
  for (const e of G.enemies) if (!e.dead && !e.air && dist(e, p) < R + e.r) { hurtEnemy(e, dmg, angTo(p, e), 380, { cls: true, melee: true }); if (big && !e.isBoss) e.slowT = Math.max(e.slowT || 0, 1.2); }
  for (const pr of G.proj) if (pr.owner === 'enemy' && dist(pr, p) < R) reflect(pr, angTo(p, pr), dmg);
  CLS().fx.push({ ring: true, x: p.x, y: p.y, r: R, t: .3, max: .3, c: '#ffd27a' });
  addText(p.x, p.y - 30, tr('¡Desvío!'), '#ffd27a', 14); shake(5); sfx(1400, .08, 'square', .04, -600);
}
function classHurt(p) {
  if (p.char === 'knight') {
    p.revenge = 1;
    if (tl('puas')) for (const e of G.enemies) if (!e.dead && !e.air && dist(e, p) < 80 + e.r) hurtEnemy(e, Math.max(2, Math.round(bestDmg(p) * 1.2)), angTo(p, e), 300, { cls: true });
  } else if (p.char === 'archer') p.focus = tl('frio') ? p.focus / 2 : 0;
  else if (p.char === 'rogue') p.combo = 0;
}
// cuánto suma cada golpe seguido del Asesino (+5 %, +2 % por Brazalete del duelista)
const comboStep = p => .05 + .02 * rc('brazalete');
// bonos de clase sobre cada golpe del jugador
function classHit(e, dmg, ang, o) {
  if (!o.src && !o.cls) return dmg;
  const p = G.player;
  let k = 1;
  if (p.revenge && o.melee) { k *= (tl('furia') ? 2 : 1.5) + .1 * cu('k_bash') + .5 * rc('guantelete'); if (!p.revUsed) addText(e.x, e.y - e.r - 20, tr('Represalia'), '#d4474b', 11); p.revUsed = true; }
  if (p.rageT > 0) k *= p.rageMul || 1.6;
  const SL = subLv(p);
  if (subIs('berserker')) k *= 1 + .05 * SL;
  if (subIs('sniper') && !o.melee && dist(p, e) > 200) k *= 1 + .06 * SL;
  if (subIs('ghost') && (p.veilT > 0 || p.shadowT > 0)) k *= 1.3 + .1 * SL;
  if (subIs('poisoner')) { e.poison = 3; e.pdmg = Math.max(e.pdmg || 1, Math.round(bestDmg(p) * (.15 + .05 * SL))); }
  if (p.char === 'archer' && tl('cazador') && !o.melee && dist(p, e) > 200) k *= 1.3;
  if (p.char === 'archer' && rc('mira') && !o.melee && dist(p, e) > 200) k *= 1 + .25 * rc('mira');
  const bw = o.src && o.src.back ? o.src.back : 0, fc = e.type === 'warden' ? e.face : e.face2;
  const behind = o.back || (fc !== undefined && Math.abs(angDiff(ang, fc)) < 1.15);
  if (p.char !== 'rogue' && bw && behind) k *= 1 + bw * .5;
  if (p.char === 'rogue') {
    if (behind) {
      const m = (tl('filo') ? 3 : 2) + bw + .2 * cu('r_back') + .5 * rc('punal');
      k *= e.isBoss || e.isSub ? 1 + (m - 1) / 2 : m;
      addText(e.x, e.y - e.r - 20, tr('Espalda'), '#bb7cf0', 10); dareCount('back');
      if (tl('sangre') && ++p.backN % 8 === 0 && p.hp < p.maxHp) { p.hp++; addText(p.x, p.y - 22, '+1', '#d4474b'); }
    }
    if (tl('acecho') && e.hp >= e.max) k *= 2.5;
    if (tl('verdugo') && e.hp < e.max * .3) k *= 1.6;
    k *= 1 + comboStep(p) * p.combo;
    p.combo = Math.min(tl('frenesi') ? 20 : 10, p.combo + 1); p.comboT = (tl('frenesi') ? 1.8 : 1.2) * (1 + .5 * rc('brazalete'));
  }
  return Math.max(1, Math.round(dmg * k));
}
function classKill(e, src) {
  const p = G.player;
  subKill(p, e);
  if (p.char === 'archer' && dist(p, e) > 200) dareCount('far');
  if (src && src.veil) { p.veilT = Math.max(p.veilT, src.veil); burst(p.x, p.y, '#3a3348', 6, 90, 4); }
  if (p.char === 'rogue') {
    p.dashCd = 0;
    if (tl('humo')) { burst(e.x, e.y, '#6b6480', 14, 120, 6, .8); for (const o of G.enemies) if (!o.dead && o !== e && dist(o, e) < 90) o.slowT = Math.max(o.slowT || 0, 1.5); }
  }
  if (p.char === 'knight' && tl('sed') && src && src.type === 'melee' && ++p.meleeKills % 12 === 0 && p.hp < p.maxHp) { p.hp++; addText(p.x, p.y - 22, tr('+1 vida'), '#b0303a'); }
}
// recurso de clase que se muestra bajo la habilidad
function classRes(p) {
  if (p.char === 'knight') return p.revenge ? { t: tr('Represalia lista'), c: '#d4474b' } : p.parryCd > 0 ? { t: tr`Desvío ${Math.ceil(p.parryCd)} s`, c: '#6b6480' } : { t: tr('Desvío listo'), c: '#ffd27a' };
  if (p.char === 'archer') return { k: p.focus / 100, c: p.focus >= 100 ? '#ffd27a' : '#c9a46a' };
  if (p.char === 'rogue' && p.combo) return { t: tr`Combo +${Math.round(p.combo * comboStep(p) * 100)} %`, c: '#bb7cf0' };
  return null;
}

function updateClass(dt) {
  const C = CLS(), pl = G.player;
  if (pact('glass')) pl.sh = 0;
  if (pact('frenzy')) pl.en = Math.min(maxEnergy(pl), pl.en + 3 * dt);
  for (const T of C.traps) {
    T.t -= dt; T.arm -= dt;
    if (T.arm > 0) continue;
    if (G.enemies.some(e => !e.dead && !e.air && dist(e, T) < e.r + 16)) {
      T.t = 0; explode(T.x, T.y, 75, T.dmg, true);
      for (const e of G.enemies) if (!e.dead && dist(e, T) < 95) e.slowT = Math.max(e.slowT || 0, 2);
    }
  }
  C.traps = C.traps.filter(T => T.t > 0);
  for (const K of C.clouds) {
    K.t -= dt; K.tick -= dt;
    if (Math.random() < dt * 20) G.parts.push({ x: K.x + rand(-K.r, K.r) * .8, y: K.y + rand(-K.r, K.r) * .8, vx: 0, vy: -20, life: .7, max: .7, color: 'rgba(155,224,90,.5)', size: 6 });
    if (K.tick > 0) continue;
    K.tick = .5;
    for (const e of G.enemies) if (!e.dead && !e.air && dist(e, K) < K.r + e.r) { e.poison = Math.max(e.poison || 0, 2); e.slowT = Math.max(e.slowT || 0, .6); hurtEnemy(e, K.dmg, angTo(K, e), 0, { explosion: true }); }
  }
  C.clouds = C.clouds.filter(K => K.t > 0);
  for (const F of C.fx) F.t -= dt;
  C.fx = C.fx.filter(F => F.t > 0);
}
function drawClass() {
  const C = CLS();
  for (const K of C.clouds) {
    ctx.fillStyle = `rgba(110,170,60,${.22 * Math.min(1, K.t)})`; ctx.beginPath(); ctx.arc(K.x, K.y, K.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = `rgba(155,224,90,${.4 * Math.min(1, K.t)})`; ctx.lineWidth = 2; ctx.stroke();
  }
  for (const T of C.traps) {
    const on = T.arm <= 0;
    ctx.fillStyle = on ? '#8a6a3a' : '#5a4a3a'; ctx.beginPath(); ctx.arc(T.x, T.y, 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = on ? `rgba(255,210,122,${.5 + .4 * Math.sin(G.time * 8)})` : '#3a3348'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6; ctx.beginPath(); ctx.moveTo(T.x + Math.cos(a) * 6, T.y + Math.sin(a) * 6); ctx.lineTo(T.x + Math.cos(a) * 13, T.y + Math.sin(a) * 13); ctx.stroke(); }
  }
  for (const F of C.fx) {
    const k = F.t / F.max;
    ctx.globalAlpha = k; ctx.strokeStyle = F.c;
    if (F.ring) { ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(F.x, F.y, F.r * (1.1 - .5 * k), 0, TAU); ctx.stroke(); }
    else {
      ctx.lineWidth = F.wd * k; ctx.beginPath(); ctx.moveTo(F.x, F.y); ctx.lineTo(F.x2, F.y2); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3 * k; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

export { SPECS, SUB_T, SUB_UNLOCK, TALENTS, bestDmg, classDash, classHit, classHurt, classKill, classRes,
  drawClass, focusShot, gainTalent, offerSpec, offerTalent, parry, setSpec, shieldCharge, specAbility, subIs,
  subLv, tl, updateClass };
