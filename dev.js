// Servidor de desarrollo: sirve el juego y lo recarga solo cada vez que guardas algo en src/.
// Uso: node dev.js            (o npm run dev)   → abre http://localhost:8000
//      PUERTO=3000 node dev.js
// Desde el celular (misma red wifi) usa la dirección «en tu red» que aparece al arrancar.
// No escribe cripta.html: para publicar sigue usando node build.js.
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
const build = require('./build.js');
const PUERTO = +process.env.PUERTO || 8000, src = path.join(__dirname, 'src');

const RECARGA = "<script>new EventSource('/__recarga').onmessage = () => location.reload();</script>";
const escHtml = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
let pagina = '', clientes = new Set(), n = 0;

function construir() {
  const t0 = Date.now();
  try {
    pagina = build.paginaWeb(build.html()) + RECARGA;
    console.log(`[${new Date().toLocaleTimeString()}] listo (${Date.now() - t0} ms)${n++ ? ' · recargando el juego' : ''}`);
  } catch (e) {
    // el error se ve en la consola y también en el navegador, en lugar del juego
    console.error(`[${new Date().toLocaleTimeString()}] ✗ ${e.message}`);
    pagina = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<body style="background:#1a1016;color:#f3d7d7;font:15px/1.5 monospace;padding:20px"><h2>El juego no se pudo construir</h2>
<pre style="white-space:pre-wrap">${escHtml(e.message)}</pre><p>Corrige el archivo y guarda: esta página se recarga sola.</p>${RECARGA}`;
  }
  for (const c of clientes) c.write('data: recarga\n\n');
}

let espera;
fs.watch(src, { recursive: true }, () => { clearTimeout(espera); espera = setTimeout(construir, 80); });
construir();

http.createServer((req, res) => {
  if (req.url === '/__recarga') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': conectado\n\n'); clientes.add(res); req.on('close', () => clientes.delete(res));
    return;
  }
  if (req.url !== '/' && !req.url.startsWith('/?')) { res.writeHead(404); return res.end('no existe'); }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(pagina);
}).listen(PUERTO, () => {
  const red = Object.values(os.networkInterfaces()).flat().find(i => i && i.family === 'IPv4' && !i.internal);
  console.log(`Cripta del Guardián en modo desarrollo\n  en este equipo: http://localhost:${PUERTO}` + (red ? `\n  en tu red:      http://${red.address}:${PUERTO}` : '') + '\n  (Ctrl+C para salir)');
});
