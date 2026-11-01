// Ataque de subjefe: fan
defSubMove('fan', {
  hacer(e, dt, c) {
    const { S, a } = c;
    e.timer += dt;
    if (e.timer < .5) { e.ca = a; return; }
    const T = e.timer - .5, dur = 1.3;
    while (e.k * .07 < T && T < dur) { const ang = e.ca - .9 + 1.8 * (e.k * .07 / dur); enemyShoot(e, ang, 230, 5, S.tint); e.k++; if (e.k % 3 === 0) sfx(420, .03, 'square', .015); }
    if (T > dur + .3) subIdle(e);
  }
});
