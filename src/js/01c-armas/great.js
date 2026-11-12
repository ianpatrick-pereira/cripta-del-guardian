// Mandoble
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('great', {
  orden: 6,
  datos: { name: tr('Mandoble'), type: 'melee', shape: 'great', rarity: 'rare', dmg: 7, cd: .62, range: 70, arc: 2.6, en: 2, chg: 'spin', chgEn: 18 },
  familia: 'knight',
  potencia: .85
});
