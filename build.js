// Une los módulos de src/ en un solo cripta.html listo para publicar.
// Uso: node build.js            (escribe cripta.html junto a este archivo)
//      node build.js --check    (solo comprueba que cripta.html está al día)
//      node dev.js              (servidor de desarrollo: reconstruye y recarga el juego al guardar)
//
// Cada archivo de src/js/ es un módulo ES: dice con «import» qué usa de otros archivos y con «export»
// qué ofrece. El build revisa que todo cuadre (lo importado existe, nada se usa sin importarlo, nadie
// reasigna una variable importada) y luego une los archivos en el orden de su número (00, 01, 01a...).
// Una carpeta numerada (como 01b-enemigos/) se une en ese lugar con sus archivos en orden alfabético.
// ¿Por qué no un empaquetador como esbuild? Esbuild ordena los módulos según quién importa a quién y
// convierte «const» en «var»: con tantas dependencias cruzadas, un valor podría leerse antes de crearse
// y quedar undefined sin ningún error. Unir en orden numérico deja el juego exactamente igual que antes.
// Los archivos de datos de src/datos/ (pisos, oleadas, botín) se comprueban y se convierten
// en «const DATOS = {...}», que los módulos importan de '../datos/index.js'.
const fs = require('fs'), path = require('path');
const dir = __dirname, src = path.join(dir, 'src'), jsDir = path.join(src, 'js'), datDir = path.join(src, 'datos');
const read = f => fs.readFileSync(path.join(src, f), 'utf8');

// JSON con comentarios: quita lo que va detrás de // (fuera de las comillas)
function sinComentarios(t) {
  let out = '', enTexto = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (enTexto) { out += c; if (c === '\\') out += t[++i]; else if (c === '"') enTexto = false; }
    else if (c === '"') { enTexto = true; out += c; }
    else if (c === '/' && t[i + 1] === '/') { while (i < t.length && t[i] !== '\n') i++; out += '\n'; }
    else out += c;
  }
  return out;
}
function leerDatos(f) {
  const t = sinComentarios(fs.readFileSync(path.join(datDir, f), 'utf8'));
  try { return JSON.parse(t); }
  catch (e) {
    const m = /position (\d+)/.exec(e.message), lin = m ? t.slice(0, +m[1]).split('\n').length : '?';
    throw new Error(`src/datos/${f}, línea ${lin}: ${e.message}. Revisa comas, comillas y llaves.`);
  }
}
// ids que existen en una carpeta de contenido (lo que se registra con defEnemy('id', ...), etc.)
const idsDe = (carpeta, fn) => new Set(fs.readdirSync(path.join(jsDir, carpeta)).flatMap(f =>
  [...fs.readFileSync(path.join(jsDir, carpeta, f), 'utf8').matchAll(new RegExp(fn + "\\('([\\w-]+)'", 'g'))].map(m => m[1])));
