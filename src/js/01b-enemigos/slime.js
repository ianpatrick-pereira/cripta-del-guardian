defEnemy('slime', {
  orden: 1,
  stats: { hp: 5, r: 13, speed: 75, dmg: 1, spr: 'slime', s: 2 },
  bestiario: { n: 'Limo', d: 'Se encoge y salta hacia donde vas a estar.' },
  sprite: {
    clave: 'slime',
    mapa: ['....kkkk....', '...kghggk...', '..kghggggk..', '.kggggggggk.', '.kggeggeggk.', '.kggeggeggk.', 'kggggggggggk', 'kggggggggggk', '.kkkkkkkkkk.'],
    paleta: { k: '#13301a', g: '#74c477', h: '#c8f0c0', e: '#13301a' }
  },
  // Limos: se acercan por su flanco, se encogen (aviso) y saltan hacia donde vas a estar
  ia(e, c) {
    const { dt, cdt, hidden, tgt, d, go, done } = c;
    e.cd -= cdt;
    if (e.st === 'walk') {
      const g = flankPoint(e, tgt, d), pulse = .35 + .65 * Math.abs(Math.sin(e.t * 3.2));
      go(angTo(e, g), e.speed * pulse * 1.25);
      if (!hidden && e.type !== 'mini' && d < 170 && e.cd <= 0 && takeToken(e)) telegraph(e, .45);
    } else if (e.st === 'tele') {
      e.st_t -= dt;
      if (e.st_t <= 0) { e.st = 'act'; e.st_t = .3; e.ca = leadAng(e, 380); sfx(220, .08, 'sine', .03, 300); }
    } else if (e.st === 'act') {
      e.st_t -= dt; go(e.ca, 380);
      if (e.st_t <= 0) {
        if (e.type === 'toxic' || e.elite) { const n = e.elite ? 8 : 5, off = rand(0, TAU); for (let i = 0; i < n; i++) enemyShoot(e, off + i * TAU / n, 130, 5, '#9bff7a'); }
        burst(e.x, e.y, e.type === 'slime' ? '#6ad06a' : '#9be05a', 6, 90);
        done(.45, rand(1.5, 2.3));
      }
    }
  },
  forma(e, f) { const q = Math.sin(e.t * 6.4) * .12; f.sx = 1 + q; f.sy = 1 - q; }
});
