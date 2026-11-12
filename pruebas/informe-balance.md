# Informe de balance

Generado por `node pruebas/balance.js 2 --ci`.

El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.

## Límites (pruebas/balance-limites.jsonc)

**✓ Ningún límite roto** (41 armas comprobadas, 8 pisos y 3 clases comprobados)

- ⚠ Piso 3: 3.5× más difícil que el piso 2 (aviso desde 1.8×)
- ⚠ Piso 4: 2.0× más difícil que el piso 3 (aviso desde 1.8×)
- ⚠ Piso 7: 2.1× más difícil que el piso 6 (aviso desde 1.8×)
- ⚠ Asesino necesita 2.8× las vidas de Caballero (aviso desde 2×)

## Dificultad por piso

El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de 2 partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.

| Piso | Caballero | Tirador | Asesino | Salas | Subjefe | Jefe |
|---|---|---|---|---|---|---|
| 1 | 13.8 | 2.3 | 23.1 | 0.3 | 1.2 | 11.5 |
| 2 | 9.1 | 9.7 | 20.7 | 1.3 | 3.1 | 8.8 |
| 3 | 32.6 | 26.1 | 81.0 | 6.4 | 13.0 | 27.2 |
| 4 | 47.6 | 80.8 | 154.5 | 24.5 | 23.3 | 46.6 |
| 5 | 55.1 | 65.3 | 181.8 | 31.2 | 35.8 | 33.8 |
| 6 | 29.3 | 41.0 | 62.0 | 10.0 | 14.1 | 19.9 |
| 7 | 60.7 | 96.5 | 119.8 | 15.3 | 39.0 | 38.1 |
| 8 | 55.3 | 94.7 | 207.8 | 16.3 | 48.0 | 55.0 |

| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |
|---|---|---|---|
| Caballero | 37.9 | 3.3 | 2 |
| Tirador | 52.1 | 6.1 | 40 |
| Asesino | 106.3 | 4.9 | 11 |

### Quién hace más daño

- Fantasma: 9 % del daño recibido
- Elena, Corazón de la Cripta: 8 % del daño recibido
- El Gemelo de Aldric: 7 % del daño recibido
- Escudero: 7 % del daño recibido
- Embestidor: 7 % del daño recibido
- El Señor del Osario: 6 % del daño recibido
- Obispo de Ceniza: 6 % del daño recibido
- La Forjadora: 6 % del daño recibido
- El Obispo Hueco: 6 % del daño recibido
- Herrero Fundido: 6 % del daño recibido
- El Devorador de Luz: 5 % del daño recibido
- La Raíz Madre: 5 % del daño recibido

## Armas a 3★ (piso 4)

Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: 29.3. Marcadas: contra un blanco, más de 1.7× (⬆) o menos de 0.6× (⬇) la mediana (los avisos de pruebas/balance-limites.jsonc).

| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |
|---|---|---|---|---|---|---|---|
| Filo nocturno | epic | Asesino | 46.6 | 1.59 | 43.5 | 3/3 | 53 % |
| Látigo de cadenas | uncommon | Asesino | 42.9 | 1.46 | 51.3 | 3/3 | 88 % |
| Mandoble | rare | Caballero | 42.7 | 1.45 | 41.0 | 3/3 | 92 % |
| Guadaña sangrienta | epic | Asesino | 42.4 | 1.45 | 35.9 | 3/3 | 69 % |
| Arco explosivo | epic | Tirador | 41.2 | 1.40 | 28.5 | 3/3 | 15 % |
| Martillo de guerra | rare | Caballero | 39.3 | 1.34 | 46.8 | 3/3 | 87 % |
| Hoja del Abismo | epic | Caballero | 39.3 | 1.34 | 30.9 | 3/3 | 36 % |
| Hoja de escarcha | rare | Caballero | 38.7 | 1.32 | 31.1 | 3/3 | 67 % |
| Espada flamígera | epic | Caballero | 38.7 | 1.32 | 39.0 | 3/3 | 49 % |
| Dagas gemelas | rare | Asesino | 38.3 | 1.31 | 29.1 | 2/3 | 57 % |
| Hoz arrojadiza | rare | Asesino | 37.5 | 1.28 | 25.2 | 3/3 | 15 % |
| Lanza de guardia | uncommon | Caballero | 35.3 | 1.20 | 34.8 | 3/3 | 95 % |
| Espada de hierro | uncommon | Caballero | 34.9 | 1.19 | 39.8 | 3/3 | 97 % |
| Garras de sombra | rare | Asesino | 33.4 | 1.14 | 26.5 | 2/3 | 36 % |
| Shurikens | rare | Asesino | 33.3 | 1.14 | 19.4 | 1/3 | 32 % |
| Escudo de púas | uncommon | Caballero | 33.3 | 1.14 | 26.6 | 3/3 | 84 % |
| Bumerán | common | Tirador | 31.0 | 1.06 | 37.8 | 3/3 | 84 % |
| Katar | uncommon | Asesino | 30.6 | 1.04 | 29.2 | 2/3 | 60 % |
| Garrote | common | Caballero | 29.9 | 1.02 | 37.3 | 3/3 | 100 % |
| Arco de las Sombras | epic | Asesino | 29.7 | 1.01 | 6.9 | 0/3 | 5 % |
| Espada oxidada | common | Caballero | 29.3 | 1.00 | 33.1 | 3/3 | 93 % |
| Bastón del vendaval | rare | Caballero | 28.9 | 0.98 | 10.9 | 0/3 | 5 % |
| Bastón de fuego | rare | Caballero | 28.4 | 0.97 | 31.9 | 2/3 | 26 % |
| Cerbatana | uncommon | Asesino | 28.2 | 0.96 | 21.4 | 3/3 | 21 % |
| Bastón de la ciénaga | uncommon | Asesino | 25.8 | 0.88 | 24.4 | 2/3 | 17 % |
| Kunais | common | Asesino | 25.4 | 0.86 | 25.3 | 3/3 | 43 % |
| Daga veloz | uncommon | Asesino | 25.1 | 0.86 | 26.9 | 2/3 | 59 % |
| Grimorio de huesos | epic | Caballero | 24.2 | 0.83 | 21.0 | 2/3 | 6 % |
| Arco de escarcha | rare | Tirador | 22.8 | 0.78 | 10.7 | 0/3 | 4 % |
| Arco corto | common | Tirador | 22.8 | 0.78 | 14.9 | 2/3 | 33 % |
| Ballesta pesada | rare | Tirador | 21.4 | 0.73 | 14.8 | 2/3 | 8 % |
| Arco triple | rare | Tirador | 20.6 | 0.70 | 10.6 | 1/3 | 2 % |
| Arco largo | uncommon | Tirador | 20.6 | 0.70 | 15.0 | 2/3 | 22 % |
| Rayo sostenido | epic | Caballero | 20.4 | 0.70 | 14.0 | 1/3 | 9 % |
| Honda | common | Tirador | 20.3 | 0.69 | 12.0 | 1/3 | 29 % |
| Varita de aprendiz | common | Caballero | 20.3 | 0.69 | 24.9 | 3/3 | 36 % |
| Bastón del rayo | epic | Caballero | 20.3 | 0.69 | 10.5 | 1/3 | 15 % |
| Bastón de roca | uncommon | Caballero | 20.1 | 0.68 | 15.0 | 2/3 | 14 % |
| Mosquete | rare | Tirador | 20.1 | 0.68 | 37.1 | 3/3 | 73 % |
| Bastón de marea | rare | Caballero | 19.1 | 0.65 | 13.7 | 2/3 | 8 % |
| Orbe del vacío | epic | Caballero | 19.1 | 0.65 | 13.4 | 1/3 | 9 % |

_294 partidas en 172 s._
