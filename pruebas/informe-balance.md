# Informe de balance

Generado por `node pruebas/balance.js 2 --ci`.

El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.

## Límites (pruebas/balance-limites.jsonc)

**✓ Ningún límite roto** (41 armas comprobadas, 8 pisos y 3 clases comprobados)

- ⚠ Arma «Orbe del vacío»: 0.59× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Rayo sostenido»: 0.59× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Piso 2: 2.1× más difícil que el piso 1 (aviso desde 1.8×)
- ⚠ Piso 3: 1.9× más difícil que el piso 2 (aviso desde 1.8×)
- ⚠ Piso 7: 1.9× más difícil que el piso 6 (aviso desde 1.8×)
- ⚠ Asesino necesita 3.7× las vidas de Caballero (aviso desde 2×)

## Dificultad por piso

El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de 2 partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.

| Piso | Caballero | Tirador | Asesino | Salas | Subjefe | Jefe |
|---|---|---|---|---|---|---|
| 1 | 6.4 | 0.4 | 12.1 | 0.2 | 0.2 | 5.9 |
| 2 | 7.0 | 7.2 | 24.9 | 4.3 | 0.9 | 7.8 |
| 3 | 15.1 | 15.3 | 45.7 | 7.0 | 5.3 | 13.0 |
| 4 | 13.3 | 49.6 | 62.4 | 15.5 | 11.3 | 15.0 |
| 5 | 21.9 | 49.5 | 99.6 | 22.5 | 13.1 | 21.4 |
| 6 | 18.2 | 26.2 | 53.2 | 11.7 | 4.4 | 16.4 |
| 7 | 25.8 | 54.3 | 108.6 | 15.3 | 15.6 | 32.0 |
| 8 | 41.7 | 103.4 | 153.0 | 33.3 | 28.8 | 37.3 |

| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |
|---|---|---|---|
| Caballero | 18.7 | 3.2 | 11 |
| Tirador | 38.2 | 5.3 | 32 |
| Asesino | 69.9 | 4.5 | 15 |

### Quién hace más daño

- Escudero: 13 % del daño recibido
- Elena, Corazón de la Cripta: 10 % del daño recibido
- El Obispo Hueco: 8 % del daño recibido
- La Forjadora: 6 % del daño recibido
- Fantasma: 6 % del daño recibido
- La Raíz Madre: 5 % del daño recibido
- El Señor del Osario: 4 % del daño recibido
- El Devorador de Luz: 4 % del daño recibido
- Ojo vigía: 3 % del daño recibido
- Centinela Escarchado: 3 % del daño recibido
- El Verdugo: 3 % del daño recibido
- Bruto: 3 % del daño recibido

## Armas a 3★ (piso 4)

Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: 27.5. Marcadas: contra un blanco, más de 1.7× (⬆) o menos de 0.6× (⬇) la mediana (los avisos de pruebas/balance-limites.jsonc).

| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |
|---|---|---|---|---|---|---|---|
| Garras de sombra | rare | Asesino | 41.8 | 1.52 | 34.6 | 3/3 | 45 % |
| Filo nocturno | epic | Asesino | 41.5 | 1.51 | 34.8 | 3/3 | 55 % |
| Daga veloz | uncommon | Asesino | 41.4 | 1.51 | 28.6 | 3/3 | 95 % |
| Látigo de cadenas | uncommon | Asesino | 39.5 | 1.44 | 45.0 | 3/3 | 96 % |
| Mandoble | rare | Caballero | 38.5 | 1.40 | 39.8 | 3/3 | 96 % |
| Espada flamígera | epic | Caballero | 38.3 | 1.39 | 32.8 | 3/3 | 77 % |
| Guadaña sangrienta | epic | Asesino | 38.1 | 1.39 | 45.9 | 3/3 | 75 % |
| Mosquete | rare | Tirador | 37.5 | 1.36 | 49.3 | 3/3 | 91 % |
| Hoja del Abismo | epic | Caballero | 36.0 | 1.31 | 26.2 | 3/3 | 51 % |
| Espada de hierro | uncommon | Caballero | 35.2 | 1.28 | 31.8 | 3/3 | 87 % |
| Dagas gemelas | rare | Asesino | 34.5 | 1.25 | 23.5 | 3/3 | 61 % |
| Arco explosivo | epic | Tirador | 34.2 | 1.25 | 36.7 | 3/3 | 21 % |
| Bumerán | common | Tirador | 34.2 | 1.25 | 26.5 | 3/3 | 96 % |
| Hoz arrojadiza | rare | Asesino | 33.2 | 1.21 | 40.1 | 3/3 | 73 % |
| Martillo de guerra | rare | Caballero | 32.3 | 1.18 | 48.2 | 3/3 | 92 % |
| Lanza de guardia | uncommon | Caballero | 32.0 | 1.16 | 29.7 | 3/3 | 94 % |
| Katar | uncommon | Asesino | 31.0 | 1.13 | 35.8 | 3/3 | 98 % |
| Hoja de escarcha | rare | Caballero | 28.9 | 1.05 | 35.8 | 3/3 | 96 % |
| Espada oxidada | common | Caballero | 28.5 | 1.04 | 34.3 | 3/3 | 95 % |
| Shurikens | rare | Asesino | 28.1 | 1.02 | 27.5 | 3/3 | 18 % |
| Arco de las Sombras | epic | Asesino | 27.5 | 1.00 | 8.2 | 0/3 | 5 % |
| Arco de escarcha | rare | Tirador | 26.3 | 0.96 | 9.1 | 1/3 | 4 % |
| Garrote | common | Caballero | 25.9 | 0.94 | 29.9 | 3/3 | 100 % |
| Cerbatana | uncommon | Asesino | 25.8 | 0.94 | 23.2 | 3/3 | 46 % |
| Kunais | common | Asesino | 25.5 | 0.93 | 22.7 | 3/3 | 39 % |
| Arco corto | common | Tirador | 24.9 | 0.91 | 10.9 | 2/3 | 42 % |
| Bastón del vendaval | rare | Caballero | 23.9 | 0.87 | 7.7 | 0/3 | 7 % |
| Bastón de fuego | rare | Caballero | 22.8 | 0.83 | 22.8 | 3/3 | 13 % |
| Bastón de la ciénaga | uncommon | Asesino | 22.8 | 0.83 | 19.0 | 2/3 | 33 % |
| Grimorio de huesos | epic | Caballero | 22.5 | 0.82 | 25.4 | 3/3 | 32 % |
| Escudo de púas | uncommon | Caballero | 21.0 | 0.76 | 25.5 | 3/3 | 89 % |
| Arco largo | uncommon | Tirador | 20.9 | 0.76 | 13.0 | 2/3 | 9 % |
| Honda | common | Tirador | 20.8 | 0.76 | 8.0 | 0/3 | 18 % |
| Bastón del rayo | epic | Caballero | 19.8 | 0.72 | 9.6 | 1/3 | 8 % |
| Arco triple | rare | Tirador | 19.8 | 0.72 | 11.2 | 2/3 | 2 % |
| Bastón de roca | uncommon | Caballero | 19.6 | 0.71 | 9.7 | 1/3 | 9 % |
| Varita de aprendiz | common | Caballero | 18.4 | 0.67 | 8.8 | 1/3 | 2 % |
| Ballesta pesada | rare | Tirador | 18.4 | 0.67 | 14.6 | 3/3 | 18 % |
| Bastón de marea | rare | Caballero | 16.9 | 0.61 | 10.3 | 2/3 | 14 % |
| Orbe del vacío ⬇ | epic | Caballero | 16.3 | 0.59 | 9.0 | 1/3 | 9 % |
| Rayo sostenido ⬇ | epic | Caballero | 16.1 | 0.59 | 10.8 | 2/3 | 8 % |

_294 partidas en 169 s._
