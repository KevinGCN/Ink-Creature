import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { EmpleadoService } from './empleados';
import { Empleado } from '../models/empleado';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private router = inject(Router);
  private empleadoService = inject(EmpleadoService);
  private usuarioActual: User | null = null;
  public isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor() {
    const storedAuth = localStorage.getItem('logueado') === 'true';
    this.isLoggedIn$.next(storedAuth);

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.usuarioActual = user;
        // Preservar datos existentes en localStorage (ya incluyen el charge si login ya los guardó)
        let prevData: any = {};
        try {
          prevData = JSON.parse(localStorage.getItem('usuario') || '{}');
        } catch {
          prevData = {};
        }

        if (!prevData.uid) {
          // Solo actualizar si no hay datos previos (flujo normal sin login previo)
          const userData = {
            uid: user.uid,
            nombre: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            charge: prevData.charge || ''
          };
          localStorage.setItem('usuario', JSON.stringify(userData));
        }
        
        localStorage.setItem('logueado', 'true');
        this.isLoggedIn$.next(true);
      } else {
        this.usuarioActual = null;
        localStorage.removeItem('logueado');
        localStorage.removeItem('usuario');
        this.isLoggedIn$.next(false);
      }
    });
  }

  private actualizarEstadoLocal(user: any) {
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user));
      localStorage.setItem('logueado', 'true');
      this.isLoggedIn$.next(true);
    } else {
      localStorage.removeItem('logueado');
      localStorage.removeItem('usuario');
      this.isLoggedIn$.next(false);
    }
  }

  /** Busca el empleado en Firestore por email y retorna el objeto completo */
  private async obtenerEmpleadoPorEmail(email: string): Promise<Empleado | null> {
    if (!email) return null;
    try {
      return await firstValueFrom(this.empleadoService.getEmpleadoPorEmail(email));
    } catch {
      return null;
    }
  }

  registrar(usuario: { nombre: string; correo: string; password: string }) {
    return createUserWithEmailAndPassword(this.auth, usuario.correo, usuario.password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await updateProfile(user, { displayName: usuario.nombre });
        const userData = {
          uid: user.uid,
          nombre: usuario.nombre,
          email: user.email,
          photoURL: user.photoURL || '',
          charge: 'Normal' // por defecto para nuevos registros
        };
        this.actualizarEstadoLocal(userData);
        return user;
      });
  }

  login(correo: string, password: string): Promise<boolean> {
    return signInWithEmailAndPassword(this.auth, correo, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const empleado = await this.obtenerEmpleadoPorEmail(correo);
        const userData = {
          uid: user.uid,
          nombre: user.displayName || empleado?.name || '',
          apellido: empleado?.last_name || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          charge: empleado?.charge || 'Normal'
        };
        this.actualizarEstadoLocal(userData);
        return true;
      })
      .catch((error) => {
        console.error('[AuthService] Error de login:', error);
        return false;
      });
  }

  loginConGoogle(): Promise<boolean> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider)
      .then(async (result) => {
        const user = result.user;
        const empleado = await this.obtenerEmpleadoPorEmail(user.email || '');
        const userData = {
          uid: user.uid,
          nombre: user.displayName || empleado?.name || '',
          apellido: empleado?.last_name || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          charge: empleado?.charge || 'Normal'
        };
        this.actualizarEstadoLocal(userData);
        return true;
      })
      .catch((error) => {
        console.error('Error Google login:', error);
        return false;
      });
  }

  enviarRecuperacionContrasena(correo: string): Promise<boolean> {
    return sendPasswordResetEmail(this.auth, correo)
      .then(() => true)
      .catch((error) => {
        console.error('Error recuperación:', error);
        return false;
      });
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('[AuthService] Error al cerrar sesión:', error);
    } finally {
      this.actualizarEstadoLocal(null);
      await this.router.navigate(['/']);
    }
  }

  estaLogueado(): boolean {
    return localStorage.getItem('logueado') === 'true';
  }

  /**
   * Lee el usuario persistido en localStorage.
   * Una entrada corrupta se descarta en lugar de lanzar una excepción.
   */
  obtenerUsuario(): any {
    try {
      return JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch {
      localStorage.removeItem('usuario');
      return {};
    }
  }

  actualizarUsuario(usuario: any) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  getAuthUser(): User | null {
    return this.usuarioActual;
  }

  esAdmin(): boolean {
    const usuario = this.obtenerUsuario();
    return usuario?.charge === 'Admin' || usuario?.charge === 'CEO';
  }
}