// ---------- esquemas de los datos (src/datos/esquemas/*.schema.json) ----------
// Dicen qué campos lleva cada archivo, de qué tipo y entre qué valores. El editor (VS Code) los usa para
// autocompletar y subrayar errores mientras escribes; el build los usa para no dejar pasar un dato mal puesto.
const esquema = n => JSON.parse(fs.readFileSync(path.join(datDir, 'esquemas', n + '.schema.json'), 'utf8'));
const ESQUEMAS = { piso: 'pisos/*.jsonc', oleadas: 'oleadas.jsonc', botin: 'botin.jsonc', finales: 'finales.jsonc' };
const tipoDe = v => Array.isArray(v) ? 'una lista' : v === null ? 'null' : typeof v === 'object' ? 'un objeto' : typeof v === 'string' ? 'un texto' : typeof v === 'number' ? 'un número' : typeof v === 'boolean' ? 'true o false' : typeof v;
function validar(v, S, donde, fallos) {
  const at = donde ? `"${donde}"` : 'el archivo', mal = m => fallos.push(`${at} ${m}`);
  if (S.enum && !S.enum.includes(v)) return mal(`tiene que ser uno de: ${S.enum.join(', ')} (es ${JSON.stringify(v)})`);
  const T = { object: x => x && typeof x === 'object' && !Array.isArray(x), array: Array.isArray, string: x => typeof x === 'string',
    number: x => typeof x === 'number' && isFinite(x), integer: Number.isInteger, boolean: x => typeof x === 'boolean' };
  const NOMBRE = { object: 'un objeto { }', array: 'una lista [ ]', string: 'un texto entre comillas', number: 'un número', integer: 'un número entero', boolean: 'true o false' };
  if (S.type && !T[S.type](v)) return mal(`tiene que ser ${NOMBRE[S.type]} (es ${tipoDe(v)})`);
  if (typeof v === 'number') {
    if (S.minimum !== undefined && v < S.minimum) mal(`no puede ser menor que ${S.minimum} (es ${v})`);
    if (S.maximum !== undefined && v > S.maximum) mal(`no puede ser mayor que ${S.maximum} (es ${v})`);
  }
  if (typeof v === 'string') {
    if (S.minLength && v.length < S.minLength) mal('no puede estar vacío');
    if (S.pattern && !new RegExp(S.pattern).test(v)) mal(`no tiene el formato correcto: ${S.description || S.pattern} (es "${v}")`);
  }
  if (Array.isArray(v)) {
    if (S.minItems !== undefined && v.length < S.minItems) mal(S.minItems === S.maxItems ? `tiene que tener ${S.minItems} valores` : `tiene que tener al menos ${S.minItems} valor${S.minItems > 1 ? 'es' : ''}`);
    else if (S.maxItems !== undefined && v.length > S.maxItems) mal(S.minItems === S.maxItems ? `tiene que tener ${S.maxItems} valores` : `no puede tener más de ${S.maxItems} valores`);
    if (S.items) v.forEach((x, i) => validar(x, S.items, `${donde}[${i}]`, fallos));
  }
  if (T.object(v)) {
    const props = S.properties || {};
    for (const k of S.required || []) if (!(k in v)) fallos.push(`falta "${donde ? donde + '.' : ''}${k}"` + (props[k] && props[k].description ? ` (${props[k].description})` : ''));
    for (const [k, x] of Object.entries(v)) {
      const sub = donde ? donde + '.' + k : k;
      if (S.propertyNames && S.propertyNames.enum && !S.propertyNames.enum.includes(k)) fallos.push(`"${sub}" no es válido aquí; tiene que ser uno de: ${S.propertyNames.enum.join(', ')}`);
      else if (props[k]) validar(x, props[k], sub, fallos);
      else if (S.additionalProperties === false) fallos.push(`"${sub}" no es un campo conocido (¿error de escritura?). Los campos son: ${Object.keys(props).join(', ')}`);
      else if (typeof S.additionalProperties === 'object') validar(x, S.additionalProperties, sub, fallos);
    }
  }
}
// tipos de TypeScript a partir de los esquemas → src/datos/index.d.ts (así el editor sabe qué hay en DATOS)
function tipoTs(S, ind) {
  const sp = '  '.repeat(ind);
  if (S.enum) return S.enum.map(x => JSON.stringify(x)).join(' | ');
  if (S.type === 'array') { const t = tipoTs(S.items, ind); return S.minItems && S.minItems === S.maxItems && S.minItems <= 5 ? `[${Array(S.minItems).fill(t).join(', ')}]` : `${/[|]/.test(t) ? `(${t})` : t}[]`; }
  if (S.type === 'object') {
    if (!S.properties) return `Record<${S.propertyNames && S.propertyNames.enum ? S.propertyNames.enum.map(x => JSON.stringify(x)).join(' | ') : 'string'}, ${S.additionalProperties ? tipoTs(S.additionalProperties, ind) : 'any'}>`;
    const req = new Set(S.required || []);
    return '{\n' + Object.entries(S.properties).map(([k, x]) => (x.description ? `${sp}  /** ${x.description} */\n` : '') + `${sp}  ${k}${req.has(k) ? '' : '?'}: ${tipoTs(x, ind + 1)};\n`).join('') + sp + '}';
  }
  return { string: 'string', number: 'number', integer: 'number', boolean: 'boolean' }[S.type] || 'any';
}
function tiposDatos() {
  const nom = { piso: 'Piso', oleadas: 'Oleadas', botin: 'Botin', finales: 'Finales' };
  return '// GENERADO por build.js a partir de src/datos/esquemas/: no lo edites a mano.\n' +
    '// Es el tipo de DATOS, para que el editor autocomplete DATOS.pisos[0].luz.clara, etc.\n\n' +
    Object.entries(nom).map(([k, N]) => { const S = esquema(k); return `/** ${S.title} */\nexport interface ${N} ${tipoTs(S, 0)}\n\n`; }).join('') +
    'export const DATOS: { pisos: Piso[]; oleadas: Oleadas; botin: Botin; finales: Finales };\n';
}

