// Kunais
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('kunai', {
  orden: 28,
  datos: { name: tr('Kunais'), type: 'bow', shape: 'kunai', rarity: 'common', dmg: 2, cd: .3, speed: 620, pierce: 0, shots: 1, en: 1, chg: 'volley', chgEn: 8, spd: .08, back: .5 },
  familia: 'rogue'
});
