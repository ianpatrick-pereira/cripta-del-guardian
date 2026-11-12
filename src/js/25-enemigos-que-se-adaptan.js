// ================= Enemigos que se adaptan a tu arsenal =================
// cuanto más fuerte tu mejor arma respecto a lo esperado en el piso, más duros los enemigos
import { tr } from './00b-textos.js';
import { DIFFS, circMod, wPower } from './03-datos-del-juego.js';
import { G } from './07-estado.js';
import { addText } from './09-efectos.js';
// v0.55: se mide el daño de verdad de tu mejor arma (wPower) contra lo normal en ese piso.
// Si llevas el doble de lo esperado, los enemigos tienen casi el doble de vida, pegan más y salen más.
const EXPECT = [1.95, 2.6, 3.4, 4.0, 4.6, 5.2, 5.6, 6.0];
function arsenalPower() {
  let best = 0;
  for (const w of G.player.slots) if (w) best = Math.max(best, wPower(w));
  return best;
}
function updateAdapt(announce) {
  const exp = EXPECT[Math.min(EXPECT.length, G.floor) - 1], r = Math.max(1, arsenalPower() / exp), lvl = r - 1;
  const old = G.threat || 0, b = circMod(DIFFS[G.diff] || DIFFS.normal), hpK = Math.pow(r, .9);
  G.threat = hpK - 1;
  G.dx = { ...b, hp: b.hp * hpK, rate: b.rate * Math.min(1.5, 1 + .12 * lvl), elite: b.elite + .06 * lvl, count: b.count + Math.floor(lvl * 2), dmgAdd: Math.floor(lvl),
    lead: Math.min(1, b.lead + .1 * lvl), dodge: Math.min(.85, b.dodge + .08 * lvl), tokens: b.tokens + Math.floor(lvl * 1.5) };
  if (announce && G.threat > old + .1) addText(G.player.x, G.player.y - 40, tr('Los enemigos se adaptan a tu arsenal'), '#d4474b', 13);
}

export { updateAdapt };
