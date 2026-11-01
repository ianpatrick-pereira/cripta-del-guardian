// Jefe del piso 7: El Obispo Hueco
import { tr } from '../00b-textos.js';
import { defBoss } from '../01a-registro.js';
defBoss('bishop', {
  orden: 7,
  datos: { name: tr('El Obispo Hueco'), hp: 2900, r: 32, minion: 'phantom', look: 'devourer', tint: '#a07ad8', col: '#d8b0ff', want: 220, scale: 1.12,
           p1: ['teleport', 'laser', 'spiral', 'summon'], p2: ['teleport', 'laser', 'dark', 'spiral', 'gapring', 'summon', 'predict'], p3: ['teleport', 'laser', 'dark', 'rain', 'gapring', 'predict', 'burst', 'spiral'] }
});
