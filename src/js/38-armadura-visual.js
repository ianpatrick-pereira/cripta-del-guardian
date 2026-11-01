// ================= Armadura: el personaje cambia de color y brilla según las estrellas =================
const ARMOR_PARTS = { knight: ['a', 's'], archer: ['t', 'g'], rogue: ['c', 'd'] };
const ARMOR_COLS = [['#7e7c8a', '#a6a4b0'], ['#3f8a4a', '#6cc46a'], ['#2f6ab0', '#5aa4e8'], ['#7a42b8', '#bb7cf0'], ['#c08020', '#ffc850']];
function buildArmorSprites() {
  for (const ch of Object.keys(ARMOR_PARTS)) {
    const [mapName, pal] = SPR_DEFS[ch], rows = MAPS[mapName], h = rows.length, wd = rows[0].length;
    for (let s = 1; s <= 5; s++) {
      const P = { ...pal }; ARMOR_PARTS[ch].forEach((k, i) => { P[k] = ARMOR_COLS[s - 1][i]; });
      const mk = white => {
        const c = document.createElement('canvas'); c.width = wd; c.height = h; const g = c.getContext('2d');
        for (let y = 0; y < h; y++) for (let x = 0; x < wd; x++) { const k = rows[y][x]; if (k === '.' || !P[k]) continue; g.fillStyle = white ? '#fff' : P[k]; g.fillRect(x, y, 1, 1); }
        return c;
      };
      SPR[ch + '_A' + s] = { n: mk(false), w: mk(true), wd, ht: h };
    }
  }
}
buildArmorSprites();
function armorAura(p) {
  const s = p.armor; if (!s || s < 2) return;
  const c = ARMOR_COLS[s - 1][1], t = G.time;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = (.18 + .08 * s) * (.8 + .2 * Math.sin(t * 3));
  const R = 16 + s * 3; ctx.drawImage(haloSpr(c), p.x - R, p.y - R - 2, R * 2, R * 2);
  ctx.restore();
  if (s >= 4 && Math.random() < (s === 5 ? .25 : .1)) G.parts.push({ x: p.x + rand(-12, 12), y: p.y + rand(-4, 12), vx: rand(-8, 8), vy: rand(-55, -30), life: .7, max: .7, color: s === 5 ? '#ffe8a0' : c, size: 2 });
}

