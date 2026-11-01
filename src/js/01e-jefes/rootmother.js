// Jefe del piso 6: La Raíz Madre
import { tr } from '../00b-textos.js';
import { defBoss } from '../01a-registro.js';
defBoss('rootmother', {
  orden: 6,
  datos: { name: tr('La Raíz Madre'), hp: 2400, r: 34, minion: 'splitter', look: 'queen', tint: '#7ac04a', col: '#b8f080', want: 200, scale: 1.18,
           p1: ['web', 'summon', 'spiral', 'rain'], p2: ['web', 'leap', 'spiral', 'summon', 'rain', 'gapring'], p3: ['web', 'leap', 'spiral', 'rain', 'gapring', 'predict', 'burst'] }
});
