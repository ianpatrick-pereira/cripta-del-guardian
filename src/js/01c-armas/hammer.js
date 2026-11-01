// Martillo de guerra
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('hammer', {
  orden: 7,
  datos: { name: tr('Martillo de guerra'), type: 'melee', shape: 'hammer', rarity: 'rare', dmg: 9, cd: .80, range: 62, arc: 2.8, en: 2, chg: 'quake', chgEn: 18 },
  familia: 'knight',
  potencia: .95
});
