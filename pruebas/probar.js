// Pruebas automáticas de Cripta del Guardián.
// Uso:  node juego/pruebas/probar.js               ejecuta todas las pruebas
//       node juego/pruebas/probar.js clases         solo un grupo (clases, idioma, armas, salas, guardado, finales, circulos)
//       node juego/pruebas/probar.js --referencia   guarda los resultados actuales como referencia
// Un bot juega solo con azar repetible (misma semilla = misma partida). Cada prueba falla si hay
// errores de JavaScript, valores imposibles (NaN) o salas que no se pueden terminar. Además compara
// cada partida con referencia.json: si un cambio altera una partida, avisa de cuál (no siempre es
// un error: tras un cambio de jugabilidad buscado, vuelve a guardar la referencia).
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { chromium } = require('playwright');
const JUEGO = path.join(__dirname, '..', 'cripta.html');
const REF = path.join(__dirname, 'referencia.json');
const args = process.argv.slice(2), guardarRef = args.includes('--referencia'), grupo = args.find(a => !a.startsWith('--'));

// ---------- entorno determinista: azar con semilla, reloj manual, sin audio ----------
const preparar = ({ seed, save }) => {
  window.AudioContext = undefined; window.webkitAudioContext = undefined;
  let s = seed >>> 0; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  let now = 0; performance.now = () => now; Date.now = () => 1790000000000 + now;
  window.requestAnimationFrame = cb => { window.__raf = cb; return 1; };
  window.__frame = () => { now += 16.6667; const cb = window.__raf; window.__raf = null; cb && cb(now); };
  localStorage.clear();
  if (save) localStorage.setItem('cripta-guardian-v1', JSON.stringify(save));
};
const SAVE_BASE = { gems: 50, chars: { knight: true, archer: true, rogue: true } };

// ---------- funciones que corren dentro de la página ----------
// el bot: persigue al enemigo más cercano, mantiene distancia si dispara, carga, esquiva y usa habilidades
const BOT = `window.__bot = (frames, godmode) => {
  const T = window.__cripta, G = T.state(), out = { hits: 0, nan: false, dano: 0, por: {} };
  for (let f = 0; f < frames; f++) {
    if (T.resolve()) continue;
    const p = G.player; if (!p || G.over) break;
    const todos = G.enemies.filter(e => !e.dead && !e.ally), sala = todos.filter(e => !e.stray), vivos = sala.length ? sala : todos;
    let o = { atk: false };
    if (vivos.length) {
      let t = vivos[0], bd = 1e9; for (const e of vivos) { const d = Math.hypot(e.x - p.x, e.y - p.y); if (d < bd) { bd = d; t = e; } }
      const w = p.slots[p.cur], melee = w.type === 'melee', a = Math.atan2(t.y - p.y, t.x - p.x), lado = (Math.floor(G.time / 2) % 2) ? 1 : -1;
      // distancia que mantiene con armas a distancia (la hoz llega a unos 150 px: se pone más cerca)
      const [cerca, lejos] = w.style === 'sickle' ? [70, 140] : [150, 300];
      let mv;
      if (melee) mv = bd > 45 ? [Math.cos(a), Math.sin(a)] : [Math.cos(a + lado * 1.4), Math.sin(a + lado * 1.4)];
      else mv = bd < cerca ? [-Math.cos(a), -Math.sin(a)] : bd > lejos ? [Math.cos(a), Math.sin(a)] : [Math.cos(a + lado * 1.57), Math.sin(a + lado * 1.57)];
      const ciclo = G.time % 5;
      o = { mv, atk: ciclo < 4, chg: ciclo >= 4 && ciclo < 4.8, dash: f % 170 === 0, abil: f % 480 === 0, elem: f % 600 === 0 };
    }
    T.bot(o);
    // inmortal de verdad: con 100 de vida extra durante el fotograma, varios golpes juntos no pueden matarlo
    // (el Asesino tiene 5 de vida y en el piso 8 un fotograma con dos golpes fuertes terminaba la partida).
    // Si una curación recorta la vida al máximo (p. ej. la habilidad del Paladín), ese fotograma no cuenta como daño.
    if (godmode) p.hp = p.maxHp + 100;
    const hp0 = p.hp; T.sim(1);
    if (godmode && p.hp <= p.maxHp) p.hp = hp0;
    if (p.hp < hp0) { out.hits++; out.dano += hp0 - p.hp; out.por[G.hitBy || '?'] = (out.por[G.hitBy || '?'] || 0) + hp0 - p.hp; }
    if (godmode) { p.hp = p.maxHp; }
    if (f % 30 === 0) T.render();
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || G.enemies.some(e => !Number.isFinite(e.x) || !Number.isFinite(e.y) || Number.isNaN(e.hp))) { out.nan = true; break; }
  }
  T.bot({}); return out;
};
// avanza n fotogramas cerrando cualquier elección que se abra (subclase, talento...)
// (cerrar una elección suelta los mandos, así que se vuelven a pulsar)
window.__simR = (n, o = {}) => { const T = window.__cripta; T.bot(o); for (let i = 0; i < n; i++) { if (T.resolve()) T.bot(o); T.sim(1); } };`;

