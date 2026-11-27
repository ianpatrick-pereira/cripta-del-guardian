# Informe de balance

Generado por `node pruebas/balance.js 2 --ci`.

El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.

## Límites (pruebas/balance-limites.jsonc)

**✓ Ningún límite roto** (17 armas comprobadas, 8 pisos y 3 clases comprobados)

- ⚠ Piso 3: 3.8× más difícil que el piso 2 (aviso desde 1.8×)
- ⚠ Piso 4: 1.8× más difícil que el piso 3 (aviso desde 1.8×)
- ⚠ Piso 7: 2.3× más difícil que el piso 6 (aviso desde 1.8×)
- ⚠ Asesino necesita 2.1× las vidas de Caballero (aviso desde 2×)

## Dificultad por piso

El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de 2 partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.

| Piso | Caballero | Tirador | Asesino | Salas | Subjefe | Jefe |
|---|---|---|---|---|---|---|
| 1 | 11.1 | 4.3 | 16.2 | 0.0 | 1.2 | 9.3 |
| 2 | 9.4 | 8.4 | 16.8 | 1.0 | 2.6 | 8.0 |
| 3 | 34.0 | 21.5 | 77.4 | 4.9 | 8.7 | 30.6 |
| 4 | 50.3 | 86.4 | 106.8 | 18.1 | 21.1 | 42.0 |
| 5 | 70.1 | 52.5 | 136.7 | 20.6 | 29.8 | 36.1 |
| 6 | 30.5 | 37.4 | 46.5 | 7.5 | 13.2 | 17.5 |
| 7 | 57.0 | 88.2 | 119.1 | 15.5 | 30.6 | 42.1 |
| 8 | 58.2 | 96.0 | 150.8 | 5.8 | 37.1 | 58.8 |

| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |
|---|---|---|---|
| Caballero | 40.1 | 3.4 | 2 |
| Tirador | 49.4 | 6.3 | 38 |
| Asesino | 83.8 | 3.9 | 4 |

### Quién hace más daño

- Elena, Corazón de la Cripta: 10 % del daño recibido
- El Obispo Hueco: 8 % del daño recibido
- Fantasma: 8 % del daño recibido
- Escudero: 7 % del daño recibido
- La Forjadora: 7 % del daño recibido
- El Gemelo de Aldric: 6 % del daño recibido
- El Señor del Osario: 6 % del daño recibido
- Obispo de Ceniza: 6 % del daño recibido
- El Devorador de Luz: 5 % del daño recibido
- Herrero Fundido: 5 % del daño recibido
- La Raíz Madre: 5 % del daño recibido
- Embestidor: 5 % del daño recibido

## Armas a 3★ (piso 4)

Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: 33.8. Marcadas: contra un blanco, más de 1.7× (⬆) o menos de 0.6× (⬇) la mediana (los avisos de pruebas/balance-limites.jsonc).

| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |
|---|---|---|---|---|---|---|---|
| Kusarigama | uncommon | Asesino | 48.7 | 1.44 | 54.1 | 3/3 | 95 % |
| Katana | common | Asesino | 43.4 | 1.28 | 49.2 | 3/3 | 53 % |
| Guadaña | epic | Asesino | 40.2 | 1.19 | 37.5 | 2/3 | 51 % |
| Arco explosivo | epic | Tirador | 39.1 | 1.15 | 39.3 | 3/3 | 42 % |
| Lanza de guardia | uncommon | Caballero | 37.5 | 1.11 | 39.3 | 3/3 | 91 % |
| Estrellas ninja | rare | Asesino | 37.4 | 1.11 | 22.4 | 1/3 | 15 % |
| Ballesta pesada | rare | Tirador | 35.5 | 1.05 | 22.0 | 2/3 | 44 % |
| Espada corta | rare | Caballero | 34.1 | 1.01 | 29.1 | 3/3 | 87 % |
| Espada de hierro | uncommon | Caballero | 33.8 | 1.00 | 32.5 | 3/3 | 87 % |
| Martillo de guerra | rare | Caballero | 33.7 | 1.00 | 42.1 | 3/3 | 85 % |
| Escudo de púas | uncommon | Caballero | 31.5 | 0.93 | 26.2 | 3/3 | 78 % |
| Arco triple | rare | Tirador | 30.7 | 0.91 | 18.6 | 2/3 | 23 % |
| Espada oxidada | common | Caballero | 30.2 | 0.89 | 31.1 | 3/3 | 97 % |
| Garrote | common | Caballero | 28.4 | 0.84 | 31.1 | 3/3 | 110 % |
| Honda | common | Tirador | 27.6 | 0.82 | 10.7 | 1/3 | 30 % |
| Mosquete | rare | Tirador | 26.8 | 0.79 | 43.0 | 3/3 | 68 % |
| Arco corto | common | Tirador | 25.8 | 0.76 | 15.1 | 3/3 | 49 % |

_150 partidas en 426 s._
