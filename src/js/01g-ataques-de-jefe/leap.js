// Ataque de jefe: leap
defBossMove('leap', {
  hacer(e, dt, c) {
    const { p, ph2, ph3, bcol } = c;
    e.timer += dt;
    if (!e.reps) e.reps = ph3 ? 2 : 1;
    if (e.k === 0) { e.air = true; e.k = 1; sfx(140, .3, 'sawtooth', .04, 200); }
    if (e.timer < .45) { const t = .55 * D().lead, tx = p.x + G.pv.x * t, ty = p.y + G.pv.y * t; e.tgt = hitsWall(tx, ty, e.r) ? { x: p.x, y: p.y } : { x: tx, y: ty }; }
    if (e.timer >= 1 && e.k === 1) {
      e.k = 2; e.air = false;
      if (!hitsWall(e.tgt.x, e.tgt.y, e.r)) { e.x = e.tgt.x; e.y = e.tgt.y; }
      shake(14); noise(.3, .1, 500); burst(e.x, e.y, '#5a4a5a', 22, 220, 5);
      bossRing(e, ph2 ? 18 : 12, 170, bcol);
      if (dist(e, p) < e.r + p.r + 10) hurtPlayer(2, quien(e));
    }
    if (e.timer > 1.5) { if (--e.reps > 0) { e.k = 0; e.timer = .2; } else bossIdle(e); }
  }
});
