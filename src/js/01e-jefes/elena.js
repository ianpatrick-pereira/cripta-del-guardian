// Jefe del piso 8: Elena, Corazón de la Cripta
import { tr } from '../00b-textos.js';
import { defBoss } from '../01a-registro.js';
defBoss('elena', {
  orden: 8,
  datos: { name: tr('Elena, Corazón de la Cripta'), hp: 3500, r: 34, minion: 'phantom', look: 'devourer', tint: '#ffd0d8', col: '#ff8aa0', want: 190, scale: 1.25,
           p1: ['laser', 'web', 'charge', 'spiral', 'summon'], p2: ['laser', 'web', 'leap', 'dark', 'gapring', 'rain', 'summon', 'teleport'], p3: ['laser', 'dark', 'leap', 'charge', 'gapring', 'rain', 'predict', 'spiral', 'burst', 'web'] }
});
