// Capturas automáticas del juego: el menú y las partidas en escritorio, celular horizontal y celular vertical.
// Uso:  node pruebas/capturas.js            guarda las imágenes en pruebas/capturas/
// En GitHub Actions se suben como «artifact» de cada ejecución: así cada PR trae cómo se ve el juego.
// Usa la página web completa (con la etiqueta viewport), igual que GitHub Pages: un celular la ve como de verdad.
const fs = require('fs'), path = require('path'), os = require('os');
const { chromium } = require('playwright');
const B = require('../build.js');
const OUT = path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.png')) fs.unlinkSync(path.join(OUT, f));
const WEB = path.join(os.tmpdir(), 'cripta-capturas.html');
fs.writeFileSync(WEB, B.paginaWeb(B.html()));

const PANTALLAS = { escritorio: { width: 1280, height: 720 }, horizontal: { width: 844, height: 390, movil: true }, vertical: { width: 390, height: 844, movil: true } };
// mismo entorno que las pruebas: azar con semilla y reloj manual, para que las capturas no cambien solas
const preparar = ({ seed, save }) => {
  window.AudioContext = undefined; window.webkitAudioContext = undefined;
  let s = seed >>> 0; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  let now = 0; performance.now = () => now; Date.now = () => 1790000000000 + now;
  window.requestAnimationFrame = cb => { window.__raf = cb; return 1; };
  window.__frame = () => { now += 16.6667; const cb = window.__raf; window.__raf = null; cb && cb(now); };
  localStorage.clear(); localStorage.setItem('cripta-guardian-v1', JSON.stringify(save));
};
const SAVE = { gems: 40, chars: { knight: true }, kills: { slime: 4, bat: 2, archer: 1 } };

(async () => {
  const browser = await chromium.launch(), errores = [];
  const abrir = async pantalla => {
    const P = PANTALLAS[pantalla];
    const ctx = await browser.newContext({ viewport: { width: P.width, height: P.height }, locale: 'es-ES', hasTouch: !!P.movil, isMobile: !!P.movil, deviceScaleFactor: P.movil ? 2 : 1 });
    const pg = await ctx.newPage(); pg.on('pageerror', e => errores.push(`${pantalla}: ${e.message}`));
    await pg.addInitScript(preparar, { seed: 5, save: SAVE });
    await pg.goto('file://' + WEB); await pg.evaluate(() => window.__frame());
    return { ctx, pg };
  };
  // 1) el menú: pestañas Personaje y Preparación
  for (const pantalla of Object.keys(PANTALLAS)) {
    const { ctx, pg } = await abrir(pantalla);
    for (const tab of ['pj', 'prep']) {
      await pg.evaluate(t => { /** @type {HTMLElement} */ (document.querySelector(`[data-tab=${t}]`)).click(); document.getElementById('ovStart').scrollTop = 0; }, tab);
      await pg.screenshot({ path: path.join(OUT, `menu-${tab}-${pantalla}.png`) });
    }
    await ctx.close();
  }
  // 2) una sala de combate de cada piso (escritorio) y del piso 2 en el celular
  const partida = async (pantalla, piso) => {
    const { ctx, pg } = await abrir(pantalla);
    await pg.evaluate(piso => {
      /** @type {HTMLElement} */ (document.getElementById('btnStart')).click();
      const T = window.__cripta; T.run('knight'); const G = T.state(); if (piso > 1) T.floor(piso);
      for (let i = 0; i < 3; i++) window.__frame();
      const r = G.rooms.filter(r => r.type === 'combat').sort((a, b) => a.depth - b.depth)[0];
      G.player.x = r.cx; G.player.y = r.cy + 80; G.cam.x = r.cx; G.cam.y = r.cy;
      for (let i = 0; i < 160; i++) window.__frame();
    }, piso);
    await pg.screenshot({ path: path.join(OUT, `piso${piso}-${pantalla}.png`) });
    await ctx.close();
  };
  for (let piso = 1; piso <= 8; piso++) await partida('escritorio', piso);
  await partida('horizontal', 2); await partida('vertical', 2);
  await browser.close();
  const n = fs.readdirSync(OUT).filter(f => f.endsWith('.png')).length;
  console.log(`${n} capturas en pruebas/capturas/`);
  if (errores.length) { console.log('Errores de JavaScript:\n  ' + errores.join('\n  ')); process.exit(1); }
})();
