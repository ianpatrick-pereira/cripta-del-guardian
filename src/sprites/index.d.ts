// Los dibujos de src/sprites/*.png, que build.js convierte en este módulo (no existe en disco como .js).
// SPRITES.slime = [['..kkkk..', ...], { k: '#1a1024', ... }]: filas de letras ('.' = transparente) y el color de cada letra.
// Una hoja de animación (src/sprites/animaciones.jsonc) añade un tercer elemento: { detalle, anim }.
//   detalle: píxeles del dibujo por cada píxel normal del juego (2 = el doble de fino).
//   anim.reposo = { cuadros: ['knight~reposo~0', ...], fps: 3 }: las claves de cada cuadro, también en SPRITES.
export type Anim = { cuadros: string[]; fps: number };
export const SPRITES: Record<string, [string[], Record<string, string>, { detalle?: number; anim?: Record<string, Anim> }?]>;
