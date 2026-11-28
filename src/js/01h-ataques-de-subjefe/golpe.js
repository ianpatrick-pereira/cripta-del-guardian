// Ataque del Gólem de Roca (v0.64): Golpe.
// Elige según dónde estés al empezar:
//  · cerca  → puñetazo hacia ti (src/sprites/golem_puno.png): pega fuerte (+1 daño) y te empuja lejos
//  · lejos → golpea el suelo con los dos puños (golem_suelo.png): se abre una grieta en línea recta hacia donde
//            estabas (t_grieta) y detrás de ella brotan picos de piedra (t_picos) que avanzan hasta ti
// La dirección se fija al empezar: si te mueves de lado, la esquivas.
import { angDiff, angTo, dist } from '../01-utilidades.js';
import { defSubMove } from '../01a-registro.js';
import { sfx } from '../05-audio.js';
import { G } from '../07-estado.js';
import { hitsWall, moveEnt } from '../08-colisiones.js';
import { shake } from '../09-efectos.js';
import { hurtPlayer } from '../13-armadura.js';
import { elemHit, hazard } from '../14-enemigos.js';
import { subIdle } from '../15-subjefes.js';

const GOLPE_CERCA = 125;                        // más cerca que esto: puñetazo
const GRIETA_PASO = 34, GRIETA_ALCANCE = 520, GRIETA_VEL = 430; // grieta: un tramo cada 34 px, hasta 520 px, avanza a 430 px/s
const golpeFx = (x, y, key, s, life, rot = 0) => G.parts.push({ x, y, vx: 0, vy: 0, life, max: life, fx: key, s, rot, color: '', size: 0 });

defSubMove('golpe', {
  hacer(e, dt, c) {
    const { p, ph2 } = c;
    e.timer += dt;
    if (e.k === 0) {
      e.k = 1; e.ca = angTo(e, p);
      e.modo = dist(e, p) < GOLPE_CERCA + e.r ? 'puno' : 'suelo';
      e.tramos = 0;
    }
    if (e.modo === 'puno') {
      // 0-0,45 s se echa atrás · 0,45 golpea (avanza un poco) · después se recupera
      if (e.k === 1 && e.timer >= .45) {
        e.k = 2;
        moveEnt(e, Math.cos(e.ca) * 24, Math.sin(e.ca) * 24);
        const px = e.x + Math.cos(e.ca) * (e.r + 34), py = e.y + Math.sin(e.ca) * (e.r + 34);
        golpeFx(px, py - 10, 't_golpe', 3.2, .5);
        shake(10); sfx(70, .25, 'sawtooth', .07, -30);
        const d = dist(e, p), a = Math.abs(angDiff(angTo(e, p), e.ca));
        if (d < e.r + p.r + 62 && a < .95 && hurtPlayer(e.dmg + 1, e.name)) {
          const kb = angTo(e, p); p.kbx = Math.cos(kb) * 620; p.kby = Math.sin(kb) * 620;
          elemHit('earth', e);
        }
      }
      if (e.timer > 1.15) subIdle(e);
      return;
    }
    // golpe al suelo: 0-0,55 s alza los puños · 0,55 golpea · la grieta avanza hacia ti
    if (e.k === 1 && e.timer >= .55) {
      e.k = 2; e.t0 = e.timer;
      shake(14); sfx(55, .5, 'sawtooth', .08, -20);
      golpeFx(e.x + Math.cos(e.ca) * e.r * .6, e.y + 10, 't_golpe', 4, .55);
      e.lineas = ph2 ? [e.ca, e.ca - .38, e.ca + .38] : [e.ca];
      e.vivas = e.lineas.map(() => true);
    }
    if (e.k === 2) {
      // abre los tramos de grieta según avanza; cada tramo avisa 0,35 s y entonces brotan los picos
      const hasta = Math.min(GRIETA_ALCANCE, (e.timer - e.t0) * GRIETA_VEL);
      while ((e.tramos + 1) * GRIETA_PASO <= hasta) {
        e.tramos++;
        const d = e.r + e.tramos * GRIETA_PASO;
        e.lineas.forEach((a, i) => {
          if (!e.vivas[i]) return;
          const x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d;
          if (hitsWall(x, y, 10)) { e.vivas[i] = false; return; }
          hazard(x, y, 24, .35, 1, '#c09060', { owner: e, fx: 't_grieta', s: 2.6, rot: a, fxFin: 't_picos', sFin: 3.2, fy: 0, fxT: .75, sinCirculo: true, sinChispas: true });
        });
        if (e.tramos % 3 === 0) sfx(90 + e.tramos * 6, .08, 'square', .03, -40);
      }
      if (hasta >= GRIETA_ALCANCE || !e.vivas.some(v => v)) e.k = 3;
    }
    if (e.k === 3 && e.timer > e.t0 + GRIETA_ALCANCE / GRIETA_VEL + .9) subIdle(e);
  }
});
