// ================= Jefes =================
import { tr } from './00b-textos.js';
import { TAU, angTo, dist, pick, rand } from './01-utilidades.js';
import { BOSS_DEFS, BOSS_MOVES } from './01a-registro.js';
import { BOSSES, BOTIN, D } from './03-datos-del-juego.js';
import { SAVE, writeSave } from './04-guardado.js';
import { sfx } from './05-audio.js';
import { G, randomRelics } from './07-estado.js';
import { moveEnt, pushOutProps } from './08-colisiones.js';
import { addText, burst, damageProp, later, shake, showBanner } from './09-efectos.js';
import { dropArmor } from './13-armadura.js';
import { dropCoin, enemyShoot } from './14-enemigos.js';
import { enemyPace } from './15-subjefes.js';
import { ach } from './21-logros-y-bestiario.js';
import { openChoice } from './32-eleccion-de-reliquia.js';
// v0.56: los jefes van en guardia (reciben el 30 % del daño y cada golpe se queda en un tope) salvo justo
// después de terminar un ataque: ahí quedan expuestos un momento y reciben el 130 %. Hay que esquivar y castigar.
const JEFE = { guardia: .3, expuesto: 1.3, topeGuardia: .03, topeExpuesto: .06, ventana: .8 };
function bossExposeK(e) { return e.exposeT > 0 ? JEFE.expuesto : JEFE.guardia; }
function bossCap(e) { return Math.max(4, Math.round(e.max * (e.exposeT > 0 ? JEFE.topeExpuesto : JEFE.topeGuardia))); }
function bossIdle(e) {
  if (e.st !== 'enrage' && e.st !== 'idle' && e.st !== 'prep' && !e.dead) {
    e.exposeT = JEFE.ventana * (e.phase === 3 ? .75 : 1);
    addText(e.x, e.y - e.r - 26, tr('¡Expuesto!'), '#ffd84a', 14);
  }
  e.st = 'idle'; e.st_t = (e.phase === 1 ? 1.05 : e.phase === 2 ? .6 : .38) / D().rate / enemyPace(); }
