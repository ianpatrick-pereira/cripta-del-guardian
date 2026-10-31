// ================= Pactos de piso: una maldición a cambio de una bendición =================
const PACTS = {
  volatile: { n: 'Cadáveres volátiles', c: '#ff8a3a', d: 'Maldición: los enemigos explotan al morir (cuidado con estar cerca). Bendición: +50 % de oro.' },
  glass:    { n: 'Cuerpo de cristal',   c: '#9bd8ff', d: 'Maldición: no tienes escudo en este piso. Bendición: el doble de probabilidad de crítico.' },
  fragile:  { n: 'Piel de papel',       c: '#d4474b', d: 'Maldición: recibes +1 de daño por golpe. Bendición: haces +40 % de daño.' },
  frenzy:   { n: 'Frenesí',             c: '#e3a24a', d: 'Maldición: los enemigos son un 25 % más rápidos. Bendición: tú vas un 20 % más rápido y la energía se recarga el doble.' },
  dark:     { n: 'Oscuridad',           c: '#6b6480', d: 'Maldición: apenas ves a tu alrededor. Bendición: los enemigos sueltan el doble de oro.' },
  blood:    { n: 'Pacto de sangre',     c: '#b0303a', d: 'Maldición: pierdes 2 de vida ahora. Bendición: ganas una reliquia al instante.' },
  fasting:  { n: 'Ayuno',               c: '#c9a46a', d: 'Maldición: no caen pociones ni en enemigos ni en cofres. Bendición: al bajar de piso, +2 de vida máxima.' },
  none:     { n: 'Sin pacto',           c: '#9d95ab', d: 'Juegas este piso sin cambios.' },
};
const pact = id => !!(G && G.pact === id);
function offerPact() {
  if (!G || G.over || G.pact !== null || !G.pactIds) return;
  if (G.choice) { later(1, offerPact); return; }
  openChoice('Pacto del piso', 'Una maldición a cambio de una bendición', [...G.pactIds, 'none'], () => {}, 'pact');
}
function setPact(id) {
  const p = G.player, P = PACTS[id];
  G.pact = id === 'none' ? '' : id;
  if (!G.pact) return;
  showBanner(P.n, P.c, 'Pacto aceptado para este piso');
  if (id === 'blood') { p.hp = Math.max(1, p.hp - 2); G.hurtFlash = .3; const rr = randomRelics(1)[0]; if (rr) gainRelic(rr); }
  sfx(90, .5, 'sawtooth', .05, -30); burst(p.x, p.y, P.c, 20, 160);
}
// recompensas que se cobran al bajar de piso
function pactOnDescend() {
  const p = G.player;
  if (pact('fasting')) { p.maxHp += 2; p.hp += 2; }
}

