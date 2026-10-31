// Altar maldito
defRoom('curse', {
  orden: 2,
  objeto: 'cursed',
  colocar(r) {
    r.type = 'event'; r.cleared = true;
    G.pickups.push({ kind: 'cursed', x: r.cx, y: r.cy, room: r });
  },
  usable(it) { return !it.used; },
  usar(p, it) {
    if (it.used) return;
    if (p.maxHp <= 2) { addText(it.x, it.y - 30, 'Tu sangre es demasiado débil', '#d4474b', 12); sfx(120, .1, 'square', .03); return; }
    it.used = true; p.maxHp--; p.hp = Math.min(p.hp, p.maxHp);
    shake(8); burst(it.x, it.y, '#b0303a', 24, 200, 4); sfx(80, .6, 'sawtooth', .05, -30);
    ach('curse');
    openChoice('Altar maldito', 'Tu sangre paga: elige una reliquia', randomRelics(3), () => { addText(p.x, p.y - 30, '−1 de vida máxima', '#d4474b', 13); });
  },
  dibujar(it, b) {
    ctx.fillStyle = '#2a1418'; ctx.fillRect(it.x - 16, it.y - 2, 32, 16); ctx.fillStyle = '#4a1e24'; ctx.fillRect(it.x - 18, it.y - 6, 36, 5);
    if (!it.used) {
      const gr = ctx.createRadialGradient(it.x, it.y - 12, 2, it.x, it.y - 12, 34); gr.addColorStop(0, `rgba(212,71,75,${.5 + .2 * Math.sin(G.time * 5)})`); gr.addColorStop(1, 'rgba(212,71,75,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(it.x, it.y - 12, 34, 0, TAU); ctx.fill();
      ctx.fillStyle = '#d4474b'; ctx.beginPath(); ctx.arc(it.x, it.y - 14 + b, 6, 0, TAU); ctx.fill();
    }
  },
  aviso(it, key) {
    return [key + 'Altar maldito', 'Pierdes 1 de vida máxima y eliges 1 de 3 reliquias', '#d4474b'];
  }
});
