// Subjefe del piso 1: Capitán Hueso (dibujo HD propio desde v0.64: src/sprites/captain.png)
import { tr } from '../00b-textos.js';
import { angTo } from '../01-utilidades.js';
import { defSub } from '../01a-registro.js';
import { drawSpr } from '../02-pixel-art.js';
defSub('captain', {
  piso: 1,
  datos: { name: tr('Capitán Hueso'), spr: 'captain', s: 3.4, r: 22, hp: 140, speed: 85, tint: '#e3a24a', minion: 'archer', want: 210, flecha: 'flecha_capitan',
           p1: ['volley', 'rain', 'retreat'], p2: ['volley', 'rain', 'fan', 'summon', 'retreat'] },
  // dibuja su arco largo encima del sprite
  // v0.64: su arco largo de madera negra (src/sprites/arco_capitan.png); sus andanadas son flechas (datos.flecha)
  encima(e, lift, p) { if (!e.cheat) { const a = e.aimA ?? angTo(e, p); drawSpr('arco_capitan', e.x + Math.cos(a) * 12, e.y - lift + 4 + Math.sin(a) * 12, 2.6, { rot: a, white: e.flash > 0 }); } }
});
