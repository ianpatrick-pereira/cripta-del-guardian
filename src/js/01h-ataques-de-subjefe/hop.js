// Ataque de subjefe: hop (y su versión bighop, con hop2 entre saltos)
defSubMove('hop', {
  hacer(e, dt, c) {
    const { p, S, ph2 } = c;
    // salta hacia donde vas a estar; la sombra roja marca dónde cae
    e.timer += dt;
    const big = e.st === 'bighop', air = big ? .7 : .9;
    if (e.k === 0) { e.k = 1; if (!(e.reps > 0)) e.reps = big ? 3 : 1; e.air = true; const t = .6; e.tgt = { x: p.x + G.pv.x * t * D().lead, y: p.y + G.pv.y * t * D().lead }; if (hitsWall(e.tgt.x, e.tgt.y, e.r) || roomAt(e.tgt.x, e.tgt.y) !== G.cur) e.tgt = { x: p.x, y: p.y }; hazard(e.tgt.x, e.tgt.y, e.r + 22, air, 1, S.tint); sfx(160, .25, 'sine', .04, 300); }
    e.lift = Math.sin(clamp(e.timer / air, 0, 1) * Math.PI) * 110;
    if (e.k === 1 && e.timer >= air) {
      e.air = false; e.lift = 0; e.x = e.tgt.x; e.y = e.tgt.y; shake(9); noise(.2, .08, 500);
      const n = ph2 ? 12 : 9, off = rand(0, TAU); for (let i = 0; i < n; i++) enemyShoot(e, off + i * TAU / n, 150, 6, S.pc || '#9bff7a');
      burst(e.x, e.y, S.tint, 16, 200, 4);
      if (--e.reps > 0) { e.k = 0; e.timer = 0; e.st = 'hop2'; e.st_t = .25; }
      else e.k = 2;
    }
    if (e.k === 2 && e.timer > air + .5) subIdle(e);
  }
});
defSubMove('bighop', 'hop');
// pausa entre un salto y el siguiente
defSubMove('hop2', {
  hacer(e, dt, c) {
    if (e.st_t <= 0) { e.st = 'bighop'; e.k = 0; e.timer = 0; e.tele = .3; }
  }
});
