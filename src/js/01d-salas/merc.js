// Guerrero encadenado
defRoom('merc', {
  orden: 6,
  objeto: 'merc',
  colocar(r) {
    G.pickups.push({ kind: 'merc', x: r.cx, y: r.cy - 60, room: r });
  },
  usable(it) { return true; },
  usar(p, it) {
    freeMerc(it);
  },
  dibujar(it, b) {
    drawShadow(it.x, it.y + 2, 10);
    drawSpr('knight', it.x, it.y - 4 + Math.sin(G.time * 2), 2, { flip: G.player.x < it.x, alpha: .85 });
    ctx.strokeStyle = '#8a84a0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(it.x - 10, it.y + 2); ctx.lineTo(it.x - 22, it.y - 30); ctx.moveTo(it.x + 10, it.y + 2); ctx.lineTo(it.x + 22, it.y - 30); ctx.stroke();
  },
  aviso(it, key) {
    return [key + (it.room.cleared ? 'Liberar al guerrero' : 'Guerrero encadenado'), it.room.cleared ? 'Peleará a tu lado hasta que bajes de piso' : 'Despeja la sala primero', '#9be0c8'];
  }
});

// aliado prisionero: pelea contigo hasta que bajes de piso
function freeMerc(it) {
  const p = G.player;
  if (!it.room.cleared) { addText(it.x, it.y - 34, 'Despeja la sala para liberarlo', '#e3a24a', 12); return; }
  it.gone = true; SAVE.rescued++; ach('rescue');
  if (!G.allies) G.allies = [];
  G.allies.push({ x: it.x, y: it.y, r: 12, big: true, merc: true, t: 99999, cd: .4, dmg: Math.max(2, Math.round(bestDmg(p) * .9)), w: null, flip: false, rise: 0 });
  addText(it.x, it.y - 34, '¡Lucharé a tu lado hasta el próximo piso!', '#9be0c8', 13);
  burst(it.x, it.y, '#9be0c8', 18, 160); sfx(700, .3, 'triangle', .04, 400);
}