// habilidades: Baluarte (cúpula dorada hexagonal) y Sombra (humo y ecos)
function drawAbilityFx(p) {
  const t = G.time;
  if (p.bulwarkT > 0) {
    const k = Math.min(1, p.bulwarkT / .3), R = 26;
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.fillStyle = `rgba(255,200,90,${.12 * k})`; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
    for (const [rr, sp, al] of [[R, .8, .85], [R - 6, -1.3, .5]]) {
      ctx.strokeStyle = `rgba(255,214,122,${al * k * (.75 + .25 * Math.sin(t * 10))})`; ctx.lineWidth = 2; ctx.beginPath();
      for (let j = 0; j <= 6; j++) { const a = t * sp + j * TAU / 6; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.stroke();
    }
    for (let j = 0; j < 6; j++) { const a = t * .8 + j * TAU / 6; ctx.fillStyle = `rgba(255,240,190,${k})`; ctx.fillRect(Math.cos(a) * R - 1.5, Math.sin(a) * R - 1.5, 3, 3); }
    ctx.restore();
  }
  if (p.shadowT > 0) {
    // ecos del personaje que quedan atrás y humo morado
    const H = p.ghosts || (p.ghosts = []);
    if (!H.length || t - H[H.length - 1].t > .06) { H.push({ x: p.x, y: p.y, t, f: p.flip }); if (H.length > 5) H.shift(); }
    for (const g of H) { const a = Math.max(0, .3 - (t - g.t) * .9); if (a > 0) drawSpr(p.spr, g.x, g.y - 2, 2, { flip: g.f, alpha: a, white: false }); }
    if (Math.random() < .5) G.parts.push({ x: p.x + rand(-10, 10), y: p.y + rand(-6, 12), vx: rand(-10, 10), vy: rand(-30, -10), life: .7, max: .7, color: Math.random() < .5 ? '#3a1a5a' : '#7a4ab0', size: 4 });
  } else if (p.ghosts && p.ghosts.length) p.ghosts.length = 0;
}

function drawWeapon(w, x, y, a, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(scale, scale);
  const c = w.tint || RARITY[w.rarity].c;
  const shape = w.shape || (w.type === 'bow' ? 'bow' : 'sword');
  const wood = '#6b4a2a';
  if (shape === 'sword' || shape === 'dagger' || shape === 'great') {
    const len = shape === 'great' ? 34 : shape === 'dagger' ? 18 : 26;
    ctx.fillStyle = '#5a3f2a'; ctx.fillRect(-2, -2, 9, 4);
    ctx.fillStyle = '#8c8a96'; ctx.fillRect(6, -5, 3, 10);
    ctx.fillStyle = c; ctx.fillRect(9, -2, len, 4); ctx.fillRect(9 + len, -1, 3, 2);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(9, -2, len, 1);
  } else if (shape === 'spear') {
    ctx.fillStyle = wood; ctx.fillRect(-6, -1.5, 40, 3);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(34, -4); ctx.lineTo(46, 0); ctx.lineTo(34, 4); ctx.fill();
  } else if (shape === 'hammer') {
    ctx.fillStyle = wood; ctx.fillRect(-2, -2, 24, 4);
    ctx.fillStyle = c; ctx.fillRect(20, -8, 10, 16);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(20, 4, 10, 4);
  } else if (shape === 'scythe') {
    ctx.fillStyle = wood; ctx.fillRect(-4, -2, 36, 4);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(30, -2); ctx.lineTo(24, -20); ctx.lineTo(44, -12); ctx.lineTo(34, -6); ctx.fill();
  } else if (shape === 'staff') {
    // bastón grande con gema elemental
    ctx.fillStyle = wood; ctx.fillRect(-10, -2, 46, 4);
    ctx.fillStyle = '#4a3624'; ctx.fillRect(30, -5, 4, 10);
    ctx.fillStyle = w.gem; ctx.beginPath(); ctx.moveTo(41, -9); ctx.lineTo(47, 0); ctx.lineTo(41, 9); ctx.lineTo(35, 0); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.fillRect(39, -5, 2, 4);
    ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(41, 0, 11, 0, TAU); ctx.stroke();
    if (w.el) { ctx.strokeStyle = ELEMS[w.el].c; ctx.globalAlpha = .5 + .3 * Math.sin(G ? G.time * 6 : 0); ctx.beginPath(); ctx.arc(41, 0, 14, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  } else if (shape === 'boomer') {
    ctx.fillStyle = '#7a5434'; ctx.beginPath(); ctx.moveTo(2, -13); ctx.lineTo(16, 0); ctx.lineTo(2, 13); ctx.lineTo(7, 0); ctx.fill();
    ctx.fillStyle = c; ctx.fillRect(12, -2, 4, 4);
  } else if (shape === 'whip') {
    ctx.fillStyle = wood; ctx.fillRect(-2, -2, 12, 4);
    ctx.strokeStyle = c; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(16, 0, 4 + i * 2.5, -2.2 + i, 2.2 + i); ctx.stroke(); }
  } else if (shape === 'shield') {
    // escudo visto desde arriba: placa ovalada delante del personaje con tachón y púas hacia fuera
    ctx.fillStyle = '#d8e0ff';
    for (const [sy, bx] of [[-9, 12], [0, 14], [9, 12]]) { ctx.beginPath(); ctx.moveTo(bx, sy - 3); ctx.lineTo(bx + (sy ? 8 : 10), sy); ctx.lineTo(bx, sy + 3); ctx.fill(); }
    ctx.fillStyle = '#2e2a3c'; ctx.beginPath(); ctx.ellipse(8, 0, 7, 17, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(8.5, 0, 5, 14.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(6.5, 0, 2.5, 12, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(8.5, 0, 5, 14.5, 0, -1.3, 1.3); ctx.stroke();
    ctx.fillStyle = '#c9c4d4'; ctx.beginPath(); ctx.arc(10, 0, 3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(10, -1.5, 1.5, 1.5);
  } else if (shape === 'musket') {
    ctx.fillStyle = '#5a3f2a'; ctx.fillRect(-6, -3, 16, 6); ctx.fillRect(-8, -1, 4, 6);
    ctx.fillStyle = '#8c8a96'; ctx.fillRect(10, -2, 30, 3);
    ctx.fillStyle = c; ctx.fillRect(8, -3, 3, 6); ctx.fillRect(38, -3, 2, 2);
  } else if (shape === 'sickle') {
    ctx.fillStyle = wood; ctx.fillRect(-2, -2, 14, 4);
    ctx.strokeStyle = c; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(14, -6, 10, -1.6, 1.2); ctx.stroke();
  } else if (shape === 'book') {
    ctx.fillStyle = '#3a2a24'; ctx.fillRect(2, -9, 18, 18);
    ctx.fillStyle = c; ctx.fillRect(4, -7, 14, 14);
    ctx.fillStyle = '#ece4cf'; ctx.fillRect(9, -5, 4, 10); ctx.fillRect(7, -3, 8, 2); ctx.fillRect(7, 2, 8, 2);
  } else if (shape === 'rod') {
    ctx.fillStyle = '#5a5468'; ctx.fillRect(-6, -2, 34, 4);
    ctx.fillStyle = w.gem + '55'; ctx.beginPath(); ctx.arc(32, 0, 10, 0, TAU); ctx.fill();
    ctx.fillStyle = w.gem; ctx.beginPath(); ctx.arc(32, 0, 5, 0, TAU); ctx.fill();
    ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(32, 0, 8, 0, TAU); ctx.stroke();
  } else if (shape === 'kunai') {
    ctx.fillStyle = '#3a3348'; ctx.fillRect(-2, -1.5, 10, 3); ctx.strokeStyle = '#8c8a96'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-4, 0, 2.5, 0, TAU); ctx.stroke();
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(8, -3.5); ctx.lineTo(20, 0); ctx.lineTo(8, 3.5); ctx.fill();
  } else if (shape === 'katar') {
    ctx.fillStyle = '#5a3f2a'; ctx.fillRect(-2, -6, 3, 12); ctx.fillStyle = '#8c8a96'; ctx.fillRect(-2, -6, 10, 2); ctx.fillRect(-2, 4, 10, 2);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(8, -5); ctx.lineTo(26, 0); ctx.lineTo(8, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(8, -1, 14, 1);
  } else if (shape === 'twin') {
    for (const oy of [-5, 5]) { ctx.fillStyle = '#5a3f2a'; ctx.fillRect(-2, oy - 1.5, 7, 3); ctx.fillStyle = c; ctx.fillRect(5, oy - 1.5, 15, 3); ctx.fillRect(20, oy - 1, 2, 2); }
  } else if (shape === 'claws') {
    ctx.fillStyle = '#3a3348'; ctx.fillRect(-2, -6, 8, 12);
    ctx.strokeStyle = c; ctx.lineWidth = 2; for (const oy of [-5, 0, 5]) { ctx.beginPath(); ctx.moveTo(6, oy); ctx.quadraticCurveTo(14, oy, 20, oy + 3); ctx.stroke(); }
  } else if (shape === 'shuriken') {
    ctx.fillStyle = c; ctx.save(); ctx.translate(10, 0); ctx.rotate(G ? G.time * 3 : 0);
    for (let i = 0; i < 4; i++) { ctx.rotate(TAU / 4); ctx.beginPath(); ctx.moveTo(-2.5, 0); ctx.lineTo(0, -10); ctx.lineTo(2.5, 0); ctx.fill(); }
    ctx.fillStyle = '#2e2a3c'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, TAU); ctx.fill(); ctx.restore();
  } else if (shape === 'blowgun') {
    ctx.fillStyle = '#7a6a3a'; ctx.fillRect(-4, -2, 34, 4); ctx.fillStyle = 'rgba(0,0,0,.3)'; for (let i = 0; i < 4; i++) ctx.fillRect(2 + i * 7, -2, 1.5, 4);
    ctx.fillStyle = c; ctx.fillRect(28, -2.5, 3, 5);
  } else if (shape === 'sling') {
    ctx.fillStyle = wood; ctx.fillRect(-2, -1.5, 12, 3); ctx.fillRect(9, -7, 3, 14);
    ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(11, -7); ctx.lineTo(5, 0); ctx.lineTo(11, 7); ctx.stroke();
  } else if (shape === 'xbow') {
    ctx.fillStyle = '#5a3f2a'; ctx.fillRect(-2, -3, 22, 6);
    ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(16, -13); ctx.quadraticCurveTo(22, 0, 16, 13); ctx.stroke();
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(16, -13); ctx.lineTo(8, 0); ctx.lineTo(16, 13); ctx.stroke();
  } else {
    ctx.strokeStyle = w.fx === 'slow' ? '#9bd8ff' : w.fx === 'explode' ? '#ff8a3a' : c; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(2, 0, 14, -1.15, 1.15); ctx.stroke();
    ctx.strokeStyle = 'rgba(236,228,207,.8)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(2 + Math.cos(-1.15) * 14, Math.sin(-1.15) * 14); ctx.lineTo(2 + Math.cos(1.15) * 14, Math.sin(1.15) * 14); ctx.stroke();
  }
  weaponDeco(w, x, y, a, scale, shape);
  ctx.restore();
}

function drawPlayer(p) {
  drawShadow(p.x, p.y + 4, p.r);
  const blink = p.inv > 0 && p.dashT <= 0 && p.bulwarkT <= 0 && Math.floor(G.time * 20) % 2 === 0;
  const bob = Math.abs(Math.sin(p.walk)) * -2;
  const w = p.slots[p.cur];
  const back = Math.sin(p.aim) < -.3;
  const drawW = () => {
    if (w.style === 'shield') {
      const push = p.swing ? Math.sin(Math.min(1, p.swing.t / p.swing.dur) * Math.PI) * 12 : 0, a = p.swing ? p.swing.a : p.aim;
      if (p.swing) { ctx.strokeStyle = `rgba(216,208,184,${.5 * (1 - p.swing.t / p.swing.dur)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, p.swing.range * .9, a - .7, a + .7); ctx.stroke(); }
      drawWeapon(w, p.x + Math.cos(a) * (4 + push), p.y + 2 + bob + Math.sin(a) * (4 + push), a);
      return;
    }
    if (w.type === 'melee' && p.swing) {
      const s = p.swing, prog = s.t / s.dur;
      if (s.spin) {
        const sc = w.el ? ELEMS[w.el].c : STAR_COL[(w.stars || 1) - 1];
        ctx.strokeStyle = hexA(sc, .45 * (1 - prog)); ctx.lineWidth = 14;
        ctx.beginPath(); ctx.arc(p.x, p.y, s.range * .8, 0, TAU); ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${.6 * (1 - prog)})`; ctx.lineWidth = 2; ctx.stroke();
        // ecos del arma girando
        for (let j = 1; j <= 2; j++) { ctx.globalAlpha = .25 / j * (1 - prog); drawWeapon(w, p.x, p.y + bob, s.a + (prog - j * .06) * TAU * 1.5); }
        ctx.globalAlpha = 1;
        drawWeapon(w, p.x, p.y + bob, s.a + prog * TAU * 1.5);
      } else {
        const from = s.a - s.dir * s.arc / 2, ang = from + s.dir * s.arc * prog;
        swingTrail(p, w, s, prog);
        drawWeapon(w, p.x, p.y + bob, ang);
      }
    } else drawWeapon(w, p.x + Math.cos(p.aim) * 6, p.y + 2 + bob + Math.sin(p.aim) * 6, w.type === 'melee' ? p.aim + (p.flip ? .5 : -.5) : p.aim);
  };
  WREACT = 1 + (p.swing ? 1.5 : 0) + (p.cd > 0 ? .5 : 0) + (p.charge > 0 ? 1 : 0);
  armorAura(p);
  const spr = p.armor && SPR[p.spr + '_A' + p.armor] ? p.spr + '_A' + p.armor : p.spr;
  if (back) drawW();
  if (!blink) drawSpr(spr, p.x, p.y - 2 + bob, 2, { flip: p.flip, alpha: p.shadowT > 0 || p.veilT > 0 ? .35 : 1 });
  if (!back) drawW();
  WREACT = 1;
  drawAbilityFx(p);
  if (p.rageT > 0) { ctx.strokeStyle = `rgba(212,71,75,${.45 + .3 * Math.sin(G.time * 16)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 20, 0, TAU); ctx.stroke(); }
  if (p.charge > 0) {
    const k = Math.min(1, p.charge / .55);
    ctx.strokeStyle = k >= 1 ? '#ffd27a' : 'rgba(236,228,207,.6)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, 26, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke();
    // carga completa: chispas que se juntan hacia el personaje
    if (k >= 1 && Math.random() < .5) { const a = rand(0, TAU), w0 = p.slots[p.cur]; G.parts.push({ x: p.x + Math.cos(a) * 34, y: p.y + Math.sin(a) * 34, vx: -Math.cos(a) * 130, vy: -Math.sin(a) * 130, life: .25, max: .25, color: w0.el ? ELEMS[w0.el].c : '#ffd27a', size: 2 }); }
  }
}

const bossCv = document.createElement('canvas'); bossCv.width = bossCv.height = 64;
const bctx = bossCv.getContext('2d');
function drawBoss(e) {
  const ph2 = e.phase >= 2, white = e.flash > 0;
  const mv = BOSS_MOVES[e.st]; if (mv && mv.aviso) mv.aviso(e);
  let lift = 0;
  if (e.air && e.tgt) {
    const k = clamp(e.timer, 0, 1);
    lift = Math.sin(k * Math.PI) * 140;
    ctx.fillStyle = 'rgba(212,71,75,.25)'; ctx.beginPath(); ctx.arc(e.tgt.x, e.tgt.y, e.r * (.6 + k * .6), 0, TAU); ctx.fill();
    ctx.strokeStyle = '#d4474b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.tgt.x, e.tgt.y, e.r * 1.2, 0, TAU); ctx.stroke();
  }
  drawShadow(e.x, e.y, e.r);
  // se dibuja a media resolución y se escala para que se vea pixelado
  const g = bctx; g.clearRect(0, 0, 64, 64);
  g.save(); g.translate(32, 32); g.scale(.5, .5);
  const fill = c => white ? '#ffffff' : (e.invuln && Math.floor(G.time * 12) % 2 ? '#d4474b' : c);
  const BD = BOSSES[e.kind], look = BD.look || e.kind;
  BOSS_DEFS[look].aspecto(g, e, fill, ph2);
  g.restore();
  if (BD.tint && !white) { g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = .5; g.fillStyle = BD.tint; g.fillRect(0, 0, 64, 64); g.restore(); }
  const sz = 128 * (BD.scale || 1);
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bossCv, Math.round(e.x - sz / 2), Math.round(e.y - sz / 2 - lift), sz, sz);
  ctx.restore();
}

function drawSub(e) {
  const p = G.player, white = e.flash > 0;
  const mv = SUB_MOVES[e.st], sd = SUB_DEFS[e.sk] || {}; if (mv && mv.aviso) mv.aviso(e);
  drawShadow(e.x, e.y, e.r);
  const lift = e.lift || 0;
  ctx.globalAlpha = .16 + .08 * Math.sin(G.time * 5) + (e.phase === 2 ? .1 : 0); ctx.fillStyle = e.tint;
  ctx.beginPath(); ctx.arc(e.x, e.y - lift, e.r + 12, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  let sx = 1, sy = 1;
  if (sd.forma) { const f = { sx, sy }; sd.forma(e, f); sx = f.sx; sy = f.sy; }
  if (e.tele > 0 && Math.floor(G.time * 16) % 2 === 0) { sx *= 1.06; sy *= 1.06; }
  drawSpr(e.spr, e.x, e.y - lift, e.s, { flip: Math.cos(angTo(e, p)) < 0, white, sx, sy });
  if (sd.encima) sd.encima(e, lift, p);
  if (e.cheat) drawCheatForm(e, lift);
  // corona: distingue al subjefe
  const cy = e.y - lift - e.r - 14;
  ctx.fillStyle = '#e3a24a'; ctx.fillRect(e.x - 9, cy, 18, 4);
  for (const dx of [-9, -2, 5]) ctx.fillRect(e.x + dx, cy - 5, 4, 5);
}
function drawEnemy(e) {
  if (e.isBoss) { drawBoss(e); return; }
  if (e.elem) { drawElemental(e); return; }
  if (e.isSub) { drawSub(e); return; }
  drawShadow(e.x, e.y, e.r);
  if (e.mirror) { ctx.fillStyle = `rgba(199,125,255,${.16 + .08 * Math.sin(G.time * 5)})`; ctx.beginPath(); ctx.arc(e.x, e.y - 6, e.r + 12, 0, TAU); ctx.fill(); }
  const p = G.player, la = angTo(e, p), white = e.flash > 0;
  // cada enemigo ajusta su forma y dibuja sus detalles en su archivo de 01b-enemigos/
  const ed = ENEMIES[e.type] || {}, f = { sx: 1, sy: 1, alpha: 1, oy: 0 };
  if (ed.forma) ed.forma(e, f);
  if (ed.debajo) ed.debajo(e, la);
  if (e.shield > 0) { ctx.strokeStyle = `rgba(155,216,255,${.5 + .2 * Math.sin(G.time * 8)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 6, 0, TAU); ctx.stroke(); }
  if (e.elite) {
    ctx.fillStyle = `rgba(255,210,122,${.18 + .08 * Math.sin(G.time * 6)})`;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 8, 0, TAU); ctx.fill();
  }
  if (e.el) { ctx.fillStyle = ELEMS[e.el].c + '44'; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 7, 0, TAU); ctx.fill(); }
  if (e.poison > 0) { ctx.fillStyle = 'rgba(155,224,90,.25)'; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 3, 0, TAU); ctx.fill(); }
  drawSpr(e.spr, e.x, e.y + f.oy, e.s, { flip: Math.cos(la) < 0, white, sx: f.sx, sy: f.sy, alpha: f.alpha });
  if (ed.encima) ed.encima(e, la, white);
  if (e.hp < e.max) {
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(e.x - 14, e.y - e.r - 12, 28, 4);
    ctx.fillStyle = e.elite ? '#ffd27a' : '#d4474b'; ctx.fillRect(e.x - 14, e.y - e.r - 12, 28 * Math.max(0, e.hp / e.max), 4);
  }
  if (e.shield > 0) { ctx.fillStyle = '#9bd8ff'; ctx.fillRect(e.x - 14, e.y - e.r - 16, 28 * Math.min(1, e.shield / e.max), 3); }
}

function drawKey(x, y) {
  ctx.fillStyle = '#e3a24a';
  ctx.fillRect(x - 8, y - 4, 8, 8); ctx.fillStyle = '#1b1208'; ctx.fillRect(x - 6, y - 2, 4, 4);
  ctx.fillStyle = '#e3a24a'; ctx.fillRect(x, y - 1, 10, 3); ctx.fillRect(x + 6, y + 2, 2, 3); ctx.fillRect(x + 9, y + 2, 2, 4);
}
function drawGem(x, y, s = 1) {
  ctx.fillStyle = '#c77dff'; ctx.beginPath(); ctx.moveTo(x, y - 7 * s); ctx.lineTo(x + 5 * s, y); ctx.lineTo(x, y + 7 * s); ctx.lineTo(x - 5 * s, y); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(x - 1 * s, y - 4 * s, 2 * s, 3 * s);
}
function drawRelicIcon(id, x, y, s = 1) {
  const R = RELICS[id]; if (!R) return;
  ctx.fillStyle = 'rgba(12,11,17,.85)'; ctx.fillRect(x - 9 * s, y - 9 * s, 18 * s, 18 * s);
  ctx.strokeStyle = R.c; ctx.lineWidth = 2; ctx.strokeRect(x - 9 * s, y - 9 * s, 18 * s, 18 * s);
  ctx.fillStyle = R.c; ctx.font = `600 ${Math.round(11 * s)}px "Chakra Petch", ui-monospace, monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(R.n[0], x, y + 1);
}
function drawPickup(it) {
  const b = Math.sin((it.bob || 0) * 3) * 3;
  if (ROOM_OBJ[it.kind]) { ROOM_OBJ[it.kind].dibujar(it, b); return; }   // salas de 01d-salas/
  switch (it.kind) {
    case 'coin': { const s = Math.abs(Math.cos(it.t * 5)); ctx.fillStyle = '#f0c040'; ctx.fillRect(it.x - 4 * s, it.y - 5, Math.max(1, 8 * s), 10); ctx.fillStyle = '#b08020'; ctx.fillRect(it.x - 1, it.y - 3, 2, 6); break; }
    case 'gem': drawGem(it.x, it.y + Math.sin(G.time * 4) * 2); break;
    case 'energy': ctx.fillStyle = '#5aa4e8'; ctx.beginPath(); ctx.arc(it.x, it.y, 5, 0, TAU); ctx.fill(); ctx.fillStyle = '#d8ecff'; ctx.fillRect(it.x - 1, it.y - 2, 2, 4); break;
    case 'potion': drawShadow(it.x, it.y, 7); drawSpr('potion', it.x, it.y, 2); break;
    case 'key': drawKey(it.x, it.y + Math.sin(G.time * 4) * 2); break;
    case 'armor': {
      const c = RARITY['s' + it.stars].c;
      const gr = ctx.createRadialGradient(it.x, it.y, 2, it.x, it.y, 26); gr.addColorStop(0, c + '66'); gr.addColorStop(1, c + '00');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(it.x, it.y, 26, 0, TAU); ctx.fill();
      drawArmor(it.x, it.y + b, it.stars);
      ctx.font = '600 10px "Chakra Petch", ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = c; ctx.fillText('★'.repeat(it.stars), it.x, it.y + 20);
      break;
    }
    case 'weapon': {
      const c = RARITY[it.weapon.rarity].c;
      const gr = ctx.createRadialGradient(it.x, it.y, 2, it.x, it.y, 26); gr.addColorStop(0, c + '66'); gr.addColorStop(1, c + '00');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(it.x, it.y, 26, 0, TAU); ctx.fill();
      drawWeapon(it.weapon, it.x - 10, it.y + b, -.6);
      ctx.font = '600 10px "Chakra Petch", ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = c; ctx.fillText('★'.repeat(it.weapon.stars || 1), it.x, it.y + 20);
      break;
    }
    case 'chest': {
      drawShadow(it.x, it.y, 16);
      drawSpr(it.gold ? 'gchest' : 'chest', it.x, it.y, 2.4);
      if (it.opened) { ctx.fillStyle = '#120a08'; ctx.fillRect(it.x - 14, it.y - 10, 28, 6); }
      else if (it.gold) { ctx.fillStyle = '#1b1208'; ctx.fillRect(it.x - 2, it.y - 1, 4, 5); }
      break;
    }
    case 'altar': case 'relic': case 'shop': {
      ctx.fillStyle = '#3a3448'; ctx.fillRect(it.x - 14, it.y + 6, 28, 12);
      ctx.fillStyle = '#4e4660'; ctx.fillRect(it.x - 16, it.y + 4, 32, 4);
      if (it.kind === 'altar') {
        if (!it.used) { const gr = ctx.createRadialGradient(it.x, it.y - 6, 2, it.x, it.y - 6, 30); gr.addColorStop(0, 'rgba(199,125,255,.6)'); gr.addColorStop(1, 'rgba(199,125,255,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(it.x, it.y - 6, 30, 0, TAU); ctx.fill(); drawGem(it.x, it.y - 8 + b, 1.6); }
      } else if (it.kind === 'relic') drawRelicIcon(it.relic, it.x, it.y - 10 + b);
      else {
        const s = it.item;
        if (s.t === 'potion') drawSpr('potion', it.x, it.y - 8 + b, 2);
        if (s.t === 'key') drawKey(it.x, it.y - 8 + b);
        if (s.t === 'relic') drawRelicIcon(s.relic, it.x, it.y - 10 + b);
        if (s.t === 'weapon') { drawWeapon(s.weapon, it.x - 10, it.y - 8 + b, -.6, .9); ctx.font = '600 9px "Chakra Petch", ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillStyle = RARITY[s.weapon.rarity].c; ctx.fillText('★'.repeat(s.weapon.stars), it.x, it.y + 18); }
        ctx.font = '600 11px "Chakra Petch", ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = G.coins >= s.price ? '#f0c040' : '#9d95ab'; ctx.fillText(s.price + ' mon.', it.x, it.y + 30);
      }
      break;
    }
    case 'totem': drawTotem(it); break;
    case 'crystal': { const c = ELEMS[it.el].c, g = ctx.createRadialGradient(it.x, it.y, 2, it.x, it.y, 18); g.addColorStop(0, c + '99'); g.addColorStop(1, c + '00'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(it.x, it.y, 18, 0, TAU); ctx.fill(); drawCrystal(it.x, it.y + b, c); break; }
    case 'note': {
      drawShadow(it.x, it.y + 4, 8);
      ctx.save(); ctx.translate(it.x, it.y + b); ctx.rotate(-.15);
      ctx.fillStyle = '#d8c8a8'; ctx.fillRect(-8, -10, 16, 20); ctx.fillStyle = '#8a7a5a';
      for (let i = 0; i < 4; i++) ctx.fillRect(-5, -6 + i * 4, 10 - (i === 3 ? 4 : 0), 1);
      ctx.restore();
      if (!SAVE.notes[it.id]) { ctx.fillStyle = `rgba(216,200,168,${.25 + .15 * Math.sin(G.time * 4)})`; ctx.beginPath(); ctx.arc(it.x, it.y, 18, 0, TAU); ctx.fill(); }
      break;
    }
    case 'exit': {
      const gr = ctx.createRadialGradient(it.x, it.y, 2, it.x, it.y, 40); gr.addColorStop(0, 'rgba(255,226,140,.65)'); gr.addColorStop(1, 'rgba(255,226,140,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(it.x, it.y, 40, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffe6a0'; ctx.fillRect(it.x - 12, it.y - 26, 24, 40); ctx.fillStyle = '#e3a24a'; ctx.fillRect(it.x - 14, it.y - 28, 28, 4);
      break;
    }
    case 'forge': {
      const gr = ctx.createRadialGradient(it.x, it.y, 2, it.x, it.y, 34); gr.addColorStop(0, `rgba(255,138,58,${.35 + .1 * Math.sin(G.time * 6)})`); gr.addColorStop(1, 'rgba(255,138,58,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(it.x, it.y, 34, 0, TAU); ctx.fill();
      drawShadow(it.x, it.y + 4, 16);
      ctx.fillStyle = '#4a4458'; ctx.fillRect(it.x - 8, it.y - 2, 16, 10); ctx.fillRect(it.x - 12, it.y + 8, 24, 5);
      ctx.fillStyle = '#6a6480'; ctx.fillRect(it.x - 18, it.y - 10, 32, 8); ctx.fillRect(it.x + 14, it.y - 8, 8, 4);
      ctx.fillStyle = '#ff8a3a'; if (Math.random() < .3) G.parts.push({ x: it.x + rand(-8, 8), y: it.y - 12, vx: rand(-40, 40), vy: rand(-90, -40), life: .4, max: .4, color: '#ffb03a', size: 2 });
      break;
    }
    case 'portal': {
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `rgba(199,125,255,${.7 - i * .15})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(it.x, it.y, 22 + i * 6 + Math.sin(G.time * 4 + i) * 2, 30 + i * 6, 0, 0, TAU); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(30,10,50,.85)'; ctx.beginPath(); ctx.ellipse(it.x, it.y, 20, 28, 0, 0, TAU); ctx.fill();
      break;
    }
  }
}
function drawProp(o) {
  if (o.kind === 'merchant') { drawShadow(o.x, o.y, 11); drawSpr('merchant', o.x, o.y - 2, 2, { flip: G.player.x < o.x }); return; }
  drawShadow(o.x, o.y + 2, 12);
  drawSpr(o.kind, o.x, o.y, o.kind === 'barrel' ? 2.2 : 2, { white: o.flash > 0 });
}

function drawMinimap(w) {
  const cw = 15, ch = 11, gap = 5, pad = 10;
  const known = r => r.type === 'secret' ? r.visited : (r.visited || r.links.some(n => n.visited && n.type !== 'secret'));
  const size = GRID * (cw + gap);
  const ox = w - size - 12, oy = 12;
  ctx.fillStyle = 'rgba(12,11,17,.72)'; ctx.fillRect(ox - pad, oy - pad, GRID * (cw + gap) - gap + pad * 2, GRID * (ch + gap) - gap + pad * 2);
  const pos = r => [ox + r.gx * (cw + gap), oy + r.gy * (ch + gap)];
  ctx.strokeStyle = '#4a4458'; ctx.lineWidth = 2;
  for (const r of G.rooms) if (r.visited) for (const n of r.links) {
    if (n.type === 'secret' && !n.visited) continue;
    const [ax, ay] = pos(r), [bx, by] = pos(n);
    ctx.beginPath(); ctx.moveTo(ax + cw / 2, ay + ch / 2); ctx.lineTo(bx + cw / 2, by + ch / 2); ctx.stroke();
  }
  for (const r of G.rooms) {
    if (!known(r)) continue;
    const [x, y] = pos(r);
    ctx.fillStyle = r === G.cur ? '#e3a24a' : r.visited ? '#6b6480' : '#2a2638';
    ctx.fillRect(x, y, cw, ch);
    if (!r.visited) { ctx.strokeStyle = '#4a4458'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, cw - 1, ch - 1); }
    const dot = r.ev ? '#ff8a3a' : { boss: '#d4474b', treasure: '#c77dff', shop: '#f0c040', secret: '#c77dff' }[r.type];
    if (dot) { ctx.fillStyle = dot; ctx.fillRect(x + cw / 2 - 2, y + ch / 2 - 2, 4, 4); }
  }
  return oy + GRID * (ch + gap) + pad;
}

