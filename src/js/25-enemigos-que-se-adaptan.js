// ================= Enemigos que se adaptan a tu arsenal =================
// cuanto más fuerte tu mejor arma respecto a lo esperado en el piso, más duros los enemigos
import { tr } from './00b-textos.js';
import { DIFFS, RORDER, circMod } from './03-datos-del-juego.js';
import { G } from './07-estado.js';
import { addText } from './09-efectos.js';
const EXPECT = [0, 2.0, 2.8, 3.6];
function arsenalPower() {
  let best = 0;
  for (const w of G.player.slots) best = Math.max(best, w.stars + (w.up.dmg + w.up.rate + w.up.chg + w.up.en) * .1 + RORDER.indexOf(w.tier) * .15);
  return best;
}
function updateAdapt(announce) {
  const gap = Math.max(0, arsenalPower() - (EXPECT[Math.min(3, G.floor)] + .4 * Math.max(0, G.floor - 3)));
  const lvl = gap + (G.player.slots.some(w => w.stars === 5) ? 1.2 : 0);
  const old = G.threat || 0, b = circMod(DIFFS[G.diff] || DIFFS.normal);
  G.threat = lvl;
  G.dx = { ...b, hp: b.hp * (1 + .16 * lvl), rate: b.rate * (1 + .05 * lvl), elite: b.elite + .04 * lvl, count: b.count + Math.floor(lvl / 1.5),
    lead: Math.min(1, b.lead + .08 * lvl), dodge: Math.min(.85, b.dodge + .06 * lvl), tokens: b.tokens + Math.floor(lvl / 2) };
  if (announce && lvl > old + .3) addText(G.player.x, G.player.y - 40, tr('Los enemigos se adaptan a tu arsenal'), '#d4474b', 13);
}

export { updateAdapt };
