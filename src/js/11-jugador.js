// ================= Jugador =================
import { tr } from './00b-textos.js';
import { $ } from './00-inicio.js';
import { TAU, angDiff, angTo, dist, rand } from './01-utilidades.js';
import { ROOM_OBJ } from './01a-registro.js';
import { CHARS, RARITY, chgName, circ, cu } from './03-datos-del-juego.js';
import { noise, sfx } from './05-audio.js';
import { G, rc } from './07-estado.js';
import { moveEnt, pushOutProps } from './08-colisiones.js';
import { addText, breakCracks, burst, damageProp, explode, later, shake } from './09-efectos.js';
import { cssSize, keys, mouse, setWantAbil, setWantDash, setWantElem, setWantSwap, setWantUse, touch,
  wantAbil, wantDash, wantElem, wantSwap, wantUse } from './10-entrada.js';
import { styleAttack, styleCharge } from './12-armas-con-estilo-propio.js';
import { armorSh, interact } from './13-armadura.js';
import { hurtEnemy } from './14-enemigos.js';
import { syn } from './18-sinergias.js';
import { elemAbility } from './23-elementos.js';
import { SPECS, bestDmg, classDash, focusShot, shieldCharge, specAbility, subIs, subLv,
  tl } from './26-clases.js';
import { pact } from './27-pactos-de-piso.js';
import { endGame } from './33-bucle.js';
import { zoom } from './34-dibujo.js';
function nearestEnemy(p, maxD) {
  let best = null, bd = maxD;
  for (const e of G.enemies) { if (e.air) continue; const d = dist(p, e); if (d < bd) { bd = d; best = e; } }
  return best;
}
function nearestInteract(p) {
  let best = null, bd = 48;
  for (const it of G.pickups) {
    const sala = ROOM_OBJ[it.kind];
    const ok = it.kind === 'weapon' || it.kind === 'armor' || it.kind === 'shop' || it.kind === 'forge' || it.kind === 'note' || it.kind === 'exit' || it.kind === 'totem' ||
      it.kind === 'relic' || it.kind === 'portal' || (sala && sala.usable(it)) ||
      (it.kind === 'chest' && !it.opened) || (it.kind === 'altar' && !it.used);
    if (!ok) continue;
    const d = dist(p, it); if (d < bd) { bd = d; best = it; }
  }
  return best;
}
const dmgMul = () => (1 + .2 * rc('piedra')) * (pact('fragile') ? 1.4 : 1) * (G.player && G.player.earthT > 0 ? 1 + (G.player.earthK || .35) : 1);
const critChance = () => G.player.shadowT > 0 ? 1 : (.1 + .15 * rc('ojo') + (tl('ojo2') ? .15 : 0)) * (pact('glass') ? 2 : 1);
const maxEnergy = p => p.maxEn + 40 * rc('bateria');

