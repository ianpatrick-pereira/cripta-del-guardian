// v0.68: el Arco corto de la Arquera en HD, dibujado por IA.
// - El arco es un dibujo aparte (hojas «arco» por estrellas y «arco_el» por elemento) que va en el puño de la Arquera.
// - Al disparar, la Arquera usa su hoja «archer_atq» (fila 0: apunta, tensa, suelta, vuelve) y el arco sigue a su puño.
// - Las flechas de los arcos se dibujan con la hoja «flecha» (con estela, cargada o con elemento) y pegan con «f_impacto».
import { ANIM, drawSpr } from './02-pixel-art.js';
import { G } from './07-estado.js';

// armas con dibujo HD de arco y qué cuadro usan a 1★
const ARCO_HD = { short: ['arco', 0], triple: ['triple', 0], boom: ['boom', 0], sling: ['honda', 0] };
// cómo se sostiene cada dibujo: giro extra (la honda está de pie y apunta hacia arriba), píxeles de la empuñadura
// bajo el centro del cuadro, tamaño, y ángulo al llevarla colgando en reposo
const SOSTEN = { honda: { giro: Math.PI / 2, agarre: 44, s: .62, reposo: -1.0 } };
const SOSTEN_ARCO = { giro: 0, agarre: 0, s: .85, reposo: .55 };
const sosten = key => SOSTEN[key.split('_')[0].split('~')[0]] || SOSTEN_ARCO;
const ARCO_EL = { fire: 0, water: 1, air: 2, earth: 3 };
/** clave del dibujo HD del arco, o null si se dibuja por código */
function arcoKey(w) {
  if (!w || !(w.id in ARCO_HD)) return null;
  const [hoja, base] = ARCO_HD[w.id];
  if (!ANIM[hoja]) return null;
  if (w.el && ANIM[hoja + '_el']) return hoja + '_el~reposo~' + ARCO_EL[w.el];
  return hoja + '~reposo~' + Math.min(4, base + (w.stars || 1) - 1);
}
/** dibuja el arco con la empuñadura en (x, y), mirando hacia a (el dibujo está de pie y mira a la derecha) */
function drawArco(key, x, y, a, scale = 1) {
  const c = sosten(key), s = c.s * scale, off = c.agarre * .25 * s;   // la empuñadura queda en (x, y)
  drawSpr(key, x + Math.cos(a) * off, y + Math.sin(a) * off, s, { rot: a + c.giro });
}
// puño delantero en cada cuadro de archer_atq, fila 0 (píxeles del cuadro de 64; el centro es 32, 32)
const PUNO = [[49, 30], [49, 29], [50, 30], [44, 42]];
const TIRO = .3;   // segundos que dura la animación de un disparo
/** cuadro de la Arquera disparando (o tensando la carga) y dónde va el arco; null si no está disparando */
function tiroCuadro(p) {
  if (p.spr !== 'archer' || !ANIM.archer_atq) return null;
  const w = p.slots[p.cur]; if (!arcoKey(w)) return null;
  const e = G.time - (p.tiroAt ?? -9);
  let f;
  if (p.charge > 0) f = 1;                     // tensando el disparo cargado
  else if (e < 0 || e > TIRO) return null;
  else f = e < .06 ? 1 : e < .16 ? 2 : e < .25 ? 0 : 3;
  const lado = Math.cos(p.aim) >= 0 ? 1 : -1, [mx, my] = PUNO[f];
  if (f === 3) return { key: 'archer_atq~reposo~3', hx: p.x + lado * (mx - 32) * .5, hy: p.y - 2 + (my - 32) * .5, ang: lado > 0 ? .5 : Math.PI - .5, f };
  // el brazo apunta: el puño se mueve en círculo alrededor del hombro según hacia dónde apuntas
  const R = (mx - 36) * .5, sx = p.x + lado * 2, sy = p.y - 2 + (my - 32) * .5;
  // la empuñadura del dibujo queda un poco por delante del centro: se retrocede para que el puño la agarre
  return { key: 'archer_atq~reposo~' + f, hx: sx + Math.cos(p.aim) * (R - 1.5), hy: sy + Math.sin(p.aim) * (R - 1.5), ang: p.aim, f };
}
/** el arco en la mano de la Arquera cuando no dispara (colgando, un poco inclinado) */
function arcoEnMano(p) {
  if (p.spr !== 'archer' || !ANIM.archer) return null;
  const lado = p.flip ? -1 : 1, k = arcoKey(p.slots[p.cur]), r = k ? sosten(k).reposo : .55;
  return { hx: p.x + lado * 7.5, hy: p.y + 3.5, ang: lado > 0 ? r : Math.PI - r, s: .8 };
}
/** dibuja una flecha de arco HD; false si esta flecha no tiene dibujo HD */
function drawFlecha(pr) {
  if (pr.src && pr.src.shape === 'sling' && ANIM.piedra) {   // piedra de la honda
    const a = Math.atan2(pr.vy, pr.vx), key = pr.kind === 'power' ? 'piedra~reposo~2' : pr.src.el ? 'piedra~caminar~' + ARCO_EL[pr.src.el] : 'piedra~reposo~1';
    drawSpr(key, pr.x - Math.cos(a) * 4, pr.y - Math.sin(a) * 4, pr.kind === 'power' ? 1.5 : 1.25, { rot: a });
    return true;
  }
  if (!ANIM.flecha || !pr.src || pr.src.shape !== 'bow') return false;
  const a = Math.atan2(pr.vy, pr.vx);
  const bomba = (pr.fx === 'explode' || pr.boom) && ANIM.b_flecha;   // Arco explosivo: flecha con bomba y mecha encendida
  const key = bomba ? 'b_flecha~reposo~' + (pr.kind === 'power' ? 2 : Math.floor(G.time * 10) % 2)
    : pr.kind === 'power' ? 'flecha~reposo~2' : pr.src.el ? 'flecha~caminar~' + ARCO_EL[pr.src.el] : 'flecha~reposo~1';
  drawSpr(key, pr.x - Math.cos(a) * 6, pr.y - Math.sin(a) * 6, pr.kind === 'power' ? 1.35 : 1.1, { rot: a });
  return true;
}
/** true si esta flecha revienta con la explosión dibujada (Arco explosivo y cualquier arco con bomba) */
const bombaHD = pr => !!(pr.src && pr.src.shape === 'bow' && (pr.fx === 'explode' || pr.boom) && ANIM.b_explosion);
/** astillas y chispa cuando una flecha de arco pega */
function impactoFlecha(pr) {
  if (pr.src && pr.src.shape === 'sling' && ANIM.p_impacto) {   // polvo y lascas de la piedra
    G.parts.push({ x: pr.x, y: pr.y, vx: 0, vy: 0, life: .16, max: .16, fx: 'p_impacto', s: pr.kind === 'power' ? 1.1 : .8, rot: Math.atan2(pr.vy, pr.vx), color: '', size: 0 });
    return;
  }
  if (!ANIM.f_impacto || !pr.src || pr.src.shape !== 'bow') return;
  if (bombaHD(pr)) {   // la bomba revienta: destello, bola de fuego y humo, del tamaño de la explosión
    const R = pr.boom || 55;
    G.parts.push({ x: pr.x, y: pr.y, vx: 0, vy: 0, life: .4, max: .4, fx: 'b_explosion', s: R / 9, rot: 0, color: '', size: 0 });
    return;
  }
  G.parts.push({ x: pr.x, y: pr.y, vx: 0, vy: 0, life: .16, max: .16, fx: 'f_impacto', s: pr.kind === 'power' ? 1.1 : .8, rot: Math.atan2(pr.vy, pr.vx), color: '', size: 0 });
}

export { arcoEnMano, bombaHD, arcoKey, drawArco, drawFlecha, impactoFlecha, tiroCuadro };
