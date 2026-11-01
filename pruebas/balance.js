// Balance con bots: juega muchas partidas sin trampas y escribe pruebas/informe-balance.md.
// Uso: node pruebas/balance.js            (6 partidas por clase y piso: unos 5 minutos)
//      node pruebas/balance.js 12         (más partidas = resultados más fiables, más tiempo)
//      node pruebas/balance.js armas      (solo las armas)
// Qué mide:
//  - clases: cada clase juega cada piso desde la entrada (salas de combate, subjefe y jefe) con
//    la vida y la energía normales y el equipo típico de ese piso. Cuenta cuántas veces llega al
//    final, en qué sala cae y qué la derrota.
//  - armas: cada arma a 3★, en manos de la clase que la domina, contra el mismo grupo de enemigos
//    del piso 4. Mide el daño por segundo con la energía normal (si se queda sin energía, se nota).
// El bot no recoge botín, no compra ni elige bien las mejoras: juega peor que una persona. Sirve
// para COMPARAR clases, pisos y armas entre sí, no como la dificultad real.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { preparar, BOT, SAVE_BASE } = require('./probar.js');
const JUEGO = 'file://' + path.join(__dirname, '..', 'cripta.html');
const SALIDA = path.join(__dirname, 'informe-balance.md');
const args = process.argv.slice(2), N = +args.find(a => /^\d+$/.test(a)) || 6, solo = args.find(a => /^[a-z]+$/.test(a));
const CLASES = ['knight', 'archer', 'rogue'], NOMBRE = { knight: 'Caballero', archer: 'Tirador', rogue: 'Asesino' };

const jugarPiso = ([ch, piso]) => {
  // el bot es inmortal: se mide cuánta vida le habría hecho falta (no si gana), que depende menos de lo bien que juega
  const T = window.__cripta; T.run(ch); const G = T.state(); T.floor(piso); const p = G.player; T.sim(2);
  const st = Math.min(5, 1 + Math.floor(piso / 2));
  T.weapon(p.slots[p.cur].id, st);
  if (piso >= 3) { const w = p.slots[p.cur]; w.el = 'fire'; w.elC = 3; w.elLv = 1; w.elOn = true; }
  const salas = G.rooms.filter(r => r.type === 'combat').sort((a, b) => a.depth - b.depth);
  const dano = { sala: 0, subjefe: 0, jefe: 0 }, tiempo = { sala: 0, subjefe: 0, jefe: 0 }, por = {};
  let atascadas = 0;
  for (const r of [...salas, 'jefe']) {
    if (r === 'jefe') T.toBoss(); else { if (r.cleared) continue; p.x = r.cx; p.y = r.cy; G.cam.x = p.x; G.cam.y = p.y; }
    const sala = r === 'jefe' ? G.bossRoom : r, tipo = r === 'jefe' ? 'jefe' : r.sub ? 'subjefe' : 'sala', t0 = G.time;
    for (let k = 0; k < (r === 'jefe' ? 16 : 8) && !sala.cleared && !G.over; k++) {
      const b = window.__bot(600, true);
      dano[tipo] += b.dano; for (const q in b.por) por[q] = (por[q] || 0) + b.por[q];
      if (!sala.locked && !sala.cleared && !G.enemies.some(e => !e.dead && !e.ally && !e.stray)) { p.x = sala.cx; p.y = sala.cy; }
    }
    tiempo[tipo] += G.time - t0;
    if (!sala.cleared) { atascadas++; for (const e of G.enemies.filter(e => !e.dead && !e.ally)) T.kill(e); T.sim(120); while (T.resolve()); }
  }
  return { dano, tiempo, por, maxHp: p.maxHp, salas: salas.length, atascadas };
};

const probarArma = ([id, ch, blanco]) => {
  const T = window.__cripta; T.run(ch); const G = T.state(); T.floor(4); T.sim(2);
  const p = G.player, r = G.rooms.filter(r => r.type === 'combat').sort((a, b) => a.depth - b.depth)[0];
  for (const x of G.rooms) { x.cleared = true; x.locked = false; }
  p.x = r.cx; p.y = r.cy; G.cam.x = p.x; G.cam.y = p.y; G.enemies.length = 0; G.markers.length = 0;
  T.weapon(id, 3); p.en = p.maxEn;
  // blanco: dos ojos quietos a media distancia (daño puro, sin fallar por puntería) y energía infinita;
  // grupo: seis enemigos que se mueven y atacan, con la energía normal
  if (blanco) [-1, 1].forEach(k => T.spawn('eye', p.x + 110, p.y + k * 30));
  else ['brute', 'warden', 'archer', 'slime', 'bat', 'charger'].forEach((t, i) => T.spawn(t, p.x + Math.cos(i) * 160, p.y + Math.sin(i) * 160));
  const vida0 = G.enemies.reduce((a, e) => a + e.hp, 0), t0 = G.time;
  let f = 0;
  for (; f < 1800 && G.enemies.some(e => !e.dead); f += 60) { if (blanco) p.en = p.maxEn; window.__bot(60, true); while (T.resolve()); }
  const vida1 = G.enemies.reduce((a, e) => a + (e.dead ? 0 : Math.max(0, e.hp)), 0), seg = Math.max(1, G.time - t0);
  return { dps: (vida0 - vida1) / seg, todos: !G.enemies.some(e => !e.dead), seg: Math.round(seg), energia: Math.round(100 * p.en / p.maxEn) };
};

