// ================= Idioma y textos =================
// El juego se escribe en español, directamente en el código. Para mostrarlo en otro idioma, cada texto
// visible pasa por tr():
//   tr('Sala despejada')                 un texto fijo
//   tr`Faltan ${n} monedas`              un texto con valores: en el archivo de traducción es «Faltan {0} monedas»
// Las traducciones viven en src/textos/<idioma>.jsonc: { "texto en español": "traducción" }.
// Si falta una traducción se muestra el español. `node build.js --check` avisa de las que faltan.
// El idioma se elige en Opciones (se guarda aparte del progreso) y, la primera vez, según el navegador.
import { DATOS } from '../datos/index.js';
import { TEXTOS } from '../textos/index.js';

const IDIOMAS = { es: 'Español', en: 'English' };
const IDIOMA = (() => {
  try { const g = localStorage.getItem('cripta-idioma'); if (g && IDIOMAS[g]) return g; } catch (_) { /* sin almacenamiento */ }
  const nav = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || [];
  if (!nav.length || nav.some(l => /^es\b/i.test(l || ''))) return 'es';
  const l = String(nav[0] || '').slice(0, 2).toLowerCase();
  return IDIOMAS[l] ? l : 'en';
})();
const DIC = IDIOMA === 'es' ? null : TEXTOS[IDIOMA] || null;

// clave de una plantilla tr`...`: las partes fijas unidas con {0}, {1}... (se calcula una vez por plantilla)
const CLAVES = new WeakMap();
const claveDe = partes => {
  let k = CLAVES.get(partes);
  if (k === undefined) { k = partes.reduce((s, q, i) => s + (i ? `{${i - 1}}` : '') + q, ''); CLAVES.set(partes, k); }
  return k;
};
/** @param {string | TemplateStringsArray} a @param {...any} v @returns {string} */
function tr(a, ...v) {
  const clave = typeof a === 'string' ? a : claveDe(a);
  const s = (DIC && DIC[clave]) || clave;
  return v.length ? s.replace(/\{(\d+)\}/g, (m, i) => String(v[+i])) : s;
}

// cambia de idioma: se guarda y se recarga la página (los textos se leen al arrancar)
function setIdioma(l) {
  try { localStorage.setItem('cripta-idioma', l); } catch (_) { /* sin almacenamiento */ }
  location.reload();
}

// textos de los archivos de datos (nombres de pisos y finales)
if (DIC) {
  for (const p of DATOS.pisos) p.nombre = tr(p.nombre);
  for (const f of Object.values(DATOS.finales)) { f.etiqueta = tr(f.etiqueta); f.titulo = tr(f.titulo); f.texto = f.texto.map(x => tr(x)); }
}
// textos fijos de la página (menús, botones, ayudas): mismo criterio que build.js para sacar sus claves
function traducirPagina() {
  if (!DIC) return;
  document.documentElement.lang = IDIOMA;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const par = n.parentNode && n.parentNode.nodeName;
    if (par === 'SCRIPT' || par === 'STYLE') continue;
    const k = n.nodeValue.replace(/\s+/g, ' ').trim();
    if (k && DIC[k]) n.nodeValue = n.nodeValue.replace(/\S[\s\S]*\S|\S/, DIC[k]);
  }
  for (const el of document.querySelectorAll('[title], [placeholder], [aria-label]'))
    for (const at of ['title', 'placeholder', 'aria-label']) { const k = el.getAttribute(at); if (k && DIC[k.trim()]) el.setAttribute(at, DIC[k.trim()]); }
}
traducirPagina();

export { IDIOMA, IDIOMAS, setIdioma, tr };
