/**
 * Resolución de URLs de imágenes.
 *
 * El backend guarda en la base de datos rutas RELATIVAS (por ejemplo
 * "/api/imagenes/12"), así la misma fila funciona sin importar el host
 * donde se despliegue la app. Este helper las convierte en URLs absolutas
 * en el momento de pintar.
 */
import { environment } from '../../environments/environment';

/** Origen del backend sin el sufijo "/api" (ej: http://localhost:3000) */
export const ORIGEN_API = environment.apiUrl.replace(/\/api\/?$/, '');

/**
 * Convierte la URL guardada en la BD en una URL que el navegador pueda
 * cargar:
 *  - "https://..." / "data:..." / "blob:..." → se usa tal cual.
 *  - "/api/imagenes/12" → "http://localhost:3000/api/imagenes/12".
 *  - "image/DBZ.jpg"    → ruta de los assets del propio frontend.
 */
export function urlImagen(url?: string | null): string {
  if (!url) return '';
  const valor = url.trim();
  if (!valor) return '';
  if (/^(https?:|data:|blob:)/i.test(valor)) return valor;
  if (valor.startsWith('/')) return `${ORIGEN_API}${valor}`;
  return valor;
}
