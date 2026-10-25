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
  // Se lee de localStorage (no de un signal en memoria) porque el token debe
  // sobrevivir a un F5: el interceptor corre antes de que cualquier servicio
  // tenga estado propio.
  const token = localStorage.getItem('access_token');

  // `clone` es obligatorio: las peticiones HttpRequest son inmutables, así
  // que no se puede mutar la original. El header se añade aquí, en un único
  // punto, para que ningún servicio tenga que acordarse de hacerlo.
  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      // El login se excluye porque ahí un 401 significa "credenciales
      // incorrectas", no "sesión caducada": limpiar y redirigir borraría el
      // mensaje de error que el formulario necesita mostrar.
      const esLogin = req.url.includes('/auth/login');
      if (error.status === 401 && !esLogin) {
        // Se borran las tres claves (no solo el token) para que la UI no
        // quede pintando datos del usuario anterior mientras el guard ya lo
        // considera deslogueado.
        localStorage.removeItem('access_token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('logueado');
        router.navigate(['/']);
      }
      // El error se re-lanza para que el llamador siga enterándose del fallo
      // (mostrar el mensaje, cortar un spinner, etc.).
      return throwError(() => error);
    })
  );
};
