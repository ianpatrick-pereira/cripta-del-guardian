# Cripta del Guardián

Roguelike de mazmorras en 2D con vista desde arriba que se juega en el navegador: tres clases, 41 armas, 18 enemigos, subjefes, jefes, salas de evento y una campaña de 8 pisos.

**Jugar:** en https://ianpatrick-pereira.github.io/cripta-del-guardian/ (se actualiza sola cada vez que un cambio entra en `main` y pasa las pruebas), o abre `cripta.html` en el navegador.

```
npm install          # solo la primera vez (instala Playwright y las herramientas del build)
npx playwright install chromium
npm run dev          # servidor de desarrollo: http://localhost:8000, se recarga solo al guardar
npm run build        # une src/ en cripta.html
npm run tipos        # revisión de tipos con TypeScript (menos de 1 segundo)
npm test             # 33 pruebas automáticas (~1 minuto)
npm run capturas     # capturas del menú y de los 8 pisos en escritorio y celular (pruebas/capturas/)
```

Cada push y cada pull request ejecuta en GitHub Actions (`.github/workflows/pruebas.yml`) las pruebas, la revisión de tipos y los límites de balance, y guarda las capturas como «artifact» de la ejecución (se descargan desde la pestaña Summary).

## Cómo está organizado el código

Desde la v0.29 el código fuente vive en `src/`. **`cripta.html` ya no se edita a mano**: se genera.
Desde la v0.30 cada enemigo, arma y sala de evento es un archivo propio.
Desde la v0.31 hay pruebas automáticas en `pruebas/`.
Desde la v0.32 cada jefe, subjefe y ataque de jefe también es un archivo propio.
Desde la v0.33 los pisos, las oleadas y el botín son archivos de datos en `src/datos/`: se diseñan sin tocar código.
Desde la v0.34 también la decoración de cada piso y los dos finales; y hay herramientas para medir el balance y el rendimiento.
Desde la v0.38 cada archivo de `src/js/` es un módulo ES: declara con `import` lo que usa y con `export` lo que ofrece; y `npm run dev` recarga el juego al guardar.
Desde la v0.39 hay revisión de tipos (TypeScript sobre el JavaScript) y esquemas para los archivos de datos.
Desde la v0.40 el juego está en español e inglés: los textos visibles pasan por `tr()` y las traducciones viven en `src/textos/`.
Desde la v0.41 los dibujos de personajes, enemigos y objetos son imágenes PNG en `src/sprites/`.
Desde la v0.42 el balance se comprueba solo en cada cambio, con límites en `pruebas/balance-limites.jsonc`.

```
./
├── build.js          revisa los módulos de src/ y los une en cripta.html
├── dev.js            servidor de desarrollo con recarga automática
├── cripta.html       el juego listo para publicar (generado)
├── pruebas/          probar.js (el bot y las pruebas) y referencia.json (cómo jugaron las partidas)
└── src/
    ├── pagina.html   HTML de los menús y pantallas, con @@CSS@@ y @@JS@@ como huecos
    ├── estilos.css   estilos
    ├── sprites/      dibujos de personajes, enemigos y objetos: un PNG por cada uno
    ├── textos/       traducciones (en.jsonc)
    ├── datos/        diseño sin código: pisos/ (uno por piso), oleadas.jsonc, botin.jsonc y finales.jsonc
    └── js/
        ├── 01a-registro.js   defEnemy, defWeapon, defRoom, defBoss, defSub...: qué campos lleva cada archivo
        ├── 01b-enemigos/     un archivo por enemigo (18): datos, bestiario, IA y detalles de dibujo
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
3. Ejecuta `npm run tipos` y `node pruebas/probar.js` (1 minuto aprox.). No publiques si alguna prueba sale con ✗.
4. Publica `cripta.html` como siempre.

`node build.js --check` dice si `cripta.html` está al día con `src/`.

`cripta.html` no trae `<!doctype>` ni `<head>` porque el visor de artifacts de Claude lo envuelve. Para servirlo suelto, `node build.js --web carpeta/index.html` escribe además la página completa, con la etiqueta *viewport* que necesitan los celulares (GitHub Pages usa esta).

## Revisión de tipos y esquemas

Atrapan errores antes de jugar, sin abrir el juego:

- **Contenido (`npm run tipos`).** `src/tipos/contenido.d.ts` describe qué campos lleva un enemigo, un arma, una sala, un jefe, un subjefe o un ataque, y de qué tipo. TypeScript revisa cada archivo de `src/js/` contra esa descripción: si a un enemigo le falta `hp`, si un arma tiene `rarity: 'legendaria'` o si escribes `stast` en vez de `stats`, lo dice con archivo y línea (los mensajes de TypeScript están en inglés: `Property 'hp' is missing` = falta el campo hp). En VS Code se ve subrayado mientras escribes, y al poner el cursor sobre un campo aparece su explicación.
- **Datos (`node build.js`).** Cada archivo de `src/datos/` tiene su esquema en `src/datos/esquemas/` (qué campos lleva, de qué tipo y entre qué valores). El build no deja pasar un dato mal puesto: una probabilidad mayor que 1, un color sin `#`, un campo mal escrito, un tipo de decoración que no existe... En VS Code el esquema da autocompletado y explicación de cada campo (`.vscode/settings.json`).
- **Referencias (`node build.js`).** Que existan los ids a los que apunta el contenido: el `minion` de un jefe, los ataques de `p1`/`p2`/`p3`, el `look`, la `ia` copiada; que no haya dos archivos con el mismo id, ni dos subjefes en el mismo piso.
- `src/datos/index.d.ts` lo genera el build a partir de los esquemas: así el editor sabe qué hay dentro de `DATOS`.
- Para añadir un campo nuevo a un dato: añádelo al esquema (con su `description`) y ejecuta `node build.js`.
- El jugador, los enemigos en juego y `G` todavía no tienen tipo (`any`): se pueden ir tipando poco a poco.

