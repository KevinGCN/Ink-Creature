/**
 * Entorno de DESARROLLO (el que usa `ng serve`).
 *
 * En producción este archivo se sustituye completo por
 * `environment.prod.ts` (ver `fileReplacements` en `angular.json`), que genera
 * `scripts/generar-entorno.mjs` en el build a partir de la variable `API_URL`
 * de Netlify.
 *
 * Aquí solo viajan valores públicos: todo lo que se escriba en este objeto
 * acaba dentro del bundle y es visible en el navegador, así que ninguna clave
 * (Gemini, Firebase…) puede vivir aquí. Las llamadas a IA pasan por el
 * backend, que es el único que conoce `GEMINI_API_KEY`.
 */
export const environment = {
    production: false, 
    // Se usa como origen de cada endpoint, así que va SIN sufijo "/api" y sin
    // barra final: los servicios concatenan "/auth/login", "/galeria", etc.
    /** Origen del backend NestJS (las rutas cuelgan de la raíz) */
    apiUrl: 'http://localhost:3000'
};