// Ataque de subjefe: slam
defSubMove('slam', {
  hacer(e, dt, c) {
    const { S, ph2 } = c;
    e.timer += dt;
    if (e.k === 0) { e.k = 1; hazard(e.x, e.y, 100, .7, 1, S.el ? S.tint : '#d4474b', { ring: ph2 ? 16 : 12, owner: e }); }
    if (e.timer > 1.2) subIdle(e);
  }
});
