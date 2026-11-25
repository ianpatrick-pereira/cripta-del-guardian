// v0.64: cómo se mueve cada Elemental (solo dibujo: no cambia la jugabilidad ni usa números al azar).
// Cada uno tiene una forma distinta, así que se mueve distinto:
//   fuego  Señor de las Brasas: arde. Parpadea como una llama, suelta brasas que suben y alumbra el suelo
//   agua   Leviatán de la Fuente: sale de su charco. Ondula como una serpiente y su charco hace ondas
//   aire   Djinn del Vendaval: flota alto con su cola de tornado, se ladea al volar y lo rodean ráfagas
//   tierra Gólem de Roca: pesa. Cada pisada lo aplasta un poco y levanta polvo
// Todos anuncian su ataque (los primeros 0,5 s, con el «!»): se recogen, tiemblan y brillan; y al soltarlo se estiran hacia ti.
import { ctx } from './00-inicio.js';
import { TAU, angTo, clamp } from './01-utilidades.js';
import { luzSuelo } from './02-pixel-art.js';
import { G } from './07-estado.js';

const COLOR_EL = { fire: '255,110,40', water: '110,190,255', air: '190,240,230', earth: '170,130,90' };
// ataques en los que el cuerpo entero empuja hacia ti al soltarlos
const EMPUJA_EL = new Set(['lanzallamas', 'wave', 'gust', 'rafaga', 'charge3', 'slam', 'pedrusco']);

// velocidad aproximada entre dos dibujos
function velElem(e) {
  const dt = G.time - (e.anTv ?? G.time);
  if (dt > 0) { e.anVx = (e.x - e.anX) / dt; e.anVy = (e.y - e.anY) / dt; }
  e.anX = e.x; e.anY = e.y; e.anTv = G.time;
  return { vx: e.anVx || 0, vy: e.anVy || 0 };
}

/** @returns {{ dx: number, dy: number, rot: number, sx: number, sy: number, brillo: number, anda: boolean }} */
function poseElem(e) {
  const t = e.t || G.time, { vx, vy } = velElem(e), v = Math.hypot(vx, vy), lado = clamp(vx / 140, -1, 1);
  const P = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1, brillo: 0, anda: v > 15 || e.st === 'walk' };
  const tiembla = a => { P.dx += Math.sin(G.time * 63) * a; P.dy += Math.cos(G.time * 51) * a * .5; };
  switch (e.elem) {
    case 'fire': {   // llama viva: se estira y encoge rápido y de forma irregular
      const f = Math.sin(t * 13) * .035 + Math.sin(t * 31 + 1) * .02;
      P.sy = 1 + f; P.sx = 1 - f * .7; P.rot = lado * .14; P.dy = Math.sin(t * 3) * 1.5; P.brillo = .1 + .06 * Math.sin(t * 17);
      break;
    }
    case 'water': {  // serpiente que sale del charco: ondula sin parar
      const o = Math.sin(t * 2.1);
      P.rot = o * .05 + lado * .1; P.sx = 1 + Math.sin(t * 2.6) * .03; P.sy = 1 - Math.sin(t * 2.6) * .03; P.dx = o * 2;
      if (P.anda) P.dy = Math.sin(t * 5) * 1.5;
      break;
    }
    case 'air': {    // flota alto y se ladea mucho al volar
      P.dy = -10 + Math.sin(t * 2.2) * 5; P.rot = Math.sin(t * 1.4) * .06 + lado * .28;
      P.sx = 1 + Math.sin(t * 6) * .02; P.sy = 1 - Math.sin(t * 6) * .02;
      break;
    }
    case 'earth': {  // pisadas pesadas, según lo que de verdad avanza (e.paso)
      if (P.anda) {
        const ph = e.paso || 0, s = Math.abs(Math.sin(ph)), apoyo = s < .3 ? 1 - s / .3 : 0;
        P.dy = -s * 5; P.rot = Math.sin(ph) * .06; P.sx = 1 + apoyo * .07; P.sy = 1 - apoyo * .07;
      } else { P.sy = 1 + Math.sin(t * 1.5) * .015; }
      break;
    }
  }
  // anuncia el ataque: se recoge, tiembla y brilla; al soltarlo se estira hacia ti
  if (e.st !== 'idle' && e.st !== 'walk' && e.st !== 'golpe') {   // el golpe del Gólem ya trae sus propios cuadros
    const a = angTo(e, G.player);
    if (e.tele > 0) {
      const k = 1 - clamp(e.tele / .5, 0, 1);
      P.sx *= 1 + .1 * k; P.sy *= 1 - .1 * k; tiembla(1.6 * k); P.brillo += .35 * k;
      if (e.elem === 'earth' && e.st === 'slam') { P.dy -= 18 * k; P.sy *= 1 + .16 * k; P.sx *= 1 - .1 * k; }   // el Gólem se alza para golpear el suelo
      if (e.elem === 'air') P.dy -= 8 * k;
    } else if (e.tele > -.25) {
      const k = 1 - clamp(-e.tele / .25, 0, 1);
      if (EMPUJA_EL.has(e.st)) { P.dx += Math.cos(a) * 10 * k; P.dy += Math.sin(a) * 5 * k; P.rot += Math.cos(a) * .12 * k; }
      if (e.elem === 'earth' && e.st === 'slam') { P.sx *= 1 + .25 * k; P.sy *= 1 - .2 * k; }                 // y cae aplastando
      else { P.sx *= 1 - .06 * k; P.sy *= 1 + .1 * k; }
      P.brillo += .25 * k;
    } else P.brillo += .12;
    if (e.st === 'whirl') P.rot += Math.sin(G.time * 14) * .12;          // remolino: se retuerce
    if (e.st === 'lanzallamas') P.rot += Math.cos(e.ca) * .1;            // se inclina hacia el chorro
  }
  // golpe recibido: retrocede un poco
  if (e.hitT > 0) { const k = clamp(e.hitT / .14, 0, 1), a = angTo(e, G.player); P.dx -= Math.cos(a) * 3 * k; P.sx *= 1 + .05 * k; P.sy *= 1 - .05 * k; }
  return P;
}

