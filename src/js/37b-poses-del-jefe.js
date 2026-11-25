// v0.64: poses del Guardián (y de cualquier jefe con hoja HD). Solo dibujo: no cambia la jugabilidad.
// El Guardián es una armadura que flota, así que no tiene pasos: se expresa con el cuerpo entero
// (inclinarse, subir, bajar, estirarse, aplastarse, temblar) y con un aura del color del ataque.
// Cada estado de la máquina del jefe (16-jefes.js) tiene su pose:
//   idle     flota pesado y respira; al moverse se inclina hacia donde va
//   expuesto tras un ataque queda cansado: baja, se ladea y flota más lento (es cuando más daño recibe)
//   prep     anticipa el ataque que viene (e.next): cada uno con su gesto, para que se pueda leer
//   ataque   la pose del ataque en curso
//   enrage   cambio de fase: tiembla, crece y brilla en rojo
import { ctx } from './00-inicio.js';
import { TAU, angTo, clamp } from './01-utilidades.js';
import { G } from './07-estado.js';

const suave = k => k * k * (3 - 2 * k);   // 0→1 con arranque y frenada suaves
const MORADO = '199,125,255', ROJO = '255,70,80';

// tiempo que lleva el jefe en el estado actual (se mide al dibujar)
function enEstado(e) {
  const clave = e.st + ':' + (e.st === 'prep' ? e.next : '');
  if (e.anSt !== clave) { e.anSt = clave; e.anT0 = G.time; }
  return G.time - e.anT0;
}

// velocidad aproximada entre dos dibujos (el jefe no guarda vx/vy)
function velocidad(e) {
  const dt = G.time - (e.anTv ?? G.time);
  if (dt > 0) { e.anVx = (e.x - e.anX) / dt; e.anVy = (e.y - e.anY) / dt; }
  e.anX = e.x; e.anY = e.y; e.anTv = G.time;
  return { vx: e.anVx || 0, vy: e.anVy || 0 };
}

