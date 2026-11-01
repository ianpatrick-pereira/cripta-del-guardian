// Espada de hierro
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('iron', {
  orden: 4,
  datos: { name: tr('Espada de hierro'), type: 'melee', shape: 'sword', rarity: 'uncommon', dmg: 4, cd: .34, range: 54, arc: 2.0, en: 1, chg: 'spin', chgEn: 12 },
  familia: 'knight'
});
