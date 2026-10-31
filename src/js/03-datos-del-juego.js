// ================= Datos del juego =================
const RARITY = {
  common:   { n: 'Común',      c: '#bdb6a8' },
  uncommon: { n: 'Poco común', c: '#6cc46a' },
  rare:     { n: 'Rara',       c: '#5aa4e8' },
  epic:     { n: 'Épica',      c: '#bb7cf0' },
  // nivel de estrellas de cada arma (1 = base, 5 = legendaria)
  s1: { n: '★☆☆☆☆', c: '#bdb6a8' },
  s2: { n: '★★☆☆☆', c: '#6cc46a' },
  s3: { n: '★★★☆☆', c: '#5aa4e8' },
  s4: { n: '★★★★☆', c: '#bb7cf0' },
  s5: { n: '★★★★★', c: '#ffb03a' },
};
const RORDER = ['common', 'uncommon', 'rare', 'epic'];
const RWEIGHT = { common: 46, uncommon: 34, rare: 15, epic: 5 };
// cada arma vive en su archivo de 01c-armas/; el orden importa para el sorteo de botín
const WEAPONS = weaponList().map(id => ({ id, ...WEAPON_DEFS[id].datos }));
// el ataque cargado evoluciona con las estrellas del arma
const CHG_LV = {
  spin:   ['Giro', 'Giro amplio', 'Doble giro', 'Giro de cuchillas', 'Tormenta de acero'],
  quake:  ['Terremoto', 'Gran terremoto', 'Réplica', 'Ondas sísmicas', 'Meteoro'],
  lunge:  ['Embestida', 'Embestida larga', 'Doble embestida', 'Embestida de cuchillas', 'Danza mortal'],
  power:  ['Disparo potente', 'Flecha perforante', 'Tridente', 'Flecha divisoria', 'Andanada'],
  volley: ['Abanico', 'Gran abanico', 'Doble abanico', 'Abanico rebotante', 'Tormenta de flechas'],
  nova:   ['Nova', 'Gran nova', 'Doble nova', 'Espiral arcana', 'Cataclismo'],
  boomer: ['Doble bumerán', 'Bumerán triple', 'Órbita', 'Órbita doble', 'Tormenta de bumeranes'],
  lash:   ['Latigazo circular', 'Doble latigazo', 'Cadena atrapante', 'Látigo de púas', 'Tormenta de cadenas'],
  bash:   ['Empujón', 'Gran empujón', 'Carga con escudo', 'Muro de púas', 'Baluarte de púas'],
  blast:  ['Perdigonada', 'Perdigonada amplia', 'Bala explosiva', 'Bala encadenada', 'Cañonazo'],
  reap:   ['Hoz gigante', 'Doble hoz', 'Remolino de hoces', 'Hoces errantes', 'Cosecha'],
  legion: ['Legión', 'Legión mayor', 'Caballero óseo', 'Ejército', 'Rey de huesos'],
  ray:    ['Rayo concentrado', 'Rayo doble', 'Prisma', 'Rayo giratorio', 'Aniquilación'],
};
const chgName = w => CHG_LV[w.chg][(w.stars || 1) - 1];
const FX_NAME = { stun: 'aturde', push: 'empuja lejos', slow: 'ralentiza', burn: 'quema', poison: 'envenena', explode: 'explota', chain: 'rayo en cadena', homing: 'teledirigido' };
// cada arma es un tipo base + un nivel de estrellas + mejoras de la forja
function mkW(id, stars = 1) {
  const b = WEAPONS.find(w => w.id === id);
  return applyW({ ...b, tier: b.rarity, base: b, stars, up: { dmg: 0, rate: 0, chg: 0, en: 0, esp: 0, bones: 0 }, el: null, elC: 0, elLv: 0 });
}
// el poder lo marcan las estrellas: a igual nivel todas las armas rinden parecido (daño por segundo),
// y cada estrella sube el daño lo bastante para que se note el salto de color
const STAR_MUL = [1, 1.5, 2.2, 3.1, 4.3];
const REF_DPS = { melee: 9, bow: 7, staff: 7 };
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
const STAR_W = { enemy: [64, 27, 7, 1.6, .4], chest: [33, 34, 20, 9, 4], gold: [0, 46, 34, 14, 6], shop: [0, 50, 42, 6, 2] };
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
  const parts = [`${w.dmg} daño${w.shots > 1 ? ' ×' + w.shots : ''}`, `${w.en ? w.en + ' energía' : 'sin coste'}`, `carga: ${chgName(w)} (${w.chgEn})`];
  const nUp = w.up ? w.up.dmg + w.up.rate + w.up.chg + w.up.en + (w.up.esp || 0) + (w.up.bones || 0) : 0;
  if (w.style) parts.push(STYLE[w.style].d);
  if (nUp) parts.push(`forjada +${nUp}`);
  if (w.aff) parts.push(w.aff > 0 ? 'afín a tu clase +30 %' : 'de otra clase −30 %');
  if (w.spd) parts.push(`+${Math.round(w.spd * 100)} % velocidad`);
  if (w.dodge) parts.push(`esquiva −${Math.round(w.dodge * 100)} % recarga`);
  if (w.veil) parts.push(`al matar ${String(w.veil).replace('.', ',')} s invisible`);
  if (w.back) parts.push(`+${Math.round(w.back * 100)} % por la espalda`);
  if (w.starter) parts.push('inicial');
  if (w.el) parts.push(`+${Math.round((w.elMul - 1) * 100)} % daño elemental`);
  if (w.el) parts.push(w.elOn ? `${ELEMS[w.el].n}: ${elAbName(w)} Nv${w.elLv}` : `${ELEMS[w.el].n} ${w.elC}/3`);
  if (w.fx) parts.push(FX_NAME[w.fx]);
  if (w.pierce && w.pierce < 99) parts.push('atraviesa ' + w.pierce);
  if (w.pierce >= 99) parts.push('atraviesa todo');
  if (w.leech) parts.push('roba vida');
  return parts.join(' · ');
}

