# Informe de balance

Generado por `node pruebas/balance.js 3 --ci`.

El bot juega peor que una persona (no recoge botín ni elige bien las mejoras): compara clases, pisos y armas entre sí, no mide la dificultad real.

## Límites (pruebas/balance-limites.jsonc)

**✓ Ningún límite roto** (41 armas comprobadas, 8 pisos y 3 clases comprobados)

- ⚠ Piso 3: 3.6× más difícil que el piso 2 (aviso desde 1.8×)
- ⚠ Piso 7: 2.2× más difícil que el piso 6 (aviso desde 1.8×)
- ⚠ Asesino necesita 2.6× las vidas de Caballero (aviso desde 2×)

## Dificultad por piso

El bot es inmortal: cada celda dice cuántas barras de vida llenas habría necesitado para terminar el piso (media de 3 partidas). 1 = justo una vida entera. Una persona con mejoras, reliquias y pociones necesita menos; lo útil es ver dónde sube de golpe.

| Piso | Caballero | Tirador | Asesino | Salas | Subjefe | Jefe |
|---|---|---|---|---|---|---|
| 1 | 12.0 | 4.0 | 21.2 | 0.3 | 1.3 | 10.9 |
| 2 | 8.7 | 10.0 | 21.0 | 0.9 | 2.7 | 9.6 |
| 3 | 32.9 | 33.1 | 78.7 | 7.2 | 12.3 | 28.7 |
| 4 | 51.9 | 65.7 | 116.6 | 16.9 | 20.5 | 40.7 |
| 5 | 64.5 | 74.3 | 173.2 | 32.2 | 34.1 | 37.6 |
| 6 | 28.7 | 37.1 | 65.9 | 10.6 | 11.6 | 21.8 |
| 7 | 57.9 | 87.2 | 148.1 | 13.8 | 42.4 | 41.6 |
| 8 | 52.9 | 88.4 | 191.9 | 13.6 | 47.3 | 50.2 |

| Clase | Vidas por piso (media) | Minutos por piso | Salas que no pudo terminar |
|---|---|---|---|
| Caballero | 38.7 | 3.7 | 9 |
| Tirador | 50.0 | 6.0 | 55 |
| Asesino | 102.1 | 4.7 | 16 |

### Quién hace más daño

- Fantasma: 7 % del daño recibido
- Embestidor: 7 % del daño recibido
- Elena, Corazón de la Cripta: 7 % del daño recibido
- El Obispo Hueco: 7 % del daño recibido
- El Gemelo de Aldric: 7 % del daño recibido
- La Forjadora: 7 % del daño recibido
- El Señor del Osario: 6 % del daño recibido
- Obispo de Ceniza: 6 % del daño recibido
- Escudero: 5 % del daño recibido
- Herrero Fundido: 5 % del daño recibido
- La Raíz Madre: 5 % del daño recibido
- El Devorador de Luz: 5 % del daño recibido

## Armas a 3★ (piso 4)

Daño por segundo, en manos de la clase que la domina. «Contra un blanco»: dos enemigos quietos y energía infinita (lo fuerte que es el arma). «Contra un grupo»: seis enemigos que se mueven y atacan, con la energía normal y sin recoger orbes (lo que rinde en una pelea; favorece a las armas que golpean a varios a la vez). Mediana contra un blanco: 29.1. Marcadas: contra un blanco, más de 1.7× (⬆) o menos de 0.6× (⬇) la mediana (los avisos de pruebas/balance-limites.jsonc).

