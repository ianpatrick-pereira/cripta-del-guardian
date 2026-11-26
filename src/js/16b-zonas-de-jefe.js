// v0.65: lo que dejan en el mundo los ataques de La Reina Tejedora (ver 01g-ataques-de-jefe/red, crias, veneno).
// Cada cosa vive en G.zonas con un «tipo» y un tiempo t que baja:
//   vuela   una red o un saco de huevos que va por el aire (en arco) hasta su destino
//   red     red pegajosa en el suelo: te frena mientras la pisas; con veneno (fase 2+) también quema
//   saco    saco de huevos en el suelo: late y revienta soltando crías
//   restos  saco vacío que se deshace (solo dibujo)
//   gota    araña que baja colgando del techo y suelta una gota de veneno: donde cae hace daño
//   acido   charco de veneno: quema mientras lo pisas
import { ctx } from './00-inicio.js';
import { tr } from './00b-textos.js';
import { animKey, drawSpr, luzSuelo, sombraSuelo } from './02-pixel-art.js';
import { dist } from './01-utilidades.js';
import { sfx } from './05-audio.js';
import { G } from './07-estado.js';
import { hitsWall } from './08-colisiones.js';
import { addText, burst, shake } from './09-efectos.js';
import { hurtPlayer } from './13-armadura.js';
import { mkEnemy, quien } from './14-enemigos.js';

const VUELO = .7;   // segundos que tarda en caer lo que lanza

/** lanza una red o un saco desde el jefe hasta (x, y) */
function lanzarZona(e, que, x, y, o = {}) {
  if (hitsWall(x, y, 16)) { x = G.player.x; y = G.player.y; }
  (G.zonas || (G.zonas = [])).push({ tipo: 'vuela', que, x0: e.x, y0: e.y - 30, x, y, t: VUELO, max: VUELO, dueno: e, ...o });
}
/** araña que baja del techo sobre (x, y) y suelta una gota de veneno */
function gotaVeneno(e, x, y, t = 1.1) {
  if (hitsWall(x, y, 12)) return;
  (G.zonas || (G.zonas = [])).push({ tipo: 'gota', x, y, t, max: t, dueno: e });
}

function updateZonas(dt) {
  const p = G.player;
  for (const z of G.zonas) {
    z.t -= dt;
    const dentro = dist(z, p) < (z.r || 0) + p.r * .5;
    switch (z.tipo) {
      case 'vuela':
        if (z.t <= 0) {
          if (z.que === 'red') { Object.assign(z, { tipo: 'red', r: 58, t: z.dura || 4.5, max: z.dura || 4.5, tick: 0 }); sfx(380, .12, 'triangle', .03, -200); }
          else { Object.assign(z, { tipo: 'saco', r: 0, t: 1.4, max: 1.4 }); sfx(120, .15, 'sine', .04, -40); }
          shake(3);
        }
        break;
      case 'red':
        if (dentro && z.t > .4) {
          if (!(p.slow > .2)) addText(p.x, p.y - 26, tr('Atrapado'), '#e8e8d8', 12);
          p.slow = Math.max(p.slow, .25);
          if (z.veneno && (z.tick -= dt) <= 0) { z.tick = 1; hurtPlayer(1, quien(z.dueno)); }
        }
        break;
      case 'saco':
        if (z.t <= 0) {
          // revienta: salen las crías (como las que invoca, sin el círculo de aviso)
          const n = z.crias || 2;
          for (let i = 0; i < n; i++) G.enemies.push(mkEnemy(z.minion || 'spider', z.x + (i - (n - 1) / 2) * 18, z.y + 6, 3, false));
          burst(z.x, z.y, '#e8e8d8', 10, 150, 3); sfx(260, .2, 'square', .03, -120);
          Object.assign(z, { tipo: 'restos', t: 1.2, max: 1.2 });
        }
        break;
      case 'gota':
        if (z.t <= 0) {
          if (dist(z, p) < 26 + p.r) hurtPlayer(1, quien(z.dueno));
          burst(z.x, z.y, '#9bff7a', 6, 110, 3);
          Object.assign(z, { tipo: 'acido', r: 26, t: 3.2, max: 3.2, tick: .5 });
        }
        break;
      case 'acido':
        if (dentro && z.t > .5 && (z.tick -= dt) <= 0) { z.tick = .8; hurtPlayer(1, quien(z.dueno)); }
        break;
    }
  }
  G.zonas = G.zonas.filter(z => z.t > 0 || z.tipo === 'vuela');
}

