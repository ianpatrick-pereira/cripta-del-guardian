// ================= Enemigos que se adaptan a tu arsenal =================
// cuanto más fuerte eres respecto a lo esperado en el piso, más aguantan y más pegan los enemigos (sin pasarse)
import { tr } from './00b-textos.js';
import { CHARS, DIFFS, circMod, wPower } from './03-datos-del-juego.js';
import { SAVE } from './04-guardado.js';
import { G, rc } from './07-estado.js';
import { addText } from './09-efectos.js';
import { ARMOR, armorSh } from './13-armadura.js';
import { syn } from './18-sinergias.js';
import { subLv, tl } from './26-clases.js';
import { pact } from './27-pactos-de-piso.js';
// v0.55: se mide el daño de verdad de tu mejor arma (wPower) contra lo normal en ese piso.
// v0.69: al entrar a cada sala se mide todo lo que te hace fuerte, no solo el arma:
//   ataque  = mejor arma (estrellas, forja, elemento, afinidad) × piedra de afilar, subclase y pactos × críticos × flechas extra
//   aguante = vida máxima + escudo (con la coraza) y la probabilidad de bloquear de la coraza
// Los enemigos se adaptan SOLO para igualarte: tienen tanta más vida como más daño haces, y pegan algo más si aguantas más.
// No salen más, ni más rápidos, ni más élites: no se vuelven más fuertes que tú.
const EXPECT = [1.95, 2.6, 3.4, 4.0, 4.6, 5.2, 5.6, 6.0];
/** extra de daño de reliquias, subclase y pactos (sin lo que dura unos segundos, como la piel de roca) */
function bonusDmg(p) {
  return (1 + .2 * rc('piedra')) * (pact('fragile') ? 1.4 : 1) * (p.spec ? 1 + .08 * (subLv(p) - 1) : 1);
}
/** cuánto suben el daño los críticos, contando ya los de base de tu clase */
function bonusCrit(p) {
  const base = p.char === 'rogue' ? .35 : .1;
  const c = Math.min(1, (base + .15 * rc('ojo') + (tl('ojo2') ? .15 : 0)) * (pact('glass') ? 2 : 1));
  return (1 + c) / (1 + base);
}
function arsenalPower() {
  const p = G.player;
  let best = 0;
  for (const w of p.slots) {
    if (!w) continue;
    const extra = w.type === 'bow' ? rc('carcaj') + (syn('lluvia') ? 1 : 0) + (tl('carcaj2') ? 1 : 0) : 0;
    best = Math.max(best, wPower(w) * (1 + extra / (w.shots || 1)));
  }
  return best * bonusDmg(p) * bonusCrit(p);
}
/** tu aguante (vida + escudo, y los golpes que bloquea la coraza) contra el de tu clase al empezar, que crece un poco por piso */
function aguante() {
  const p = G.player, ch = CHARS[p.char] || CHARS.knight, block = p.armor ? ARMOR.block[p.armor - 1] : 0;
  const tuyo = (p.maxHp + p.maxSh + armorSh(p)) / (1 - block);
  const normal = (ch.hp + (SAVE.upg.hp || 0) + ch.sh) * (1 + .08 * (G.floor - 1));
  return Math.max(1, tuyo / normal);
}
function updateAdapt(announce) {
  const exp = EXPECT[Math.min(EXPECT.length, G.floor) - 1], r = Math.max(1, arsenalPower() / exp), def = aguante();
  const old = G.threat || 0, b = circMod(DIFFS[G.diff] || DIFFS.normal);
  G.threat = r - 1;
  // golpes de 1 a 3: si aguantas el doble, pegan 1 o 2 más (como mucho 3)
  G.dx = { ...b, hp: b.hp * r, hpJefe: b.hp, dmgAdd: Math.min(3, Math.round((def - 1) * 1.5)) };
  if (announce && G.threat > old + .1) addText(G.player.x, G.player.y - 40, tr('Los enemigos se adaptan a tu arsenal'), '#d4474b', 13);
}

export { updateAdapt };