## Dibujos (sprites)

Los personajes, los enemigos y los objetos (cofres, cajas, barriles, poción) son imágenes PNG pequeñas en `src/sprites/`, una por dibujo: `knight.png`, `slime.png`, `chest.png`... El nombre del archivo es el id que usa el juego.

- **Cambiar un dibujo:** ábrelo en un editor de pixel art (Aseprite, Piskel, LibreSprite o incluso Paint), píntalo y guárdalo como PNG. Al guardar, `npm run dev` recarga el juego con el dibujo nuevo. Cada píxel del PNG es un píxel del juego; el juego lo agranda (la `s` de `stats` es la escala).
- **Dibujo nuevo para un enemigo:** guarda `src/sprites/mi_enemigo.png` y pon `spr: 'mi_enemigo'` en los `stats` de su archivo de `01b-enemigos/`. El build avisa si un `spr` apunta a un PNG que no existe.
- Lo transparente del PNG es transparente en el juego. Máximo 64×64 píxeles y 62 colores por dibujo; vale cualquier formato de PNG salvo «entrelazado».
- El build convierte cada PNG en filas de píxeles y una paleta (`herramientas/png.js` los lee, sin dependencias), así que el juego sigue siendo un solo `cripta.html`.
- La armadura tiñe dos colores de cada clase (por ejemplo, el gris de la cota del caballero). Están en `ARMOR_PARTS`, en `38-armadura-visual.js`: si cambias esos colores en el PNG, cámbialos también ahí.
- Las armas, los jefes y los efectos se dibujan con código (formas y degradados), no con píxeles.

## Idiomas

El juego se escribe en español, directamente en el código, y cada texto que ve el jugador pasa por `tr()` (de *traducir*):

```js
showBanner(tr('Sala despejada'));             // texto fijo
addText(x, y, tr`Faltan ${n} monedas`);       // con valores: la clave es «Faltan {0} monedas»
```

- Las traducciones viven en `src/textos/<idioma>.jsonc` como `"texto en español": "traducción"`. Hoy hay `en.jsonc` (inglés). Los `{0}`, `{1}`... son los valores que pone el juego y deben seguir en la traducción (el build lo comprueba).
- También se traducen los textos fijos de `pagina.html` y los nombres de pisos y finales de `src/datos/`.
- Al añadir o cambiar un texto en español, `node build.js` avisa de qué traducciones faltan (con archivo y línea) y `node build.js --check` (y por tanto CI) falla hasta que estén. Si falta una, el juego muestra el español.
- **Idioma nuevo:** copia `en.jsonc` como `fr.jsonc`, traduce los valores y añade `fr: 'Français'` a `IDIOMAS` en `src/js/00b-textos.js`.
- El idioma se elige en Opciones (se guarda aparte del progreso). La primera vez se usa el del navegador: español si el navegador está en español, inglés si no.
- Un mismo texto en español tiene una sola traducción: «Tirador» es la clase y el enemigo a la vez (en inglés, *Sharpshooter* para los dos). Si algún día hace falta separarlos, basta con que el texto en español sea distinto.
- Un texto que no es para el jugador (clases CSS, nombres de fuentes, ids) no lleva `tr()`.

