// Ataque de subjefe: rain
defSubMove('rain', {
  hacer(e, dt, c) {
    const { p, S, ph2 } = c;
    e.timer += dt;
    const n = ph2 ? 7 : 5;
    while (e.k < n && e.timer >= e.k * .16) {
      const t = .5 + e.k * .1, j = e.k === 0 ? 0 : 70;
      hazard(p.x + G.pv.x * t * .8 + rand(-j, j), p.y + G.pv.y * t * .8 + rand(-j, j), 38, .85, 1, S.pc || '#e3a24a');
      e.k++;
    }
    if (e.timer > 1.4) subIdle(e);
  }
});
