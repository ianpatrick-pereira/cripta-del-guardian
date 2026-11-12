// ================= Iconos de las cartas de mejora (v0.59) =================
// Cada reliquia, talento y pacto lleva un dibujo pixelado que dice de un vistazo qué hace.
// Los dibujos usan 'a' (color de la mejora) y 'b' (brillo); el contorno oscuro se añade solo.
const GLIFOS = {
  corazon: ['..aa...aa..', '.abaa.aaaa.', 'abaaaaaaaaa', 'aaaaaaaaaaa', 'aaaaaaaaaaa', '.aaaaaaaaa.', '..aaaaaaa..', '...aaaaa...', '....aaa....', '.....a.....'],
  escudo:  ['.aaaaaaaaa.', '.abbaaaaaa.', '.abaaaaaaa.', '.aaaaaaaaa.', '.aaaaaaaaa.', '.aaaaaaaaa.', '..aaaaaaa..', '...aaaaa...', '....aaa....', '.....a.....'],
  bota:    ['...aaaa....', '...abaa....', '...aaaa....', '...aaaa....', '...aaaa....', '...aaaaa...', '..aaaaaaaa.', '.aaaaaaaaaa', '.aaaaaaaaaa'],
  flecha:  ['......aaaa.', '.......baa.', '......a.ba.', '.....a...a.', '....a......', '...a.......', 'aaa........', 'aa.........', 'a.a........'],
  espada:  ['.........aa', '........aba', '.......aba.', '......aba..', '.....aba...', '..a.aba....', '...aba.....', '...aa......', '..a..a.....', '.a.........'],
  gota:    ['.....a.....', '....aaa....', '....aaa....', '...aaaaa...', '..aabaaaa..', '..abaaaaa..', '..aaaaaaa..', '...aaaaa...', '....aaa....'],
  ojo:     ['...aaaaa...', '.aa.....aa.', 'a...aaa...a', 'a..abaaa..a', 'a...aaa...a', '.aa.....aa.', '...aaaaa...'],
  estrella:['.....a.....', '.....a.....', '..a..a..a..', '...aaaaa...', 'aaaaabaaaaa', '...aaaaa...', '..a..a..a..', '.....a.....', '.....a.....'],
  rayo:    ['......aaa..', '.....aaa...', '....aaa....', '...aaaaaa..', '......aa...', '.....aa....', '....aa.....', '...a.......'],
  reloj:   ['aaaaaaaaa', '.a.....a.', '..abbba..', '...aba...', '....a....', '...a.a...', '..a.b.a..', '.abbbbba.', 'aaaaaaaaa'],
  iman:    ['aaa...aaa', 'bbb...bbb', 'aaa...aaa', 'aaa...aaa', 'aaa...aaa', '.aaa.aaa.', '..aaaaa..'],
  espinas: ['a...a...a', '.a..a..a.', '..aaaaa..', 'aaaabaaaa', '..aaaaa..', '.a..a..a.', 'a...a...a'],
  trebol:  ['..aa.aa..', '.aaaaaaa.', '.aaabaaa.', '..aaaaa..', '.aaaaaaa.', '.aaa.aaa.', '..a...a..', '.....a...', '....a....'],
  bomba:   ['......b.a', '.....a.a.', '...aaaa..', '..aaaaaa.', '.abaaaaaa', '.aaaaaaaa', '.aaaaaaaa', '..aaaaaa.', '...aaaa..'],
  calavera:['..aaaaa..', '.aaaaaaa.', 'aaaaaaaaa', 'a..aaa..a', 'a..aaa..a', 'aaaa.aaaa', '.aaaaaaa.', '.a.a.a.a.'],
  copo:    ['....a....', '..a.a.a..', '...aaa...', 'aaaabaaaa', '...aaa...', '..a.a.a..', '....a....'],
  humo:    ['...aaa....', '..abbaa...', '.aaaaaaaa.', 'aaaaaaaaaa', 'aaaaaaaaaa', '.aaaaaaaa.'],
  bandera: ['a........', 'aaaaaaa..', 'abbaaaaa.', 'abaaaaa..', 'aaaaaaaa.', 'a........', 'a........', 'a........', 'a........'],
  puno:    ['.aaaaaa.', 'abababaa', 'aaaaaaaa', 'aaaaaaaa', '.aaaaaa.', '..aaaa..', '..aaaa..'],
  pluma:   ['.......aa', '.....aaba', '....aaba.', '...aaba..', '..aaba...', '..aba....', '.aaa.....', '.a.......', 'a........'],
  mira:    ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.b.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  capa:    ['...aaa...', '..abbaa..', '..aaaaa..', '.aaaaaaa.', '.aaaaaaa.', 'aaaaaaaaa', 'aaaaaaaaa', 'aa.aaa.aa'],
  llama:   ['....a....', '...aa....', '...aaa...', '..aaaa.a.', '.aaabaaaa', '.aabbbaaa', '.aabbbaa.', '..aaaaa..'],
};
// qué dibujo lleva cada mejora (reliquias, talentos y pactos)
const ICONO = {
  // reliquias
  corazon: 'corazon', escudo: 'escudo', botas: 'bota', rebote: 'flecha', onda: 'espada', veneno: 'gota', ojo: 'ojo', vampiro: 'gota',
  carcaj: 'flecha', piedra: 'espada', reloj: 'reloj', iman: 'iman', bateria: 'rayo', espinas: 'espinas', trebol: 'trebol', polvora: 'bomba',
  estandarte: 'bandera', guantelete: 'puno', broquel: 'escudo', pluma: 'pluma', mira: 'mira', punta: 'flecha', capa: 'capa', punal: 'espada', brazalete: 'llama',
  // talentos
  vigor: 'corazon', muro: 'escudo', furia: 'llama', egida: 'escudo', contra: 'espada', puas: 'espinas', embestida: 'escudo', aguante: 'escudo', sed: 'corazon',
  ojo2: 'ojo', rafaga: 'rayo', perfora: 'flecha', cazador: 'ojo', hielo: 'copo', rebote2: 'flecha', carcaj2: 'flecha', voltereta: 'flecha', frio: 'copo',
  verdugo: 'calavera', toxina: 'gota', frenesi: 'llama', sombra: 'humo', sangre: 'corazon', filo: 'espada', humo: 'humo', punales: 'espada', acecho: 'ojo',
  // pactos
  volatile: 'bomba', glass: 'escudo', fragile: 'corazon', frenzy: 'bota', dark: 'ojo', blood: 'gota', fasting: 'calavera', none: 'estrella',
};
const cache = {};
// devuelve la imagen (data URL) del icono de una mejora, pintada con su color
function iconURL(id, color) {
  const key = id + color;
  if (cache[key]) return cache[key];
  const G0 = GLIFOS[ICONO[id] || 'estrella'], h = G0.length, w = Math.max(...G0.map(r => r.length)), S = 1;
  const c = document.createElement('canvas'); c.width = (w + 2) * S; c.height = (h + 2) * S;
  const g = c.getContext('2d');
  const at = (x, y) => y >= 0 && y < h && x >= 0 && x < (G0[y] || '').length && G0[y][x] !== '.';
  // contorno oscuro alrededor del dibujo
  g.fillStyle = '#16131d';
  for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) if (!at(x, y) && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) g.fillRect((x + 1) * S, (y + 1) * S, S, S);
  for (let y = 0; y < h; y++) for (let x = 0; x < G0[y].length; x++) {
    const ch = G0[y][x]; if (ch === '.') continue;
    g.fillStyle = ch === 'b' ? '#fff8e8' : color; g.fillRect((x + 1) * S, (y + 1) * S, S, S);
  }
  return (cache[key] = c.toDataURL());
}

export { ICONO, iconURL };
