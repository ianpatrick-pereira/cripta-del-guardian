// ================= Jefes =================
function bossIdle(e) { e.st = 'idle'; e.st_t = (e.phase === 1 ? 1.05 : e.phase === 2 ? .6 : .38) / D().rate / enemyPace(); }
function bossRing(e, n, sp, color, off = 0, r = 7) { for (let i = 0; i < n; i++) enemyShoot(e, off + i * TAU / n, sp, r, color); }
function updateBoss(e, dt) {
  const p = G.player, a = angTo(e, p), B = BOSSES[e.kind];
  e.st_t -= dt; e.spin += dt;
  e.tele = (e.tele || 0) - dt;
  if ((e.phase === 1 && e.hp <= e.max * .5) || (e.phase === 2 && e.hp <= e.max * .25)) {
    e.phase++; e.st = 'enrage'; e.st_t = 1.5; e.invuln = true;
    const heal = Math.round(e.max * (e.phase === 2 ? .15 : .12)); e.hp = Math.min(e.max, e.hp + heal); addText(e.x, e.y - 70, `+${heal} vida`, '#6cc46a', 16); e.speed = e.phase === 3 ? 82 : 62; e.air = false; e.fade = 1; e.reps = 0;
    G.proj = G.proj.filter(pr => pr.owner === 'player'); G.beams = []; G.hazards = [];
    showBanner(e.phase === 3 ? '¡Fase 3! Furia' : '¡Fase 2!', '#d4474b', e.phase === 2 ? 'Algunos de sus ataques rompen tu escudo' : B.name);
    shake(14); sfx(60, .8, 'sawtooth', .06, 40);
    return;
  }
  const ph2 = e.phase >= 2, ph3 = e.phase === 3, d = dist(e, p);
  const bcol = B.col || (e.kind === 'queen' ? '#cfd8a0' : e.kind === 'devourer' ? '#ff5a3a' : '#ff6a8a');
  switch (e.st) {
    case 'enrage':
      if (Math.random() < .5) burst(e.x, e.y, '#d4474b', 2, 200, 4);
      if (e.st_t <= 0) { e.invuln = false; bossIdle(e); }
      return;
    case 'idle': {
      // se mueve a su distancia preferida y te rodea en vez de caminar en línea recta
      if (!e.dir || Math.random() < dt * .3) e.dir = Math.random() < .5 ? 1 : -1;
      const want = B.want || (e.kind === 'guardian' ? 120 : 190);
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
    case 'gapring': {
      // anillos con un hueco: hay que encontrar la abertura
      e.timer += dt;
      const rings = ph3 ? 3 : 2;
      if (e.k < rings && e.timer >= e.k * .55) {
        const n = 34;
        for (let i = 0; i < n; i++) { const ang = i * TAU / n; if (Math.abs(angDiff(ang, e.gap)) < .42) continue; enemyShoot(e, ang, 150, 6, bcol); }
        e.gap += (Math.random() < .5 ? 1 : -1) * rand(.6, 1.1); e.k++; sfx(200, .12, 'square', .04, -60);
      }
      if (e.timer > rings * .55 + .3) bossIdle(e);
      return;
    }
    case 'rain': {
      e.timer += dt;
      const n = ph3 ? 9 : 6;
      while (e.k < n && e.timer >= e.k * .14) {
        const t = .5, j = e.k === 0 ? 0 : 90;
        hazard(p.x + G.pv.x * t * .8 + rand(-j, j), p.y + G.pv.y * t * .8 + rand(-j, j), 44, .85, 1, bcol, { shred: true });
        e.k++;
      }
      if (e.timer > n * .14 + .6) bossIdle(e);
      return;
    }
    case 'predict': {
      e.timer += dt;
      const vol = ph3 ? 6 : 4;
      if (e.k < vol && e.timer >= e.k * .22) { const A = leadAng(e, 300, 1); for (let i = -1; i <= 1; i++) enemyShoot(e, A + i * .12, 300, 6, '#ffb36a'); e.k++; sfx(460, .05, 'square', .03); }
      if (e.timer > vol * .22 + .4) bossIdle(e);
      return;
    }
    case 'burst': {
      e.timer += dt;
      const rings = ph2 ? 3 : 2, n = ph2 ? 20 : 15;
      if (e.k < rings && e.timer >= e.k * .38) { bossRing(e, n, ph2 ? 180 : 160, bcol, e.k * (TAU / n / 2)); e.k++; sfx(160, .12, 'square', .04, -60); }
      if (e.timer > rings * .38 + .4) bossIdle(e);
      return;
    }
    case 'aimed': {
      e.timer += dt;
      const vol = ph2 ? 5 : 3, n = ph2 ? 5 : 3;
      if (e.k < vol && e.timer >= e.k * .3) { for (let i = 0; i < n; i++) enemyShoot(e, a + (i - (n - 1) / 2) * .2, 270, 6, '#ffb36a'); e.k++; sfx(420, .06, 'square', .03); }
      if (e.timer > vol * .3 + .4) bossIdle(e);
      return;
    }
    case 'charge': {
      e.timer += dt;
      const wind = ph2 ? .6 : .85;
      if (!e.reps) e.reps = ph3 ? 3 : 1;
      if (e.k === 0) {
        if (e.timer < wind - .25) e.ca = leadAng(e, ph2 ? 640 : 520, .5);
        if (e.timer >= wind) { e.k = 1; e.timer = 0; sfx(80, .3, 'sawtooth', .05); }
      } else {
        const sp = ph2 ? 640 : 520;
        const hit = moveEnt(e, Math.cos(e.ca) * sp * dt, Math.sin(e.ca) * sp * dt);
        const o = pushOutProps(e); if (o && o.kind !== 'merchant') damageProp(o, 99);
        if (hit || e.timer > .75) {
          if (hit) { shake(12); burst(e.x, e.y, '#7a6f8a', 16, 200); if (ph2) bossRing(e, 12, 170, bcol); }
          if (--e.reps > 0) { e.k = 0; e.timer = .3; } else bossIdle(e);
        }
      }
      return;
    }
    case 'spiral': {
      e.timer += dt;
      while (e.k * .065 < e.timer && e.timer < 2.6) {
        const base = e.k * .33;
        for (let i = 0; i < 3; i++) enemyShoot(e, base + i * TAU / 3, 165, 6, '#c77dff');
        e.k++;
        if (e.k % 4 === 0) sfx(300 + (e.k % 20) * 10, .04, 'square', .015);
      }
      if (e.timer > 3) bossIdle(e);
      return;
    }
    case 'summon': {
      if (e.k === 0) {
        e.k = 1;
        for (let i = 0; i < 3; i++) {
          const ang = rand(0, TAU), x = e.x + Math.cos(ang) * 90, y = e.y + Math.sin(ang) * 90;
          if (!hitsWall(x, y, 12)) G.markers.push({ x, y, t: .8, type: B.minion, depth: 3 });
        }
        sfx(240, .4, 'triangle', .04, -150);
      }
      if (e.st_t < -.7) bossIdle(e);
      return;
    }
    case 'web': {
      e.timer += dt;
      const vol = ph2 ? 3 : 2, n = ph2 ? 7 : 5;
      if (e.k < vol && e.timer >= e.k * .5) { for (let i = 0; i < n; i++) enemyShoot(e, a + (i - (n - 1) / 2) * .22, 140, 9, '#e8e8d8', 1, 'web'); e.k++; sfx(500, .1, 'triangle', .03, -250); }
      if (e.timer > vol * .5 + .5) bossIdle(e);
      return;
    }
    case 'leap': {
      e.timer += dt;
      if (!e.reps) e.reps = ph3 ? 2 : 1;
      if (e.k === 0) { e.air = true; e.k = 1; sfx(140, .3, 'sawtooth', .04, 200); }
      if (e.timer < .45) { const t = .55 * D().lead, tx = p.x + G.pv.x * t, ty = p.y + G.pv.y * t; e.tgt = hitsWall(tx, ty, e.r) ? { x: p.x, y: p.y } : { x: tx, y: ty }; }
      if (e.timer >= 1 && e.k === 1) {
        e.k = 2; e.air = false;
        if (!hitsWall(e.tgt.x, e.tgt.y, e.r)) { e.x = e.tgt.x; e.y = e.tgt.y; }
        shake(14); noise(.3, .1, 500); burst(e.x, e.y, '#5a4a5a', 22, 220, 5);
        bossRing(e, ph2 ? 18 : 12, 170, bcol);
        if (dist(e, p) < e.r + p.r + 10) hurtPlayer(2);
      }
      if (e.timer > 1.5) { if (--e.reps > 0) { e.k = 0; e.timer = .2; } else bossIdle(e); }
      return;
    }
    case 'laser': {
      e.timer += dt;
      const n = ph3 ? 4 : ph2 ? 3 : 1, wind = .85, act = ph2 ? 1.2 : .6;
      if (e.k === 0) {
        if (e.timer < wind - .25) e.ca = a;
        G.beams = []; for (let i = 0; i < n; i++) G.beams.push({ x: e.x, y: e.y, a: e.ca + i * TAU / n, on: false });
        if (e.timer >= wind) { e.k = 1; e.timer = 0; sfx(90, act, 'sawtooth', .05, 60); noise(act, .05, 2000); }
      } else {
        for (const b of G.beams) { b.on = true; b.x = e.x; b.y = e.y; if (ph2) b.a += dt * .9; }
        for (const b of G.beams) {
          const dx = p.x - b.x, dy = p.y - b.y, along = dx * Math.cos(b.a) + dy * Math.sin(b.a), perp = Math.abs(-dx * Math.sin(b.a) + dy * Math.cos(b.a));
          if (along > 0 && along < 900 && perp < 13) { shredShield(); hurtPlayer(1); }
        }
        if (e.timer > act) { G.beams = []; bossIdle(e); }
      }
      return;
    }
    case 'teleport': {
      e.timer += dt;
      if (e.k === 0) { e.fade = Math.max(0, 1 - e.timer / .4); if (e.timer >= .4) { e.k = 1; e.invuln = true; const s = freeSpot(G.bossRoom, 3, 0, p, 170); if (s) { e.x = s.x; e.y = s.y; } sfx(160, .3, 'sine', .04, -100); } }
      else { e.fade = Math.min(1, (e.timer - .4) / .3); if (e.k === 1 && e.timer >= .7) { e.k = 2; e.invuln = false; bossRing(e, ph2 ? 16 : 12, 170, bcol); } }
      if (e.timer > 1.1) { e.fade = 1; e.invuln = false; bossIdle(e); }
      return;
    }
    case 'dark': {
      e.timer += dt;
      if (e.k === 0) { G.darkT = 3.5; e.k = 1; showBanner('La luz se apaga', '#d4474b'); sfx(50, 1.2, 'sine', .08, -20); }
      if (e.k >= 1 && e.k < 5 && e.timer >= e.k * .6) { for (let i = -1; i <= 1; i++) enemyShoot(e, a + i * .25, 230, 6, '#ff5a3a'); e.k++; }
      if (e.timer > 3.2) bossIdle(e);
      return;
    }
  }
}
function bossDefeated(e) {
  G.boss = null; G.beams = []; G.darkT = 0; G.hazards = [];
  for (let i = 0; i < 25; i++) dropCoin(e.x, e.y);
  if (Math.random() < .4) dropArmor(e.x + 40, e.y + 30, 'chest');
  for (let i = 0; i < Math.ceil((4 + G.floor) / 2); i++) G.pickups.push({ kind: 'gem', x: e.x, y: e.y, vx: rand(-120, 120), vy: rand(-120, 120) });
  for (const o of G.enemies) if (o !== e && !o.dead) { o.dead = true; burst(o.x, o.y, '#ece4cf', 10); }
  G.markers.length = 0;
  G.proj = G.proj.filter(pr => pr.owner === 'player');
  const room = G.bossRoom; room.locked = false; room.cleared = true; G.roomsCleared++;
  if (e.kind === 'guardian') ach('boss1');
  if (e.kind === 'devourer') ach('boss3');
  SAVE.kills['boss:' + e.kind] = (SAVE.kills['boss:' + e.kind] || 0) + 1;
  if (G.floor === 8 && !G.wonOnce) {
    G.wonOnce = true; SAVE.wins++; ach('win'); if (G.diff === 'hard') ach('nightmare'); writeSave();
    showBanner('¡La cripta ha caído!', '#e3a24a', 'Sal victorioso o desciende al Abismo eterno');
  } else showBanner(BOSSES[e.kind].name + ' cae', '#e3a24a', `Piso ${G.floor} superado`);
  later(1.4, () => openChoice('Recompensa del jefe', 'Elige una reliquia', randomRelics(3), () => {
    G.pickups.push({ kind: 'portal', x: room.cx, y: room.cy });
    addText(room.cx, room.cy - 40, G.floor >= 8 ? 'El portal baja al Abismo eterno' : 'Se abre un portal', '#c77dff', 15);
    if (G.floor >= 8) G.pickups.push({ kind: 'exit', x: room.cx + 100, y: room.cy });
  }));
}

