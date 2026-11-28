// Jefe del piso 1: El Guardián de la Cripta
import { tr } from '../00b-textos.js';
import { TAU } from '../01-utilidades.js';
import { defBoss } from '../01a-registro.js';
defBoss('guardian', {
  orden: 1,
  datos: { name: tr('El Guardián de la Cripta'), spr: 'guardian', s: 4.5, hp: 420, r: 30, minion: 'bat', col: '#ff6a8a', want: 120,
           p1: ['almas', 'embestida', 'espadas'], p2: ['almas', 'embestida', 'espadas', 'puas'], p3: ['almas', 'embestida', 'espadas', 'puas', 'invocar'] },
  // v0.64: 5 ataques propios con efectos HD (src/js/01g-ataques-de-jefe/almas, embestida, espadas, puas, invocar)
  logro: 'boss1',
  // desde v0.64 se pinta con su hoja HD (src/sprites/guardian.png); este dibujo por código queda para
  // los jefes con look: 'guardian' y para el retrato. Su dibujo (a media resolución; los jefes con look: 'guardian' lo reutilizan con otro color)
  aspecto(g, e, fill, ph2) {
    g.fillStyle = ph2 ? 'rgba(212,71,75,.35)' : 'rgba(199,125,255,.25)'; g.beginPath(); g.arc(0, 0, 50, 0, TAU); g.fill();
    g.fillStyle = fill('#5b3f7a'); g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill();
    g.fillStyle = fill('#3e2a56'); g.fillRect(-30, 4, 60, 8);
    g.fillStyle = '#e3a24a'; g.beginPath(); g.moveTo(-18, -22); for (let i = 0; i <= 4; i++) g.lineTo(-18 + i * 9, -(i % 2 ? 26 : 40)); g.lineTo(18, -22); g.fill();
    g.fillStyle = ph2 ? '#ff4040' : '#d6a6ff'; g.fillRect(-14, -8, 8, 8); g.fillRect(6, -8, 8, 8);
    g.fillStyle = '#2b1f3a'; g.fillRect(-10, 14, 20, 4);
  }
});
