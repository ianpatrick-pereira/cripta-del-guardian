// ================= Enemigos =================
function mkEnemy(type, x, y, depth, elite) {
  const d = ENEMY[type];
  const fm = 1 + .6 * (G.floor - 1);
  const hp = Math.round(d.hp * (1 + .1 * depth) * fm * (elite ? 2.5 : 1) * D().hp * (G.floor >= OLEADAS.pisosDuros.desdePiso ? OLEADAS.pisosDuros.factorVida : 1));
  return { type, x, y, lv: G.floor, r: d.r * (elite ? 1.3 : 1), hp, max: hp, speed: d.speed * (elite ? 1.1 : 1) * Math.min(1.3, 1 + .035 * (G.floor - 1)) * (pact('frenzy') ? 1.25 : 1), dmg: d.dmg + (elite && G.floor > 1 ? 1 : 0),
    spr: d.spr, s: d.s * (elite ? 1.3 : 1), elite, kx: 0, ky: 0, flash: 0, t: rand(0, 3), st: 'walk', st_t: 0, cd: rand(.5, 1.5),
    shootT: rand(1.2, 2.2), wob: rand(0, TAU), tx: x, ty: y, poison: 0, pt: 0, alpha: 1, wa: rand(0, TAU), shield: elite && G.floor >= 4 ? Math.round(hp * .4) : 0 };
}
function mkBoss(kind, x, y) {
  const B = BOSSES[kind], hp = Math.round(B.hp * D().hp * (1 + .8 * (G.cycle - 1)));
  return { type: 'boss', kind, isBoss: true, x, y, r: B.r, hp, max: hp, speed: 42, dmg: 2,
    kx: 0, ky: 0, flash: 0, t: 0, phase: 1, st: 'idle', st_t: 1.2, last: '', k: 0, ca: 0, invuln: false, spin: 0, fade: 1, air: false, poison: 0, pt: 0, wob: 0, timer: 0 };
}
function hurtEnemy(e, dmg, ang, kb, o = {}) {
  if (e.dead || e.invuln || e.air) return;
  dmg = Math.max(1, Math.round(dmg * dmgMul()));
  if (syn('quebrar') && e.slowT > 0) dmg = Math.round(dmg * 1.5);
  if (!o.explosion || o.cls) dmg = classHit(e, dmg, ang, o);
  const crit = Math.random() < critChance();
  if (crit) dmg *= 2;
  const ed = ENEMIES[e.type];
  if (ed && ed.alRecibir) dmg = ed.alRecibir(e, dmg, ang, o);
  if (e.shield > 0) {
    const ab = Math.min(e.shield, dmg); e.shield -= ab; dmg -= ab;
    if (e.shield <= 0) { burst(e.x, e.y, '#9bd8ff', 10, 140); addText(e.x, e.y - e.r - 10, 'Escudo roto', '#9bd8ff', 11); }
    if (dmg <= 0) { e.flash = .06; addText(e.x + rand(-6, 6), e.y - e.r - 4, ab, '#9bd8ff', 12); return; }
  }
  if (e.elem === 'earth') dmg = Math.max(1, Math.round(dmg * .7));
  e.hp -= dmg; e.flash = .1;
  if (o.fx === 'push') kb *= 2.5;
  if (o.fx === 'stun' && !e.isBoss) e.slowT = Math.max(e.slowT || 0, 1.2);
  const el = o.src && o.src.elOn ? o.src.el : null;
  if (o.src && o.src.el && !o.explosion && !(G.ehT > G.time)) { G.ehT = G.time + .05; elemHitFx(o.src.el, e.x, e.y); }
  if (el && o.src.elBoost > 0 && !o.explosion) elemProc(el, e, o.src);
  if (el === 'fire') e.burn = 3;
  else if (el === 'water') e.slowT = Math.max(e.slowT || 0, 1.5);
  else if (el === 'air') kb *= 2;
  else if (el === 'earth') { kb *= 1.5; if (!e.isBoss && Math.random() < .2) e.slowT = Math.max(e.slowT || 0, 1); }
  if (!e.isBoss && !e.isSub && !(ed && ed.sinEmpuje)) { e.kx += Math.cos(ang) * kb; e.ky += Math.sin(ang) * kb; }
  if ((rc('veneno') || (tl('toxina') && o.src)) && !o.explosion) e.poison = 3;
  if (o.fx === 'poison') e.poison = 3;
  if (o.fx === 'burn') e.burn = 3;
  if (o.fx === 'slow') e.slowT = 2;
  addText(e.x + rand(-6, 6), e.y - e.r - 4, dmg, crit ? '#ffd27a' : '#ece4cf', crit ? 16 : 13);
  burst(e.x, e.y, e.isBoss ? '#c77dff' : '#ece4cf', 4, 110, 2.5, .3);
  sfx(crit ? 340 : 260, .05, 'square', .025, -120);
  if (e.hp <= 0) killEnemy(e, o.src);
}
function dropCoin(x, y) {
  const a = Math.random() * TAU, s = rand(60, 170);
  G.pickups.push({ kind: 'coin', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: rand(0, 3) });
}
function killEnemy(e, src) {
  if (e.dead) return;
  e.dead = true; G.kills++;
  const p = G.player;
  burst(e.x, e.y, e.isBoss ? '#c77dff' : '#ece4cf', e.isBoss ? 60 : 14, e.isBoss ? 320 : 170, e.isBoss ? 6 : 3.5, e.isBoss ? 1.1 : .5);
  shake(e.isBoss ? 20 : 4); G.hitstop = e.isBoss ? .3 : .035;
  sfx(e.isBoss ? 70 : 150, e.isBoss ? .6 : .12, 'sawtooth', .04, -60);
  if (!e.isBoss && !e.isSub) {
    SAVE.kills[e.type] = (SAVE.kills[e.type] || 0) + 1; ach('first');
    if (Object.keys(BEAST).every(k => SAVE.kills[k])) ach('bestiary');
    if (syn('infierno') && e.burn > 0) later(.05, () => explode(e.x, e.y, 64, 4 + G.floor, true));
  }
  classKill(e, src);
  if (src && src.leech && Math.random() < (syn('sangre') ? .6 : .3) && p.hp < p.maxHp) { p.hp++; addText(p.x, p.y - 22, '+1', '#d4474b'); }
  if (rc('vampiro')) { p.killCount++; if (p.killCount % (syn('sangre') ? 8 : 12) === 0 && p.hp < p.maxHp) { p.hp++; addText(p.x, p.y - 22, '+1 vida', '#b0303a'); } }
  if (e.isBoss) { bossDefeated(e); return; }
  if (e.mirror) mirrorDefeated(e);
  if (e.cheat) { ach('sub'); cheatDefeated(e); return; }
  if (e.isSub) { ach('sub'); SAVE.kills['sub:' + e.sk] = (SAVE.kills['sub:' + e.sk] || 0) + 1; subDefeated(e); return; }
  if (ENEMIES[e.type] && ENEMIES[e.type].alMorir) ENEMIES[e.type].alMorir(e);
  if (pact('volatile')) { const x = e.x, y = e.y, dm = Math.max(2, Math.round(bestDmg(p))); burst(x, y, '#ff8a3a', 8, 90); later(.35, () => { if (!G.over) explode(x, y, 50, dm, false); }); }
  // probabilidades en src/datos/botin.jsonc
  const BE = BOTIN.enemigo, BL = BOTIN.elite;
  const coins = Math.round((randi(BE.monedas[0], BE.monedas[1]) + (rc('iman') ? 1 : 0) + (e.elite ? BE.monedasElite : 0)) * (pact('volatile') ? 1.5 : 1) * (pact('dark') ? 2 : 1));
  for (let i = 0; i < coins; i++) dropCoin(e.x, e.y);
  if (Math.random() < BE.energia) G.pickups.push({ kind: 'energy', x: e.x, y: e.y, vx: 0, vy: 0 });
  if (!pact('fasting') && Math.random() < BE.pocion) G.pickups.push({ kind: 'potion', x: e.x, y: e.y });
  if (Math.random() < BE.arma) G.pickups.push({ kind: 'weapon', x: e.x, y: e.y, weapon: rollWeapon('enemy'), bob: 0 });
  if (e.elite) {
    if (Math.random() < BL.gema) G.pickups.push({ kind: 'gem', x: e.x, y: e.y, vx: rand(-60, 60), vy: rand(-60, 60) });
    if (Math.random() < BL.llave) G.pickups.push({ kind: 'key', x: e.x + 12, y: e.y });
  }
}
function chainHit(from, dmg) {
  const targets = G.enemies.filter(e => e !== from && !e.dead && !e.air && dist(e, from) < 150).sort((a, b) => dist(a, from) - dist(b, from)).slice(0, 2);
  let prev = from;
  for (const t of targets) {
    G.bolts.push({ x1: prev.x, y1: prev.y, x2: t.x, y2: t.y, life: .18 });
    hurtEnemy(t, Math.max(1, Math.round(dmg * .6)), angTo(prev, t), 80, syn('toxica') ? { fx: 'poison' } : {});
    prev = t;
  }
  if (targets.length) sfx(1500, .08, 'sawtooth', .02, -900);
}
function enemyShoot(e, a, speed, r = 5, color = '#e86a8a', dmg = 1, kind = 'orb') {
  const S = G.elSrc;
  G.proj.push({ x: e.x + Math.cos(a) * e.r, y: e.y + Math.sin(a) * e.r, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
    r, dmg: S ? Math.max(dmg, S.dmg) : dmg, owner: 'enemy', kind, life: 4.5, color, slowFx: kind === 'web', shred: kind === 'web' && !!e.isBoss, el: S ? S.elem : null });
}

