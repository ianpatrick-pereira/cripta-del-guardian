// Une los módulos de src/ en un solo cripta.html listo para publicar.
// Uso: node build.js            (escribe cripta.html junto a este archivo)
//      node build.js --check    (solo comprueba que cripta.html está al día)
// Los archivos de src/js/ se unen en orden por su número (00, 01, 01a, 01b...). Una carpeta
// numerada (como 01b-enemigos/) se une en ese lugar con todos sus archivos en orden alfabético.
// Todos comparten el mismo ámbito: 00-inicio.js abre la función que los envuelve
// y el último la cierra, así que un archivo nuevo va entre ambos.
// Los archivos de datos de src/datos/ (pisos, oleadas, botín) se comprueban y se convierten
// en una sola línea «const DATOS = {...}» justo después de 00-inicio.js.
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
  });
  if (pisos.length !== 8) fallos.push(`src/datos/pisos/ tiene ${pisos.length} pisos; el juego necesita 8 (los subjefes y la historia van por piso)`);
  if (fallos.length) throw new Error('Datos con errores:\n  ' + fallos.join('\n  '));
  return { pisos: pisos.map(p => p.d), oleadas: leerDatos('oleadas.jsonc'), botin: leerDatos('botin.jsonc') };
}

// las partes de cripta.html en orden: { nombre, texto } (pruebas/probar.js las usa para saber en qué archivo falló algo)
function partes() {
  const files = [];
  for (const f of fs.readdirSync(jsDir).filter(f => /^\d+[a-z]?-/.test(f)).sort()) {
    if (fs.statSync(path.join(jsDir, f)).isDirectory()) files.push(...fs.readdirSync(path.join(jsDir, f)).filter(g => g.endsWith('.js')).sort().map(g => path.join(f, g)));
    else if (f.endsWith('.js')) files.push(f);
  }
  const out = files.map(f => ({ nombre: 'src/js/' + f.split(path.sep).join('/'), texto: read(path.join('js', f)) }));
  out.splice(1, 0, { nombre: 'src/datos/ (generado)', texto: `const DATOS = ${JSON.stringify(datos())};\n` });
  return out;
}
function html() {
  const js = partes().map(p => p.texto).join('').replace(/\n$/, '');
  const css = read('estilos.css').replace(/\n$/, '');
  return read('pagina.html').replace('@@CSS@@', () => css).replace('@@JS@@', () => js);
}
module.exports = { partes };

if (require.main === module) {
  let h;
  try { h = html(); } catch (e) { console.error(e.message); process.exit(1); }
  const out = path.join(dir, 'cripta.html');
  if (process.argv.includes('--check')) {
    const same = fs.existsSync(out) && fs.readFileSync(out, 'utf8') === h;
    console.log(same ? 'cripta.html está al día' : 'cripta.html NO coincide con src/: ejecuta node build.js');
    process.exit(same ? 0 : 1);
  }
  fs.writeFileSync(out, h);
  console.log(`cripta.html: ${partes().length} partes, ${(h.match(/\n/g) || []).length} líneas, ${(Buffer.byteLength(h) / 1024).toFixed(1)} KB`);
}
