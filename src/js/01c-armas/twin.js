// Dagas gemelas
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('twin', {
  orden: 31,
  datos: { name: tr('Dagas gemelas'), type: 'melee', shape: 'twin', rarity: 'rare', dmg: 3, cd: .13, range: 42, arc: 1.6, en: 1, chg: 'lunge', chgEn: 18, spd: .12, veil: .6 },
  familia: 'rogue'
});
