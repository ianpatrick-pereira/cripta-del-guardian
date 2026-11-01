// Jefe del piso 2: La Reina Tejedora
defBoss('queen', {
  orden: 2,
  datos: { name: 'La Reina Tejedora', hp: 800, r: 30, minion: 'spider', col: '#cfd8a0', want: 190,
           p1: ['web', 'leap', 'aimed', 'summon'], p2: ['web', 'leap', 'spiral', 'burst', 'summon', 'rain'], p3: ['leap', 'web', 'gapring', 'rain', 'predict', 'summon'] },
  // su dibujo (a media resolución; los jefes con look: 'queen' lo reutilizan con otro color)
  aspecto(g, e, fill, ph2) {
    g.strokeStyle = fill('#4a3a4a'); g.lineWidth = 5;
    for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 4; i++) {
      const wig = Math.sin(e.t * 10 + i) * 4;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(s * 36, -10 + i * 10 + wig); g.lineTo(s * 50, 4 + i * 12 + wig); g.stroke();
    }
    g.fillStyle = fill('#2a1f2a'); g.beginPath(); g.arc(0, 14, 24, 0, TAU); g.fill();
    g.fillStyle = fill('#8a2a3a'); g.fillRect(-6, 6, 12, 18);
    g.fillStyle = fill('#3a2a3a'); g.beginPath(); g.arc(0, -10, 20, 0, TAU); g.fill();
    g.fillStyle = ph2 ? '#ff2a2a' : '#ff6a6a';
    for (const [x, y] of [[-10, -14], [10, -14], [-5, -20], [5, -20], [-14, -6], [14, -6]]) g.fillRect(x - 3, y - 3, 6, 6);
    g.fillStyle = '#e8e8d8'; g.fillRect(-7, 2, 3, 8); g.fillRect(4, 2, 3, 8);
  }
});
