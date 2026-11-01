// ================= Armas: diseño por estrellas, efecto elemental y estelas =================
// punta del arma (TIP) y dónde empieza la parte que corta o brilla (BASE), en coordenadas del arma
import { ctx } from './00-inicio.js';
import { TAU, clamp, rand } from './01-utilidades.js';
import { G } from './07-estado.js';
import { ELEMS } from './23-elementos.js';
import { flame, hexA } from './35-ambiente.js';
import { radSprite } from './36-mar-de-lava.js';
import { drawWeapon } from './38-armadura-visual.js';
const W_TIP = { sword: 38, dagger: 30, great: 46, spear: 46, hammer: 30, scythe: 44, staff: 47, boomer: 16, whip: 26, shield: 18, musket: 40, sickle: 24, book: 20, rod: 40, kunai: 20, katar: 26, twin: 22, claws: 20, shuriken: 20, blowgun: 31, sling: 12, xbow: 22, bow: 16 };
const W_BASE = { sword: 9, dagger: 9, great: 9, spear: 34, hammer: 20, scythe: 24, staff: 35, boomer: 2, whip: 10, shield: 2, musket: 10, sickle: 8, book: 2, rod: 24, kunai: 8, katar: 8, twin: 5, claws: 6, shuriken: 2, blowgun: 2, sling: 6, xbow: 4, bow: 0 };
const STAR_COL = ['#bdb6a8', '#6cc46a', '#5aa4e8', '#bb7cf0', '#ffb03a'];
// halo alargado ya dibujado (una imagen por color): se estira a lo largo del arma
function haloSpr(c) {
  return radSprite('h' + c, [[0, hexA(c, .55)], [.5, hexA(c, .18)], [1, hexA(c, 0)]]);
}
let WREACT = 1;   // 1 = en reposo; sube mientras el jugador ataca (las armas elementales reaccionan)

