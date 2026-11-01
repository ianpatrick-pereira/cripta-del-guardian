// Subjefe del piso 3: El Verdugo
import { defSub } from '../01a-registro.js';
defSub('executioner', {
  piso: 3,
  datos: { name: 'El Verdugo', spr: 'brute', s: 3.6, r: 26, hp: 450, speed: 72, tint: '#d4474b', minion: 'wraith', want: 0,
           p1: ['charge3', 'slam', 'charge3'], p2: ['charge3', 'slam', 'fan', 'summon'] },
  // rompe cajas y barriles al caminar
  rompeAlCaminar: true
});
