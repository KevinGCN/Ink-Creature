import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../models/usuario';
import { API_ROUTES } from '../core/api.routes';

interface UsuarioApi {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  foto_perfil_url: string | null;
  rol: string;
  activo: boolean;
}

/**
 * Gestión de usuarios contra el backend.
 *
 * `GET /usuarios` exige JWT + rol admin; el interceptor agrega el token.
 * El modelo local no expone contraseñas.
 */
@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private usuarios: Usuario[] = [];

  constructor(private http: HttpClient) {}

  private mapear(u: UsuarioApi): Usuario {
    return {
      id: u.id,
      name: `${u.nombre} ${u.apellido}`.trim(),
      email: u.email,
      password: '',
    };
  }

  async cargarUsuarios(): Promise<void> {
    const data = await firstValueFrom(
      this.http.get<UsuarioApi[]>(API_ROUTES.usuarios),
    );
    this.usuarios = data.map((u) => this.mapear(u));
  }

  getUsuarios(): Usuario[] {
    return this.usuarios;
  }

  async crearUsuario(name: string, email: string, password: string) {
    const [nombre, ...resto] = name.trim().split(/\s+/);
    const creado = await firstValueFrom(
      this.http.post<UsuarioApi>(API_ROUTES.usuarios, {
        nombre: nombre || name,
        apellido: resto.join(' ') || '-',
        email,
        password,
      }),
    );
    this.usuarios.push(this.mapear(creado));
  }

  async setUsuarName(id: number, name: string): Promise<void> {
    const [nombre, ...resto] = name.trim().split(/\s+/);
    const actualizado = await firstValueFrom(
      this.http.patch<UsuarioApi>(`${API_ROUTES.usuarios}/${id}`, {
        nombre: nombre || name,
        apellido: resto.join(' ') || '-',
      }),
    );

    const usuario = this.usuarios.find((u) => u.id === id);
    if (usuario) {
      usuario.name = this.mapear(actualizado).name;
      usuario.email = actualizado.email;
    }
  }

  async eliminarUsuario(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${API_ROUTES.usuarios}/${id}`));
    this.usuarios = this.usuarios.filter((u) => u.id !== id);
  }
}
