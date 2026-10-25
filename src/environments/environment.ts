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
    // Se usa como prefijo de cada endpoint, así que debe incluir "/api" y no
    // la barra final: los servicios concatenan "/auth/login", "/galeria", etc.
    /** URL base del backend NestJS (prefijo global /api) */
    apiUrl: 'http://localhost:3000/api'
};