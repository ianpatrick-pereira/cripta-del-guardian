// Subjefe del piso 1: Capitán Hueso
defSub('captain', {
  piso: 1,
  datos: { name: 'Capitán Hueso', spr: 'skel', s: 3.4, r: 22, hp: 140, speed: 85, tint: '#e3a24a', minion: 'archer', want: 210,
           p1: ['volley', 'rain', 'retreat'], p2: ['volley', 'rain', 'fan', 'summon', 'retreat'] },
  // dibuja su arco largo encima del sprite
  encima(e, lift, p) { if (!e.cheat) drawWeapon({ type: 'bow', rarity: 'rare', id: 'long' }, e.x, e.y - lift, e.aimA ?? angTo(e, p), 1.4); }
});
