# Informe de balance

Generado por `node pruebas/balance.js 2 --ci`.

El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.

## Límites (pruebas/balance-limites.jsonc)

**✓ Ningún límite roto** (35 armas comprobadas, 8 pisos y 3 clases comprobados)

- ⚠ Piso 3: 3.5× más difícil que el piso 2 (aviso desde 1.8×)
- ⚠ Piso 4: 1.9× más difícil que el piso 3 (aviso desde 1.8×)
- ⚠ Piso 7: 2.7× más difícil que el piso 6 (aviso desde 1.8×)
- ⚠ Asesino necesita 2.5× las vidas de Caballero (aviso desde 2×)

## Dificultad por piso

El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de 2 partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.

| Piso | Caballero | Tirador | Asesino | Salas | Subjefe | Jefe |
|---|---|---|---|---|---|---|
| 1 | 11.1 | 4.3 | 21.9 | 0.1 | 1.6 | 10.8 |
| 2 | 9.4 | 8.4 | 20.8 | 1.2 | 2.8 | 8.9 |
| 3 | 30.1 | 31.9 | 71.5 | 8.7 | 10.1 | 25.7 |
| 4 | 51.4 | 86.9 | 119.9 | 19.2 | 23.5 | 43.4 |
| 5 | 71.4 | 60.2 | 167.4 | 32.1 | 31.6 | 36.0 |
| 6 | 29.4 | 21.9 | 65.8 | 10.1 | 10.4 | 18.5 |
| 7 | 65.4 | 93.5 | 156.8 | 19.8 | 43.1 | 42.3 |
| 8 | 54.7 | 93.9 | 170.1 | 9.4 | 45.8 | 51.1 |

| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |
|---|---|---|---|
| Caballero | 40.4 | 3.4 | 0 |
| Tirador | 50.1 | 6.1 | 37 |
| Asesino | 99.3 | 4.7 | 12 |

### Quién hace más daño

- Fantasma: 10 % del daño recibido
- Elena, Corazón de la Cripta: 7 % del daño recibido
- El Obispo Hueco: 7 % del daño recibido
- El Señor del Osario: 7 % del daño recibido
- El Gemelo de Aldric: 6 % del daño recibido
- Embestidor: 6 % del daño recibido
- La Forjadora: 6 % del daño recibido
- Escudero: 6 % del daño recibido
- Obispo de Ceniza: 6 % del daño recibido
- Herrero Fundido: 5 % del daño recibido
- El Devorador de Luz: 5 % del daño recibido
- La Raíz Madre: 5 % del daño recibido

## Armas a 3★ (piso 4)

Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: 29.1. Marcadas: contra un blanco, más de 1.7× (⬆) o menos de 0.6× (⬇) la mediana (los avisos de pruebas/balance-limites.jsonc).

| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |
|---|---|---|---|---|---|---|---|
| Filo nocturno | epic | Asesino | 46.6 | 1.60 | 44.0 | 3/3 | 81 % |
| Látigo de cadenas | uncommon | Asesino | 42.9 | 1.47 | 35.0 | 3/3 | 82 % |
| Guadaña sangrienta | epic | Asesino | 42.4 | 1.46 | 44.7 | 3/3 | 92 % |
| Lanza de guardia | uncommon | Caballero | 39.5 | 1.36 | 39.6 | 3/3 | 100 % |
| Dagas gemelas | rare | Asesino | 38.3 | 1.31 | 33.0 | 2/3 | 49 % |
| Arco explosivo | epic | Tirador | 37.8 | 1.30 | 40.3 | 3/3 | 34 % |
| Shurikens | rare | Asesino | 37.7 | 1.30 | 17.6 | 2/3 | 4 % |
| Hoz arrojadiza | rare | Asesino | 37.5 | 1.29 | 28.3 | 3/3 | 28 % |
| Ballesta pesada | rare | Tirador | 37.4 | 1.28 | 21.3 | 3/3 | 33 % |
| Espada corta | rare | Caballero | 37.3 | 1.28 | 35.2 | 3/3 | 99 % |
| Espada de hierro | uncommon | Caballero | 35.7 | 1.22 | 32.7 | 3/3 | 89 % |
| Martillo de guerra | rare | Caballero | 35.6 | 1.22 | 41.9 | 3/3 | 80 % |
| Garras de sombra | rare | Asesino | 33.4 | 1.15 | 34.7 | 3/3 | 51 % |
| Arco triple | rare | Tirador | 32.4 | 1.11 | 19.8 | 2/3 | 19 % |
| Arco de las Sombras | epic | Asesino | 30.7 | 1.05 | 7.4 | 0/3 | 5 % |
| Katar | uncommon | Asesino | 30.6 | 1.05 | 23.9 | 2/3 | 35 % |
| Espada oxidada | common | Caballero | 29.6 | 1.02 | 25.5 | 3/3 | 94 % |
| Honda | common | Tirador | 29.1 | 1.00 | 10.8 | 1/3 | 29 % |
| Cerbatana | uncommon | Asesino | 28.2 | 0.97 | 17.8 | 3/3 | 29 % |
| Bastón del vendaval | rare | Caballero | 27.5 | 0.94 | 12.2 | 2/3 | 4 % |
| Arco corto | common | Tirador | 27.2 | 0.93 | 15.1 | 3/3 | 44 % |
| Bastón de fuego | rare | Caballero | 27.1 | 0.93 | 34.4 | 2/3 | 25 % |
| Escudo de púas | uncommon | Caballero | 27.0 | 0.93 | 26.5 | 3/3 | 95 % |
| Garrote | common | Caballero | 26.2 | 0.90 | 36.2 | 3/3 | 92 % |
| Mosquete | rare | Tirador | 26.2 | 0.90 | 51.4 | 3/3 | 79 % |
| Kunais | common | Asesino | 25.4 | 0.87 | 15.9 | 3/3 | 21 % |
| Daga veloz | uncommon | Asesino | 25.0 | 0.86 | 38.3 | 3/3 | 92 % |
| Grimorio de huesos | epic | Caballero | 24.3 | 0.84 | 30.2 | 3/3 | 35 % |
| Bastón de la ciénaga | uncommon | Asesino | 22.1 | 0.76 | 21.7 | 2/3 | 19 % |
| Bastón del rayo | epic | Caballero | 21.7 | 0.74 | 10.2 | 1/3 | 13 % |
| Varita de aprendiz | common | Caballero | 20.3 | 0.70 | 20.8 | 2/3 | 39 % |
| Orbe del vacío | epic | Caballero | 20.1 | 0.69 | 10.0 | 0/3 | 10 % |
| Bastón de roca | uncommon | Caballero | 20.1 | 0.69 | 15.9 | 3/3 | 6 % |
| Rayo sostenido | epic | Caballero | 19.3 | 0.66 | 10.4 | 0/3 | 2 % |
| Bastón de marea | rare | Caballero | 19.1 | 0.66 | 12.2 | 2/3 | 18 % |

_258 partidas en 423 s._
