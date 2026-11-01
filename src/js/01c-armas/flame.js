// Espada flamígera
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('flame', {
  orden: 10,
  datos: { name: tr('Espada flamígera'), type: 'melee', shape: 'sword', rarity: 'epic', dmg: 7, cd: .34, range: 60, arc: 2.2, en: 3, chg: 'spin', chgEn: 25, fx: 'burn', tint: '#ff8a3a' },
  familia: 'knight'
});
