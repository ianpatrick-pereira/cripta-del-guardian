// ================= Bucle =================
import { $ } from './00-inicio.js';
import { TAU, TILE, angDiff, angTo, clamp, dist, esc, rand } from './01-utilidades.js';
import { ROOM_DEFS, roomList } from './01a-registro.js';
import { D, FLOORS, RELICS } from './03-datos-del-juego.js';
import { SAVE, writeSave } from './04-guardado.js';
import { noise, sfx } from './05-audio.js';
import { G, rc } from './07-estado.js';
import { moveEnt, solidAt } from './08-colisiones.js';
import { addText, breakCracks, burst, damageProp, explode, shake, showBanner } from './09-efectos.js';
import { touch } from './10-entrada.js';
import { maxEnergy, nearestEnemy, reflect, updatePlayer } from './11-jugador.js';
import { shieldBlock, updateStyles, updateThrown } from './12-armas-con-estilo-propio.js';
import { hurtPlayer, splitShot } from './13-armadura.js';
import { chainHit, elemHit, enemyShoot, hurtEnemy, mkBoss, mkEnemy, quien, updateEnemy,
  updateFlames } from './14-enemigos.js';
import { SUBS, mkSub } from './15-subjefes.js';
import { updateRooms } from './17-salas.js';
import { updateSyn } from './18-sinergias.js';
import { updatePet } from './19-companeros.js';
import { openEpilogue } from './20-historia.js';
import { ach } from './21-logros-y-bestiario.js';
import { ELEMS, mkElem, shredShield, updateFlamer, updateTornados } from './23-elementos.js';
import { updateClass } from './26-clases.js';
import { dailyScore } from './31-reto-diario.js';
import { saveHistory } from './38b-historial.js';
function endGame(won) {
  if (G.over) return;
  G.over = true; G.won = won; G.endT = won ? 2.6 : 1.4;
  G.gemsBanked = true;
  G.gemGain = Math.round(G.gems * D().gem);
  SAVE.gems += G.gemGain; SAVE.best = Math.max(SAVE.best, G.floor); if (won && !G.wonOnce) SAVE.wins++;
  SAVE.run = null;
  saveHistory(won);
  if (G.daily) {
    G.dailyPts = dailyScore();
    if (!SAVE.daily || SAVE.daily.date !== G.daily) SAVE.daily = { date: G.daily, best: 0 };
    G.dailyRec = G.dailyPts > SAVE.daily.best; SAVE.daily.best = Math.max(SAVE.daily.best, G.dailyPts);
  }
  writeSave();
  if (won && G.floor === 8) showBanner('¡La cripta ha caído!', '#e3a24a');
}
function showEnd() {
  if (!$('ovEpi').hidden) return;
  const won = G.won;
  // al salir victorioso tras vencer a Elena, primero el final de la historia
  if (won && G.wonOnce && !G.epiShown) { G.epiShown = true; openEpilogue(); return; }
  $('endEyebrow').textContent = won ? 'Victoria' : G.wonOnce ? 'Fin del descenso' : 'Derrota';
  $('endTitle').textContent = won ? (G.floor > 8 ? `Saliste del Abismo en el piso ${G.floor}` : 'Has conquistado la cripta') : G.wonOnce ? `El Abismo te reclamó en el piso ${G.floor}` : `Caíste en el piso ${G.floor}`;
  $('endText').textContent = won || G.wonOnce
    ? 'La victoria quedó registrada. Las gemas que juntaste ya están en el altar para desbloquear personajes, mejoras y compañeros.'
    : 'Las gemas que juntaste se guardaron. Úsalas en el Altar de almas para volver más fuerte.';
  if (G.daily) $('endText').textContent = `Reto diario del ${G.daily}: ${G.dailyPts} puntos${G.dailyRec ? ' · ¡nuevo récord!' : ` · tu récord: ${SAVE.daily.best}`}. Puntos: 1000 por piso superado, 10 por baja y 1 por moneda (+3000 si ganas).`;
  if (!won && G.hitBy) $('endText').textContent += ` Te derrotó: ${G.hitBy}.`;
  const s = Math.floor(G.time);
  $('stFloor').textContent = G.floor;
  $('stTime').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  $('stKills').textContent = G.kills;
  $('stCoins').textContent = G.coins;
  $('stGems').textContent = '+' + (G.gemGain ?? G.gems);
  $('endRelics').innerHTML = relicChips(G.player.relics);
  $('ovEnd').hidden = false;
  $('btnAgain').focus();
}
function relicChips(list) {
  const counts = {}; list.forEach(id => counts[id] = (counts[id] || 0) + 1);
  return Object.entries(counts).map(([id, n]) => `<span style="color:${RELICS[id].c}">${esc(RELICS[id].n)}${n > 1 ? ' ×' + n : ''}</span>`).join('') || '<span>Sin reliquias</span>';
}

