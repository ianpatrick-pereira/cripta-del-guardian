// Cerbatana
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('blowgun', {
  orden: 30,
  datos: { name: tr('Cerbatana'), type: 'bow', shape: 'blowgun', rarity: 'uncommon', dmg: 3, cd: .5, speed: 760, pierce: 0, shots: 1, en: 2, chg: 'power', chgEn: 12, fx: 'poison', veil: .5, back: .5 },
  familia: 'rogue'
});
