// ================= Sala de apuestas: el juego de las tres cartas =================
// la cámara se acerca a la mesa, eliges 1 de 3 cartas boca abajo y solo una gana
const GAM_LINES = {
  hello: ['¿Te atreves a apostar, mortal?', 'Siéntate… la casa te esperaba', 'Tu oro huele delicioso…'],
  pick:  ['Es hora de escoger…', 'Elige… si te atreves', 'Una carta. Solo una vive…'],
  lose:  ['Jajajaja… has perdido', 'Jajaja… tu oro ahora es mío', 'Jejeje… la cripta siempre gana'],
  win:   ['Grrr… la suerte te sonríe… por ahora', 'Tómalo… disfrútalo mientras dure', 'Hmm… otra vez no tendrás tanta suerte'],
  cheat: ['¡Tramposo! Nadie le gana a la casa… ¡pagarás!', '¡¡¿OTRA VEZ?!! ¡¡TRAMPOSO!! ¡Esta vez no me contendré!', '¡¡¡SUFICIENTE!!! ¡CONTEMPLA MI VERDADERA FORMA!'],
  broke: ['Sin oro no hay juego… lárgate'],
};
function startGamble(it) {
  if (it.gone || it.fight) return;
  G.choice = { gamble: true, ids: [] };
  G.gam = { it, ph: 'in', z: 0, t: 0, bet: 0, win: -1 };
  keys.clear(); mouse.down = mouse.right = false; touch.atk = touch.chg = false;
  sfx(160, .5, 'sine', .05, -60); noise(.35, .03, 500);
}
// avanza la animación aunque el juego esté detenido
function gamTick(dt) {
  const g = G.gam; if (!g) return;
  if (g.ph === 'in') { g.z = Math.min(1, g.z + dt / .55); if (g.z >= 1) { g.ph = 'bet'; gamShow(); if (G.coins >= 5) gamSay(pick(GAM_LINES.hello)); } }
  else if (g.ph === 'res') { g.t -= dt; if (g.t <= 0) { g.ph = 'out'; $('ovGamble').hidden = true; } }
  else if (g.ph === 'out') { g.z = Math.max(0, g.z - dt / .45); if (g.z <= 0) { G.gam = null; G.choice = null; gamAfter(g.it); } }
}
const gamEase = () => { const z = G.gam ? G.gam.z : 0; return z * z * (3 - 2 * z); };
function gamPaintSprites() {
  const paint = (id, key, flip) => {
    const c = $(id), sp = SPR[key]; if (!sp) return;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, c.width, c.height);
    x.save(); if (flip) { x.translate(c.width, 0); x.scale(-1, 1); }
    const s = Math.min(c.width / sp.wd, c.height / sp.ht);
    x.drawImage(sp.n, (c.width - sp.wd * s) / 2, (c.height - sp.ht * s) / 2, sp.wd * s, sp.ht * s); x.restore();
  };
  paint('gamMonster', 'mage', false); paint('gamPlayer', G.player.spr, false);
}
function gamShow() {
  const g = G.gam;
  gamPaintSprites();
  $('gamMonster').style.filter = ['', 'drop-shadow(0 0 14px #d04cff)', 'drop-shadow(0 0 22px #ff3af0) saturate(1.5)'][Math.min(2, g.it.wins)];
  $('gamCards').querySelectorAll('.gcard').forEach(c => { c.classList.remove('flip', 'win', 'lose', 'dim'); c.disabled = true; });
  const max = Math.floor(G.coins / 5) * 5;
  $('gamBet').value = Math.max(5, Math.min(10, max));
  $('gamPlays').textContent = `Partida ${g.it.plays + 1} de 3 · aciertas: ganas el doble`;
  gamCoins(); gamControls(true);
  $('ovGamble').hidden = false;
  if (max < 5) { gamSay(GAM_LINES.broke[0]); $('gamGo').disabled = true; }
}
function gamCoins() { $('gamGold').textContent = G.coins; }
function gamControls(on) { for (const id of ['gamMinus', 'gamPlus', 'gamBet', 'gamGo', 'gamLeave']) $(id).disabled = !on; }
function gamSay(txt) {
  const b = $('gamBubble'); b.textContent = txt; b.classList.remove('rage');
  b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  sfx(90 + Math.random() * 40, .25, 'sawtooth', .025, -20);
}
function gamBetVal() {
  const max = Math.floor(G.coins / 5) * 5;
  let v = Math.round((+$('gamBet').value || 0) / 5) * 5;
  return Math.max(5, Math.min(max, v));
}
function gamStep(d) { $('gamBet').value = Math.max(5, Math.min(Math.floor(G.coins / 5) * 5, gamBetVal() + d)); sfx(700, .03, 'square', .02); }
function gamPlace() {
  const g = G.gam; if (!g || g.ph !== 'bet') return;
  if (G.coins < 5) { gamSay(GAM_LINES.broke[0]); return; }
  const bet = gamBetVal(); $('gamBet').value = bet;
  G.coins -= bet; g.bet = bet; g.win = randi(0, 2); g.ph = 'pick';
  gamCoins(); gamControls(false);
  $('gamCards').querySelectorAll('.gcard').forEach(c => c.disabled = false);
  gamSay(pick(GAM_LINES.pick));
  sfx(300, .15, 'triangle', .04, -100);
}
function gamPick(i) {
  const g = G.gam; if (!g || g.ph !== 'pick') return;
  g.ph = 'reveal';
  const cards = [...$('gamCards').querySelectorAll('.gcard')], it = g.it, won = i === g.win;
  cards.forEach(c => c.disabled = true);
  cards.forEach((c, j) => c.querySelector('.gfront').innerHTML = j === g.win ? GAM_SVG.gold : GAM_SVG.skull);
  cards[i].classList.add('flip', won ? 'win' : 'lose'); sfx(500, .08, 'triangle', .03, 200);
  it.plays++;
  setTimeout(() => {
    if (!G || G.gam !== g) return;
    cards.forEach((c, j) => { if (j !== i) c.classList.add('flip', 'dim'); });
    if (won) {
      it.wins++; it.last = 'win'; G.coins += g.bet * 2; gamCoins();
      gamSay(GAM_LINES.cheat[it.wins - 1]); $('gamBubble').classList.add('rage');
      sfx(900, .3, 'triangle', .05, 500); setTimeout(() => sfx(1300, .3, 'sine', .04), 100);
    } else {
      it.losses++; it.last = 'lose';
      gamSay(pick(GAM_LINES.lose)); sfx(70, .6, 'sawtooth', .05, -20);
    }
    g.ph = 'res'; g.t = won ? 2.6 : 2.1;
  }, 550);
}
function gamLeave() { const g = G.gam; if (!g || g.ph !== 'bet') return; g.ph = 'out'; $('ovGamble').hidden = true; }
// al volver a la vista normal: sigue, desaparece o se transforma
function gamAfter(it) {
  if (it.last === 'win') gamTransform(it, it.wins);
  else if (it.losses >= 3 || it.plays >= 3) gamClose(it);
  else addText(it.x, it.y - 50, `Quedan ${3 - it.plays} partidas`, '#b98cff', 12);
}
function gamClose(it) {
  {
    it.gone = true; burst(it.x, it.y - 20, '#7a3fbf', 30, 160, 6, .9); burst(it.x, it.y - 20, '#1a0f24', 20, 120, 7, 1);
    addText(it.x, it.y - 50, it.losses >= 3 ? 'El crupier se desvanece entre risas…' : 'La casa cierra… por hoy', '#b98cff', 13);
    sfx(60, 1, 'sine', .06, -20);
  }
}
// cada victoria despierta una forma más fuerte del crupier
const CHEAT_FORMS = [
  { n: 'Crupier Tramposo', sub: 'Forma base', tint: '#9b5cff', s: 3.4, r: 22, hp: .8, speed: 82, dmg: 0, cards: 1, want: 170, minion: 'wraith',
    p1: ['volley', 'retreat', 'fan'], p2: ['volley', 'fan', 'rain', 'retreat'] },
  { n: 'Crupier Enojado', sub: 'Forma enojada', tint: '#d04cff', s: 4.2, r: 25, hp: 1.15, speed: 98, dmg: 1, cards: 3, want: 130, minion: 'wraith',
    p1: ['volley', 'charge3', 'fan'], p2: ['volley', 'charge3', 'rain', 'fan', 'summon'] },
  { n: 'Señor de la Banca', sub: 'Forma final', tint: '#ff3af0', s: 5.2, r: 28, hp: 1.7, speed: 108, dmg: 2, cards: 5, want: 90, minion: 'phantom',
    p1: ['charge3', 'rain', 'fan', 'volley'], p2: ['charge3', 'slam', 'rain', 'fan', 'summon', 'wave'] },
];
function gamTransform(it, st) {
  const r = it.room, F = CHEAT_FORMS[Math.min(3, st) - 1], k = Math.max(1, Math.min(8, G.fi + 1));
  it.fight = true;
  const e = mkSub(k, it.x, it.y - 20);
  e.def = Object.assign({}, SUBS[k], { name: F.n, spr: 'mage', s: F.s, r: F.r, speed: F.speed, tint: F.tint, minion: F.minion, want: F.want, p1: F.p1, p2: F.p2 });
  Object.assign(e, { name: F.n, spr: 'mage', s: F.s, r: F.r, speed: F.speed, tint: F.tint, cheat: st, gamIt: it });
  e.hp = e.max = Math.round(e.max * F.hp); e.dmg += F.dmg;
  G.enemies.push(e);
  const p = G.player; p.x = it.x; p.y = Math.min(it.y + 110, r.cy + r.h * TILE / 2 - 40); p.inv = Math.max(p.inv || 0, 1.2);
  r.type = 'combat'; r.cleared = false; r.locked = true; r.wave = r.waves = 1; r.sub = st >= 3;
  G.cheatSt = st;
  showBanner(st >= 3 ? '¡¡¡TRAMPOSO!!!' : st === 2 ? '¡¡Tramposo!!' : '¡Tramposo!', F.tint, F.n + ' · ' + F.sub);
  shake(10 + st * 5); G.hitstop = .15 + .05 * st; burst(it.x, it.y, F.tint, 40 + st * 15, 300, 6, 1); burst(it.x, it.y, '#120818', 30, 200, 7, 1);
  sfx(60 - st * 8, 1.2, 'sawtooth', .07, -10);
}
function cheatDefeated(e) {
  const it = e.gamIt, st = e.cheat, F = CHEAT_FORMS[st - 1];
  for (let i = 0; i < 6 + st * 4; i++) dropCoin(e.x, e.y);
  if (st >= 2) G.pickups.push({ kind: 'gem', x: e.x, y: e.y, vx: rand(-90, 90), vy: rand(-90, 90) });
  G.pickups.push({ kind: 'potion', x: e.x + 20, y: e.y });
  burst(e.x, e.y, F.tint, 40, 260, 6, 1);
  if (st >= 3) { showBanner('La banca ha caído', F.tint, 'El crupier no volverá a hacer trampas'); later(.9, offerTalent); }
  else showBanner(F.n + ' huye', F.tint, 'Vuelve a su mesa… más furioso');
  if (!it) return;
  if (st >= 3 || it.plays >= 3 || it.losses >= 3) { later(1.2, () => { if (!it.gone) gamClose(it); }); return; }
  later(1.4, () => {
    it.fight = false; burst(it.x, it.y - 20, '#7a3fbf', 24, 140, 6, .8);
    addText(it.x, it.y - 56, `"Esto no ha terminado…" · quedan ${3 - it.plays} partidas`, '#b98cff', 13);
  });
}
// cartas que flotan alrededor del crupier: una por forma
function drawCheatForm(e, lift) {
  const F = CHEAT_FORMS[e.cheat - 1], n = F.cards, R = e.r + 20;
  if (e.cheat >= 3) { ctx.globalAlpha = .35 + .15 * Math.sin(G.time * 6); ctx.strokeStyle = '#120818'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(e.x, e.y - lift, e.r + 16 + Math.sin(G.time * 4) * 3, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  for (let i = 0; i < n; i++) {
    const a = G.time * (1.4 + .5 * e.cheat) + i * TAU / n, x = e.x + Math.cos(a) * R, y = e.y - lift - e.r * .4 + Math.sin(a) * R * .5;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(G.time * 3 + i) * .3);
    ctx.fillStyle = '#170f22'; ctx.fillRect(-5, -7, 10, 14); ctx.strokeStyle = F.tint; ctx.lineWidth = 1.2; ctx.strokeRect(-5, -7, 10, 14);
    ctx.fillStyle = F.tint; ctx.fillRect(-1.5, -2, 3, 3); ctx.restore();
  }
}
// la sala se tiñe de morado brillante y negro mientras dura la pelea
function drawCheatRoom(w, h, camX, camY, zoom) {
  const ce = G.enemies.find(e => e.cheat), tgt = ce ? 1 : 0;
  G.cfx = (G.cfx || 0) + (tgt - (G.cfx || 0)) * Math.min(1, (G.dtLast || .016) * 2.5);
  if (ce) G.cheatSt = ce.cheat;
  const k = G.cfx; if (k < .01) return;
  const st = G.cheatSt || 1, pul = .5 + .5 * Math.sin(G.time * (2 + st));
  ctx.save();
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(${120 - st * 15},${50 - st * 12},${190},${k})`; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter';
  const bx = ce ? (ce.x - camX) * zoom + w / 2 : w / 2, by = ce ? (ce.y - camY) * zoom + h / 2 : h / 2;
  const g = ctx.createRadialGradient(bx, by, 10, bx, by, Math.max(w, h) * .55);
  g.addColorStop(0, `rgba(200,80,255,${(.22 + .12 * pul) * k * (.8 + .15 * st)})`); g.addColorStop(1, 'rgba(120,20,200,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .25, w / 2, h / 2, Math.max(w, h) * .7);
  v.addColorStop(0, 'rgba(4,0,8,0)'); v.addColorStop(1, `rgba(4,0,8,${(.75 + .1 * pul) * k})`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
  ctx.restore();
  if (ce && Math.random() < .4 + .2 * st) { const r = ce.room || G.cur; if (r) G.parts.push({ x: r.cx + rand(-r.w * 15, r.w * 15), y: r.cy + rand(-r.h * 15, r.h * 15), vx: rand(-8, 8), vy: -35, life: 1.4, max: 1.4, color: pick(['#b05cff', '#e08cff', '#7a3fbf', '#1a0f24']), size: 3 }); }
}
const GAM_SVG = {
  skull: `<svg viewBox="0 0 100 140" aria-hidden="true"><defs><radialGradient id="gsk" cx="50%" cy="45%"><stop offset="0" stop-color="#3a1f5a"/><stop offset="1" stop-color="#0d0814"/></radialGradient></defs><rect x="0" y="0" width="100" height="140" rx="8" fill="url(#gsk)"/><g fill="#b98cff" opacity=".92"><path d="M50 34c-17 0-28 12-28 27 0 9 4 15 10 19v12h36V80c6-4 10-10 10-19 0-15-11-27-28-27z"/></g><g fill="#120a1c"><ellipse cx="39" cy="62" rx="7" ry="8"/><ellipse cx="61" cy="62" rx="7" ry="8"/><path d="M50 70l-4 8h8z"/><rect x="40" y="84" width="3" height="8"/><rect x="48.5" y="84" width="3" height="8"/><rect x="57" y="84" width="3" height="8"/></g><circle cx="39" cy="62" r="2" fill="#e8c8ff"/><circle cx="61" cy="62" r="2" fill="#e8c8ff"/><text x="50" y="122" text-anchor="middle" font-family="Grenze Gotisch, serif" font-size="13" fill="#b98cff">pierdes</text></svg>`,
  gold: `<svg viewBox="0 0 100 140" aria-hidden="true"><defs><radialGradient id="ggd" cx="50%" cy="55%"><stop offset="0" stop-color="#5a3d10"/><stop offset="1" stop-color="#160e04"/></radialGradient></defs><rect x="0" y="0" width="100" height="140" rx="8" fill="url(#ggd)"/><g stroke="#8a5a10" stroke-width="1.5"><ellipse cx="50" cy="96" rx="30" ry="8" fill="#e3a24a"/><ellipse cx="50" cy="88" rx="27" ry="7" fill="#f0c040"/><ellipse cx="50" cy="80" rx="23" ry="6" fill="#e3a24a"/><ellipse cx="50" cy="72" rx="19" ry="5" fill="#f0c040"/><ellipse cx="50" cy="64" rx="14" ry="4" fill="#ffd27a"/><ellipse cx="33" cy="50" rx="8" ry="8" fill="#f0c040"/><ellipse cx="68" cy="46" rx="7" ry="7" fill="#ffd27a"/></g><g fill="#fff6d0"><circle cx="30" cy="47" r="2"/><circle cx="66" cy="43" r="1.6"/><circle cx="44" cy="62" r="1.4"/></g><text x="50" y="124" text-anchor="middle" font-family="Grenze Gotisch, serif" font-size="13" fill="#ffd27a">¡ganas!</text></svg>`,
  back: `<svg viewBox="0 0 100 140" aria-hidden="true"><rect x="0" y="0" width="100" height="140" rx="8" fill="#170f22"/><rect x="5" y="5" width="90" height="130" rx="5" fill="none" stroke="#7a3fbf" stroke-width="1.5"/><rect x="9" y="9" width="82" height="122" rx="3" fill="none" stroke="#3a2456" stroke-width="1"/><g fill="#0b0712" stroke="#4a2e70" stroke-width="1"><path d="M14 132V108a8 8 0 0 1 16 0v24z"/><path d="M34 132V104a8 8 0 0 1 16 0v28z"/><path d="M54 132V104a8 8 0 0 1 16 0v28z"/><path d="M74 132V108a8 8 0 0 1 12 0v24z"/><path d="M22 96V80a6 6 0 0 1 12 0v16z"/><path d="M44 96V78a6 6 0 0 1 12 0v18z"/><path d="M66 96V80a6 6 0 0 1 12 0v16z"/></g><g fill="#9b6dd6" opacity=".7"><circle cx="42" cy="118" r="2.2"/><circle cx="62" cy="118" r="2.2"/><circle cx="50" cy="88" r="1.8"/><circle cx="28" cy="88" r="1.6"/><circle cx="72" cy="88" r="1.6"/></g><text x="50" y="34" text-anchor="middle" font-family="Grenze Gotisch, serif" font-size="15" fill="#d8b8ff">Cripta del</text><text x="50" y="52" text-anchor="middle" font-family="Grenze Gotisch, serif" font-size="15" fill="#d8b8ff">Guardián</text><path d="M30 60h40" stroke="#7a3fbf" stroke-width="1"/><path d="M50 56l3 4-3 4-3-4z" fill="#b98cff"/></svg>`,
};