function updatePlayer(dt) {
  const p = G.player, ch = CHARS[p.char];
  let mx = 0, my = 0;
  if (keys.has('w') || keys.has('arrowup')) my -= 1;
  if (keys.has('s') || keys.has('arrowdown')) my += 1;
  if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
  if (keys.has('d') || keys.has('arrowright')) mx += 1;
  if (touch.stickId !== null) {
    const dx = touch.x - touch.ox, dy = touch.y - touch.oy, l = Math.hypot(dx, dy);
    if (l > 6) { const k = Math.min(1, l / 46); mx = dx / l * k; my = dy / l * k; }
  }
  const ml = Math.hypot(mx, my);
  if (ml > 1) { mx /= ml; my /= ml; }
  if (ml > .1) { p.mvx = mx; p.mvy = my; }

  if (touch.on) { const t = nearestEnemy(p, 460); p.aim = t ? angTo(p, t) : Math.atan2(p.mvy, p.mvx); }
  else if (mouse.moved) {
    const { w, h } = cssSize();
    const wx = (mouse.x - w / 2) / zoom + G.cam.x, wy = (mouse.y - h / 2) / zoom + G.cam.y;
    p.aim = Math.atan2(wy - p.y, wx - p.x);
  }
  p.flip = Math.cos(p.aim) < 0;

  p.dashCd -= dt;
  if (wantDash && p.dashCd <= 0 && p.dashT <= 0) {
    const a = ml > .1 ? Math.atan2(my, mx) : p.aim;
    const roll = p.char === 'archer', blink = p.char === 'rogue';
    p.dvx = Math.cos(a); p.dvy = Math.sin(a); p.dashT = roll ? .26 : blink ? .1 : .17; p.dashCd = .85 * (rc('reloj') ? .6 : 1) * (1 - (p.slots[p.cur].dodge || 0)) * (subIs('shade') ? 1 - .06 * subLv(p) : 1); p.inv = Math.max(p.inv, roll ? .32 : .22);
    p.dashHit = new Set(); p.blink = blink;
    sfx(blink ? 520 : 220, .12, blink ? 'sine' : 'sawtooth', .03, blink ? -300 : 300);
    classDash(p);
    if (rc('polvora')) { const bx = p.x, by = p.y; G.parts.push({ x: bx, y: by, vx: 0, vy: 0, life: .8, max: .8, color: '#2a2433', size: 10 }); later(.8, () => explode(bx, by, 70, 8, true)); }
  }
  setWantDash(false);
  const speedMul = (1 + .15 * rc('botas') + (tl('frio') ? .1 : 0) + (p.slots[p.cur].spd || 0) + .03 * cu('r_veil') + (subIs('shade') ? .04 * subLv(p) : 0)) * (p.shadowT > 0 ? 1.25 : 1) * (p.rageT > 0 ? 1.2 : 1) * (pact('frenzy') ? 1.2 : 1) * (p.slow > 0 ? .55 : 1) * (p.charge > 0 ? .55 : 1) * (p.windT > 0 ? 1.35 : 1);
  if (p.dashT > 0) {
    p.dashT -= dt;
    const dsp = p.lunge ? 720 : p.blink ? 1150 : 560;
    moveEnt(p, p.dvx * dsp * dt, p.dvy * dsp * dt);
    if (!p.lunge && p.char === 'knight') shieldCharge(p);
    if (p.lunge) {
      for (const e of G.enemies) if (!e.dead && !e.air && !p.lunge.hit.has(e) && dist(e, p) < e.r + p.r + 16) { p.lunge.hit.add(e); hurtEnemy(e, p.lunge.dmg, Math.atan2(p.dvy, p.dvx), 360, { src: p.lunge.w, melee: true, fx: p.lunge.w.fx }); }
      for (const o of G.props) if (!o.dead && o.kind !== 'merchant' && dist(o, p) < o.r + p.r + 16) damageProp(o, p.lunge.dmg);
      if (p.dashT <= 0) {
        breakCracks(p.x, p.y, 40);
        const L = p.lunge;
        if (L.knives) for (let i = 0; i < L.knives; i++) { const an = p.aim + (i - (L.knives - 1) / 2) * .18; G.proj.push({ x: p.x, y: p.y, vx: Math.cos(an) * 520, vy: Math.sin(an) * 520, r: 4, dmg: Math.max(1, Math.round(L.dmg * .45)), owner: 'player', kind: 'arrow', pierce: 1, hit: new Set(), life: .5, color: '#d8e0ff', src: L.w }); }
        if (--L.reps > 0) { p.dvx = Math.cos(p.aim); p.dvy = Math.sin(p.aim); p.dashT = L.len; p.inv = Math.max(p.inv, .3); L.hit = new Set(); sfx(300, .15, 'sawtooth', .04, 400); }
        else p.lunge = null;
      }
    }
    G.parts.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: .22, max: .22, color: 'rgba(227,162,74,.5)', size: 9 });
  } else if (p.slick > 0) {
    // charco del Elemental de agua: resbalas, cuesta frenar y girar
    const k = Math.min(1, dt * 1.6);
    p.svx = (p.svx || 0) + (mx * ch.speed * speedMul * 1.15 - (p.svx || 0)) * k; p.svy = (p.svy || 0) + (my * ch.speed * speedMul * 1.15 - (p.svy || 0)) * k;
    moveEnt(p, p.svx * dt, p.svy * dt);
  } else { p.svx = mx * ch.speed * speedMul; p.svy = my * ch.speed * speedMul; moveEnt(p, p.svx * dt, p.svy * dt); }
  if (p.kbx || p.kby) { moveEnt(p, p.kbx * dt, p.kby * dt); const f = Math.exp(-7 * dt); p.kbx *= f; p.kby *= f; if (Math.abs(p.kbx) + Math.abs(p.kby) < 10) p.kbx = p.kby = 0; }
  pushOutProps(p);
  p.walk += ml * dt * 10;
  p.slow -= dt;
  if (p.burnT > 0) {
    p.burnT -= dt; p.burnTick -= dt;
    if (Math.random() < dt * 14) G.parts.push({ x: p.x + rand(-7, 7), y: p.y + rand(-8, 4), vx: 0, vy: -55, life: .35, max: .35, color: '#ff8a3a', size: 3 });
    if (p.burnTick <= 0 && !G.over) {
      p.burnTick = 1.1;
      if (p.sh > 0) p.sh--; else p.hp--;
      p.shT = 0; G.hurtFlash = .2; addText(p.x, p.y - 22, 1, '#ff6a3a', 12); sfx(160, .08, 'sawtooth', .03, -40);
      if (p.hp <= 0) { p.hp = 0; G.hitBy = tr('las quemaduras'); endGame(false); }
    }
  }

  if (wantSwap) {
    const prev = p.cur;
    p.cur = wantSwap === 'a' ? 0 : wantSwap === 'b' ? 1 : 1 - p.cur;
    if (p.cur !== prev) { p.cd = Math.max(p.cd, .12); p.charge = 0; sfx(520, .05, 'triangle', .03); }
  }
  setWantSwap(0);
  p.cd -= dt;
  const charging = touch.on ? touch.chg : mouse.right;
  if (charging && !G.over) { p.charge += dt; if (p.charge >= .55 && p.charge - dt < .55) sfx(900, .08, 'sine', .03); }
  else if (p.charge > 0) { if (p.charge >= .55 && !G.over) chargedAttack(p); p.charge = 0; }
  const attacking = touch.on ? touch.atk : mouse.down;
  if (attacking && p.cd <= 0 && !G.over && p.charge <= 0 && !(p.flame && p.flame.arma && p.flame.t > 0)) attack(p);   // con el lanzallamas de fuego, el arma solo echa fuego
  if (p.swing) { p.swing.t += dt; if (p.swing.t > p.swing.dur) p.swing = null; }

  p.abilCd -= dt; p.bulwarkT -= dt; p.shadowT -= dt;
  p.veilT -= dt; p.parryT -= dt; p.parryCd -= dt; p.rageT -= dt;
  // poderes elementales del arma que duran (v0.58): viento = velocidad, roca = resistencia y daño
  if (p.windT > 0) { p.windT -= dt; if (Math.random() < dt * 20) G.parts.push({ x: p.x + rand(-10, 10), y: p.y + rand(-6, 10), vx: -(p.svx || 0) * .3, vy: -(p.svy || 0) * .3, life: .3, max: .3, color: 'rgba(200,240,224,.8)', size: 2 }); }
  if (p.earthT > 0) { p.earthT -= dt; if (Math.random() < dt * 10) G.parts.push({ x: p.x + rand(-14, 14), y: p.y + rand(-4, 12), vx: 0, vy: -30, life: .4, max: .4, color: '#c09060', size: 3 }); if (p.earthT <= 0) addText(p.x, p.y - 30, tr('La piel de roca se agrieta'), '#c09060', 11); }
  if ((p.comboT -= dt) <= 0) p.combo = 0;
  if (p.revUsed) { p.revenge = 0; p.revUsed = false; }
  if (wantAbil && p.abilCd <= 0 && !G.over) useAbility(p);
  setWantAbil(false);
  if (wantElem && !G.over) elemAbility(p);
  setWantElem(false);
  if (touch.on) $('bEle').hidden = !(p.slots[p.cur] && p.slots[p.cur].elOn);

  p.en = Math.min(maxEnergy(p), p.en + (3 + 3 * rc('bateria')) * dt);
  p.noEnT -= dt;

  const it = nearestInteract(p);
  G.interact = it;
  const bu = $('bUse');
  if (touch.on) bu.hidden = !it;
  if (it) bu.textContent = { chest: tr('ABRIR'), shop: tr('COMPRAR'), portal: tr('BAJAR'), altar: tr('ELEGIR'), note: tr('LEER'), totem: tr('LUCHAR'), armor: tr('EQUIPAR'), prisoner: tr('LIBERAR'), merc: tr('LIBERAR'), lever: tr('PALANCA'), gamble: tr('APOSTAR'), mirror: tr('TOCAR'), exit: tr('SALIR'), cursed: tr('PACTO'), trial: tr('ACEPTAR'), forge: tr('FORJA') }[it.kind] || tr('TOMAR');
  if (wantUse && it) interact(p, it);
  setWantUse(false);

  p.inv -= dt; p.sqT = (p.sqT || 0) - dt;
  p.shT += dt;
  const maxSh = p.maxSh + rc('escudo') + armorSh(p);
  if (p.shT > (tl('aguante') ? 1.5 : 3) * (circ(5) ? 2 : 1) && p.sh < maxSh) { p.shAcc += dt; if (p.shAcc > (tl('aguante') ? .35 : .7)) { p.shAcc = 0; p.sh++; sfx(880, .05, 'sine', .02); } }

  // latido con poca vida (antes solo en los pisos de terror)
  if (p.hp <= 2 && p.hp > 0 && p.maxHp > 2) { G.heartT -= dt; if (G.heartT <= 0) { G.heartT = .9; sfx(60, .12, 'sine', .12); later(.16, () => sfx(52, .12, 'sine', .1)); } }
}

