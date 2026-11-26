// ================= Pixel art =================
import { ctx } from './00-inicio.js';
import { SPRITES } from '../sprites/index.js';
// Los dibujos viven como imágenes en src/sprites/<clave>.png (una por personaje, enemigo u objeto).
// build.js las convierte en SPRITES: { clave: [filas de letras, { letra: color }] }, con '.' = transparente.
// Para cambiar un dibujo, edita su PNG (Aseprite, Piskel, Paint...); para uno nuevo, añade otro PNG.
// Hojas de animación (v0.62, src/sprites/animaciones.jsonc): ANIM[clave] = { reposo: { cuadros, fps }, caminar, herido, muerte }
// y DET[clave] = detalle (2 = el dibujo tiene el doble de píxeles y se pinta a la mitad: mismo tamaño, más fino).
const MAPS = {}, SPR_DEFS = {}, ANIM = {}, DET = {};
for (const [clave, [filas, paleta, extra]] of Object.entries(SPRITES)) {
  MAPS[clave] = filas; SPR_DEFS[clave] = [clave, paleta];
  if (extra && extra.detalle) DET[clave] = extra.detalle;
  if (extra && extra.anim) ANIM[clave] = extra.anim;
}
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
    SPR[key] = { n: mk(false), w: mk(true), wd: w, ht: h, k: 1 / (DET[mapName] || 1) };
  }
}
buildSprites();
// dibujo blanco/gris teñido de un color (orbes de los ataques): se multiplica por el color y el centro sigue brillando
function tinted(sp, col) {
  const T = sp.t || (sp.t = {}); if (T[col]) return T[col];
  const c = document.createElement('canvas'); c.width = sp.wd; c.height = sp.ht; const g = c.getContext('2d');
  g.drawImage(sp.n, 0, 0);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.fillRect(0, 0, sp.wd, sp.ht);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(sp.n, 0, 0);
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = .2; g.drawImage(sp.n, 0, 0);
  return (T[col] = c);
}
// v0.64: borde suave (para lo que está en el suelo: charcos, runas, vórtices). Se funde con las baldosas en vez de verse como una pegatina
function bordeSuave(sp) {
  if (sp.sv) return sp.sv;
  const c = document.createElement('canvas'); c.width = sp.wd; c.height = sp.ht; const g = c.getContext('2d');
  g.drawImage(sp.n, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  g.translate(sp.wd / 2, sp.ht / 2); g.scale(sp.wd / 2, sp.ht / 2);
  const r = g.createRadialGradient(0, 0, 0, 0, 0, 1); r.addColorStop(0, '#000'); r.addColorStop(.55, '#000'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(-1, -1, 2, 2);
  return (sp.sv = c);
}
// v0.64: luz de los efectos. Cada familia de efectos brilla con su color y alumbra el suelo que tiene debajo
const FX_LUZ = { f_: ['255,120,40', .45, 1], g_: ['199,125,255', .3, .7], a_: ['120,200,255', .2, .45], v_: ['190,240,230', .3, .45], t_: ['255,170,90', 0, 0], l_: ['155,255,122', .15, .45], w_: ['180,120,255', .25, .45], x_: ['255,60,60', .2, .45], orbe: ['255,255,255', .25, .4] };
function fxLuz(key) {
  for (const k in FX_LUZ) if (key && key.startsWith(k)) return FX_LUZ[k];
  return null;
}
// mancha de luz en el suelo (se suma a lo que hay debajo)
function luzSuelo(x, y, r, rgb, a) {
  if (a <= .01 || r <= 1) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * .6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// sombra en el suelo de algo que vuela (balas, rocas lanzadas): así se ve a qué altura va
function sombraSuelo(x, y, r, a = .28) {
  ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.ellipse(x, y, r, r * .45, 0, 0, Math.PI * 2); ctx.fill();
}
// opciones extra (v0.64): luz = brillo sumado encima (0-1), suave = borde que se funde con el suelo
function drawSpr(key, x, y, s = 2, o = {}) {
  const sp = SPR[key]; if (!sp) return;
  const w = sp.wd * s * sp.k * (o.sx || 1), h = sp.ht * s * sp.k * (o.sy || 1);
  ctx.save();
  // un dibujo con mucho detalle que en pantalla queda más chico que sus píxeles se achica suave (si no, se pierden líneas)
  const pant = Math.abs(ctx.getTransform().a) * s * sp.k;
  ctx.imageSmoothingEnabled = pant < .95;
  if (pant < .95) ctx.imageSmoothingQuality = 'high';
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  ctx.translate(Math.round(x), Math.round(y));
  if (o.rot) ctx.rotate(o.rot);
  if (o.flip) ctx.scale(-1, 1);
  const img = o.white ? sp.w : o.tint ? tinted(sp, o.tint) : o.suave ? bordeSuave(sp) : sp.n;
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  if (o.luz && !o.white) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= o.luz; ctx.drawImage(img, -w / 2, -h / 2, w, h); }
  ctx.restore();
}

// v0.53: cuadros de caminar sin dibujar nada nuevo. Si la última fila del dibujo tiene dos piernas
// (píxeles a los lados y hueco en el centro), el cuadro 1 levanta la pierna izquierda y el 2 la derecha:
// las 3 filas de abajo de esa mitad suben un píxel. Sirve para cualquier dibujo (aspectos, armaduras).
const LEGS = {};
function hasLegs(key) {
  if (key in LEGS) return LEGS[key];
  const sp = SPR[key]; if (!sp || sp.ht < 8 || sp.k !== 1) return (LEGS[key] = false);   // las hojas traen sus propios cuadros
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
  SPR[k] = { n: mk(sp.n), w: mk(sp.w), wd: sp.wd, ht: sp.ht, k: 1 };
  return k;
}
// cuadro de caminar según una fase que avanza al moverse (0 = quieto)
const walkFrame = (fase, moving) => !moving ? 0 : Math.sin(fase) > .35 ? 1 : Math.sin(fase) < -.35 ? 2 : 0;
// cuadro de una animación de la hoja: t en segundos (o fase), «una vez» se queda en el último cuadro
function animKey(clave, nombre, t, unaVez = false) {
  const a = ANIM[clave] && ANIM[clave][nombre]; if (!a) return null;
  const n = a.cuadros.length, i = Math.floor(t * a.fps);
  return a.cuadros[unaVez ? Math.min(n - 1, Math.max(0, i)) : ((i % n) + n) % n];
}

// cuadro de un enemigo o subjefe con hoja: herido (justo tras un golpe) > caminar > reposo
function mobKey(spr, t, moving, hurt) {
  const A = ANIM[spr]; if (!A) return null;
  if (hurt && A.herido) return A.herido.cuadros[0];
  if (moving && A.caminar) return animKey(spr, 'caminar', t);
  return animKey(spr, 'reposo', t);
}

export { ANIM, MAPS, SPR, SPR_DEFS, animKey, drawSpr, fxLuz, luzSuelo, mobKey, sombraSuelo, walkFrame, walkKey };
