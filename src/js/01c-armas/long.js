// Arco largo
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('long', {
  orden: 14,
  datos: { name: tr('Arco largo'), type: 'bow', shape: 'bow', rarity: 'uncommon', dmg: 4, cd: .52, speed: 720, pierce: 1, shots: 1, en: 3, chg: 'power', chgEn: 12 },
  familia: 'archer'
});
