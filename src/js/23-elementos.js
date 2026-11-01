// ================= Elementos =================
import { tr } from './00b-textos.js';
import { ctx } from './00-inicio.js';
import { TAU, TILE, angTo, clamp, dist, pick, rand } from './01-utilidades.js';
import { D } from './03-datos-del-juego.js';
import { noise, sfx } from './05-audio.js';
import { G, freeSpot, rc } from './07-estado.js';
import { moveEnt, roomAt, solidAt } from './08-colisiones.js';
import { addText, breakCracks, burst, later, shake, showBanner } from './09-efectos.js';
import { dmgMul } from './11-jugador.js';
import { elAbName, styleElem } from './12-armas-con-estilo-propio.js';
import { armorSh } from './13-armadura.js';
import { hurtEnemy } from './14-enemigos.js';
import { drawShadow } from './36-mar-de-lava.js';
const ELEMS = {
  fire:  { n: tr('Fuego'),  c: '#ff6a3a', ab: tr('Lanzallamas'), abd: tr('Escupes un chorro de fuego que sigue tu puntería unos segundos y quema todo lo que toca.'),
           hitd: tr('te quema y deja el suelo ardiendo'),
           boss: { name: tr('Señor de las Brasas'), r: 24, hp: 270, speed: 92, want: 190, minion: ['bat', 'mage'], p1: ['rain', 'fan', 'volley', 'rain'], p2: ['rain', 'fan', 'volley', 'summon', 'slam', 'rain'] } },
  water: { n: tr('Agua'),   c: '#4ab0e8', ab: tr('Maremoto'), abd: tr('Una ola en anillo empuja, frena y daña; desde Nv3 te cura 1.'),
           hitd: tr('te empapa y te ralentiza'),
           boss: { name: tr('Leviatán de la Fuente'), r: 26, hp: 290, speed: 74, want: 130, minion: ['slime', 'toxic'], p1: ['spit', 'wave', 'hop', 'fan'], p2: ['spit', 'wave', 'bighop', 'fan', 'summon', 'whirl'] } },
  air:   { n: tr('Aire'),   c: '#c8f0e0', ab: tr('Tornado'),  abd: tr('Lanza un tornado que arrastra y tritura a los enemigos.'),
           hitd: tr('te lanza hacia atrás'),
           boss: { name: tr('Djinn del Vendaval'), r: 22, hp: 250, speed: 118, want: 170, minion: ['bat', 'spider'], p1: ['gust', 'charge3', 'fan', 'retreat'], p2: ['gust', 'charge3', 'fan', 'retreat', 'summon', 'gust'] } },
  earth: { n: tr('Tierra'), c: '#c09060', ab: tr('Fisura'),   abd: tr('Una línea de picos de roca aturde y te da escudo.'),
           hitd: tr('golpea +1 y resiste el daño'),
           boss: { name: tr('Gólem de Roca'), r: 28, hp: 380, speed: 62, want: 0, minion: ['brute', 'slime'], p1: ['slam', 'hop', 'rain'], p2: ['slam', 'bighop', 'rain', 'summon', 'charge3'] } },
};
const EL_ORDER = ['fire', 'water', 'air', 'earth'];
function mkElem(el, x, y) {
  const E = ELEMS[el], B = E.boss;
  const S = { ...B, sk: 'el_' + el, tint: E.c, pc: E.c, el, minion: B.minion };
  const lv = G.floor, hp = Math.round(B.hp * D().hp * (1 + .65 * (lv - 1)));
  return { type: 'sub', isSub: true, elem: el, def: S, sk: S.sk, name: tr`${B.name} · Nv${lv}`, spr: 'brute', s: 3, r: B.r, x, y, hp, max: hp, speed: B.speed * (1 + .06 * (lv - 1)), dmg: (lv >= 4 ? 2 : 1) + (el === 'earth' ? 1 : 0), tint: E.c,
    kx: 0, ky: 0, flash: 0, t: 0, phase: 1, st: 'idle', st_t: 1.2, last: '', k: 0, ca: 0, timer: 0, poison: 0, pt: 0, wob: 0, alpha: 1, air: false, lift: 0 };
}
function totemElement() { return pick(EL_ORDER); }
function startElemFight(it) {
  const room = roomAt(it.x, it.y) || G.cur, E = ELEMS[it.el];
  it.gone = true; room.locked = true; room.elTheme = it.el;
  G.elFight = { room, el: it.el };
  G.markers.push({ x: it.x, y: it.y, t: 1.3, type: 'elem', el: it.el });
  const n = Math.min(5, 2 + Math.floor((G.floor - 1) / 2) + (G.diff === 'hard' ? 1 : 0));
  for (let i = 0; i < n; i++) {
    const pos = freeSpot(room, 2, 20, G.player, 150);
    if (pos) G.markers.push({ x: pos.x, y: pos.y, t: 1.1 + i * .1, type: pick(E.boss.minion), depth: 1, el: it.el });
  }
  showBanner(E.boss.name, E.c, tr`Elemental de ${E.n.toLowerCase()} · opcional`);
  shake(8); noise(.5, .08, 400); sfx(70, .8, 'sawtooth', .05, 20);
}
// habilidad elemental del arma (tecla R)
function elemCost(w) { return 15 + 5 * w.elLv; }
function elemAbility(p) {
  const w = p.slots[p.cur];
  if (!w || !w.elOn) { addText(p.x, p.y - 26, tr('Esta arma no tiene poder elemental'), '#9d95ab', 11); return; }
  if (p.elCd > 0) return;
  const cost = elemCost(w);
  if (p.en < cost) { addText(p.x, p.y - 26, tr`${elAbName(w)}: necesitas ${cost} de energía`, '#5aa4e8', 12); return; }
  p.en -= cost; p.elCd = Math.max(4, 9 - w.elLv);
  const L = w.elLv, a = p.aim, E = ELEMS[w.el], dm = k => Math.max(1, Math.round(w.dmg * k * dmgMul()));
  addText(p.x, p.y - 32, tr`${elAbName(w)} Nv${L}`, E.c, 13);
  if (w.style) { styleElem(p, w, L, E, dm); return; }
  if (w.el === 'fire') {
    // lanzallamas: dura más, llega más lejos y se abre más con cada nivel
    p.flame = { t: 1.6 + .4 * L, tick: 0, L, dmg: dm(.32 + .1 * L), range: 130 + 20 * L, half: .3 + .04 * L, f: [] };
    sfx(120, .4, 'sawtooth', .05, 80); noise(.4, .06, 900);
  } else if (w.el === 'water') {
    const n = 16 + 4 * L;
    for (let i = 0; i < n; i++) { const an = i * TAU / n; G.proj.push({ x: p.x, y: p.y, vx: Math.cos(an) * 340, vy: Math.sin(an) * 340, r: 12, dmg: dm(.8 + .4 * L), owner: 'player', kind: 'wave', pierce: 99, hit: new Set(), life: .6, color: E.c, src: w, fx: 'slow', kb: 420 }); }
    if (L >= 3 && p.hp < p.maxHp) { p.hp++; addText(p.x, p.y - 46, tr('+1 vida'), '#4ab0e8', 12); }
    noise(.5, .08, 600); sfx(300, .4, 'sine', .05, -150);
  } else if (w.el === 'air') {
    G.tornados.push({ x: p.x + Math.cos(a) * 30, y: p.y + Math.sin(a) * 30, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150, t: 2.2 + .5 * L, tick: 0, dmg: Math.max(1, Math.round(w.dmg * (.35 + .15 * L))), R: 90 + 10 * L });
    noise(.8, .06, 2500); sfx(500, .6, 'sine', .03, 400);
  } else {
    const n = 7 + 2 * L;
    for (let i = 1; i <= n; i++) { const x = p.x + Math.cos(a) * i * 28, y = p.y + Math.sin(a) * i * 28; later(i * .045, () => { if (!solidAt(Math.floor(x / TILE), Math.floor(y / TILE))) elemBlast(x, y, 30, dm(1.1 + .4 * L), 'stun', E.c); }); }
    const maxSh = p.maxSh + rc('escudo') + armorSh(p), gain = L >= 2 ? 2 : 1; p.sh = Math.min(maxSh, p.sh + gain); addText(p.x, p.y - 46, tr`+${gain} escudo`, '#8fb7d9', 12);
    shake(10); sfx(80, .4, 'sawtooth', .05, -30);
  }
}
// estallido elemental: solo daña a enemigos
function elemBlast(x, y, R, dmg, fx, color) {
  burst(x, y, color, 10, 170, 4, .4);
  for (const e of G.enemies) if (!e.dead && !e.air && dist(e, { x, y }) < R + e.r) hurtEnemy(e, dmg, angTo({ x, y }, e), 220, { fx, explosion: true });
  breakCracks(x, y, R);
}
function updateFlamer(dt) {
  const p = G.player, F = p.flame; if (!F) return;
  F.t -= dt; F.tick -= dt;
  const a = p.aim, ox = p.x + Math.cos(a) * 14, oy = p.y + Math.sin(a) * 14;
  // el chorro se corta contra las paredes
  let reach = F.range;
  if (F.t > 0) {
    for (let d = 16; d < F.range; d += 12) if (solidAt(Math.floor((ox + Math.cos(a) * d) / TILE), Math.floor((oy + Math.sin(a) * d) / TILE))) { reach = d; break; }
    F.reach = reach;
    for (let i = 0; i < 3; i++) { const an = a + rand(-F.half, F.half) * .8, sp = reach * rand(3.6, 4.4); F.f.push({ x: ox, y: oy, vx: Math.cos(an) * sp + (p.vx || 0) * .5, vy: Math.sin(an) * sp + (p.vy || 0) * .5, life: .42, max: .42, r: rand(4, 7) }); }
    if (F.tick <= 0) {
      F.tick = .12;
      for (const e of G.enemies) {
        if (e.dead || e.air) continue;
        const d = dist(e, { x: ox, y: oy }); if (d > reach + e.r) continue;
        let da = Math.abs(angTo({ x: ox, y: oy }, e) - a); if (da > Math.PI) da = TAU - da;
        if (da < F.half + e.r / Math.max(30, d)) hurtEnemy(e, F.dmg, a, 30, { fx: 'burn' });
      }
      breakCracks(ox + Math.cos(a) * reach * .6, oy + Math.sin(a) * reach * .6, 30);
      noise(.14, .025, 700);
    }
  }
  for (const f of F.f) {
    f.life -= dt; f.x += f.vx * dt; f.y += f.vy * dt; const dr = Math.pow(.05, dt); f.vx *= dr; f.vy *= dr; f.vy -= 30 * dt; f.r += 26 * dt;
    if (solidAt(Math.floor(f.x / TILE), Math.floor(f.y / TILE))) { f.vx = f.vy = 0; f.life = Math.min(f.life, .12); }
  }
  F.f = F.f.filter(f => f.life > 0);
  if (F.t <= 0 && !F.f.length) p.flame = null;
}
function drawFlamer() {
  const F = G.player && G.player.flame; if (!F) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const f of F.f) {
    const k = f.life / f.max, col = k > .7 ? '255,205,110' : k > .45 ? '255,170,60' : k > .2 ? '255,90,40' : '120,40,30';
    ctx.globalAlpha = Math.min(1, k * 1.4) * .42; ctx.fillStyle = `rgb(${col})`;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.fill();
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
function updateTornados(dt) {
  for (const T of G.tornados) {
    T.t -= dt; T.tick -= dt;
    const ox = T.x, oy = T.y; T.x += T.vx * dt; T.y += T.vy * dt;
    if (solidAt(Math.floor(T.x / TILE), Math.floor(T.y / TILE))) { T.x = ox; T.y = oy; T.vx *= -1; T.vy *= -1; }
    for (const e of G.enemies) {
      if (e.dead || e.air || e.isBoss) continue;
      const d = dist(e, T); if (d > T.R) continue;
      const pull = e.isSub ? 40 : 170, a = angTo(e, T);
      moveEnt(e, Math.cos(a) * pull * dt, Math.sin(a) * pull * dt);
    }
    if (T.tick <= 0) { T.tick = .3; for (const e of G.enemies) if (!e.dead && !e.air && dist(e, T) < 50 + e.r) hurtEnemy(e, T.dmg, rand(0, TAU), 60, {}); }
    if (Math.random() < .8) { const an = rand(0, TAU), rr = rand(8, 40); G.parts.push({ x: T.x + Math.cos(an) * rr, y: T.y + Math.sin(an) * rr, vx: -Math.sin(an) * 160, vy: Math.cos(an) * 160 - 40, life: .35, max: .35, color: '#c8f0e0', size: 3 }); }
  }
  G.tornados = G.tornados.filter(T => T.t > 0);
}
function shredShield() {
  const p = G.player;
  if (p.inv > 0 || p.sh <= 0) return;
  p.sh = 0; p.shT = -3;
  addText(p.x, p.y - 34, tr('¡Escudo roto!'), '#8fb7d9', 13); sfx(1600, .15, 'square', .03, -1200); burst(p.x, p.y, '#8fb7d9', 12, 180);
}
function drawElemental(e) {
  const c = e.tint, t = e.t, lift = e.lift || 0, y = e.y - lift, white = e.flash > 0;
  drawShadow(e.x, e.y, e.r);
  const g = ctx.createRadialGradient(e.x, y, 2, e.x, y, e.r + 22); g.addColorStop(0, c + 'aa'); g.addColorStop(1, c + '00');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(e.x, y, e.r + 22, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(e.x, y);
  const col = white ? '#ffffff' : c;
  if (e.elem === 'fire') {
    for (let i = 0; i < 7; i++) { const an = i * TAU / 7 + t * 2, h = 14 + Math.sin(t * 9 + i) * 6; ctx.fillStyle = i % 2 ? '#ffd27a' : col; ctx.beginPath(); ctx.moveTo(Math.cos(an) * 12, Math.sin(an) * 12); ctx.lineTo(Math.cos(an + .25) * (12 + h), Math.sin(an + .25) * (12 + h)); ctx.lineTo(Math.cos(an + .5) * 12, Math.sin(an + .5) * 12); ctx.fill(); }
    ctx.fillStyle = white ? '#fff' : '#2a0c08'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.fill();
  } else if (e.elem === 'water') {
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = col; ctx.globalAlpha = .7 - i * .2; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 14 + i * 7 + Math.sin(t * 4 + i) * 2, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.fillStyle = white ? '#fff' : '#0c2a3a'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill();
  } else if (e.elem === 'air') {
    ctx.strokeStyle = col; ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, 10 + i * 6, t * (4 - i) + i, t * (4 - i) + i + 2.4); ctx.stroke(); }
    ctx.fillStyle = white ? '#fff' : '#e8fff6'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill();
  } else {
    ctx.fillStyle = white ? '#fff' : '#5a4632'; ctx.fillRect(-20, -18, 40, 36);
    ctx.fillStyle = col; ctx.fillRect(-26, -10, 8, 18); ctx.fillRect(18, -10, 8, 18); ctx.fillRect(-14, -26, 28, 10);
    for (let i = 0; i < 3; i++) { const an = t * 1.5 + i * TAU / 3; ctx.fillStyle = '#8a6a48'; ctx.fillRect(Math.cos(an) * 34 - 4, Math.sin(an) * 34 - 4, 8, 8); }
  }
  // ojos
  const pa = angTo(e, G.player);
  ctx.fillStyle = e.phase === 2 ? '#ff2a2a' : '#ffffff'; ctx.fillRect(Math.cos(pa) * 4 - 6, Math.sin(pa) * 4 - 4, 4, 4); ctx.fillRect(Math.cos(pa) * 4 + 2, Math.sin(pa) * 4 - 4, 4, 4);
  ctx.restore();
}
function drawTotem(it) {
  const E = ELEMS[it.el], k = clamp(it.rise || 0, 0, 1), h = 46 * k;
  drawShadow(it.x, it.y + 2, 14);
  ctx.fillStyle = '#3a3448'; ctx.fillRect(it.x - 11, it.y - h, 22, h);
  ctx.fillStyle = '#4e4660'; ctx.fillRect(it.x - 14, it.y - h, 28, 6);
  ctx.fillStyle = '#2a2638'; for (let i = 1; i < 4; i++) ctx.fillRect(it.x - 8, it.y - h + i * 11, 16, 2);
  if (k >= 1) {
    const g = ctx.createRadialGradient(it.x, it.y - h - 10, 2, it.x, it.y - h - 10, 30); g.addColorStop(0, E.c + 'cc'); g.addColorStop(1, E.c + '00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(it.x, it.y - h - 10, 30, 0, TAU); ctx.fill();
    drawCrystal(it.x, it.y - h - 12 + Math.sin(G.time * 3) * 3, E.c, 1.2);
  }
}
function drawCrystal(x, y, c, s = 1) {
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y - 9 * s); ctx.lineTo(x + 6 * s, y); ctx.lineTo(x, y + 9 * s); ctx.lineTo(x - 6 * s, y); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(x - 1.5 * s, y - 5 * s, 2 * s, 4 * s);
}

export { ELEMS, EL_ORDER, drawCrystal, drawElemental, drawFlamer, drawTotem, elemAbility, elemBlast, mkElem,
  shredShield, startElemFight, totemElement, updateFlamer, updateTornados };
