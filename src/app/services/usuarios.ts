import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})

export class UsuarioService {

  private url = 'assets/usuarios.json';
  private usuarios: Usuario[] = []; // ← aquí guardas los datos

  constructor(private http: HttpClient) {}

  // 🔹 1. Cargar usuarios del JSON
  cargarUsuarios() {
    this.http.get<Usuario[]>(this.url).subscribe(data => {
      this.usuarios = data;
    });
  }

  // 🔹 2. Obtener usuarios
  getUsuarios(): Usuario[] {
    return this.usuarios;
  }

  // 🔹 3. Crear usuario
  crearUsuario(name: string, email: string, password: string) {

    const nuevo: Usuario = {
      id: this.generarId(),
      name: name,
      email: email,
      password: password
    };

    this.usuarios.push(nuevo);
  }

  // 🔹 4. Modificar nombre (ejemplo)
  setUsuarName(id: number, name: string): void {
    const usuario = this.usuarios.find(u => u.id === id);
    if (usuario) {
      usuario.name = name;
    }
  }

  // 🔹 5. Eliminar usuario
  eliminarUsuario(id: number) {
    this.usuarios = this.usuarios.filter(u => u.id !== id);
  }

  // 🔹 6. Generar ID automático
  private generarId(): number {
    if (this.usuarios.length === 0) return 1;
    return Math.max(...this.usuarios.map(u => u.id)) + 1;
  }
}
