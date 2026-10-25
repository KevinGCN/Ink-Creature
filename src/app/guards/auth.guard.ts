import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Guard funcional (API moderna, reemplaza la clase deprecated CanActivate).
 * Protege /schedule, /profile y /gemini-ia: sin token JWT no hay acceso.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.estaLogueado() ? true : router.createUrlTree(['/']);
};