// ---- herramientas de IA ----
// línea de visión: ¿hay muro o caja entre a y b?
function lineClear(a, b) {
  const d = dist(a, b), n = Math.ceil(d / 14);
  for (let i = 1; i < n; i++) {
    const x = a.x + (b.x - a.x) * i / n, y = a.y + (b.y - a.y) * i / n;
    if (solidAt(Math.floor(x / TILE), Math.floor(y / TILE))) return false;
    for (const o of G.props) if (!o.dead && o.solid && o.kind !== 'merchant' && Math.hypot(o.x - x, o.y - y) < o.r) return false;
  }
  return true;
}
// puntería anticipada: apunta a donde estarás, no a donde estás
function leadAng(e, sp, k = D().lead) {
  const p = G.player, t = dist(e, p) / sp * k;
  return Math.atan2(p.y + G.pv.y * t - e.y, p.x + G.pv.x * t - e.x);
}
// cada enemigo cuerpo a cuerpo tiene un lado asignado: así te rodean en vez de hacer fila
function flankPoint(e, p, d) {
  if (e.slot === undefined) e.slot = (G.slotN = (G.slotN || 0) + 1) * 2.39996;
  const off = clamp(d - 50, 0, 110);
  return { x: p.x + Math.cos(e.slot) * off, y: p.y + Math.sin(e.slot) * off };
}
// turnos de ataque: solo unos pocos enemigos pueden preparar un golpe a la vez
function takeToken(e) {
  if (e.tok) return true;
  let busy = 0; for (const o of G.enemies) if (o.tok && !o.dead) busy++;
  if (busy >= D().tokens) return false;
  e.tok = true; return true;
}
function telegraph(e, t) { e.st = 'tele'; e.st_t = t; e.tele = t; }
// ¿viene una flecha del jugador directo hacia mí?
function threat(e) {
  for (const pr of G.proj) {
    if (pr.owner !== 'player') continue;
    const sp = Math.hypot(pr.vx, pr.vy) || 1, dx = e.x - pr.x, dy = e.y - pr.y;
    const along = (dx * pr.vx + dy * pr.vy) / sp;
    if (along < 0 || along > 120) continue;
    const perp = (dx * pr.vy - dy * pr.vx) / sp;
    if (Math.abs(perp) < e.r + pr.r + 6) return { a: Math.atan2(pr.vy, pr.vx), side: perp >= 0 ? 1 : -1 };
  }
  return null;
}
function hazard(x, y, r, t, dmg = 1, color = '#d4474b', o = {}) {
  const S = G.elSrc;
  G.hazards.push({ x, y, r, t, max: t, dmg: S ? Math.max(dmg, S.dmg) : dmg, color, src: S, el: S ? S.elem : null, ...o });
}
// efecto del elemento cuando un Elemental te alcanza
function elemHit(el, from) {
  const p = G.player;
  if (el === 'fire') { if (!(p.burnT > 0)) p.burnTick = 1; p.burnT = 2.6; addText(p.x, p.y - 30, 'Quemado', '#ff6a3a', 12); }
  else if (el === 'water') { p.slow = Math.max(p.slow, 2.4); addText(p.x, p.y - 30, 'Empapado', '#4ab0e8', 12); }
  else if (el === 'air') { const a = angTo(from, p); p.kbx = Math.cos(a) * 640; p.kby = Math.sin(a) * 640; addText(p.x, p.y - 30, 'Empujado', '#c8f0e0', 12); }
  else if (el === 'earth') { shake(10); addText(p.x, p.y - 30, 'Aplastado', '#c09060', 12); }
}
// suelo en llamas: mientras estés encima, te sigue quemando
function updateFlames(dt) {
  if (!G.flames) G.flames = [];
  const p = G.player;
  for (const f of G.flames) {
    f.t -= dt;
    if (!G.over && dist(f, p) < f.r + p.r * .3 && p.dashT <= 0) { if (!(p.burnT > 0)) p.burnTick = .6; p.burnT = Math.max(p.burnT, 1.4); }
    if (Math.random() < dt * 8) G.parts.push({ x: f.x + rand(-f.r, f.r) * .7, y: f.y + rand(-f.r, f.r) * .7, vx: 0, vy: -45, life: .45, max: .45, color: Math.random() < .5 ? '#ff6a3a' : '#ffd27a', size: 3 });
  }
  G.flames = G.flames.filter(f => f.t > 0 && !(G.elFight === null && f.fight));
}
function blinkAway(e, minD) {
  const s = freeSpot(G.cur, 2, 20, G.player, minD);
  if (!s) return false;
  burst(e.x, e.y, '#9bff7a', 10, 120); e.x = s.x; e.y = s.y; e.alpha = 0; sfx(700, .15, 'sine', .03, -400);
  return true;
}

