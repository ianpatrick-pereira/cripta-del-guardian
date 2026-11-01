// Ataque de jefe: web
defBossMove('web', {
  hacer(e, dt, c) {
    const { a, ph2 } = c;
    e.timer += dt;
    const vol = ph2 ? 3 : 2, n = ph2 ? 7 : 5;
    if (e.k < vol && e.timer >= e.k * .5) { for (let i = 0; i < n; i++) enemyShoot(e, a + (i - (n - 1) / 2) * .22, 140, 9, '#e8e8d8', 1, 'web'); e.k++; sfx(500, .1, 'triangle', .03, -250); }
    if (e.timer > vol * .5 + .5) bossIdle(e);
  }
});
