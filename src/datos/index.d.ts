// GENERADO por build.js a partir de src/datos/esquemas/: no lo edites a mano.
// Es el tipo de DATOS, para que el editor autocomplete DATOS.pisos[0].luz.clara, etc.

/** Un piso de la campaña */
export interface Piso {
  /** número del piso (1 a 8, sin saltos) */
  piso: number;
  /** nombre que ve el jugador */
  nombre: string;
  /** enemigos de las salas cerca de la entrada (ids de src/js/01b-enemigos/); repetir un id lo hace más frecuente */
  enemigosCerca: string[];
  /** enemigos de las salas del fondo (ids de src/js/01b-enemigos/) */
  enemigosLejos: string[];
  /** jefe del piso (id de src/js/01e-jefes/) */
  jefe: string;
  /** probabilidad de que cada enemigo salga élite (0.1 = 10 %) */
  elites: number;
  /** más oscuridad, latidos con poca vida y música de miedo */
  terror: boolean;
  /** luz alrededor del jugador */
  luz: {
    /** radio totalmente iluminado alrededor del jugador */
    clara: number;
    /** radio donde ya es noche */
    hastaNoche: number;
    /** lo oscura que es la noche (0 a 1) */
    oscuridad: number;
  };
  /** música del piso */
  musica: {
    /** nota base (número MIDI) */
    nota: number;
    /** pulsos por minuto */
    tempo: number;
  };
  /** colores del suelo y de los muros */
  colores: {
    /** color base del suelo (#rrggbb) */
    sueloA: string;
    /** segundo color del suelo (se alterna con sueloA) (#rrggbb) */
    sueloB: string;
    /** color de las grietas del suelo (#rrggbb) */
    grietas: string;
    /** color de las manchas del suelo (#rrggbb) */
    manchas: string;
    /** cara de arriba de los muros (#rrggbb) */
    muroArriba: string;
    /** cara frontal de los muros (#rrggbb) */
    muroFrente: string;
    /** borde de los muros (#rrggbb) */
    muroBorde: string;
  };
  /** decoración del piso */
  ambiente: {
    /** color de las antorchas */
    antorchas: string;
    /** color de los brillos */
    brillo: string;
    /** color de los estandartes */
    estandartes: string;
    /** plantas: [color oscuro, color claro] */
    plantas: [string, string];
    /** color de las flores */
    flores: string;
    /** color de los charcos */
    charcos: string;
    /** partículas que flotan */
    particulas: "polvo" | "esporas" | "brasas" | "nieve" | "luciernagas" | "chispas" | "petalos";
    /** color de la viñeta de los bordes */
    vineta: string;
    /** cada cuántas casillas hay una antorcha en el muro de arriba */
    antorchaCada: number;
    /** probabilidad de telarañas */
    telaranas: number;
    /** probabilidad de enredaderas */
    enredaderas: number;
    /** cuánta decoración hay junto a los muros */
    densidadBordes: number;
    /** cuánta decoración hay en el resto del suelo */
    densidadCentro: number;
    /** decoración junto a los muros: tipo y peso (más peso = más frecuente) */
    bordes: Record<"huesos" | "velas" | "cristales" | "musgo" | "hierba" | "charcos" | "runas" | "hongos" | "espinas" | "escarcha" | "lava" | "flores" | "vidrios" | "rosas", number>;
    /** decoración del resto del suelo: tipo y peso */
    centro: Record<"huesos" | "velas" | "cristales" | "musgo" | "hierba" | "charcos" | "runas" | "hongos" | "espinas" | "escarcha" | "lava" | "flores" | "vidrios" | "rosas", number>;
  };
  /** lo que rodea la mazmorra (el fondo fuera de las salas) */
  mar: {
    /** color de base del fondo */
    fondo: string;
    /** manchas: [caliente, media, fría] */
    manchas: [string, string, string];
    /** placas que flotan encima */
    costra: string;
    /** borde brillante de las placas */
    grietas: string;
    /** puntitos de luz: [color 1, color 2] */
    chispas: [string, string];
    /** color de las burbujas (también el del reventón) */
    burbujas: string;
    /** color de las llamas en los bordes, o null si no hay */
    llamas: any;
    /** color del vapor que sale de los bordes */
    vapor: string;
    /** cuánta luz propia da el fondo (0 = nada, 1 = mucha) */
    luz: number;
  };
}

