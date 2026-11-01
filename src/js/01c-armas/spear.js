// Lanza de guardia
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('spear', {
  orden: 5,
  datos: { name: tr('Lanza de guardia'), type: 'melee', shape: 'spear', rarity: 'uncommon', dmg: 5, cd: .42, range: 88, arc: .7, en: 1, chg: 'lunge', chgEn: 12 },
  familia: 'knight'
});