function useAbility(p) {
  const ch = CHARS[p.char];
  (G.vfx || (G.vfx = [])).push({ k: 'glyph', x: p.x, y: p.y + 6, t: 0, max: .7, r: 40, c: { knight: '#ffd27a', archer: '#9be07a', rogue: '#b98cff' }[p.char] || '#ffd27a' });
  if (p.spec) { p.abilCd = SPECS[p.spec].cd; specAbility(p); return; }
  p.abilCd = ch.cd;
  if (p.char === 'knight') { p.bulwarkT = 2.5; p.inv = Math.max(p.inv, 2.5); sfx(300, .4, 'triangle', .06, 300); burst(p.x, p.y, '#e3a24a', 18, 160); }
  else if (p.char === 'archer') {
    for (let wv = 0; wv < 3; wv++) later(wv * .22, () => {
      for (let i = 0; i < 20; i++) {
        const a = i * TAU / 20 + wv * .15;
        G.proj.push({ x: p.x, y: p.y, vx: Math.cos(a) * 560, vy: Math.sin(a) * 560, r: 4, dmg: Math.max(3, Math.round(bestDmg(p) * .6)), owner: 'player', kind: 'arrow', pierce: 1, hit: new Set(), life: 1.1, color: '#6cc46a', bounce: rc('rebote') });
      }
      sfx(700, .08, 'triangle', .04, -300);
    });
  } else { p.shadowT = 3; sfx(200, .5, 'sine', .05, -120); burst(p.x, p.y, '#3a3348', 20, 140, 5); }
}

