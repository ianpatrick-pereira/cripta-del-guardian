// Tipos del contenido que se registra con defEnemy, defWeapon, defRoom, defBoss, defSub, defBossMove y defSubMove.
// No cambian el juego: sirven para que el editor autocomplete los campos y para que `npm run tipos`
// avise si a un enemigo le falta la vida, si un arma tiene una rareza que no existe, etc.
// Las entidades del juego (jugador, enemigos, G) todavía no tienen tipo: van como `any`.

type Fn = (...args: any[]) => any;

export interface DefEnemigo {
  /** posición en el bestiario */
  orden: number;
  /** vida, radio, velocidad, daño, sprite y escala */
  stats: { hp: number; r: number; speed: number; dmg: number; spr: string; s: number };
  /** nombre y descripción que ve el jugador en el bestiario */
  bestiario: { n: string; d: string };
  /** píxeles del dibujo: filas de letras (o el nombre de otro mapa) y el color de cada letra */
  sprite?: { clave: string; mapa: string[] | string; paleta: Record<string, string> };
  /** true si se aparta de tus disparos */
  esquiva?: boolean;
  /** comportamiento cada fotograma, o el id de otro enemigo para copiar el suyo */
  ia: ((e: any, c: any) => void) | string;
  forma?: Fn; debajo?: Fn; encima?: Fn;
  /** devuelve el daño que recibe de verdad */
  alRecibir?: (e: any, dmg: number, ang: number, o: any) => number;
  alMorir?: (e: any) => void;
  sinEmpuje?: boolean;
}

export type Rareza = 'common' | 'uncommon' | 'rare' | 'epic';
export type Clase = 'knight' | 'archer' | 'rogue';
export interface DatosArma {
  name: string;
  type: 'melee' | 'bow' | 'staff';
  shape: 'blowgun' | 'book' | 'boomer' | 'bow' | 'claws' | 'dagger' | 'great' | 'hammer' | 'katar' | 'kunai' | 'musket' | 'rod'
    | 'scythe' | 'shield' | 'shuriken' | 'sickle' | 'sling' | 'spear' | 'staff' | 'sword' | 'twin' | 'whip' | 'xbow';
  rarity: Rareza;
  /** daño y tiempo entre ataques (s) */
  dmg: number; cd: number;
  /** energía por ataque */
  en: number;
  /** ataque cargado y su coste de energía */
  chg: 'bash' | 'blast' | 'boomer' | 'lash' | 'legion' | 'lunge' | 'nova' | 'power' | 'quake' | 'ray' | 'reap' | 'spin' | 'volley';
  chgEn: number;
  /** cuerpo a cuerpo: alcance y ángulo del golpe */
  range?: number; arc?: number;
  /** a distancia: velocidad de la bala, cuántos atraviesa y cuántas balas */
  speed?: number; pierce?: number; shots?: number;
  /** efecto al golpear */
  fx?: 'burn' | 'chain' | 'explode' | 'homing' | 'poison' | 'push' | 'slow' | 'stun';
  style?: 'beam' | 'boomer' | 'grimoire' | 'musket' | 'shield' | 'sickle' | 'whip';
  /** color de la gema del dibujo y tinte */
  gem?: string; tint?: string;
  leech?: boolean; big?: boolean;
  /** armas de sigilo: velocidad al empuñarla, recarga de esquiva, invisibilidad al matar, daño por la espalda */
  spd?: number; dodge?: number; veil?: number; back?: number;
}
export interface DefArma {
  /** posición en la lista (el sorteo de botín la recorre en este orden) */
  orden: number;
  datos: DatosArma;
  /** clase que la domina (+30 %); null = neutral */
  familia: Clase | null;
  /** corrección de daño para armas que golpean varias veces o en área (1 = normal) */
  potencia?: number;
  estilo?: {
    d: string;
    esp: { n: string; d: string };
    el: { fire: string; water: string; air: string; earth: string };
    ataque: (p: any, w: any, o: { a: number; dmg: number; cost?: number }) => void;
    cargado: (p: any, w: any, o: { a: number; S: number; dm: (k: number) => number; col: string }) => void;
    cobraAlLanzar?: boolean;
  };
}

export interface DefSala {
  orden: number;
  /** tipo de objeto con el que interactúa el jugador */
  objeto: string;
  colocar: (r: any) => void;
  usable: (it: any) => boolean;
  usar: (p: any, it: any) => void;
  dibujar: (it: any, b: number) => void;
  /** [línea 1, línea 2, color] del cartel */
  aviso: (it: any, key: string) => any[];
  actualizar?: (dt: number) => void;
}

export interface DefJefe {
  orden: number;
  datos: {
    name: string; hp: number; r: number;
    /** id del enemigo que invoca (src/js/01b-enemigos/) */
    minion: string;
    /** distancia a la que se queda */
    want: number;
    /** color de sus balas */
    col: string;
    tint?: string; scale?: number;
    /** id de otro jefe cuyo dibujo reutiliza */
    look?: string;
    /** ataques de cada fase (ids de src/js/01g-ataques-de-jefe/) */
    p1: string[]; p2: string[]; p3: string[];
  };
  logro?: string;
  aspecto?: (g: any, e: any, fill: (color: string) => string, ph2: boolean) => void;
}

export interface DefSubjefe {
  /** piso en el que aparece (uno por piso) */
  piso: number;
  datos: {
    name: string; spr: string; s: number; r: number; hp: number; speed: number; tint: string;
    minion: string; want: number;
    /** color de sus balas */
    pc?: string;
    /** ataques de cada fase (ids de src/js/01h-ataques-de-subjefe/) */
    p1: string[]; p2: string[];
  };
  forma?: Fn; encima?: Fn; alMorir?: Fn;
  rompeAlCaminar?: boolean;
}

export interface DefAtaque {
  /** lo que hace cada fotograma; termina llamando a bossIdle(e) o subIdle(e) */
  hacer: (e: any, dt: number, c: any) => void;
  /** dibuja el aviso antes del ataque */
  aviso?: (e: any) => void;
}
