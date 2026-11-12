// ================= Datos del juego =================
import { tr } from './00b-textos.js';
import { DATOS } from '../datos/index.js';
import { BOSS_DEFS, ENEMIES, WEAPON_DEFS, bossList, enemyList, weaponList } from './01a-registro.js';
import { SAVE } from './04-guardado.js';
import { G, rc } from './07-estado.js';
import { STYLE, elAbName } from './12-armas-con-estilo-propio.js';
import { ELEMS } from './23-elementos.js';
const RARITY = {
  common:   { n: tr('Común'),      c: '#bdb6a8' },
  uncommon: { n: tr('Poco común'), c: '#6cc46a' },
  rare:     { n: tr('Rara'),       c: '#5aa4e8' },
  epic:     { n: tr('Épica'),      c: '#bb7cf0' },
  // nivel de estrellas de cada arma (1 = base, 5 = legendaria)
  s1: { n: '★☆☆☆☆', c: '#bdb6a8' },
  s2: { n: '★★☆☆☆', c: '#6cc46a' },
  s3: { n: '★★★☆☆', c: '#5aa4e8' },
  s4: { n: '★★★★☆', c: '#bb7cf0' },
  s5: { n: '★★★★★', c: '#ffb03a' },
};
const RORDER = ['common', 'uncommon', 'rare', 'epic'];
const RWEIGHT = DATOS.botin.rarezaArmas;   // se cambia en src/datos/botin.jsonc
// cada arma vive en su archivo de 01c-armas/; el orden importa para el sorteo de botín
const WEAPONS = weaponList().map(id => ({ id, ...WEAPON_DEFS[id].datos }));
// el ataque cargado evoluciona con las estrellas del arma
const CHG_LV = {
  spin:   [tr('Giro'), tr('Giro amplio'), tr('Doble giro'), tr('Giro de cuchillas'), tr('Tormenta de acero')],
  quake:  [tr('Terremoto'), tr('Gran terremoto'), tr('Réplica'), tr('Ondas sísmicas'), tr('Meteoro')],
  lunge:  [tr('Embestida'), tr('Embestida larga'), tr('Doble embestida'), tr('Embestida de cuchillas'), tr('Danza mortal')],
  power:  [tr('Disparo potente'), tr('Flecha perforante'), tr('Tridente'), tr('Flecha divisoria'), tr('Andanada')],
  volley: [tr('Abanico'), tr('Gran abanico'), tr('Doble abanico'), tr('Abanico rebotante'), tr('Tormenta de flechas')],
  nova:   [tr('Nova'), tr('Gran nova'), tr('Doble nova'), tr('Espiral arcana'), tr('Cataclismo')],
  boomer: [tr('Doble bumerán'), tr('Bumerán triple'), tr('Órbita'), tr('Órbita doble'), tr('Tormenta de bumeranes')],
  lash:   [tr('Latigazo circular'), tr('Doble latigazo'), tr('Cadena atrapante'), tr('Látigo de púas'), tr('Tormenta de cadenas')],
  bash:   [tr('Empujón'), tr('Gran empujón'), tr('Carga con escudo'), tr('Muro de púas'), tr('Baluarte de púas')],
  blast:  [tr('Perdigonada'), tr('Perdigonada amplia'), tr('Bala explosiva'), tr('Bala encadenada'), tr('Cañonazo')],
  reap:   [tr('Hoz gigante'), tr('Doble hoz'), tr('Remolino de hoces'), tr('Hoces errantes'), tr('Cosecha')],
  legion: [tr('Legión'), tr('Legión mayor'), tr('Caballero óseo'), tr('Ejército'), tr('Rey de huesos')],
  ray:    [tr('Rayo concentrado'), tr('Rayo doble'), tr('Prisma'), tr('Rayo giratorio'), tr('Aniquilación')],
};
const chgName = w => CHG_LV[w.chg][(w.stars || 1) - 1];
const FX_NAME = { stun: tr('aturde'), push: tr('empuja lejos'), slow: tr('ralentiza'), burn: tr('quema'), poison: tr('envenena'), explode: tr('explota'), chain: tr('rayo en cadena'), homing: tr('teledirigido') };
// cada arma es un tipo base + un nivel de estrellas + mejoras de la forja
function mkW(id, stars = 1) {
  const b = WEAPONS.find(w => w.id === id);
  return applyW({ ...b, tier: b.rarity, base: b, stars, up: { dmg: 0, rate: 0, chg: 0, en: 0, esp: 0, bones: 0 }, el: null, elC: 0, elLv: 0 });
}
// el poder lo marcan las estrellas: a igual nivel todas las armas rinden parecido (daño por segundo),
// y cada estrella sube el daño lo bastante para que se note el salto de color
const STAR_MUL = [1, 1.5, 2.2, 3.1, 4.3];
const REF_DPS = { melee: 9, bow: 8, staff: 8 };   // v0.48: arcos y bastones +14 %
// armas que golpean varias veces, atraviesan o dañan en área rinden menos por golpe
const PW = {};
for (const id in WEAPON_DEFS) if (WEAPON_DEFS[id].potencia) PW[id] = WEAPON_DEFS[id].potencia;
const baseDmg = b => REF_DPS[b.type] * b.cd / (b.shots || 1) * (PW[b.id] || 1);
// cada clase domina una familia de armas: +30 % con las suyas, −30 % con las de otra clase; los bastones son neutrales
let CUR_CHAR = 'knight';
const FAMILY = { knight: [], archer: [], rogue: [] };
for (const id of weaponList()) if (WEAPON_DEFS[id].familia) FAMILY[WEAPON_DEFS[id].familia].push(id);
function affinity(id, ch = CUR_CHAR) {
  if (FAMILY[ch] && FAMILY[ch].includes(id)) return 1;
  for (const k in FAMILY) if (k !== ch && FAMILY[k].includes(id)) return -1;
  return 0;
}
function applyW(w) {
  const b = w.base, s = w.stars, u = w.up;
  w.rarity = 's' + s;
  w.elMul = w.el ? 1.1 + .05 * ((w.elC || 0) + Math.max(0, (w.elLv || 0) - 1)) : 1;
  w.aff = affinity(b.id);
  w.dmg = Math.max(1, Math.round(baseDmg(b) * STAR_MUL[s - 1] * (1 + .08 * u.dmg) * w.elMul * (1 + .3 * w.aff)));
  w.cd = +(b.cd * Math.pow(.9, u.rate)).toFixed(3);
  w.en = Math.max(0, b.en + Math.floor((s - 1) / 2) - u.en);
  w.chgEn = Math.max(4, Math.round((b.chgEn + 5 * (s - 1)) * (1 - .12 * u.en)));
  w.chgMul = 1 + .2 * u.chg;
  w.elOn = !!w.el && w.elC >= 3;
  return w;
}
const W = id => mkW(id, 1);
// arma inicial: siempre 1★; las que no son del personaje se compran con gemas
const START_COST = { common: 2, uncommon: 3, rare: 5, epic: 7 };
function starterW(id) { const w = mkW(id, 1); w.starter = true; return applyW(w); }
// probabilidad de cada nivel de estrellas según de dónde sale el arma
const STAR_W = (E => ({ enemy: E.enemigo, chest: E.cofre, gold: E.cofreDorado, shop: E.tienda }))(DATOS.botin.estrellas);   // src/datos/botin.jsonc
function rollStars(src) {
  const wts = STAR_W[src].slice();
  if (rc('trebol')) for (let i = 2; i < 5; i++) wts[i] *= 1.7;
  const cap = G && G.floor >= 3 ? 5 : 3;              // 4★ y 5★ solo desde el piso 3
  for (let i = cap; i < 5; i++) wts[i] = 0;
  let roll = Math.random() * wts.reduce((a, b) => a + b, 0);
  for (let i = 0; i < 5; i++) { roll -= wts[i]; if (roll <= 0) return i + 1; }
  return 1;
}
function rollWeapon(src = 'chest') {
  const pool = src === 'gold' ? WEAPONS.filter(w => w.rarity !== 'common') : WEAPONS;
  let roll = Math.random() * pool.reduce((a, w) => a + RWEIGHT[w.rarity], 0), t = pool[0];
  for (const w of pool) { roll -= RWEIGHT[w.rarity]; if (roll <= 0) { t = w; break; } }
  return mkW(t.id, rollStars(src));
}
function weaponStats(w) {
  const parts = [tr`${w.dmg} daño${w.shots > 1 ? ' ×' + w.shots : ''}`, `${w.en ? w.en + tr(' energía') : tr('sin coste')}`, tr`carga: ${chgName(w)} (${w.chgEn})`];
  const nUp = w.up ? w.up.dmg + w.up.rate + w.up.chg + w.up.en + (w.up.esp || 0) + (w.up.bones || 0) : 0;
  if (w.style) parts.push(STYLE[w.style].d);
  if (nUp) parts.push(tr`forjada +${nUp}`);
  if (w.aff) parts.push(w.aff > 0 ? tr('afín a tu clase +30 %') : tr('de otra clase −30 %'));
  if (w.spd) parts.push(tr`+${Math.round(w.spd * 100)} % velocidad`);
  if (w.dodge) parts.push(tr`esquiva −${Math.round(w.dodge * 100)} % recarga`);
  if (w.veil) parts.push(tr`al matar ${String(w.veil).replace('.', ',')} s invisible`);
  if (w.back) parts.push(tr`+${Math.round(w.back * 100)} % por la espalda`);
  if (w.starter) parts.push(tr('inicial'));
  if (w.el) parts.push(tr`+${Math.round((w.elMul - 1) * 100)} % daño elemental`);
  if (w.el) parts.push(w.elOn ? tr`${ELEMS[w.el].n}: ${elAbName(w)} Nv${w.elLv}` : `${ELEMS[w.el].n} ${w.elC}/3`);
  if (w.fx) parts.push(FX_NAME[w.fx]);
  if (w.pierce && w.pierce < 99) parts.push(tr('atraviesa ') + w.pierce);
  if (w.pierce >= 99) parts.push(tr('atraviesa todo'));
  if (w.leech) parts.push(tr('roba vida'));
  return parts.join(' · ');
}

