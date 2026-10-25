import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Guard funcional (API moderna, reemplaza la clase deprecated CanActivate).
 * Protege /schedule, /profile y /gemini-ia: sin token JWT no hay acceso.
 */
export const authGuard: CanActivateFn = () => {
  // Es síncrono a propósito: solo mira si hay token guardado. Consultar al
  // backend aquí añadiría un viaje de ida y vuelta (y un parpadeo) antes de
  // decidir la navegación; si el token está vencido, el interceptor lo detecta
  // con el primer 401 y devuelve al usuario al home.
  const auth = inject(AuthService);
  const router = inject(Router);

  // Devolver un UrlTree cancela la navegación Y redirige en el mismo paso;
  // con `false` la URL quedaría en la barra del navegador apuntando a una
  // vista que nunca llegó a montarse.
  return auth.estaLogueado() ? true : router.createUrlTree(['/']);
};
