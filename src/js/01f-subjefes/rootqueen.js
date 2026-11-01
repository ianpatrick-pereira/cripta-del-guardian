// Subjefe del piso 6: Madre Espina
import { tr } from '../00b-textos.js';
import { defSub } from '../01a-registro.js';
defSub('rootqueen', {
  piso: 6,
  datos: { name: tr('Madre Espina'), spr: 'splitter', s: 4.6, r: 26, hp: 900, speed: 60, tint: '#9be05a', minion: 'splitter', want: 120,
           p1: ['hop', 'spit', 'whirl'], p2: ['bighop', 'spit', 'whirl', 'summon', 'fan'] }
});
