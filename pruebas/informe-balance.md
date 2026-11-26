# Informe de balance

Generado por `node pruebas/balance.js 2 --ci`.

El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.

## Límites (pruebas/balance-limites.jsonc)

**✓ Ningún límite roto** (33 armas comprobadas, 8 pisos y 3 clases comprobados)

- ⚠ Piso 3: 3.4× más difícil que el piso 2 (aviso desde 1.8×)
- ⚠ Piso 7: 2.2× más difícil que el piso 6 (aviso desde 1.8×)
- ⚠ Asesino necesita 2.5× las vidas de Caballero (aviso desde 2×)

## Dificultad por piso

El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de 2 partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.

| Piso | Caballero | Tirador | Asesino | Salas | Subjefe | Jefe |
|---|---|---|---|---|---|---|
| 1 | 11.1 | 4.3 | 21.9 | 0.1 | 1.6 | 10.8 |
| 2 | 9.4 | 10.0 | 20.8 | 1.1 | 2.9 | 9.4 |
| 3 | 30.1 | 36.3 | 71.5 | 8.7 | 11.3 | 25.9 |
| 4 | 51.4 | 69.2 | 119.9 | 18.4 | 19.3 | 42.5 |
| 5 | 71.4 | 56.4 | 167.4 | 30.1 | 32.4 | 35.9 |
| 6 | 29.4 | 42.8 | 65.8 | 12.1 | 11.7 | 22.1 |
| 7 | 65.4 | 81.7 | 156.8 | 18.9 | 41.5 | 40.9 |
| 8 | 54.7 | 100.4 | 170.1 | 10.7 | 49.9 | 47.8 |

| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |
|---|---|---|---|
| Caballero | 40.4 | 3.4 | 0 |
| Tirador | 50.1 | 5.9 | 36 |
| Asesino | 99.3 | 4.7 | 12 |

### Quién hace más daño

- Fantasma: 9 % del daño recibido
- El Gemelo de Aldric: 7 % del daño recibido
- Elena, Corazón de la Cripta: 7 % del daño recibido
- El Señor del Osario: 7 % del daño recibido
- La Forjadora: 6 % del daño recibido
- Embestidor: 6 % del daño recibido
- El Obispo Hueco: 6 % del daño recibido
- Escudero: 6 % del daño recibido
- Obispo de Ceniza: 6 % del daño recibido
- Herrero Fundido: 5 % del daño recibido
- La Raíz Madre: 5 % del daño recibido
- El Devorador de Luz: 5 % del daño recibido

## Armas a 3★ (piso 4)

Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: 27.5. Marcadas: contra un blanco, más de 1.7× (⬆) o menos de 0.6× (⬇) la mediana (los avisos de pruebas/balance-limites.jsonc).

| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |
|---|---|---|---|---|---|---|---|
| Filo nocturno | epic | Asesino | 46.6 | 1.70 | 44.0 | 3/3 | 81 % |
| Látigo de cadenas | uncommon | Asesino | 42.9 | 1.56 | 35.0 | 3/3 | 82 % |
| Guadaña sangrienta | epic | Asesino | 42.4 | 1.54 | 44.7 | 3/3 | 92 % |
| Lanza de guardia | uncommon | Caballero | 39.5 | 1.44 | 39.6 | 3/3 | 100 % |
| Dagas gemelas | rare | Asesino | 38.3 | 1.39 | 33.0 | 2/3 | 49 % |
| Shurikens | rare | Asesino | 37.7 | 1.37 | 17.6 | 2/3 | 4 % |
| Hoz arrojadiza | rare | Asesino | 37.5 | 1.36 | 28.3 | 3/3 | 28 % |
| Espada corta | rare | Caballero | 37.3 | 1.36 | 35.2 | 3/3 | 99 % |
| Espada de hierro | uncommon | Caballero | 35.7 | 1.30 | 32.7 | 3/3 | 89 % |
| Martillo de guerra | rare | Caballero | 35.6 | 1.29 | 41.9 | 3/3 | 80 % |
| Garras de sombra | rare | Asesino | 33.4 | 1.22 | 34.7 | 3/3 | 51 % |
| Arco de las Sombras | epic | Asesino | 30.7 | 1.12 | 7.4 | 0/3 | 5 % |
| Katar | uncommon | Asesino | 30.6 | 1.12 | 23.9 | 2/3 | 35 % |
| Espada oxidada | common | Caballero | 29.6 | 1.08 | 25.5 | 3/3 | 94 % |
| Honda | common | Tirador | 29.1 | 1.06 | 10.8 | 1/3 | 29 % |
| Cerbatana | uncommon | Asesino | 28.2 | 1.03 | 17.8 | 3/3 | 29 % |
| Bastón del vendaval | rare | Caballero | 27.5 | 1.00 | 12.2 | 2/3 | 4 % |
| Bastón de fuego | rare | Caballero | 27.1 | 0.99 | 34.4 | 2/3 | 25 % |
| Escudo de púas | uncommon | Caballero | 27.0 | 0.98 | 26.5 | 3/3 | 95 % |
| Garrote | common | Caballero | 26.2 | 0.95 | 36.2 | 3/3 | 92 % |
| Kunais | common | Asesino | 25.4 | 0.92 | 15.9 | 3/3 | 21 % |
| Daga veloz | uncommon | Asesino | 25.0 | 0.91 | 38.3 | 3/3 | 92 % |
| Grimorio de huesos | epic | Caballero | 24.3 | 0.89 | 30.2 | 3/3 | 35 % |
| Arco corto | common | Tirador | 24.1 | 0.88 | 14.0 | 2/3 | 37 % |
| Bastón de la ciénaga | uncommon | Asesino | 22.1 | 0.80 | 21.7 | 2/3 | 19 % |
| Bastón del rayo | epic | Caballero | 21.7 | 0.79 | 10.2 | 1/3 | 13 % |
| Ballesta pesada | rare | Tirador | 21.4 | 0.78 | 23.6 | 3/3 | 33 % |
| Varita de aprendiz | common | Caballero | 20.3 | 0.74 | 20.8 | 2/3 | 39 % |
| Orbe del vacío | epic | Caballero | 20.1 | 0.73 | 10.0 | 0/3 | 10 % |
| Bastón de roca | uncommon | Caballero | 20.1 | 0.73 | 15.9 | 3/3 | 6 % |
| Mosquete | rare | Tirador | 20.1 | 0.73 | 35.3 | 3/3 | 78 % |
| Rayo sostenido | epic | Caballero | 19.3 | 0.70 | 10.4 | 0/3 | 2 % |
| Bastón de marea | rare | Caballero | 19.1 | 0.69 | 12.2 | 2/3 | 18 % |

_246 partidas en 316 s._
