// Subjefe del piso 7: Obispo de Ceniza
import { tr } from '../00b-textos.js';
import { defSub } from '../01a-registro.js';
defSub('ashbishop', {
  piso: 7,
  datos: { name: tr('Obispo de Ceniza'), spr: 'priest', s: 3.6, r: 22, hp: 1050, speed: 80, tint: '#c77dff', minion: 'phantom', want: 220,
           p1: ['volley', 'retreat', 'gust', 'fan'], p2: ['volley', 'retreat', 'gust', 'fan', 'summon', 'wave', 'rain'] }
});
