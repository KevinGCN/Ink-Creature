/**
 * Servicio de autenticación — consume el Auth del backend NestJS.
 *
 * Reemplaza por completo al autenticador adicional que había en el
 * frontend (Firebase Auth + bandera de localStorage):
 *
 *  - POST /api/auth/login  → { access_token, token_type, expires_in }
 *  - GET  /api/auth/me     → usuario real de la BD (valida el token)
 *  - POST /api/usuarios    → registro
 *  - PATCH /api/usuarios/:id → actualizar perfil
 *
 * El JWT se guarda en localStorage ('access_token') y el interceptor
 * global lo adjunta a cada petición (ver interceptors/auth.interceptor.ts).
 */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse, Usuario } from '../models/usuario';

const CLAVE_TOKEN = 'access_token';
const CLAVE_USUARIO = 'usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  /** Estado de sesión reactivo (lo consumen navbar, lobby, comments…) */
  readonly isLoggedIn$ = new BehaviorSubject<boolean>(this.hayToken());

  /** Usuario real del backend (null si no hay sesión) */
  readonly usuario$ = new BehaviorSubject<Usuario | null>(this.leerUsuarioLocal());

  constructor() {
    // Restaura la sesión real validando el token guardado contra el backend.
    if (this.hayToken()) {
      void this.refrescarUsuario();
    }
  }

  // ── Sesión ────────────────────────────────────────────────

  /** Inicia sesión. Devuelve true si las credenciales son válidas. */
  async login(correo: string, password: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
          email: correo,
          password
        })
      );

      localStorage.setItem(CLAVE_TOKEN, res.access_token);
      await this.refrescarUsuario();
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  }

  /**
   * Registra un usuario nuevo en el backend y lo deja logueado.
   * Relanza el error HTTP para que la UI pueda distinguir
   * (ej: 409 = el correo ya está registrado).
   */
  async registrar(usuario: {
    nombre: string;
    apellido?: string;
    correo: string;
    password: string;
  }): Promise<boolean> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/usuarios`, {
        nombre: usuario.nombre,
        apellido: usuario.apellido ?? '',
        email: usuario.correo,
        password: usuario.password
      })
    );

    // El registro exitoso inicia sesión automáticamente.
    return this.login(usuario.correo, usuario.password);
  }

  /** Cierra la sesión local y vuelve al home (sin recargar la página). */
  logout(): void {
    this.limpiarSesion();
    this.router.navigate(['/']);
  }

  // ── Estado ────────────────────────────────────────────────

  /** true si hay un token guardado (la validez real la decide el backend). */
  estaLogueado(): boolean {
    return this.hayToken();
  }

  /** Usuario en memoria (respaldado en localStorage). */
  obtenerUsuario(): Usuario | null {
    return this.usuario$.value;
  }

  /** Guarda cambios locales del usuario (ya debe haberse sincronizado con el backend). */
  actualizarUsuario(usuario: Usuario): void {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    this.usuario$.next(usuario);
  }

  /**
   * Actualiza el perfil en el backend (PATCH /api/usuarios/:id)
   * y sincroniza el estado local con la respuesta.
   */
  async actualizarPerfil(datos: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    foto_perfil_url?: string;
  }): Promise<boolean> {
    const usuario = this.usuario$.value;
    if (!usuario) return false;

    try {
      const actualizado = await firstValueFrom(
        this.http.patch<Usuario>(`${environment.apiUrl}/usuarios/${usuario.id}`, datos)
      );
      this.actualizarUsuario(actualizado);
      return true;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return false;
    }
  }

  /** Solo los usuarios con rol 'admin' gestionan galería/empleados. */
  esAdmin(): boolean {
    return this.usuario$.value?.rol === 'admin';
  }

  // ── Internos ──────────────────────────────────────────────

  private hayToken(): boolean {
    return Boolean(localStorage.getItem(CLAVE_TOKEN));
  }

  private leerUsuarioLocal(): Usuario | null {
    try {
      const raw = localStorage.getItem(CLAVE_USUARIO);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }

  /** Valida el token contra GET /api/auth/me y actualiza el estado. */
  private async refrescarUsuario(): Promise<void> {
    try {
      const usuario = await firstValueFrom(
        this.http.get<Usuario>(`${environment.apiUrl}/auth/me`)
      );
      this.actualizarUsuario(usuario);
      localStorage.setItem('logueado', 'true'); // compatibilidad con vistas existentes
      this.isLoggedIn$.next(true);
    } catch {
      // Token expirado / cuenta eliminada → cerrar sesión silenciosamente.
      this.limpiarSesion();
    }
  }

  private limpiarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    localStorage.removeItem('logueado');
    this.isLoggedIn$.next(false);
    this.usuario$.next(null);
  }
}