function datos() {
  const pisos = fs.readdirSync(path.join(datDir, 'pisos')).filter(f => f.endsWith('.jsonc')).sort()
    .map(f => ({ f: 'pisos/' + f, d: leerDatos('pisos/' + f) })).sort((a, b) => a.d.piso - b.d.piso);
  const enemigos = idsDe('01b-enemigos', 'defEnemy'), jefes = idsDe('01e-jefes', 'defBoss'), fallos = [];
  const revisar = (f, d, S) => { const fs_ = []; validar(d, S, '', fs_); fs_.forEach(m => fallos.push(`src/datos/${f}: ${m}`)); };
  const Spiso = esquema('piso');
  pisos.forEach(({ f, d }, i) => {
    revisar(f, d, Spiso);
    if (d.piso !== i + 1) fallos.push(`src/datos/${f}: "piso" es ${d.piso}, pero tocaba el ${i + 1} (los pisos van del 1 al ${pisos.length} sin saltos)`);
    for (const k of ['enemigosCerca', 'enemigosLejos']) if (Array.isArray(d[k]))
      for (const id of d[k]) if (!enemigos.has(id)) fallos.push(`src/datos/${f}: el enemigo "${id}" de "${k}" no existe en src/js/01b-enemigos/`);
    if (typeof d.jefe === 'string' && !jefes.has(d.jefe)) fallos.push(`src/datos/${f}: el jefe "${d.jefe}" no existe en src/js/01e-jefes/`);
  });
  if (pisos.length !== 8) fallos.push(`src/datos/pisos/ tiene ${pisos.length} pisos; el juego necesita 8 (los subjefes y la historia van por piso)`);
  const otros = {};
  for (const k of ['oleadas', 'botin', 'finales']) { otros[k] = leerDatos(k + '.jsonc'); revisar(k + '.jsonc', otros[k], esquema(k)); }
  if (fallos.length) throw new Error('Datos con errores:\n  ' + fallos.join('\n  '));
  return { pisos: pisos.map(p => p.d), ...otros };
}

// ---------- módulos ----------
const acorn = require('acorn'), escope = require('eslint-scope');
// lo que el código puede usar sin importarlo porque lo da el navegador (si usas algo nuevo del navegador, añádelo aquí)
const GLOBALES = new Set(('Array Boolean Date Error JSON Map Math Number Object ResizeObserver Set String Uint8Array ' +
  'addEventListener console document localStorage matchMedia parseInt performance requestAnimationFrame setTimeout undefined window').split(' '));
const DATOS_MOD = path.join(datDir, 'index.js');   // no existe en disco: es el módulo «virtual» con DATOS

