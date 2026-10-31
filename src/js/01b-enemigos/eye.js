defEnemy('eye', {
  orden: 10,
  stats: { hp: 12, r: 13, speed: 0, dmg: 1, spr: 'eye', s: 2.2 },
  bestiario: { n: 'Ojo vigía', d: 'Inmóvil. Anillos, ráfagas y espirales.' },
  sprite: {
    clave: 'eye',
    mapa: ['...kkkkkk...', '..kwwwwwwk..', '.kwwwwwwwwk.', 'kwwwrrrrwwwk', 'kwwrrkkrrwwk', 'kwwrkkkkrwwk', 'kwwrkkkkrwwk',
      'kwwrrkkrrwwk', 'kwwwrrrrwwwk', '.kwwwwwwwwk.', '..kwwwwwwk..', '...kkkkkk...'],
    paleta: { k: '#2a0a0e', w: '#e8d8d0', r: '#b0303a' }
  },
  // no retrocede al recibir golpes
  sinEmpuje: true,
  // Ojos: no se mueven; alternan anillo, ráfaga apuntada y espiral
  ia(e, c) {
    const { dt, cdt, hidden } = c;
    if (e.st === 'walk') {
      if (!hidden) e.shootT -= cdt;
      if (e.shootT <= 0 && takeToken(e)) { telegraph(e, .5); e.pat = ((e.pat ?? -1) + 1) % 3; }
    } else if (e.st === 'tele') {
      e.st_t -= dt; e.aiming = true;
      if (e.st_t <= 0) { e.aiming = false; e.st = 'act'; e.st_t = 0; e.k = 0; e.timer = 0; }
    } else if (e.st === 'act') {
      e.timer += dt;
      if (e.pat === 0) { const n = e.elite ? 12 : 9, off = rand(0, TAU); for (let i = 0; i < n; i++) enemyShoot(e, off + i * TAU / n, 150, 6, '#ff5a6a'); sfx(250, .1, 'square', .03); e.timer = 9; }
      else if (e.pat === 1) { while (e.k < 5 && e.timer >= e.k * .14) { enemyShoot(e, leadAng(e, 230), 230, 5, '#ff5a6a'); e.k++; sfx(420, .04, 'square', .02); } if (e.k >= 5) e.timer = 9; }
      else { while (e.k * .1 < e.timer && e.timer < 1.3) { for (let i = 0; i < 4; i++) enemyShoot(e, e.k * .28 + i * TAU / 4, 140, 5, '#ff5a6a'); e.k++; } }
      if (e.timer > 1.3) { e.st = 'walk'; e.tok = false; e.shootT = rand(1.8, 2.5); }
    }
  },
  encima(e, la, white) { ctx.fillStyle = e.aiming ? '#ffffff' : '#000'; ctx.fillRect(e.x + Math.cos(la) * 5 - 2, e.y + Math.sin(la) * 5 - 4, 4, 8); }
});
