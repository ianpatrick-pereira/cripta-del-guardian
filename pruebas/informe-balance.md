# Informe de balance

Generado por `node pruebas/balance.js 2 --ci`.

El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.

## Límites (pruebas/balance-limites.jsonc)

**✓ Ningún límite roto** (41 armas comprobadas, 8 pisos y 3 clases comprobados)

- ⚠ Arma «Varita de aprendiz»: 0.57× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Bastón de marea»: 0.58× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Orbe del vacío»: 0.55× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Arma «Rayo sostenido»: 0.59× la mediana (aviso fuera de 0.6–1.7)
- ⚠ Piso 3: 2.1× más difícil que el piso 2 (aviso desde 1.8×)
- ⚠ Piso 4: 1.8× más difícil que el piso 3 (aviso desde 1.8×)
- ⚠ Piso 7: 2.0× más difícil que el piso 6 (aviso desde 1.8×)
- ⚠ Asesino necesita 2.7× las vidas de Caballero (aviso desde 2×)

## Dificultad por piso

El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de 2 partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.

| Piso | Caballero | Tirador | Asesino | Salas | Subjefe | Jefe |
|---|---|---|---|---|---|---|
| 1 | 14.5 | 4.9 | 29.7 | 0.4 | 2.4 | 13.6 |
| 2 | 11.3 | 14.6 | 47.4 | 2.5 | 6.1 | 15.8 |
| 3 | 35.3 | 32.8 | 86.9 | 8.0 | 13.1 | 30.5 |
| 4 | 45.7 | 75.1 | 160.7 | 32.2 | 22.8 | 38.8 |
| 5 | 70.0 | 78.6 | 151.5 | 23.5 | 38.4 | 38.2 |
| 6 | 35.9 | 64.0 | 71.6 | 14.3 | 18.2 | 24.6 |
| 7 | 54.8 | 134.1 | 152.0 | 16.5 | 52.4 | 44.8 |
| 8 | 63.6 | 115.9 | 192.2 | 27.3 | 45.1 | 51.5 |

| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |
|---|---|---|---|
| Caballero | 41.4 | 3.6 | 3 |
| Tirador | 65.0 | 6.2 | 32 |
| Asesino | 111.5 | 4.8 | 16 |

### Quién hace más daño

- Elena, Corazón de la Cripta: 8 % del daño recibido
- Fantasma: 7 % del daño recibido
- Escudero: 7 % del daño recibido
- Obispo de Ceniza: 7 % del daño recibido
- Excavador: 6 % del daño recibido
- El Obispo Hueco: 6 % del daño recibido
- La Forjadora: 6 % del daño recibido
- El Gemelo de Aldric: 6 % del daño recibido
- El Señor del Osario: 6 % del daño recibido
- Herrero Fundido: 6 % del daño recibido
- Embestidor: 5 % del daño recibido
- El Devorador de Luz: 5 % del daño recibido

## Armas a 3★ (piso 4)

Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: 31.6. Marcadas: contra un blanco, más de 1.7× (⬆) o menos de 0.6× (⬇) la mediana (los avisos de pruebas/balance-limites.jsonc).

| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |
|---|---|---|---|---|---|---|---|
| Filo nocturno | epic | Asesino | 46.3 | 1.46 | 44.5 | 3/3 | 55 % |
| Látigo de cadenas | uncommon | Asesino | 43.2 | 1.37 | 51.3 | 3/3 | 95 % |
| Guadaña sangrienta | epic | Asesino | 42.4 | 1.34 | 44.9 | 3/3 | 61 % |
| Mandoble | rare | Caballero | 41.3 | 1.31 | 29.8 | 3/3 | 87 % |
| Arco explosivo | epic | Tirador | 40.9 | 1.29 | 21.3 | 3/3 | 4 % |
| Daga veloz | uncommon | Asesino | 40.7 | 1.29 | 30.8 | 3/3 | 49 % |
| Espada de hierro | uncommon | Caballero | 38.6 | 1.22 | 34.1 | 3/3 | 93 % |
| Dagas gemelas | rare | Asesino | 38.3 | 1.21 | 33.6 | 3/3 | 62 % |
| Espada flamígera | epic | Caballero | 38.2 | 1.21 | 28.2 | 3/3 | 49 % |
| Kunais | common | Asesino | 37.2 | 1.18 | 18.3 | 3/3 | 20 % |
| Espada oxidada | common | Caballero | 37.1 | 1.17 | 31.6 | 3/3 | 100 % |
| Arco de las Sombras | epic | Asesino | 35.6 | 1.13 | 7.6 | 0/3 | 5 % |
| Shurikens | rare | Asesino | 35.5 | 1.12 | 19.4 | 2/3 | 14 % |
| Hoja del Abismo | epic | Caballero | 35.2 | 1.11 | 29.7 | 3/3 | 45 % |
| Bumerán | common | Tirador | 34.5 | 1.09 | 25.6 | 2/3 | 86 % |
| Garras de sombra | rare | Asesino | 33.4 | 1.06 | 26.1 | 3/3 | 22 % |
| Hoz arrojadiza | rare | Asesino | 33.3 | 1.05 | 30.0 | 3/3 | 32 % |
| Cerbatana | uncommon | Asesino | 32.0 | 1.01 | 27.9 | 3/3 | 44 % |
| Martillo de guerra | rare | Caballero | 31.8 | 1.01 | 49.3 | 3/3 | 89 % |
| Lanza de guardia | uncommon | Caballero | 31.7 | 1.00 | 28.4 | 2/3 | 81 % |
| Hoja de escarcha | rare | Caballero | 31.6 | 1.00 | 27.6 | 2/3 | 53 % |
| Honda | common | Tirador | 28.6 | 0.91 | 10.0 | 0/3 | 2 % |
| Bastón de fuego | rare | Caballero | 28.1 | 0.89 | 18.3 | 2/3 | 3 % |
| Katar | uncommon | Asesino | 27.3 | 0.87 | 23.5 | 2/3 | 49 % |
| Garrote | common | Caballero | 26.3 | 0.83 | 25.9 | 2/3 | 87 % |
| Bastón de la ciénaga | uncommon | Asesino | 25.9 | 0.82 | 13.3 | 1/3 | 4 % |
| Bastón de roca | uncommon | Caballero | 25.0 | 0.79 | 12.1 | 2/3 | 7 % |
| Escudo de púas | uncommon | Caballero | 24.6 | 0.78 | 27.8 | 3/3 | 94 % |
| Bastón del vendaval | rare | Caballero | 24.0 | 0.76 | 8.8 | 0/3 | 6 % |
| Arco corto | common | Tirador | 23.6 | 0.75 | 14.6 | 1/3 | 25 % |
| Arco de escarcha | rare | Tirador | 23.5 | 0.74 | 14.8 | 1/3 | 4 % |
| Grimorio de huesos | epic | Caballero | 23.0 | 0.73 | 24.2 | 3/3 | 15 % |
| Arco triple | rare | Tirador | 21.7 | 0.69 | 10.9 | 1/3 | 2 % |
| Arco largo | uncommon | Tirador | 21.6 | 0.68 | 10.4 | 1/3 | 8 % |
| Ballesta pesada | rare | Tirador | 21.3 | 0.68 | 15.7 | 2/3 | 4 % |
| Mosquete | rare | Tirador | 20.2 | 0.64 | 33.0 | 2/3 | 59 % |
| Bastón del rayo | epic | Caballero | 19.3 | 0.61 | 13.3 | 2/3 | 17 % |
| Rayo sostenido ⬇ | epic | Caballero | 18.8 | 0.59 | 13.8 | 2/3 | 2 % |
| Bastón de marea ⬇ | rare | Caballero | 18.4 | 0.58 | 6.5 | 0/3 | 6 % |
| Varita de aprendiz ⬇ | common | Caballero | 17.9 | 0.57 | 18.9 | 2/3 | 17 % |
| Orbe del vacío ⬇ | epic | Caballero | 17.4 | 0.55 | 9.7 | 0/3 | 8 % |

_294 partidas en 175 s._
