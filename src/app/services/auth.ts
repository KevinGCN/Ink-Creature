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
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private router = inject(Router);
  private usuarioActual: User | null = null;
  public isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor() {
    const storedAuth = localStorage.getItem('logueado') === 'true';
    this.isLoggedIn$.next(storedAuth);

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.usuarioActual = user;
        // Preservar datos existentes en localStorage (ya incluyen el charge si login ya los guardó)
        const prevData = JSON.parse(localStorage.getItem('usuario') || '{}');
        
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

  /** Busca el empleado en assets/empleados.json por email y retorna el objeto completo */
  private async obtenerEmpleadoPorEmail(email: string): Promise<any> {
    try {
      const res = await fetch('assets/empleados.json');
      const empleados: any[] = await res.json();
      return empleados.find(e => e.email === email);
    } catch {
      return null;
    }
  }

  registrar(usuario: { nombre: string; correo: string; password: string }): Promise<boolean> {
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
        return true;
      })
      .catch((error: any) => {
        console.error('Error en registrar:', error);
        throw error; // Re-lanzar para que el componente lo capture
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
      .catch(() => false);
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

  logout() {
    signOut(this.auth);
    this.router.navigate(['/']);
  }

  estaLogueado(): boolean {
    return localStorage.getItem('logueado') === 'true';
  }

  obtenerUsuario(): any {
    return JSON.parse(localStorage.getItem('usuario') || '{}');
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
