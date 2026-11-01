// ================= Registro de contenido =================
// Cada enemigo vive en su propio archivo dentro de 01b-enemigos/ y se registra con defEnemy.
// Para añadir uno nuevo: copia un archivo de esa carpeta, cambia el id y sus datos, y ponlo en la lista
// de enemigos de algún piso (FLOORS, en 03-datos-del-juego.js). No hace falta tocar nada más.
//   orden      posición en el bestiario
//   stats      vida, radio, velocidad, daño, sprite y escala
//   bestiario  nombre y descripción que ve el jugador
//   sprite     { clave, mapa (filas de píxeles o el nombre de otro mapa), paleta }
//   esquiva    true si se aparta de tus disparos
//   ia(e, c)   su comportamiento cada fotograma (o el id de otro enemigo para copiar el suyo)
//   forma(e, f), debajo(e, la), encima(e, la, white)   ajustes y detalles de dibujo
//   alRecibir(e, daño, ang, o) → daño,  alMorir(e),  sinEmpuje
const ENEMIES = {};
function defEnemy(id, def) { ENEMIES[id] = def; }
const enemyList = () => Object.keys(ENEMIES).sort((a, b) => ENEMIES[a].orden - ENEMIES[b].orden);

// Cada arma vive en su propio archivo dentro de 01c-armas/ y se registra con defWeapon.
// Para añadir una: copia el archivo de una parecida, cambia el id y sus datos. Saldrá en el botín sola.
//   orden      posición en la lista (el sorteo de botín la recorre en este orden)
//   datos      nombre, tipo (melee, bow, staff), forma del dibujo, rareza, daño, cadencia, alcance...
//              armas de sigilo: spd = velocidad al empuñarla, dodge = la esquiva recarga antes,
//              veil = s de invisibilidad al matar, back = daño extra por la espalda
//   familia    clase que la domina (+30 %): knight, archer o rogue; sin familia = neutral
//   potencia   corrección de daño para armas que golpean varias veces o en área (1 = normal)
//   estilo     solo armas con estilo propio: d (texto), esp (mejora de forja), el (nombres elementales),
//              ataque(p, w, { a, dmg, cost }) y cargado(p, w, { a, S, dm, col }) con S = estrellas
const WEAPON_DEFS = {};
function defWeapon(id, def) { WEAPON_DEFS[id] = def; }
const weaponList = () => Object.keys(WEAPON_DEFS).sort((a, b) => WEAPON_DEFS[a].orden - WEAPON_DEFS[b].orden);

// Cada sala de evento vive en su propio archivo dentro de 01d-salas/ y se registra con defRoom.
// Cada piso elige 2 o 3 al azar entre todas las registradas.
//   orden            posición en la lista (el sorteo de salas la recorre en este orden)
//   objeto           tipo de objeto con el que interactúa el jugador en esa sala
//   colocar(r)       prepara la sala r al generar el piso
//   usable(it)       si el objeto se puede usar ahora (muestra el aviso «E»)
//   usar(p, it)      qué pasa al usarlo
//   dibujar(it, b)   cómo se dibuja el objeto (b = pequeño balanceo)
//   aviso(it, key)   → [línea 1, línea 2, color] del cartel al acercarse
//   actualizar(dt)   opcional: lógica de cada fotograma
const ROOM_DEFS = {}, ROOM_OBJ = {};
function defRoom(id, def) { ROOM_DEFS[id] = def; ROOM_OBJ[def.objeto] = def; }
const roomList = () => Object.keys(ROOM_DEFS).sort((a, b) => ROOM_DEFS[a].orden - ROOM_DEFS[b].orden);

// Cada jefe vive en su propio archivo dentro de 01e-jefes/ y se registra con defBoss.
// Para añadir uno: copia el archivo de uno parecido, cambia el id y sus datos, y ponlo como boss de un piso
// (FLOORS, en 03-datos-del-juego.js). Sale en el bestiario solo.
//   orden      posición en el bestiario
//   datos      name, hp, r (radio), minion (enemigo que invoca), want (distancia a la que se queda),
//              col (color de sus balas), tint y scale (color y tamaño del dibujo), look (usar el aspecto de otro jefe),
//              p1, p2, p3: ataques que elige en cada fase (cada uno es un archivo de 01g-ataques-de-jefe/)
//   logro      opcional: logro que se gana al derrotarlo
//   aspecto(g, e, fill, ph2)   su dibujo, si no reutiliza el de otro con look
const BOSS_DEFS = {};
function defBoss(id, def) { BOSS_DEFS[id] = def; }
const bossList = () => Object.keys(BOSS_DEFS).sort((a, b) => BOSS_DEFS[a].orden - BOSS_DEFS[b].orden);

// Cada subjefe vive en su propio archivo dentro de 01f-subjefes/ y se registra con defSub.
//   piso       piso en el que aparece (uno por piso)
//   datos      name, spr y s (sprite y escala), r, hp, speed, tint, minion, want, pc (color de balas),
//              p1, p2: ataques de cada fase (cada uno es un archivo de 01h-ataques-de-subjefe/)
//   forma(e, f), encima(e, lift, p), alMorir(e), rompeAlCaminar   ajustes opcionales
const SUB_DEFS = {};
function defSub(id, def) { SUB_DEFS[id] = def; }

// Cada ataque de jefe o subjefe vive en su archivo (01g-ataques-de-jefe/, 01h-ataques-de-subjefe/).
// Un ataque nuevo se usa poniendo su id en las listas p1/p2/p3 de un jefe o subjefe.
//   hacer(e, dt, c)   lo que hace cada fotograma; termina llamando a bossIdle(e) o subIdle(e).
//                     c trae p (jugador), a y d (ángulo y distancia al jugador), ph2, ph3 y los datos
//                     del jefe (B, bcol) o del subjefe (S, move)
//   aviso(e)          opcional: dibuja el aviso (línea roja, mira...) antes que el jefe
// En vez de un objeto se puede dar el id de otro ataque para copiar el suyo.
const BOSS_MOVES = {}, SUB_MOVES = {};
function defBossMove(id, def) { BOSS_MOVES[id] = typeof def === 'string' ? BOSS_MOVES[def] : def; }
function defSubMove(id, def) { SUB_MOVES[id] = typeof def === 'string' ? SUB_MOVES[def] : def; }