// ---------- escenarios ----------
const CLASES = ['knight', 'archer', 'rogue'], NOMBRE = { knight: 'Caballero', archer: 'Tirador', rogue: 'Asesino' };
const escenarios = [];
// 1) cada clase en cada piso: despeja las salas de combate, la del subjefe y la del jefe
const casoClase = (ch, piso) => ({ grupo: 'clases', id: `${NOMBRE[ch]} · piso ${piso}`, seed: piso * 31 + ch.length, run: async pg => pg.evaluate(([ch, piso]) => {
  const T = window.__cripta; T.run(ch); const G = T.state(); T.floor(piso); const p = G.player; T.sim(2);
  // equipo acorde al piso (el bot no recoge botín): estrellas que suben con el piso y,
  // desde el piso 3, fuego despierto en el arma para probar también la habilidad R
  const st = Math.min(5, 1 + Math.floor(piso / 2));
  T.weapon(p.slots[p.cur].id, st);
  if (piso >= 3) { const w = p.slots[p.cur]; w.el = 'fire'; w.elC = 3; w.elLv = 1; w.elOn = true; }
  const fallos = [], salas = G.rooms.filter(r => r.type === 'combat').sort((a, b) => a.depth - b.depth);
  let hits = 0, rematados = 0;
  for (const r of [...salas, 'jefe']) {
    if (r === 'jefe') T.toBoss(); else { if (r.cleared) continue; p.x = r.cx; p.y = r.cy; G.cam.x = p.x; G.cam.y = p.y; }
    const sala = r === 'jefe' ? G.bossRoom : r;
    for (let k = 0; k < (r === 'jefe' ? 16 : 8) && !sala.cleared && !G.over; k++) {
      const k0 = G.kills, b = window.__bot(600, true); hits += b.hits;
      if (b.nan) { fallos.push('posición o vida NaN'); break; }
      const vivos = G.enemies.filter(e => !e.dead && !e.ally && !e.stray);
      if (!sala.locked && !sala.cleared && !vivos.length) { p.x = sala.cx; p.y = sala.cy; }   // volver a entrar si salió
    }
    // si el bot no pudo con todo a tiempo, se remata lo que quede: así se prueba igualmente que la sala
    // pasa de oleada, se abre y se da por terminada (el bot no busca equilibrar la dificultad)
    for (let k = 0; k < 12 && !sala.cleared && !G.over; k++) {
      for (const e of G.enemies.filter(e => !e.dead && !e.ally && !e.stray)) { T.kill(e); rematados++; }
      // también aquí con la vida llena, como el bot: esta parte prueba que la sala se cierre bien, no si el
      // jugador sobrevive (sin esto, una bala perdida en el piso 8 podía terminar la partida y la prueba fallaba)
      for (let f = 0; f < 90; f++) { p.hp = p.maxHp + 100; T.sim(1); } p.hp = p.maxHp; while (T.resolve());
      if (!sala.locked && !sala.cleared && !G.enemies.some(e => !e.dead && !e.stray)) { p.x = sala.cx; p.y = sala.cy; T.sim(30); }
    }
    if (!sala.cleared) { const q = G.enemies.filter(e => !e.dead); fallos.push(`${r === 'jefe' ? 'jefe' : (r.sub ? 'subjefe' : 'sala')} sin terminar (quedan ${q.length}: ${q.slice(0, 4).map(e => (e.type || e.kind) + (e.stray ? '(pasillo)' : '') + ' ' + Math.round(e.hp) + 'pv ' + Math.round(Math.hypot(e.x - p.x, e.y - p.y)) + 'px').join(', ')}; oleada ${sala.wave}/${sala.waves}, marcadores ${G.markers.length})`); }
  }
  return { fallos, huella: [salas.length, G.kills, rematados, Math.round(G.time), hits, G.coins, p.slots.map(w => w.id + w.stars)], info: `${salas.length} salas + jefe · ${G.kills} bajas (${rematados} rematados) · ${Math.round(G.time)} s · ${hits} golpes recibidos` };
}, [ch, piso]) });
for (const ch of CLASES) for (let piso = 1; piso <= 8; piso++) escenarios.push(casoClase(ch, piso));
// 1b) la misma partida con el juego en inglés: tiene que jugar exactamente igual (el idioma solo cambia los textos)
{
  const c = casoClase('knight', 3), run = c.run;
  escenarios.push({ ...c, grupo: 'idioma', id: 'en inglés juega igual (Caballero · piso 3)', refDe: c.id, locale: 'en-US', run: async pg => {
    const boton = await pg.textContent('#btnStart'), r = await run(pg);
    if (/Entrar a la cripta/.test(boton)) r.fallos.push(`la página sigue en español: «${boton}»`);
    return r;
  } });
}
// 2) cada arma a 1★, 3★ y 5★: ataque normal y cargado contra enemigos
escenarios.push({ grupo: 'armas', id: 'las armas a 1★, 3★ y 5★', seed: 777, run: async pg => pg.evaluate(() => {
  const T = window.__cripta; T.run('knight'); const G = T.state(); T.sim(2); const p = G.player, fallos = [], huella = [], cx = p.x, cy = p.y;
  for (const id of T.weapons()) for (const st of [1, 3, 5]) {
    G.enemies.length = 0; G.proj.length = 0; p.x = cx; p.y = cy;   // siempre desde el centro de la sala inicial
    ['brute', 'slime', 'archer', 'bat'].forEach((t, i) => T.spawn(t, p.x + 120 + i * 20, p.y - 40 + i * 30));
    T.weapon(id, st); p.en = p.maxEn = 999; p.hp = p.maxHp = 999;
    const k0 = G.kills, vida0 = G.enemies.reduce((a, e) => a + e.hp, 0);
    window.__bot(150, true);                       // ataque normal: el bot se acerca o se aleja según el arma
    const vida1 = G.enemies.reduce((a, e) => a + (e.dead ? 0 : Math.max(0, e.hp)), 0);
    if (G.kills === k0 && vida1 >= vida0) fallos.push(`${id} ${st}★: el ataque normal no hizo daño`);
    while (T.resolve());   // cierra elecciones pendientes (subclase, talentos...)
    G.enemies.length = 0; G.proj.length = 0; p.en = 999; p.x = cx; p.y = cy; p.aim = 0;
    ['eye', 'eye'].forEach((t, i) => T.spawn(t, p.x + 60, p.y - 20 + i * 40));   // los ojos no se mueven: blanco fijo
    const vida2 = G.enemies.reduce((a, e) => a + e.hp, 0), k2 = G.kills;
    window.__simR(70, { chg: true }); window.__simR(90); T.render();   // ataque cargado
    const vida3 = G.enemies.reduce((a, e) => a + (e.dead ? 0 : Math.max(0, e.hp)), 0);
    if (G.kills === k2 && vida3 >= vida2) fallos.push(`${id} ${st}★: el ataque cargado no hizo daño (enemigos ${G.enemies.length}, vida ${vida2}→${vida3}, energía ${Math.round(p.en)}, elección ${!!G.choice}, fin ${!!G.over})`);
    if (!Number.isFinite(p.x)) fallos.push(`${id} ${st}★: posición NaN`);
    huella.push(id + st + ':' + (G.kills - k0) + ':' + Math.round(vida1) + ':' + Math.round(vida3));
  }
  return { fallos, huella, info: `${huella.length} combinaciones` };
}) });
// 3) salas de evento: se visitan y se usan en los 8 pisos
escenarios.push({ grupo: 'salas', id: 'salas de evento en los 8 pisos', seed: 4242, run: async pg => pg.evaluate(() => {
  const T = window.__cripta; T.run('knight'); const G = T.state(), roomIds = T.roomIds; const fallos = [], vistas = {}, huella = [];
  const todas = roomIds();
  // recorre los 8 pisos y sigue generando pisos hasta haber visto todas las salas (máximo 40)
  for (let n = 0; n < 40 && (n < 8 || todas.some(k => !vistas[k])); n++) {
    const piso = n % 8 + 1; T.floor(piso); T.sim(3); const p = G.player; p.hp = p.maxHp = 99;
    for (const r of G.rooms.filter(r => r.ev)) {
      vistas[r.ev] = 1;
      for (const it of G.pickups.filter(it => it.room === r && !it.gone)) {
        T.resolve(); p.x = it.x; p.y = it.y + 30; G.cam.x = p.x; G.cam.y = p.y; T.sim(4); T.render();
        r.cleared = true; T.useIt(it); T.sim(30); T.resolve(); T.render();
      }
      window.__bot(300, true);
      huella.push(r.ev + ':' + G.enemies.length + ':' + G.pickups.length);
    }
  }
  const faltan = todas.filter(k => !vistas[k]);
  if (faltan.length) fallos.push('no aparecieron: ' + faltan.join(', '));
  return { fallos, huella, info: `salas vistas: ${Object.keys(vistas).length}` };
}) });
// 4) guardado: partida nueva, partida vieja sin versión, arma que ya no existe, versión futura
const RUN_OK = { floor: 2, char: 'knight', diff: 'normal', hp: 5, maxHp: 8, en: 100, maxEn: 100, relics: [], cur: 0, slots: [{ id: 'rusty', stars: 2, up: {} }, { id: 'club', stars: 1, up: {} }], crystals: {}, coins: 10, keys: 0, gems: 4, kills: 3, time: 50, talents: [], cu: {} };
const casoSave = (id, save, espera) => ({ grupo: 'guardado', id, seed: 9, save, run: async pg => {
  const vis = await pg.isVisible('#btnContinue'), fallos = [];
  if (vis !== espera.continuar) fallos.push(`botón Continuar ${vis ? 'visible' : 'oculto'} (se esperaba ${espera.continuar ? 'visible' : 'oculto'})`);
  if (vis) { await pg.click('#btnContinue'); await pg.evaluate(() => window.__bot(300, false)); }
  const s = await pg.evaluate(() => JSON.parse(localStorage.getItem('cripta-guardian-v1') || 'null'));
  if (save && s && s.gems !== save.gems) fallos.push(`las gemas cambiaron: ${save.gems} → ${s.gems}`);
  return { fallos, huella: [vis, s && s.ver], info: `continuar: ${vis ? 'sí' : 'no'}` };
} });
escenarios.push(casoSave('guardado de una versión vieja', { ...SAVE_BASE, gems: 37, run: RUN_OK }, { continuar: true }));
escenarios.push(casoSave('guardado con un arma que ya no existe', { ...SAVE_BASE, gems: 37, run: { ...RUN_OK, slots: [{ id: 'arma-borrada', stars: 2, up: {} }] } }, { continuar: false }));
escenarios.push(casoSave('guardado de una versión futura', { ...SAVE_BASE, gems: 37, ver: 99, run: RUN_OK }, { continuar: false }));
escenarios.push(casoSave('sin guardado', null, { continuar: false }));
// 5) los dos finales: al salir victorioso tras el piso 8 sale el final verdadero solo con el diario completo
const casoFinal = (id, notas, titulo) => ({ grupo: 'finales', id, seed: 11, save: { ...SAVE_BASE, notes: Object.fromEntries(Array.from({ length: notas }, (_, i) => [i, true])) }, run: async pg => {
  await pg.evaluate(() => { const T = window.__cripta; T.run('knight'); const G = T.state(); T.floor(8); window.__simR(2); G.wonOnce = true; G.pickups.push({ kind: 'exit', x: G.player.x, y: G.player.y }); T.use('exit'); window.__simR(240); });
  const fallos = [], vis = await pg.isVisible('#ovEpi'), t = vis ? await pg.textContent('#epiTitle') : '';
  if (!vis) fallos.push('no apareció el final');
  else if (t !== titulo) fallos.push(`salió «${t}» y tocaba «${titulo}»`);
  if (vis) { await pg.click('#btnEpiClose'); if (!await pg.isVisible('#ovEnd')) fallos.push('tras el final no aparece la pantalla de resultados'); }
  return { fallos, huella: [vis, t], info: t ? `«${t}»` : '' };
} });
escenarios.push(casoFinal('final verdadero con el diario completo', 9, 'El círculo roto'));
escenarios.push(casoFinal('final incompleto con 5 notas', 5, 'Otro turno'));
// 6) Círculos del Abismo: ganar abre el siguiente; con el quinto elegido las reglas se notan
escenarios.push({ grupo: 'circulos', id: 'ganar abre el primer círculo', seed: 12, run: async pg => {
  await pg.evaluate(() => { const T = window.__cripta; T.run('knight'); const G = T.state(); T.floor(8); window.__simR(2); G.pickups.push({ kind: 'exit', x: G.player.x, y: G.player.y }); T.use('exit'); window.__simR(240); });
  const s = await pg.evaluate(() => JSON.parse(localStorage.getItem('cripta-guardian-v1') || 'null')), fallos = [];
  if (!s || s.circ !== 1) fallos.push(`tras ganar el círculo abierto es ${s && s.circ} (se esperaba 1)`);
  return { fallos, huella: [s && s.circ], info: `círculo abierto: ${s && s.circ}` };
} });
escenarios.push({ grupo: 'circulos', id: 'el quinto círculo endurece la partida', seed: 13, save: { ...SAVE_BASE, circ: 5, circSel: 5 }, run: async pg => {
  const r = await pg.evaluate(() => { const T = window.__cripta; T.run('knight'); const G = T.state(); window.__simR(2); return { circ: G.circ, hp: G.dx.hp, rate: G.dx.rate, gem: G.dx.gem }; });
  const fallos = [];
  if (r.circ !== 5) fallos.push(`la partida empezó en el círculo ${r.circ}`);
  if (!(r.hp >= 1.19 && r.rate >= 1.11 && r.gem >= 2.24)) fallos.push(`reglas sin aplicar: vida ×${r.hp}, ritmo ×${r.rate}, gemas ×${r.gem}`);
  return { fallos, huella: [r.circ, +r.hp.toFixed(2), +r.rate.toFixed(2), r.gem], info: `vida ×${r.hp.toFixed(2)}, gemas ×${r.gem}` };
} });

