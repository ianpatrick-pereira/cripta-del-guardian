import { tr } from '../00b-textos.js';
import { angTo, rand } from '../01-utilidades.js';
import { defEnemy } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { enemyShoot, flankPoint, leadAng, takeToken, telegraph } from '../14-enemigos.js';
defEnemy('spider', {
  orden: 7,
  stats: { hp: 6, r: 12, speed: 210, dmg: 1, spr: 'spider', s: 2 },
  bestiario: { n: tr('Araña'), d: tr('Zigzag veloz; escupe telaraña que frena.') },
  esquiva: true,
  // Arañas: zigzag rápido hacia su flanco; desde lejos escupen telaraña que te frena
  ia(e, c) {
    const { dt, cdt, hidden, tgt, d, go, done } = c;
    e.cd -= cdt; e.shootT -= cdt;
    if (e.st === 'dash') {
      e.st_t -= dt; go(e.ca, e.speed);
      if (e.st_t <= 0) { e.st = 'walk'; e.cd = rand(.3, .6); }
    } else if (e.st === 'tele') {
      e.st_t -= dt;
      if (e.st_t <= 0) { enemyShoot(e, leadAng(e, 190), 190, 8, '#e8e8d8', 1, 'web'); sfx(500, .08, 'triangle', .03, -250); done(.3, .6); e.shootT = rand(3, 4.5); }
    } else if (e.st === 'walk' && e.cd <= 0) {
      if (!hidden && (G.floor >= 2 || e.elite) && d > 150 && e.shootT <= 0 && e.los && takeToken(e)) telegraph(e, .4);
      else { e.st = 'dash'; e.st_t = .32; e.ca = angTo(e, flankPoint(e, tgt, d)) + rand(-.6, .6); }
    }
  }
});
