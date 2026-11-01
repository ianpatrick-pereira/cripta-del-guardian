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
function datos() {
  const pisos = fs.readdirSync(path.join(datDir, 'pisos')).filter(f => f.endsWith('.jsonc')).sort()
    .map(f => ({ f: 'pisos/' + f, d: leerDatos('pisos/' + f) })).sort((a, b) => a.d.piso - b.d.piso);
  const enemigos = idsDe('01b-enemigos', 'defEnemy'), jefes = idsDe('01e-jefes', 'defBoss'), fallos = [];
  pisos.forEach(({ f, d }, i) => {
    if (d.piso !== i + 1) fallos.push(`src/datos/${f}: "piso" es ${d.piso}, pero tocaba el ${i + 1} (los pisos van del 1 al ${pisos.length} sin saltos)`);
    for (const k of ['enemigosCerca', 'enemigosLejos']) {
      if (!Array.isArray(d[k]) || !d[k].length) fallos.push(`src/datos/${f}: "${k}" tiene que ser una lista con al menos un enemigo`);
      else for (const id of d[k]) if (!enemigos.has(id)) fallos.push(`src/datos/${f}: el enemigo "${id}" de "${k}" no existe en src/js/01b-enemigos/`);
    }
    if (!jefes.has(d.jefe)) fallos.push(`src/datos/${f}: el jefe "${d.jefe}" no existe en src/js/01e-jefes/`);
    const A = d.ambiente || {}, COSAS = ["huesos", "velas", "cristales", "musgo", "hierba", "charcos", "runas", "hongos", "espinas", "escarcha", "lava", "flores", "vidrios", "rosas"], PART = ["polvo", "esporas", "brasas", "nieve", "luciernagas", "chispas", "petalos"];
    if (!d.ambiente) fallos.push(`src/datos/${f}: falta el bloque "ambiente"`);
    else {
      if (!PART.includes(A.particulas)) fallos.push(`src/datos/${f}: "particulas" tiene que ser una de: ${PART.join(', ')}`);
      for (const k of ['bordes', 'centro']) for (const c of Object.keys(A[k] || {})) if (!COSAS.includes(c)) fallos.push(`src/datos/${f}: "${c}" en "${k}" no es un tipo de decoración (${COSAS.join(', ')})`);
    }
  });
  if (pisos.length !== 8) fallos.push(`src/datos/pisos/ tiene ${pisos.length} pisos; el juego necesita 8 (los subjefes y la historia van por piso)`);
  if (fallos.length) throw new Error('Datos con errores:\n  ' + fallos.join('\n  '));
  return { pisos: pisos.map(p => p.d), oleadas: leerDatos('oleadas.jsonc'), botin: leerDatos('botin.jsonc'), finales: leerDatos('finales.jsonc') };
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
    const same = fs.existsSync(out) && fs.readFileSync(out, 'utf8') === h;
    console.log(same ? 'cripta.html está al día' : 'cripta.html NO coincide con src/: ejecuta node build.js');
    process.exit(same ? 0 : 1);
  }
  // node build.js --web carpeta/index.html  → además, la versión de página completa (la usa GitHub Pages)
  const web = process.argv.indexOf('--web');
  if (web > 0) { const f = path.resolve(process.argv[web + 1]); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, paginaWeb(h)); console.log('página web completa:', f); }
  fs.writeFileSync(out, h);
  console.log(`cripta.html: ${partes().length} partes, ${(h.match(/\n/g) || []).length} líneas, ${(Buffer.byteLength(h) / 1024).toFixed(1)} KB`);
}
