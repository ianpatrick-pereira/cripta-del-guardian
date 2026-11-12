// ================= Subjefes =================
// cada subjefe vive en su archivo de 01f-subjefes/; SUBS los ordena por piso
import { tr } from './00b-textos.js';
import { angTo, dist, pick, rand } from './01-utilidades.js';
import { SUB_DEFS, SUB_MOVES } from './01a-registro.js';
import { BOTIN, D, FLOORS } from './03-datos-del-juego.js';
import { sfx } from './05-audio.js';
import { G } from './07-estado.js';
import { moveEnt, pushOutProps } from './08-colisiones.js';
import { addText, burst, damageProp, later, shake, showBanner } from './09-efectos.js';
import { dropCoin } from './14-enemigos.js';
import { ELEMS } from './23-elementos.js';
import { offerTalent } from './26-clases.js';
const SUBS = {};
for (const id of Object.keys(SUB_DEFS)) SUBS[SUB_DEFS[id].piso] = { sk: id, ...SUB_DEFS[id].datos };
// v0.55: cada piso tiene UN subjefe, el líder de su monstruo. Respecto a uno normal: +25 % de vida,
// recibe un 20 % menos de daño (ver hurtEnemy), pega 1 más que los monstruos del piso y ataca con su propio repertorio.
const SUB_VIDA = 1.25, SUB_RESISTE = .8;
// los esbirros que llama son del monstruo del piso (los Elementales traen los suyos)
function subMinion(S) {
  if (S.el) return Array.isArray(S.minion) ? pick(S.minion) : S.minion;
  const fl = FLOORS[G.fi];
  return (fl && fl.pool1 && fl.pool1[0]) || S.minion;
}
function mkSub(floor, x, y, extra = false) {
  // los subjefes extra (otra sala del mismo piso) llegan con el 75 % de la vida
  const S = SUBS[floor], base = S.hp * SUB_VIDA * (extra ? .75 : 1), hp = Math.round(base * D().hp * (1 + .8 * (G.cycle - 1)));
  const fd = 1 + (G.floor >= 5 ? 1 : 0) + (D().dmgAdd || 0);
  return { def: S, type: 'sub', isSub: true, sk: S.sk, name: S.name, spr: S.spr, s: S.s, r: S.r, x, y, hp, max: hp, speed: S.speed, dmg: 1 + fd, fd, resist: SUB_RESISTE, tint: S.tint,
    kx: 0, ky: 0, flash: 0, t: 0, phase: 1, st: 'idle', st_t: 1, last: '', k: 0, ca: 0, timer: 0, poison: 0, pt: 0, wob: 0, alpha: 1, air: false, lift: 0 };
}
const enemyPace = () => Math.min(1.4, 1 + .05 * (G.floor - 1));
function subIdle(e) { e.st = 'idle'; e.st_t = (e.phase === 1 ? 1.1 : .7) / D().rate / (e.elem ? 1 + .12 * (G.floor - 1) : enemyPace()); }
function updateSub(e, dt) {
  const p = G.player, S = e.def || SUBS[G.fi + 1], sd = SUB_DEFS[e.sk] || /** @type {any} */ ({}), a = angTo(e, p), d = dist(e, p), ph2 = e.phase === 2;
  const sm = e.slowT > 0 ? .7 : 1;
  e.st_t -= dt; e.tele = (e.tele || 0) - dt;
  if (e.phase === 1 && e.hp <= e.max * (G.diff === 'hard' ? .6 : .5)) {
    e.phase = 2; e.speed *= 1.25; const heal = Math.round(e.max * .12); e.hp = Math.min(e.max, e.hp + heal); addText(e.x, e.y - e.r - 20, tr`¡Furioso! +${heal} vida`, '#d4474b', 16); shake(8); sfx(70, .5, 'sawtooth', .05, 30);
    burst(e.x, e.y, S.tint, 24, 220, 4);
  }
  const move = (ang, sp) => { moveEnt(e, Math.cos(ang) * sp * sm * dt, Math.sin(ang) * sp * sm * dt); const o = pushOutProps(e); if (o && o.kind !== 'merchant' && sd.rompeAlCaminar) damageProp(o, 99); };
  switch (e.st) {
    case 'idle': {
      // se coloca a su distancia preferida y te rodea
      if (S.want && d < S.want - 50) move(a + Math.PI + .4, e.speed);
      else if (S.want && d < S.want + 60) move(a + Math.PI / 2, e.speed * .7);
      else move(a, e.speed);
      if (e.st_t <= 0) {
        const pool = ph2 ? S.p2 : S.p1;
        let next, g = 0; do { next = pick(pool); } while (next === e.last && g++ < 12);
        if (next === 'summon' && G.enemies.length > 5) next = pool[0];
        if (next === 'retreat' && d > 170) next = 'volley';
        e.last = next; e.st = next; e.st_t = 0; e.k = 0; e.timer = 0; e.ca = a; e.tele = .5;
      }
      return;
    }
    default: {
      // cada ataque vive en su archivo de 01h-ataques-de-subjefe/
      const mv = SUB_MOVES[e.st];
      if (mv) mv.hacer(e, dt, { p, S, a, d, ph2, move });
    }
  }
}
function subDefeated(e) {
  if (e.elem) {
    const E = ELEMS[e.elem];
    showBanner(e.name + tr(' cae'), E.c, tr`Suelta 1 cristal de ${E.n.toLowerCase()}`);
    G.pickups.push({ kind: 'crystal', el: e.elem, x: e.x, y: e.y });
    for (let i = 0; i < 8; i++) dropCoin(e.x, e.y);
    if (Math.random() < .5) G.pickups.push({ kind: 'gem', x: e.x, y: e.y, vx: rand(-90, 90), vy: rand(-90, 90) });
    return;
  }
  showBanner(e.name + tr(' cae'), '#e3a24a', tr('Subjefe derrotado'));
  later(.9, offerTalent);
  for (let i = 0; i < BOTIN.subjefe.monedas; i++) dropCoin(e.x, e.y);
  G.pickups.push({ kind: 'gem', x: e.x, y: e.y, vx: rand(-90, 90), vy: rand(-90, 90) });
  G.pickups.push({ kind: 'potion', x: e.x + 20, y: e.y });
  const sd = SUB_DEFS[e.sk];
  if (sd && sd.alMorir) sd.alMorir(e);
}

export { SUBS, enemyPace, mkSub, subMinion, subDefeated, subIdle, updateSub };
