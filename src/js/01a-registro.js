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