// lo que está en el suelo (redes, charcos, sacos): se pinta antes que los personajes
function drawZonasSuelo() {
  if (!G.zonas) return;
  for (const z of G.zonas) {
    const k = 1 - z.t / z.max;
    if (z.tipo === 'red') {
      const fin = z.t < .45, a = Math.min(1, z.t / .2);
      const f = fin ? animKey('r_red', 'muerte', .45 - z.t, true) : 'r_red~caminar~' + (z.veneno && Math.floor(G.time * 3) % 2 ? 1 : 0);
      if (z.veneno) luzSuelo(z.x, z.y, 70, '155,255,122', .18);
      drawSpr(f || 'r_red~muerte~1', z.x, z.y, 5.6 * Math.min(1, .8 + k * 3), { alpha: a });
    } else if (z.tipo === 'saco') {
      sombraSuelo(z.x, z.y + 10, 16, .3);
      const q = k < .35 ? 1 : k < .8 ? 2 : 3, late = q === 2 ? 1 + .07 * Math.sin(G.time * 20) : 1;
      drawSpr('r_saco~reposo~' + q, z.x, z.y - 4, 3.4, { sx: late, sy: 2 - late });
    } else if (z.tipo === 'restos') {
      drawSpr('r_saco~muerte~' + Math.min(3, Math.floor(k * 4)), z.x, z.y - 4, 3.4, { alpha: Math.min(1, z.t / .3) });
    } else if (z.tipo === 'acido') {
      luzSuelo(z.x, z.y, 40, '155,255,122', .22 * Math.min(1, z.t));
      const f = k < .08 ? 0 : z.t < .6 ? 3 : 1 + Math.floor(G.time * 3) % 2;
      drawSpr('r_gota~muerte~' + f, z.x, z.y, 3.6, { alpha: Math.min(1, z.t / .4) });
    } else if (z.tipo === 'gota') {
      // aviso en el suelo: un círculo verde que se cierra
      circuloVeneno(z.x, z.y, 26 * (1.4 - k * .4), .25 + .5 * k);
    }
  }
}
// lo que va por el aire (encima de todo): redes y sacos lanzados, arañas colgando y gotas que caen
function drawZonasAire() {
  if (!G.zonas) return;
  for (const z of G.zonas) {
    const k = 1 - z.t / z.max;
    if (z.tipo === 'vuela') {
      const x = z.x0 + (z.x - z.x0) * k, y = z.y0 + (z.y - z.y0) * k - Math.sin(k * Math.PI) * 90;
      sombraSuelo(x, z.y0 + (z.y - z.y0) * k + 10, 10 + k * 10, .25);
      if (z.que === 'red') drawSpr('r_red~reposo~' + Math.min(3, Math.floor(k * 4)), x, y, 2.4 + k * 3, {});
      else drawSpr('r_saco~reposo~0', x, y, 3, { rot: Math.atan2(z.y - z.y0, z.x - z.x0) });
    } else if (z.tipo === 'gota') {
      // la araña baja hasta media altura; en los últimos 0,35 s la gota cae al suelo
      const baja = Math.min(1, k * 2.2), ya = z.y - 150 + baja * 60;
      drawSpr(animKey('r_gota', 'reposo', k * 2), z.x, ya, 3.4, { alpha: Math.min(1, z.t / .15 + .3) });
      if (z.t < .35) { const c = 1 - z.t / .35; drawSpr(animKey('r_gota', 'caminar', c), z.x, ya + 20 + (z.y - ya - 20) * c * c, 3, { luz: .3 }); }
    }
  }
}
function circuloVeneno(x, y, r, a) {
  ctx.strokeStyle = `rgba(155,255,122,${a})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y, r, r * .6, 0, 0, Math.PI * 2); ctx.stroke();
}

export { drawZonasAire, drawZonasSuelo, gotaVeneno, lanzarZona, updateZonas };
