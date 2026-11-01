// Hoja de escarcha
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('frost', {
  orden: 8,
  datos: { name: tr('Hoja de escarcha'), type: 'melee', shape: 'sword', rarity: 'rare', dmg: 5, cd: .36, range: 58, arc: 2.1, en: 2, chg: 'spin', chgEn: 18, fx: 'slow', tint: '#9bd8ff' },
  familia: 'knight'
});