const RELICS = {
  corazon:  { n: tr('Corazón de piedra'),  d: tr('+2 de vida máxima y te cura 2.'), c: '#d4474b' },
  escudo:   { n: tr('Escudo rúnico'),      d: tr('+1 de escudo máximo.'), c: '#8fb7d9' },
  botas:    { n: tr('Botas de viento'),    d: tr('+15 % de velocidad.'), c: '#9be0c8' },
  rebote:   { n: tr('Flechas rebotantes'), d: tr('Tus flechas rebotan una vez en las paredes.'), c: '#e3a24a', u: 1 },
  onda:     { n: tr('Onda cortante'),      d: tr('Los tajos de espada lanzan una onda.'), c: '#ece4cf', u: 1 },
  veneno:   { n: tr('Colmillo venenoso'),  d: tr('Tus golpes envenenan: 1 de daño por segundo durante 3 s.'), c: '#9be05a', u: 1 },
  ojo:      { n: tr('Ojo del cazador'),    d: tr('+15 % de probabilidad de crítico.'), c: '#ffd27a' },
  vampiro:  { n: tr('Sangre de vampiro'),  d: tr('Cada 12 enemigos derrotados recuperas 1 de vida.'), c: '#b0303a', u: 1 },
  carcaj:   { n: tr('Carcaj extra'),       d: tr('Los arcos disparan 1 flecha más.'), c: '#c9a46a' },
  piedra:   { n: tr('Piedra de afilar'),   d: tr('+20 % de daño.'), c: '#bdb6a8' },
  reloj:    { n: tr('Reloj de arena'),     d: tr('La esquiva recarga un 40 % más rápido.'), c: '#e8d08a', u: 1 },
  iman:     { n: tr('Imán de oro'),        d: tr('Atraes monedas desde lejos y los enemigos sueltan más.'), c: '#f0c040', u: 1 },
  bateria:  { n: tr('Batería arcana'),     d: tr('+40 de energía máxima y se recarga más rápido.'), c: '#5aa4e8' },
  espinas:  { n: tr('Coraza de espinas'),  d: tr('Al recibir daño disparas espinas alrededor.'), c: '#7a9a5a', u: 1 },
  trebol:   { n: tr('Trébol de cuatro'),   d: tr('Los cofres sueltan mejores armas y un objeto extra.'), c: '#6cc46a', u: 1 },
  polvora:  { n: tr('Pólvora negra'),      d: tr('Al esquivar dejas una bomba. Las explosiones no te dañan.'), c: '#8a84a0', u: 1 },
};