function updateEnemy(e, dt) {
  const p = G.player, hidden = p.shadowT > 0 || p.veilT > 0, Df = D();
  if (e.lx !== undefined) { const mx = e.x - e.lx, my = e.y - e.ly; if (mx * mx + my * my > .25) { const ta = Math.atan2(my, mx); e.face2 = e.face2 === undefined ? ta : e.face2 + clamp(angDiff(ta, e.face2), -5 * dt, 5 * dt); } }
  e.lx = e.x; e.ly = e.y;
  e.t += dt; e.flash -= dt; e.tele = (e.tele || 0) - dt;
  if (e.poison > 0) {
    e.poison -= dt; e.pt += dt;
    if (e.pt >= 1) { e.pt = 0; const pd = e.pdmg || 1; e.hp -= pd; e.flash = .06; addText(e.x, e.y - e.r - 4, pd, '#9be05a', 11); if (e.hp <= 0) { killEnemy(e); return; } }
  }
  if (e.burn > 0) {
    e.burn -= dt; e.bt = (e.bt || 0) + dt;
    if (Math.random() < dt * 12) G.parts.push({ x: e.x + rand(-8, 8), y: e.y + rand(-8, 4), vx: 0, vy: -50, life: .35, max: .35, color: '#ff8a3a', size: 3 });
    if (e.bt >= .5) { e.bt = 0; e.hp -= 1; e.flash = .06; addText(e.x, e.y - e.r - 4, 1, '#ff8a3a', 11); if (e.hp <= 0) { killEnemy(e); return; } }
  }
  e.slowT = (e.slowT || 0) - dt;
  if (e.type === 'boss') { updateBoss(e, dt); return; }
  if (e.isSub) { G.elSrc = e.elem ? e : null; updateSub(e, dt); G.elSrc = null; return; }
  const cdt = dt * Df.rate * enemyPace();
  let tgt = p;
  if (hidden) { if (Math.random() < dt) e.wa = rand(0, TAU); tgt = { x: e.x + Math.cos(e.wa) * 100, y: e.y + Math.sin(e.wa) * 100 }; if (e.tok) { e.tok = false; if (e.st === 'tele') e.st = 'walk'; } }
  const d = dist(e, tgt), a = angTo(e, tgt);
  const hurt = e.hp < e.max * .35 && !e.elite;
  e.losT = (e.losT || 0) - dt;
  if (e.losT <= 0) { e.losT = .25; e.los = lineClear(e, p); }
  // lo que la IA de cada enemigo necesita saber; go() fija su velocidad y done() cierra un ataque
  const c = { dt, cdt, p, hidden, tgt, d, a, hurt, Df, vx: 0, vy: 0 };
  c.go = (ang, sp) => { c.vx = Math.cos(ang) * sp; c.vy = Math.sin(ang) * sp; };
  c.done = (rest, cd) => { e.st = rest > 0 ? 'rest' : 'walk'; e.st_t = rest; e.tok = false; e.cd = cd; };
  if (e.st === 'rest') { e.st_t -= dt; if (e.st_t <= 0) e.st = 'walk'; }
  // cada enemigo decide qué hacer en su archivo de 01b-enemigos/ (función ia)
  const ed = ENEMIES[e.type], ia = ed && (typeof ed.ia === 'string' ? ENEMIES[ed.ia].ia : ed.ia);
  if (ia) ia(e, c);
  let vx = c.vx, vy = c.vy;
  // esquivar: los enemigos ágiles se apartan de tus disparos
  e.dodgeCd = (e.dodgeCd || 0) - dt;
  if (e.dodge > 0) { e.dodge -= dt; vx = e.dvx; vy = e.dvy; }
  else if (((ENEMIES[e.type] && ENEMIES[e.type].esquiva) || e.elite) && e.st === 'walk' && e.dodgeCd <= 0 && !hidden) {
    const th = threat(e);
    if (th) {
      e.dodgeCd = 1.5;
      if (Math.random() < Df.dodge) { const s = th.a + Math.PI / 2 * th.side; e.dodge = .2; e.dvx = Math.cos(s) * 280; e.dvy = Math.sin(s) * 280; }
    }
  }
  const sm = e.slowT > 0 ? .45 : 1;
  moveEnt(e, (vx * sm + e.kx) * dt, (vy * sm + e.ky) * dt);
  pushOutProps(e);
  const f = Math.exp(-10 * dt); e.kx *= f; e.ky *= f;
}

