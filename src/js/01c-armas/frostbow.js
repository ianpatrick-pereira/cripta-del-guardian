// Arco de escarcha
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('frostbow', {
  orden: 17,
  datos: { name: tr('Arco de escarcha'), type: 'bow', shape: 'bow', rarity: 'rare', dmg: 4, cd: .42, speed: 640, pierce: 1, shots: 1, en: 5, chg: 'volley', chgEn: 18, fx: 'slow' },
  familia: 'archer'
});
