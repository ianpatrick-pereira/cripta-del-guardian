// Bastón de marea
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('tide', {
  orden: 24,
  datos: { name: tr('Bastón de marea'), type: 'staff', shape: 'staff', gem: '#4ab0e8', rarity: 'rare', dmg: 4, cd: .45, speed: 380, pierce: 1, shots: 1, en: 5, chg: 'nova', chgEn: 18, fx: 'slow' },
  potencia: 1.35,
  // sin familia: neutral para todas las clases
  familia: null
});