function hudText(txt, x, y, size = 13, color = '#ece4cf', align = 'left', weight = 600, font = 'Chakra Petch') {
  ctx.font = `${weight} ${size}px "${font}", ui-monospace, monospace`;
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillText(txt, x + 1, y + 1);
  ctx.fillStyle = color; ctx.fillText(txt, x, y);
}

// barra de armas y habilidad (abajo). En un celular en vertical va a lo ancho y en formato compacto.
function drawWeaponBar(p, w, h) {
  const vert = hudVertical(w, h), H = vert ? 46 : 54;
  const avail = vert ? w - 20 : touch.on ? w - (h <= 420 ? 230 : 280) : w - 20;   // deja sitio a los botones (más chicos si la pantalla es bajita)
  const sw = vert ? (avail - 16) / 3 : clamp((avail - 16) / 3, 96, 186), sy = h - H - 10;
  const small = sw < 140;
  for (let i = 0; i < 2; i++) {
    const wpn = p.slots[i], x = 10 + i * (sw + 8), act = i === p.cur;
    ctx.fillStyle = act ? 'rgba(42,36,56,.92)' : 'rgba(12,11,17,.72)'; ctx.fillRect(x, sy, sw, H);
    ctx.strokeStyle = act ? RARITY[wpn.rarity].c : '#2e2a3c'; ctx.lineWidth = act ? 2 : 1; ctx.strokeRect(x + .5, sy + .5, sw - 1, H - 1);
    const stars = '★'.repeat(wpn.stars || 1) + (wpn.up && (wpn.up.dmg + wpn.up.rate + wpn.up.chg + wpn.up.en) ? ' +' + (wpn.up.dmg + wpn.up.rate + wpn.up.chg + wpn.up.en) : '');
    const cost = `${wpn.dmg} daño · ${wpn.en ? wpn.en + ' en.' : 'gratis'}`, costCol = p.en < (wpn.en || 0) ? '#d4474b' : '#9d95ab';
    if (vert) {
      // nombre arriba; abajo, daño y estrellas a la izquierda y el dibujo del arma a la derecha
      const elTag = wpn.el && wpn.elOn && act;
      fitText(wpn.name, x + 7, sy + 11, sw - (elTag ? 30 : 14), 11, RARITY[wpn.rarity].c);
      if (elTag) { const ready = p.elCd <= 0; hudText(ready ? '◆' : Math.ceil(p.elCd) + 's', x + sw - 6, sy + 11, 9, ready ? ELEMS[wpn.el].c : '#9d95ab', 'right', 600); }
      drawWeapon(wpn, x + sw - 20, sy + 31, -.5, .55);
      fitText(cost, x + 7, sy + 26, sw - 40, 9, costCol, 'left', 400);
      hudText(stars, x + 7, sy + 38, 8, RARITY[wpn.rarity].c, 'left', 600);
      continue;
    }
    drawWeapon(wpn, x + 12, sy + 27, -.5, .9);
    const right = touch.on ? 8 : 20;
    fitText(wpn.name, x + 46, sy + 18, sw - 46 - right, small ? 11 : 12, RARITY[wpn.rarity].c);
    fitText(cost + (sw >= 150 ? ` · carga ${wpn.chgEn}` : ''), x + 46, sy + 36, sw - 54, 10, costCol, 'left', 400);
    if (!touch.on) hudText(String(i + 1), x + sw - 10, sy + 12, 10, '#6b6480', 'right');
    hudText(stars, x + 46, sy + 48, 9, RARITY[wpn.rarity].c, 'left', 600);
    if (wpn.el) {
      const E = ELEMS[wpn.el], ready = p.elCd <= 0;
      const txt = wpn.elOn ? `${touch.on || !act ? '' : 'R · '}${elAbName(wpn)} ${act && !ready ? Math.ceil(p.elCd) + ' s' : 'Nv' + wpn.elLv}` : `${E.n} ${wpn.elC}/3`;
      hudText(txt, x + sw - 8, sy + 48, 9, wpn.elOn && act && ready ? E.c : '#9d95ab', 'right', 600);
    }
  }
  const ch = p.spec ? SPECS[p.spec] : CHARS[p.char], ax = 10 + 2 * (sw + 8);
  ctx.fillStyle = 'rgba(12,11,17,.72)'; ctx.fillRect(ax, sy, sw, H);
  const ready = p.abilCd <= 0;
  if (!ready) { ctx.fillStyle = 'rgba(199,125,255,.18)'; ctx.fillRect(ax, sy, sw * (1 - p.abilCd / ch.cd), H); }
  ctx.strokeStyle = ready ? '#c77dff' : '#2e2a3c'; ctx.lineWidth = ready ? 2 : 1; ctx.strokeRect(ax + .5, sy + .5, sw - 1, H - 1);
  const SL = subLv(p);
  const ty = vert ? [11, 26, 38] : [18, 36, 48], pad = vert ? 7 : 10;
  fitText(ch.abil + (SL ? ` Nv${SL}` : ''), ax + pad, sy + ty[0], sw - pad * 2, vert ? 11 : small ? 11 : 12, ready ? '#c77dff' : '#9d95ab');
  hudText((ready ? (touch.on ? 'Lista' : 'F · Lista') : `${Math.ceil(p.abilCd)} s`), ax + pad, sy + ty[1], vert ? 9 : 10, '#9d95ab', 'left', 400);
  const cr = classRes(p);
  if (cr) {
    if (cr.k !== undefined) { ctx.fillStyle = '#2e2a3c'; ctx.fillRect(ax + pad, sy + ty[2] - 4, sw - pad * 2, 4); ctx.fillStyle = cr.c; ctx.fillRect(ax + pad, sy + ty[2] - 4, (sw - pad * 2) * cr.k, 4); }
    else fitText(cr.t, ax + sw - pad + 2, sy + ty[2], sw - pad * 2, vert ? 8 : 9, cr.c, 'right', 600);
  }
  return sy;
}