function weaponDeco(w, x, y, a, scale, shape) {
  const s = w.stars || 1, t = G ? G.time : 0, tip = W_TIP[shape] ?? 16, base = W_BASE[shape] ?? 0, len = tip - base;
  const sc = STAR_COL[s - 1], melee = w.type === 'melee', live = !!G && scale >= .8;
  const toW = (lx, ly) => [x + (Math.cos(a) * lx - Math.sin(a) * ly) * scale, y + (Math.sin(a) * lx + Math.cos(a) * ly) * scale];
  // 4★ y 5★: aura de luz sobre la hoja
  if (s >= 4) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (s === 5 ? .75 : .5) + .2 * Math.sin(t * 4);
    const hw = s === 5 ? 14 : 10;
    ctx.drawImage(haloSpr(sc), base - 6, -hw, len + 12, hw * 2);
    ctx.restore();
  }
  // 2★+: gema en la guarda o en el centro
  if (s >= 2) {
    const gx = melee ? Math.min(6, base) : Math.max(2, base * .5);
    ctx.fillStyle = '#2a2433'; ctx.beginPath(); ctx.moveTo(gx, -3.5); ctx.lineTo(gx + 3.5, 0); ctx.lineTo(gx, 3.5); ctx.lineTo(gx - 3.5, 0); ctx.fill();
    ctx.fillStyle = sc; ctx.beginPath(); ctx.moveTo(gx, -2.5); ctx.lineTo(gx + 2.5, 0); ctx.lineTo(gx, 2.5); ctx.lineTo(gx - 2.5, 0); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(gx - 1, -1.5, 1, 1);
  }
  // 3★+: adornos dorados (pomo y anillos)
  if (s >= 3) {
    ctx.fillStyle = '#e8c060';
    ctx.beginPath(); ctx.arc(-3, 0, 2.2, 0, TAU); ctx.fill();
    if (len > 8) { ctx.fillRect(base - 1, -3, 1.5, 6); ctx.fillRect(base + len * .45, -2.5, 1, 5); }
  }
  // 4★+: runas que laten a lo largo de la hoja
  if (s >= 4 && len > 10) {
    for (let i = 1; i <= 3; i++) { ctx.fillStyle = hexA(s === 5 ? '#fff2c0' : sc, .45 + .45 * Math.sin(t * 5 - i)); ctx.fillRect(base + len * i / 4 - 1, -.5, 2, 1); }
  }
  // 5★: destello que recorre la hoja y una chispa que gira en la punta
  if (s === 5) {
    const k = (t * .8) % 1.4;
    if (k < 1) { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(base + len * k - 2, -2, 4, 4); }
    const oa = t * 5;
    ctx.fillStyle = '#fff6d0'; ctx.save(); ctx.translate(tip + Math.cos(oa) * 6, Math.sin(oa) * 6); ctx.rotate(oa);
    ctx.fillRect(-3, -.6, 6, 1.2); ctx.fillRect(-.6, -3, 1.2, 6); ctx.restore();
    if (live && Math.random() < .06) { const [px, py] = toW(base + Math.random() * len, 0); G.parts.push({ x: px, y: py, vx: rand(-15, 15), vy: rand(-40, -15), life: .6, max: .6, color: '#ffe8a0', size: 2 }); }
  }
  if (!w.el) return;
  // efecto elemental propio: cada elemento se ve y se mueve distinto; reacciona (crece) al atacar
  const R = WREACT, el = w.el;
  const along = i => base + len * i;
  if (el === 'fire') {
    // llamas que lamen el filo y suben siempre hacia arriba, y brasas
    for (let i = 0; i < 3; i++) {
      const lx = along(.25 + i * .3);
      ctx.save(); ctx.translate(lx, 0); ctx.rotate(-a); flame(0, 2, '#ff6a2a', (.45 + .1 * i) * Math.min(1.8, R), t, i * 2.1 + lx); ctx.restore();
    }
    if (live && Math.random() < .12 * R) { const [px, py] = toW(along(Math.random()), 0); G.parts.push({ x: px, y: py, vx: rand(-12, 12), vy: rand(-70, -35), life: .6, max: .6, color: Math.random() < .5 ? '#ffb347' : '#ff5a1a', size: 2 }); }
  } else if (el === 'water') {
    // película de agua que fluye por la hoja y gotas que caen
    ctx.fillStyle = 'rgba(74,176,232,.35)'; ctx.fillRect(base, -3.5, len, 7);
    const k = (t * 1.6) % 1;
    ctx.fillStyle = 'rgba(200,240,255,.75)'; ctx.fillRect(base + len * k, -3, 5, 1.5); ctx.fillRect(base + len * ((k + .5) % 1), 1.5, 4, 1.2);
    ctx.strokeStyle = `rgba(140,210,255,${.35 + .25 * Math.sin(t * 6)})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(tip, 0, 4 + 2 * Math.sin(t * 5), 6, 0, 0, TAU); ctx.stroke();
    if (live && Math.random() < .1 * R) { const [px, py] = toW(along(Math.random()), 0); G.parts.push({ x: px, y: py, vx: rand(-6, 6), vy: rand(0, 20), g: 420, life: .55, max: .55, color: '#8cd2ff', size: 2 }); }
  } else if (el === 'air') {
    // dos corrientes de viento que se enroscan alrededor del arma
    ctx.lineWidth = 1.3;
    for (let j = 0; j < 2; j++) {
      ctx.strokeStyle = j ? 'rgba(220,255,240,.75)' : 'rgba(150,230,200,.6)'; ctx.beginPath();
      for (let i = 0; i <= 12; i++) { const lx = base - 6 + (len + 14) * i / 12, ly = Math.sin(i * .9 - t * 12 * (1 + .5 * (R - 1)) + j * Math.PI) * (4 + 2 * R); i ? ctx.lineTo(lx, ly) : ctx.moveTo(lx, ly); }
      ctx.stroke();
    }
    if (live && Math.random() < .08 * R) { const [px, py] = toW(tip, 0); G.parts.push({ x: px, y: py, vx: rand(-60, 60), vy: rand(-60, 60), life: .35, max: .35, color: '#dcfff0', size: 1.5 }); }
  } else {
    // tierra: grieta ámbar en la hoja y piedras que orbitan
    ctx.strokeStyle = `rgba(255,170,60,${.55 + .3 * Math.sin(t * 3)})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(base, 0); ctx.lineTo(along(.3), -1.5); ctx.lineTo(along(.55), 1); ctx.lineTo(along(.85), -1); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const oa = t * 2.2 * (1 + .6 * (R - 1)) + i * TAU / 3, lx = along(.5) + Math.cos(oa) * (len * .45 + 4), ly = Math.sin(oa) * (7 + R * 2);
      ctx.fillStyle = '#6a5034'; ctx.fillRect(lx - 2.5, ly - 2.5, 5, 5); ctx.fillStyle = '#a07a50'; ctx.fillRect(lx - 2.5, ly - 2.5, 3, 2);
    }
    if (live && Math.random() < .07 * R) { const [px, py] = toW(along(Math.random()), 0); G.parts.push({ x: px, y: py, vx: rand(-10, 10), vy: rand(-10, 10), g: 250, life: .5, max: .5, color: '#8a6a48', size: 2.2 }); }
  }
}

