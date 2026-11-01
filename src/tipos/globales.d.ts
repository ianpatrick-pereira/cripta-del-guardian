// Lo que el juego añade o usa de `window` y que TypeScript no conoce.
interface Window {
  /** AudioContext en Safari antiguo */
  webkitAudioContext: typeof AudioContext;
  /** ganchos para las pruebas automáticas (pruebas/probar.js) */
  __cripta: any;
}
