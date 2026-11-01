const cv = /** @type {HTMLCanvasElement} */ (document.getElementById('cv'));
const ctx = cv.getContext('2d');
const frame = document.getElementById('frame');
// devuelve `any` para poder usar .value, .checked, .width... sin avisos de tipo
/** @type {(id: string) => any} */
const $ = id => document.getElementById(id);

export { $, ctx, cv, frame };
