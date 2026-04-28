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

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private router = inject(Router);
  private usuarioActual: User | null = null;

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.usuarioActual = user;
        const userData = {
          uid: user.uid,
          nombre: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || ''
        };
        localStorage.setItem('usuario', JSON.stringify(userData));
        localStorage.setItem('logueado', 'true');
      } else {
        this.usuarioActual = null;
        localStorage.removeItem('logueado');
        localStorage.removeItem('usuario');
      }
    });
  }

  registrar(usuario: { nombre: string; correo: string; password: string }) {
    return createUserWithEmailAndPassword(this.auth, usuario.correo, usuario.password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        
        // Actualizar perfil con el nombre
        await updateProfile(user, {
          displayName: usuario.nombre
        });

        const userData = {
          uid: user.uid,
          nombre: usuario.nombre,
          email: user.email,
          photoURL: user.photoURL || ''
        };
        
        localStorage.setItem('usuario', JSON.stringify(userData));
        return user;
      });
  }

  login(correo: string, password: string): Promise<boolean> {
    return signInWithEmailAndPassword(this.auth, correo, password)
      .then(() => true)
      .catch(() => false);
  }

  loginConGoogle(): Promise<boolean> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider)
      .then((result) => {
        const user = result.user;
        const userData = {
          uid: user.uid,
          nombre: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || ''
        };
        
        localStorage.setItem('usuario', JSON.stringify(userData));
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