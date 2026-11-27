// v0.70: armas del Nigromante en HD, dibujadas por IA (Báculo de almas, Cetro de escarcha).
// - El arma es un dibujo aparte (hoja por estrellas y «_el» por elemento), de pie con la cabeza arriba.
//   El Nigromante la lleva de pie a su lado (las manos quedan libres para los gestos de necro_atq); otra clase la apunta.
// - Cada arma tiene sus efectos: lo que vuela, el golpe, el salto en cadena, el cargado y lo que queda en el suelo.
import { ANIM, drawSpr } from './02-pixel-art.js';
import { G } from './07-estado.js';

/** @type {Record<string, {hoja: string, vuela: string, impacto: string, salto?: string, cargado: string, suelo?: string, ss: number}>} */
const BACULO_HD = {
  almas: { hoja: 'baculo', vuela: 'al_alma', impacto: 'al_impacto', salto: 'al_cadena', cargado: 'al_cargado', ss: .95 },
  escarcha: { hoja: 'cetro', vuela: 'es_esquirla', impacto: 'es_impacto', cargado: 'es_anillo', suelo: 'es_hielo', ss: 1 },
};
const BAC_EL = { fire: 0, water: 1, air: 2, earth: 3 };
const BAC_ESCALA = 1.2;     // 128 px de alto con detalle 4 -> ~38 px en pantalla
const BAC_AGARRE = 18;      // píxeles del dibujo desde el centro hasta donde va la mano (hacia el mango)
const hd = w => (w && BACULO_HD[w.id] && ANIM[BACULO_HD[w.id].hoja]) ? BACULO_HD[w.id] : null;
/** clave del dibujo HD del arma, o null si se dibuja por código */
function baculoKey(w) {
  const B = hd(w); if (!B) return null;
  if (w.el && ANIM[B.hoja + '_el']) return B.hoja + '_el~reposo~' + BAC_EL[w.el];
  return B.hoja + '~reposo~' + Math.min(4, (w.stars || 1) - 1);
}
/** dibuja el arma con la mano en (x, y) y la cabeza hacia a (a = -π/2: de pie) */
function drawBaculo(key, x, y, a, scale = 1) {
  const s = BAC_ESCALA * scale, off = BAC_AGARRE * .25 * s;
  drawSpr(key, x + Math.cos(a) * off, y + Math.sin(a) * off, s, { rot: a + Math.PI / 2 });
}
/** el arma en la mano del Nigromante: de pie a su lado, se inclina hacia donde lanza mientras hace el gesto */
function baculoMano(p) {
  if (p.spr !== 'necro') return null;
  const lado = Math.cos(p.aim) >= 0 ? 1 : -1, t = G.time - (p.castAt ?? -9), gesto = t >= 0 && t < .3 ? Math.sin(t / .3 * Math.PI) : 0;
  return { hx: p.x + lado * 8, hy: p.y + 4, ang: -Math.PI / 2 + lado * (.12 + .35 * gesto) };
}
const fxPart = (fx, x, y, s, rot, life) => G.parts.push({ x, y, vx: 0, vy: 0, life, max: life, fx, s, rot, color: '', size: 0 });
/** opciones de lo que vuela (dibujo HD) para shootPlayer */
function almaVuela(w, grande = false) {
  const B = hd(w); return B && ANIM[B.vuela] ? { anim: B.vuela, ss: B.ss * (grande ? 1.3 : 1) } : {};
}
/** al pegar: el golpe de esa arma */
function impactoAlma(pr) {
  const B = hd(pr.src); if (!B || !ANIM[B.impacto]) return false;
  fxPart(B.impacto, pr.x, pr.y, .9, Math.atan2(pr.vy, pr.vx), .25);
  return true;
}
/** el alma salta de un enemigo a otro: rayo de almas estirado entre los dos */
function saltoAlma(src, a, b) {
  const B = hd(src); if (!B || !B.salto || !ANIM[B.salto]) return false;
  fxPart(B.salto, (a.x + b.x) / 2, (a.y + b.y) / 2, Math.hypot(b.x - a.x, b.y - a.y) / 20, Math.atan2(b.y - a.y, b.x - a.x), .25);
  return true;
}
/** cargado: el estallido alrededor (más grande cuanto mayor el radio R; sin R, el tamaño de siempre) */
function cargadoAlmas(p, w, R = 0) {
  const B = hd(w); if (!B || !ANIM[B.cargado]) return;
  fxPart(B.cargado, p.x, p.y, R ? R / 40 : 2.4, 0, .4);
}
/** lo que brota del suelo bajo un enemigo (cristales de hielo del cargado del Cetro) */
function sueloArma(w, e) {
  const B = hd(w); if (!B || !B.suelo || !ANIM[B.suelo]) return;
  fxPart(B.suelo, e.x, e.y - 4, 1.1, 0, .65);
}
export { almaVuela, baculoKey, baculoMano, cargadoAlmas, drawBaculo, impactoAlma, saltoAlma, sueloArma };
