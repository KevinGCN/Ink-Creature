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
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private router = inject(Router);
  private http = inject(HttpClient);
  private usuarioActual: User | null = null;
  public isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor() {
    const storedAuth = localStorage.getItem('logueado') === 'true';
    this.isLoggedIn$.next(storedAuth);

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.usuarioActual = user;
        // Preservar el charge si ya estaba guardado
        const prevData = JSON.parse(localStorage.getItem('usuario') || '{}');
        const userData = {
          uid: user.uid,
          nombre: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          charge: prevData.charge || ''
        };
        localStorage.setItem('usuario', JSON.stringify(userData));
        localStorage.setItem('logueado', 'true');
        this.cargarYGuardarDatosUsuario(user);
        this.isLoggedIn$.next(true);
      } else {
        this.usuarioActual = null;
        localStorage.removeItem('logueado');
        localStorage.removeItem('usuario');
        this.isLoggedIn$.next(false);
      }
    });
  }

  private async cargarYGuardarDatosUsuario(user: User) {
    const userData = {
      uid: user.uid,
      nombre: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      charge: '' // valor por defecto
    };

    // Buscar el charge en empleados.json si el email coincide
    try {
      const empleados = await this.http.get<any[]>('assets/empleados.json').toPromise();
      if (empleados && empleados.length > 0) {
        const empleado = empleados.find(e => e.email === user.email);
        if (empleado) {
          userData.charge = empleado.charge || '';
        }
      }
    } catch (error) {
      console.error('No se pudo cargar empleados.json:', error);
    }

    this.actualizarEstadoLocal(userData);
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

  /** Busca el cargo del empleado en assets/empleados.json por email */
  private async obtenerCargoPorEmail(email: string): Promise<string> {
    try {
      const res = await fetch('assets/empleados.json');
      const empleados: any[] = await res.json();
      const encontrado = empleados.find(e => e.email === email);
      return encontrado?.charge || '';
    } catch {
      return '';
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
        const charge = await this.obtenerCargoPorEmail(correo);
        // Aquí confiamos en onAuthStateChanged que ya carga el charge
        // pero aseguramos datos mínimos si falla la carga del JSON
        const userData = {
          uid: user.uid,
          nombre: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          charge: '' // se completará en onAuthStateChanged
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
        const charge = await this.obtenerCargoPorEmail(user.email || '');
        // onAuthStateChanged se encargará de cargar el charge
        const userData = {
          uid: user.uid,
          nombre: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          charge: ''
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
}
