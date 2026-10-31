// ================= Sinergias =================
const hasFx = f => G.player.slots.some(w => w.fx === f);
const SYNERGIES = [
  { id: 'infierno', n: 'Infierno',            c: '#ff8a3a', r: 'Arma de fuego + Pólvora negra',            d: 'Los enemigos en llamas explotan al morir.',                 ok: () => hasFx('burn') && rc('polvora') },
  { id: 'toxica',   n: 'Tormenta tóxica',     c: '#9be05a', r: 'Bastón del rayo + veneno (arma o reliquia)', d: 'Los rayos en cadena envenenan.',                             ok: () => hasFx('chain') && (rc('veneno') || hasFx('poison')) },
  { id: 'quebrar',  n: 'Escarcha quebradiza', c: '#9bd8ff', r: 'Arma de hielo + Ojo del cazador o Piedra de afilar', d: 'Los enemigos ralentizados reciben +50 % de daño.', ok: () => hasFx('slow') && (rc('ojo') || rc('piedra')) },
  { id: 'sangre',   n: 'Sangre y acero',      c: '#b0303a', r: 'Arma que roba vida + Sangre de vampiro',     d: 'Doble robo de vida y te curas cada 8 bajas.',               ok: () => G.player.slots.some(w => w.leech) && rc('vampiro') },
  { id: 'lluvia',   n: 'Lluvia de flechas',   c: '#e3a24a', r: 'Carcaj extra + Flechas rebotantes',          d: 'Los arcos disparan 1 flecha más y rebotan 2 veces.',        ok: () => rc('carcaj') && rc('rebote') },
  { id: 'viento',   n: 'Filo del viento',     c: '#9be0c8', r: 'Onda cortante + Botas de viento',            d: 'Las ondas de espada son enormes y lo atraviesan todo.',     ok: () => rc('onda') && rc('botas') },
  { id: 'arcano',   n: 'Mente arcana',        c: '#5aa4e8', r: 'Un bastón + Batería arcana',                 d: 'Los bastones cuestan la mitad de energía.',                 ok: () => G.player.slots.some(w => w.type === 'staff') && rc('bateria') },
  { id: 'erizo',    n: 'Fortaleza erizo',     c: '#7a9a5a', r: 'Coraza de espinas + Escudo rúnico',          d: 'El doble de espinas y más dañinas.',                        ok: () => rc('espinas') && rc('escudo') },
];
const syn = id => !!(G && G.syn && G.syn.has(id));
function updateSyn() {
  const now = new Set(SYNERGIES.filter(s => s.ok()).map(s => s.id));
  for (const s of SYNERGIES) if (now.has(s.id) && !(G.syn && G.syn.has(s.id))) {
    showBanner('¡Sinergia! ' + s.n, s.c, s.d); sfx(700, .3, 'triangle', .05, 600);
    SAVE.syn[s.id] = true; ach('synergy');
  }
  G.syn = now;
}

