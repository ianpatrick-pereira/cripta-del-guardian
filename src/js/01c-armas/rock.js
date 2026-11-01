// Bastón de roca
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('rock', {
  orden: 23,
  datos: { name: tr('Bastón de roca'), type: 'staff', shape: 'staff', gem: '#c09060', rarity: 'uncommon', dmg: 4, cd: .60, speed: 300, pierce: 0, shots: 1, en: 3, chg: 'nova', chgEn: 12, fx: 'stun' },
  // sin familia: neutral para todas las clases
  familia: null
});
