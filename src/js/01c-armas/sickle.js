// Hoz arrojadiza
defWeapon('sickle', {
  orden: 39,
  datos: { name: 'Hoz arrojadiza', type: 'bow', style: 'sickle', shape: 'sickle', rarity: 'rare', dmg: 3, cd: .6, speed: 480, pierce: 99, shots: 1, en: 3, chg: 'reap', chgEn: 18 },
  familia: 'rogue',
  potencia: .4,
  estilo: {
    // cobra la energía en ataque() al lanzar, no antes
    cobraAlLanzar: true,
    d: 'la lanzas, se clava girando en el primer enemigo y vuelve',
    esp: { n: 'Filo giratorio', d: '+0,4 s girando en el sitio' },
    el: { fire: 'Hoz flamígera', water: 'Hoz de espuma', air: 'Hoz del vendaval', earth: 'Hoz de obsidiana' },
    // ataque normal
    ataque(p, w, { a, dmg, cost }) {
      if (thrownOut('sickle') >= 2 + (w.stars >= 3 ? 1 : 0)) { p.cd = .05; return; }
      p.en -= cost;
      throwIt(p, w, 'sickle', a, dmg, { main: 'sickle' }); sfx(500, .1, 'sawtooth', .025, 200);
    },
    // ataque cargado; S = estrellas (la habilidad elemental usa la forma de 5★)
    cargado(p, w, { a, S, dm, col }) {
      const giant = (an, k, o = {}) => throwIt(p, w, 'sickle', an, dm(k), Object.assign({ r: 18, spinT: 1.6 + .4 * espLv(w), color: col, big: true }, o));
      if (S === 1) giant(a, 1.6);
      else if (S === 2) { giant(a - .25, 1.5); giant(a + .25, 1.5); }
      else if (S === 3) for (let i = 0; i < 4; i++) giant(a + i * TAU / 4, 1.4, { outT: .22, r: 14 });
      else if (S === 4) for (let i = 0; i < 4; i++) giant(a + (i - 1.5) * .35, 1.5, { fx: 'homing', outT: .5, r: 14 });
      else for (let i = 0; i < 6; i++) giant(a + i * TAU / 6, 1.7, { outT: .3 });
      sfx(380, .3, 'sawtooth', .04, 300);
    }
  }
});
