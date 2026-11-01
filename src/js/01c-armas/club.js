// Garrote
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('club', {
  orden: 2,
  datos: { name: tr('Garrote'), type: 'melee', shape: 'hammer', rarity: 'common', dmg: 4, cd: .55, range: 46, arc: 2.2, en: 0, chg: 'quake', chgEn: 8 },
  familia: 'knight'
});