// lo que va detrás y debajo del cuerpo: luz en el suelo, ondas del charco, ráfagas, polvo
function fondoElem(e, y, P) {
  const t = e.t || G.time, col = COLOR_EL[e.elem] || '255,255,255';
  ctx.save();
  switch (e.elem) {
    case 'fire':
      luzSuelo(e.x, e.y + 4, e.r * 3.4, col, .3 + .08 * Math.sin(t * 11) + P.brillo * .6);
      break;
    case 'water':
      luzSuelo(e.x, e.y + 4, e.r * 2.6, col, .12 + P.brillo * .4);
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {   // ondas que se abren desde la base
        const f = (t * .55 + i / 3) % 1;
        ctx.strokeStyle = `rgba(170,225,255,${.4 * (1 - f)})`;
        ctx.beginPath(); ctx.ellipse(e.x + P.dx * .5, e.y + 6, e.r * (.8 + 1.5 * f), e.r * (.8 + 1.5 * f) * .38, 0, 0, TAU); ctx.stroke();
      }
      break;
    case 'air':
      luzSuelo(e.x, e.y + 4, e.r * 2.2, col, .08 + P.brillo * .4);
      ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {   // ráfagas que giran a su alrededor
        const a0 = t * (3.4 + i * .5) + i * 1.7, R = e.r * (1 + i * .22);
        ctx.strokeStyle = `rgba(${col},${.22 + .08 * Math.sin(t * 5 + i)})`;
        ctx.beginPath(); ctx.ellipse(e.x, y + P.dy + 10 - i * 8, R, R * .35, 0, a0, a0 + 1.6); ctx.stroke();
      }
      break;
    case 'earth': {
      luzSuelo(e.x, e.y + 4, e.r * 2, '255,150,60', .06 + P.brillo * .5);
      // polvo en cada pisada: dos nubes a los lados de los pies que se abren y se desvanecen
      if (P.anda) {
        const f = ((e.paso || 0) / Math.PI) % 1;
        if (f < .45) {
          const k = f / .45;
          ctx.fillStyle = `rgba(120,100,80,${.38 * (1 - k)})`;
          for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(e.x + s * (e.r * .6 + k * 14), e.y + 8, 7 + k * 10, 4 + k * 4, 0, 0, TAU); ctx.fill(); }
        }
      }
      break;
    }
  }
  ctx.restore();
}

// lo que va delante: brasas del fuego que suben (con un patrón fijo, sin azar)
function frenteElem(e, y, P) {
  if (e.elem !== 'fire') return;
  const t = e.t || G.time;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const f = (t * (.7 + (i % 3) * .15) + i / 9) % 1;
    const x = e.x + Math.sin(i * 12.9 + t * 1.3) * e.r * .9 + Math.sin(f * 8 + i) * 4, yy = y - 10 - f * 80 + P.dy;
    ctx.globalAlpha = (1 - f) * .9; ctx.fillStyle = i % 3 ? '#ff8a3a' : '#ffd27a';
    const s = i % 2 ? 3 : 2; ctx.fillRect(Math.round(x), Math.round(yy), s, s);
  }
  ctx.restore();
}

export { fondoElem, frenteElem, poseElem };