function archivosJs() {
  const files = [];
  for (const f of fs.readdirSync(jsDir).filter(f => /^\d+[a-z]?-/.test(f)).sort()) {
    if (fs.statSync(path.join(jsDir, f)).isDirectory()) files.push(...fs.readdirSync(path.join(jsDir, f)).filter(g => g.endsWith('.js')).sort().map(g => path.join(f, g)));
    else if (f.endsWith('.js')) files.push(f);
  }
  return files;
}
// Lee y revisa todos los módulos. Devuelve [{ nombre, texto }] con el texto ya sin import/export
// (cada import/export se cambia por líneas en blanco, así los números de línea siguen siendo los del archivo).
function modulos() {
  const files = archivosJs(), fallos = [], info = new Map();
  for (const f of files) {
    const abs = path.join(jsDir, f), nombre = 'src/js/' + f.split(path.sep).join('/'), texto = fs.readFileSync(abs, 'utf8');
    let ast;
    try { ast = acorn.parse(texto, { ecmaVersion: 'latest', sourceType: 'module', ranges: true, locations: true }); }
    catch (e) { fallos.push(`${nombre}:${e.loc ? e.loc.line : '?'}: error de sintaxis: ${e.message.replace(/ \(\d+:\d+\)$/, '')}`); continue; }
    info.set(abs, { nombre, texto, ast, exports: new Set(), imports: [] });
  }
  // qué exporta cada archivo y qué importa
  for (const [abs, m] of info) for (const n of m.ast.body) {
    if (n.type === 'ExportNamedDeclaration') {
      if (n.source) fallos.push(`${m.nombre}:${n.loc.start.line}: «export ... from» no está soportado; importa y exporta por separado`);
      if (n.declaration) {
        const d = n.declaration;
        if (d.type === 'VariableDeclaration') d.declarations.forEach(x => x.id.type === 'Identifier' ? m.exports.add(x.id.name) : fallos.push(`${m.nombre}:${n.loc.start.line}: exporta variables una por una (sin desestructurar)`));
        else m.exports.add(d.id.name);
      }
      for (const sp of n.specifiers) { if (sp.local.name !== sp.exported.name) fallos.push(`${m.nombre}:${n.loc.start.line}: «export { a as b }» no está soportado`); m.exports.add(sp.exported.name); }
    } else if (n.type === 'ExportDefaultDeclaration' || n.type === 'ExportAllDeclaration') fallos.push(`${m.nombre}:${n.loc.start.line}: usa «export { nombre }» (no export default ni export *)`);
    else if (n.type === 'ImportDeclaration') m.imports.push(n);
  }
  for (const [abs, m] of info) {
    for (const n of m.imports) {
      const destino = path.resolve(path.dirname(abs), n.source.value);
      for (const sp of n.specifiers) {
        if (sp.type !== 'ImportSpecifier' || sp.imported.name !== sp.local.name) { fallos.push(`${m.nombre}:${n.loc.start.line}: usa «import { nombre } from '...'» (sin «as», default ni *)`); continue; }
        const nom = sp.imported.name;
        if (destino === DATOS_MOD) { if (nom !== 'DATOS') fallos.push(`${m.nombre}:${n.loc.start.line}: '${n.source.value}' solo exporta DATOS`); continue; }
        const otro = info.get(destino);
        if (!otro) fallos.push(`${m.nombre}:${n.loc.start.line}: el archivo '${n.source.value}' no existe`);
        else if (!otro.exports.has(nom)) fallos.push(`${m.nombre}:${n.loc.start.line}: ${otro.nombre} no exporta «${nom}»` + ([...info.values()].find(o => o.exports.has(nom)) ? ` (lo exporta ${[...info.values()].find(o => o.exports.has(nom)).nombre})` : ''));
      }
    }
    // nada sin importar, y nada importado se reasigna
    const sm = escope.analyze(m.ast, { ecmaVersion: 2022, sourceType: 'module' }), ms = sm.scopes.find(s => s.type === 'module');
    const vistos = new Set();
    for (const r of ms.through) {
      const n = r.identifier.name;
      if (GLOBALES.has(n) || vistos.has(n)) continue; vistos.add(n);
      const quien = [...info.values()].find(o => o.exports.has(n));
      fallos.push(`${m.nombre}:${r.identifier.loc.start.line}: usas «${n}» sin importarlo` + (quien ? ` (añade «${n}» al import de '${path.relative(path.dirname(abs), path.join(src, '..', quien.nombre)).split(path.sep).join('/').replace(/^(?!\.)/, './')}')` : n === 'DATOS' ? ` (import { DATOS } from '${path.relative(path.dirname(abs), DATOS_MOD).split(path.sep).join('/')}')` : ' (no existe en ningún archivo: ¿un error de escritura?)'));
    }
    for (const v of ms.variables) if (v.defs.some(d => d.type === 'ImportBinding')) for (const r of v.references) if (r.isWrite())
      fallos.push(`${m.nombre}:${r.identifier.loc.start.line}: no se puede cambiar «${v.name}» desde otro archivo (un import es de solo lectura); usa la función set${v.name[0].toUpperCase() + v.name.slice(1)}() que exporta su archivo`);
  }
  revisarContenido(info, fallos);
  if (fallos.length) throw new Error('Módulos con errores:\n  ' + fallos.join('\n  '));
  // quitar import/export dejando las mismas líneas
  return [...info.values()].map(m => {
    let t = m.texto;
    const cortes = [];
    for (const n of m.ast.body) {
      if (n.type === 'ImportDeclaration' || (n.type === 'ExportNamedDeclaration' && !n.declaration)) cortes.push([n.range[0], n.range[1], t.slice(n.range[0], n.range[1]).replace(/[^\n]/g, '')]);
      else if (n.type === 'ExportNamedDeclaration') cortes.push([n.range[0], n.declaration.range[0], '']);
    }
    for (const [a, b, r] of cortes.reverse()) t = t.slice(0, a) + r + t.slice(b);
    return { nombre: m.nombre, texto: t };
  });
}

