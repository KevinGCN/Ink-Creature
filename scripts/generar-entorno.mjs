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
 *   - `API_URL` -> URL base del backend (con el prefijo /api).
 *
 * NOTA: aqui NO se inyecta ninguna llave de la IA. La llave de Gemini
 * vive solo en el backend (variable `GEMINI_API_KEY` en Railway) y el
 * frontend la consume a traves de `POST /api/ia/analyze-tattoo`. Si se
 * metiera en este archivo, quedaria escrita en el bundle del navegador.
 *
 * Uso: se ejecuta automaticamente con `npm run build` (hook `prebuild`).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const apiUrl = (process.env.API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

const destino = resolve(RAIZ, 'src/environments/environment.prod.ts');

const contenido = `// Generado por scripts/generar-entorno.mjs - NO editar a mano.
// Reemplaza a src/environments/environment.ts en el build de produccion
// (ver el bloque "fileReplacements" de angular.json).
//
// Sin llaves: la IA se consume por proxy contra el backend.

export const environment = {
  production: true,
  /** URL base del backend NestJS (prefijo global /api) */
  apiUrl: '${apiUrl}'
};
`;

mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, contenido, 'utf8');

console.log(`[entorno] apiUrl = ${apiUrl}`);
console.log(`[entorno] destino = ${destino}`);