const RELICS = {
  corazon:  { n: 'Corazón de piedra',  d: '+2 de vida máxima y te cura 2.', c: '#d4474b' },
  escudo:   { n: 'Escudo rúnico',      d: '+1 de escudo máximo.', c: '#8fb7d9' },
  botas:    { n: 'Botas de viento',    d: '+15 % de velocidad.', c: '#9be0c8' },
  rebote:   { n: 'Flechas rebotantes', d: 'Tus flechas rebotan una vez en las paredes.', c: '#e3a24a', u: 1 },
  onda:     { n: 'Onda cortante',      d: 'Los tajos de espada lanzan una onda.', c: '#ece4cf', u: 1 },
  veneno:   { n: 'Colmillo venenoso',  d: 'Tus golpes envenenan: 1 de daño por segundo durante 3 s.', c: '#9be05a', u: 1 },
  ojo:      { n: 'Ojo del cazador',    d: '+15 % de probabilidad de crítico.', c: '#ffd27a' },
  vampiro:  { n: 'Sangre de vampiro',  d: 'Cada 12 enemigos derrotados recuperas 1 de vida.', c: '#b0303a', u: 1 },
  carcaj:   { n: 'Carcaj extra',       d: 'Los arcos disparan 1 flecha más.', c: '#c9a46a' },
  piedra:   { n: 'Piedra de afilar',   d: '+20 % de daño.', c: '#bdb6a8' },
  reloj:    { n: 'Reloj de arena',     d: 'La esquiva recarga un 40 % más rápido.', c: '#e8d08a', u: 1 },
  iman:     { n: 'Imán de oro',        d: 'Atraes monedas desde lejos y los enemigos sueltan más.', c: '#f0c040', u: 1 },
  bateria:  { n: 'Batería arcana',     d: '+40 de energía máxima y se recarga más rápido.', c: '#5aa4e8' },
  espinas:  { n: 'Coraza de espinas',  d: 'Al recibir daño disparas espinas alrededor.', c: '#7a9a5a', u: 1 },
  trebol:   { n: 'Trébol de cuatro',   d: 'Los cofres sueltan mejores armas y un objeto extra.', c: '#6cc46a', u: 1 },
  polvora:  { n: 'Pólvora negra',      d: 'Al esquivar dejas una bomba. Las explosiones no te dañan.', c: '#8a84a0', u: 1 },
};

