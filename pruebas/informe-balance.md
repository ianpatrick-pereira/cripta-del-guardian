# Informe de balance

Generado por `node pruebas/balance.js 2 --ci`.

El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.

## Límites (pruebas/balance-limites.jsonc)

**✓ Ningún límite roto** (17 armas comprobadas, 8 pisos y 3 clases comprobados)

- ⚠ Piso 3: 3.7× más difícil que el piso 2 (aviso desde 1.8×)
- ⚠ Piso 4: 1.9× más difícil que el piso 3 (aviso desde 1.8×)
- ⚠ Piso 7: 2.1× más difícil que el piso 6 (aviso desde 1.8×)
- ⚠ Asesino necesita 2.0× las vidas de Caballero (aviso desde 2×)

## Dificultad por piso

El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de 2 partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.

| Piso | Caballero | Tirador | Asesino | Salas | Subjefe | Jefe |
|---|---|---|---|---|---|---|
| 1 | 13.1 | 1.9 | 15.1 | 0.3 | 1.0 | 8.7 |
| 2 | 8.7 | 6.0 | 17.6 | 1.7 | 1.9 | 7.1 |
| 3 | 35.1 | 20.4 | 65.3 | 5.4 | 8.1 | 26.7 |
| 4 | 58.0 | 58.8 | 114.6 | 20.4 | 16.8 | 39.9 |
| 5 | 62.2 | 54.3 | 127.1 | 22.3 | 28.2 | 30.8 |
| 6 | 38.4 | 48.4 | 51.1 | 14.2 | 11.6 | 20.1 |
| 7 | 57.7 | 102.6 | 133.3 | 21.0 | 32.9 | 43.9 |
| 8 | 67.0 | 109.9 | 173.0 | 21.4 | 34.4 | 60.8 |

| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |
|---|---|---|---|
| Caballero | 42.5 | 3.8 | 2 |
| Tirador | 50.3 | 6.2 | 29 |
| Asesino | 87.1 | 3.9 | 3 |

### Quién hace más daño

- Elena, Corazón de la Cripta: 10 % del daño recibido
- Fantasma: 9 % del daño recibido
- El Obispo Hueco: 8 % del daño recibido
- El Señor del Osario: 6 % del daño recibido
- Excavador: 6 % del daño recibido
- La Forjadora: 6 % del daño recibido
- El Gemelo de Aldric: 6 % del daño recibido
- Obispo de Ceniza: 6 % del daño recibido
- La Raíz Madre: 5 % del daño recibido
- Escudero: 5 % del daño recibido
- Embestidor: 5 % del daño recibido
- El Devorador de Luz: 5 % del daño recibido

## Armas a 3★ (piso 4)

Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: 31.7. Marcadas: contra un blanco, más de 1.7× (⬆) o menos de 0.6× (⬇) la mediana (los avisos de pruebas/balance-limites.jsonc).

| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |
|---|---|---|---|---|---|---|---|
| Arco explosivo | epic | Tirador | 52.2 | 1.65 | 29.4 | 3/3 | 30 % |
| Lanza de guardia | uncommon | Caballero | 44.3 | 1.40 | 45.6 | 3/3 | 86 % |
| Katana | common | Asesino | 43.4 | 1.37 | 46.9 | 3/3 | 48 % |
| Kusarigama | uncommon | Asesino | 41.2 | 1.30 | 33.6 | 2/3 | 52 % |
| Guadaña | epic | Asesino | 40.2 | 1.27 | 76.0 | 3/3 | 85 % |
| Ballesta pesada | rare | Tirador | 38.8 | 1.23 | 33.3 | 3/3 | 38 % |
| Espada de hierro | uncommon | Caballero | 33.9 | 1.07 | 41.7 | 3/3 | 96 % |
| Arco triple | rare | Tirador | 32.7 | 1.03 | 24.1 | 3/3 | 28 % |
| Estrellas ninja | rare | Asesino | 31.7 | 1.00 | 29.1 | 3/3 | 26 % |
| Martillo de guerra | rare | Caballero | 30.0 | 0.95 | 42.0 | 3/3 | 100 % |
| Arco corto | common | Tirador | 29.1 | 0.92 | 18.1 | 3/3 | 45 % |
| Espada corta | rare | Caballero | 26.4 | 0.83 | 28.8 | 3/3 | 77 % |
| Garrote | common | Caballero | 26.2 | 0.83 | 37.9 | 3/3 | 99 % |
| Espada oxidada | common | Caballero | 26.0 | 0.82 | 33.8 | 3/3 | 100 % |
| Mosquete | rare | Tirador | 25.4 | 0.80 | 58.2 | 3/3 | 79 % |
| Escudo de púas | uncommon | Caballero | 23.4 | 0.74 | 20.7 | 3/3 | 83 % |
| Honda | common | Tirador | 22.7 | 0.72 | 12.4 | 1/3 | 11 % |

_150 partidas en 404 s._
