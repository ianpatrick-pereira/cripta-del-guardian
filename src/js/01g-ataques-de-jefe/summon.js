// Ataque de jefe: summon
defBossMove('summon', {
  hacer(e, dt, c) {
    const { B } = c;
    if (e.k === 0) {
      e.k = 1;
      for (let i = 0; i < 3; i++) {
        const ang = rand(0, TAU), x = e.x + Math.cos(ang) * 90, y = e.y + Math.sin(ang) * 90;
        if (!hitsWall(x, y, 12)) G.markers.push({ x, y, t: .8, type: B.minion, depth: 3 });
      }
      sfx(240, .4, 'triangle', .04, -150);
    }
    if (e.st_t < -.7) bossIdle(e);
  }
});