const CHARS = {
  knight: { name: 'Caballero', spr: 'knight', hp: 8, sh: 3, speed: 175, en: 100, start: ['rusty', 'club'], abil: 'Baluarte', abilDesc: '2,5 s invulnerable; las balas que te tocan rebotan.', cd: 14, cost: 0,
            role: 'Aguanta y castiga de cerca', fam: 'espadas, mazas, lanzas y escudo',
            mech: 'Desvío: si te golpean justo después de atacar, anulas el golpe y contraatacas. Represalia: tras recibir daño, tu siguiente golpe hace +50 %. Esquiva: carga con escudo que daña y empuja.' },
  archer: { name: 'Tirador',   spr: 'archer', hp: 6, sh: 3, speed: 190, en: 140, start: ['short', 'sling'], abil: 'Lluvia de flechas', abilDesc: '3 oleadas de flechas en todas direcciones.', cd: 10, cost: 10,
            role: 'Mantén la distancia y apunta', fam: 'arcos, honda, ballesta, mosquete y bumerán',
            mech: 'Concentración: cada disparo la carga; llena, lanzas una flecha dorada ×3 que lo atraviesa todo. Recibir daño la vacía. Esquiva: voltereta larga.' },
  rogue:  { name: 'Asesino',   spr: 'rogue',  hp: 5, sh: 4, speed: 205, en: 100, start: ['dagger', 'wand'], abil: 'Sombra', abilDesc: '3 s invisible, más rápido y todo golpe es crítico.', cd: 12, cost: 20,
            role: 'Entra, golpea por la espalda y sal', fam: 'dagas, katar, garras, kunais, shurikens, cerbatana, látigo, guadaña, hoz, arco sombrío y bastón de veneno',
            mech: 'Por la espalda: ×2 a quien no te mira. Combo: cada golpe seguido suma +5 % (hasta +50 %). Matar recarga la esquiva. Esquiva: parpadeo que te vuelve invisible un instante.' },
};
const UPG = {
  hp:   { name: 'Vitalidad',      desc: '+1 de vida máxima por nivel', max: 5, cost: [2, 3, 4, 5, 6] },
  coin: { name: 'Bolsa heredada', desc: '+10 monedas al empezar por nivel', max: 5, cost: [1, 2, 3, 4, 5] },
  en:   { name: 'Reserva arcana', desc: '+15 de energía máxima por nivel', max: 5, cost: [2, 3, 4, 5, 6] },
  // mejoras propias de cada clase: el altar muestra solo las del personaje elegido
  k_parry: { cls: 'knight', name: 'Temple',          desc: 'El Desvío se recarga 0,3 s antes por nivel', max: 5, cost: [2, 3, 4, 5, 6] },
  k_bash:  { cls: 'knight', name: 'Escudo pesado',   desc: '+20 % de daño de la carga con escudo y +10 % de Represalia por nivel', max: 5, cost: [2, 3, 4, 5, 6] },
  a_focus: { cls: 'archer', name: 'Pulso sereno',    desc: 'La Concentración se llena un 10 % más rápido por nivel', max: 5, cost: [2, 3, 4, 5, 6] },
  a_gold:  { cls: 'archer', name: 'Flecha dorada',   desc: 'El disparo concentrado hace +0,4× de daño por nivel (×3 → ×5)', max: 5, cost: [2, 3, 4, 5, 6] },
  r_back:  { cls: 'rogue',  name: 'Instinto letal',  desc: '+20 % de daño por la espalda por nivel', max: 5, cost: [2, 3, 4, 5, 6] },
  r_veil:  { cls: 'rogue',  name: 'Pasos ligeros',   desc: '+0,1 s de invisibilidad al esquivar y +3 % de velocidad por nivel', max: 5, cost: [2, 3, 4, 5, 6] },
};
// nivel de una mejora de clase comprada para esta partida
const cu = id => (G && G.player && G.player.cu && G.player.cu[id]) || 0;

