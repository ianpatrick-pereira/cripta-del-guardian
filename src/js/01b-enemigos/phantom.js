defEnemy('phantom', {
  orden: 17,
  stats: { hp: 12, r: 12, speed: 100, dmg: 1, spr: 'phantom', s: 2.2 },
  bestiario: { n: 'Fantasma', d: 'Se vuelve intangible, reaparece cerca y dispara en abanico.' },
  sprite: {
    clave: 'phantom',
    mapa: 'wraith',
    paleta: { k: '#5a2a3a', w: '#ffb0c8', e: '#2a0010' }
  },
  // Fantasma: se vuelve intangible, reaparece cerca, dispara en abanico y queda expuesto un momento
  ia(e, c) {
    const { dt, cdt, p, hidden, a, go, done } = c;
    e.cd -= cdt;
    if (e.st === 'walk') {
      e.air = false; e.alpha = Math.min(1, (e.alpha || 0) + dt * 2);
      go(a + Math.PI / 2, e.speed * .5);
      if (!hidden && e.cd <= 0 && takeToken(e)) { e.st = 'fade'; e.st_t = 1.2; e.air = true; burst(e.x, e.y, '#ffb0c8', 10, 110); }
    } else if (e.st === 'fade') {
      e.st_t -= dt; e.alpha = .18; go(a + Math.PI / 2, e.speed * 1.4);
      if (e.st_t <= 0) {
        for (const ang of [rand(0, TAU), rand(0, TAU), rand(0, TAU)]) { const nx = p.x + Math.cos(ang) * 130, ny = p.y + Math.sin(ang) * 130; if (!hitsWall(nx, ny, e.r) && roomAt(nx, ny) === G.cur) { e.x = nx; e.y = ny; break; } }
        e.air = false; e.alpha = .5; telegraph(e, .45);
      }
    } else if (e.st === 'tele') {
      e.st_t -= dt;
      if (e.st_t <= 0) { const n = e.elite ? 7 : 5, A = leadAng(e, 220); for (let i = 0; i < n; i++) enemyShoot(e, A + (i - (n - 1) / 2) * .2, 220, 5, '#ffb0c8'); sfx(300, .15, 'sine', .04, -150); done(1.4, rand(1.8, 2.6)); }
    }
  },
  forma(e, f) { f.alpha = (e.alpha ?? 1) * (.7 + .2 * Math.sin(e.t * 5)); f.oy = Math.sin(e.t * 3) * 3 - 4; }
});
