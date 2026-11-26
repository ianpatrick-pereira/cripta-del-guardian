// v0.66: poderes elementales del arma (tecla R, ver 23-elementos.js) dibujados por IA. Solo dibujo.
//   fuego   Lanzallamas: chorro de fuego (h_fuego) repetido desde la punta del arma, más ancho cuanto más lejos
//   agua    Tsunami: cada trozo del muro de agua es una ola (h_agua) que rompe al final
//   aire    Ráfaga: estallido de viento al lanzarla y remolino a tu alrededor mientras dura la velocidad (h_aire)
//   tierra  Piel de roca: anillo de rocas a tus pies que se forma, late y se desmorona al acabar (h_tierra)
import { ANIM, animKey, drawSpr, luzSuelo } from './02-pixel-art.js';
import { G } from './07-estado.js';

/** chorro del lanzallamas; devuelve true si lo dibujó (entonces no se pintan las bolas de fuego de antes) */
function drawLanzallamasHD() {
  const p = G.player, F = p && p.flame; if (!F || !ANIM.h_fuego) return false;
  if (F.t <= 0) return true;
  const a = p.aim, c = Math.cos(a), s = Math.sin(a), ox = p.x + c * 14, oy = p.y + s * 14, reach = F.reach || F.range, L = 26;
  luzSuelo(ox + c * reach * .5, oy + s * reach * .5, reach * .6, '255,140,50', .25);
  for (let d = L * .5, i = 0; d < reach; d += L * .8, i++) {
    const k = d / reach;
    drawSpr(animKey('h_fuego', 'reposo', G.time + i * .13), ox + c * d, oy + s * d, 1.65, { rot: a, sy: .6 + 1.1 * k, alpha: Math.min(1, (reach - d) / 30 + .2) });
  }
  // llamarada en la punta del arma (el dibujo apunta a la izquierda: se gira)
  drawSpr('h_fuego~caminar~' + (Math.floor(G.time * 10) % 2), ox + c * 6, oy + s * 6, 1.3, { rot: a + Math.PI });
  return true;
}
/** una ola del tsunami (proyectil con fx 'tsunami'); devuelve true si la dibujó */
function drawOlaHD(pr) {
  if (!ANIM.h_agua) return false;
  const a = Math.atan2(pr.vy, pr.vx), rompe = pr.life < .22;
  const key = rompe ? 'h_agua~muerte~' + Math.min(3, Math.floor((.22 - pr.life) / .22 * 4)) : animKey('h_agua', 'reposo', G.time + pr.x * .003);
  drawSpr(key, pr.x, pr.y, 1.4, { rot: a });
  return true;
}
/** estallido de viento al lanzar la Ráfaga (radio R) */
function rafagaHD(x, y, R) {
  if (ANIM.h_aire) G.parts.push({ x, y, vx: 0, vy: 0, life: .45, max: .45, fx: 'h_aire', s: R / 22, color: '', size: 0 });
}
/** remolino de viento mientras dura la velocidad (encima del personaje) */
function drawVientoHD(p) {
  if (!(p.windT > 0) || !ANIM.h_aire) return;
  drawSpr(animKey('h_aire', 'reposo', G.time), p.x, p.y - 4, 1.6, { alpha: Math.min(1, p.windT / .4) * .8 });
}
/** anillo de rocas a los pies mientras dura la Piel de roca (debajo del personaje) */
function drawRocaHD(p) {
  if (!(p.earthT > 0) || !ANIM.h_tierra) return;
  const el = 10 - p.earthT;
  const key = p.earthT < .5 ? animKey('h_tierra', 'muerte', .5 - p.earthT, true) : el < .5 ? 'h_tierra~reposo~' + Math.min(3, Math.floor(el / .5 * 4)) : 'h_tierra~caminar~' + (Math.floor(G.time * 3) % 2);
  luzSuelo(p.x, p.y + 2, 30, '255,170,60', .12 + .06 * Math.sin(G.time * 6));
  drawSpr(key, p.x, p.y - 2, 2.1, { alpha: .95 });
}

export { drawLanzallamasHD, drawOlaHD, drawRocaHD, drawVientoHD, rafagaHD };
