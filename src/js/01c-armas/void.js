// Orbe del vacío
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('void', {
  orden: 27,
  datos: { name: tr('Orbe del vacío'), type: 'staff', shape: 'staff', gem: '#c77dff', rarity: 'epic', dmg: 4, cd: .70, speed: 220, pierce: 99, shots: 1, en: 10, chg: 'nova', chgEn: 25, fx: 'slow', big: true },
  // sin familia: neutral para todas las clases
  familia: null,
  potencia: 1.3
});