/** Oleadas de las salas de combate */
export interface Oleadas {
  /** cuántas oleadas tiene cada sala de combate */
  oleadasPorSala: {
    /** oleadas de una sala normal */
    normal: number;
    /** oleadas de una sala difícil */
    dificil: number;
    /** desde esta profundidad la sala es difícil */
    profundidadDificil: number;
  };
  /** las salas con profundidad menor usan enemigosCerca; las demás, enemigosLejos */
  profundidadLejos: number;
  /** enemigos de cada oleada = base + porProfundidad × profundidad + porOleada × oleada + porPiso × (piso − 1) */
  enemigos: {
    /** base */
    base: number;
    /** porProfundidad */
    porProfundidad: number;
    /** profundidadMaxima */
    profundidadMaxima: number;
    /** porOleada */
    porOleada: number;
    /** porPiso */
    porPiso: number;
    /** minimo */
    minimo: number;
  };
  /** pisos con menos enemigos pero con más vida */
  pisosDuros: {
    /** desde este piso */
    desdePiso: number;
    /** multiplica cuántos enemigos salen */
    factorCantidad: number;
    /** multiplica su vida */
    factorVida: number;
  };
}

/** Botín de enemigos, cajas y cofres */
export interface Botin {
  /** peso de cada rareza al sortear un arma */
  rarezaArmas: {
    /** peso de common */
    common: number;
    /** peso de uncommon */
    uncommon: number;
    /** peso de rare */
    rare: number;
    /** peso de epic */
    epic: number;
  };
  /** peso de cada número de estrellas según de dónde sale */
  estrellas: {
    /** peso de 1★, 2★, 3★, 4★ y 5★ */
    enemigo: [number, number, number, number, number];
    /** peso de 1★, 2★, 3★, 4★ y 5★ */
    cofre: [number, number, number, number, number];
    /** peso de 1★, 2★, 3★, 4★ y 5★ */
    cofreDorado: [number, number, number, number, number];
    /** peso de 1★, 2★, 3★, 4★ y 5★ */
    tienda: [number, number, number, number, number];
  };
  /** al morir un enemigo normal */
  enemigo: {
    /** [mínimo, máximo] al azar */
    monedas: [number, number];
    /** monedas extra si es élite */
    monedasElite: number;
    /** probabilidad de energía */
    energia: number;
    /** probabilidad de poción */
    pocion: number;
    /** probabilidad de arma */
    arma: number;
  };
  /** extra si era élite */
  elite: {
    /** probabilidad de gema */
    gema: number;
    /** probabilidad de llave */
    llave: number;
  };
  /** al romper una caja */
  caja: {
    /** probabilidad de monedas */
    monedas: number;
    /** [mínimo, máximo] al azar */
    cuantasMonedas: [number, number];
    /** probabilidad de energía */
    energia: number;
    /** probabilidad de poción */
    pocion: number;
    /** probabilidad de llave */
    llave: number;
  };
  /** al despejar una sala de combate */
  salaDespejada: {
    /** probabilidad de cofre dorado */
    cofreDorado: number;
    /** probabilidad de cofre */
    cofre: number;
  };
  /** al abrir un cofre */
  cofre: {
    /** [mínimo, máximo] al azar */
    monedas: [number, number];
    /** probabilidad de poción */
    pocion: number;
    /** probabilidad de armadura */
    armadura: number;
  };
  /** el cofre dorado (necesita llave) */
  cofreDorado: {
    /** probabilidad de armadura */
    armadura: number;
  };
  /** al vencer a un jefe */
  jefe: {
    /** monedas */
    monedas: number;
    /** probabilidad de armadura */
    armadura: number;
  };
  /** al vencer a un subjefe */
  subjefe: {
    /** monedas */
    monedas: number;
  };
}

/** Los dos finales */
export interface Finales {
  /** si tienes todas las notas del diario */
  completo: {
    etiqueta: string;
    titulo: string;
    /** un párrafo por elemento */
    texto: string[];
  };
  /** si falta alguna */
  incompleto: {
    etiqueta: string;
    titulo: string;
    /** un párrafo por elemento */
    texto: string[];
  };
}

export const DATOS: { pisos: Piso[]; oleadas: Oleadas; botin: Botin; finales: Finales };