// texto que no se sale de su caja: achica la letra (hasta 8 px) y, si aún no cabe, lo corta con «…»
function fitText(txt, x, y, maxW, size, color, align = 'left', weight = 600) {
  let s = size;
  const f = () => { ctx.font = `${weight} ${s}px "Chakra Petch", ui-monospace, monospace`; return ctx.measureText(txt).width; };
  while (s > 8 && f() > maxW) s--;
  if (f() > maxW) { while (txt.length > 1 && ctx.measureText(txt + '…').width > maxW) txt = txt.slice(0, -1); txt += '…'; }
  hudText(txt, x, y, s, color, align, weight);
}
// pantalla de celular en vertical: la barra de armas va abajo a lo ancho y los botones táctiles suben encima
const hudVertical = (w, h) => h > w && w < 600;

function drawHUD(w, h) {
  const p = G.player;
  ctx.fillStyle = 'rgba(12,11,17,.72)'; ctx.fillRect(10, 10, 200, 108);
  const bar = (y, val, max, col, label, seg) => {
    ctx.fillStyle = '#2a2638'; ctx.fillRect(52, y, 148, 11);
    ctx.fillStyle = col; ctx.fillRect(52, y, 148 * clamp(val / max, 0, 1), 11);
    if (seg && max <= 60) for (let i = 1; i < max; i++) { ctx.fillStyle = 'rgba(12,11,17,.8)'; ctx.fillRect(52 + 148 * i / max - 1, y, 2, 11); }
    hudText(label, 18, y + 6, 10, '#9d95ab');
    hudText(`${Math.floor(val)}/${max}`, 196, y + 6, 10, '#ece4cf', 'right');
  };
  bar(18, p.hp, p.maxHp, '#d4474b', 'VIDA', true);
  bar(34, p.sh, p.maxSh + rc('escudo') + armorSh(p), '#8fb7d9', 'ESC.', true);
  bar(50, p.en, maxEnergy(p), '#5aa4e8', 'ENER.', false);
  {
    // barra de subclase: gris hasta desbloquearla, azul cuando crece con las bajas
    const SL = subLv(p), S = p.spec ? SPECS[p.spec] : null;
    let k, txt, col;
    if (!S) { k = Math.min(1, (p.preK || 0) / SUB_UNLOCK); txt = `${p.preK || 0}/${SUB_UNLOCK}`; col = '#6b6480'; }
    else if (SL >= 5) { k = 1; txt = 'MÁX'; col = '#4a7dff'; }
    else { const lo = SL > 1 ? SUB_T[SL - 2] : 0, hi = SUB_T[SL - 1]; k = (p.subK - lo) / (hi - lo); txt = `${p.subK}/${hi}`; col = '#4a7dff'; }
    ctx.fillStyle = '#2a2638'; ctx.fillRect(52, 66, 148, 11);
    ctx.fillStyle = col; ctx.fillRect(52, 66, 148 * clamp(k, 0, 1), 11);
    if (S) { ctx.fillStyle = `rgba(160,190,255,${.25 + .15 * Math.sin(G.time * 4)})`; ctx.fillRect(52, 66, 148 * clamp(k, 0, 1), 3); }
    hudText(S ? `Nv${SL}` : 'SUBC.', 18, 72, 10, S ? '#8fb0ff' : '#9d95ab');
    hudText(txt, 196, 72, 10, '#ece4cf', 'right');
  }
  ctx.fillStyle = '#f0c040'; ctx.fillRect(18, 91, 8, 10); hudText(String(G.coins), 30, 96, 13);
  drawKey(80, 96); hudText(String(G.keys), 94, 96, 13);
  drawGem(132, 96); hudText(String(G.gems), 142, 96, 13, '#c77dff');
  hudText(`${G.kills} bajas`, 196, 96, 10, '#9d95ab', 'right');
  if (p.armor) { drawArmor(176, 114, p.armor, .5); hudText('★'.repeat(p.armor), 166, 114, 9, RARITY['s' + p.armor].c, 'right'); }
  { let cx = 18; for (const el of EL_ORDER) if (G.crystals[el]) { drawCrystal(cx + 4, 114, ELEMS[el].c, .8); hudText(String(G.crystals[el]), cx + 12, 114, 11, ELEMS[el].c); cx += 34; } }
  const rel = p.relics;
  for (let i = 0; i < rel.length; i++) drawRelicIcon(rel[i], 20 + (i % 9) * 21, 132 + Math.floor(i / 9) * 21, .95);
  // dónde termina el panel de la izquierda (lo usan el botón de pausa y la barra del jefe en vertical)
  let hudBottom = 118 + (rel.length ? Math.ceil(rel.length / 9) * 21 + 4 : 0);
  if (G.syn && G.syn.size) {
    let sy0 = 132 + Math.ceil(rel.length / 9) * 21 + 4;
    for (const S of SYNERGIES) if (G.syn.has(S.id)) { hudText('◆ ' + S.n, 12, sy0, 10, S.c, 'left', 600); sy0 += 14; }
    hudBottom = sy0 - 4;
  }
  G.hudBottom = hudBottom;
  if (G.toasts && G.toasts.length) G.toasts.forEach((t, i) => {
    const ty = 64 + i * 26; ctx.globalAlpha = Math.min(1, t.t * 2);
    ctx.font = '600 12px "Chakra Petch", ui-monospace, monospace'; const tw = ctx.measureText(t.txt).width + 24;
    ctx.fillStyle = 'rgba(12,11,17,.9)'; ctx.fillRect(w / 2 - tw / 2, ty - 11, tw, 22); ctx.strokeStyle = '#e3a24a'; ctx.lineWidth = 1; ctx.strokeRect(w / 2 - tw / 2 + .5, ty - 10.5, tw - 1, 21);
    hudText(t.txt, w / 2, ty, 12, '#ffd27a', 'center'); ctx.globalAlpha = 1;
  });

  drawWeaponBar(p, w, h);

  const mmBottom = drawMinimap(w);
  const r = G.cur;
  let status = `Piso ${G.floor} · ${FLOORS[G.fi].name} · enemigos Nv${G.floor}`, sc = '#9d95ab';
  if (G.elFight) { status = `Elemental de ${ELEMS[G.elFight.el].n.toLowerCase()}`; sc = ELEMS[G.elFight.el].c; }
  else if (G.chal) { status = `Desafío: ${Math.ceil(G.chal.t)} s`; sc = '#ff8a3a'; }
  else if (r && r.locked && r.type === 'combat' && r.sub) { status = 'Subjefe'; sc = '#d4474b'; }
  else if (r && r.locked && r.type === 'combat') { status = `Oleada ${Math.max(1, r.wave)}/${r.waves}`; sc = '#e3a24a'; }
  else if (r && r.locked && r.type === 'boss') { status = 'Sala del jefe'; sc = '#d4474b'; }
  hudText(status, w - 12, mmBottom + 8, 11, sc, 'right');
  let hy = mmBottom + 24;
  if (G.threat > .05) { hudText(`Amenaza +${Math.round(G.threat * 16)} %`, w - 12, hy, 10, '#d4474b', 'right', 600); hy += 16; }
  if (G.dare) { hudText(dareText(), w - 12, hy, 10, G.dare.fail ? '#6b6480' : '#ffd27a', 'right', 600); hy += 16; }
  if (G.pact) { hudText('Pacto: ' + PACTS[G.pact].n, w - 12, hy, 10, PACTS[G.pact].c, 'right', 600); hy += 16; }
  if (G.daily) hudText(`Reto diario · ${dailyScore()} pts`, w - 12, hy, 10, '#9be0c8', 'right', 600);

  const B = G.enemies.find(e => e.isBoss) || G.enemies.find(e => e.isSub);
  if (B) {
    // arriba al centro; si no cabe entre el panel y el mapa (celular en vertical), a lo ancho bajo el panel
    let bw = Math.min(460, w - 440), by = 34;
    let bx = (w - bw) / 2;
    if (bw < 160) { bx = touch.on ? 64 : 12; bw = w - bx - 12; by = Math.max(G.hudBottom, hy + (G.daily ? 16 : 0)) + 26; }   // a la derecha del botón de pausa
    hudText(B.isSub ? B.name : BOSSES[B.kind].name, w / 2, by - 14, 18, B.phase >= 2 ? '#d4474b' : '#e3a24a', 'center', 800, 'Grenze Gotisch');
    ctx.fillStyle = 'rgba(12,11,17,.8)'; ctx.fillRect(bx - 2, by, bw + 4, 12);
    ctx.fillStyle = B.phase === 3 ? '#ff6a3a' : B.phase === 2 ? '#d4474b' : B.isSub ? '#e3a24a' : '#a77bd0'; ctx.fillRect(bx, by + 2, bw * Math.max(0, B.hp / B.max), 8);
    ctx.fillStyle = '#ece4cf'; ctx.fillRect(bx + bw / 2 - 1, by, 2, 12);
    if (B.isBoss) ctx.fillRect(bx + bw / 4 - 1, by, 2, 12);
  }

  if (G.banner) {
    const a = Math.min(1, G.banner.t * 2, (2.6 - G.banner.t) * 4);
    ctx.globalAlpha = Math.max(0, a);
    // bajo el panel (y bajo el botón de pausa en un celular en vertical) para no taparlos
    const by = Math.max(h * .3, Math.min(h * .5, G.hudBottom + (hudVertical(w, h) ? 100 : 44)));
    if (G.banner.sub) fitText(G.banner.sub.toUpperCase(), w / 2, by - 30, w - 24, 12, '#9d95ab', 'center');
    hudText(G.banner.txt, w / 2, by, Math.min(46, w / 13), G.banner.color, 'center', 800, 'Grenze Gotisch');
    ctx.globalAlpha = 1;
  }

  if (touch.stickId !== null) {
    ctx.strokeStyle = 'rgba(236,228,207,.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(touch.ox, touch.oy, 46, 0, TAU); ctx.stroke();
    const dx = touch.x - touch.ox, dy = touch.y - touch.oy, l = Math.min(46, Math.hypot(dx, dy)), a = Math.atan2(dy, dx);
    ctx.fillStyle = 'rgba(236,228,207,.3)'; ctx.beginPath(); ctx.arc(touch.ox + Math.cos(a) * l, touch.oy + Math.sin(a) * l, 20, 0, TAU); ctx.fill();
  }
  if (G.hurtFlash > 0) {
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .7);
    g.addColorStop(0, 'rgba(212,71,75,0)'); g.addColorStop(1, `rgba(212,71,75,${G.hurtFlash})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
}

function render0() {
  const { w, h } = cssSize();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0c0b11'; ctx.fillRect(0, 0, cv.width, cv.height);
  if (!G) return;
  const sx = (Math.random() - .5) * G.shake, sy = (Math.random() - .5) * G.shake;
  const camX = G.cam.x, camY = G.cam.y;
  const worldT = () => ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, dpr * (w / 2 - camX * zoom + sx), dpr * (h / 2 - camY * zoom + sy));
  worldT();
  const vx0 = camX - w / 2 / zoom, vy0 = camY - h / 2 / zoom, vx1 = camX + w / 2 / zoom, vy1 = camY + h / 2 / zoom;
  drawTiles(vx0, vy0, vx1, vy1);
  drawLavaSea(vx0, vy0, vx1, vy1);
  drawElemRooms(vx0, vy0, vx1, vy1);
  drawDecor(vx0, vy0, vx1, vy1);
  drawLavaSteam(vx0, vy0, vx1, vy1);
  tickMotes(vx0, vy0, vx1, vy1);

  if (G.floor === 1) {
    const s = G.startRoom;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(236,228,207,.22)';
    ctx.font = '800 26px "Grenze Gotisch", Georgia, serif';
    ctx.fillText('Cripta del Guardián', s.cx, s.cy - 120);
    ctx.font = '600 12px "Chakra Petch", ui-monospace, monospace';
    ctx.fillText(touch.on ? 'CARGA: mantén y suelta para un ataque potente' : 'Clic derecho: mantén y suelta para un ataque cargado', s.cx, s.cy - 92);
    ctx.fillText('Los muros agrietados esconden salas secretas', s.cx, s.cy - 74);
  }

  for (const it of G.pickups) if (it.kind !== 'coin') drawPickup(it);
  for (const it of G.pickups) if (it.kind === 'coin') drawPickup(it);
  const ents = [...G.props, ...G.enemies, G.player].sort((a, b) => a.y - b.y);
  for (const e of ents) {
    if (e === G.player) { if (!(G.over && !G.won)) drawPlayer(e); }
    else if (e.kind && !e.isBoss) drawProp(e);
    else drawEnemy(e);
  }
  drawPet();
  drawStyles();
  drawFlamer();
  for (const T of G.tornados) {
    ctx.strokeStyle = 'rgba(200,240,224,.6)'; ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(T.x, T.y - i * 10, 12 + i * 7, 5 + i * 2, 0, G.time * 9 + i, G.time * 9 + i + 4); ctx.stroke(); }
  }
  for (const pt of G.parts) {
    ctx.globalAlpha = Math.max(0, pt.life / pt.max); ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;
  drawVfx();
  drawMotesFlat();
  ctx.fillStyle = '#0c0b11';
  for (const r of G.rooms) if (!r.visited) ctx.fillRect(r.x * TILE + TILE * .5, r.y * TILE + TILE * .5, (r.w - 1) * TILE, (r.h - 1) * TILE);

  // oscuridad alrededor del jugador
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const px = (G.player.x - camX) * zoom + w / 2, py = (G.player.y - camY) * zoom + h / 2;
  let [r0, r1, al] = FLOORS[G.fi].light, lk = FLOORS[G.fi].horror ? .8 : 1;
  // en los pasillos solo ves cerca de ti y la lava apenas alumbra
  if (G.corK > .01) { const k = G.corK; r0 += (28 - r0) * k; r1 += (Math.min(r1, 150) - r1) * k; al += (.99 - al) * k; lk *= 1 - .85 * k; }
  if (G.darkT > 0) { r0 = 34; r1 = 150; al = .985; lk = .35; }
  else if (pact('dark')) { r0 = 40; r1 = 175; al = .98; lk = .45; }
  drawLighting(w, h, camX, camY, px, py, r0, r1, al, lk);
  drawCheatRoom(w, h, camX, camY, zoom);

  // por encima de la oscuridad: lo que el jugador necesita ver para esquivar
  worldT();
  drawMotesGlow();
  if (FLOORS[G.fi].horror || G.darkT > 0 || pact('dark')) {
    for (const e of G.enemies) {
      if (e.isBoss) continue;
      ctx.fillStyle = `rgba(255,60,60,${.55 + .3 * Math.sin(G.time * 5 + e.wob)})`;
      ctx.fillRect(e.x - 5, e.y - 5, 3, 3); ctx.fillRect(e.x + 2, e.y - 5, 3, 3);
    }
    const B = G.enemies.find(e => e.isBoss);
    if (B) { ctx.fillStyle = '#ff3a2a'; ctx.beginPath(); ctx.arc(B.x, B.y, 6, 0, TAU); ctx.fill(); }
  }
  for (const it of G.pickups) if (it.kind === 'portal' && Math.random() < .3) G.parts.push({ x: it.x + rand(-20, 20), y: it.y + rand(-28, 28), vx: 0, vy: -40, life: .6, max: .6, color: '#c77dff', size: 3 });
  // suelo en llamas del Señor de las Brasas
  for (const f of G.flames || []) {
    const a = Math.min(1, f.t / .6), g = ctx.createRadialGradient(f.x, f.y, 2, f.x, f.y, f.r);
    g.addColorStop(0, `rgba(255,170,60,${.55 * a})`); g.addColorStop(.7, `rgba(255,90,40,${.35 * a})`); g.addColorStop(1, 'rgba(255,60,30,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.fill();
  }
  // círculos de área: el relleno crece hasta el borde y entonces estalla
  for (const h of G.hazards) {
    const k = clamp(1 - h.t / h.max, 0, 1);
    ctx.fillStyle = h.color;
    ctx.globalAlpha = .14; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, TAU); ctx.fill();
    ctx.globalAlpha = .4; ctx.beginPath(); ctx.arc(h.x, h.y, h.r * k, 0, TAU); ctx.fill();
    ctx.globalAlpha = .9; ctx.strokeStyle = h.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // «!»: este enemigo está a punto de atacar
  ctx.font = '800 18px "Chakra Petch", ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const e of G.enemies) {
    if (!(e.tele > 0) || e.dead) continue;
    const y = e.isBoss ? e.y - 72 : e.y - e.r - (e.isSub ? 34 : 18) - (e.lift || 0);
    ctx.fillStyle = Math.floor(G.time * 14) % 2 ? '#ffd27a' : '#d4474b';
    ctx.fillText('!', e.x, y);
  }
  for (const m of G.markers) {
    const k = 1 - m.t % .4 / .4, big = m.type === 'boss' || m.type === 'sub' || m.type === 'elem';
    ctx.strokeStyle = big ? 'rgba(199,125,255,.8)' : m.elite ? 'rgba(255,210,122,.9)' : 'rgba(212,71,75,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(m.x, m.y, (big ? 40 : 14) * (.5 + k * .6), 0, TAU); ctx.stroke();
  }
  for (const b of G.beams) {
    const ex = b.x + Math.cos(b.a) * 900, ey = b.y + Math.sin(b.a) * 900;
    if (!b.on) { ctx.strokeStyle = 'rgba(255,60,40,.55)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]); }
    else {
      ctx.strokeStyle = 'rgba(255,60,40,.45)'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = '#ffe0c8'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(ex, ey); ctx.stroke();
    }
  }
  for (const pr of G.proj) {
    if (pr.kind === 'boomer') {
      ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(pr.spinA || 0);
      ctx.fillStyle = pr.color; ctx.beginPath(); ctx.moveTo(-10, -9); ctx.lineTo(4, 0); ctx.lineTo(-10, 9); ctx.lineTo(-5, 0); ctx.fill();
      ctx.restore(); continue;
    } else if (pr.kind === 'sickle') {
      ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(pr.spinA || 0);
      ctx.strokeStyle = pr.color; ctx.lineWidth = pr.big ? 5 : 3.5; ctx.beginPath(); ctx.arc(0, 0, pr.r, 0, 2.6); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, pr.r, Math.PI, Math.PI + 2.6); ctx.stroke();
      ctx.restore(); continue;
    } else if (pr.kind === 'ball') {
      ctx.fillStyle = 'rgba(255,230,160,.25)'; ctx.beginPath(); ctx.arc(pr.x - pr.vx * .012, pr.y - pr.vy * .012, pr.r + 3, 0, TAU); ctx.fill();
      ctx.fillStyle = pr.color; ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r, 0, TAU); ctx.fill();
      continue;
    }
    if (pr.owner === 'player' && pr.src && pr.src.el && Math.random() < .3) {
      const el = pr.src.el, c = ELEMS[el].c;
      G.parts.push({ x: pr.x, y: pr.y, vx: el === 'air' ? rand(-50, 50) : rand(-10, 10), vy: el === 'fire' ? rand(-60, -30) : rand(-10, 10), g: el === 'water' ? 400 : el === 'earth' ? 300 : 0, life: .35, max: .35, color: c, size: 2.5 });
    }
    if (pr.kind === 'arrow') {
      const a = Math.atan2(pr.vy, pr.vx);
      // estela de la flecha
      const tc = pr.src && pr.src.el ? ELEMS[pr.src.el].c : pr.color;
      ctx.strokeStyle = hexA(tc && tc[0] === '#' && tc.length === 7 ? tc : '#ece4cf', .45); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pr.x - pr.vx * .045, pr.y - pr.vy * .045); ctx.lineTo(pr.x, pr.y); ctx.stroke();
      ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(a);
      ctx.fillStyle = '#cdb894'; ctx.fillRect(-12, -1, 16, 2);
      ctx.fillStyle = pr.color; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(2, -3.5); ctx.lineTo(2, 3.5); ctx.fill();
      ctx.restore();
    } else if (pr.kind === 'wave') {
      const a = Math.atan2(pr.vy, pr.vx);
      ctx.strokeStyle = `rgba(236,228,207,${clamp(pr.life * 2, 0, .9)})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(pr.x - Math.cos(a) * 8, pr.y - Math.sin(a) * 8, 14, a - 1.1, a + 1.1); ctx.stroke();
    } else if (pr.kind === 'magic') {
      // estela de orbes que se desvanecen
      for (let j = 3; j >= 1; j--) { ctx.fillStyle = pr.color + (j === 3 ? '22' : j === 2 ? '33' : '55'); ctx.beginPath(); ctx.arc(pr.x - pr.vx * .018 * j, pr.y - pr.vy * .018 * j, pr.r * (1 - j * .18), 0, TAU); ctx.fill(); }
      ctx.fillStyle = pr.color + '55'; ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r * 1.9, 0, TAU); ctx.fill();
      ctx.fillStyle = pr.color; ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(pr.x - 1.5, pr.y - 1.5, 3, 3);
    } else if (pr.kind === 'power') {
      ctx.fillStyle = 'rgba(255,230,160,.4)'; ctx.beginPath(); ctx.arc(pr.x, pr.y, 12, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(pr.x, pr.y, 6, 0, TAU); ctx.fill();
    } else if (pr.kind === 'web' && pr.shred) {
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r + 2, 0, TAU); ctx.stroke();
      ctx.strokeStyle = pr.color; ctx.lineWidth = 2;
      ctx.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; ctx.moveTo(pr.x - Math.cos(a) * pr.r, pr.y - Math.sin(a) * pr.r); ctx.lineTo(pr.x + Math.cos(a) * pr.r, pr.y + Math.sin(a) * pr.r); } ctx.stroke();
    } else if (pr.kind === 'web') {
      ctx.strokeStyle = pr.color; ctx.lineWidth = 2;
      ctx.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; ctx.moveTo(pr.x - Math.cos(a) * pr.r, pr.y - Math.sin(a) * pr.r); ctx.lineTo(pr.x + Math.cos(a) * pr.r, pr.y + Math.sin(a) * pr.r); } ctx.stroke();
      ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r * .6, 0, TAU); ctx.stroke();
    } else {
      ctx.fillStyle = pr.color; ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r * .45, 0, TAU); ctx.fill();
    }
  }

  for (const b of G.bolts) {
    ctx.strokeStyle = `rgba(255,226,122,${b.life / .18})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(b.x1, b.y1);
    for (let i = 1; i < 6; i++) { const k = i / 6; ctx.lineTo(b.x1 + (b.x2 - b.x1) * k + rand(-8, 8), b.y1 + (b.y2 - b.y1) * k + rand(-8, 8)); }
    ctx.lineTo(b.x2, b.y2); ctx.stroke();
  }
  if (G.interact && !G.over && !G.gam) {
    const it = G.interact;
    const key = touch.on ? '' : 'E · ';
    let line1 = '', line2 = '', col = '#ece4cf';
    if (it.kind === 'chest') { line1 = key + 'Abrir cofre'; if (it.gold) { line2 = G.keys > 0 ? 'Cofre dorado: usa 1 llave' : 'Cofre dorado: necesitas una llave'; col = '#e3a24a'; } }
    else if (it.kind === 'weapon') { line1 = key + 'Tomar ' + it.weapon.name; line2 = RARITY[it.weapon.rarity].n + ' · ' + weaponStats(it.weapon); col = RARITY[it.weapon.rarity].c; }
    else if (it.kind === 'armor') { line1 = key + `Equipar ${ARMOR.n} ${'★'.repeat(it.stars)}`; line2 = armorDesc(it.stars) + (G.player.armor ? ` · ahora llevas ${'★'.repeat(G.player.armor)}` : ''); col = RARITY['s' + it.stars].c; }
    else if (it.kind === 'relic') { line1 = key + 'Tomar ' + RELICS[it.relic].n; line2 = RELICS[it.relic].d; col = RELICS[it.relic].c; }
    else if (it.kind === 'altar') { line1 = key + 'Elegir una reliquia'; col = '#c77dff'; }
    else if (it.kind === 'totem') { const E = ELEMS[it.el]; line1 = key + `Tótem de ${E.n.toLowerCase()}: desafiar al Elemental`; line2 = `Muy difícil · ${E.hitd} · suelta 1 cristal`; col = E.c; }
    else if (it.kind === 'note') { line1 = key + 'Leer nota'; line2 = SAVE.notes[it.id] ? 'Ya está en tu diario' : 'Una página del diario'; col = '#d8c8a8'; }
    else if (it.kind === 'exit') { line1 = key + 'Salir victorioso'; line2 = `Terminar la partida en el piso ${G.floor}`; col = '#ffd27a'; }
    else if (it.kind === 'forge') { line1 = key + 'Forja: mejorar armas'; line2 = 'Daño, cadencia, carga y energía (armas de 1★ a 4★)'; col = '#ff8a3a'; }
    else if (ROOM_OBJ[it.kind]) [line1, line2, col] = ROOM_OBJ[it.kind].aviso(it, key);
    else if (it.kind === 'portal') { line1 = key + `Descender al piso ${G.floor + 1}`; col = '#c77dff'; }
    else if (it.kind === 'shop') {
      const s = it.item;
      const nm = s.t === 'potion' ? 'Poción (+3 vida)' : s.t === 'key' ? 'Llave' : s.t === 'relic' ? RELICS[s.relic].n : s.weapon.name;
      line1 = key + `Comprar ${nm} · ${s.price} monedas`;
      line2 = s.t === 'relic' ? RELICS[s.relic].d : s.t === 'weapon' ? RARITY[s.weapon.rarity].n + ' · ' + weaponStats(s.weapon) : '';
      col = G.coins >= s.price ? '#f0c040' : '#9d95ab';
    }
    ctx.font = '400 10px "Chakra Petch", ui-monospace, monospace';
    const w2 = ctx.measureText(line2).width;
    ctx.font = '600 12px "Chakra Petch", ui-monospace, monospace';
    const tw = Math.max(ctx.measureText(line1).width, w2) + 16;
    const by = it.y - 50;
    ctx.fillStyle = 'rgba(12,11,17,.88)'; ctx.fillRect(it.x - tw / 2, by - 12, tw, line2 ? 36 : 22);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(line1, it.x, by - 1);
    if (line2) { ctx.font = '400 10px "Chakra Petch", ui-monospace, monospace'; ctx.fillStyle = '#9d95ab'; ctx.fillText(line2, it.x, by + 14); }
  }
  for (const t of G.texts) {
    ctx.globalAlpha = Math.min(1, t.life * 2);
    ctx.font = `600 ${t.size}px "Chakra Petch", ui-monospace, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillText(t.txt, t.x + 1, t.y + 1);
    ctx.fillStyle = t.color; ctx.fillText(t.txt, t.x, t.y);
  }
  ctx.globalAlpha = 1;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawHUD(w, h);
  layoutTouch(w, h);
}
// botones táctiles: en vertical suben por encima de la barra de armas; la pausa va justo bajo el panel
let touchLay = '';
function layoutTouch(w, h) {
  if (!touch.on) return;
  const k = (hudVertical(w, h) ? 60 : 0) + ':' + Math.round(G.hudBottom + 10);
  if (k === touchLay) return;
  touchLay = k; const [tb, top] = k.split(':');
  $('touch').style.setProperty('--tb', tb + 'px');
  $('bPause').style.top = top + 'px';
}

