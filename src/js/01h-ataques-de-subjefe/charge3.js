// Ataque de subjefe: charge3
defSubMove('charge3', {
  hacer(e, dt, c) {
    const { ph2 } = c;
    // embiste varias veces seguidas; la línea roja marca el camino
    e.timer += dt;
    if (e.k === 0) { e.k = 1; e.reps = ph2 ? 3 : 2; e.timer = 0; }
    if (e.k === 1) {
      const wind = e.reps === (ph2 ? 3 : 2) ? .6 : .38;
      e.tele = wind - e.timer; e.charging = false;
      if (e.timer < wind - .18) e.ca = leadAng(e, 560, .5);
      if (e.timer >= wind) { e.k = 2; e.timer = 0; sfx(80, .3, 'sawtooth', .05); }
    } else {
      e.charging = true;
      const hit = moveEnt(e, Math.cos(e.ca) * 560 * dt, Math.sin(e.ca) * 560 * dt);
      const o = pushOutProps(e); if (o && o.kind !== 'merchant') damageProp(o, 99);
      if (ph2 && Math.random() < dt * 14) enemyShoot(e, e.ca + Math.PI + rand(-.8, .8), 60, 6, '#ff6a3a');
      if (hit || e.timer > .6) {
        if (hit) { shake(9); burst(e.x, e.y, '#7a6f8a', 12, 200); }
        e.charging = false;
        if (--e.reps > 0) { e.k = 1; e.timer = 0; } else subIdle(e);
      }
    }
  },
  // aviso que se dibuja antes que el subjefe
  aviso(e) {
    if (e.k !== 1) return;
    ctx.globalAlpha = .25; ctx.strokeStyle = '#d4474b'; ctx.lineWidth = e.r * 2;
    ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(e.ca) * 380, e.y + Math.sin(e.ca) * 380); ctx.stroke(); ctx.globalAlpha = 1;
  }
});
