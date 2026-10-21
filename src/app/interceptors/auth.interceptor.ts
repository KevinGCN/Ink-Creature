import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor global que:
 * 1. Adjunta el JWT (Bearer) a TODAS las peticiones HTTP saliente.
 * 2. Si el backend responde 401 (token expirado/inválido), cierra la
 *    sesión local y redirige al home.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      const esLogin = req.url.includes('/auth/login');
      if (error.status === 401 && !esLogin) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('logueado');
        router.navigate(['/']);
      }
      return throwError(() => error);
    })
  );
};