// Lo que TypeScript no puede comprobar: que los ids a los que apunta el contenido existan
// (el enemigo que invoca un jefe, los ataques de cada fase...) y que no haya dos con el mismo id.
function revisarContenido(info, fallos) {
  const defs = {}, DEF = ['defEnemy', 'defWeapon', 'defRoom', 'defBoss', 'defSub', 'defBossMove', 'defSubMove'];
  DEF.forEach(k => defs[k] = new Map());
  for (const m of info.values()) for (const n of m.ast.body) {
    const c = n.type === 'ExpressionStatement' && n.expression.type === 'CallExpression' ? n.expression : null;
    if (!c || c.callee.type !== 'Identifier' || !DEF.includes(c.callee.name) || !c.arguments[0] || c.arguments[0].type !== 'Literal') continue;
    const id = c.arguments[0].value, def = c.arguments[1], linea = `${m.nombre}:${n.loc.start.line}`;
    if (defs[c.callee.name].has(id)) fallos.push(`${linea}: ya hay un ${c.callee.name}('${id}') en ${defs[c.callee.name].get(id).linea.split(':')[0]}; cada id tiene que ser único`);
    else defs[c.callee.name].set(id, { def, linea });
  }
  const prop = (o, k) => o && o.type === 'ObjectExpression' && (o.properties.find(p => p.key && (p.key.name || p.key.value) === k) || {}).value;
  const texto = v => v && v.type === 'Literal' && typeof v.value === 'string' ? v.value : null;
  const lista = v => v && v.type === 'ArrayExpression' ? v.elements.map(texto).filter(x => x !== null) : [];
  const existe = (tipo, id, linea, campo, carpeta) => { if (id !== null && !defs[tipo].has(id)) fallos.push(`${linea}: "${campo}" apunta a '${id}', que no existe en src/js/${carpeta}/`); };
  for (const [id, { def, linea }] of defs.defEnemy) existe('defEnemy', texto(prop(def, 'ia')), linea, 'ia', '01b-enemigos');
  for (const [id, { def, linea }] of defs.defBoss) {
    const d = prop(def, 'datos');
    existe('defEnemy', texto(prop(d, 'minion')), linea, 'minion', '01b-enemigos');
    existe('defBoss', texto(prop(d, 'look')), linea, 'look', '01e-jefes');
    for (const f of ['p1', 'p2', 'p3']) for (const x of lista(prop(d, f))) existe('defBossMove', x, linea, f, '01g-ataques-de-jefe');
  }
  const pisos = new Map();
  for (const [id, { def, linea }] of defs.defSub) {
    const d = prop(def, 'datos'), piso = prop(def, 'piso');
    existe('defEnemy', texto(prop(d, 'minion')), linea, 'minion', '01b-enemigos');
    for (const f of ['p1', 'p2']) for (const x of lista(prop(d, f))) existe('defSubMove', x, linea, f, '01h-ataques-de-subjefe');
    if (piso && piso.type === 'Literal') { if (pisos.has(piso.value)) fallos.push(`${linea}: el piso ${piso.value} ya tiene subjefe ('${pisos.get(piso.value)}'); hay uno por piso`); pisos.set(piso.value, id); }
  }
  for (const [k, carpeta] of [['defBossMove', '01g-ataques-de-jefe'], ['defSubMove', '01h-ataques-de-subjefe']])
    for (const [id, { def, linea }] of defs[k]) existe(k, texto(def), linea, 'copia de', carpeta);
}

