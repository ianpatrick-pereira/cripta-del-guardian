// Mide cuánto tarda cada fotograma (lógica + dibujo) en escenas pesadas.
// Uso: node pruebas/rendimiento.js
// Escenas: piso 8 con 20, 40 y 80 enemigos peleando, y la pelea contra el jefe del piso 8, con la
// calidad gráfica alta, media y baja (la «automática» del juego va bajando de alta a baja si va lento).
// Se mide en un escritorio y en un celular simulado (pantalla de iPhone y CPU 4 veces más lenta).
// Ojo: el navegador sin ventana dibuja sin tarjeta gráfica, así que el dibujo sale más lento que en
// un aparato real. Sirve para comparar versiones y escenas, no como cifra exacta.
const path = require('path'), { chromium, devices } = require('playwright');
const JUEGO = 'file://' + path.join(__dirname, '..', 'cripta.html');
const PRESUPUESTO = 1000 / 60;   // 16,7 ms por fotograma para ir a 60 fps

const escena = ([n, jefe]) => {
  const T = window.__cripta; T.run('knight'); const G = T.state(); T.floor(8); T.sim(2);
  const p = G.player; p.hp = p.maxHp = 9999; T.weapon(p.slots[p.cur].id, 5);
  const r = jefe ? G.bossRoom : G.rooms.filter(r => r.type === 'combat').sort((a, b) => b.depth - a.depth)[0];
  if (jefe) { T.toBoss(); } else { p.x = r.cx; p.y = r.cy; G.cam.x = p.x; G.cam.y = p.y; }
  T.sim(60);
  const tipos = ['phantom', 'burrower', 'charger', 'sniper', 'priest', 'warden', 'bomber', 'eye', 'wraith', 'splitter'];
  for (let i = 0; i < n; i++) { const a = i * 2.4, d = 90 + (i % 7) * 25; T.spawn(tipos[i % tipos.length], r.cx + Math.cos(a) * d, r.cy + Math.sin(a) * d); }
  const med = (xs, q) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
  const upd = [], dib = [];
  for (let f = 0; f < 360; f++) {
    p.hp = p.maxHp; while (T.resolve());
    const vivos = G.enemies.filter(e => !e.dead && !e.ally).length;
    if (!jefe && vivos < n * .6) for (let i = vivos; i < n; i++) T.spawn(tipos[i % tipos.length], r.cx + Math.cos(i) * 140, r.cy + Math.sin(i) * 140);
    const t0 = performance.now(); T.sim(1); const t1 = performance.now(); T.render(); const t2 = performance.now();
    if (f >= 60) { upd.push(t1 - t0); dib.push(t2 - t1); }
  }
  const tot = upd.map((u, i) => u + dib[i]);
  return { logica: med(upd, .5), dibujo: med(dib, .5), total: med(tot, .5), p95: med(tot, .95), balas: G.proj.length, particulas: G.parts.length, enemigos: G.enemies.filter(e => !e.dead).length };
};

(async () => {
  const nav = await chromium.launch();
  const perfiles = [
    { n: 'Escritorio 1280×720', ctx: { viewport: { width: 1280, height: 720 } }, cpu: 1 },
    { n: 'Celular (iPhone 13, CPU ×4 más lenta)', ctx: { ...devices['iPhone 13'] }, cpu: 4 },
  ];
  const fmt = x => x.toFixed(1).padStart(5);
  const CALIDAD = { 2: 'alta', 1: 'media', 0: 'baja' };
  for (const pf of perfiles) for (const q of ['2', '1', '0']) {
    const ctx = await nav.newContext(pf.ctx), pg = await ctx.newPage();
    await pg.addInitScript(q => { window.AudioContext = undefined; window.webkitAudioContext = undefined; window.requestAnimationFrame = () => 1;
      localStorage.setItem('cripta-guardian-v1', JSON.stringify({ gems: 0, opt: { music: 0, sfx: 0, shake: 1, gfx: q } })); }, q);
    await pg.goto(JUEGO); await pg.click('#btnStart');
    if (pf.cpu > 1) { const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate: pf.cpu }); }
    console.log(`\n${pf.n} · calidad ${CALIDAD[q]}   (ms por fotograma; 60 fps = ${PRESUPUESTO.toFixed(1)} ms)`);
    console.log('  escena                      lógica  dibujo  total   peor 5 %   cabe en 60 fps');
    for (const [n, jefe, nombre] of [[20, false, 'piso 8 · 20 enemigos'], [40, false, 'piso 8 · 40 enemigos'], [80, false, 'piso 8 · 80 enemigos'], [6, true, 'jefe del piso 8 + 6']]) {
      const r = await pg.evaluate(escena, [n, jefe]);
      console.log(`  ${nombre.padEnd(26)} ${fmt(r.logica)}  ${fmt(r.dibujo)}  ${fmt(r.total)}   ${fmt(r.p95)}     ${r.p95 <= PRESUPUESTO ? 'sí' : r.total <= PRESUPUESTO ? 'casi (tirones)' : 'NO'}   [${r.enemigos} enemigos, ${r.balas} balas, ${r.particulas} partículas]`);
    }
    await ctx.close();
  }
  await nav.close();
})();
