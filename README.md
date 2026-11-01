# Cripta del Guardián

Roguelike de mazmorras en 2D con vista desde arriba que se juega en el navegador: tres clases, 41 armas, 18 enemigos, subjefes, jefes, salas de evento y una campaña de 8 pisos.

**Jugar:** en https://ianpatrick-pereira.github.io/cripta-del-guardian/ (se actualiza sola cada vez que un cambio entra en `main` y pasa las pruebas), o abre `cripta.html` en el navegador.

```
npm install          # solo la primera vez (instala Playwright y las herramientas del build)
npx playwright install chromium
npm run dev          # servidor de desarrollo: http://localhost:8000, se recarga solo al guardar
npm run build        # une src/ en cripta.html
npm test             # 32 pruebas automáticas (~1 minuto)
```

Cada push y cada pull request ejecuta las pruebas en GitHub Actions (`.github/workflows/pruebas.yml`).

## Cómo está organizado el código

Desde la v0.29 el código fuente vive en `src/`. **`cripta.html` ya no se edita a mano**: se genera.
Desde la v0.30 cada enemigo, arma y sala de evento es un archivo propio.
Desde la v0.31 hay pruebas automáticas en `pruebas/`.
Desde la v0.32 cada jefe, subjefe y ataque de jefe también es un archivo propio.
Desde la v0.33 los pisos, las oleadas y el botín son archivos de datos en `src/datos/`: se diseñan sin tocar código.
Desde la v0.34 también la decoración de cada piso y los dos finales; y hay herramientas para medir el balance y el rendimiento.
Desde la v0.38 cada archivo de `src/js/` es un módulo ES: declara con `import` lo que usa y con `export` lo que ofrece; y `npm run dev` recarga el juego al guardar.

```
./
├── build.js          revisa los módulos de src/ y los une en cripta.html
├── dev.js            servidor de desarrollo con recarga automática
├── cripta.html       el juego listo para publicar (generado)
├── pruebas/          probar.js (el bot y las pruebas) y referencia.json (cómo jugaron las partidas)
└── src/
    ├── pagina.html   HTML de los menús y pantallas, con @@CSS@@ y @@JS@@ como huecos
    ├── estilos.css   estilos
    ├── datos/        diseño sin código: pisos/ (uno por piso), oleadas.jsonc, botin.jsonc y finales.jsonc
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

1. Arranca `npm run dev` y abre http://localhost:8000. Edita el archivo que toca en `src/`: al guardar, el juego se recarga solo (si algo no cuadra, el error sale en el navegador).
2. Ejecuta `node build.js` → regenera `cripta.html`.
3. Ejecuta `node pruebas/probar.js` (1 minuto aprox.). No publiques si alguna prueba sale con ✗.
4. Publica `cripta.html` como siempre.

`node build.js --check` dice si `cripta.html` está al día con `src/`.

`cripta.html` no trae `<!doctype>` ni `<head>` porque el visor de artifacts de Claude lo envuelve. Para servirlo suelto, `node build.js --web carpeta/index.html` escribe además la página completa, con la etiqueta *viewport* que necesitan los celulares (GitHub Pages usa esta).

## Pruebas automáticas

`node pruebas/probar.js` abre el juego en un navegador sin ventana y juega solo, con el azar fijado (la misma semilla da siempre la misma partida). Hace 32 pruebas:

- **clases** (24): Caballero, Tirador y Asesino en cada uno de los 8 pisos. Un bot despeja las salas de combate, el subjefe y el jefe con mandos táctiles (que apuntan solos), ataque cargado, esquiva, habilidad F y, desde el piso 3, la habilidad elemental R. Es inmortal para poder llegar al final; si no termina una sala a tiempo, se rematan los enemigos que queden y se comprueba que la sala se abre igual.
- **armas** (1): las 41 armas a 1★, 3★ y 5★, con ataque normal y cargado; cada combinación tiene que hacer daño.
- **salas** (1): genera pisos hasta ver las 7 salas de evento y las usa todas.
- **guardado** (4): partida vieja, arma que ya no existe, guardado de una versión futura y sin guardado.
- **finales** (2): sale el final verdadero con el diario completo y el otro si faltan notas.

Una prueba sale con ✗ si hay un error de JavaScript (el informe dice en qué archivo de `src/` y en qué línea), una posición o vida imposible (NaN), una sala que no se termina, un arma que no hace daño o un guardado que no se comporta como debe.

Además, cada partida se compara con `pruebas/referencia.json`. «Cambió respecto a la referencia» significa que esa partida se jugó distinto que antes. Si tocaste algo de jugabilidad a propósito, es lo esperado; si solo reorganizaste código o cambiaste otra cosa, es una pista de que rompiste algo. Cuando el cambio sea el buscado, guarda la nueva referencia:

```
node pruebas/probar.js --referencia
```

Para ir más rápido se puede probar un solo grupo: `node pruebas/probar.js armas` (o `clases`, `salas`, `guardado`, `finales`).

Necesita Node.js y Playwright (`npm install playwright` y `npx playwright install chromium` si no están).

## Diseñar con los archivos de datos

`src/datos/` guarda el diseño del juego en archivos de texto sencillos (JSON con comentarios `//`). Cada valor lleva al lado una explicación.

