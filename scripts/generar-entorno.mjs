/**
 * Genera `src/environments/environment.prod.ts` para el build de produccion.
 *
 * Por que? El backend (NestJS en Railway) vive en otro host que el
 * frontend (Angular en Netlify), asi que la URL del API no puede estar
 * fija en el codigo: se inyecta en tiempo de BUILD con la variable de
 * entorno `API_URL`.
 *
 * Netlify: Site configuration -> Environment variables -> `API_URL`
 *          = https://<tu-backend>.up.railway.app/api
 *
 * Variables de entorno admitidas:
 *   - `API_URL`         -> URL base del backend (con el prefijo /api).
 *   - `GEMINI_API_KEY`  -> clave de Gemini (si no, se usa la de desarrollo).
 *
 * Uso: se ejecuta automaticamente con `npm run build` (hook `prebuild`).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Clave de Gemini usada en desarrollo si no se define GEMINI_API_KEY. */
const GEMINI_POR_DEFECTO = '***REMOVED-GEMINI-NUEVA***';

const apiUrl = (process.env.API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');
const geminiApiKey = process.env.GEMINI_API_KEY || GEMINI_POR_DEFECTO;

const destino = resolve(RAIZ, 'src/environments/environment.prod.ts');

const contenido = `// Generado por scripts/generar-entorno.mjs - NO editar a mano.
// Reemplaza a src/environments/environment.ts en el build de produccion
// (ver el bloque "fileReplacements" de angular.json).

export const environment = {
  production: true,
  geminiApiKey: '${geminiApiKey}',
  /** URL base del backend NestJS (prefijo global /api) */
  apiUrl: '${apiUrl}'
};
`;

mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, contenido, 'utf8');

console.log(`[entorno] apiUrl = ${apiUrl}`);
console.log(`[entorno] destino = ${destino}`);