| Arma | Rareza | Clase | Contra un blanco (daño/s) | × mediana | Contra un grupo (daño/s) | Grupo despejado | Energía al final |
|---|---|---|---|---|---|---|---|
| Filo nocturno | epic | Asesino | 46.6 | 1.60 | 44.0 | 3/3 | 81 % |
| Martillo de guerra | rare | Caballero | 43.2 | 1.48 | 39.8 | 3/3 | 85 % |
| Látigo de cadenas | uncommon | Asesino | 42.9 | 1.47 | 35.0 | 3/3 | 82 % |
| Guadaña sangrienta | epic | Asesino | 42.4 | 1.46 | 44.7 | 3/3 | 92 % |
| Arco explosivo | epic | Tirador | 41.2 | 1.41 | 31.0 | 3/3 | 9 % |
| Hoja del Abismo | epic | Caballero | 39.2 | 1.35 | 30.5 | 3/3 | 21 % |
| Mandoble | rare | Caballero | 39.0 | 1.34 | 48.6 | 3/3 | 92 % |
| Espada flamígera | epic | Caballero | 38.9 | 1.34 | 30.6 | 3/3 | 38 % |
| Dagas gemelas | rare | Asesino | 38.3 | 1.31 | 33.0 | 2/3 | 49 % |
| Shurikens | rare | Asesino | 37.7 | 1.30 | 17.6 | 2/3 | 4 % |
| Hoz arrojadiza | rare | Asesino | 37.5 | 1.29 | 28.3 | 3/3 | 28 % |
| Espada oxidada | common | Caballero | 36.9 | 1.27 | 35.2 | 3/3 | 95 % |
| Hoja de escarcha | rare | Caballero | 36.7 | 1.26 | 38.9 | 3/3 | 94 % |
| Lanza de guardia | uncommon | Caballero | 35.3 | 1.21 | 32.9 | 3/3 | 87 % |
| Garras de sombra | rare | Asesino | 33.4 | 1.15 | 34.7 | 3/3 | 51 % |
| Espada de hierro | uncommon | Caballero | 31.5 | 1.08 | 36.8 | 3/3 | 97 % |
| Bumerán | common | Tirador | 31.0 | 1.06 | 32.0 | 3/3 | 88 % |
| Arco de las Sombras | epic | Asesino | 30.7 | 1.05 | 7.4 | 0/3 | 5 % |
| Katar | uncommon | Asesino | 30.6 | 1.05 | 23.9 | 2/3 | 35 % |
| Garrote | common | Caballero | 30.0 | 1.03 | 35.8 | 3/3 | 100 % |
| Honda | common | Tirador | 29.1 | 1.00 | 10.8 | 1/3 | 29 % |
| Cerbatana | uncommon | Asesino | 28.2 | 0.97 | 17.8 | 3/3 | 29 % |
| Bastón del vendaval | rare | Caballero | 27.5 | 0.94 | 12.2 | 2/3 | 4 % |
| Bastón de fuego | rare | Caballero | 27.1 | 0.93 | 34.4 | 2/3 | 25 % |
| Escudo de púas | uncommon | Caballero | 27.0 | 0.93 | 26.5 | 3/3 | 95 % |
| Arco largo | uncommon | Tirador | 26.2 | 0.90 | 17.2 | 3/3 | 16 % |
| Kunais | common | Asesino | 25.4 | 0.87 | 15.9 | 3/3 | 21 % |
| Daga veloz | uncommon | Asesino | 25.0 | 0.86 | 38.3 | 3/3 | 92 % |
| Grimorio de huesos | epic | Caballero | 24.3 | 0.84 | 30.2 | 3/3 | 35 % |
| Arco corto | common | Tirador | 24.1 | 0.83 | 14.0 | 2/3 | 37 % |
| Arco de escarcha | rare | Tirador | 23.8 | 0.82 | 17.1 | 1/3 | 5 % |
| Bastón de la ciénaga | uncommon | Asesino | 22.1 | 0.76 | 21.7 | 2/3 | 19 % |
| Bastón del rayo | epic | Caballero | 21.7 | 0.74 | 10.2 | 1/3 | 13 % |
| Ballesta pesada | rare | Tirador | 21.4 | 0.74 | 23.6 | 3/3 | 33 % |
| Varita de aprendiz | common | Caballero | 20.3 | 0.70 | 20.8 | 2/3 | 39 % |
| Orbe del vacío | epic | Caballero | 20.1 | 0.69 | 10.0 | 0/3 | 10 % |
| Bastón de roca | uncommon | Caballero | 20.1 | 0.69 | 15.9 | 3/3 | 6 % |
| Mosquete | rare | Tirador | 20.1 | 0.69 | 35.3 | 3/3 | 78 % |
| Rayo sostenido | epic | Caballero | 19.3 | 0.66 | 10.4 | 0/3 | 2 % |
| Bastón de marea | rare | Caballero | 19.1 | 0.66 | 12.2 | 2/3 | 18 % |
| Arco triple | rare | Tirador | 18.9 | 0.65 | 12.7 | 1/3 | 4 % |

_318 partidas en 343 s._
