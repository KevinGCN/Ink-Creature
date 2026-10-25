/**
 * Servicio de usuarios — consume el backend NestJS.
 *
 * POST   /api/usuarios       → registro (público; también lo usa el admin
 *                               para crear la cuenta de un tatuador)
 * GET    /api/usuarios       → listar (solo admin)
 * PATCH  /api/usuarios/:id   → actualizar (JWT: el propio usuario o un admin)
 * POST   /api/usuarios/:id/foto → subir la foto de perfil; el backend la
 *                               guarda en la base de datos y devuelve el
 *                               usuario con `foto_perfil_url` actualizado
 *                               (requiere JWT: el propio usuario o un admin)
 * DELETE /api/usuarios/:id   → eliminar; cascada borra su registro empleado
 *                              (solo admin)
 *
 * Listar y borrar son exclusivos de `admin` (RolesGuard); el resto de rutas
 * solo exige JWT, y el backend comprueba además que sea el propio usuario.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RolUsuario, Usuario } from '../models/usuario';

// Payload de alta: la contraseña viaja solo en el transporte y el backend la
// hashea (scrypt) antes de guardarla, así que nunca vuelve en una respuesta.
export interface DatosUsuarioNuevo {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  foto_perfil_url?: string;
}

// Al editar la contraseña es opcional (si no se envía, se conserva la actual) y
// `rol` queda fuera a propósito: solo cambia por `cambiarRol`, vía admin.
export type DatosUsuarioEdicion = Partial<Omit<DatosUsuarioNuevo, 'password'>> & {
  password?: string;
};

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly url = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  /** Registro público; el backend hashea la contraseña antes de guardarla. */
  crearUsuario(datos: DatosUsuarioNuevo): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, datos);
  }

  /** El backend nunca devuelve `password_hash` en sus selects. Solo admin. */
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  /** Lectura puntual, útil para refrescar la ficha de otro usuario (propio o admin). */
  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  /**
   * PATCH parcial: no incluye `rol` a propósito, porque un cliente podría
   * autoascenderse; ese campo solo se toca en `cambiarRol` (ruta de admin).
   */
  actualizarUsuario(id: number, datos: DatosUsuarioEdicion): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}`, datos);
  }

  /** En cascada: la BD borra también la ficha de empleado y la foto. Solo admin. */
  eliminarUsuario(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }

  /**
   * Sube la foto de perfil al backend (multipart/form-data, campo "imagen").
   * El archivo se guarda en la base de datos y el usuario vuelve con
   * `foto_perfil_url` apuntando a "/api/imagenes/<id>".
   */
  subirFoto(id: number, file: File): Observable<Usuario> {
    const formData = new FormData();
    formData.append('imagen', file, file.name);
    return this.http.post<Usuario>(`${this.url}/${id}/foto`, formData);
  }

  /**
   * Cambia el rol de un usuario. Solo funciona si quien llama es admin
   * (el backend responde 403 en caso contrario).
   */
  cambiarRol(id: number, rol: RolUsuario): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}/rol`, { rol });
  }
}