let last = performance.now();
function loop(now) {
  const raw = now - last, dt = Math.min(.033, raw / 1000); last = now;
  // (los fotogramas muy lentos también cuentan: antes, si pasaban de 200 ms, la calidad nunca bajaba)
  if (started && !paused && G && raw < 1000 && (SAVE.opt.gfx || 'auto') === 'auto' && QL > 0) {
    perfEma = perfEma * .94 + Math.min(raw, 100) * .06;
    slowT = perfEma > 24 ? slowT + raw / 1000 : 0;
    if (slowT > 2.5) { QL--; slowT = 0; perfEma = 16; resize(); }
  }
  if (started && !paused && G) update(dt);
  if (started && G && G.gam) gamTick(dt);
  try { musicTick(); } catch (_) {}
  render();
  if (SAVE.opt.fps) drawFps(raw);
  requestAnimationFrame(loop);
}
// contador de FPS (Opciones): sirve para medir el rendimiento real en tu aparato
let fpsEma = 16.7;
function drawFps(raw) {
  if (raw > 0 && raw < 500) fpsEma = fpsEma * .95 + raw * .05;
  const fps = Math.round(1000 / fpsEma);
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(4, 4, 96, 18);
  ctx.font = '600 12px ui-monospace, monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = fps >= 55 ? '#6cc46a' : fps >= 30 ? '#e3a24a' : '#d4474b';
  ctx.fillText(`${fps} FPS · Q${gfxLevel()}`, 9, 13);
  ctx.restore();
}
requestAnimationFrame(loop);

// envoltorio del dibujo: durante la apuesta la cámara se acerca a la mesa
function render() {
  if (!G || !G.gam) { render0(); return; }
  const e = gamEase(), it = G.gam.it, z0 = zoom, cx = G.cam.x, cy = G.cam.y;
  zoom = z0 * (1 + 1.5 * e); G.cam.x = cx + (it.x - cx) * e; G.cam.y = cy + (it.y - 18 - cy) * e;
  try { render0(); } finally { zoom = z0; G.cam.x = cx; G.cam.y = cy; }
}

