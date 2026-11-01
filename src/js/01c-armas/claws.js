// Garras de sombra
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('claws', {
  orden: 32,
  datos: { name: tr('Garras de sombra'), type: 'melee', shape: 'claws', rarity: 'rare', dmg: 4, cd: .22, range: 46, arc: 2.0, en: 2, chg: 'lunge', chgEn: 18, back: .5, veil: .8, dodge: .1 },
  familia: 'rogue'
});