const DIFFS = {
  easy:   { name: 'Aprendiz',  desc: 'Enemigos con menos vida, más lentos para atacar y peor puntería. Gemas ×0,75.', hp: .75, rate: .8, count: -1, elite: -.05, lead: .25, dodge: .15, tokens: 2, gem: .75 },
  normal: { name: 'Guardián',  desc: 'La experiencia pensada: los enemigos te rodean, anticipan y esquivan.', hp: 1, rate: 1, count: 0, elite: 0, lead: .6, dodge: .4, tokens: 3, gem: 1 },
  hard:   { name: 'Pesadilla', desc: 'Más vida, más enemigos y élites, ataques más rápidos y puntería casi perfecta. Gemas ×1,5.', hp: 1.3, rate: 1.22, count: 1, elite: .08, lead: .9, dodge: .65, tokens: 5, gem: 1.5 },
};
function D() { return (G && G.dx) || DIFFS[(G && G.diff) || SAVE.diff] || DIFFS.normal; }

// las estadísticas de cada enemigo viven en su archivo de 01b-enemigos/
const ENEMY = {};
for (const id of enemyList()) ENEMY[id] = ENEMIES[id].stats;

const FLOORS = [
  { name: 'La Cripta', pal: { fa: '#24222e', fb: '#272532', crack: '#1c1a24', wt: '#3f3852', wf: '#2a2438', we: '#5a5070', sp: '#2d2a39' },
    pool1: ['slime', 'slime', 'bat', 'archer'], pool2: ['slime', 'bat', 'archer', 'archer', 'brute'],
    boss: 'guardian', light: [150, 560, .72], elite: .10, music: { root: 45, tempo: 96 } },
  { name: 'Catacumbas Pútridas', pal: { fa: '#1f2622', fb: '#222a25', crack: '#171d19', wt: '#38483b', wf: '#26322a', we: '#55705a', sp: '#29332c' },
    pool1: ['toxic', 'spider', 'archer', 'mage'], pool2: ['toxic', 'spider', 'mage', 'archer', 'brute'],
    boss: 'queen', light: [130, 470, .82], elite: .16, music: { root: 40, tempo: 104 } },
  { name: 'El Abismo', pal: { fa: '#1d1517', fb: '#201719', crack: '#140e10', wt: '#3a2228', wf: '#26161a', we: '#5c2e36', sp: '#2a1b1e' },
    pool1: ['wraith', 'eye', 'spider', 'bat'], pool2: ['wraith', 'eye', 'mage', 'brute', 'spider'],
    boss: 'devourer', light: [72, 250, .97], elite: .22, music: { root: 38, tempo: 76, horror: true }, horror: true },
  { name: 'Osario Helado', pal: { fa: '#1c222c', fb: '#1f2631', crack: '#141920', wt: '#3a4a5e', wf: '#243040', we: '#6a8aa8', sp: '#26303c' },
    pool1: ['warden', 'archer', 'bat', 'sniper'], pool2: ['warden', 'sniper', 'brute', 'mage', 'spider'],
    boss: 'ossuary', light: [140, 520, .8], elite: .18, music: { root: 43, tempo: 92 } },
  { name: 'Forja Hundida', pal: { fa: '#241a14', fb: '#281d16', crack: '#1a120c', wt: '#4a3020', wf: '#2e1e14', we: '#a0582a', sp: '#2e2018' },
    pool1: ['bomber', 'charger', 'brute', 'bat'], pool2: ['bomber', 'charger', 'warden', 'eye', 'mage'],
    boss: 'forger', light: [130, 480, .85], elite: .2, music: { root: 41, tempo: 112 } },
  { name: 'Jardín de Raíces', pal: { fa: '#1a2116', fb: '#1d2519', crack: '#121810', wt: '#34442a', wf: '#22301c', we: '#5a7a3a', sp: '#24301e' },
    pool1: ['splitter', 'burrower', 'spider', 'toxic'], pool2: ['splitter', 'burrower', 'priest', 'spider', 'charger'],
    boss: 'rootmother', light: [125, 460, .86], elite: .22, music: { root: 40, tempo: 98 } },
  { name: 'Catedral Hueca', pal: { fa: '#1e1a24', fb: '#221d28', crack: '#15121a', wt: '#3e3450', wf: '#2a2236', we: '#7a68a0', sp: '#2a2434' },
    pool1: ['priest', 'phantom', 'sniper', 'wraith'], pool2: ['priest', 'phantom', 'sniper', 'warden', 'eye', 'bomber'],
    boss: 'bishop', light: [105, 400, .92], elite: .25, music: { root: 37, tempo: 84, horror: true }, horror: true },
  { name: 'Corazón de Elena', pal: { fa: '#200f12', fb: '#241114', crack: '#16090b', wt: '#4a1a22', wf: '#2e1016', we: '#8a2a3a', sp: '#2c1418' },
    pool1: ['phantom', 'burrower', 'charger', 'sniper', 'splitter'], pool2: ['phantom', 'burrower', 'charger', 'sniper', 'priest', 'warden', 'bomber', 'eye', 'wraith'],
    boss: 'elena', light: [72, 260, .97], elite: .28, music: { root: 36, tempo: 72, horror: true }, horror: true },
];
const BOSSES = {
  guardian: { name: 'El Guardián de la Cripta', hp: 420, r: 30, minion: 'bat',
    p1: ['burst', 'aimed', 'charge'], p2: ['burst', 'spiral', 'charge', 'predict', 'summon', 'gapring'], p3: ['charge', 'gapring', 'rain', 'spiral', 'predict'] },
  queen:    { name: 'La Reina Tejedora', hp: 800, r: 30, minion: 'spider',
    p1: ['web', 'leap', 'aimed', 'summon'], p2: ['web', 'leap', 'spiral', 'burst', 'summon', 'rain'], p3: ['leap', 'web', 'gapring', 'rain', 'predict', 'summon'] },
  devourer: { name: 'El Devorador de Luz', hp: 1250, r: 32, minion: 'wraith',
    p1: ['laser', 'teleport', 'aimed', 'summon'], p2: ['laser', 'dark', 'spiral', 'teleport', 'burst', 'summon', 'gapring'], p3: ['laser', 'dark', 'rain', 'teleport', 'gapring', 'predict'] },
  // jefes de los pisos 4 a 8: aspecto de un jefe anterior con otro color, más vida y más ataques por fase
  ossuary:    { name: 'El Señor del Osario', hp: 1600, r: 32, minion: 'warden', look: 'guardian', tint: '#9bd8ff', col: '#bfe8ff', want: 150, scale: 1.1,
    p1: ['burst', 'aimed', 'charge', 'rain'], p2: ['burst', 'spiral', 'charge', 'predict', 'summon', 'gapring', 'web'], p3: ['charge', 'gapring', 'rain', 'spiral', 'predict', 'web', 'burst'] },
  forger:     { name: 'La Forjadora', hp: 2000, r: 32, minion: 'bomber', look: 'queen', tint: '#ff8a3a', col: '#ffb070', want: 170, scale: 1.12,
    p1: ['leap', 'burst', 'aimed', 'rain'], p2: ['leap', 'charge', 'rain', 'gapring', 'summon', 'burst'], p3: ['leap', 'charge', 'rain', 'gapring', 'laser', 'predict', 'burst'] },
  rootmother: { name: 'La Raíz Madre', hp: 2400, r: 34, minion: 'splitter', look: 'queen', tint: '#7ac04a', col: '#b8f080', want: 200, scale: 1.18,
    p1: ['web', 'summon', 'spiral', 'rain'], p2: ['web', 'leap', 'spiral', 'summon', 'rain', 'gapring'], p3: ['web', 'leap', 'spiral', 'rain', 'gapring', 'predict', 'burst'] },
  bishop:     { name: 'El Obispo Hueco', hp: 2900, r: 32, minion: 'phantom', look: 'devourer', tint: '#a07ad8', col: '#d8b0ff', want: 220, scale: 1.12,
    p1: ['teleport', 'laser', 'spiral', 'summon'], p2: ['teleport', 'laser', 'dark', 'spiral', 'gapring', 'summon', 'predict'], p3: ['teleport', 'laser', 'dark', 'rain', 'gapring', 'predict', 'burst', 'spiral'] },
  elena:      { name: 'Elena, Corazón de la Cripta', hp: 3500, r: 34, minion: 'phantom', look: 'devourer', tint: '#ffd0d8', col: '#ff8aa0', want: 190, scale: 1.25,
    p1: ['laser', 'web', 'charge', 'spiral', 'summon'], p2: ['laser', 'web', 'leap', 'dark', 'gapring', 'rain', 'summon', 'teleport'], p3: ['laser', 'dark', 'leap', 'charge', 'gapring', 'rain', 'predict', 'spiral', 'burst', 'web'] },
};

