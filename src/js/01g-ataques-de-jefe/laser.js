// Ataque de jefe: laser
defBossMove('laser', {
  hacer(e, dt, c) {
    const { p, a, ph2, ph3 } = c;
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
  }
});
