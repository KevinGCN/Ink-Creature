import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = 'assets/empleados.json';
  constructor(private http: HttpClient) {}

  registrar(usuario: any) {
    const usuarios = this.obtenerUsuariosLocal();
    usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('logueado', 'true');
  }

  async login(correo: string, password: string): Promise<boolean> {

    /* Buscar usuarios del JSON */
    const empleados = await firstValueFrom(this.http.get<any[]>(this.url));
    const usuarioJson = empleados.find(u =>
      u.email === correo &&
      u.password === password
    );

    if (usuarioJson) {
      localStorage.setItem('usuario', JSON.stringify(usuarioJson));
      localStorage.setItem('logueado', 'true');
      return true;
    }

    /* Buscar usuarios registrados */
    const usuariosLocal = this.obtenerUsuariosLocal();
    const usuarioLocal = usuariosLocal.find(u =>
      u.correo === correo &&
      u.password === password
    );
    if (usuarioLocal) {
      localStorage.setItem('usuario', JSON.stringify(usuarioLocal));
      localStorage.setItem('logueado', 'true');
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('logueado');
    localStorage.removeItem('usuario');
  }

  estaLogueado(): boolean {
    return localStorage.getItem('logueado') === 'true';
  }

  obtenerUsuario() {
    return JSON.parse(localStorage.getItem('usuario') || '{}');
  }

  actualizarUsuario(usuario: any) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  private obtenerUsuariosLocal(): any[] {
    return JSON.parse(localStorage.getItem('usuarios') || '[]');
  }
}