function attack(p) {
  p.atkN = (p.atkN || 0) + 1;   // la guía del primer piso cuenta los ataques
  const w = p.slots[p.cur], cost = w.type === 'staff' && syn('arcano') ? Math.ceil((w.en || 0) / 2) : (w.en || 0);
  p.cd = w.cd * (p.rageT > 0 ? .7 : 1) * (subIs('ranger') && w.type !== 'melee' ? 1 - .04 * subLv(p) : 1);
  if (p.char === 'knight' && w.type === 'melee') p.parryT = tl('egida') ? .3 : .2;
  if (p.char === 'archer' && w.type !== 'melee') focusShot(p, w);
  if (w.style) { styleAttack(p, w, cost); return; }
  if (w.type === 'melee') {
    let dmg = w.dmg;
    if (p.en < cost) {
      dmg = Math.max(1, Math.floor(w.dmg / 2));
      if (p.noEnT <= 0) { addText(p.x, p.y - 26, tr('Agotado: daño a la mitad'), '#5aa4e8', 12); p.noEnT = 1.5; }
    } else p.en -= cost;
    p.swing = { t: 0, dur: .16, a: p.aim, arc: w.arc, range: w.range, dir: (p.swingDir = -(p.swingDir || 1)) };
    // sonido por familia: los pesados retumban, los filos silban
    if (w.shape === 'hammer') { sfx(110, .09, 'sawtooth', .03, -50); noise(.09, .05, 450); } else { sfx(190, .06, 'sawtooth', .018, -90); noise(.07, .035, 2600); }
    meleeHit(p, w, w.range, w.arc, dmg, w.shape === 'hammer' ? 380 : 260, false);
    if (rc('onda')) {
      const a = p.aim;
      G.proj.push({ x: p.x + Math.cos(a) * 18, y: p.y + Math.sin(a) * 18, vx: Math.cos(a) * 430, vy: Math.sin(a) * 430, r: 10, dmg: Math.max(1, Math.round(dmg * .6)),
        owner: 'player', kind: 'wave', pierce: syn('viento') ? 99 : 3, hit: new Set(), life: .45, color: '#ece4cf' });
      if (syn('viento')) G.proj[G.proj.length - 1].r = 18;
    }
  } else {
    if (p.en < cost) { p.cd = .25; if (p.noEnT <= 0) { addText(p.x, p.y - 26, tr`Sin energía (necesitas ${cost})`, '#5aa4e8', 12); p.noEnT = 1.2; sfx(120, .08, 'square', .03); } return; }
    p.en -= cost;
    const n = w.shots + (w.type === 'bow' ? rc('carcaj') + (syn('lluvia') ? 1 : 0) + (tl('carcaj2') ? 1 : 0) : 0), spread = .17;
    for (let i = 0; i < n; i++) shootPlayer(p, w, p.aim + (i - (n - 1) / 2) * spread + rand(-.025, .025), w.dmg);
    if (w.type === 'staff') { sfx(520, .09, 'sine', .03, 200); sfx(1040, .06, 'sine', .012, 300); }
    else if (w.type === 'bow') { sfx(330, .05, 'triangle', .03, -150); noise(.05, .025, 3200); }   // cuerda
    else sfx(700, .06, 'triangle', .03, -300);
  }
}
function shootPlayer(p, w, a, dmg, extra = {}) {
  const staff = w.type === 'staff';
  G.proj.push(Object.assign({
    x: p.x + Math.cos(a) * 14, y: p.y + Math.sin(a) * 14, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
    r: staff ? (w.big ? 11 : 7) : 4, dmg, owner: 'player', kind: staff ? 'magic' : 'arrow', pierce: w.pierce + (w.elOn && w.el === 'air' ? 1 : 0) + (tl('perfora') && !staff ? 1 : 0), hit: new Set(),
    life: staff ? (w.big ? 2.6 : 1.8) : 1.3, color: staff ? w.gem : RARITY[w.rarity].c, src: w, fx: w.fx, bounce: staff ? 0 : rc('rebote') + (syn('lluvia') ? 1 : 0) + (tl('rebote2') ? 1 : 0),
  }, extra));
}
function meleeHit(p, w, range, arc, dmg, kb, full) {
  for (const e of G.enemies) {
    if (e.air || e.dead) continue;
    const d = dist(p, e);
    if (d > range + e.r) continue;
    if (!full && d > e.r + p.r + 4 && Math.abs(angDiff(p.aim, angTo(p, e))) > arc / 2) continue;
    hurtEnemy(e, dmg, angTo(p, e), kb, { src: w, melee: true, fx: w.fx });
    p.en = Math.min(maxEnergy(p), p.en + 2);
  }
  for (const o of G.props) {
    if (o.dead || o.kind === 'merchant' || dist(p, o) > range + o.r) continue;
    if (!full && Math.abs(angDiff(p.aim, angTo(p, o))) > arc / 2) continue;
    damageProp(o, dmg);
  }
  for (const pr of G.proj) {
    if (pr.owner !== 'enemy') continue;
    const d = dist(p, pr);
    if (d > range + 8 || (!full && Math.abs(angDiff(p.aim, angTo(p, pr))) > arc / 2)) continue;
    reflect(pr, full ? angTo(p, pr) : p.aim, dmg);
  }
}
function reflect(pr, a, dmg) {
  const sp = Math.max(260, Math.hypot(pr.vx, pr.vy) * 1.4);
  pr.owner = 'player'; pr.vx = Math.cos(a) * sp; pr.vy = Math.sin(a) * sp;
  pr.dmg = dmg; pr.hit = new Set(); pr.pierce = 0; pr.color = '#ffd27a'; pr.life = 2; pr.kind = 'orb'; pr.slowFx = false;
  addText(pr.x, pr.y - 8, tr('¡Desviado!'), '#ffd27a', 11);
  sfx(1200, .05, 'square', .02);
}
function chargedAttack(p) {
  const w = p.slots[p.cur], cost = w.chgEn || 10;
  if (p.en < cost) { addText(p.x, p.y - 26, tr`Carga: necesitas ${cost} de energía`, '#5aa4e8', 12); sfx(120, .08, 'square', .03); return; }
  p.en -= cost; p.chgN = (p.chgN || 0) + 1;
  p.cd = Math.max(p.cd, .3);
  const a = p.aim, S = w.stars || 1, M = w.chgMul || 1, col = RARITY[w.rarity].c;
  const dm = k => Math.max(1, Math.round(w.dmg * k * M));
  if (S >= 3) addText(p.x, p.y - 30, chgName(w), col, 12);
  // cortes / cuchillos / flechas que salen en abanico o en anillo
  const fan = (n, spread, k, o = {}) => { for (let i = 0; i < n; i++) { const an = a + (n > 1 ? (i - (n - 1) / 2) * spread : 0); G.proj.push({ x: p.x + Math.cos(an) * 16, y: p.y + Math.sin(an) * 16, vx: Math.cos(an) * 460, vy: Math.sin(an) * 460, r: 8, dmg: dm(k), owner: 'player', kind: 'wave', pierce: 2, hit: new Set(), life: .5, color: col, src: w, fx: w.fx, ...o }); } };
  const ring = (n, k, o = {}) => fan(n, TAU / n, k, o);
  if (w.style) { styleCharge(p, w, S, dm, col); return; }
  switch (w.chg) {
    case 'spin': {
      const R = w.range * (S >= 2 ? 1.8 : 1.5);
      const spin = () => {
        p.swing = { t: 0, dur: .28, a: p.aim, arc: TAU, range: R, dir: 1, spin: true };
        meleeHit(p, w, R, TAU, dm(S >= 2 ? 2.7 : 2.5), 420, true);
        breakCracks(p.x, p.y, R + 10);
        shake(6); sfx(120, .25, 'sawtooth', .05, -60); noise(.2, .05, 1200);
      };
      spin();
      if (S >= 3) later(.22, spin);
      if (S === 5) later(.44, spin);
      if (S >= 4) later(.1, () => ring(S === 5 ? 12 : 8, 1.2));
      break;
    }
    case 'quake': {
      const R = w.range * (S >= 2 ? 2.5 : 2.1);
      const quake = (k) => {
        p.swing = { t: 0, dur: .3, a: p.aim, arc: TAU, range: R, dir: 1, spin: true };
        meleeHit(p, w, R, TAU, dm(k), 520, true);
        for (const e of G.enemies) if (!e.isBoss && dist(e, p) < R + e.r) e.slowT = S >= 2 ? 2.2 : 1.5;
        breakCracks(p.x, p.y, R);
        for (let i = 0; i < 24; i++) { const an = i * TAU / 24; G.parts.push({ x: p.x + Math.cos(an) * 20, y: p.y + Math.sin(an) * 20, vx: Math.cos(an) * 320, vy: Math.sin(an) * 320, life: .4, max: .4, color: '#8a84a0', size: 6 }); }
        shake(14); noise(.4, .1, 400); sfx(60, .4, 'sawtooth', .06, -20);
      };
      quake(2.2);
      if (S >= 3) later(.35, () => quake(1.4));
      if (S >= 4) for (let k = 0; k < 3; k++) later(.15 + k * .2, () => { for (let i = 0; i < 16; i++) { const an = i * TAU / 16 + k * .2; G.proj.push({ x: p.x, y: p.y, vx: Math.cos(an) * 300, vy: Math.sin(an) * 300, r: 9, dmg: dm(1), owner: 'player', kind: 'wave', pierce: 3, hit: new Set(), life: .6, color: '#a89ec0', src: w }); } });
      if (S === 5) later(.55, () => { explode(p.x, p.y, 170, dm(3), true); for (const e of G.enemies) if (!e.isBoss && dist(e, p) < 190) e.slowT = 3; shake(20); });
      break;
    }
    case 'lunge':
      p.dvx = Math.cos(a); p.dvy = Math.sin(a); p.dashT = S >= 2 ? .34 : .24; p.inv = Math.max(p.inv, .35);
      p.lunge = { dmg: dm(2.6), hit: new Set(), w, reps: S === 5 ? 3 : S >= 3 ? 2 : 1, knives: S >= 4 ? (S === 5 ? 9 : 7) : 0, len: p.dashT };
      sfx(260, .2, 'sawtooth', .05, 400);
      break;
    case 'volley': {
      const n = S >= 2 ? 13 : 9, sp = S >= 2 ? .1 : .12, o = S >= 4 ? { bounce: S === 5 ? 1 : 2 } : {};
      const shoot = () => {
        if (S === 5) for (let i = 0; i < 28; i++) shootPlayer(p, w, p.aim + i * TAU / 28, dm(1.3), { pierce: 2, bounce: 1 });
        else for (let i = 0; i < n; i++) shootPlayer(p, w, p.aim + (i - (n - 1) / 2) * sp, dm(1.3), o);
        shake(4); sfx(600, .15, 'triangle', .05, -300);
      };
      shoot();
      if (S === 3) later(.2, shoot);
      break;
    }
    case 'nova': {
      const n = S >= 2 ? 20 : 14;
      const nova = (off) => { for (let i = 0; i < n; i++) shootPlayer(p, w, p.aim + off + i * TAU / n, dm(1.3)); shake(5); sfx(300, .3, 'sine', .05, 500); };
      if (S === 4) { for (let k = 0; k < 14; k++) later(k * .08, () => { for (let i = 0; i < 4; i++) shootPlayer(p, w, k * .35 + i * TAU / 4, dm(1.2)); if (k % 3 === 0) sfx(500 + k * 20, .05, 'sine', .03); }); }
      else nova(0);
      if (S === 3) later(.25, () => nova(TAU / n / 2));
      if (S === 5) for (let i = 0; i < 8; i++) shootPlayer(p, w, a + i * TAU / 8, dm(1.8), { fx: 'homing', r: 8, life: 2.6 });
      break;
    }
    default: {
      // arcos de un disparo: disparo potente → perforante → tridente → divisoria → andanada
      const boom = w.fx === 'explode' ? 100 : S === 5 ? 70 : 0;
      const shot = (an, k) => shootPlayer(p, w, an, dm(k), { r: S >= 2 ? 9 : 7, kind: 'power', pierce: 99, life: 1.5, color: '#ffffff', vx: Math.cos(an) * w.speed * (S >= 2 ? 1.5 : 1.3), vy: Math.sin(an) * w.speed * (S >= 2 ? 1.5 : 1.3), bounce: 0, boom, split: S >= 4 ? (S === 5 ? 6 : 8) : 0 });
      if (S === 5) for (let i = -2; i <= 2; i++) shot(a + i * .12, 2.6);
      else if (S >= 3) { shot(a, 3.2); shot(a - .15, 2); shot(a + .15, 2); }
      else shot(a, S === 2 ? 3.4 : 3);
      shake(4); sfx(400, .2, 'sawtooth', .04, 600);
    }
  }
}

export { critChance, dmgMul, maxEnergy, meleeHit, nearestEnemy, reflect, shootPlayer, updatePlayer };
