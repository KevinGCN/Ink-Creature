import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import {
  Auth,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private router = inject(Router);
  private http = inject(HttpClient);

  private usuarioActual: User | null = null;

  public usuario$ = new BehaviorSubject<any>(this.obtenerUsuario());

  public isLoggedIn$ = new BehaviorSubject<boolean>(
    localStorage.getItem('logueado') === 'true'
  );

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.usuarioActual = user;

      if (user) {
        const usuarioGuardado = this.obtenerUsuario();

        const userData = {
          ...usuarioGuardado,
          uid: user.uid,
          email: user.email || usuarioGuardado?.email || '',
          nombre: user.displayName || usuarioGuardado?.nombre || '',
          photoURL: user.photoURL || usuarioGuardado?.photoURL || ''
        };

        this.actualizarEstadoLocal(userData);
      } else {
        // Si no hay usuario Firebase, no borramos una sesión
        // que haya sido iniciada mediante JWT del backend.
        const token = localStorage.getItem('access_token');

        if (!token) {
          this.usuarioActual = null;
          localStorage.removeItem('logueado');
          localStorage.removeItem('usuario');
          this.isLoggedIn$.next(false);
          this.usuario$.next({});
        }
      }
    });
  }

  private actualizarEstadoLocal(userData: any) {
    localStorage.setItem('usuario', JSON.stringify(userData));
    localStorage.setItem('logueado', 'true');

    this.usuario$.next(userData);
    this.isLoggedIn$.next(true);
  }

  registrar(usuario: any): Promise<boolean> {
    return createUserWithEmailAndPassword(
      this.auth,
      usuario.email,
      usuario.password
    )
      .then(async (userCredential) => {
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: usuario.nombre
        });

        const userData = {
          uid: user.uid,
          nombre: usuario.nombre,
          email: user.email,
          photoURL: user.photoURL || '',
          charge: 'Normal'
        };

        this.actualizarEstadoLocal(userData);

        return true;
      })
      .catch((error: any) => {
        console.error('Error en registrar:', error);
        throw error;
      });
  }

  login(correo: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post<any>('http://localhost:3000/auth/login', {
        email: correo,
        password: password
      }).subscribe({
        next: (respuesta) => {
          localStorage.setItem(
            'access_token',
            respuesta.access_token
          );

          this.http.get<any>(
            'http://localhost:3000/auth/me'
          ).subscribe({
            next: (usuario) => {
              const userData = {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                charge: usuario.rol,
                activo: usuario.activo,
                fecha_registro: usuario.fecha_registro,
                fecha_actualizacion: usuario.fecha_actualizacion
              };

              this.actualizarEstadoLocal(userData);

              resolve(true);
            },

            error: (error) => {
              console.error(
                'Error obteniendo usuario:',
                error
              );

              localStorage.removeItem('access_token');

              resolve(false);
            }
          });
        },

        error: (error) => {
          console.error(
            'Error login backend:',
            error
          );

          resolve(false);
        }
      });
    });
  }

  loginConGoogle(): Promise<boolean> {
    const provider = new GoogleAuthProvider();

    return signInWithPopup(this.auth, provider)
      .then(async (result) => {
        const user = result.user;

        const empleado = await this.obtenerEmpleadoPorEmail(
          user.email || ''
        );

        const userData = {
          uid: user.uid,
          nombre:
            user.displayName ||
            empleado?.name ||
            '',
          apellido:
            empleado?.last_name ||
            '',
          email:
            user.email ||
            '',
          photoURL:
            user.photoURL ||
            '',
          charge:
            empleado?.charge ||
            'Normal'
        };

        this.actualizarEstadoLocal(userData);

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

  enviarRecuperacionContrasena(
    correo: string
  ): Promise<boolean> {
    return sendPasswordResetEmail(
      this.auth,
      correo
    )
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
    signOut(this.auth);

    localStorage.removeItem('access_token');
    localStorage.removeItem('logueado');
    localStorage.removeItem('usuario');

    this.usuarioActual = null;
    this.usuario$.next({});
    this.isLoggedIn$.next(false);

    this.router.navigate(['/']);
  }

  estaLogueado(): boolean {
    return (
      localStorage.getItem('logueado') === 'true'
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

  getAuthUser(): User | null {
    return this.usuarioActual;
  }

  esAdmin(): boolean {
    const usuario = this.obtenerUsuario();

    return (
      usuario?.charge === 'Admin' ||
      usuario?.charge === 'CEO'
    );
  }

  private obtenerEmpleadoPorEmail(
    email: string
  ): Promise<any> {
    return new Promise((resolve) => {
      this.http
        .get<any>(
          `http://localhost:3000/empleados/email/${email}`
        )
        .subscribe({
          next: (empleado) => {
            resolve(empleado);
          },

          error: () => {
            resolve(null);
          }
        });
    });
  }
}

