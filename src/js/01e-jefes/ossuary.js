// Jefe del piso 4: El Señor del Osario
import { defBoss } from '../01a-registro.js';
defBoss('ossuary', {
  orden: 4,
  datos: { name: 'El Señor del Osario', hp: 1600, r: 32, minion: 'warden', look: 'guardian', tint: '#9bd8ff', col: '#bfe8ff', want: 150, scale: 1.1,
           p1: ['burst', 'aimed', 'charge', 'rain'], p2: ['burst', 'spiral', 'charge', 'predict', 'summon', 'gapring', 'web'], p3: ['charge', 'gapring', 'rain', 'spiral', 'predict', 'web', 'burst'] }
});
