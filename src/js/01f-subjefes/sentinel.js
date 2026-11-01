// Subjefe del piso 4: Centinela Escarchado
import { tr } from '../00b-textos.js';
import { defSub } from '../01a-registro.js';
defSub('sentinel', {
  piso: 4,
  datos: { name: tr('Centinela Escarchado'), spr: 'warden', s: 3.6, r: 24, hp: 600, speed: 72, tint: '#9bd8ff', minion: 'warden', want: 150,
           p1: ['volley', 'charge3', 'rain'], p2: ['volley', 'charge3', 'rain', 'summon', 'wave'] }
});
