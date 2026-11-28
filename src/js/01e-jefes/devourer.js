// Jefe del piso 3: El Devorador de Luz
import { tr } from '../00b-textos.js';
import { TAU, angTo } from '../01-utilidades.js';
import { defBoss } from '../01a-registro.js';
import { G } from '../07-estado.js';
// v0.65: sus 5 ataques propios (01g-ataques-de-jefe/): mirada (Mirada Ardiente), eclipse, fauces (Fauces del Vacío),
// vigias (Ojos Vigías) y agujero (Agujero Negro, fase 3); en cada fase cambia de dibujo (devourer, devourer_f2, devourer_f3)
defBoss('devourer', {
  orden: 3,
  datos: { name: tr('El Devorador de Luz'), spr: 'devourer', s: 4.4, fases: true, poseAtq: ['mirada', 'agujero'], hp: 1050, r: 32, minion: 'wraith', col: '#ff5a3a', want: 190,
           p1: ['mirada', 'fauces', 'aimed', 'vigias'], p2: ['mirada', 'eclipse', 'spiral', 'fauces', 'burst', 'vigias', 'gapring'], p3: ['mirada', 'eclipse', 'agujero', 'fauces', 'gapring', 'predict'] },
  logro: 'boss3',
  // v0.65 el Devorador usa su hoja HD (spr 'devourer'); este dibujo por código queda para los jefes con look: 'devourer' (con otro color)
  aspecto(g, e, fill, ph2) {
    g.globalAlpha = e.fade;
    g.fillStyle = ph2 ? 'rgba(255,60,40,.3)' : 'rgba(120,20,30,.35)'; g.beginPath(); g.arc(0, 0, 54, 0, TAU); g.fill();
    g.fillStyle = fill('#0c0608'); g.beginPath(); g.arc(0, 0, 32, 0, TAU); g.fill();
    g.fillStyle = '#e8d8d0';
    for (let i = 0; i < 14; i++) { const a = i * TAU / 14 + e.spin * .5; g.save(); g.rotate(a); g.fillRect(26, -3, 10, 6); g.restore(); }
    g.fillStyle = fill('#e8d8d0'); g.beginPath(); g.arc(0, 0, 15, 0, TAU); g.fill();
    const pa = angTo(e, G.player);
    g.fillStyle = ph2 ? '#ff2a1a' : '#b0303a'; g.beginPath(); g.arc(Math.cos(pa) * 6, Math.sin(pa) * 6, 8, 0, TAU); g.fill();
    g.fillStyle = '#000'; g.fillRect(Math.cos(pa) * 7 - 2, Math.sin(pa) * 7 - 5, 4, 10);
  }
});
