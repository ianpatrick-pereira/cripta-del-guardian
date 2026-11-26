// v0.66: la Espada del Caballero en HD (Espada oxidada y Espada de hierro), dibujada por IA.
// - La espada es un dibujo aparte (hojas «espada» por estrellas y «espada_el» por elemento) que se pega a la mano.
// - Al atacar, el Caballero usa su hoja «knight_atq» (puño vacío) y la espada sigue a su mano cuadro a cuadro.
// - Combo de 3 golpes (11-jugador.js): tajo, revés y estocada; el cargado es el giro (crece con las estrellas).
// - Cada golpe deja su corte dibujado (c_tajo, c_reves, c_estocada, c_giro) o, con elemento, el de su elemento (c_fire...).
import { TAU, clamp } from './01-utilidades.js';
import { ANIM, drawSpr } from './02-pixel-art.js';
import { G } from './07-estado.js';

// armas con dibujo HD y qué cuadro de «espada» usan a 1★ (la de hierro empieza un paso más arriba)
const ESPADA_HD = { rusty: 0, iron: 1 };
const EL_I = { fire: 0, water: 1, air: 2, earth: 3 };
/** clave del dibujo HD de esta arma, o null si se dibuja por código */
function espadaKey(w) {
  if (!w || !(w.id in ESPADA_HD) || !ANIM.espada) return null;
  if (w.el && ANIM.espada_el) return 'espada_el~reposo~' + EL_I[w.el];
  return 'espada~reposo~' + Math.min(4, ESPADA_HD[w.id] + (w.stars || 1) - 1);
}
/** dibuja la espada con la empuñadura en (x, y) y la hoja hacia el ángulo a (el dibujo apunta hacia arriba) */
function drawEspada(key, x, y, a, scale = 1) {
  const s = 1.5 * scale, off = 28 * .25 * s;   // la empuñadura está 28 px por debajo del centro del cuadro
  drawSpr(key, x + Math.cos(a) * off, y + Math.sin(a) * off, s, { rot: a + Math.PI / 2 });
}

// dónde está el puño en cada cuadro de knight_atq (píxeles del cuadro de 64; el centro es 32, 32)
const MANO = [
  [[18, 28], [28, 35], [39, 35], [19, 44]],   // tajo: puño arriba atrás, al pecho, cruzando, guardia
  [[27, 36], [13, 36], [12, 35], [19, 44]],   // revés: del pecho hacia atrás
  [[25, 43], [26, 40], [52, 34], [19, 44]],   // estocada: recoge, carga, estira
  [[23, 34], [20, 34], [11, 32], [48, 31]],   // giro: derecha, de frente, izquierda, de espaldas
];
// ángulo de la espada en cada cuadro del giro (mirando a la derecha): da la vuelta completa
const GIRO_A = [0, Math.PI / 2, Math.PI, -Math.PI / 4];
const FILA = ['reposo', 'caminar', 'herido', 'muerte'];
/** cuadro del Caballero atacando y dónde tiene la mano, o null si no toca */
function golpeCuadro(p) {
  const s = p.swing, w = p.slots[p.cur];
  if (!s || p.spr !== 'knight' || !ANIM.knight_atq || !espadaKey(w)) return null;
  const prog = clamp(s.t / s.dur, 0, .999), fila = s.spin ? 3 : s.golpe || 0;
  const i = s.spin ? Math.floor(prog * 4) : prog < .2 ? 0 : prog < .55 ? 1 : prog < .85 ? 2 : 3;
  const [mx, my] = MANO[fila][i], lado = p.flip ? -1 : 1;
  const ga = GIRO_A[i];
  return { key: 'knight_atq~' + FILA[fila] + '~' + i, hx: p.x + lado * (mx - 32) * .5, hy: p.y - 2 + (my - 32) * .5, ang: lado > 0 ? ga : Math.PI - ga };
}

/** sin atacar: la espada en la mano que cuelga del Caballero, con la punta hacia delante y algo abajo */
function espadaEnMano(p) {
  if (p.spr !== 'knight' || !ANIM.knight) return null;
  const lado = p.flip ? -1 : 1, a = .35 + Math.sin(p.walk || 0) * .06;
  return { hx: p.x + lado * (20 - 32) * .5, hy: p.y - 2 + (46 - 32) * .5, ang: lado > 0 ? a : Math.PI - a };
}
/** corte de un golpe del combo: media luna (tajo, revés) o estocada, de acero o de su elemento */
function drawCorte(p, w, s, prog) {
  const R = s.range, a = s.a, el = w.el && ANIM['c_' + w.el] ? w.el : null, i = Math.min(3, Math.floor(prog * 4));
  const fade = el ? 1 - prog * prog : 1, crece = el ? .85 + .2 * prog : 1;
  if (s.golpe === 2) {
    // estocada: la punta llega justo al alcance
    const f = (R - 10) / 88 * crece;
    drawSpr(el ? `c_${el}~reposo~1` : 'c_estocada~reposo~' + i, p.x + Math.cos(a) * (R - 42 * f), p.y + Math.sin(a) * (R - 42 * f), f / .25, { rot: a, alpha: fade });
  } else {
    // los cortes con elemento traen el dibujo más a la izquierda del cuadro: van algo más adelante
    const f = R / (el ? 80 : 75) * crece, key = el ? `c_${el}~reposo~0` : (s.golpe === 1 ? 'c_reves' : 'c_tajo') + '~reposo~' + i, d = R * (el ? .55 : .4);
    drawSpr(key, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, f / .25, { rot: a, alpha: fade, sy: el && s.golpe === 1 ? -1 : 1 });
  }
}
/** anillo del giro cargado */
function drawCorteGiro(p, w, s, prog) {
  const el = w.el && ANIM['c_' + w.el] ? w.el : null, f = s.range * .6 / 41;
  drawSpr(el ? `c_${el}~reposo~2` : 'c_giro~reposo~' + (Math.floor(G.time * 12) % 2), p.x, p.y, f / .25, { rot: s.a + prog * TAU * 1.2, alpha: .85 - prog * prog * .7 });
}
/** chispa (o golpe de su elemento) donde la espada pega */
function impactoEspada(w, x, y, a) {
  if (!espadaKey(w)) return;
  const fx = w.el && ANIM['c_' + w.el] ? 'c_' + w.el : 'c_impacto';
  G.parts.push({ x, y, vx: 0, vy: 0, life: .2, max: .2, fx, s: 1.6, rot: a, color: '', size: 0 });
}

export { drawCorte, drawCorteGiro, drawEspada, espadaEnMano, espadaKey, golpeCuadro, impactoEspada };
