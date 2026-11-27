// v0.69: el Kusarigama del Asesino en HD, dibujado por IA (antes «Látigo de cadenas»: mismo estilo 'whip').
// - La hoz es un dibujo aparte (hojas «kusa» por estrellas y «kusa_el» por elemento): en la mano, de pie.
// - Golpe: el Asesino lanza (fila «herido» de rogue_atq) y la cadena (ku_cadena, en tramos) sale de su puño
//   hasta la hoz, que vuela con la hoja por delante. Al pegar: chispa con eslabones (ku_impacto).
// - Cargado: anillo de tramos de cadena girando alrededor, del tamaño del golpe, con la hoz por delante.
import { ANIM, drawSpr } from './02-pixel-art.js';
import { G } from './07-estado.js';

const EL_K = { fire: 0, water: 1, air: 2, earth: 3 };
const T = 32 * .25 * 1.15;   // largo de un tramo de cadena en pantalla
/** clave del dibujo HD de la hoz del kusarigama, o null si se dibuja por código */
function kusaKey(w) {
  if (!w || w.id !== 'whip' || !ANIM.kusa) return null;
  if (w.el && ANIM.kusa_el) return 'kusa_el~reposo~' + EL_K[w.el];
  return 'kusa~reposo~' + Math.min(4, (w.stars || 1) - 1);
}
// puño en los cuadros de rogue_atq, fila «herido» (lanzar) y «caminar» (tajo amplio)
const PUNO_L = [[20, 25], [55, 27], [55, 27], [44, 41]];
const enAsesino = p => p.spr === 'rogue' && !!ANIM.rogue_atq;
/** cuadro del Asesino lanzando la cadena (o girándola) y dónde está su puño; null si no está atacando */
function kusaCuadro(p) {
  const W = p.whip, w = p.slots[p.cur];
  if (!W || !enAsesino(p) || !kusaKey(w)) return null;
  const k = W.t / W.dur, lado = Math.cos(W.a) >= 0 ? 1 : -1;
  const f = W.circle ? 1 : k < .12 ? 0 : k < .7 ? 1 : k < .85 ? 2 : 3, [mx, my] = PUNO_L[f];
  return { key: 'rogue_atq~' + (W.circle ? 'caminar' : 'herido') + '~' + f, hx: p.x + lado * (mx - 32) * .5, hy: p.y - 2 + (my - 32) * .5 };
}
/** la hoz en la mano del Asesino cuando no ataca (de pie, a su lado) */
function kusaMano(p) {
  if (p.spr !== 'rogue') return null;
  const lado = p.flip ? -1 : 1;
  return { hx: p.x + lado * 6, hy: p.y + 1, flip: lado < 0 };
}
/** dibuja la hoz con su centro en (x, y); a = hacia dónde mira la hoja (sin ángulo: de pie) */
function drawHoz(key, x, y, s, a = null, flip = false) {
  drawSpr(key, x, y, s, a === null ? { flip } : { rot: a + Math.PI / 2 });
}
/** golpe del kusarigama: la cadena tendida y la hoz en la punta, o el anillo del cargado; false si no hay dibujo HD */
function drawKusa(p, w) {
  const W = p.whip, key = kusaKey(w);
  if (!W || !key || !ANIM.ku_cadena) return false;
  const k = W.t / W.dur;
  if (W.circle) {
    // el anillo de cadena crece hasta el alcance y gira, con la hoz por delante (tramos de cadena: se ve nítida a cualquier tamaño)
    const R = W.range * (.55 + .45 * Math.min(1, k * 1.6)), giro = W.a + k * Math.PI * 3, al = 1 - k * k * .6;
    const n = Math.max(12, Math.round(Math.PI * 2 * R / T)), paso = Math.PI * 2 / n;
    for (let i = 0; i < n; i++) { const b = giro + i * paso; drawSpr('ku_cadena~reposo~0', p.x + Math.cos(b) * R, p.y + Math.sin(b) * R, 1.15, { rot: b + Math.PI / 2, alpha: al * (.35 + .65 * i / n) }); }
    drawHoz(key, p.x + Math.cos(giro + Math.PI * 2 - paso) * R, p.y + Math.sin(giro + Math.PI * 2 - paso) * R, 1, giro + Math.PI / 2);
    return true;
  }
  const c = kusaCuadro(p), hx = c ? c.hx : p.x, hy = c ? c.hy : p.y;
  // la cadena sale rápido, se queda tendida y vuelve a la mano al final
  const ext = k < .45 ? k / .45 : k < .75 ? 1 : 1 - (k - .75) / .25 * .85;
  const len = W.range * ext, a = W.a, ca = Math.cos(a), sa = Math.sin(a);
  for (let d = 0; d < len - 4; d += T) {
    const m = Math.min(T, len - 4 - d), cx = hx + ca * (d + m / 2), cy = hy + sa * (d + m / 2);
    drawSpr('ku_cadena~reposo~0', cx, cy, 1.15, { rot: a, sx: m / T });
  }
  drawHoz(key, hx + ca * len, hy + sa * len, 1, a);
  return true;
}
/** chispa con eslabones donde pega la cadena */
function impactoKusa(w, x, y) {
  if (!kusaKey(w) || !ANIM.ku_impacto) return;
  G.parts.push({ x, y, vx: 0, vy: 0, life: .22, max: .22, fx: 'ku_impacto', s: 1, rot: 0, color: '', size: 0 });
}

export { drawHoz, drawKusa, impactoKusa, kusaCuadro, kusaKey, kusaMano };
