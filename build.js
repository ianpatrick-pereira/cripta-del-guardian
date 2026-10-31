// Une los módulos de src/ en un solo cripta.html listo para publicar.
// Uso: node build.js            (escribe cripta.html junto a este archivo)
//      node build.js --check    (solo comprueba que cripta.html está al día)
// Los archivos de src/js/ se unen en orden por su número (00, 01, 01a, 01b...). Una carpeta
// numerada (como 01b-enemigos/) se une en ese lugar con todos sus archivos en orden alfabético.
// Todos comparten el mismo ámbito: 00-inicio.js abre la función que los envuelve
// y el último la cierra, así que un archivo nuevo va entre ambos.
const fs = require('fs'), path = require('path');
const dir = __dirname, src = path.join(dir, 'src'), jsDir = path.join(src, 'js');
const read = f => fs.readFileSync(path.join(src, f), 'utf8');
const files = [];
for (const f of fs.readdirSync(jsDir).filter(f => /^\d+[a-z]?-/.test(f)).sort()) {
  if (fs.statSync(path.join(jsDir, f)).isDirectory()) files.push(...fs.readdirSync(path.join(jsDir, f)).filter(g => g.endsWith('.js')).sort().map(g => path.join(f, g)));
  else if (f.endsWith('.js')) files.push(f);
}
const js = files.map(f => read(path.join('js', f))).join('').replace(/\n$/, '');
const css = read('estilos.css').replace(/\n$/, '');
const html = read('pagina.html').replace('@@CSS@@', () => css).replace('@@JS@@', () => js);
const out = path.join(dir, 'cripta.html');
if (process.argv.includes('--check')) {
  const same = fs.existsSync(out) && fs.readFileSync(out, 'utf8') === html;
  console.log(same ? 'cripta.html está al día' : 'cripta.html NO coincide con src/: ejecuta node build.js');
  process.exit(same ? 0 : 1);
}
fs.writeFileSync(out, html);
console.log(`cripta.html: ${files.length} archivos, ${(html.match(/\n/g) || []).length} líneas, ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
