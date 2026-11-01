// Arco explosivo
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('boom', {
  orden: 19,
  datos: { name: tr('Arco explosivo'), type: 'bow', shape: 'bow', rarity: 'epic', dmg: 5, cd: .60, speed: 560, pierce: 0, shots: 1, en: 8, chg: 'power', chgEn: 25, fx: 'explode' },
  familia: 'archer',
  potencia: .8
});
