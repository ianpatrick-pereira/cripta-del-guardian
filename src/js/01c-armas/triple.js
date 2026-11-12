// Arco triple
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('triple', {
  orden: 15,
  datos: { name: tr('Arco triple'), type: 'bow', shape: 'bow', rarity: 'rare', dmg: 2, cd: .45, speed: 560, pierce: 0, shots: 3, en: 5, chg: 'volley', chgEn: 18 },
  potencia: 1.4,
  familia: 'archer'
});
