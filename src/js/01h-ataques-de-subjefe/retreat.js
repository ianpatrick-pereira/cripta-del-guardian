// Ataque de subjefe: retreat
defSubMove('retreat', {
  hacer(e, dt, c) {
    const { S, a, ph2, move } = c;
    e.timer += dt;
    if (e.timer < .35) move(a + Math.PI, 380);
    else if (e.k === 0) { e.k = 1; const n = ph2 ? 14 : 10; for (let i = 0; i < n; i++) enemyShoot(e, a + i * TAU / n, 170, 5, S.pc || '#f0e6c8'); sfx(300, .1, 'square', .03); }
    if (e.timer > .8) subIdle(e);
  }
});
