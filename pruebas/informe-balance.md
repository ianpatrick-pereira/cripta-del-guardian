# Informe de balance

Generado por `node pruebas/balance.js 2 --ci`.

El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.

## Límites (pruebas/balance-limites.jsonc)

**✓ Ningún límite roto** (17 armas comprobadas, 8 pisos y 3 clases comprobados)

- ⚠ Piso 3: 3.5× más difícil que el piso 2 (aviso desde 1.8×)
- ⚠ Piso 4: 1.9× más difícil que el piso 3 (aviso desde 1.8×)
- ⚠ Piso 7: 2.7× más difícil que el piso 6 (aviso desde 1.8×)
- ⚠ Asesino necesita 2.5× las vidas de Caballero (aviso desde 2×)

## Dificultad por piso

El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de 2 partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.

| Piso | Caballero | Tirador | Asesino | Salas | Subjefe | Jefe |
|---|---|---|---|---|---|---|
| 1 | 11.1 | 4.3 | 22.0 | 0.0 | 1.8 | 10.7 |
| 2 | 9.4 | 8.4 | 23.9 | 1.1 | 2.5 | 10.3 |
| 3 | 30.1 | 31.9 | 82.7 | 7.7 | 9.7 | 30.9 |
| 4 | 51.4 | 86.9 | 139.0 | 24.4 | 25.1 | 43.0 |
| 5 | 71.4 | 51.0 | 173.4 | 30.5 | 28.7 | 39.4 |
| 6 | 29.4 | 21.9 | 58.7 | 9.8 | 8.8 | 18.0 |
| 7 | 65.4 | 93.5 | 133.8 | 18.1 | 39.8 | 39.7 |
| 8 | 54.7 | 93.9 | 164.1 | 7.4 | 42.5 | 54.2 |

| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |
|---|---|---|---|
| Caballero | 40.4 | 3.4 | 0 |
| Tirador | 49.0 | 6.1 | 36 |
| Asesino | 99.7 | 4.5 | 9 |

### Quién hace más daño

- Fantasma: 10 % del daño recibido
- Elena, Corazón de la Cripta: 8 % del daño recibido
- La Forjadora: 7 % del daño recibido
- Escudero: 7 % del daño recibido
- El Obispo Hueco: 7 % del daño recibido
- El Gemelo de Aldric: 6 % del daño recibido
- Embestidor: 6 % del daño recibido
- Obispo de Ceniza: 6 % del daño recibido
- El Devorador de Luz: 6 % del daño recibido
- Herrero Fundido: 5 % del daño recibido
- La Raíz Madre: 5 % del daño recibido
- El Señor del Osario: 4 % del daño recibido

## Armas a 3★ (piso 4)

Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: 35.7. Marcadas: contra un blanco, más de 1.7× (⬆) o menos de 0.6× (⬇) la mediana (los avisos de pruebas/balance-limites.jsonc).

| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |
|---|---|---|---|---|---|---|---|
| Katana | common | Asesino | 46.6 | 1.31 | 44.0 | 3/3 | 81 % |
| Kusarigama | uncommon | Asesino | 42.9 | 1.20 | 35.0 | 3/3 | 82 % |
| Guadaña | epic | Asesino | 42.4 | 1.19 | 44.7 | 3/3 | 92 % |
| Lanza de guardia | uncommon | Caballero | 39.5 | 1.11 | 39.6 | 3/3 | 100 % |
| Arco explosivo | epic | Tirador | 37.8 | 1.06 | 40.3 | 3/3 | 34 % |
| Estrellas ninja | rare | Asesino | 37.7 | 1.06 | 17.6 | 2/3 | 4 % |
| Ballesta pesada | rare | Tirador | 37.4 | 1.05 | 21.3 | 3/3 | 33 % |
| Espada corta | rare | Caballero | 37.3 | 1.05 | 35.2 | 3/3 | 99 % |
| Espada de hierro | uncommon | Caballero | 35.7 | 1.00 | 32.7 | 3/3 | 89 % |
| Martillo de guerra | rare | Caballero | 35.6 | 1.00 | 41.9 | 3/3 | 80 % |
| Arco triple | rare | Tirador | 32.4 | 0.91 | 19.8 | 2/3 | 19 % |
| Espada oxidada | common | Caballero | 29.6 | 0.83 | 25.5 | 3/3 | 94 % |
| Honda | common | Tirador | 29.1 | 0.82 | 10.8 | 1/3 | 29 % |
| Arco corto | common | Tirador | 27.2 | 0.76 | 15.1 | 3/3 | 44 % |
| Escudo de púas | uncommon | Caballero | 27.0 | 0.76 | 26.5 | 3/3 | 95 % |
| Garrote | common | Caballero | 26.2 | 0.74 | 36.2 | 3/3 | 92 % |
| Mosquete | rare | Tirador | 26.2 | 0.73 | 51.4 | 3/3 | 79 % |

_150 partidas en 433 s._