function bossRing(e, n, sp, color, off = 0, r = 7) { for (let i = 0; i < n; i++) enemyShoot(e, off + i * TAU / n, sp, r, color); }
function updateBoss(e, dt) {
  const p = G.player, a = angTo(e, p), B = BOSSES[e.kind];
  e.st_t -= dt; e.spin += dt; e.exposeT = (e.exposeT || 0) - dt;
  e.tele = (e.tele || 0) - dt;
  if ((e.phase === 1 && e.hp <= e.max * .5) || (e.phase === 2 && e.hp <= e.max * .25)) {
    e.phase++; e.st = 'enrage'; e.st_t = 1.5; e.invuln = true;
    const heal = Math.round(e.max * (e.phase === 2 ? .15 : .12)); e.hp = Math.min(e.max, e.hp + heal); addText(e.x, e.y - 70, tr`+${heal} vida`, '#6cc46a', 16); e.speed = e.phase === 3 ? 82 : 62; e.air = false; e.fade = 1; e.reps = 0;
    G.proj = G.proj.filter(pr => pr.owner === 'player'); G.beams = []; G.hazards = [];
    showBanner(e.phase === 3 ? tr('¡Fase 3! Furia') : tr('¡Fase 2!'), '#d4474b', e.phase === 2 ? tr('Algunos de sus ataques rompen tu escudo') : B.name);
    shake(14); sfx(60, .8, 'sawtooth', .06, 40);
    return;
  }
  const ph2 = e.phase >= 2, ph3 = e.phase === 3, d = dist(e, p);
  const bcol = B.col || '#ff6a8a';
  switch (e.st) {
    case 'enrage':
      if (Math.random() < .5) burst(e.x, e.y, '#d4474b', 2, 200, 4);
      if (e.st_t <= 0) { e.invuln = false; bossIdle(e); }
      return;
    case 'idle': {
      // se mueve a su distancia preferida y te rodea en vez de caminar en línea recta
      if (!e.dir || Math.random() < dt * .3) e.dir = Math.random() < .5 ? 1 : -1;
      const want = B.want || 190;
      const mv = d < want - 40 ? a + Math.PI * .75 * e.dir : d < want + 60 ? a + Math.PI / 2 * e.dir : a;
      moveEnt(e, Math.cos(mv) * e.speed * dt, Math.sin(mv) * e.speed * dt);
      const o = pushOutProps(e); if (o && o.kind !== 'merchant') damageProp(o, 99);
      if (e.st_t <= 0) {
        // elige el ataque según dónde estás: de cerca, ataques de área; de lejos, embestidas y disparos
        const pool = ph3 ? B.p3 : ph2 ? B.p2 : B.p1;
        const CLOSE = { burst: 1, gapring: 1, teleport: 1, rain: 1, spiral: 1 }, FAR = { charge: 1, aimed: 1, predict: 1, laser: 1, web: 1, leap: 1 };
        const fav = d < 140 ? CLOSE : d > 280 ? FAR : null, bag = [];
        for (const at of pool) {
          if (at === e.last || (at === 'summon' && G.enemies.length > 5)) continue;
          bag.push(at); if (fav && fav[at]) bag.push(at, at);
        }
        const next = bag.length ? pick(bag) : pool[0];
        e.last = next; e.next = next; e.st = 'prep'; e.st_t = (ph3 ? .22 : .35) / D().rate; e.tele = e.st_t; e.reps = 0;
      }
      return;
    }
    case 'prep':
      if (e.st_t <= 0) { e.st = e.next; e.st_t = 0; e.k = 0; e.timer = 0; e.ca = a; e.gap = a + rand(-1, 1); e.tgt = { x: p.x, y: p.y }; }
      return;
    default: {
      // cada ataque vive en su archivo de 01g-ataques-de-jefe/
      const mv = BOSS_MOVES[e.st];
      if (mv) mv.hacer(e, dt, { p, B, a, d, ph2, ph3, bcol });
    }
  }
}
function bossDefeated(e) {
  G.boss = null; G.beams = []; G.darkT = 0; G.hazards = [];
  for (let i = 0; i < BOTIN.jefe.monedas; i++) dropCoin(e.x, e.y);
  if (Math.random() < BOTIN.jefe.armadura) dropArmor(e.x + 40, e.y + 30, 'chest');
  for (let i = 0; i < Math.ceil((4 + G.floor) / 2); i++) G.pickups.push({ kind: 'gem', x: e.x, y: e.y, vx: rand(-120, 120), vy: rand(-120, 120) });
  for (const o of G.enemies) if (o !== e && !o.dead) { o.dead = true; burst(o.x, o.y, '#ece4cf', 10); }
  G.markers.length = 0;
  G.proj = G.proj.filter(pr => pr.owner === 'player');
  const room = G.bossRoom; room.locked = false; room.cleared = true; G.roomsCleared++;
  if (BOSS_DEFS[e.kind].logro) ach(BOSS_DEFS[e.kind].logro);
  SAVE.kills['boss:' + e.kind] = (SAVE.kills['boss:' + e.kind] || 0) + 1;
  if (G.floor === 8 && !G.wonOnce) {
    G.wonOnce = true; SAVE.wins++; ach('win'); if (G.diff === 'hard') ach('nightmare'); writeSave();
    showBanner(tr('¡La cripta ha caído!'), '#e3a24a', tr('Sal victorioso o desciende al Abismo eterno'));
  } else showBanner(BOSSES[e.kind].name + tr(' cae'), '#e3a24a', tr`Piso ${G.floor} superado`);
  later(1.4, () => openChoice(tr('Recompensa del jefe'), tr('Elige una reliquia'), randomRelics(3), () => {
    G.pickups.push({ kind: 'portal', x: room.cx, y: room.cy });
    addText(room.cx, room.cy - 40, G.floor >= 8 ? tr('El portal baja al Abismo eterno') : tr('Se abre un portal'), '#c77dff', 15);
    if (G.floor >= 8) G.pickups.push({ kind: 'exit', x: room.cx + 100, y: room.cy });
  }));
}

export { bossCap, bossExposeK, bossDefeated, bossIdle, bossRing, updateBoss };
