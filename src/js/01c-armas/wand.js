// Varita de aprendiz
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('wand', {
  orden: 20,
  datos: { name: tr('Varita de aprendiz'), type: 'staff', shape: 'staff', gem: '#9bd0ff', rarity: 'common', dmg: 2, cd: .40, speed: 380, pierce: 0, shots: 1, en: 2, chg: 'nova', chgEn: 8, fx: 'homing' },
  // sin familia: neutral para todas las clases
  familia: null
});
