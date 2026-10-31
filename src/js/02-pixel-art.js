// ================= Pixel art =================
const MAPS = {
  knight: ['.....oo.....', '....kook....', '...kssssk...', '..kssssssk..', '..ksvvvvsk..', '..kssssssk..', '...kkkkkk...',
           '..kaaaaaak..', '.rkaabbaakr.', '.rkaaaaaakr.', '..kaaaaaak..', '...kl..lk...', '...kl..lk...', '...kk..kk...'],
  archer: ['....kkkk....', '...kggggk...', '..kggggggk..', '..kgffffgk..', '..kgfkfkgk..', '..kgffffgk..', '..kggggggk..',
           '.kgttttttgk.', '.kfttbbttfk.', '..kttttttk..', '..kttttttk..', '...kl..lk...', '...kl..lk...', '...kk..kk...'],
  rogue:  ['....kkkk....', '...kddddk...', '..kddddddk..', '..kdyddydk..', '..kmmmmmmk..', '..kddddddk..', '...kkkkkk...',
           '..kcccccck..', '.kccmccmcck.', '..kcccccck..', '..kcccccck..', '...kl..lk...', '...kl..lk...', '...kk..kk...'],
  chest:  ['.kkkkkkkkkkkk.', 'kwwwwwwwwwwwwk', 'kwwwwwwwwwwwwk', 'kggggggggggggk', 'kkkkkkggkkkkkk', 'kwwwwwggwwwwwk', 'kwwwwwwwwwwwwk', 'kggggggggggggk', 'kkkkkkkkkkkkkk'],
  crate:  ['kkkkkkkkkkkk', 'kwwwwwwwwwwk', 'kwkwwwwwwkwk', 'kwwkwwwwkwwk', 'kwwwkwwkwwwk', 'kwwwwkkwwwwk', 'kwwwwkkwwwwk', 'kwwwkwwkwwwk', 'kwwkwwwwkwwk', 'kwkwwwwwwkwk', 'kwwwwwwwwwwk', 'kkkkkkkkkkkk'],
  barrel: ['.kkkkkkkk.', 'krrrrrrrrk', 'kbbbbbbbbk', 'krrrrrrrrk', 'krrryyrrrk', 'krryrryrrk', 'krrryyrrrk', 'krrrrrrrrk', 'kbbbbbbbbk', 'krrrrrrrrk', '.kkkkkkkk.'],
  potion: ['..kkkk..', '..kcck..', '...kk...', '..kddk..', '.kddddk.', 'kddhdddk', 'kddddddk', 'kddddddk', '.kddddk.', '..kkkk..'],
};
const SPR_DEFS = {
  knight:   ['knight', { k: '#141019', o: '#e3a24a', s: '#c9c3b4', v: '#1b1822', a: '#9a97a8', b: '#6b4a2a', r: '#9b2f3a', l: '#4a4658' }],
  archer:   ['archer', { k: '#141019', g: '#3f7a46', f: '#e0b48e', t: '#5c8a4a', b: '#6b4a2a', l: '#4a3a2a' }],
  rogue:    ['rogue',  { k: '#141019', d: '#3a3348', y: '#ffd34a', m: '#b0303a', c: '#2b2636', l: '#1f1b28' }],
  merchant: ['archer', { k: '#141019', g: '#7a5230', f: '#e0b48e', t: '#6a3f8a', b: '#e3a24a', l: '#3a2a1a' }],
  chest:    ['chest',  { k: '#1c120c', w: '#7f5130', g: '#e3a24a' }],
  gchest:   ['chest',  { k: '#2a1c08', w: '#c8a040', g: '#5aa4e8' }],
  crate:    ['crate',  { k: '#2a1a10', w: '#8a5a34' }],
  barrel:   ['barrel', { k: '#2a0e0e', r: '#b8402e', b: '#4a4658', y: '#ffd34a' }],
  potion:   ['potion', { k: '#1a0c10', c: '#c9b48e', d: '#d4474b', h: '#ffb0b0' }],
};
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
// cada enemigo trae su sprite en su archivo de 01b-enemigos/
for (const id in ENEMIES) {
  const sp = ENEMIES[id].sprite; if (!sp) continue;
  if (Array.isArray(sp.mapa)) MAPS[sp.clave] = sp.mapa;
  SPR_DEFS[sp.clave] = [Array.isArray(sp.mapa) ? sp.clave : sp.mapa, sp.paleta];
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

