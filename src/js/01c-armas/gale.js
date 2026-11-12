// Bastón del vendaval
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('gale', {
  orden: 25,
  datos: { name: tr('Bastón del vendaval'), type: 'staff', shape: 'staff', gem: '#c8f0e0', rarity: 'rare', dmg: 3, cd: .22, speed: 700, pierce: 2, shots: 1, en: 4, chg: 'nova', chgEn: 18, fx: 'push' },
  potencia: 1.7,
  // sin familia: neutral para todas las clases
  familia: null
});
