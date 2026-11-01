// Espada oxidada
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('rusty', {
  orden: 1,
  datos: { name: tr('Espada oxidada'), type: 'melee', shape: 'sword', rarity: 'common', dmg: 3, cd: .38, range: 50, arc: 1.9, en: 0, chg: 'spin', chgEn: 8 },
  familia: 'knight'
});
