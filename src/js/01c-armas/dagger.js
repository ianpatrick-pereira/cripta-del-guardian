// Daga veloz
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('dagger', {
  orden: 3,
  datos: { name: tr('Daga veloz'), type: 'melee', shape: 'dagger', rarity: 'uncommon', dmg: 2, cd: .16, range: 42, arc: 1.4, en: 1, chg: 'lunge', chgEn: 12 },
  familia: 'rogue'
});
