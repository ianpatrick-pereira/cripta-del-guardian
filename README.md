# Cripta del Guardián

Roguelike de mazmorras en 2D con vista desde arriba que se juega en el navegador: tres clases, 41 armas, 18 enemigos, subjefes, jefes, salas de evento y una campaña de 8 pisos.

**Jugar:** abre `cripta.html` en el navegador, o la [versión publicada](https://claude.ai/artifact/SXkA8uYzdymQ37YAaXuFTj).

```
npm install          # solo la primera vez (instala Playwright para las pruebas)
npx playwright install chromium
npm run build        # une src/ en cripta.html
npm test             # 30 pruebas automáticas (~1 minuto)
```

Cada push y cada pull request ejecuta las pruebas en GitHub Actions (`.github/workflows/pruebas.yml`).

## Cómo está organizado el código

Desde la v0.29 el código fuente vive en `src/`. **`cripta.html` ya no se edita a mano**: se genera.
Desde la v0.30 cada enemigo, arma y sala de evento es un archivo propio.
Desde la v0.31 hay pruebas automáticas en `pruebas/`.
Desde la v0.32 cada jefe, subjefe y ataque de jefe también es un archivo propio.

```
./
├── build.js          une src/ en cripta.html
├── cripta.html       el juego listo para publicar (generado)
├── pruebas/          probar.js (el bot y las pruebas) y referencia.json (cómo jugaron las partidas)
└── src/
    ├── pagina.html   HTML de los menús y pantallas, con @@CSS@@ y @@JS@@ como huecos
    ├── estilos.css   estilos
    └── js/
        ├── 01a-registro.js   defEnemy, defWeapon, defRoom, defBoss, defSub...: qué campos lleva cada archivo
        ├── 01b-enemigos/     un archivo por enemigo (18): datos, sprite, bestiario, IA y dibujo
        ├── 01c-armas/        un archivo por arma (41): datos, familia y, si tiene estilo propio, sus ataques
        ├── 01d-salas/        un archivo por sala de evento (7): cómo se coloca, se usa, se dibuja y su cartel
        ├── 01e-jefes/        un archivo por jefe (8): datos, ataques de cada fase y dibujo
        ├── 01f-subjefes/     un archivo por subjefe (8): piso, datos, ataques y detalles propios
        ├── 01g-ataques-de-jefe/      un archivo por ataque de jefe (13): qué hace y su aviso
        ├── 01h-ataques-de-subjefe/   un archivo por ataque de subjefe (12)
        └── 00-inicio.js … 39-menus.js   el motor: jugador, jefes, generación, dibujo, menús...
```

## Flujo para cualquier cambio

1. Edita el archivo que toca en `src/`.
2. Ejecuta `node build.js` → regenera `cripta.html`.
3. Ejecuta `node pruebas/probar.js` (1 minuto aprox.). No publiques si alguna prueba sale con ✗.
4. Publica `cripta.html` como siempre.

`node build.js --check` dice si `cripta.html` está al día con `src/`.

## Pruebas automáticas

`node pruebas/probar.js` abre el juego en un navegador sin ventana y juega solo, con el azar fijado (la misma semilla da siempre la misma partida). Hace 30 pruebas:

- **clases** (24): Caballero, Tirador y Asesino en cada uno de los 8 pisos. Un bot despeja las salas de combate, el subjefe y el jefe con mandos táctiles (que apuntan solos), ataque cargado, esquiva, habilidad F y, desde el piso 3, la habilidad elemental R. Es inmortal para poder llegar al final; si no termina una sala a tiempo, se rematan los enemigos que queden y se comprueba que la sala se abre igual.
- **armas** (1): las 41 armas a 1★, 3★ y 5★, con ataque normal y cargado; cada combinación tiene que hacer daño.
- **salas** (1): genera pisos hasta ver las 7 salas de evento y las usa todas.
- **guardado** (4): partida vieja, arma que ya no existe, guardado de una versión futura y sin guardado.

Una prueba sale con ✗ si hay un error de JavaScript (el informe dice en qué archivo de `src/` y en qué línea), una posición o vida imposible (NaN), una sala que no se termina, un arma que no hace daño o un guardado que no se comporta como debe.

Además, cada partida se compara con `pruebas/referencia.json`. «Cambió respecto a la referencia» significa que esa partida se jugó distinto que antes. Si tocaste algo de jugabilidad a propósito, es lo esperado; si solo reorganizaste código o cambiaste otra cosa, es una pista de que rompiste algo. Cuando el cambio sea el buscado, guarda la nueva referencia:

```
node pruebas/probar.js --referencia
```

Para ir más rápido se puede probar un solo grupo: `node pruebas/probar.js armas` (o `clases`, `salas`, `guardado`).

Necesita Node.js y Playwright (`npm install playwright` y `npx playwright install chromium` si no están).

## Añadir contenido

- **Enemigo nuevo:** copia un archivo de `01b-enemigos/` parecido, cambia el id, los datos, el sprite y la IA, y añade el id a la lista de enemigos de algún piso (`FLOORS` en `03-datos-del-juego.js`). Sale en el bestiario solo.
- **Arma nueva:** copia un archivo de `01c-armas/` parecido y cambia el id y los datos. Entra sola en el sorteo de botín según su rareza; dale un `orden` mayor que el de la última.
- **Sala de evento nueva:** copia un archivo de `01d-salas/` y cambia el id, el objeto y sus funciones. Entra sola en el sorteo de salas de cada piso.
- **Jefe nuevo:** copia un archivo de `01e-jefes/`, cambia el id, los datos y sus listas de ataques (p1, p2, p3), y ponlo como `boss` de un piso en `FLOORS`. Puede reutilizar el dibujo de otro con `look` y cambiarle el color con `tint`, o traer su propio `aspecto`.
- **Subjefe nuevo:** copia un archivo de `01f-subjefes/` y cambia el id, el `piso` y los datos. Hay uno por piso: el nuevo reemplaza al que tenga ese número.
- **Ataque nuevo:** copia un archivo de `01g-ataques-de-jefe/` (o `01h-` para subjefes), cambia el id y su `hacer`, y añade el id a las listas p1/p2/p3 de los jefes que quieras que lo usen.

La explicación de cada campo está al principio de `01a-registro.js`.

## Reglas

- Los archivos se unen en orden por su número (00, 01, 01a, 01b...) y comparten el mismo ámbito. Una carpeta numerada se une en su lugar con sus archivos en orden alfabético.
- `00-inicio.js` abre la función que envuelve todo y `39-menus.js` la cierra. Un módulo nuevo se numera entre ambos.
- Las carpetas de contenido (`01b` a `01h`) se cargan antes que el motor: sus archivos solo deben llamar a `defEnemy`, `defWeapon`, `defRoom`, `defBoss`, `defSub`, `defBossMove` o `defSubMove` (o declarar funciones), nunca ejecutar código del juego al cargar.
- Si cambias la forma de lo que se guarda (partida en curso, progreso), sube `SAVE_VER` en `04-guardado.js` y añade el paso en `SAVE_MIGRA`. Una partida en curso incompatible se descarta; las gemas y el progreso nunca.
- Dos hilos pueden trabajar a la vez si tocan archivos distintos; ambos deben ejecutar `build.js` al terminar.
