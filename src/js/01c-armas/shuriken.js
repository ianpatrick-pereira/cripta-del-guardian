// Shurikens
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('shuriken', {
  orden: 33,
  datos: { name: tr('Shurikens'), type: 'bow', shape: 'shuriken', rarity: 'rare', dmg: 2, cd: .4, speed: 600, pierce: 1, shots: 3, en: 3, chg: 'volley', chgEn: 18, spd: .06, dodge: .2 },
  potencia: 1.9,
  familia: 'rogue'
});
