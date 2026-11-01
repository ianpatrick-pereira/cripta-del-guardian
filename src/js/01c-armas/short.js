// Arco corto
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('short', {
  orden: 13,
  datos: { name: tr('Arco corto'), type: 'bow', shape: 'bow', rarity: 'common', dmg: 2, cd: .34, speed: 520, pierce: 0, shots: 1, en: 1, chg: 'power', chgEn: 8 },
  familia: 'archer'
});
