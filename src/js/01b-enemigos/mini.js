defEnemy('mini', {
  orden: 3,
  stats: { hp: 2, r: 8, speed: 115, dmg: 1, spr: 'toxic', s: 1.3 },
  bestiario: { n: 'Limito', d: 'Pequeño y rápido. Persigue sin descanso.' },
  // usa la misma IA que 'slime'
  ia: 'slime',
  forma(e, f) { const q = Math.sin(e.t * 6.4) * .12; f.sx = 1 + q; f.sy = 1 - q; }
});
