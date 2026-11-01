// ================= Compañeros =================
import { ctx } from './00-inicio.js';
import { TAU, angTo, dist } from './01-utilidades.js';
import { sfx } from './05-audio.js';
import { G, rc } from './07-estado.js';
import { moveEnt, roomAt } from './08-colisiones.js';
import { addText } from './09-efectos.js';
import { nearestEnemy } from './11-jugador.js';
import { armorSh } from './13-armadura.js';
import { hurtEnemy } from './14-enemigos.js';
import { drawShadow } from './36-mar-de-lava.js';
const PETS = {
  owl:   { n: 'Búho vigía',   d: 'Vuela a tu lado y dispara a los enemigos cercanos.', cost: 3, c: '#c9a46a' },
  wolf:  { n: 'Lobo sombrío', d: 'Persigue y muerde a los enemigos de la sala.',       cost: 5, c: '#a8a0c0' },
  fairy: { n: 'Hada de luz',  d: 'Repone 1 de escudo cada 6 s y te cura 1 al despejar una sala.', cost: 7, c: '#ffe27a' },
};
function mkPet(kind) { const p = G.player; return kind && PETS[kind] ? { kind, x: p.x - 20, y: p.y - 20, t: 0, cd: 1, tgt: null } : null; }
function updatePet(dt) {
  const pet = G.pet, p = G.player; if (!pet || G.over) return;
  pet.t += dt; pet.cd -= dt;
  const follow = (ox, oy, k) => { const tx = p.x + ox, ty = p.y + oy, f = 1 - Math.exp(-k * dt); pet.x += (tx - pet.x) * f; pet.y += (ty - pet.y) * f; };
  const inRoom = e => !e.dead && !e.air && roomAt(e.x, e.y) === G.cur;
  if (pet.kind === 'owl') {
    follow(-26, -30 + Math.sin(pet.t * 3) * 4, 5);
    if (pet.cd <= 0) {
      const t = nearestEnemy(pet, 290);
      if (t && inRoom(t)) {
        pet.cd = 1.1; const a = angTo(pet, t);
        G.proj.push({ x: pet.x, y: pet.y, vx: Math.cos(a) * 430, vy: Math.sin(a) * 430, r: 5, dmg: 2, owner: 'player', kind: 'magic', pierce: 0, hit: new Set(), life: 1.2, color: '#ffd27a', fx: 'homing' });
        sfx(1200, .04, 'sine', .015, -300);
      }
    }
  } else if (pet.kind === 'wolf') {
    if (!pet.tgt || !inRoom(pet.tgt) || dist(pet.tgt, p) > 320) pet.tgt = G.enemies.filter(inRoom).sort((a, b) => dist(a, p) - dist(b, p))[0] || null;
    if (pet.tgt) {
      const a = angTo(pet, pet.tgt), d = dist(pet, pet.tgt);
      if (d > pet.tgt.r + 10) { const ent = { x: pet.x, y: pet.y, r: 8 }; moveEnt(ent, Math.cos(a) * 240 * dt, Math.sin(a) * 240 * dt); pet.x = ent.x; pet.y = ent.y; }
      else if (pet.cd <= 0) { pet.cd = .7; hurtEnemy(pet.tgt, 3, a, 140, {}); sfx(180, .06, 'sawtooth', .03, -80); }
      pet.flip = Math.cos(a) < 0;
    } else { follow(-30, 18, 4); pet.flip = p.x < pet.x; }
  } else {
    follow(Math.cos(pet.t * 2) * 30, Math.sin(pet.t * 2) * 22 - 12, 6);
    if (pet.cd <= 0) { pet.cd = 6; const maxSh = p.maxSh + rc('escudo') + armorSh(p); if (p.sh < maxSh) { p.sh++; addText(pet.x, pet.y - 12, '+1 escudo', '#ffe27a', 11); sfx(1500, .08, 'sine', .02); } }
  }
}
function drawPet() {
  const pet = G.pet; if (!pet) return;
  const x = Math.round(pet.x), y = Math.round(pet.y);
  if (pet.kind === 'owl') {
    drawShadow(x, y + 22, 6);
    const flap = Math.sin(pet.t * 14) * 4;
    ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x - 11, y - 2 + flap, 6, 8); ctx.fillRect(x + 5, y - 2 + flap, 6, 8);
    ctx.fillStyle = '#a07a4a'; ctx.fillRect(x - 6, y - 7, 12, 14);
    ctx.fillStyle = '#ffd27a'; ctx.fillRect(x - 4, y - 4, 3, 3); ctx.fillRect(x + 1, y - 4, 3, 3);
    ctx.fillStyle = '#e3a24a'; ctx.fillRect(x - 1, y - 1, 2, 3);
  } else if (pet.kind === 'wolf') {
    drawShadow(x, y + 4, 9);
    const s = pet.flip ? -1 : 1, bob = Math.abs(Math.sin(pet.t * 10)) * 2;
    ctx.fillStyle = '#4a4458'; ctx.fillRect(x - 10, y - 6 - bob, 18, 9); ctx.fillRect(x - 9, y + 2, 3, 4); ctx.fillRect(x + 4, y + 2, 3, 4);
    ctx.fillRect(x + s * 8 - 3, y - 11 - bob, 8, 7); ctx.fillRect(x + s * 8 - (s > 0 ? -1 : 3), y - 14 - bob, 3, 4);
    ctx.fillStyle = '#ff5a6a'; ctx.fillRect(x + s * 10 - 1, y - 9 - bob, 2, 2);
    ctx.fillStyle = '#4a4458'; ctx.fillRect(x - s * 12 - 2, y - 7 - bob, 4, 3);
  } else {
    const g = ctx.createRadialGradient(x, y, 1, x, y, 16); g.addColorStop(0, 'rgba(255,226,122,.7)'); g.addColorStop(1, 'rgba(255,226,122,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 16, 0, TAU); ctx.fill();
    const w = Math.abs(Math.sin(pet.t * 16)) * 5 + 2;
    ctx.fillStyle = 'rgba(220,240,255,.75)'; ctx.fillRect(x - 3 - w, y - 4, w, 5); ctx.fillRect(x + 3, y - 4, w, 5);
    ctx.fillStyle = '#fff6d0'; ctx.fillRect(x - 2, y - 3, 4, 6);
  }
}

export { PETS, drawPet, mkPet, updatePet };
