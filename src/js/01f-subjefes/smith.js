// Subjefe del piso 5: Herrero Fundido
import { tr } from '../00b-textos.js';
import { defSub } from '../01a-registro.js';
defSub('smith', {
  piso: 5,
  datos: { name: tr('Herrero Fundido'), spr: 'charger', s: 3.8, r: 26, hp: 750, speed: 66, tint: '#ff8a3a', minion: 'bomber', want: 0,
           p1: ['slam', 'charge3', 'rain'], p2: ['slam', 'charge3', 'rain', 'summon', 'fan'] }
});
