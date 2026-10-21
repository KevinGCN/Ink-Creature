/**
 * Servicio de usuarios — consume el backend NestJS.
 *
 * POST   /api/usuarios       → registro (público; también lo usa el admin
 *                               para crear la cuenta de un tatuador)
 * GET    /api/usuarios       → listar (público)
 * PATCH  /api/usuarios/:id   → actualizar (requiere JWT)
 * DELETE /api/usuarios/:id   → eliminar; cascada borra su registro empleado
 *                              (requiere JWT)
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

export interface DatosUsuarioNuevo {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  foto_perfil_url?: string;
}

export type DatosUsuarioEdicion = Partial<Omit<DatosUsuarioNuevo, 'password'>> & {
  password?: string;
};

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly url = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  crearUsuario(datos: DatosUsuarioNuevo): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, datos);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  actualizarUsuario(id: number, datos: DatosUsuarioEdicion): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}`, datos);
  }

  eliminarUsuario(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
