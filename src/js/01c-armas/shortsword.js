// Espada corta (v0.67): reemplaza a la Hoja de escarcha, el Mandoble, la Espada flamígera y la Hoja del Abismo.
// La espada rápida del Caballero: poco alcance, mucha cadencia (pega más seguido que cualquier otra arma suya).
import { tr } from '../00b-textos.js';
import { defWeapon } from '../01a-registro.js';
defWeapon('shortsword', {
  orden: 8,
  datos: { name: tr('Espada corta'), type: 'melee', shape: 'sword', rarity: 'rare', dmg: 4, cd: .24, range: 44, arc: 1.7, en: 1, chg: 'spin', chgEn: 14 },
  familia: 'knight'
});
