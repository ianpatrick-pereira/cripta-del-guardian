// Sala de desafío
import { tr } from '../00b-textos.js';
import { ctx } from '../00-inicio.js';
import { TAU, pick, rand } from '../01-utilidades.js';
import { defRoom } from '../01a-registro.js';
import { D, FLOORS } from '../03-datos-del-juego.js';
import { sfx } from '../05-audio.js';
import { G, freeSpot } from '../07-estado.js';
import { burst, shake, showBanner } from '../09-efectos.js';
import { ach } from '../21-logros-y-bestiario.js';
defRoom('challenge', {
  orden: 1,
  objeto: 'trial',
  colocar(r) {
    r.type = 'event'; r.cleared = true;
    G.pickups.push({ kind: 'trial', x: r.cx, y: r.cy, room: r });
  },
  usable(it) { return !it.used; },
  usar(p, it) {
    if (it.used) return;
    it.used = true; const r = it.room; r.locked = true;
    G.chal = { room: r, t: 25, spawn: .5 };
    showBanner(tr('Sala de desafío'), '#ff8a3a', tr('Sobrevive 25 segundos')); shake(6); sfx(110, .4, 'square', .05, -40);
  },
  dibujar(it, b) {
    ctx.fillStyle = '#3a3448'; ctx.fillRect(it.x - 6, it.y - 30, 12, 40); ctx.fillStyle = '#4e4660'; ctx.fillRect(it.x - 12, it.y + 8, 24, 6);
    if (!it.used) { ctx.fillStyle = '#ff8a3a'; ctx.beginPath(); ctx.arc(it.x, it.y - 34 + b, 6, 0, TAU); ctx.fill(); if (Math.random() < .3) G.parts.push({ x: it.x + rand(-4, 4), y: it.y - 38, vx: 0, vy: -50, life: .4, max: .4, color: '#ffb03a', size: 3 }); }
  },
  aviso(it, key) {
    return [key + tr('Aceptar el desafío'), tr('Sobrevive 25 s: cofre dorado, llave y gemas'), '#ff8a3a'];
  },
  // sobrevive 25 s: van apareciendo enemigos hasta que se acaba el tiempo
  actualizar(dt) {
    if (G.chal && !G.over) {
      const C = G.chal; C.t -= dt; C.spawn -= dt;
      if (C.spawn <= 0 && G.enemies.length + G.markers.length < 7) {
        C.spawn = 1.5 / D().rate;
        const pos = freeSpot(C.room, 2, 20, G.player, 140);
        if (pos) G.markers.push({ x: pos.x, y: pos.y, t: .8, type: pick(FLOORS[G.fi].pool2), depth: 3, elite: Math.random() < .15 });
      }
      if (C.t <= 0) {
        for (const e of G.enemies) if (!e.dead) { e.dead = true; burst(e.x, e.y, '#ece4cf', 10); }
        G.markers.length = 0; G.proj = G.proj.filter(pr => pr.owner === 'player');
        C.room.locked = false; G.chal = null; ach('trial');
        showBanner(tr('¡Desafío superado!'), '#e3a24a');
        G.pickups.push({ kind: 'chest', gold: true, x: C.room.cx, y: C.room.cy + 40, opened: false }, { kind: 'key', x: C.room.cx - 40, y: C.room.cy + 40 });
        for (let i = 0; i < 1; i++) G.pickups.push({ kind: 'gem', x: C.room.cx + 40, y: C.room.cy + 40, vx: rand(-60, 60), vy: rand(-60, 60) });
        sfx(520, .4, 'triangle', .05, 400);
      }
    }
  }
});
