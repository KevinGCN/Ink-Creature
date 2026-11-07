import { environment } from '../../environments/environment';

/**
 * Único lugar donde se definen las rutas del backend.
 *
 * `environment.apiUrl` NO lleva el prefijo `/api`: el backend lo eliminó
 * en el commit `de381db`. Si alguna ruta cambia, se toca solo este archivo.
 */
const base = environment.apiUrl.replace(/\/+$/, '');

/**
 * Convierte la ruta de una imagen en una URL absoluta del backend.
 *
 * Las filas viejas de `galeria` guardaron `/api/imagenes/<id>`, pero la ruta
 * real desde `de381db` es `/imagenes/<id>`. Se normaliza aquí para no tocar
 * los datos y para que funcione tanto en local como en Netlify.
 */
export function urlDeImagen(ruta: string | null | undefined): string {
  if (!ruta) return '';

  const limpia = ruta.replace(/^\/api\/imagenes\//, '/imagenes/');

  if (/^https?:\/\//i.test(limpia)) {
    return limpia;
  }

  return `${base}${limpia.startsWith('/') ? '' : '/'}${limpia}`;
}

export const API_ROUTES = {
  auth: {
    login: `${base}/auth/login`,
    google: `${base}/auth/google`,
    me: `${base}/auth/me`,
  },
  usuarios: `${base}/usuarios`,
  empleados: `${base}/empleados`,
  citas: `${base}/citas`,
  galeria: `${base}/galeria`,
  imagenes: `${base}/imagenes`,
  horarios: `${base}/horarios-trabajador`,
  ia: {
    analyzeTattoo: `${base}/ia/analyze-tattoo`,
  },
} as const;