// golpe con arma elemental: cada elemento revienta distinto
function elemHitFx(el, x, y) {
  const V = G.vfx || (G.vfx = []);
  if (el === 'fire') {
    V.push({ k: 'ring', x, y, t: 0, max: .3, r: 24, c: '#ff8a3a', w: 4 });
    for (let i = 0; i < 8; i++) G.parts.push({ x: x + rand(-8, 8), y: y + rand(-6, 6), vx: rand(-40, 40), vy: rand(-140, -60), life: .6, max: .6, color: Math.random() < .5 ? '#ffb347' : '#ff4a1a', size: 3 });
  } else if (el === 'water') {
    V.push({ k: 'ring', x, y, t: 0, max: .35, r: 26, c: '#8cd2ff', w: 2, flat: true });
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + rand(-1.3, 1.3); G.parts.push({ x, y, vx: Math.cos(a) * rand(60, 150), vy: Math.sin(a) * rand(80, 170), g: 520, life: .6, max: .6, color: Math.random() < .5 ? '#8cd2ff' : '#dff4ff', size: 2.5 }); }
  } else if (el === 'air') {
    V.push({ k: 'swirl', x, y, t: 0, max: .4, r: 22, c: '#dcfff0' });
  } else if (el === 'earth') {
    V.push({ k: 'ring', x, y, t: 0, max: .25, r: 18, c: '#c09060', w: 5 });
    for (let i = 0; i < 7; i++) { const a = rand(0, TAU); G.parts.push({ x, y, vx: Math.cos(a) * rand(60, 140), vy: Math.sin(a) * rand(60, 140) - 80, g: 600, life: .55, max: .55, color: Math.random() < .5 ? '#6a5034' : '#a07a50', size: 3.5 }); }
  }
}

// efectos breves: anillos, ondas de choque, remolinos y zarpazos
function drawVfx() {
  const V = G.vfx; if (!V || !V.length) return;
  const dt = clamp(G.time - (G.vfxT ?? G.time), 0, .05); G.vfxT = G.time;
  for (let i = V.length - 1; i >= 0; i--) {
    const f = V[i]; f.t += dt;
    const k = Math.min(1, f.t / f.max), al = 1 - k;
    if (f.k === 'ring') {
      ctx.strokeStyle = hexA(f.c, al * .9); ctx.lineWidth = f.w * (1 - k * .6);
      ctx.beginPath(); f.flat ? ctx.ellipse(f.x, f.y, f.r * (.3 + k), f.r * (.3 + k) * .5, 0, 0, TAU) : ctx.arc(f.x, f.y, f.r * (.3 + k), 0, TAU); ctx.stroke();
    } else if (f.k === 'shock') {
      ctx.strokeStyle = hexA(f.c, al * .8); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r * (.2 + k), f.r * (.2 + k) * .55, 0, 0, TAU); ctx.stroke();
      ctx.strokeStyle = `rgba(20,14,10,${al * .7})`; ctx.lineWidth = 2; ctx.beginPath();
      for (let j = 0; j < 6; j++) { const a = f.seed + j * TAU / 6, L = f.r * (.4 + .4 * Math.sin(j * 3 + f.seed)); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(a) * L * .5, f.y + Math.sin(a) * L * .3 + 2); ctx.lineTo(f.x + Math.cos(a + .2) * L, f.y + Math.sin(a + .2) * L * .55); }
      ctx.stroke();
    } else if (f.k === 'swirl') {
      ctx.strokeStyle = hexA(f.c, al * .85); ctx.lineWidth = 2;
      for (let j = 0; j < 3; j++) { const r = f.r * (.4 + .3 * j) * (.6 + k), a0 = f.t * 14 + j * 2.1; ctx.beginPath(); ctx.arc(f.x, f.y, r, a0, a0 + 2.2); ctx.stroke(); }
    } else if (f.k === 'glyph') {
      // círculo mágico al lanzar una habilidad
      ctx.save(); ctx.translate(f.x, f.y); ctx.scale(1, .55); ctx.rotate(f.t * 3);
      ctx.strokeStyle = hexA(f.c, al); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, f.r * (.6 + .4 * k), 0, TAU); ctx.stroke();
      ctx.beginPath(); for (let j = 0; j < 6; j++) { const a = j * TAU / 6; ctx.lineTo(Math.cos(a) * f.r * .8, Math.sin(a) * f.r * .8); } ctx.closePath(); ctx.stroke();
      ctx.restore();
    }
    if (f.t >= f.max) V.splice(i, 1);
  }
}

