/**
 * Barra de navegación de usuario (perfil y sesión)
 * 
 * Componente que gestiona la interfaz de usuario en la esquina
 * superior derecha: avatar, menú desplegable de ajustes, y
 * modal de login/registro.
 * 
 * Funcionalidades:
 * - Mostrar/Ocultar modal de login (Loggin component)
 * - Menú desplegable de ajustes (perfil, logout)
 * - Integración con AuthService para estado de autenticación
 * - Navegación a ruta /profile
 * 
 * Estados:
 * - mostrarLogin: Controla visibilidad del modal Loggin
 * - mostrarAjustes: Controla dropdown de menú usuario
 * 
 * Flujo de login:
 * 1. Botón "Iniciar sesión" → abrirLogin() → mostrarLogin=true
 * 2. Modal Loggin renderizado (selector app-loggin)
 * 3. Evento cerrar → cerrarLogin() → mostrarLogin=false
 * 
 * Flujo de logout:
 * 1. logout() → auth.logout() → limpia estado
 * 2. Navega a home ('/')
 * 3. Cierra dropdown
 *
 * Vista pública vs. autenticada (junto con `MainNavbar`):
 * - Sin sesión: aquí solo aparece el botón "Sesión", que abre el modal
 *   `Loggin`; la navegación general la sigue aportando `MainNavbar`.
 * - Con sesión: se cambia por el botón "⚙️ Ajustes" y su dropdown con
 *   "Perfil" y "Cerrar sesión". `auth` es la única fuente de verdad
 *   (`isLoggedIn$`/`usuario$`), por eso el template se guía por ese observable.
 * - Logout: se borra el token de `localStorage` vía `AuthService`, se cierra
 *   el dropdown y se vuelve a la home para dejar la vista pública limpia.
 * 
 * @component
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Loggin } from '../../loggin/loggin';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [CommonModule, Loggin],
  templateUrl: './user-navbar.html',
  styleUrls: ['./user-navbar.css']
})
export class UserNavbar {
  /** Controla visibilidad del modal de login/registro */
  mostrarLogin = false;

  /** Controla visibilidad del menú desplegable de ajustes */
  mostrarAjustes = false;

  constructor(
    /** AuthService (público) para acceso en template */
    public auth: AuthService,
    /** Router para navegación programática */
    private router: Router
  ) {}

  /**
   * Abre el modal de login/registro
   */
  abrirLogin() {
    // El modal se monta aquí mismo (`app-loggin`), no navega a /loggin.
    this.mostrarLogin = true;
  }

  /**
   * Cierra el modal de login/registro
   */
  cerrarLogin() {
    this.mostrarLogin = false;
  }

  /**
   * Alterna el menú desplegable de ajustes
   */
  toggleAjustes() {
    this.mostrarAjustes = !this.mostrarAjustes;
  }

  /**
   * Navega a la página de perfil y cierra el dropdown
   */
  irPerfil() {
    // Se cierra primero para que el dropdown no quede abierto sobre /profile.
    this.mostrarAjustes = false;
    this.router.navigate(['/profile']);
  }

  /**
   * Cierra sesión y navega a la página principal
   * - Invoca auth.logout() (limpia estado y localStorage)
   * - Oculta menú desplegable
   * - Navega a ruta raíz
   */
  logout() {
    // auth.logout() borra el token; sin él el interceptor deja de autenticar
    // y las rutas con authGuard (/schedule, /profile) dejan de ser accesibles.
    this.auth.logout();
    this.mostrarAjustes = false;
    // Volver a la home evita quedarse en una vista que ya requiere sesión.
    this.router.navigate(['/']);
  }
}
