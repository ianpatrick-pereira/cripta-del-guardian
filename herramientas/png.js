// Leer y escribir PNG sin dependencias (solo zlib de Node). Lo usa build.js para convertir los sprites
// de src/sprites/*.png en datos del juego. Soporta lo que exportan Aseprite, Piskel o cualquier editor:
// color RGB / RGBA / gris / indexado (con transparencia), 8 bits (indexado también 1, 2 y 4), sin entrelazado.
const zlib = require('zlib');

function leerPng(buf, nombre = 'imagen') {
  const mal = m => { throw new Error(`${nombre}: ${m}`); };
  if (buf.readUInt32BE(0) !== 0x89504e47) mal('no es un PNG');
  let p = 8, ancho, alto, prof, tipo, entrelazado, paleta = null, trns = null; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), t = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (t === 'IHDR') { ancho = d.readUInt32BE(0); alto = d.readUInt32BE(4); prof = d[8]; tipo = d[9]; entrelazado = d[12]; }
    else if (t === 'PLTE') paleta = d;
    else if (t === 'tRNS') trns = d;
    else if (t === 'IDAT') idat.push(d);
    else if (t === 'IEND') break;
    p += 12 + len;
  }
  if (entrelazado) mal('está guardado «entrelazado» (interlaced); guárdalo sin esa opción');
  const canales = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[tipo];
  if (!canales) mal(`tipo de color ${tipo} no soportado`);
  if (prof !== 8 && !(tipo === 3 && [1, 2, 4].includes(prof))) mal(`profundidad de ${prof} bits no soportada; guárdalo con 8 bits por canal`);
  const bpp = Math.max(1, canales * prof / 8), fila = Math.ceil(ancho * canales * prof / 8);
  const raw = zlib.inflateSync(Buffer.concat(idat)), px = Buffer.alloc(fila * alto);
  for (let y = 0; y < alto; y++) {   // deshacer los filtros de cada fila
    const f = raw[y * (fila + 1)], src = raw.subarray(y * (fila + 1) + 1, (y + 1) * (fila + 1)), o = y * fila;
    for (let x = 0; x < fila; x++) {
      const a = x >= bpp ? px[o + x - bpp] : 0, b = y ? px[o - fila + x] : 0, c = x >= bpp && y ? px[o - fila + x - bpp] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[o + x] = v & 255;
    }
  }
  const rgba = Buffer.alloc(ancho * alto * 4);
  for (let y = 0; y < alto; y++) for (let x = 0; x < ancho; x++) {
    const i = (y * ancho + x) * 4, o = y * fila;
    if (tipo === 3) {
      const k = prof === 8 ? px[o + x] : (px[o + ((x * prof) >> 3)] >> (8 - prof - ((x * prof) & 7))) & ((1 << prof) - 1);
      if (!paleta || k * 3 + 2 >= paleta.length) mal('la paleta no tiene ese color');
      rgba[i] = paleta[k * 3]; rgba[i + 1] = paleta[k * 3 + 1]; rgba[i + 2] = paleta[k * 3 + 2]; rgba[i + 3] = trns && k < trns.length ? trns[k] : 255;
    } else {
      const s = o + x * canales, g = tipo === 0 || tipo === 4;
      rgba[i] = px[s]; rgba[i + 1] = px[s + (g ? 0 : 1)]; rgba[i + 2] = px[s + (g ? 0 : 2)];
      rgba[i + 3] = tipo === 6 ? px[s + 3] : tipo === 4 ? px[s + 1] : 255;
      if (trns && tipo === 2 && trns.readUInt16BE(0) === px[s] && trns.readUInt16BE(2) === px[s + 1] && trns.readUInt16BE(4) === px[s + 2]) rgba[i + 3] = 0;
    }
  }
  return { ancho, alto, rgba };
}

function escribirPng(ancho, alto, rgba) {
  const fila = ancho * 4, raw = Buffer.alloc((fila + 1) * alto);
  for (let y = 0; y < alto; y++) rgba.copy(raw, y * (fila + 1) + 1, y * fila, (y + 1) * fila);
  const trozo = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t, 'ascii'), d]); const c = Buffer.alloc(4); c.writeUInt32BE(zlib.crc32(td) >>> 0); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(ancho, 0); ihdr.writeUInt32BE(alto, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), trozo('IHDR', ihdr), trozo('IDAT', zlib.deflateSync(raw, { level: 9 })), trozo('IEND', Buffer.alloc(0))]);
}

module.exports = { leerPng, escribirPng };