// las partes de cripta.html en orden: { nombre, texto } (pruebas/probar.js las usa para saber en qué archivo falló algo)
function partes() {
  const out = modulos();
  out.unshift({ nombre: 'build.js (inicio del juego)', texto: "(() => {\n'use strict';\n" });
  out.splice(2, 0, { nombre: 'src/datos/ (generado)', texto: `const DATOS = ${JSON.stringify(datos())};\n` });
  out.push({ nombre: 'build.js (fin del juego)', texto: '})();\n' });
  return out;
}
function html() {
  const js = partes().map(p => p.texto).join('').replace(/\n$/, '');
  const css = read('estilos.css').replace(/\n$/, '');
  return read('pagina.html').replace('@@CSS@@', () => css).replace('@@JS@@', () => js);
}
// cripta.html no trae <!doctype> ni <head>: el visor de artifacts de Claude lo envuelve en una página completa.
// Para servirlo suelto (GitHub Pages) hace falta ese envoltorio; sin la etiqueta viewport, un celular dibuja la
// página como si midiera 980 px de ancho: todo se ve diminuto y el juego pinta varias veces más píxeles.
const ENVOLTORIO = '<!doctype html>\n<html lang="es">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n';
const paginaWeb = h => ENVOLTORIO + h;
module.exports = { partes, paginaWeb, html };

if (require.main === module) {
  let h;
  try { h = html(); } catch (e) { console.error(e.message); process.exit(1); }
  const out = path.join(dir, 'cripta.html');
  if (process.argv.includes('--check')) {
    const dts = path.join(datDir, 'index.d.ts');
    const same = fs.existsSync(out) && fs.readFileSync(out, 'utf8') === h && fs.existsSync(dts) && fs.readFileSync(dts, 'utf8') === tiposDatos();
    console.log(same ? 'cripta.html está al día' : 'cripta.html o src/datos/index.d.ts NO coinciden con src/: ejecuta node build.js');
    process.exit(same ? 0 : 1);
  }
  // node build.js --web carpeta/index.html  → además, la versión de página completa (la usa GitHub Pages)
  const web = process.argv.indexOf('--web');
  if (web > 0) { const f = path.resolve(process.argv[web + 1]); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, paginaWeb(h)); console.log('página web completa:', f); }
  fs.writeFileSync(out, h);
  const dts = path.join(datDir, 'index.d.ts'), t = tiposDatos();
  if (!fs.existsSync(dts) || fs.readFileSync(dts, 'utf8') !== t) fs.writeFileSync(dts, t);
  console.log(`cripta.html: ${partes().length} partes, ${(h.match(/\n/g) || []).length} líneas, ${(Buffer.byteLength(h) / 1024).toFixed(1)} KB`);
}
