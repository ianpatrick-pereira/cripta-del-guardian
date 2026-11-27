// v0.68: el Arco corto de la Arquera en HD, dibujado por IA.
// - El arco es un dibujo aparte (hojas «arco» por estrellas y «arco_el» por elemento) que va en el puño de la Arquera.
// - Al disparar, la Arquera usa su hoja «archer_atq» (fila 0: apunta, tensa, suelta, vuelve) y el arco sigue a su puño.
// - Las flechas de los arcos se dibujan con la hoja «flecha» (con estela, cargada o con elemento) y pegan con «f_impacto».
import { ANIM, drawSpr } from './02-pixel-art.js';
import { G } from './07-estado.js';
import { impactoAlma } from './37g-baculo-hd.js';

// armas con dibujo HD de arco y qué cuadro usan a 1★
const ARCO_HD = { short: ['arco', 0], triple: ['triple', 0], boom: ['boom', 0], sling: ['honda', 0], xbow: ['xbow', 0], musket: ['musket', 0], shuriken: ['shuriken', 0] };
// cómo se sostiene cada dibujo: giro extra (la honda está de pie y apunta hacia arriba), píxeles de la empuñadura
// bajo el centro del cuadro, tamaño, y ángulo al llevarla colgando en reposo
// pesada: se dispara a dos manos (fila «caminar» de archer_atq: apunta, dispara, retroceso, vuelve)
const SOSTEN = { honda: { giro: Math.PI / 2, agarre: 44, s: .62, reposo: -1.0 }, xbow: { giro: 0, agarre: 6, s: .8, reposo: .35, pesada: true },
  musket: { giro: 0, agarre: 0, s: .75, reposo: .3, pesada: true },
  shuriken: { giro: 0, agarre: 0, s: .4, reposo: 0, lanzar: true } };   // v0.69: Estrellas ninja del Asesino