/** @returns {{ dx: number, dy: number, rot: number, sx: number, sy: number, aura: string, auraA: number, auraR: number, anda: boolean }} */
function poseJefe(e) {
  const t = e.t || G.time, u = enEstado(e), p = G.player;
  const { vx, vy } = velocidad(e);
  const v = Math.hypot(vx, vy);
  const P = { dx: 0, dy: Math.sin(t * 2.4) * 3, rot: 0, sx: 1, sy: 1 + Math.sin(t * 1.3) * .02, aura: MORADO, auraA: 0, auraR: 1, anda: false };
  const tiembla = a => { P.dx += Math.sin(G.time * 61) * a; P.dy += Math.cos(G.time * 47) * a * .6; };
  const aPj = angTo(e, p);

  if (e.st === 'enrage') {
    const k = clamp(u / 1.2, 0, 1);
    tiembla(2.5 * (1 - k * .5));
    P.dy -= 10 * suave(k); P.sx = P.sy = 1 + .1 * suave(k) + .03 * Math.sin(G.time * 18);
    P.aura = ROJO; P.auraA = .55 * k + .15 * Math.sin(G.time * 14); P.auraR = 1.3 + .3 * k;
    return P;
  }

  if (e.st === 'prep') {
    const k = suave(clamp(u / .35, 0, 1));
    switch (e.next) {
      case 'almas':    P.dy -= 18 * k; P.sx = P.sy = 1 + .07 * k; P.auraA = .5 * k; break;                   // se eleva y carga almas
      case 'embestida': P.dx -= Math.cos(aPj) * 16 * k; P.dy -= Math.sin(aPj) * 8 * k; P.rot = -Math.cos(aPj) * .18 * k; P.sx = 1 + .16 * k; P.sy = 1 - .14 * k; tiembla(2.2 * k); P.aura = ROJO; P.auraA = .35 * k; break;   // se echa atrás para tomar impulso
      case 'espadas':  P.dy -= 26 * k; P.rot = -.1 * k; P.auraA = .45 * k; break;                                // sube a ordenar las espadas
      case 'puas':     P.dy -= 34 * k; P.sx = 1 - .1 * k; P.sy = 1 + .12 * k; break;                             // salta para caer con fuerza
      case 'invocar':  P.dy += 4 * k; P.sx = 1 + .06 * k; P.sy = 1 - .06 * k; tiembla(1.2 * k); P.auraA = .5 * k; P.auraR = 1.6; break;   // se encoge y llama a sus esbirros
      default:         P.dy -= 6 * k; tiembla(1 * k);
    }
    return P;
  }

  switch (e.st) {
    case 'almas': {
      const sube = e.timer < 2.4 ? 1 : 1 - clamp((e.timer - 2.4) / .4, 0, 1);
      P.dy -= 18 * sube; P.rot = Math.sin(G.time * 9) * .05 * sube;
      P.sx = P.sy = 1 + .05 * sube + .02 * Math.sin(G.time * 12);
      P.auraA = (.35 + .15 * Math.sin(G.time * 12)) * sube;
      return P;
    }
    case 'embestida': {
      if (e.k === 0) {   // segunda o tercera embestida: vuelve a tomar impulso
        const k = suave(clamp(e.timer / .6, 0, 1));
        P.dx -= Math.cos(e.ca) * 16 * k; P.rot = -Math.cos(e.ca) * .18 * k; P.sx = 1 + .16 * k; P.sy = 1 - .14 * k; tiembla(2.2 * k); P.aura = ROJO; P.auraA = .35 * k;
      } else {           // carga: se lanza inclinado y estirado hacia donde va
        P.dy = 0; P.rot = Math.cos(e.ca) * .32; P.sx = 1.18; P.sy = .88; P.anda = true;
        P.aura = MORADO; P.auraA = .3;
      }
      return P;
    }
    case 'espadas': {
      const n = Math.round((e.timer % .14) / .14 * 10) / 10;
      P.dy -= 26 * (1 - clamp((e.timer - 1) / .5, 0, 1)); P.rot = -.08 + Math.sin(G.time * 7) * .04;
      P.sx = P.sy = 1 + .03 * (1 - n); P.auraA = .3 + .2 * (1 - n);
      return P;
    }
    case 'puas': {
      // cae de golpe desde lo alto, se aplasta contra el suelo y se recupera mientras brotan las púas
      if (u < .07) { const k = u / .07; P.dy = -34 * (1 - k); P.sx = .9; P.sy = 1.12; }
      else { const k = clamp((u - .07) / .35, 0, 1), rebote = Math.sin(k * Math.PI * 2) * (1 - k); P.dy = 6 * (1 - k); P.sx = 1 + .28 * (1 - k) + .05 * rebote; P.sy = 1 - .2 * (1 - k) - .05 * rebote; }
      return P;
    }
    case 'invocar':
      tiembla(1); P.dy -= 6; P.sx = P.sy = 1 + .04 * Math.sin(G.time * 10); P.auraA = .45; P.auraR = 1.6;
      return P;
  }

  // idle: flota; al moverse se inclina hacia donde va. Expuesto: cansado y bajo
  if (v > 15) { P.anda = true; P.rot = clamp(vx / 120, -1, 1) * .12; P.dy = Math.sin(t * 4) * 3; }
  if (e.exposeT > 0) {
    const k = clamp(e.exposeT / .8, 0, 1);
    P.dy = Math.sin(t * 1.2) * 1.5 + 10 * k; P.rot += .09 * k * (p.x < e.x ? -1 : 1); P.sy = 1 - .04 * k; P.sx = 1 + .03 * k;
  }
  // golpe recibido: retrocede un poco
  if (e.hitT > 0) { const k = clamp(e.hitT / .14, 0, 1); P.dx -= Math.cos(aPj) * 3 * k; P.sx *= 1 + .05 * k; P.sy *= 1 - .05 * k; }
  return P;
}

// aura del ataque: un halo suave detrás del jefe
function auraJefe(x, y, r, col, a) {
  if (a <= .01) return;
  const g = ctx.createRadialGradient(x, y, r * .2, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

export { auraJefe, poseJefe };