// ---------- traducir «cripta.html:línea» al archivo de src/ donde está ese código ----------
const mapa = (() => {
  let linea = fs.readFileSync(JUEGO, 'utf8').split('\n').indexOf('<script>') + 2;   // primera línea de JS (contando desde 1)
  return require('../build.js').partes().map(({ nombre, texto }) => { const n = texto.split('\n').length - 1, ini = linea; linea += n; return { f: nombre, ini, fin: linea - 1 }; });
})();
const dondeEsta = msg => msg.replace(/(?:file:\/\/[^\s)]*\/)?cripta\.html:(\d+)(?::\d+)?/g, (m, l) => { const x = mapa.find(x => +l >= x.ini && +l <= x.fin); return x ? `${x.f}:${+l - x.ini + 1}` : m; });
const errorCorto = err => { const st = (err.stack || err.message || String(err)).split('\n'); const at = st.find(l => /cripta\.html:\d+/.test(l)); return dondeEsta(st[0] + (at ? ' (en ' + at.trim().replace(/^at /, '') + ')' : '')); };

// ---------- ejecución ----------
// pruebas/balance.js reutiliza el entorno y el bot
module.exports = { preparar, BOT, SAVE_BASE };
if (require.main === module) (async () => {
  if (!fs.existsSync(JUEGO)) { console.error('No existe cripta.html: ejecuta node juego/build.js'); process.exit(2); }
  const lista = escenarios.filter(e => !grupo || e.grupo === grupo);
  const ref = fs.existsSync(REF) ? JSON.parse(fs.readFileSync(REF, 'utf8')) : {};
  const nueva = grupo ? { ...ref } : {}, browser = await chromium.launch(), t0 = Date.now();
  const resultados = new Array(lista.length);
  let siguiente = 0;
  const trabajador = async () => {
    while (siguiente < lista.length) {
      const i = siguiente++, e = lista[i];
      const ctx = await browser.newContext({ viewport: { width: 1000, height: 700 }, locale: e.locale || 'es-ES' }), pg = await ctx.newPage(), errores = [];
      pg.on('pageerror', err => errores.push(errorCorto(err)));
      await pg.addInitScript(preparar, { seed: e.seed, save: e.save === undefined ? SAVE_BASE : e.save });
      let r;
      try {
        await pg.goto('file://' + JUEGO); await pg.evaluate(BOT); await pg.evaluate(() => window.__frame());
        if (e.grupo !== 'guardado') await pg.click('#btnStart');
        r = await e.run(pg);
      } catch (err) { r = { fallos: ['la prueba se detuvo: ' + dondeEsta(err.message.split('\n').slice(0, 3).join(' ').replace(/\s+/g, ' '))], huella: null, info: '' }; }
      await ctx.close();
      for (const m of errores) r.fallos.push('error de JavaScript: ' + m);
      const h = r.huella ? crypto.createHash('md5').update(JSON.stringify(r.huella)).digest('hex').slice(0, 12) : null;
      const id = e.refDe || e.id;   // refDe: se compara con la referencia de otra prueba
      resultados[i] = { e, r, h, cambio: ref[id] && h && ref[id] !== h };
      if (guardarRef && h && !e.refDe) nueva[e.id] = h;
      process.stdout.write(r.fallos.length ? '✗' : '·');
    }
  };
  await Promise.all([trabajador(), trabajador(), trabajador(), trabajador()]);
  await browser.close();
  console.log('\n');
  let fallidas = 0, cambiadas = 0;
  for (const { e, r, cambio } of resultados) {
    const ok = !r.fallos.length; if (!ok) fallidas++; if (cambio) cambiadas++;
    console.log(`${ok ? '✓' : '✗'} [${e.grupo}] ${e.id}${r.info ? ' — ' + r.info : ''}${cambio ? '  (cambió respecto a la referencia)' : ''}`);
    for (const f of r.fallos) console.log('    · ' + f);
  }
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas bien · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (guardarRef) { fs.writeFileSync(REF, JSON.stringify(nueva, null, 1) + '\n'); console.log('Referencia guardada en pruebas/referencia.json'); }
  else if (!Object.keys(ref).length) console.log('Aún no hay referencia: ejecuta con --referencia para guardarla.');
  else if (cambiadas) console.log(`${cambiadas} partidas jugaron distinto que en la referencia. Si el cambio era buscado, guarda la nueva con --referencia.`);
  else console.log('Todas las partidas jugaron igual que en la referencia.');
  process.exit(fallidas ? 1 : 0);
})();
