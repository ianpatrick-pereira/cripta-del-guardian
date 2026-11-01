// ================= Armadura =================
// una sola armadura por ahora: su protección sube con las estrellas; no se forja ni usa cristales
import { tr } from './00b-textos.js';
import { ctx } from './00-inicio.js';
import { TAU, rand, randi } from './01-utilidades.js';
import { ROOM_OBJ } from './01a-registro.js';
import { BOTIN, RARITY, RELICS, rollStars, rollWeapon } from './03-datos-del-juego.js';
import { SAVE } from './04-guardado.js';
import { noise, sfx } from './05-audio.js';
import { G, randomRelics, rc } from './07-estado.js';
import { addText, burst, later, shake, showBanner } from './09-efectos.js';
import { dropCoin } from './14-enemigos.js';
import { syn } from './18-sinergias.js';
import { openNote } from './20-historia.js';
import { ach } from './21-logros-y-bestiario.js';
import { startElemFight } from './23-elementos.js';
import { openForge } from './24-forja.js';
import { classHurt, parry } from './26-clases.js';
import { pact, pactOnDescend } from './27-pactos-de-piso.js';
import { dareFail } from './28-desafios-dentro-del-piso.js';
import { buildFloor } from './31-reto-diario.js';
import { openChoice } from './32-eleccion-de-reliquia.js';
import { endGame } from './33-bucle.js';
const ARMOR = { n: tr('Coraza del Guardián'), sh: [1, 1, 2, 2, 3], block: [0, .08, .12, .18, .25], red: [0, 0, 0, 1, 1] };
const armorSh = p => p.armor ? ARMOR.sh[p.armor - 1] : 0;
function armorDesc(s) {
  const A = ARMOR, i = s - 1, parts = [tr`+${A.sh[i]} de escudo`];
  if (A.block[i]) parts.push(tr`${Math.round(A.block[i] * 100)} % de bloquear un golpe`);
  if (A.red[i]) parts.push(tr('los golpes fuertes quitan 1 menos'));
  return parts.join(' · ');
}
function dropArmor(x, y, src) { G.pickups.push({ kind: 'armor', stars: rollStars(src), x, y }); }
function drawArmor(x, y, s, scale = 1) {
  const c = RARITY['s' + s].c;
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = '#3a3448'; ctx.fillRect(-11, -9, 22, 20);
  ctx.fillStyle = c; ctx.fillRect(-9, -8, 18, 17); ctx.fillRect(-14, -9, 6, 7); ctx.fillRect(8, -9, 6, 7);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(-1, -8, 2, 17); ctx.fillRect(-9, 2, 18, 2);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-8, -7, 6, 2);
  ctx.restore();
}

