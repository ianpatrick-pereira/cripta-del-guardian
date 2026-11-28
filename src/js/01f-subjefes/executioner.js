// Subjefe del piso 3: El Verdugo
import { tr } from '../00b-textos.js';
import { ANIM } from '../02-pixel-art.js';
import { defSub } from '../01a-registro.js';
defSub('executioner', {
  piso: 3,
  datos: { name: tr('El Verdugo'), r: 26, hp: 450, speed: 72, tint: '#d4474b', minion: 'wraith', want: 0, spr: 'executioner', s: 3.4,
           efectos: { hacha: 'x_hacha', estela: 'x_estela', golpe: 'x_golpe', circulo: 'x_circulo' },
           p1: ['charge3', 'slam', 'charge3'], p2: ['charge3', 'slam', 'fan', 'summon'] },
  // rompe cajas y barriles al caminar
  rompeAlCaminar: true,
  // v0.65: alza el hacha antes del hachazo y al tomar impulso para embestir
  cuadro(e) {
    const H = ANIM[e.spr].herido.cuadros;
    if ((e.st === 'slam' && e.timer < .7) || (e.st === 'charge3' && e.k === 1)) return H[1];
    if (e.st === 'charge3' && e.k === 2) return ANIM[e.spr].caminar.cuadros[1];
    return null;
  }
});