const CHARS = {
  knight: { name: tr('Caballero'), spr: 'knight', hp: 8, sh: 3, speed: 175, en: 100, start: ['rusty', 'club'], abil: tr('Baluarte'), abilDesc: tr('2,5 s invulnerable; las balas que te tocan rebotan.'), cd: 14, cost: 0,
            role: tr('Aguanta y castiga de cerca'), fam: tr('espadas, mazas, lanzas y escudo'),
            mech: tr('Desvío: si te golpean justo después de atacar, anulas el golpe y contraatacas. Represalia: tras recibir daño, tu siguiente golpe hace +50 %. Esquiva: carga con escudo que daña y empuja.') },
  archer: { name: tr('Tirador'),   spr: 'archer', hp: 6, sh: 3, speed: 190, en: 140, start: ['short', 'sling'], abil: tr('Lluvia de flechas'), abilDesc: tr('3 oleadas de flechas en todas direcciones.'), cd: 10, cost: 10,
            role: tr('Mantén la distancia y apunta'), fam: tr('arcos, honda, ballesta, mosquete y bumerán'),
            mech: tr('Concentración: cada disparo la carga; llena, lanzas una flecha dorada ×3 que lo atraviesa todo. Recibir daño la vacía. Esquiva: voltereta larga.') },
  rogue:  { name: tr('Asesino'),   spr: 'rogue',  hp: 5, sh: 4, speed: 205, en: 100, start: ['dagger', 'wand'], abil: tr('Sombra'), abilDesc: tr('3 s invisible, más rápido y todo golpe es crítico.'), cd: 12, cost: 20,
            role: tr('Entra, golpea por la espalda y sal'), fam: tr('dagas, katar, garras, kunais, shurikens, cerbatana, látigo, guadaña, hoz, arco sombrío y bastón de veneno'),
            mech: tr('Por la espalda: ×2 a quien no te mira. Combo: cada golpe seguido suma +5 % (hasta +50 %). Matar recarga la esquiva. Esquiva: parpadeo que te vuelve invisible un instante.') },
};
const UPG = {
  hp:   { name: tr('Vitalidad'),      desc: tr('+1 de vida máxima por nivel'), max: 5, cost: [2, 3, 4, 5, 6] },
  coin: { name: tr('Bolsa heredada'), desc: tr('+10 monedas al empezar por nivel'), max: 5, cost: [1, 2, 3, 4, 5] },
  en:   { name: tr('Reserva arcana'), desc: tr('+15 de energía máxima por nivel'), max: 5, cost: [2, 3, 4, 5, 6] },
  // mejoras propias de cada clase: el altar muestra solo las del personaje elegido
  k_parry: { cls: 'knight', name: tr('Temple'),          desc: tr('El Desvío se recarga 0,3 s antes por nivel'), max: 5, cost: [2, 3, 4, 5, 6] },
  k_bash:  { cls: 'knight', name: tr('Escudo pesado'),   desc: tr('+20 % de daño de la carga con escudo y +10 % de Represalia por nivel'), max: 5, cost: [2, 3, 4, 5, 6] },
  a_focus: { cls: 'archer', name: tr('Pulso sereno'),    desc: tr('La Concentración se llena un 10 % más rápido por nivel'), max: 5, cost: [2, 3, 4, 5, 6] },
  a_gold:  { cls: 'archer', name: tr('Flecha dorada'),   desc: tr('El disparo concentrado hace +0,4× de daño por nivel (×3 → ×5)'), max: 5, cost: [2, 3, 4, 5, 6] },
  r_back:  { cls: 'rogue',  name: tr('Instinto letal'),  desc: tr('+20 % de daño por la espalda por nivel'), max: 5, cost: [2, 3, 4, 5, 6] },
  r_veil:  { cls: 'rogue',  name: tr('Pasos ligeros'),   desc: tr('+0,1 s de invisibilidad al esquivar y +3 % de velocidad por nivel'), max: 5, cost: [2, 3, 4, 5, 6] },
};
// nivel de una mejora de clase comprada para esta partida
const cu = id => (G && G.player && G.player.cu && G.player.cu[id]) || 0;

