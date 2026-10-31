defEnemy('charger', {
  orden: 13,
  stats: { hp: 18, r: 16, speed: 70, dmg: 2, spr: 'charger', s: 2.4 },
  bestiario: { n: 'Embestidor', d: 'Apunta y carga varias veces; si choca con un muro queda aturdido.' },
  sprite: {
    clave: 'charger',
    mapa: 'brute',
    paleta: { k: '#14100e', h: '#c0c8d0', r: '#7a8a9a', e: '#ff4a2a', d: '#3a3a44' }
  },
  // Embestidor: apunta (línea roja) y carga muy rápido; si choca con un muro queda aturdido
  ia(e, c) {
    const { dt, cdt, hidden, tgt, d, go } = c;
    e.cd -= cdt;
    if (e.st === 'walk') {
      go(angTo(e, flankPoint(e, tgt, d)), e.speed);
      if (!hidden && e.cd <= 0 && d < 340 && e.los && takeToken(e)) { e.st = 'wind'; e.st_t = .6; e.tele = .6; e.reps = e.elite ? 3 : 2; e.ca = leadAng(e, 560, .5); }
    } else if (e.st === 'wind') {
      e.st_t -= dt; if (e.st_t > .2) e.ca = leadAng(e, 560, .5);
      if (e.st_t <= 0) { e.st = 'charge'; e.st_t = .45; sfx(90, .2, 'sawtooth', .05); }
    } else if (e.st === 'charge') {
      e.st_t -= dt;
      if (moveEnt(e, Math.cos(e.ca) * 560 * dt, Math.sin(e.ca) * 560 * dt)) { shake(6); burst(e.x, e.y, '#c0c8d0', 10); e.st = 'stun'; e.st_t = 1.1; e.cd = 2.6; e.tok = false; return; }
      if (Math.random() < dt * 20) G.parts.push({ x: e.x, y: e.y, vx: 0, vy: 0, life: .3, max: .3, color: 'rgba(192,200,208,.5)', size: 10 });
      if (e.st_t <= 0) { if (--e.reps > 0) { e.st = 'wind'; e.st_t = .32; e.tele = .32; } else { e.st = 'stun'; e.st_t = .5; e.cd = 2.4; e.tok = false; } }
    } else if (e.st === 'stun') { e.st_t -= dt; if (e.st_t <= 0) e.st = 'walk'; }
  },
  debajo(e, la) { if (e.st === 'wind') { ctx.globalAlpha = .25; ctx.strokeStyle = '#d4474b'; ctx.lineWidth = e.r * 2; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(e.ca) * 320, e.y + Math.sin(e.ca) * 320); ctx.stroke(); ctx.globalAlpha = 1; } }
});
