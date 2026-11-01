// ================= Armas con estilo propio =================
// cada una ataca a su manera, tiene su mejora de forja propia y su ataque elemental
// el texto, la mejora de forja y los ataques de cada arma con estilo viven en su archivo de 01c-armas/
const STYLE = {};
for (const id of weaponList()) { const d = WEAPON_DEFS[id]; if (d.estilo) STYLE[d.datos.style] = d.estilo; }
const EL_PROC = { fire: 'quema y estalla', water: 'empapa y frena', air: 'empuja lejos', earth: 'aturde' };
const elAbName = w => w.style ? STYLE[w.style].el[w.el] : ELEMS[w.el].ab;
const elAbDesc = w => w.style ? `Su ataque cargado en su forma de 5★ y, durante unos segundos, cada golpe ${EL_PROC[w.el]}.` : ELEMS[w.el].abd;
const espLv = w => (w.up && w.up.esp) || 0;
const thrownOut = kind => G.proj.filter(pr => pr.main === kind && pr.life > 0).length;
function throwIt(p, w, kind, a, dmg, o = {}) {
  const sp = w.speed * (kind === 'boomer' ? 1 + .25 * espLv(w) : 1);
  G.proj.push(Object.assign({ x: p.x + Math.cos(a) * 14, y: p.y + Math.sin(a) * 14, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: kind === 'sickle' ? 11 : 9, dmg,
    owner: 'player', kind, thrown: kind, ph: 'out', t: 0, drag: kind === 'boomer' ? 2.6 / (1 + .2 * espLv(w)) : 0, outT: .32, spinT: 1 + .4 * espLv(w),
    backSp: kind === 'boomer' ? 520 + 60 * espLv(w) : 460, pierce: 99, hit: new Set(), life: 9, color: RARITY[w.rarity].c, src: w, fx: w.fx }, o));
}
function updateThrown(pr, dt) {
  const p = G.player;
  pr.t += dt; pr.spinA = (pr.spinA || 0) + dt * 18; pr.life = 9;
  if (pr.orbit) {
    const O = pr.orbit; O.t -= dt; O.a += dt * 7;
    pr.x = p.x + Math.cos(O.a) * O.R; pr.y = p.y + Math.sin(O.a) * O.R; pr.vx = pr.vy = 0; pr.ghost = true;
    pr.tick = (pr.tick || 0) - dt; if (pr.tick <= 0) { pr.tick = .3; pr.hit = new Set(); }
    if (O.t <= 0) { pr.life = 0; burst(pr.x, pr.y, pr.color, 6, 100); }
    return;
  }
  if (pr.ph === 'out') {
    if (pr.thrown === 'boomer') { const k = Math.exp(-pr.drag * dt); pr.vx *= k; pr.vy *= k; if (Math.hypot(pr.vx, pr.vy) < 110) { pr.ph = 'back'; pr.hit = new Set(); } }
    else if (pr.t > pr.outT) { pr.ph = 'spin'; pr.vx = pr.vy = 0; pr.st = 0; }
  } else if (pr.ph === 'spin') {
    pr.st += dt; pr.tick = (pr.tick || 0) - dt;
    if (pr.stick) { if (pr.stick.dead) pr.stick = null; else { pr.x = pr.stick.x; pr.y = pr.stick.y; } }
    if (pr.tick <= 0) { pr.tick = .26; pr.hit = new Set(); }
    if (pr.st > pr.spinT) { pr.ph = 'back'; pr.hit = new Set(); }
  }
  if (pr.ph === 'back') {
    const a = angTo(pr, p); pr.vx = Math.cos(a) * pr.backSp; pr.vy = Math.sin(a) * pr.backSp; pr.ghost = true;
    if (dist(pr, p) < p.r + 14) {
      pr.life = 0;
      if (pr.main === 'boomer') { p.cd = Math.min(p.cd, .05); p.en = Math.min(maxEnergy(p), p.en + 1); addText(p.x, p.y - 26, 'Atrapado', '#ece4cf', 10); sfx(900, .05, 'triangle', .02); }
    }
  }
  if (pr.t > 7) pr.life = 0;
}
// látigo: golpe en línea recta
function whipLash(p, w, a, range, dmg, pull) {
  p.whip = { t: 0, dur: .2, a, range };
  const ca = Math.cos(a), sa = Math.sin(a);
  for (const e of G.enemies) {
    if (e.dead || e.air) continue;
    const dx = e.x - p.x, dy = e.y - p.y, along = dx * ca + dy * sa, perp = Math.abs(-dx * sa + dy * ca);
    if (along < -e.r || along > range + e.r || perp > 14 + e.r) continue;
    hurtEnemy(e, dmg, a, 120, { src: w, melee: true, fx: w.fx });
    if (pull && !e.isBoss && !e.isSub && !e.elite && e.r <= 16) { e.kx -= ca * 460; e.ky -= sa * 460; }
    p.en = Math.min(maxEnergy(p), p.en + 1);
  }
  for (const o of G.props) {
    if (o.dead || o.kind === 'merchant') continue;
    const dx = o.x - p.x, dy = o.y - p.y, along = dx * ca + dy * sa, perp = Math.abs(-dx * sa + dy * ca);
    if (along > 0 && along < range + o.r && perp < 14 + o.r) damageProp(o, dmg);
  }
  sfx(1400, .05, 'square', .02, -900);
}
function whipCircle(p, w, dmg, pull) {
  const R = w.range * (1 + .2 * espLv(w));
  for (let i = 0; i < 10; i++) whipLash(p, w, p.aim + i * TAU / 10, R * .8, dmg, false);
  p.whip = { t: 0, dur: .3, a: p.aim, range: R * .8, circle: true };
  if (pull) for (const e of G.enemies) if (!e.dead && !e.isBoss && dist(e, p) < R * 1.3) { const a = angTo(e, p); e.kx += Math.cos(a) * (e.isSub ? 0 : 520); e.ky += Math.sin(a) * (e.isSub ? 0 : 520); e.slowT = Math.max(e.slowT || 0, 1); }
  shake(5); noise(.15, .05, 1800);
}
// escudo: empujón en cono que aturde y deshace balas
function shieldBash(p, w, range, dmg) {
  p.swing = { t: 0, dur: .2, a: p.aim, arc: 2.4, range, dir: 1 };
  meleeHit(p, w, range, 2.4, dmg, 820, false);
  for (const e of G.enemies) if (!e.dead && !e.isBoss && dist(e, p) < range + e.r && Math.abs(angDiff(p.aim, angTo(p, e))) < 1.3) e.slowT = Math.max(e.slowT || 0, 1.2);
  for (const pr of G.proj) if (pr.owner === 'enemy' && dist(pr, p) < range + 30 && Math.abs(angDiff(p.aim, angTo(p, pr))) < 1.4) { pr.life = 0; burst(pr.x, pr.y, '#d8d0b8', 3, 80); }
  shake(6); sfx(110, .2, 'square', .05, -40);
}
function shieldBlock(p, pr) {
  const w = p.slots[p.cur];
  if (!w || w.style !== 'shield' || Math.abs(angDiff(p.aim, angTo(p, pr))) > 1 + .25 * espLv(w)) return false;
  if (espLv(w) >= 3) reflect(pr, p.aim, w.dmg); else { pr.life = 0; burst(pr.x, pr.y, '#d8d0b8', 4, 90); sfx(1500, .04, 'square', .02); }
  p.en = Math.min(maxEnergy(p), p.en + 1);
  return true;
}
// grimorio: esqueletos aliados
function summonBones(p, w, big = false, dmg) {
  if (!G.allies) G.allies = [];
  const a = rand(0, TAU), x = p.x + Math.cos(a) * 26, y = p.y + Math.sin(a) * 26;
  G.allies.push({ x: hitsWall(x, y, 8) ? p.x : x, y: hitsWall(x, y, 8) ? p.y : y, r: big ? 13 : 9, big, t: (big ? 12 : 8) + 2 * espLv(w), cd: .4, dmg: Math.round((dmg || w.dmg) * (1 + .15 * espLv(w))), w, flip: false, rise: .4 });
  burst(x, y, '#d8d0b8', 8, 90); sfx(200, .2, 'triangle', .04, -80);
}
const maxBones = w => 3 + Math.floor((w.stars - 1) / 2) + ((w.up && w.up.bones) || 0);
function updateAllies(dt) {
  if (!G.allies) return;
  const p = G.player;
  for (const A of G.allies) {
    A.t -= dt; A.cd -= dt; A.rise = Math.max(0, A.rise - dt);
    let tgt = null, bd = 420;
    for (const e of G.enemies) if (!e.dead && !e.air && roomAt(e.x, e.y) === G.cur) { const d = dist(A, e); if (d < bd) { bd = d; tgt = e; } }
    if (tgt) {
      const a = angTo(A, tgt); A.flip = Math.cos(a) < 0;
      if (bd > tgt.r + A.r + 4) moveEnt(A, Math.cos(a) * 150 * dt, Math.sin(a) * 150 * dt);
      else if (A.cd <= 0) { A.cd = A.big ? .55 : .7; hurtEnemy(tgt, A.dmg, a, A.big ? 260 : 120, { src: A.w, melee: true }); burst(tgt.x, tgt.y, '#d8d0b8', 3, 70); }
    } else if (dist(A, p) > 50) { const a = angTo(A, p); moveEnt(A, Math.cos(a) * 170 * dt, Math.sin(a) * 170 * dt); A.flip = Math.cos(a) < 0; }
    if (A.t <= 0) burst(A.x, A.y, '#d8d0b8', 10, 110);
  }
  G.allies = G.allies.filter(A => A.t > 0);
}
// rayo: distancia hasta el primer muro
function beamLen(p, a, max, thru) {
  if (thru) return max;
  for (let d = 10; d < max; d += 8) if (solidAt(Math.floor((p.x + Math.cos(a) * d) / TILE), Math.floor((p.y + Math.sin(a) * d) / TILE))) return d;
  return max;
}
function beamHit(p, w, a, len, width, dmg) {
  const ca = Math.cos(a), sa = Math.sin(a);
  for (const e of G.enemies) {
    if (e.dead || e.air) continue;
    const dx = e.x - p.x, dy = e.y - p.y, along = dx * ca + dy * sa, perp = Math.abs(-dx * sa + dy * ca);
    if (along > 0 && along < len + e.r && perp < width / 2 + e.r) hurtEnemy(e, dmg, a, 40, { src: w, fx: w.fx });
  }
  for (const o of G.props) { if (o.dead || o.kind === 'merchant') continue; const dx = o.x - p.x, dy = o.y - p.y, along = dx * ca + dy * sa, perp = Math.abs(-dx * sa + dy * ca); if (along > 0 && along < len && perp < width / 2 + o.r) damageProp(o, dmg); }
  breakCracks(p.x + ca * len, p.y + sa * len, 14);
}
function styleAttack(p, w, cost) {
  const a = p.aim, melee = w.type === 'melee';
  let dmg = w.dmg;
  if (p.en < cost) {
    if (!melee) { p.cd = .25; if (p.noEnT <= 0) { addText(p.x, p.y - 26, `Sin energía (necesitas ${cost})`, '#5aa4e8', 12); p.noEnT = 1.2; sfx(120, .08, 'square', .03); } return; }
    dmg = Math.max(1, Math.floor(dmg / 2));
  } else if (!STYLE[w.style].cobraAlLanzar) p.en -= cost;
  STYLE[w.style].ataque(p, w, { a, dmg, cost });
}
// ataque cargado de cada estilo; S = estrellas (la habilidad elemental usa la forma de 5★)
function styleCharge(p, w, S, dm, col) {
  const a = p.aim;
  STYLE[w.style].cargado(p, w, { a, S, dm, col });
}
// estallido de elemento en cada golpe mientras dura el poder elemental del arma
function elemProc(el, e, w) {
  if (e.elPT > G.time) return;
  e.elPT = G.time + .3;
  const d = Math.max(1, Math.round(w.dmg * .4));
  if (el === 'fire') { e.burn = 3; elemBlast(e.x, e.y, 34, d, 'burn', ELEMS.fire.c); }
  else if (el === 'water') { e.slowT = Math.max(e.slowT || 0, 2.5); elemBlast(e.x, e.y, 40, d, 'slow', ELEMS.water.c); }
  else if (el === 'air') { for (const o of G.enemies) if (!o.dead && !o.isBoss && !o.isSub && dist(o, e) < 70) { const a = angTo(G.player, o); o.kx += Math.cos(a) * 520; o.ky += Math.sin(a) * 520; } burst(e.x, e.y, ELEMS.air.c, 8, 200); }
  else { if (!e.isBoss) e.slowT = Math.max(e.slowT || 0, 1.4); elemBlast(e.x, e.y, 30, d, 'stun', ELEMS.earth.c); }
}
function styleElem(p, w, L, E, dm) {
  w.elBoost = 2.5 + .5 * L;
  styleCharge(p, w, 5, k => dm(k * (1 + .25 * L)), E.c);
  burst(p.x, p.y, E.c, 24, 220, 4);
}
function updateStyles(dt) {
  const p = G.player;
  p.blockT = (p.blockT || 0) - dt;
  if (p.whip) { p.whip.t += dt; if (p.whip.t > p.whip.dur) p.whip = null; }
  if (p.beamVis) { p.beamVis.t -= dt; if (p.beamVis.t <= 0) p.beamVis = null; }
  for (const w of p.slots) if (w.elBoost > 0) w.elBoost -= dt;
  updateAllies(dt);
  if (G.pbeams) {
    for (const B of G.pbeams) {
      B.t -= dt; B.a += B.rot * dt; B.tick -= dt;
      B.cur = beamLen(p, B.a, B.len, B.thru);
      if (B.tick <= 0) { B.tick = .1; beamHit(p, B.w, B.a, B.cur, B.wd, Math.max(1, Math.round(B.w.dmg * B.k))); }
    }
    G.pbeams = G.pbeams.filter(B => B.t > 0);
  }
}
function drawStyles() {
  const p = G.player, w = p.slots[p.cur];
  drawClass();
  for (const A of G.allies || []) {
    ctx.fillStyle = 'rgba(155,224,160,.18)'; ctx.beginPath(); ctx.arc(A.x, A.y + 4, A.r + 6, 0, TAU); ctx.fill();
    drawShadow(A.x, A.y + 4, A.r);
    drawSpr(A.merc ? 'knight' : 'skel', A.x, A.y - (A.rise || 0) * 20, A.merc ? 2 : A.big ? 3 : 2, { flip: A.flip, alpha: Math.min(1, A.t * 2) * .9 });
  }
  const beam = (a, len, wd, col, al) => {
    const ex = p.x + Math.cos(a) * len, ey = p.y + Math.sin(a) * len;
    ctx.globalAlpha = al * .35; ctx.strokeStyle = col; ctx.lineWidth = wd * 1.8; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.globalAlpha = al; ctx.lineWidth = wd * .6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(2, wd * .2); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.globalAlpha = 1; if (Math.random() < .5) G.parts.push({ x: ex, y: ey, vx: rand(-80, 80), vy: rand(-80, 80), life: .25, max: .25, color: col, size: 3 });
  };
  if (p.beamVis) beam(p.beamVis.a, p.beamVis.len, p.beamVis.wd, w.gem || '#ff6ad8', .85);
  for (const B of G.pbeams || []) beam(B.a, B.cur || B.len, B.wd, B.col, Math.min(1, B.t * 3));
  if (p.whip) {
    const W = p.whip, k = W.t / W.dur;
    ctx.strokeStyle = `rgba(200,196,210,${1 - k})`; ctx.lineWidth = 3;
    if (W.circle) { ctx.beginPath(); ctx.arc(p.x, p.y, W.range * (.5 + .5 * k), 0, TAU); ctx.stroke(); }
    else {
      const len = W.range * Math.min(1, k * 2.2), ex = p.x + Math.cos(W.a) * len, ey = p.y + Math.sin(W.a) * len, off = Math.sin(k * 9) * 16;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(p.x + Math.cos(W.a) * len / 2 - Math.sin(W.a) * off, p.y + Math.sin(W.a) * len / 2 + Math.cos(W.a) * off, ex, ey); ctx.stroke();
      ctx.fillStyle = '#ece4cf'; ctx.fillRect(ex - 3, ey - 3, 6, 6);
    }
  }
  if (p.blockT > 0 && w.style === 'shield') {
    const span = 1 + .25 * espLv(w), al = Math.min(1, p.blockT * 4);
    ctx.fillStyle = `rgba(155,216,255,${.12 * al})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.arc(p.x, p.y, 34, p.aim - span, p.aim + span); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(190,228,255,${(.55 + .2 * Math.sin(G.time * 18)) * al})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, 34, p.aim - span, p.aim + span); ctx.stroke();
  }
  if (w.elBoost > 0 && w.el) {
    ctx.strokeStyle = ELEMS[w.el].c; ctx.globalAlpha = .4 + .2 * Math.sin(G.time * 12); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y, 30, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    if (Math.random() < .4) G.parts.push({ x: p.x + rand(-14, 14), y: p.y + rand(-10, 10), vx: 0, vy: -50, life: .4, max: .4, color: ELEMS[w.el].c, size: 3 });
  }
}

