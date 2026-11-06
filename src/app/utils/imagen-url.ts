/**
 * Resolución de URLs de imágenes.
 *
 * El backend guarda en la base de datos rutas RELATIVAS (por ejemplo
 * "/imagenes/12"), así la misma fila funciona sin importar el host donde se
 * despliegue la app. Este helper las convierte en URLs absolutas al pintarlas.
 *
 * Compatibilidad: las filas creadas antes de quitar el prefijo global guardan
 * "/api/imagenes/<id>". Aquí se normalizan a "/imagenes/<id>" para que sigan
 * cargando sin tocar la base de datos.
 */
import { environment } from '../../environments/environment';

/** Origen del backend, sin barra final (ej: http://localhost:3000) */
export const ORIGEN_API = environment.apiUrl.replace(/\/+$/, '');

/**
 * Convierte la URL guardada en la BD en una URL que el navegador pueda
 * cargar:
 *  - "https://..." / "data:..." / "blob:..." → se usa tal cual.
 *  - "/imagenes/12"       → "http://localhost:3000/imagenes/12".
 *  - "/api/imagenes/12"   → "http://localhost:3000/imagenes/12" (ruta antigua).
 *  - "image/DBZ.jpg"      → ruta de los assets del propio frontend.
 */
export function urlImagen(url?: string | null): string {
  // Un campo opcional puede llegar como undefined, null o cadena vacía
  // (fotos que nunca se subieron); en los tres casos se devuelve "" para que
  // quien pinta decida usar el placeholder en vez de un `<img src="">`.
  if (!url) return '';
  const valor = url.trim();
  if (!valor) return '';
  // Se detectan por esquema, no por "empieza con http": así también pasan
  // intactas las imágenes embebidas en base64 y los blobs generados en el
  // cliente, que el navegador ya sabe cargar sin ayuda del backend.
  if (/^(https?:|data:|blob:)/i.test(valor)) return valor;
  // Solo las rutas que empiezan por "/" son del backend; el resto son
  // recursos del propio SPA (p. ej. "image/DBZ.jpg") y deben resolverse
  // contra la ruta actual, no contra el host del API.
  if (valor.startsWith('/')) {
    const ruta = valor.replace(/^\/api\/imagenes\//, '/imagenes/');
    return `${ORIGEN_API}${ruta}`;
  }
  return valor;
}
