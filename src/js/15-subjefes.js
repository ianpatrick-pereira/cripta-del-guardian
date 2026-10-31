// ================= Subjefes =================
const SUBS = {
  1: { sk: 'captain', name: 'Capitán Hueso', spr: 'skel', s: 3.4, r: 22, hp: 140, speed: 85, tint: '#e3a24a', minion: 'archer', want: 210,
       p1: ['volley', 'rain', 'retreat'], p2: ['volley', 'rain', 'fan', 'summon', 'retreat'] },
  2: { sk: 'matriarch', name: 'Matriarca del Limo', spr: 'toxic', s: 4.4, r: 26, hp: 290, speed: 62, tint: '#9be05a', minion: 'toxic', want: 120,
       p1: ['hop', 'spit', 'hop'], p2: ['hop', 'spit', 'bighop', 'summon'] },
  3: { sk: 'executioner', name: 'El Verdugo', spr: 'brute', s: 3.6, r: 26, hp: 450, speed: 72, tint: '#d4474b', minion: 'wraith', want: 0,
       p1: ['charge3', 'slam', 'charge3'], p2: ['charge3', 'slam', 'fan', 'summon'] },
  4: { sk: 'sentinel', name: 'Centinela Escarchado', spr: 'warden', s: 3.6, r: 24, hp: 600, speed: 72, tint: '#9bd8ff', minion: 'warden', want: 150,
       p1: ['volley', 'charge3', 'rain'], p2: ['volley', 'charge3', 'rain', 'summon', 'wave'] },
  5: { sk: 'smith', name: 'Herrero Fundido', spr: 'charger', s: 3.8, r: 26, hp: 750, speed: 66, tint: '#ff8a3a', minion: 'bomber', want: 0,
       p1: ['slam', 'charge3', 'rain'], p2: ['slam', 'charge3', 'rain', 'summon', 'fan'] },
  6: { sk: 'rootqueen', name: 'Madre Espina', spr: 'splitter', s: 4.6, r: 26, hp: 900, speed: 60, tint: '#9be05a', minion: 'splitter', want: 120,
       p1: ['hop', 'spit', 'whirl'], p2: ['bighop', 'spit', 'whirl', 'summon', 'fan'] },
  7: { sk: 'ashbishop', name: 'Obispo de Ceniza', spr: 'priest', s: 3.6, r: 22, hp: 1050, speed: 80, tint: '#c77dff', minion: 'phantom', want: 220,
       p1: ['volley', 'retreat', 'gust', 'fan'], p2: ['volley', 'retreat', 'gust', 'fan', 'summon', 'wave', 'rain'] },
  8: { sk: 'twin', name: 'El Gemelo de Aldric', spr: 'phantom', s: 3.6, r: 22, hp: 1250, speed: 105, tint: '#ffb0c8', minion: 'phantom', want: 160,
       p1: ['charge3', 'fan', 'retreat', 'wave'], p2: ['charge3', 'fan', 'retreat', 'summon', 'whirl', 'gust', 'bighop'] },
};
function mkSub(floor, x, y) {
  // los subjefes extra (de pisos anteriores) llegan con la vida del subjefe del piso actual
  const S = SUBS[floor], base = floor === G.fi + 1 ? S.hp : SUBS[G.fi + 1].hp * .75, hp = Math.round(base * D().hp * (1 + .8 * (G.cycle - 1)));
  return { def: S, type: 'sub', isSub: true, sk: S.sk, name: S.name, spr: S.spr, s: S.s, r: S.r, x, y, hp, max: hp, speed: S.speed, dmg: 1, tint: S.tint,
    kx: 0, ky: 0, flash: 0, t: 0, phase: 1, st: 'idle', st_t: 1, last: '', k: 0, ca: 0, timer: 0, poison: 0, pt: 0, wob: 0, alpha: 1, air: false, lift: 0 };
}
const enemyPace = () => Math.min(1.4, 1 + .05 * (G.floor - 1));
function subIdle(e) { e.st = 'idle'; e.st_t = (e.phase === 1 ? 1.1 : .7) / D().rate / (e.elem ? 1 + .12 * (G.floor - 1) : enemyPace()); }
function updateSub(e, dt) {
  const p = G.player, S = e.def || SUBS[G.fi + 1], a = angTo(e, p), d = dist(e, p), ph2 = e.phase === 2;
  const sm = e.slowT > 0 ? .7 : 1;
  e.st_t -= dt; e.tele = (e.tele || 0) - dt;
  if (e.phase === 1 && e.hp <= e.max * (G.diff === 'hard' ? .6 : .5)) {
    e.phase = 2; e.speed *= 1.25; const heal = Math.round(e.max * .12); e.hp = Math.min(e.max, e.hp + heal); addText(e.x, e.y - e.r - 20, `¡Furioso! +${heal} vida`, '#d4474b', 16); shake(8); sfx(70, .5, 'sawtooth', .05, 30);
    burst(e.x, e.y, S.tint, 24, 220, 4);
  }
  const move = (ang, sp) => { moveEnt(e, Math.cos(ang) * sp * sm * dt, Math.sin(ang) * sp * sm * dt); const o = pushOutProps(e); if (o && o.kind !== 'merchant' && e.sk === 'executioner') damageProp(o, 99); };
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
    case 'volley': {
      e.timer += dt; e.aimA = leadAng(e, 270);
      const vols = ph2 ? 4 : 3, n = ph2 ? 5 : 4;
      if (e.timer > .5 && e.k < vols && e.timer >= .5 + e.k * .28) { for (let i = 0; i < n; i++) enemyShoot(e, e.aimA + (i - (n - 1) / 2) * .17, 270, 5, S.pc || '#f0e6c8'); e.k++; sfx(500, .05, 'triangle', .025, -200); }
      if (e.timer > .5 + vols * .28 + .3) subIdle(e);
      return;
    }
    case 'rain': {
      e.timer += dt;
      const n = ph2 ? 7 : 5;
      while (e.k < n && e.timer >= e.k * .16) {
        const t = .5 + e.k * .1, j = e.k === 0 ? 0 : 70;
        hazard(p.x + G.pv.x * t * .8 + rand(-j, j), p.y + G.pv.y * t * .8 + rand(-j, j), 38, .85, 1, S.pc || '#e3a24a');
        e.k++;
      }
      if (e.timer > 1.4) subIdle(e);
      return;
    }
    case 'retreat': {
      e.timer += dt;
      if (e.timer < .35) move(a + Math.PI, 380);
      else if (e.k === 0) { e.k = 1; const n = ph2 ? 14 : 10; for (let i = 0; i < n; i++) enemyShoot(e, a + i * TAU / n, 170, 5, S.pc || '#f0e6c8'); sfx(300, .1, 'square', .03); }
      if (e.timer > .8) subIdle(e);
      return;
    }
    case 'fan': {
      e.timer += dt;
      if (e.timer < .5) { e.ca = a; return; }
      const T = e.timer - .5, dur = 1.3;
      while (e.k * .07 < T && T < dur) { const ang = e.ca - .9 + 1.8 * (e.k * .07 / dur); enemyShoot(e, ang, 230, 5, S.tint); e.k++; if (e.k % 3 === 0) sfx(420, .03, 'square', .015); }
      if (T > dur + .3) subIdle(e);
      return;
    }
    case 'summon': {
      if (e.k === 0) {
        e.k = 1;
        for (let i = 0; i < 2; i++) { const ang = rand(0, TAU), x = e.x + Math.cos(ang) * 80, y = e.y + Math.sin(ang) * 80; if (!hitsWall(x, y, 12)) G.markers.push({ x, y, t: .8, type: Array.isArray(S.minion) ? pick(S.minion) : S.minion, depth: S.el ? 1 : 2, el: S.el }); }
        sfx(240, .4, 'triangle', .04, -150);
      }
      if (e.st_t < -.8) subIdle(e);
      return;
    }
    case 'hop': case 'bighop': {
      // salta hacia donde vas a estar; la sombra roja marca dónde cae
      e.timer += dt;
      const big = e.st === 'bighop', air = big ? .7 : .9;
      if (e.k === 0) { e.k = 1; if (!(e.reps > 0)) e.reps = big ? 3 : 1; e.air = true; const t = .6; e.tgt = { x: p.x + G.pv.x * t * D().lead, y: p.y + G.pv.y * t * D().lead }; if (hitsWall(e.tgt.x, e.tgt.y, e.r) || roomAt(e.tgt.x, e.tgt.y) !== G.cur) e.tgt = { x: p.x, y: p.y }; hazard(e.tgt.x, e.tgt.y, e.r + 22, air, 1, S.tint); sfx(160, .25, 'sine', .04, 300); }
      e.lift = Math.sin(clamp(e.timer / air, 0, 1) * Math.PI) * 110;
      if (e.k === 1 && e.timer >= air) {
        e.air = false; e.lift = 0; e.x = e.tgt.x; e.y = e.tgt.y; shake(9); noise(.2, .08, 500);
        const n = ph2 ? 12 : 9, off = rand(0, TAU); for (let i = 0; i < n; i++) enemyShoot(e, off + i * TAU / n, 150, 6, S.pc || '#9bff7a');
        burst(e.x, e.y, S.tint, 16, 200, 4);
        if (--e.reps > 0) { e.k = 0; e.timer = 0; e.st = 'hop2'; e.st_t = .25; }
        else e.k = 2;
      }
      if (e.k === 2 && e.timer > air + .5) subIdle(e);
      return;
    }
    case 'hop2': { if (e.st_t <= 0) { e.st = 'bighop'; e.k = 0; e.timer = 0; e.tele = .3; } return; }
    case 'spit': {
      e.timer += dt;
      const vols = ph2 ? 4 : 3;
      if (e.timer > .45 && e.k < vols && e.timer >= .45 + e.k * .35) { const A = leadAng(e, 160); for (let i = 0; i < 7; i++) enemyShoot(e, A + (i - 3) * .16, 160, 7, S.pc || '#9bff7a'); e.k++; sfx(330, .1, 'sine', .03, 200); }
      if (e.timer > .45 + vols * .35 + .3) subIdle(e);
      return;
    }
    case 'charge3': {
      // embiste varias veces seguidas; la línea roja marca el camino
      e.timer += dt;
      if (e.k === 0) { e.k = 1; e.reps = ph2 ? 3 : 2; e.timer = 0; }
      if (e.k === 1) {
        const wind = e.reps === (ph2 ? 3 : 2) ? .6 : .38;
        e.tele = wind - e.timer; e.charging = false;
        if (e.timer < wind - .18) e.ca = leadAng(e, 560, .5);
        if (e.timer >= wind) { e.k = 2; e.timer = 0; sfx(80, .3, 'sawtooth', .05); }
      } else {
        e.charging = true;
        const hit = moveEnt(e, Math.cos(e.ca) * 560 * dt, Math.sin(e.ca) * 560 * dt);
        const o = pushOutProps(e); if (o && o.kind !== 'merchant') damageProp(o, 99);
        if (ph2 && Math.random() < dt * 14) enemyShoot(e, e.ca + Math.PI + rand(-.8, .8), 60, 6, '#ff6a3a');
        if (hit || e.timer > .6) {
          if (hit) { shake(9); burst(e.x, e.y, '#7a6f8a', 12, 200); }
          e.charging = false;
          if (--e.reps > 0) { e.k = 1; e.timer = 0; } else subIdle(e);
        }
      }
      return;
    }
    case 'wave': {
      // ola: dos muros de agua con un hueco; si te tocan, te empapan
      e.timer += dt;
      if (e.timer > .55 && e.k < 2 && e.timer >= .55 + e.k * .7) {
        const A = angTo(e, p), px = -Math.sin(A), py = Math.cos(A), gap = rand(-3, 3) | 0, n = ph2 ? 13 : 11;
        for (let i = -(n >> 1); i <= n >> 1; i++) {
          if (Math.abs(i - gap) < 1.5) continue;
          const sx = e.x + px * i * 22, sy = e.y + py * i * 22;
          if (!hitsWall(sx, sy, 6)) enemyShoot({ x: sx, y: sy, r: 0 }, A, 150 + 10 * G.floor, 7, S.pc);
        }
        e.k++; sfx(260, .3, 'sine', .04, -120); noise(.25, .04, 900);
      }
      if (e.timer > 2.1) subIdle(e);
      return;
    }
    case 'gust': {
      // ráfaga: viento que te empuja lejos mientras lanza cuchillas de aire
      e.timer += dt;
      if (e.timer > .5 && e.timer < 2.1) {
        const A = angTo(e, p);
        p.kbx = (p.kbx || 0) + Math.cos(A) * 900 * dt; p.kby = (p.kby || 0) + Math.sin(A) * 900 * dt;
        while (e.k * .22 < e.timer - .5) { const n = 3; for (let i = 0; i < n; i++) enemyShoot(e, A + (i - 1) * .3 + rand(-.05, .05), 300, 5, S.pc); e.k++; }
        if (Math.random() < .8) { const off = rand(-60, 60); G.parts.push({ x: e.x - Math.sin(A) * off, y: e.y + Math.cos(A) * off, vx: Math.cos(A) * 420, vy: Math.sin(A) * 420, life: .5, max: .5, color: 'rgba(200,240,224,.7)', size: 2 }); }
      }
      if (e.timer > 2.4) subIdle(e);
      return;
    }
    case 'whirl': {
      // remolino: te arrastra hacia él mientras dispara anillos
      e.timer += dt;
      if (e.timer > .4 && e.timer < 2) {
        const ap = angTo(p, e); moveEnt(p, Math.cos(ap) * 110 * dt, Math.sin(ap) * 110 * dt);
        while (e.k * .3 < e.timer - .4) { const n = 8, off = e.k * .4; for (let i = 0; i < n; i++) enemyShoot(e, off + i * TAU / n, 140, 5, S.pc || S.tint); e.k++; }
        if (Math.random() < .6) { const an = rand(0, TAU), rr = rand(30, 120); G.parts.push({ x: e.x + Math.cos(an) * rr, y: e.y + Math.sin(an) * rr, vx: -Math.cos(an) * 120, vy: -Math.sin(an) * 120, life: .4, max: .4, color: S.tint, size: 3 }); }
      }
      if (e.timer > 2.3) subIdle(e);
      return;
    }
    case 'slam': {
      e.timer += dt;
      if (e.k === 0) { e.k = 1; hazard(e.x, e.y, 100, .7, 1, S.el ? S.tint : '#d4474b', { ring: ph2 ? 16 : 12, owner: e }); }
      if (e.timer > 1.2) subIdle(e);
      return;
    }
  }
}
function subDefeated(e) {
  if (e.elem) {
    const E = ELEMS[e.elem];
    showBanner(e.name + ' cae', E.c, `Suelta 1 cristal de ${E.n.toLowerCase()}`);
    G.pickups.push({ kind: 'crystal', el: e.elem, x: e.x, y: e.y });
    for (let i = 0; i < 8; i++) dropCoin(e.x, e.y);
    if (Math.random() < .5) G.pickups.push({ kind: 'gem', x: e.x, y: e.y, vx: rand(-90, 90), vy: rand(-90, 90) });
    return;
  }
  showBanner(e.name + ' cae', '#e3a24a', 'Subjefe derrotado');
  later(.9, offerTalent);
  for (let i = 0; i < 12; i++) dropCoin(e.x, e.y);
  G.pickups.push({ kind: 'gem', x: e.x, y: e.y, vx: rand(-90, 90), vy: rand(-90, 90) });
  G.pickups.push({ kind: 'potion', x: e.x + 20, y: e.y });
  if (e.sk === 'matriarch') for (let i = 0; i < 3; i++) G.enemies.push(mkEnemy('toxic', e.x + rand(-20, 20), e.y + rand(-20, 20), 1, false));
}

