// Ataque de jefe: aimed
defBossMove('aimed', {
  hacer(e, dt, c) {
    const { a, ph2 } = c;
    e.timer += dt;
    const vol = ph2 ? 5 : 3, n = ph2 ? 5 : 3;
    if (e.k < vol && e.timer >= e.k * .3) { for (let i = 0; i < n; i++) enemyShoot(e, a + (i - (n - 1) / 2) * .2, 270, 6, '#ffb36a'); e.k++; sfx(420, .06, 'square', .03); }
    if (e.timer > vol * .3 + .4) bossIdle(e);
  }
});