function update(dt) {
  if (G.choice) return;
  if (G.hitstop > 0) { G.hitstop -= dt; return; }
  G.time += G.over ? 0 : dt;
  for (let i = G.timers.length - 1; i >= 0; i--) { const t = G.timers[i]; t.t -= dt; if (t.t <= 0) { G.timers.splice(i, 1); t.fn(); } }
  if (G.choice) return;
  if (G.over) { G.endT -= dt; if (G.endT <= 0 && $('ovEnd').hidden) showEnd(); }
  else {
    const p0x = G.player.x, p0y = G.player.y;
    updatePlayer(dt);
    if (dt > 0) {
      const k = 1 - Math.exp(-8 * dt);
      G.pv.x += (clamp((G.player.x - p0x) / dt, -260, 260) - G.pv.x) * k;
      G.pv.y += (clamp((G.player.y - p0y) / dt, -260, 260) - G.pv.y) * k;
    }
  }
  updateRooms(dt);
  updatePet(dt);
  updateTornados(dt);
  updateFlamer(dt);
  updateStyles(dt);
  updateClass(dt);
  if (G.elFight && !G.enemies.some(e => !e.stray) && G.markers.length === 0) { G.elFight.room.locked = false; G.elFight = null; sfx(520, .3, 'triangle', .05, 400); }
  G.player.elCd -= dt;
  G.synT = (G.synT || 0) - dt;
  if (G.synT <= 0) { G.synT = .5; updateSyn(); }
  for (const k of roomList()) if (ROOM_DEFS[k].actualizar) ROOM_DEFS[k].actualizar(dt);   // salas de 01d-salas/
  if (G.toasts) { for (const t of G.toasts) t.t -= dt; G.toasts = G.toasts.filter(t => t.t > 0); }
  // peligros de área: círculos que se llenan y estallan
  for (const h of G.hazards) {
    if (h.owner && h.owner.dead) { h.gone = true; continue; }
    h.t -= dt;
    if (h.t <= 0) {
      h.gone = true;
      const pl = G.player;
      if (!G.over && dist(h, pl) < h.r + pl.r * .4) { if (h.shred) shredShield(); if (hurtPlayer(h.dmg, h.por) && h.el) elemHit(h.el, h); }
      burst(h.x, h.y, h.color, 12, 190, 4, .4); shake(4); noise(.12, .05, 700);
      if (h.el === 'fire') { if (!G.flames) G.flames = []; G.flames.push({ x: h.x, y: h.y, r: h.r * .9, t: 3.2, fight: true }); }
      const prevSrc = G.elSrc; G.elSrc = h.src || null;
      if (h.ring) for (let i = 0; i < h.ring; i++) enemyShoot({ x: h.x, y: h.y, r: 10 }, i * TAU / h.ring, 150, 6, h.color);
      G.elSrc = prevSrc;
    }
  }
  G.hazards = G.hazards.filter(h => !h.gone);
  updateFlames(dt);
  G.darkT -= dt;

  for (let i = G.markers.length - 1; i >= 0; i--) {
    const m = G.markers[i]; m.t -= dt;
    if (m.t <= 0) {
      G.markers.splice(i, 1);
      if (m.type === 'boss') { G.boss = mkBoss(FLOORS[G.fi].boss, m.x, m.y); G.enemies.push(G.boss); shake(10); burst(m.x, m.y, '#c77dff', 30, 260, 5); }
      else if (m.type === 'elem') { G.enemies.push(mkElem(m.el, m.x, m.y)); shake(10); burst(m.x, m.y, ELEMS[m.el].c, 30, 240, 5); }
      else if (m.type === 'sub') { const k = m.k || G.fi + 1; G.enemies.push(mkSub(k, m.x, m.y)); shake(8); burst(m.x, m.y, SUBS[k].tint, 24, 220, 4); }
      else { const ne = mkEnemy(m.type, m.x, m.y, m.depth, m.elite); if (m.el) { ne.el = m.el; ne.hp = ne.max = Math.round(ne.max * .85); } G.enemies.push(ne); burst(m.x, m.y, m.el ? ELEMS[m.el].c : '#d4474b', 6, 90); }
    }
  }

  const p = G.player;
  for (const e of [...G.enemies]) {
    if (e.dead) continue;
    G.actor = e; updateEnemy(e, dt); G.actor = null;
    if (!G.over && !e.dead && !e.air && dist(e, p) < e.r + p.r - 2) { if (e.isBoss && e.st === 'charge') shredShield(); if (hurtPlayer(e.dmg, quien(e)) && e.elem) elemHit(e.elem, e); }
  }
  const es = G.enemies;
  for (let i = 0; i < es.length; i++) for (let j = i + 1; j < es.length; j++) {
    const a = es[i], b = es[j]; if (a.air || b.air) continue;
    const d = dist(a, b), min = a.r + b.r;
    if (d > 0 && d < min) {
      const push = (min - d) / 2, nx = (b.x - a.x) / d, ny = (b.y - a.y) / d;
      if (!a.isBoss && !a.isSub && a.type !== 'eye') moveEnt(a, -nx * push, -ny * push);
      if (!b.isBoss && !b.isSub && b.type !== 'eye') moveEnt(b, nx * push, ny * push);
    }
  }
  G.enemies = G.enemies.filter(e => !e.dead);

  for (const pr of G.proj) {
    const ox = pr.x, oy = pr.y;
    if (pr.thrown) updateThrown(pr, dt);
    if (pr.fx === 'homing' && pr.owner === 'player') {
      const t = nearestEnemy(pr, 280);
      if (t) {
        const cur = Math.atan2(pr.vy, pr.vx), sp = Math.hypot(pr.vx, pr.vy);
        const na = cur + clamp(angDiff(cur, angTo(pr, t)), -5 * dt, 5 * dt);
        pr.vx = Math.cos(na) * sp; pr.vy = Math.sin(na) * sp;
      }
    }
    pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
    const tx = Math.floor(pr.x / TILE), ty = Math.floor(pr.y / TILE);
    if (!pr.ghost && solidAt(tx, ty)) {
      if (pr.thrown) { pr.x = ox; pr.y = oy; if (pr.thrown === 'boomer') { pr.ph = 'back'; pr.hit = new Set(); } else if (pr.ph === 'out') { pr.ph = 'spin'; pr.vx = pr.vy = 0; pr.st = 0; } continue; }
      if (pr.kind === 'power') { breakCracks(pr.x, pr.y, 20); if (pr.split) { pr.x = ox; pr.y = oy; splitShot(pr); } }
      if (pr.bounce > 0) {
        pr.bounce--;
        if (solidAt(tx, Math.floor(oy / TILE))) pr.vx *= -1; else pr.vy *= -1;
        pr.x = ox; pr.y = oy; pr.hit = new Set();
        continue;
      }
      if (pr.owner === 'player' && (pr.fx === 'explode' || pr.boom)) explode(ox, oy, pr.boom || 55, pr.dmg, true);
      pr.life = 0; burst(pr.x, pr.y, pr.color, 3, 80, 2, .25); continue;
    }
    for (const o of G.props) {
      if (o.dead || !o.solid || dist(pr, o) > o.r + pr.r) continue;
      if (o.kind !== 'merchant') damageProp(o, pr.owner === 'player' ? pr.dmg : 1);
      if (pr.kind !== 'power' && !pr.thrown) { pr.life = 0; burst(pr.x, pr.y, pr.color, 3, 80, 2, .25); }
      break;
    }
    if (pr.life <= 0) continue;
    if (pr.owner === 'player') {
      for (const e of G.enemies) {
        if (e.dead || e.air || pr.hit.has(e) || dist(pr, e) > e.r + pr.r) continue;
        pr.hit.add(e);
        hurtEnemy(e, pr.dmg, Math.atan2(pr.vy, pr.vx), pr.kb || (pr.kind === 'power' ? 300 : 140), { src: pr.src, fx: pr.fx });
        if (pr.fx === 'chain') chainHit(e, pr.dmg);
        if (pr.split) splitShot(pr);
        // la hoz se clava en el primer enemigo que toca y gira ahí y lo sigue mientras gira (antes pasaba de largo y giraba en el vacío)
        if (pr.thrown === 'sickle' && pr.ph === 'out') { pr.ph = 'spin'; pr.vx = pr.vy = 0; pr.st = 0; pr.tick = .26; pr.stick = e; }
        if (pr.fx === 'explode' || pr.boom) { explode(pr.x, pr.y, pr.boom || 55, pr.dmg, true); pr.life = 0; break; }
        if (pr.pierce-- <= 0) { pr.life = 0; break; }
      }
    } else if (!G.over && dist(pr, p) < p.r + pr.r - 2) {
      if (p.blockT > 0 && shieldBlock(p, pr)) { /* bloqueada por el escudo */ }
      else if (p.bulwarkT > 0) reflect(pr, angTo(p, pr), 3);
      else if (p.inv <= 0) { if (pr.shred) shredShield(); if (hurtPlayer(pr.dmg, pr.por) && pr.el) elemHit(pr.el, { x: pr.x - pr.vx, y: pr.y - pr.vy }); if (pr.slowFx) { p.slow = 2; addText(p.x, p.y - 26, 'Atrapado', '#e8e8d8', 12); } pr.life = 0; }
    }
  }
  G.proj = G.proj.filter(pr => pr.life > 0);
  G.enemies = G.enemies.filter(e => !e.dead);
  for (const b of G.bolts) b.life -= dt;
  G.bolts = G.bolts.filter(b => b.life > 0);
  G.props = G.props.filter(o => !o.dead);
  for (const o of G.props) o.flash -= dt;

  const magnet = 110 + 160 * rc('iman');
  const maxEn = maxEnergy(p);
  for (const it of G.pickups) {
    if (it.kind === 'coin' || it.kind === 'gem' || it.kind === 'energy') {
      it.t = (it.t || 0) + dt;
      const d = dist(it, p);
      const pull = it.kind === 'coin' ? magnet : 120;
      if (d < pull && !G.over) { const a = angTo(it, p), s = 420 * (1 - d / (pull + 20)); it.vx += Math.cos(a) * s * dt * 8; it.vy += Math.sin(a) * s * dt * 8; }
      const f = Math.exp(-4 * dt); it.vx *= f; it.vy *= f;
      it.r = 4; moveEnt(it, it.vx * dt, it.vy * dt);
      if (d < p.r + 8 && !G.over) {
        if (it.kind === 'coin') { it.gone = true; G.coins++; sfx(1300 + Math.random() * 200, .05, 'sine', .025); }
        else if (it.kind === 'gem') { it.gone = true; G.gems++; addText(p.x, p.y - 24, '+1 gema', '#c77dff', 12); sfx(1600, .12, 'triangle', .03, 400); }
        else if (p.en < maxEn) { it.gone = true; p.en = Math.min(maxEn, p.en + 20); sfx(900, .06, 'sine', .025, 300); }
      }
    } else if (it.kind === 'potion') {
      if (dist(it, p) < p.r + 12 && p.hp < p.maxHp && !G.over) {
        it.gone = true; const h = Math.min(3, p.maxHp - p.hp); p.hp += h;
        addText(p.x, p.y - 24, '+' + h + ' vida', '#ff7a7e', 14); sfx(600, .18, 'sine', .04, 400);
      }
    } else if (it.kind === 'crystal') {
      it.bob = (it.bob || 0) + dt;
      if (dist(it, p) < p.r + 14 && !G.over) { it.gone = true; G.crystals[it.el]++; addText(p.x, p.y - 24, `+1 cristal de ${ELEMS[it.el].n.toLowerCase()}`, ELEMS[it.el].c, 13); sfx(1400, .2, 'triangle', .04, 600); ach('crystal'); }
    } else if (it.kind === 'totem') {
      it.rise = Math.min(1, (it.rise || 0) + dt * .8);
      if (it.rise < 1 && Math.random() < .5) G.parts.push({ x: it.x + rand(-16, 16), y: it.y, vx: rand(-40, 40), vy: rand(-60, -20), life: .5, max: .5, color: '#6b6480', size: 4 });
    } else if (it.kind === 'key') {
      if (dist(it, p) < p.r + 12 && !G.over) { it.gone = true; G.keys++; addText(p.x, p.y - 24, '+1 llave', '#e3a24a', 13); sfx(1100, .1, 'triangle', .03, 300); }
    } else it.bob = (it.bob || 0) + dt;
  }
  G.pickups = G.pickups.filter(it => !it.gone);

  for (const pt of G.parts) { if (pt.g) pt.vy += pt.g * dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; const f = Math.exp(-5 * dt); pt.vx *= f; pt.vy *= f; pt.life -= dt; }
  G.parts = G.parts.filter(pt => pt.life > 0);
  if (G.parts.length > 900) G.parts.splice(0, G.parts.length - 900);
  for (const t of G.texts) { t.y -= 34 * dt; t.life -= dt; }
  G.texts = G.texts.filter(t => t.life > 0);
  if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  G.shake *= Math.exp(-9 * dt);
  G.hurtFlash -= dt;

  const lead = touch.on ? 30 : 46;
  const tx = p.x + Math.cos(p.aim) * lead, ty = p.y + Math.sin(p.aim) * lead;
  const k = 1 - Math.exp(-7 * dt);
  G.cam.x += (tx - G.cam.x) * k; G.cam.y += (ty - G.cam.y) * k;
}

export { endGame, relicChips, showEnd, update };
