# Informe de balance

Generado por `node pruebas/balance.js 3`.

El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.

## Límites (pruebas/balance-limites.jsonc)

**✓ Ningún límite roto** (41 armas comprobadas, 8 pisos y 3 clases comprobados)

- ⚠ Piso 3: 2.1× más difícil que el piso 2 (aviso desde 1.8×)
- ⚠ Piso 4: 1.9× más difícil que el piso 3 (aviso desde 1.8×)
- ⚠ Piso 7: 1.8× más difícil que el piso 6 (aviso desde 1.8×)
- ⚠ Asesino necesita 3.1× las vidas de Caballero (aviso desde 2×)

## Dificultad por piso

El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de 3 partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.

| Piso | Caballero | Tirador | Asesino | Salas | Subjefe | Jefe |
|---|---|---|---|---|---|---|
| 1 | 7.3 | 3.3 | 16.5 | 2.1 | 0.2 | 6.8 |
| 2 | 8.9 | 11.2 | 20.2 | 5.0 | 1.7 | 6.7 |
| 3 | 18.8 | 20.3 | 46.9 | 9.9 | 5.1 | 13.7 |
| 4 | 25.2 | 75.8 | 65.8 | 26.6 | 11.5 | 17.5 |
| 5 | 22.7 | 39.7 | 88.0 | 17.8 | 12.8 | 19.5 |
| 6 | 18.2 | 39.7 | 66.1 | 16.1 | 8.9 | 16.3 |
| 7 | 30.5 | 98.0 | 100.3 | 23.3 | 20.4 | 32.5 |
| 8 | 37.0 | 106.7 | 118.1 | 33.9 | 22.5 | 30.9 |

| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |
|---|---|---|---|
| Caballero | 21.1 | 3.5 | 20 |
| Tirador | 49.3 | 5.9 | 57 |
| Asesino | 65.2 | 4.1 | 13 |

### Quién hace más daño

- Escudero: 15 % del daño recibido
- Elena, Corazón de la Cripta: 8 % del daño recibido
- El Obispo Hueco: 7 % del daño recibido
- Fantasma: 6 % del daño recibido
- La Forjadora: 5 % del daño recibido
- El Señor del Osario: 4 % del daño recibido
- La Raíz Madre: 4 % del daño recibido
- El Devorador de Luz: 4 % del daño recibido
- Herrero Fundido: 3 % del daño recibido
- Embestidor: 3 % del daño recibido
- Ojo vigía: 3 % del daño recibido
- El Verdugo: 3 % del daño recibido

## Armas a 3★ (piso 4)

Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: 26.7. Marcadas: contra un blanco, más de 1.7× (⬆) o menos de 0.6× (⬇) la mediana (los avisos de pruebas/balance-limites.jsonc).

| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |
|---|---|---|---|---|---|---|---|
| Garras de sombra | rare | Asesino | 41.8 | 1.57 | 22.6 | 2/3 | 21 % |
| Filo nocturno | epic | Asesino | 41.5 | 1.56 | 31.7 | 3/3 | 55 % |
| Daga veloz | uncommon | Asesino | 41.4 | 1.55 | 35.3 | 3/3 | 82 % |
| Arco explosivo | epic | Tirador | 40.7 | 1.53 | 35.9 | 3/3 | 24 % |
| Látigo de cadenas | uncommon | Asesino | 39.5 | 1.48 | 48.8 | 3/3 | 92 % |
| Mandoble | rare | Caballero | 38.5 | 1.44 | 43.2 | 3/3 | 100 % |
| Espada flamígera | epic | Caballero | 38.3 | 1.44 | 36.7 | 3/3 | 75 % |
| Guadaña sangrienta | epic | Asesino | 38.1 | 1.43 | 39.8 | 3/3 | 76 % |
| Hoja del Abismo | epic | Caballero | 36.0 | 1.35 | 26.1 | 3/3 | 49 % |
| Espada de hierro | uncommon | Caballero | 35.2 | 1.32 | 30.2 | 3/3 | 95 % |
| Dagas gemelas | rare | Asesino | 34.5 | 1.29 | 25.3 | 3/3 | 57 % |
| Bumerán | common | Tirador | 34.2 | 1.28 | 34.4 | 3/3 | 96 % |
| Hoz arrojadiza | rare | Asesino | 33.2 | 1.25 | 34.7 | 3/3 | 43 % |
| Martillo de guerra | rare | Caballero | 32.3 | 1.21 | 50.2 | 3/3 | 100 % |
| Hoja de escarcha | rare | Caballero | 32.1 | 1.21 | 35.1 | 3/3 | 88 % |
| Lanza de guardia | uncommon | Caballero | 32.0 | 1.20 | 30.8 | 3/3 | 94 % |
| Mosquete | rare | Tirador | 31.2 | 1.17 | 49.3 | 3/3 | 96 % |
| Katar | uncommon | Asesino | 31.0 | 1.16 | 30.6 | 3/3 | 84 % |
| Espada oxidada | common | Caballero | 28.5 | 1.07 | 39.3 | 3/3 | 100 % |
| Arco de las Sombras | epic | Asesino | 27.5 | 1.03 | 6.3 | 0/3 | 6 % |
| Shurikens | rare | Asesino | 26.7 | 1.00 | 20.2 | 3/3 | 14 % |
| Garrote | common | Caballero | 25.9 | 0.97 | 32.3 | 3/3 | 100 % |
| Cerbatana | uncommon | Asesino | 25.8 | 0.97 | 16.5 | 3/3 | 21 % |
| Kunais | common | Asesino | 25.5 | 0.96 | 25.1 | 3/3 | 49 % |
| Bastón del vendaval | rare | Caballero | 25.0 | 0.94 | 7.9 | 0/3 | 6 % |
| Arco corto | common | Tirador | 24.9 | 0.93 | 9.4 | 1/3 | 48 % |
| Arco de escarcha | rare | Tirador | 24.8 | 0.93 | 8.1 | 0/3 | 3 % |
| Bastón de fuego | rare | Caballero | 22.8 | 0.86 | 21.5 | 3/3 | 11 % |
| Bastón de la ciénaga | uncommon | Asesino | 22.3 | 0.84 | 15.2 | 2/3 | 12 % |
| Grimorio de huesos | epic | Caballero | 21.0 | 0.79 | 26.8 | 3/3 | 20 % |
| Escudo de púas | uncommon | Caballero | 21.0 | 0.79 | 27.0 | 3/3 | 79 % |
| Arco largo | uncommon | Tirador | 20.9 | 0.78 | 18.1 | 3/3 | 24 % |
| Arco triple | rare | Tirador | 20.1 | 0.75 | 14.0 | 2/3 | 4 % |
| Bastón del rayo | epic | Caballero | 19.8 | 0.74 | 9.8 | 2/3 | 6 % |
| Bastón de roca | uncommon | Caballero | 18.8 | 0.71 | 13.4 | 2/3 | 13 % |
| Varita de aprendiz | common | Caballero | 18.4 | 0.69 | 10.5 | 1/3 | 27 % |
| Rayo sostenido | epic | Caballero | 17.7 | 0.66 | 13.4 | 2/3 | 8 % |
| Honda | common | Tirador | 17.6 | 0.66 | 9.3 | 0/3 | 15 % |
| Ballesta pesada | rare | Tirador | 17.5 | 0.66 | 15.9 | 2/3 | 14 % |
| Bastón de marea | rare | Caballero | 16.8 | 0.63 | 9.3 | 1/3 | 5 % |
| Orbe del vacío | epic | Caballero | 16.3 | 0.61 | 7.9 | 1/3 | 10 % |

_318 partidas en 232 s._
