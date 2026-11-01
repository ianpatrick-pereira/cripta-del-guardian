// Ataque de jefe: spiral
defBossMove('spiral', {
  hacer(e, dt, c) {
    e.timer += dt;
    while (e.k * .065 < e.timer && e.timer < 2.6) {
      const base = e.k * .33;
      for (let i = 0; i < 3; i++) enemyShoot(e, base + i * TAU / 3, 165, 6, '#c77dff');
      e.k++;
      if (e.k % 4 === 0) sfx(300 + (e.k % 20) * 10, .04, 'square', .015);
    }
    if (e.timer > 3) bossIdle(e);
  }
});
