# Informe de balance

Generado por `node pruebas/balance.js `.

El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.

## Límites (pruebas/balance-limites.jsonc)

**✓ Ningún límite roto** (41 armas comprobadas, 8 pisos y 3 clases comprobados)

- ⚠ Arma «Mandoble»: 1.93× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Espada flamígera»: 1.76× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Arco triple»: 0.51× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Bastón de roca»: 0.49× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Bastón de marea»: 0.48× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Bastón del vendaval»: 0.38× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Orbe del vacío»: 0.40× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Shurikens»: 0.50× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Látigo de cadenas»: 1.76× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Piso 2: 1.8× más difícil que el piso 1 (aviso desde 1.8×)
- ⚠ Piso 3: 2.6× más difícil que el piso 2 (aviso desde 1.8×)
- ⚠ Tirador necesita 2.5× las vidas de Caballero (aviso desde 2×)

## Dificultad por piso

El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de 6 partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.

| Piso | Caballero | Tirador | Asesino | Salas | Subjefe | Jefe |
|---|---|---|---|---|---|---|
| 1 | 6.3 | 2.1 | 14.3 | 1.2 | 0.2 | 6.2 |
| 2 | 9.3 | 9.5 | 22.7 | 4.1 | 1.9 | 7.8 |
| 3 | 24.2 | 30.1 | 53.6 | 14.8 | 5.5 | 15.7 |
| 4 | 19.1 | 71.6 | 54.3 | 20.2 | 9.2 | 19.0 |
| 5 | 27.9 | 62.4 | 85.2 | 21.9 | 14.9 | 21.6 |
| 6 | 22.2 | 47.2 | 66.8 | 20.6 | 9.2 | 15.6 |
| 7 | 31.4 | 110.0 | 69.0 | 24.8 | 22.6 | 22.8 |
| 8 | 34.0 | 98.9 | 43.4 | 19.5 | 19.7 | 19.6 |

| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |
|---|---|---|---|
| Caballero | 21.8 | 3.6 | 30 |
| Tirador | 54.0 | 6.5 | 143 |
| Asesino | 51.2 | 3.4 | 64 |

### Quién hace más daño

- Escudero: 13 % del daño recibido
- Fantasma: 6 % del daño recibido
- La Forjadora: 6 % del daño recibido
- Elena, Corazón de la Cripta: 5 % del daño recibido
- El Obispo Hueco: 5 % del daño recibido
- Embestidor: 4 % del daño recibido
- La Raíz Madre: 4 % del daño recibido
- El Devorador de Luz: 4 % del daño recibido
- El Señor del Osario: 4 % del daño recibido
- Ojo vigía: 4 % del daño recibido
- Artificiero: 3 % del daño recibido
- Espectro: 3 % del daño recibido

## Armas a 3★ (piso 4)

Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: 29.2. Marcadas: contra un blanco, más de 1.7× (⬆) o menos de 0.6× (⬇) la mediana (los avisos de pruebas/balance-limites.jsonc).

| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |
|---|---|---|---|---|---|---|---|
| Mandoble ⬆ | rare | Caballero | 56.2 | 1.93 | 39.9 | 3/3 | 76 % |
| Espada flamígera ⬆ | epic | Caballero | 51.4 | 1.76 | 43.8 | 3/3 | 73 % |
| Látigo de cadenas ⬆ | uncommon | Asesino | 51.4 | 1.76 | 42.6 | 3/3 | 83 % |
| Garrote | common | Caballero | 48.4 | 1.66 | 34.3 | 3/3 | 96 % |
| Espada de hierro | uncommon | Caballero | 46.5 | 1.60 | 42.7 | 3/3 | 89 % |
| Hoja del Abismo | epic | Caballero | 46.2 | 1.58 | 42.5 | 3/3 | 53 % |
| Martillo de guerra | rare | Caballero | 43.4 | 1.49 | 66.5 | 3/3 | 94 % |
| Lanza de guardia | uncommon | Caballero | 41.7 | 1.43 | 35.4 | 3/3 | 90 % |
| Garras de sombra | rare | Asesino | 41.7 | 1.43 | 45.3 | 3/3 | 56 % |
| Arco explosivo | epic | Tirador | 41.6 | 1.43 | 23.8 | 2/3 | 7 % |
| Hoz arrojadiza | rare | Asesino | 40.8 | 1.40 | 52.0 | 3/3 | 74 % |
| Hoja de escarcha | rare | Caballero | 38.9 | 1.33 | 34.0 | 3/3 | 76 % |
| Filo nocturno | epic | Asesino | 38.9 | 1.33 | 36.6 | 3/3 | 36 % |
| Guadaña sangrienta | epic | Asesino | 36.0 | 1.24 | 41.5 | 3/3 | 47 % |
| Daga veloz | uncommon | Asesino | 33.2 | 1.14 | 32.3 | 3/3 | 67 % |
| Espada oxidada | common | Caballero | 33.1 | 1.13 | 36.1 | 3/3 | 91 % |
| Dagas gemelas | rare | Asesino | 31.3 | 1.07 | 34.1 | 3/3 | 58 % |
| Bumerán | common | Tirador | 30.9 | 1.06 | 19.4 | 1/3 | 57 % |
| Mosquete | rare | Tirador | 30.9 | 1.06 | 33.8 | 3/3 | 66 % |
| Katar | uncommon | Asesino | 29.4 | 1.01 | 30.8 | 3/3 | 55 % |
| Arco de las Sombras | epic | Asesino | 29.2 | 1.00 | 7.0 | 0/3 | 6 % |
| Varita de aprendiz | common | Caballero | 27.5 | 0.94 | 12.4 | 0/3 | 5 % |
| Cerbatana | uncommon | Asesino | 26.2 | 0.90 | 26.3 | 2/3 | 27 % |
| Bastón de fuego | rare | Caballero | 26.2 | 0.90 | 21.8 | 2/3 | 6 % |
| Grimorio de huesos | epic | Caballero | 26.2 | 0.90 | 25.4 | 3/3 | 13 % |
| Escudo de púas | uncommon | Caballero | 25.2 | 0.86 | 29.8 | 3/3 | 93 % |
| Arco de escarcha | rare | Tirador | 24.9 | 0.85 | 12.0 | 0/3 | 6 % |
| Bastón de la ciénaga | uncommon | Asesino | 23.8 | 0.82 | 18.6 | 2/3 | 19 % |
| Kunais | common | Asesino | 23.8 | 0.82 | 25.1 | 3/3 | 41 % |
| Arco largo | uncommon | Tirador | 23.1 | 0.79 | 11.2 | 0/3 | 7 % |
| Arco corto | common | Tirador | 22.5 | 0.77 | 14.4 | 0/3 | 26 % |
| Honda | common | Tirador | 20.7 | 0.71 | 10.6 | 0/3 | 15 % |
| Rayo sostenido | epic | Caballero | 20.0 | 0.69 | 17.2 | 2/3 | 6 % |
| Bastón del rayo | epic | Caballero | 18.3 | 0.63 | 14.8 | 0/3 | 6 % |
| Ballesta pesada | rare | Tirador | 17.8 | 0.61 | 12.8 | 0/3 | 5 % |
| Arco triple ⬇ | rare | Tirador | 15.0 | 0.51 | 12.7 | 0/3 | 6 % |
| Shurikens ⬇ | rare | Asesino | 14.4 | 0.50 | 13.2 | 1/3 | 10 % |
| Bastón de roca ⬇ | uncommon | Caballero | 14.3 | 0.49 | 13.9 | 1/3 | 13 % |
| Bastón de marea ⬇ | rare | Caballero | 14.1 | 0.48 | 14.8 | 1/3 | 14 % |
| Orbe del vacío ⬇ | epic | Caballero | 11.6 | 0.40 | 13.7 | 0/3 | 9 % |
| Bastón del vendaval ⬇ | rare | Caballero | 11.2 | 0.38 | 7.4 | 0/3 | 7 % |

_390 partidas en 403 s._