// estela de cada golpe cuerpo a cuerpo según el tipo de arma
function swingTrail(p, w, s, prog) {
  const shape = w.shape || 'sword', S = w.stars || 1, col = w.el ? ELEMS[w.el].c : STAR_COL[S - 1];
  const from = s.a - s.dir * s.arc / 2, ang = from + s.dir * s.arc * prog, a0 = Math.min(from, ang), a1 = Math.max(from, ang);
  const R = s.range, al = 1 - prog;
  const crescent = (rIn, rOut, c, alpha) => {
    ctx.fillStyle = hexA(c, alpha); ctx.beginPath(); ctx.arc(p.x, p.y, rOut, a0, a1); ctx.arc(p.x, p.y, rIn, a1, a0, true); ctx.closePath(); ctx.fill();
  };
  if (shape === 'spear' || s.arc < 1) {
    // estocada: una línea recta que se estira y se desvanece
    // estocada: una punta de luz afilada que se estira y se desvanece
    const L = R * (.5 + .55 * Math.min(1, prog * 2));
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(s.a);
    ctx.fillStyle = hexA(col, .55 * al); ctx.beginPath(); ctx.moveTo(12, -6); ctx.lineTo(L, 0); ctx.lineTo(12, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${.85 * al})`; ctx.beginPath(); ctx.moveTo(18, -1.5); ctx.lineTo(L, 0); ctx.lineTo(18, 1.5); ctx.closePath(); ctx.fill();
    ctx.restore();
  } else if (shape === 'dagger' || shape === 'twin' || shape === 'katar') {
    // cortes rápidos: dos líneas finas paralelas
    ctx.lineWidth = 2;
    for (const off of [-.18, .18]) { ctx.strokeStyle = `rgba(220,240,255,${.75 * al})`; ctx.beginPath(); ctx.arc(p.x, p.y, R * (.7 + off * .4), a0 + off * .3, a1 + off * .3); ctx.stroke(); }
  } else if (shape === 'claws') {
    for (let j = -1; j <= 1; j++) { ctx.strokeStyle = hexA(col, .8 * al); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p.x, p.y, R * (.62 + j * .1), a0, a1); ctx.stroke(); }
  } else if (shape === 'hammer') {
    // golpe pesado: media luna gruesa y onda de choque al caer
    crescent(R * .35, R * .9, col, .35 * al);
    if (prog > .75 && !s.shock) {
      s.shock = true;
      const hx = p.x + Math.cos(s.a) * R * .7, hy = p.y + Math.sin(s.a) * R * .7;
      (G.vfx || (G.vfx = [])).push({ k: 'shock', x: hx, y: hy, t: 0, max: .45, r: R * .9, c: col, seed: Math.random() * TAU });
      for (let i = 0; i < 6; i++) G.parts.push({ x: hx, y: hy, vx: rand(-90, 90), vy: rand(-120, -40), g: 500, life: .5, max: .5, color: '#8a7a68', size: 3 });
    }
  } else if (shape === 'scythe') {
    // guadaña: media luna ancha con eco fantasmal detrás
    crescent(R * .45, R * 1.02, '#b0303a', .38 * al);
    ctx.strokeStyle = `rgba(255,190,200,${.6 * al})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, R * 1.02, a0, a1); ctx.stroke();
    ctx.globalAlpha = .25 * al; drawWeapon(w, p.x, p.y, ang - s.dir * .5); ctx.globalAlpha = 1;
  } else {
    // espadas: media luna con el borde que guía brillante; el mandoble es más ancho y suelta chispas
    const big = shape === 'great';
    crescent(R * (big ? .3 : .45), R * .92, col, (big ? .42 : .32) * al);
    ctx.strokeStyle = `rgba(255,255,255,${.75 * al})`; ctx.lineWidth = big ? 3 : 2; ctx.beginPath(); ctx.arc(p.x, p.y, R * .92, a0, a1); ctx.stroke();
    if ((big || S >= 4) && Math.random() < .5) { const ex = p.x + Math.cos(ang) * R * .9, ey = p.y + Math.sin(ang) * R * .9; G.parts.push({ x: ex, y: ey, vx: rand(-60, 60), vy: rand(-60, 60), life: .3, max: .3, color: S >= 5 ? '#ffe8a0' : '#ffffff', size: 2 }); }
  }
  if (S === 5 && Math.random() < .6) { const r = rand(R * .4, R * .9), an = rand(a0, a1); G.parts.push({ x: p.x + Math.cos(an) * r, y: p.y + Math.sin(an) * r, vx: 0, vy: -30, life: .4, max: .4, color: '#ffd27a', size: 2 }); }
}

// Otros módulos no pueden reasignar estas variables directamente (un import es de solo lectura): usan estas funciones.
function setWREACT(v) { return (WREACT = v); }

export { STAR_COL, WREACT, drawVfx, elemHitFx, haloSpr, setWREACT, swingTrail, weaponDeco };