- **`pisos/1-la-cripta.jsonc` … `8-corazon-de-elena.jsonc`**: nombre, qué enemigos salen cerca y lejos de la entrada, el jefe, cuántos élites, si es un piso de terror, la luz, la música y los colores.
- **`oleadas.jsonc`**: cuántas oleadas tiene cada sala y cuántos enemigos salen en cada una.
- **`botin.jsonc`**: qué sueltan los enemigos, las cajas, los cofres, los jefes y los subjefes, y con qué probabilidad sale cada rareza de arma y cada número de estrellas.
- **`finales.jsonc`**: los textos de los dos finales. Al «Salir victorioso» tras vencer a Elena sale el final verdadero si el diario tiene todas las notas; si no, el otro, que dice cuántas páginas faltan.
- Dentro de cada piso, el bloque **`ambiente`** decide la decoración: colores de antorchas y plantas, partículas, telarañas y qué objetos hay por el suelo.

Al ejecutar `build.js` se comprueban: si falta una coma, dice el archivo y la línea; si un piso usa un enemigo o un jefe que no existe, dice cuál. Un cambio en estos archivos cambia cómo se juega, así que las pruebas dirán «cambió respecto a la referencia»: es lo esperado. Si todas salen ✓, guarda la nueva referencia con `--referencia`.

## Medir el balance y el rendimiento

- `node pruebas/balance.js` (unos 6 minutos) escribe `pruebas/informe-balance.md`: cuántas vidas necesita un bot inmortal para terminar cada piso con cada clase, quién hace más daño y el daño por segundo de cada arma a 3★ (contra un blanco y contra un grupo). El bot juega peor que una persona: sirve para comparar, no como dificultad real. `node pruebas/balance.js 12` juega más partidas; `node pruebas/balance.js armas` solo mide las armas.
- `node pruebas/rendimiento.js` mide los milisegundos por fotograma en el piso 8 con 20, 40 y 80 enemigos y contra el jefe, en escritorio y en un celular simulado, con calidad alta, media y baja. Sin tarjeta gráfica el dibujo sale más lento que en un aparato real: para la cifra real, activa en el juego *Opciones → Mostrar FPS*.
- En el menú, **Historial** guarda las últimas 50 partidas: piso, tiempo, arma y qué te derrotó, con un resumen por clase.

## Añadir contenido

- **Enemigo nuevo:** copia un archivo de `01b-enemigos/` parecido, cambia el id, los datos, el sprite y la IA, y añade el id a la lista de enemigos de algún piso (`src/datos/pisos/`). Sale en el bestiario solo.
- **Arma nueva:** copia un archivo de `01c-armas/` parecido y cambia el id y los datos. Entra sola en el sorteo de botín según su rareza; dale un `orden` mayor que el de la última.
- **Sala de evento nueva:** copia un archivo de `01d-salas/` y cambia el id, el objeto y sus funciones. Entra sola en el sorteo de salas de cada piso.
- **Jefe nuevo:** copia un archivo de `01e-jefes/`, cambia el id, los datos y sus listas de ataques (p1, p2, p3), y ponlo como `jefe` de un piso en `src/datos/pisos/`. Puede reutilizar el dibujo de otro con `look` y cambiarle el color con `tint`, o traer su propio `aspecto`.
- **Subjefe nuevo:** copia un archivo de `01f-subjefes/` y cambia el id, el `piso` y los datos. Hay uno por piso: el nuevo reemplaza al que tenga ese número.
- **Ataque nuevo:** copia un archivo de `01g-ataques-de-jefe/` (o `01h-` para subjefes), cambia el id y su `hacer`, y añade el id a las listas p1/p2/p3 de los jefes que quieras que lo usen.

La explicación de cada campo está al principio de `01a-registro.js`.

## Reglas

- Cada archivo es un módulo: si usa algo de otro archivo, lo importa (`import { G, newRun } from './07-estado.js';`), y si otro archivo lo necesita, lo exporta (`export { ... };` al final). El build avisa si falta un import, si importas algo que no existe o si escribes un nombre mal, con el archivo, la línea y el arreglo.
- Un import es de solo lectura: otro archivo no puede hacer `paused = true`. Las pocas variables que se cambian desde fuera traen su función (`setPaused(true)`, `setQL(...)`) junto a su declaración.
- Los datos de `src/datos/` se importan con `import { DATOS } from '../datos/index.js';` (ese archivo no existe en disco: lo crea el build).
- Se usa solo `import { a, b } from './archivo.js'` y `export { a, b }` o `export function`/`export const` (sin `default`, `*` ni `as`). Si usas algo nuevo del navegador (por ejemplo `fetch`), añádelo a `GLOBALES` en `build.js`.
- Los archivos se ejecutan en orden por su número (00, 01, 01a, 01b...), como antes: el build quita los import/export y los une dentro de una función. Una carpeta numerada se une en su lugar con sus archivos en orden alfabético. Un archivo nuevo entra solo según su número. No se usa un empaquetador como esbuild a propósito: reordena los archivos según quién importa a quién y cambia `const` por `var`, así que con tantas dependencias cruzadas un valor podría leerse antes de existir y quedar `undefined` sin ningún aviso.
- Las carpetas de contenido (`01b` a `01h`) se cargan antes que el motor: sus archivos solo deben llamar a `defEnemy`, `defWeapon`, `defRoom`, `defBoss`, `defSub`, `defBossMove` o `defSubMove` (o declarar funciones), nunca ejecutar código del juego al cargar.
- Si cambias la forma de lo que se guarda (partida en curso, progreso), sube `SAVE_VER` en `04-guardado.js` y añade el paso en `SAVE_MIGRA`. Una partida en curso incompatible se descarta; las gemas y el progreso nunca.
- Dos hilos pueden trabajar a la vez si tocan archivos distintos; ambos deben ejecutar `build.js` al terminar.
