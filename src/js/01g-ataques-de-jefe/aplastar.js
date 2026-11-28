// Ataque de La Reina Tejedora (v0.65): Salto Aplastante.
// Salta hacia donde vas a estar (la sombra roja marca dónde cae). Al caer el suelo se raja como una telaraña,
// y un momento después las grietas brillan de veneno y estalla un anillo de orbes ácidos. En la fase 3 salta dos veces.
import { TAU, dist, rand } from '../01-utilidades.js';
import { defBossMove } from '../01a-registro.js';
import { D } from '../03-datos-del-juego.js';
import { noise, sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall } from '../08-colisiones.js';
import { burst, shake } from '../09-efectos.js';
import { hurtPlayer } from '../13-armadura.js';
import { enemyShoot, quien } from '../14-enemigos.js';
import { bossIdle } from '../16-jefes.js';
const marcaSuelo = (x, y, fx, s, life, pre = 0) => G.parts.push({ x, y, vx: 0, vy: 0, life, max: life, fx, s, pre, color: '', size: 0 });
defBossMove('aplastar', {
  hacer(e, dt, c) {
    const { p, ph2, ph3 } = c;
    e.timer += dt;
    if (!e.reps) e.reps = ph3 ? 2 : 1;
    if (e.k === 0) { e.air = true; e.k = 1; sfx(140, .3, 'sawtooth', .04, 200); }
    if (e.timer < .45) { const t = .55 * D().lead, tx = p.x + G.pv.x * t, ty = p.y + G.pv.y * t; e.tgt = hitsWall(tx, ty, e.r) ? { x: p.x, y: p.y } : { x: tx, y: ty }; }
    if (e.timer >= 1 && e.k === 1) {
      e.k = 2; e.air = false;
      if (!hitsWall(e.tgt.x, e.tgt.y, e.r)) { e.x = e.tgt.x; e.y = e.tgt.y; }
      shake(16); noise(.3, .1, 500); burst(e.x, e.y, '#6a5a6a', 18, 220, 5);
      marcaSuelo(e.x, e.y + 14, 'r_impacto', 5.6, .5);
      if (dist(e, p) < e.r + p.r + 24) hurtPlayer(2, quien(e));
    }
    // las grietas se llenan de veneno y estalla el anillo
    if (e.k === 2 && e.timer >= 1.3) {
      e.k = 3;
      marcaSuelo(e.x, e.y + 14, 'r_anillo', 5.6, .85, .3);
      const n = ph2 ? 16 : 12, off = rand(0, TAU);
      for (let i = 0; i < n; i++) { const pr = enemyShoot(e, off + i * TAU / n, 160, 7, '#9bff7a'); pr.anim = 'l_orbe'; pr.ss = 7 * .32; pr.rotOff = Math.PI / 4; }
      sfx(90, .3, 'square', .04, -40);
    }
    if (e.timer > 1.75) { if (--e.reps > 0) { e.k = 0; e.timer = .2; } else bossIdle(e); }
  }
});
