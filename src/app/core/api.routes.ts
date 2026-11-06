import { environment } from '../../environments/environment';

/**
 * Único lugar donde se definen las rutas del backend.
 *
 * `environment.apiUrl` NO lleva el prefijo `/api`: el backend lo eliminó
 * en el commit `de381db`. Si alguna ruta cambia, se toca solo este archivo.
 */
const base = environment.apiUrl.replace(/\/+$/, '');

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