const SOSTEN_ARCO = { giro: 0, agarre: 0, s: .85, reposo: .55, pesada: false };
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
const PUNO_PESADA = [[45, 28], [51, 30], [50, 29], [44, 42]];   // fila 1 (arma pesada, puño delantero)
const TIRO = .3;   // segundos que dura la animación de un disparo
// v0.69: el Asesino lanzando (fila «herido» de rogue_atq: atrás, lanza, suelta, vuelve); puño en cada cuadro
const PUNO_LANZAR = [[20, 25], [55, 27], [55, 27], [44, 41]];
/** cuadro del Asesino lanzando estrellas; la estrella se ve en la mano solo antes de soltarla */
function lanzaCuadro(p, k) {
  if (!ANIM.rogue_atq || !sosten(k).lanzar) return null;
  const e = G.time - (p.tiroAt ?? -9), lado = Math.cos(p.aim) >= 0 ? 1 : -1;
  let f;
  if (p.charge > 0) f = 0;
  else if (e < 0 || e > TIRO) return null;
  else f = e < .05 ? 1 : e < .15 ? 2 : e < .22 ? 0 : 3;
  const [mx, my] = PUNO_LANZAR[f];
  return { key: 'rogue_atq~herido~' + f, hx: p.x + lado * (mx - 32) * .5, hy: p.y - 2 + (my - 32) * .5, ang: G.time * 6, f, oculta: f === 1 || f === 2 };
}
/** cuadro de la Arquera disparando (o tensando la carga) y dónde va el arco; null si no está disparando */
function tiroCuadro(p) {
  if (p.spr === 'rogue') { const k = arcoKey(p.slots[p.cur]); return k ? lanzaCuadro(p, k) : null; }
  if (p.spr !== 'archer' || !ANIM.archer_atq) return null;
  const w = p.slots[p.cur], k = arcoKey(w); if (!k) return null;
  const pesada = sosten(k).pesada, fila = pesada ? 'caminar' : 'reposo';
  const e = G.time - (p.tiroAt ?? -9);
  let f;
  if (p.charge > 0) f = pesada ? 0 : 1;        // apuntando / tensando el disparo cargado
  else if (e < 0 || e > TIRO) return null;
  else if (pesada) f = e < .07 ? 1 : e < .17 ? 2 : e < .26 ? 0 : 3;   // dispara, retroceso, apunta, vuelve
  else f = e < .06 ? 1 : e < .16 ? 2 : e < .25 ? 0 : 3;
  const lado = Math.cos(p.aim) >= 0 ? 1 : -1, [mx, my] = (pesada ? PUNO_PESADA : PUNO)[f];
  if (f === 3) return { key: 'archer_atq~' + fila + '~3', hx: p.x + lado * (mx - 32) * .5, hy: p.y - 2 + (my - 32) * .5, ang: lado > 0 ? .5 : Math.PI - .5, f };
  // el brazo apunta: el puño se mueve en círculo alrededor del hombro según hacia dónde apuntas
  const R = (mx - 36) * .5, sx = p.x + lado * 2, sy = p.y - 2 + (my - 32) * .5;
  // la empuñadura del dibujo queda un poco por delante del centro: se retrocede para que el puño la agarre
  return { key: 'archer_atq~' + fila + '~' + f, hx: sx + Math.cos(p.aim) * (R - 1.5), hy: sy + Math.sin(p.aim) * (R - 1.5), ang: p.aim, f };
}
/** el arco en la mano de la Arquera cuando no dispara (colgando, un poco inclinado) */
function arcoEnMano(p) {
  if (p.spr === 'rogue' && ANIM.rogue && sosten(arcoKey(p.slots[p.cur]) || '').lanzar) {
    // la estrella ninja en el puño del Asesino, quieta
    const lado = p.flip ? -1 : 1;
    return { hx: p.x + lado * 6, hy: p.y + 2.5, ang: 0, s: 1 };
  }
  if (p.spr !== 'archer' || !ANIM.archer) return null;
  const lado = p.flip ? -1 : 1, k = arcoKey(p.slots[p.cur]), r = k ? sosten(k).reposo : .55;
  return { hx: p.x + lado * 7.5, hy: p.y + 3.5, ang: lado > 0 ? r : Math.PI - r, s: .8 };
}
/** dibuja una flecha de arco HD; false si esta flecha no tiene dibujo HD */
// proyectiles propios de otras armas de la Arquera: hoja (fila 0: normal, con estela, cargado, impacto; fila 1: elementos),
// hoja del impacto y tamaño normal / cargado
const PROY = { sling: ['piedra', 'p_impacto', 1.25, 1.5], xbow: ['virote', 'vi_impacto', 1.15, 1.4], musket: ['mu_bala', 'mu_impacto', 1, 1.25] };
function drawFlecha(pr) {
  if (pr.src && pr.src.shape === 'shuriken' && ANIM.shuriken) {
    // estrella ninja: la misma del arma (con sus estrellas o su elemento), girando rápido
    drawSpr(arcoKey(pr.src) || 'shuriken~reposo~0', pr.x, pr.y, pr.kind === 'power' ? .7 : .55, { rot: G.time * 22 + pr.x * .01 });
    return true;
  }
  const P = pr.src && PROY[pr.src.shape];
  if (P && ANIM[P[0]]) {   // piedra de la honda, virote de la ballesta
    // cargado: disparo potente, o la bala gruesa del mosquete; la bala crece con su tamaño
    const a = Math.atan2(pr.vy, pr.vx), fuerte = pr.kind === 'power' || pr.r >= 7;
    const key = fuerte ? P[0] + '~reposo~2' : pr.src.el ? P[0] + '~caminar~' + ARCO_EL[pr.src.el] : P[0] + '~reposo~1';
    drawSpr(key, pr.x - Math.cos(a) * 4, pr.y - Math.sin(a) * 4, (fuerte ? P[3] : P[2]) * (pr.kind === 'ball' ? Math.max(1, pr.r / 7) : 1), { rot: a });
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
const bombaHD = pr => !!(pr.src && (pr.src.shape === 'bow' || pr.src.shape === 'musket') && (pr.fx === 'explode' || pr.boom) && ANIM.b_explosion);
/** astillas y chispa cuando una flecha de arco pega */
function impactoFlecha(pr) {
  if (impactoAlma(pr)) return;   // v0.70: alma del Báculo de almas
  if (pr.src && pr.src.shape === 'shuriken' && ANIM.shu_impacto) {
    G.parts.push({ x: pr.x, y: pr.y, vx: 0, vy: 0, life: .2, max: .2, fx: 'shu_impacto', s: .9, rot: 0, color: '', size: 0 });
    return;
  }
  const P = pr.src && PROY[pr.src.shape];
  if (P && ANIM[P[1]]) {   // polvo de la piedra, astillas del virote
    G.parts.push({ x: pr.x, y: pr.y, vx: 0, vy: 0, life: .16, max: .16, fx: P[1], s: pr.kind === 'power' ? 1.1 : .8, rot: Math.atan2(pr.vy, pr.vx), color: '', size: 0 });
    return;
  }
  if (bombaHD(pr)) {   // la bomba revienta: destello, bola de fuego y humo, del tamaño de la explosión
    const R = pr.boom || 55;
    G.parts.push({ x: pr.x, y: pr.y, vx: 0, vy: 0, life: .4, max: .4, fx: 'b_explosion', s: R / 9, rot: 0, color: '', size: 0 });
    return;
  }
  if (!ANIM.f_impacto || !pr.src || pr.src.shape !== 'bow') return;
  G.parts.push({ x: pr.x, y: pr.y, vx: 0, vy: 0, life: .16, max: .16, fx: 'f_impacto', s: pr.kind === 'power' ? 1.1 : .8, rot: Math.atan2(pr.vy, pr.vx), color: '', size: 0 });
}

/** disparo del mosquete: la Arquera hace el retroceso y sale el fogonazo por la boca del cañón; true si hay fogonazo dibujado (el humo ya viene en él) */
function fogonazo(p, w, a, grande = false) {
  p.tiroAt = G.time;
  if (!ANIM.mu_fogonazo || !arcoKey(w)) return false;
  const d = grande ? 32 : 26;
  G.parts.push({ x: p.x + Math.cos(a) * d, y: p.y - 2 + Math.sin(a) * d, vx: 0, vy: 0, life: .34, max: .34, fx: 'mu_fogonazo', s: grande ? 1.5 : 1.05, rot: a, color: '', size: 0 });
  return true;
}

export { arcoEnMano, bombaHD, fogonazo, arcoKey, drawArco, drawFlecha, impactoFlecha, tiroCuadro };
