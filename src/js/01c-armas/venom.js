// Bastón de la ciénaga
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('venom', {
  orden: 21,
  datos: { name: tr('Bastón de la ciénaga'), type: 'staff', shape: 'staff', gem: '#9be05a', rarity: 'uncommon', dmg: 3, cd: .45, speed: 360, pierce: 1, shots: 1, en: 3, chg: 'nova', chgEn: 12, fx: 'poison' },
  familia: 'rogue'
});