// la flecha divisoria se parte en varias al tocar algo
function splitShot(pr) {
  if (!pr.split || pr.didSplit) return;
  pr.didSplit = true;
  for (let i = 0; i < pr.split; i++) {
    const an = i * TAU / pr.split;
    G.proj.push({ x: pr.x, y: pr.y, vx: Math.cos(an) * 420, vy: Math.sin(an) * 420, r: 4, dmg: Math.max(1, Math.round(pr.dmg * .4)), owner: 'player', kind: 'arrow', pierce: 0, hit: new Set(pr.hit), life: .55, color: pr.color, src: pr.src });
  }
  burst(pr.x, pr.y, '#ffffff', 8, 160, 3);
}
function interact(p, it) {
  if (it.kind === 'armor') {
    const old = p.armor; p.armor = it.stars;
    if (old) it.stars = old; else it.gone = true;
    p.sh = Math.min(p.sh, p.maxSh + rc('escudo') + armorSh(p));
    addText(p.x, p.y - 24, `${ARMOR.n} ${'★'.repeat(p.armor)}`, RARITY['s' + p.armor].c, 12);
    sfx(300, .15, 'square', .04, 200);
    return;
  }
  if (it.kind === 'weapon') {
    const old = p.slots[p.cur];
    p.slots[p.cur] = it.weapon; it.weapon = old; it.bob = 0;
    SAVE.found[p.slots[p.cur].id] = true;
    if (p.slots[p.cur].stars >= 5) ach('star5');
    addText(p.x, p.y - 24, p.slots[p.cur].name, RARITY[p.slots[p.cur].rarity].c, 12);
    sfx(660, .09, 'triangle', .04, 300);
  } else if (it.kind === 'chest') {
    if (it.gold) {
      if (G.keys <= 0) { addText(it.x, it.y - 30, tr('Necesitas una llave'), '#e3a24a', 12); sfx(120, .1, 'square', .03); return; }
      G.keys--;
    }
    it.opened = true;
    const luck = rc('trebol');
    G.pickups.push({ kind: 'weapon', x: it.x, y: it.y + 30, weapon: rollWeapon(it.gold ? 'gold' : 'chest'), bob: 0 });
    if (Math.random() < (it.gold ? BOTIN.cofreDorado.armadura : BOTIN.cofre.armadura)) dropArmor(it.x - 40, it.y + 26, it.gold ? 'gold' : 'chest');
    if (it.gold) { const rr = randomRelics(1)[0]; if (rr) G.pickups.push({ kind: 'relic', relic: rr, x: it.x + 46, y: it.y + 26 }); }
    for (let i = 0; i < randi(BOTIN.cofre.monedas[0], BOTIN.cofre.monedas[1]); i++) dropCoin(it.x, it.y);
    if (!pact('fasting') && (Math.random() < BOTIN.cofre.pocion || luck)) G.pickups.push({ kind: 'potion', x: it.x + rand(-26, 26), y: it.y + 20 + rand(0, 14) });
    burst(it.x, it.y, '#e3a24a', 14, 160);
    sfx(400, .2, 'triangle', .05, 500);
  } else if (it.kind === 'shop') {
    const s = it.item;
    if (G.coins < s.price) { addText(it.x, it.y - 34, tr`Faltan ${s.price - G.coins} monedas`, '#d4474b', 12); sfx(120, .1, 'square', .03); return; }
    G.coins -= s.price; it.gone = true;
    if (s.t === 'potion') { p.hp = Math.min(p.maxHp, p.hp + 3); addText(p.x, p.y - 24, tr('+3 vida'), '#ff7a7e', 14); }
    if (s.t === 'key') { G.keys++; addText(p.x, p.y - 24, tr('+1 llave'), '#e3a24a', 14); }
    if (s.t === 'relic') gainRelic(s.relic);
    if (s.t === 'weapon') G.pickups.push({ kind: 'weapon', x: it.x, y: it.y, weapon: s.weapon, bob: 0 });
    sfx(1000, .1, 'sine', .04); later(.08, () => sfx(1400, .12, 'sine', .04));
  } else if (it.kind === 'forge') {
    openForge();
  } else if (it.kind === 'totem') {
    if ((it.rise || 0) < 1 || G.elFight) return;
    startElemFight(it);
  } else if (it.kind === 'note') {
    it.gone = true; openNote(it.id);
  } else if (it.kind === 'exit') {
    it.gone = true; endGame(true);
  } else if (it.kind === 'relic') {
    it.gone = true; gainRelic(it.relic);
  } else if (it.kind === 'altar') {
    it.used = true;
    openChoice(tr('Altar del tesoro'), tr('Elige una reliquia'), randomRelics(3), () => {});
  } else if (ROOM_OBJ[it.kind]) {
    ROOM_OBJ[it.kind].usar(p, it);   // salas de 01d-salas/
  } else if (it.kind === 'portal') {
    it.gone = true;
    sfx(200, .8, 'sine', .06, 800); noise(.6, .06, 400);
    pactOnDescend();
    buildFloor(G.floor + 1);
  }
}
function gainRelic(id) {
  const p = G.player, R = RELICS[id];
  if (!R) return;
  p.relics.push(id);
  if (id === 'corazon') { p.maxHp += 2; p.hp += 2; }
  if (id === 'bateria') p.en += 40;
  if (id === 'escudo') p.sh++;
  showBanner(R.n, R.c, tr('Reliquia'));
  addText(p.x, p.y - 28, R.d, R.c, 11);
  burst(p.x, p.y, R.c, 20, 180);
  sfx(520, .15, 'triangle', .05, 300); later(.12, () => sfx(780, .2, 'triangle', .05, 300));
}

function hurtPlayer(d, por) {
  const p = G.player;
  if (p.inv > 0 || G.over) return false;
  G.hitBy = por || tr('un golpe');
  if (p.char === 'knight' && p.parryT > 0 && p.parryCd <= 0) { parry(p); return false; }
  d += G.floor >= 11 ? 3 : G.floor >= 7 ? 2 : G.floor >= 3 ? 1 : 0;
  if (pact('fragile')) d += 1;
  if (p.armor) {
    const i = p.armor - 1;
    if (Math.random() < ARMOR.block[i]) { p.inv = .4; addText(p.x, p.y - 26, tr('¡Bloqueado!'), RARITY['s' + p.armor].c, 12); sfx(1100, .06, 'square', .03, -500); burst(p.x, p.y, '#d8d0b8', 6, 120); return false; }
    if (d >= 2) d -= ARMOR.red[i];
  }
  const absorbed = Math.min(p.sh, d); p.sh -= absorbed; d -= absorbed;
  p.hp -= d; p.inv = .8; p.shT = 0; p.shAcc = 0;
  classHurt(p);
  if (G.dare && G.dare.kind === 'nohit') dareFail(tr('te golpearon'));
  shake(7); G.hurtFlash = .35;
  burst(p.x, p.y, d > 0 ? '#d4474b' : '#8fb7d9', 8, 130);
  sfx(d > 0 ? 120 : 300, .15, 'square', .05, -60);
  const nSp = syn('erizo') ? 20 : 10;
  if (rc('espinas')) for (let i = 0; i < nSp; i++) {
    const a = i * TAU / nSp;
    G.proj.push({ x: p.x, y: p.y, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, r: 4, dmg: syn('erizo') ? 5 : 3, owner: 'player', kind: 'arrow', pierce: 0, hit: new Set(), life: .6, color: '#7a9a5a' });
  }
  if (p.hp <= 0) { p.hp = 0; endGame(false); }
  return true;
}

export { ARMOR, armorDesc, armorSh, drawArmor, dropArmor, gainRelic, hurtPlayer, interact, splitShot };
