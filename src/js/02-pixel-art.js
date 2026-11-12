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

// v0.53: cuadros de caminar sin dibujar nada nuevo. Si la última fila del dibujo tiene dos piernas
// (píxeles a los lados y hueco en el centro), el cuadro 1 levanta la pierna izquierda y el 2 la derecha:
// las 3 filas de abajo de esa mitad suben un píxel. Sirve para cualquier dibujo (aspectos, armaduras).
const LEGS = {};
function hasLegs(key) {
  if (key in LEGS) return LEGS[key];
  const sp = SPR[key]; if (!sp || sp.ht < 8) return (LEGS[key] = false);
  const d = sp.n.getContext('2d').getImageData(0, sp.ht - 1, sp.wd, 1).data, a = i => d[i * 4 + 3] > 0, m = sp.wd >> 1;
  let L = false, R = false; for (let i = 0; i < m - 1; i++) L = L || a(i); for (let i = m + 1; i < sp.wd; i++) R = R || a(i);
  return (LEGS[key] = L && R && !a(m - 1) && !a(m));
}
function walkKey(key, f) {
  if (!f || !hasLegs(key)) return key;
  const k = key + '_W' + f; if (SPR[k]) return k;
  const sp = SPR[key], m = sp.wd >> 1, x0 = f === 1 ? 0 : m, w = f === 1 ? m : sp.wd - m;
  const mk = src => {
    const c = document.createElement('canvas'); c.width = sp.wd; c.height = sp.ht; const g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.clearRect(x0, sp.ht - 3, w, 3);
    g.drawImage(src, x0, sp.ht - 2, w, 2, x0, sp.ht - 3, w, 2);   // la pierna sube un píxel
    return c;
  };
  SPR[k] = { n: mk(sp.n), w: mk(sp.w), wd: sp.wd, ht: sp.ht };
  return k;
}
// cuadro de caminar según una fase que avanza al moverse (0 = quieto)
const walkFrame = (fase, moving) => !moving ? 0 : Math.sin(fase) > .35 ? 1 : Math.sin(fase) < -.35 ? 2 : 0;

export { MAPS, SPR, SPR_DEFS, drawSpr, walkFrame, walkKey };
