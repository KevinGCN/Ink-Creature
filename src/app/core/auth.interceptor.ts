import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Adjunta el JWT del backend a las peticiones que van a la API.
 * No toca peticiones a otros dominios ni archivos locales (assets).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const esApi = req.url.startsWith(environment.apiUrl);

  if (!token || !esApi) {
    return next(req);
  }

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
  );
};