(async () => {
  const nav = await chromium.launch(), t0 = Date.now();
  const tareas = [];
  let info = null;
  if (!solo || solo === 'clases') for (const ch of CLASES) for (let piso = 1; piso <= 8; piso++) for (let s = 1; s <= N; s++) tareas.push({ tipo: 'clase', ch, piso, seed: 1000 * piso + 37 * s + ch.length });
  const abrir = async seed => {
    const ctx = await nav.newContext({ viewport: { width: 1000, height: 700 } }), pg = await ctx.newPage();
    await pg.addInitScript(preparar, { seed, save: SAVE_BASE });
    await pg.goto(JUEGO); await pg.evaluate(BOT); await pg.evaluate(() => window.__frame()); await pg.click('#btnStart');
    return { ctx, pg };
  };
  if (!solo || solo === 'armas') {
    const { ctx, pg } = await abrir(1); info = await pg.evaluate(() => window.__cripta.weaponInfo()); await ctx.close();
    for (const w of info) for (let s = 1; s <= 3; s++) for (const sl of [true, false]) tareas.push({ tipo: 'arma', w, ch: w.fam || 'knight', seed: 500 + s, sl: sl });
  }
  const res = [];
  let i = 0;
  const trabajador = async () => {
    while (i < tareas.length) {
      const t = tareas[i++], { ctx, pg } = await abrir(t.seed);
      try { t.r = t.tipo === 'clase' ? await pg.evaluate(jugarPiso, [t.ch, t.piso]) : await pg.evaluate(probarArma, [t.w.id, t.ch, t.sl]); res.push(t); }
      catch (e) { console.error('\n' + (t.tipo === 'clase' ? `${t.ch} piso ${t.piso}` : t.w.id) + ': ' + e.message.split('\n')[0]); }
      await ctx.close();
      if (res.length % 10 === 0) process.stdout.write(`\r${res.length}/${tareas.length}`);
    }
  };
  await Promise.all([1, 2, 3, 4].map(trabajador));
  await nav.close();

  const pct = x => Math.round(100 * x) + ' %', md = [];
  md.push('# Informe de balance', '', `Generado por \`node pruebas/balance.js ${args.join(' ')}\`.`, '',
    'El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.', '');
  const C = res.filter(t => t.tipo === 'clase');
  if (C.length) {
    const barras = (h, k) => h.reduce((a, t) => a + (k ? t.r.dano[k] : t.r.dano.sala + t.r.dano.subjefe + t.r.dano.jefe) / t.r.maxHp, 0) / h.length;
    md.push('## Dificultad por piso', '', `El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de ${N} partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.`, '',
      '| Piso | ' + CLASES.map(c => NOMBRE[c]).join(' | ') + ' | Salas | Subjefe | Jefe |', '|---|' + CLASES.map(() => '---|').join('') + '---|---|---|');
    for (let piso = 1; piso <= 8; piso++) {
      const h = C.filter(t => t.piso === piso);
      md.push(`| ${piso} | ` + CLASES.map(ch => { const x = h.filter(t => t.ch === ch); return x.length ? barras(x).toFixed(1) : '·'; }).join(' | ') + ` | ${barras(h, 'sala').toFixed(1)} | ${barras(h, 'subjefe').toFixed(1)} | ${barras(h, 'jefe').toFixed(1)} |`);
    }
    md.push('', '| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |', '|---|---|---|---|');
    for (const ch of CLASES) {
      const h = C.filter(t => t.ch === ch);
      md.push(`| ${NOMBRE[ch]} | ${barras(h).toFixed(1)} | ${(h.reduce((a, t) => a + t.r.tiempo.sala + t.r.tiempo.subjefe + t.r.tiempo.jefe, 0) / h.length / 60).toFixed(1)} | ${h.reduce((a, t) => a + t.r.atascadas, 0)} |`);
    }
    const por = {}; let tot = 0; for (const t of C) for (const q in t.r.por) { por[q] = (por[q] || 0) + t.r.por[q]; tot += t.r.por[q]; }
    md.push('', '### Quién hace más daño', '', ...Object.entries(por).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `- ${k}: ${Math.round(100 * v / tot)} % del daño recibido`));
  }
  const A = res.filter(t => t.tipo === 'arma');
  if (A.length) {
    const por = {}; for (const t of A) { const x = por[t.w.id] = por[t.w.id] || { w: t.w, ch: t.ch, r: [], q: [] }; (t.sl ? x.r : x.q).push(t.r); }
    const media = (xs, k) => xs.reduce((a, r) => a + r[k], 0) / xs.length;
    const filas = Object.values(por).map(x => ({ ...x, dps: media(x.r, 'dps'), real: media(x.q, 'dps'), todos: x.q.filter(r => r.todos).length, en: Math.round(media(x.q, 'energia')) }))
      .sort((a, b) => b.dps - a.dps);
    const med = [...filas].sort((a, b) => a.dps - b.dps)[Math.floor(filas.length / 2)].dps;
    md.push('', '## Armas a 3★ (piso 4)', '', `Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: ${med.toFixed(1)}. Marcadas: contra un blanco, más de 1,6× (⬆) o menos de 0,6× (⬇) la mediana.`, '',
      '| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |', '|---|---|---|---|---|---|---|---|');
    for (const f of filas) { const k = f.dps / med, m = k > 1.6 ? ' ⬆' : k < .6 ? ' ⬇' : '';
      md.push(`| ${f.w.n}${m} | ${f.w.r} | ${NOMBRE[f.ch]} | ${f.dps.toFixed(1)} | ${k.toFixed(2)} | ${f.real.toFixed(1)} | ${f.todos}/${f.q.length} | ${f.en} % |`); }
  }
  md.push('', `_${res.length} partidas en ${Math.round((Date.now() - t0) / 1000)} s._`, '');
  fs.writeFileSync(SALIDA, md.join('\n'));
  console.log(`\nInforme escrito en pruebas/informe-balance.md (${res.length} partidas, ${Math.round((Date.now() - t0) / 1000)} s)`);
})();
