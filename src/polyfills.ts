/**
 * Polyfills del bundle.
 *
 * En Angular 21 ya no hace falta cargar `core-js` ni los polyfills de
 * Reflect: el único que sigue siendo imprescindible en este proyecto es
 * Zone.js, así que se mantiene este archivo para no tocar la entrada
 * `polyfills` de `angular.json`.
 *
 * Su presencia garantiza que el orden de carga sea "polyfills → main", de
 * modo que Zone esté parcheado antes de que se cree el primer componente.
 */
import 'zone.js';
