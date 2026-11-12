import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(_route: unknown, state: RouterStateSnapshot): boolean {
    if (this.auth.estaLogueado()) {
      return true;
    }

    // Guardamos la página que el usuario quería ver (`?volver=`) para que,
    // tras iniciar sesión, lo devolvamos ahí en vez de mandarlo al inicio.
    this.router.navigate(['/'], {
      queryParams: { acceso: 'restringido', destino: state.url },
    });
    return false;
  }
}