## Pruebas automáticas

`node pruebas/probar.js` abre el juego en un navegador sin ventana y juega solo, con el azar fijado (la misma semilla da siempre la misma partida). Hace 33 pruebas:

- **clases** (24): Caballero, Tirador y Asesino en cada uno de los 8 pisos. Un bot despeja las salas de combate, el subjefe y el jefe con mandos táctiles (que apuntan solos), ataque cargado, esquiva, habilidad F y, desde el piso 3, la habilidad elemental R. Es inmortal para poder llegar al final; si no termina una sala a tiempo, se rematan los enemigos que queden y se comprueba que la sala se abre igual.
- **idioma** (1): la partida del Caballero en el piso 3, con el navegador en inglés. Tiene que jugar exactamente igual que en español (el idioma solo cambia textos) y la página tiene que verse traducida.
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
- El bloque **`mar`** decide lo que rodea la mazmorra (desde la v0.43 cada piso tiene el suyo: sombra, ciénaga, vacío con estrellas, agua helada, lava, raíces, niebla, carne): colores del fondo, de las placas que flotan, burbujas, vapor, llamas (o `null`) y cuánta luz da.

Al ejecutar `build.js` se comprueban: si falta una coma, dice el archivo y la línea; si un piso usa un enemigo o un jefe que no existe, dice cuál. Un cambio en estos archivos cambia cómo se juega, así que las pruebas dirán «cambió respecto a la referencia»: es lo esperado. Si todas salen ✓, guarda la nueva referencia con `--referencia`.

## Medir el balance y el rendimiento

- `node pruebas/balance.js` (unos 6 minutos) escribe `pruebas/informe-balance.md`: cuántas vidas necesita un bot inmortal para terminar cada piso con cada clase, quién hace más daño y el daño por segundo de cada arma a 3★ (contra un blanco y contra un grupo). El bot juega peor que una persona: sirve para comparar, no como dificultad real. `node pruebas/balance.js 12` juega más partidas; `node pruebas/balance.js armas` solo mide las armas.
- **El balance también es una prueba automática.** En cada cambio, GitHub Actions ejecuta `npm run balance-ci` (2 partidas por clase y piso y todas las armas, unos 4 minutos, en paralelo con las demás pruebas) y compara los resultados con `pruebas/balance-limites.jsonc`:
  - **armas:** el daño por segundo de cada arma a 3★ comparado con la mediana de todas;
  - **pisos:** cuánto más difícil es cada piso que el anterior;
  - **clases:** cuántas más vidas necesita la clase más débil que la más fuerte.

  Cada límite tiene un nivel de **aviso** (⚠: se muestra en el informe, no frena nada; hoy marca, por ejemplo, el salto del piso 3 y los bastones flojos) y otro de **fallo** (✗: la ejecución sale en rojo y el cambio no se publica). El informe completo aparece en la pestaña *Summary* de la ejecución en GitHub. Si cambias el balance a propósito, ajusta los límites en ese archivo.
- `node pruebas/rendimiento.js` mide los milisegundos por fotograma en el piso 8 con 20, 40 y 80 enemigos y contra el jefe, en escritorio y en un celular simulado, con calidad alta, media y baja. Sin tarjeta gráfica el dibujo sale más lento que en un aparato real: para la cifra real, activa en el juego *Opciones → Mostrar FPS*.
- En el menú, **Historial** guarda las últimas 50 partidas: piso, tiempo, arma y qué te derrotó, con un resumen por clase.

## Añadir contenido

- **Enemigo nuevo:** copia un archivo de `01b-enemigos/` parecido, cambia el id, los datos y la IA (y su dibujo en `stats.spr`, ver «Dibujos»), y añade el id a la lista de enemigos de algún piso (`src/datos/pisos/`). Sale en el bestiario solo.
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
