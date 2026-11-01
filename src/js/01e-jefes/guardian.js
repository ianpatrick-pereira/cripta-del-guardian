// Jefe del piso 1: El Guardián de la Cripta
defBoss('guardian', {
  orden: 1,
  datos: { name: 'El Guardián de la Cripta', hp: 420, r: 30, minion: 'bat', col: '#ff6a8a', want: 120,
           p1: ['burst', 'aimed', 'charge'], p2: ['burst', 'spiral', 'charge', 'predict', 'summon', 'gapring'], p3: ['charge', 'gapring', 'rain', 'spiral', 'predict'] },
  logro: 'boss1',
  // su dibujo (a media resolución; los jefes con look: 'guardian' lo reutilizan con otro color)
  aspecto(g, e, fill, ph2) {
    g.fillStyle = ph2 ? 'rgba(212,71,75,.35)' : 'rgba(199,125,255,.25)'; g.beginPath(); g.arc(0, 0, 50, 0, TAU); g.fill();
    g.fillStyle = fill('#5b3f7a'); g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill();
    g.fillStyle = fill('#3e2a56'); g.fillRect(-30, 4, 60, 8);
    g.fillStyle = '#e3a24a'; g.beginPath(); g.moveTo(-18, -22); for (let i = 0; i <= 4; i++) g.lineTo(-18 + i * 9, -(i % 2 ? 26 : 40)); g.lineTo(18, -22); g.fill();
    g.fillStyle = ph2 ? '#ff4040' : '#d6a6ff'; g.fillRect(-14, -8, 8, 8); g.fillRect(6, -8, 8, 8);
    g.fillStyle = '#2b1f3a'; g.fillRect(-10, 14, 20, 4);
  }
});