const DIFFS = {
  easy:   { name: tr('Aprendiz'),  desc: tr('Enemigos con menos vida, más lentos para atacar y peor puntería. Gemas ×0,75.'), hp: .75, rate: .8, count: -1, elite: -.05, lead: .25, dodge: .15, tokens: 2, gem: .75 },
  normal: { name: tr('Guardián'),  desc: tr('La experiencia pensada: los enemigos te rodean, anticipan y esquivan.'), hp: 1, rate: 1, count: 0, elite: 0, lead: .6, dodge: .4, tokens: 3, gem: 1 },
  hard:   { name: tr('Pesadilla'), desc: tr('Más vida, más enemigos y élites, ataques más rápidos y puntería casi perfecta. Gemas ×1,5.'), hp: 1.3, rate: 1.22, count: 1, elite: .08, lead: .9, dodge: .65, tokens: 5, gem: 1.5 },
};
function D() { return (G && G.dx) || DIFFS[(G && G.diff) || SAVE.diff] || DIFFS.normal; }

// las estadísticas de cada enemigo viven en su archivo de 01b-enemigos/
const ENEMY = {};
for (const id of enemyList()) ENEMY[id] = ENEMIES[id].stats;

// los pisos se diseñan en src/datos/pisos/ (un archivo por piso); aquí se traducen al formato del motor
const FLOORS = DATOS.pisos.map(d => {
  const C = d.colores, f = { name: d.nombre, pal: { fa: C.sueloA, fb: C.sueloB, crack: C.grietas, wt: C.muroArriba, wf: C.muroFrente, we: C.muroBorde, sp: C.manchas },
    pool1: d.enemigosCerca, pool2: d.enemigosLejos, boss: d.jefe, light: [d.luz.clara, d.luz.hastaNoche, d.luz.oscuridad], elite: d.elites,
    music: { root: d.musica.nota, tempo: d.musica.tempo }, mar: d.mar };
  if (d.terror) { f.music.horror = true; f.horror = true; }
  return f;
});
// oleadas y botín: src/datos/oleadas.jsonc y src/datos/botin.jsonc
const OLEADAS = DATOS.oleadas, BOTIN = DATOS.botin;
// cada jefe vive en su archivo de 01e-jefes/
const BOSSES = {};
for (const id of bossList()) BOSSES[id] = BOSS_DEFS[id].datos;

// Otros módulos no pueden reasignar estas variables directamente (un import es de solo lectura): usan estas funciones.
function setCUR_CHAR(v) { return (CUR_CHAR = v); }

export { BOSSES, BOTIN, CHARS, CUR_CHAR, D, DIFFS, ENEMY, FLOORS, OLEADAS, RARITY, RELICS, RORDER, START_COST,
  STAR_MUL, UPG, W, WEAPONS, applyW, chgName, cu, mkW, rollStars, rollWeapon, setCUR_CHAR, starterW,
  weaponStats };
