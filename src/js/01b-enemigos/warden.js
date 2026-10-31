defEnemy('warden', {
  orden: 11,
  stats: { hp: 22, r: 15, speed: 55, dmg: 1, spr: 'warden', s: 2.3 },
  bestiario: { n: 'Escudero', d: 'Su escudo frena casi todo el daño de frente: flanquéalo. Empuja con el escudo.' },
  sprite: {
    clave: 'warden',
    mapa: 'knight',
    paleta: { k: '#0e1420', o: '#9bd8ff', s: '#8a9ab0', v: '#1b2230', a: '#5a6a80', b: '#3a4a5a', r: '#4ab0e8', l: '#3a4658' }
  },
  // Escudero: escudo al frente (los golpes de frente casi no le hacen nada); de cerca empuja con el escudo
  ia(e, c) {
    const { dt, cdt, p, hidden, tgt, d, a, go, done } = c;
    // gira despacio: rodéalo o pásale por al lado para golpearlo por la espalda
    e.cd -= cdt; e.face = e.face ?? a; e.face += clamp(angDiff(e.face, a), -2.2 * dt, 2.2 * dt);
    if (e.st === 'walk') {
      go(angTo(e, flankPoint(e, tgt, d)), e.speed * (d < 60 ? .3 : 1));
      if (!hidden && d < 90 && e.cd <= 0 && takeToken(e)) { telegraph(e, .45); e.ca = a; }
    } else if (e.st === 'tele') {
      e.st_t -= dt; e.ca = a;
      if (e.st_t <= 0) { e.st = 'act'; e.st_t = .22; sfx(140, .1, 'square', .04, -60); }
    } else if (e.st === 'act') {
      e.st_t -= dt; go(e.ca, 330);
      if (e.st_t <= 0) { if (G.floor >= 6 || e.elite) { const n = 6; for (let i = 0; i < n; i++) enemyShoot(e, e.ca + (i - (n - 1) / 2) * .22, 170, 5, '#9bd8ff'); } done(.45, rand(1.6, 2.2)); }
    }
  },
  encima(e, la, white) {
      const fa = e.face ?? la; ctx.save(); ctx.translate(e.x + Math.cos(fa) * (e.r + 2), e.y + Math.sin(fa) * (e.r + 2)); ctx.rotate(fa);
      ctx.fillStyle = white ? '#fff' : '#5a6a80'; ctx.fillRect(-4, -15, 8, 30); ctx.fillStyle = '#9bd8ff'; ctx.fillRect(-1, -12, 3, 24); ctx.restore();
  },
  // casi no recibe daño de frente: hay que flanquearlo
  alRecibir(e, dmg, ang, o) {
    if (!o.explosion && Math.abs(angDiff(ang, (e.face ?? angTo(e, G.player)) + Math.PI)) < 1.1) {
      dmg = Math.max(1, Math.round(dmg * .2)); if (Math.random() < .3) addText(e.x, e.y - e.r - 8, 'Bloqueado', '#9bd8ff', 10); sfx(1300, .03, 'square', .015);
    }
    return dmg;
  }
});
