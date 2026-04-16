import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  registrar(usuario: any) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('logueado', 'true');
  }

  login(correo: string, password: string): boolean {
    const data = localStorage.getItem('usuario');

    if (!data) return false;

    const usuario = JSON.parse(data);

    if (usuario.correo === correo && usuario.password === password) {
      localStorage.setItem('logueado', 'true');
      return true;
    }

    return false;
  }

  logout() {
    localStorage.removeItem('logueado');
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
}