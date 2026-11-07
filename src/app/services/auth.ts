import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Auth,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  firstValueFrom,
  map,
  tap,
  throwError,
} from 'rxjs';
import { API_ROUTES, urlDeImagen } from '../core/api.routes';

interface SesionApi {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PerfilApi {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  foto_perfil_url: string | null;
  rol: 'cliente' | 'empleado' | 'admin';
  activo: boolean;
}

/** Campos que el usuario puede editar desde su perfil. */
export interface DatosPerfil {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
}

const TOKEN_KEY = 'token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private http = inject(HttpClient);
  private router = inject(Router);

  private usuarioActual: User | null = null;

  public usuario$ = new BehaviorSubject<any>(this.obtenerUsuario());

  public isLoggedIn$ = new BehaviorSubject<boolean>(this.estaLogueado());

  constructor() {
    // Solo guardamos el usuario de Firebase para `getAuthUser()`. La sesión
    // real la manda el JWT del backend.
    onAuthStateChanged(this.auth, (user) => {
      this.usuarioActual = user;
    });

    const token = localStorage.getItem(TOKEN_KEY);
    const logueado = localStorage.getItem('logueado') === 'true';
    this.isLoggedIn$.next(logueado && !!token);

    // Si hay token guardado, refrescamos el perfil desde el backend. Si el
    // token venció (401), limpiamos la sesión.
    if (token) {
      this.cargarPerfil().catch(() => this.limpiarSesion());
    }
  }

  private async cargarPerfil(): Promise<void> {
    const perfil = await firstValueFrom(
      this.http.get<PerfilApi>(API_ROUTES.auth.me),
    );
    this.guardarSesion(perfil);
  }

  private guardarSesion(perfil: PerfilApi) {
    const usuario = {
      uid: perfil.id,
      id: perfil.id,
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      email: perfil.email,
      telefono: perfil.telefono ?? '',
      photoURL: urlDeImagen(perfil.foto_perfil_url),
      foto_perfil_url: urlDeImagen(perfil.foto_perfil_url),
      rol: perfil.rol,
      // Compatibilidad con componentes existentes que leen `charge`.
      charge:
        perfil.rol === 'admin'
          ? 'Admin'
          : perfil.rol === 'empleado'
            ? 'Empleado'
            : 'Normal',
    };

    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('logueado', 'true');

    this.usuario$.next(usuario);
    this.isLoggedIn$.next(true);
  }

  private limpiarSesion() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('logueado');
    localStorage.removeItem('usuario');
    this.isLoggedIn$.next(false);
    this.usuario$.next(null);
  }

  private async iniciarSesionConToken(sesion: SesionApi): Promise<void> {
    localStorage.setItem(TOKEN_KEY, sesion.access_token);
    await this.cargarPerfil();
  }

  /**
   * Login por correo y contraseña contra `POST /auth/login`.
   * Devuelve `false` con credenciales incorrectas (igual que antes).
   */
  login(correo: string, password: string): Promise<boolean> {
    return firstValueFrom(
      this.http.post<SesionApi>(API_ROUTES.auth.login, {
        email: correo,
        password,
      }),
    )
      .then((sesion) => this.iniciarSesionConToken(sesion))
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Login con Google: Firebase hace el popup y devuelve un ID token; el
   * backend lo verifica en `POST /auth/google` y responde con el JWT propio.
   */
  loginConGoogle(): Promise<boolean> {
    const provider = new GoogleAuthProvider();

    return signInWithPopup(this.auth, provider)
      .then(async (result) => {
        const idToken = await result.user.getIdToken();
        const sesion = await firstValueFrom(
          this.http.post<SesionApi>(API_ROUTES.auth.google, { idToken }),
        );
        await this.iniciarSesionConToken(sesion);
        return true;
      })
      .catch((error) => {
        console.error(
          'Error Google login:',
          error
        );

        return false;
      });
  }

  /**
   * Registro público contra `POST /usuarios` y login inmediato.
   * El backend exige nombre y apellido; el formulario solo pide nombre, así
   * que se separa la primera palabra y el resto.
   */
  registrar(usuario: {
    nombre: string;
    correo: string;
    password: string;
  }): Promise<boolean> {
    const partes = usuario.nombre.trim().split(/\s+/);
    const nombre = partes.shift() || usuario.nombre;
    const apellido = partes.join(' ') || '-';

    return firstValueFrom(
      this.http.post(API_ROUTES.usuarios, {
        nombre,
        apellido,
        email: usuario.correo,
        password: usuario.password,
      }),
    )
      .then(() => this.login(usuario.correo, usuario.password))
      .catch((error) => {
        throw error;
      });
  }

  enviarRecuperacionContrasena(correo: string): Promise<boolean> {
    return sendPasswordResetEmail(this.auth, correo)
      .then(() => true)
      .catch((error) => {
        console.error(
          'Error recuperación:',
          error
        );

        return false;
      });
  }

  logout() {
    this.limpiarSesion();
    signOut(this.auth).catch(() => undefined);
    this.router.navigate(['/']);
    window.location.reload();
  }

  estaLogueado(): boolean {
    return (
      localStorage.getItem('logueado') === 'true' &&
      !!localStorage.getItem(TOKEN_KEY)
    );
  }

  obtenerUsuario(): any {
    return JSON.parse(
      localStorage.getItem('usuario') || '{}'
    );
  }

  actualizarUsuario(usuario: any) {
    localStorage.setItem(
      'usuario',
      JSON.stringify(usuario)
    );

    this.usuario$.next(usuario);
  }

  private idSesion(): number | null {
    const usuario = this.obtenerUsuario();
    return usuario?.id ?? usuario?.uid ?? null;
  }

  /**
   * Guarda nombre, apellido, email y teléfono en `PATCH /usuarios/:id`.
   * Al responder, se refresca el usuario de `localStorage` con los datos
   * reales del backend (no con lo que escribió el formulario).
   */
  actualizarPerfil(datos: DatosPerfil): Observable<any> {
    const id = this.idSesion();
    if (!id) {
      return throwError(() => new Error('No hay una sesión activa'));
    }

    return this.http
      .patch<PerfilApi>(`${API_ROUTES.usuarios}/${id}`, datos)
      .pipe(
        tap((perfil) => this.guardarSesion(perfil)),
        map(() => this.obtenerUsuario()),
      );
  }

  /**
   * Sube la foto de perfil a `POST /usuarios/:id/foto` (campo `imagen`).
   * El backend devuelve la ruta guardada y aquí se refresca la sesión local.
   */
  subirFotoPerfil(archivo: File): Observable<any> {
    const id = this.idSesion();
    if (!id) {
      return throwError(() => new Error('No hay una sesión activa'));
    }

    const formData = new FormData();
    formData.append('imagen', archivo);

    return this.http
      .post<PerfilApi>(`${API_ROUTES.usuarios}/${id}/foto`, formData)
      .pipe(
        tap((perfil) => this.guardarSesion(perfil)),
        map(() => this.obtenerUsuario()),
      );
  }

  getAuthUser(): User | null {
    return this.usuarioActual;
  }

  esAdmin(): boolean {
    const usuario = this.obtenerUsuario();
    return (
      usuario?.rol === 'admin' ||
      usuario?.charge === 'Admin' ||
      usuario?.charge === 'CEO'
    );
  }
}
