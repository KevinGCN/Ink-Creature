/**
 * Genera `src/environments/environment.prod.ts` para el build de produccion.
 *
 * Por que? El backend (NestJS, desplegado en Render) vive en otro host que el
 * frontend (Angular, desplegado en Netlify), asi que la URL del API no puede
 * estar fija en el codigo: se inyecta en tiempo de BUILD con la variable de
 * entorno `API_URL`.
 *
 * Netlify: Site configuration -> Environment variables -> `API_URL`
 *          = https://inkcreature-backend.onrender.com
 *
 * `API_URL` tambien esta declarada en `netlify.toml` ([build.environment]),
 * asi que el build de Netlify la recibe aunque falte en el panel.
 *
 * IMPORTANTE: el backend ya NO usa prefijo global. `API_URL` es solo el
 * ORIGEN (esquema + host + puerto, sin "/api"); los servicios del SPA
 * concatenan directamente "/auth/login", "/galeria", etc. Si se define con
 * "/api" el script falla para no publicar una web con todas las rutas en 404.
 *
 * Si `API_URL` no existe se usa `API_URL_POR_DEFECTO` (el backend real de
 * produccion) y se avisa por consola: preferible un aviso ruidoso a publicar
 * una web que llama a localhost y se queda sin datos.
 *
 * El script FALLA (exit 1) si la URL:
 *   - no es http/https,
 *   - termina en "/api" (prefijo eliminado del backend),
 *   - apunta a localhost/127.0.0.1 en un build de Netlify (seria un despliegue roto).
 *
 * NOTA: aqui NO se inyecta ninguna llave de la IA. La llave de Gemini vive
 * solo en el backend (variable `GEMINI_API_KEY`) y el frontend la consume a
 * traves de `POST /ia/analyze-tattoo`. Si se metiera en este archivo,
 * quedaria escrita en el bundle del navegador.
 *
 * Uso: se ejecuta automaticamente con `npm run build` (hook `prebuild`).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Backend NestJS de produccion (mismo que sirve https://ink-creature-v2.netlify.app). */
const API_URL_POR_DEFECTO = 'https://inkcreature-backend.onrender.com';

/** Netlify define NETLIFY=true y CONTEXT durante el build. */
const ES_BUILD_DE_NETLIFY = process.env.NETLIFY === 'true' || Boolean(process.env.CONTEXT);

const HOSTS_LOCALES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

function normalizarApiUrl(valor, origen) {
  const limpia = String(valor).trim().replace(/\/+$/, '');

  let url;
  try {
    url = new URL(limpia);
  } catch {
    throw new Error(`[entorno] ${origen} no es una URL valida: "${valor}"`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`[entorno] ${origen} debe usar http o https: "${valor}"`);
  }

  if (ES_BUILD_DE_NETLIFY && HOSTS_LOCALES.has(url.hostname)) {
    throw new Error(
      `[entorno] ${origen} apunta a "${url.hostname}" durante un build de Netlify. ` +
        'Ese despliegue no podria hablar con el API: define API_URL con el backend publico.',
    );
  }

  // El backend sirve las rutas en la raiz: cualquier path sobrante (típico
  // "/api" de la configuracion anterior) romperia todas las llamadas.
  const ruta = url.pathname.replace(/\/+$/, '');
  if (ruta) {
    throw new Error(
      `[entorno] ${origen} no debe incluir ruta ("${ruta}"): el backend sirve en la raiz. ` +
        `Usa solo el origen, p. ej. "${url.origin}".`,
    );
  }

  return url.origin;
}

const apiUrlConfigurada = process.env.API_URL;
let apiUrl;

if (apiUrlConfigurada && apiUrlConfigurada.trim()) {
  apiUrl = normalizarApiUrl(apiUrlConfigurada, 'API_URL');
  console.log('[entorno] usando API_URL del entorno');
} else {
  apiUrl = normalizarApiUrl(API_URL_POR_DEFECTO, 'API_URL_POR_DEFECTO');
  console.warn(
    '[entorno] AVISO: API_URL no esta definida; se usa el backend de produccion por defecto:',
    apiUrl,
  );
}

const destino = resolve(RAIZ, 'src/environments/environment.prod.ts');

const contenido = `// Generado por scripts/generar-entorno.mjs - NO editar a mano.
// Reemplaza a src/environments/environment.ts en el build de produccion
// (ver el bloque "fileReplacements" de angular.json).
//
// Sin llaves: la IA se consume por proxy contra el backend.

export const environment = {
  production: true,
  /** Origen del backend NestJS (las rutas cuelgan de la raiz) */
  apiUrl: '${apiUrl}'
};
`;

mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, contenido, 'utf8');

console.log(`[entorno] apiUrl = ${apiUrl}`);
console.log(`[entorno] destino = ${destino}`);
