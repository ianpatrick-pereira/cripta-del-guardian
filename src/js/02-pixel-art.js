// ================= Pixel art =================
import { ctx } from './00-inicio.js';
import { SPRITES } from '../sprites/index.js';
// Los dibujos viven como imágenes en src/sprites/<clave>.png (una por personaje, enemigo u objeto).
// build.js las convierte en SPRITES: { clave: [filas de letras, { letra: color }] }, con '.' = transparente.
// Para cambiar un dibujo, edita su PNG (Aseprite, Piskel, Paint...); para uno nuevo, añade otro PNG.
const MAPS = {}, SPR_DEFS = {};
for (const [clave, [filas, paleta]] of Object.entries(SPRITES)) { MAPS[clave] = filas; SPR_DEFS[clave] = [clave, paleta]; }
const SPR = {};
function buildSprites() {
  for (const [key, [mapName, pal]] of Object.entries(SPR_DEFS)) {
    const rows = MAPS[mapName], h = rows.length, w = rows[0].length;
    const mk = white => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d');
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const ch = rows[y][x]; if (ch === '.' || !pal[ch]) continue;
        g.fillStyle = white ? '#ffffff' : pal[ch]; g.fillRect(x, y, 1, 1);
      }
      return c;
    };
    SPR[key] = { n: mk(false), w: mk(true), wd: w, ht: h };
  }
}
buildSprites();
function drawSpr(key, x, y, s = 2, o = {}) {
  const sp = SPR[key]; if (!sp) return;
  const w = sp.wd * s * (o.sx || 1), h = sp.ht * s * (o.sy || 1);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  ctx.translate(Math.round(x), Math.round(y));
  if (o.flip) ctx.scale(-1, 1);
  ctx.drawImage(o.white ? sp.w : sp.n, -w / 2, -h / 2, w, h);
  ctx.restore();
}

export { MAPS, SPR, SPR_DEFS, drawSpr };
