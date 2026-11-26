// v0.66: la Espada del Caballero en HD (Espada oxidada y Espada de hierro), dibujada por IA.
// - La espada es un dibujo aparte (hojas «espada» por estrellas y «espada_el» por elemento) que se pega a la mano.
// - Al atacar, el Caballero usa su hoja «knight_atq» (puño vacío) y la espada sigue a su mano cuadro a cuadro.
// - Combo de 3 golpes (11-jugador.js): tajo, revés y estocada; el cargado es el giro (crece con las estrellas).
// - Cada golpe deja su corte dibujado (c_tajo, c_reves, c_estocada, c_giro) o, con elemento, el de su elemento (c_fire...).
import { TAU, clamp } from './01-utilidades.js';
import { ANIM, drawSpr } from './02-pixel-art.js';
import { G } from './07-estado.js';

// armas con dibujo HD: su hoja y qué cuadro usan a 1★ (la de hierro y el martillo empiezan más arriba)
const ESPADA_HD = { rusty: ['espada', 0], iron: ['espada', 1], club: ['mazo', 0], hammer: ['mazo', 2], spear: ['lanza', 0], spiked: ['escudo', 0], shortsword: ['corta', 0] };
// por hoja: píxeles de la empuñadura bajo el centro del cuadro y tamaño en pantalla
const AGARRE = { espada: [28, 1.5], mazo: [26, 1.35], lanza: [22, 1.3], escudo: [0, 1.3], corta: [22, 1.3] };
/** true si el arma es un mazo HD (Garrote o Martillo de guerra) */
const esMazo = w => !!w && ESPADA_HD[w.id]?.[0] === 'mazo' && !!ANIM.mazo;
/** true si el arma es el escudo de púas HD */
const esEscudo = w => !!w && ESPADA_HD[w.id]?.[0] === 'escudo' && !!ANIM.escudo;
/** true si el arma es la lanza HD */
const esLanza = w => !!w && ESPADA_HD[w.id]?.[0] === 'lanza' && !!ANIM.lanza;
const EL_I = { fire: 0, water: 1, air: 2, earth: 3 };
/** clave del dibujo HD de esta arma, o null si se dibuja por código */
function espadaKey(w) {
  if (!w || !(w.id in ESPADA_HD)) return null;
  const [hoja, base] = ESPADA_HD[w.id];
  if (!ANIM[hoja]) return null;
  if (w.el && ANIM[hoja + '_el']) return hoja + '_el~reposo~' + EL_I[w.el];
  return hoja + '~reposo~' + Math.min(4, base + (w.stars || 1) - 1);
}
/** dibuja la espada con la empuñadura en (x, y) y la hoja hacia el ángulo a (el dibujo apunta hacia arriba) */
function drawEspada(key, x, y, a, scale = 1) {
  if (key.startsWith('escudo')) {
    // el escudo se ve de frente; de lado se angosta un poco
    drawSpr(key, x, y, 1.3 * scale, { sx: .65 + .35 * Math.abs(Math.sin(a)) });
    return;
  }
  const [px, t] = AGARRE[key.startsWith('mazo') ? 'mazo' : key.startsWith('lanza') ? 'lanza' : key.startsWith('corta') ? 'corta' : 'espada'], s = t * scale, off = px * .25 * s;   // la empuñadura, px por debajo del centro
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
// mazazo (3.er golpe del mazo y terremoto cargado): brazo arriba, baja, golpe abajo, guardia (cuadros de knight_atq)
/** @type {[string, number, number[]][]} */
const MAZAZO = [['reposo', 0, MANO[0][0]], ['reposo', 1, MANO[0][1]], ['herido', 1, MANO[2][1]], ['reposo', 3, MANO[0][3]]];
/** cuadro del Caballero atacando y dónde tiene la mano, o null si no toca */
function golpeCuadro(p) {
  const s = p.swing, w = p.slots[p.cur];
  if (p.spr !== 'knight' || !ANIM.knight_atq || !espadaKey(w) || esEscudo(w)) return null;
  const lado0 = p.flip ? -1 : 1;
  if (esLanza(w) && p.lunge && p.dashT > 0) {
    // embestida: brazo estirado y la lanza hacia donde te lanzas
    const [mx, my] = MANO[2][2];
    return { key: 'knight_atq~herido~2', hx: p.x + lado0 * (mx - 32) * .5, hy: p.y - 2 + (my - 32) * .5, ang: Math.atan2(p.dvy, p.dvx), fija: true };
  }
  if (!s) return null;
  const prog = clamp(s.t / s.dur, 0, .999), lado = p.flip ? -1 : 1;
  if (esMazo(w) && (s.golpe === 2 || s.smash)) {
    // el mazo se levanta por detrás de la cabeza y cae hacia donde apuntas (o al suelo, en el terremoto)
    const i = prog < .3 ? 0 : prog < .5 ? 1 : prog < .8 ? 2 : 3, [f, n, [mx, my]] = MAZAZO[i];
    const fin = s.smash ? (lado > 0 ? 1.2 : Math.PI - 1.2) : s.a, arriba = lado > 0 ? -Math.PI / 2 - .5 : -Math.PI / 2 + .5;
    const ang = [arriba, lado > 0 ? -.7 : Math.PI + .7, fin, fin + lado * .3][i];
    return { key: 'knight_atq~' + f + '~' + n, hx: p.x + lado * (mx - 32) * .5, hy: p.y - 2 + (my - 32) * .5, ang };
  }
  if (esLanza(w) && !s.spin && s.golpe !== 1) {
    // estocadas de la lanza (la doble repite el movimiento dos veces): la punta siempre hacia donde apuntas
    const pr = s.golpe === 2 ? (prog * 2) % 1 : prog, i = pr < .2 ? 0 : pr < .45 ? 1 : pr < .8 ? 2 : 3, [mx, my] = MANO[2][i];
    return { key: 'knight_atq~herido~' + i, hx: p.x + lado * (mx - 32) * .5, hy: p.y - 2 + (my - 32) * .5, ang: s.a, fija: true };
  }
  const fila = s.spin ? 3 : s.golpe || 0;
  const i = s.spin ? Math.floor(prog * 4) : prog < .2 ? 0 : prog < .55 ? 1 : prog < .85 ? 2 : 3;
  const [mx, my] = MANO[fila][i];
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
  if (esMazo(w) && !el) {
    // mazo: barrido de polvo y piedras (el revés, en espejo); el mazazo deja su golpe en el suelo (mazazoFx)
    if (s.golpe !== 2 && ANIM.m_barrido) drawSpr('m_barrido~reposo~' + i, p.x + Math.cos(a) * R * .4, p.y + Math.sin(a) * R * .4, R / 75 / .25, { rot: a, sy: s.golpe === 1 ? -1 : 1 });
    return;
  }
  if (esMazo(w) && s.golpe === 2) return;
  if (esLanza(w) && s.golpe !== 1) {
    // estocada: estela recta que llega hasta el alcance (la doble, dos veces); con elemento, su estocada
    const pr = s.golpe === 2 ? (prog * 2) % 1 : prog, j = Math.min(3, Math.floor(pr * 4)), d = R * .55;
    const key = w.el && ANIM.l_el ? 'l_el~reposo~' + EL_I[w.el] : 'l_estocada~reposo~' + j;
    drawSpr(key, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, R / 26, { rot: a, alpha: w.el ? 1 - pr * pr : 1 });
    return;
  }
  if (esLanza(w) && !el) {
    drawSpr('l_barrido~reposo~' + i, p.x + Math.cos(a) * R * .35, p.y + Math.sin(a) * R * .35, R / 70 / .25, { rot: a, sy: -1 });
    return;
  }
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
  if (s.smash && esMazo(w) && ANIM.m_terremoto && !(w.el && ANIM['c_' + w.el])) {
    // terremoto del mazo: anillo de polvo y losas rotas que crece hasta el alcance
    drawSpr('m_terremoto~reposo~' + Math.min(3, Math.floor(prog * 4)), p.x, p.y + 4, s.range / 15, { alpha: .9 - prog * prog * .5 });
    return;
  }
  const el = w.el && ANIM['c_' + w.el] ? w.el : null, f = s.range * .6 / 41;
  drawSpr(el ? `c_${el}~reposo~2` : 'c_giro~reposo~' + (Math.floor(G.time * 12) % 2), p.x, p.y, f / .25, { rot: s.a + prog * TAU * 1.2, alpha: .85 - prog * prog * .7 });
}
/** chispa (o golpe de su elemento) donde la espada pega */
function impactoEspada(w, x, y, a) {
  if (!espadaKey(w)) return;
  const mazo = esMazo(w) && ANIM.m_impacto, lanza = esLanza(w) && ANIM.l_impacto, esc = esEscudo(w) && ANIM.e_golpe;
  const fx = w.el && ANIM['c_' + w.el] ? 'c_' + w.el : mazo ? 'm_impacto' : lanza ? 'l_impacto' : esc ? 'e_golpe' : 'c_impacto';
  G.parts.push({ x, y, vx: 0, vy: 0, life: mazo ? .3 : .2, max: mazo ? .3 : .2, fx, s: mazo && !w.el ? 1.2 : 1.6, rot: mazo ? 0 : a, color: '', size: 0 });
}
/** empujón del escudo (y la onda del golpe cargado, más grande) */
function drawEmpujon(p, w, s, prog) {
  if (!esEscudo(w)) return false;
  const i = Math.min(3, Math.floor(prog * 4)), a = s.a, R = s.range, grande = R > 70;
  const key = grande && ANIM.e_onda ? 'e_onda~reposo~' + i : 'e_empuje~reposo~' + i;
  drawSpr(key, p.x + Math.cos(a) * R * (grande ? .4 : .55), p.y + Math.sin(a) * R * (grande ? .4 : .55), R / (grande ? 30 : 17), { rot: a, alpha: grande ? .85 : 1 });
  return true;
}
/** destello del escudo al parar una bala */
function bloqueoFx(p, pr) {
  const w = p.slots[p.cur]; if (!esEscudo(w) || !ANIM.e_bloqueo) return;
  const a = p.aim;
  G.parts.push({ x: p.x + Math.cos(a) * 16, y: p.y + Math.sin(a) * 16, vx: 0, vy: 0, life: .3, max: .3, fx: 'e_bloqueo', s: 1.4, rot: a, color: '', size: 0 });
}
/** púa del escudo en vuelo; devuelve true si la dibujó */
function drawPua(pr) {
  if (!pr.src || !esEscudo(pr.src) || !ANIM.e_pua) return false;
  drawSpr('e_pua~reposo~' + (Math.floor(G.time * 12) % 4), pr.x, pr.y, 1.2, { rot: Math.atan2(pr.vy, pr.vx) });
  return true;
}
/** estela de la embestida cargada de la lanza (detrás del Caballero) */
function drawEmbestida(p, w) {
  if (!esLanza(w) || !p.lunge || !(p.dashT > 0) || !ANIM.l_embestida) return;
  const a = Math.atan2(p.dvy, p.dvx), k = 1 - p.dashT / (p.lunge.len || .24), i = Math.min(3, Math.floor(k * 4));
  drawSpr('l_embestida~reposo~' + i, p.x - Math.cos(a) * 14, p.y + 2 - Math.sin(a) * 14, 2.2, { rot: a, alpha: .9 });
}
/** golpe del mazazo en el suelo, delante de ti, cuando el mazo cae */
function mazazoFx(p, w, R) {
  if (!esMazo(w)) return;
  const x = p.x + Math.cos(p.aim) * R * .6, y = p.y + Math.sin(p.aim) * R * .6, el = w.el && ANIM['c_' + w.el] ? 'c_' + w.el : null;
  G.parts.push(el ? { x, y, vx: 0, vy: 0, life: .3, max: .3, fx: el, s: R / 40, color: '', size: 0, pre: .08 }
    : { x, y: y + 4, vx: 0, vy: 0, life: .55, max: .55, fx: 'm_mazazo', s: R / 22, color: '', size: 0, pre: .08 });
}

export { bloqueoFx, drawCorte, drawCorteGiro, drawEmbestida, drawEmpujon, drawEspada, drawPua, esEscudo, esLanza, esMazo, espadaEnMano, espadaKey, golpeCuadro, impactoEspada, mazazoFx };
