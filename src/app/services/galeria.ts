/**
 * Servicio de galería (Gallery) — consume el backend NestJS.
 *
 * GET    /api/galeria             → todas las imágenes (público)
 * POST   /api/galeria             → registrar imagen (solo admin)
 * DELETE /api/galeria/:id         → eliminar fila + binario (solo admin)
 * POST   /api/galeria/upload      → subir archivo (solo admin); el backend lo
 *                                   guarda en la base de datos (tabla
 *                                   `imagenes`) y devuelve la ruta
 *                                   "/api/imagenes/<id>"
 *
 * Escribir en la galería es exclusivo de `admin`: el backend lo protege con
 * `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`, así que un
 * cliente con sesión recibe 403 aunque llame a estos métodos.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

// Forma que devuelve Prisma con sus relaciones: `usuarios` es quien subió la
// foto y `empleados.usuarios` el tatuador autor (puede no existir).
export interface ImagenGaleria {
  id: number;
  subido_por: number;
  empleado_id: number | null;
  imagen_url: string;
  titulo?: string | null;
  descripcion?: string | null;
  estilo?: string | null;
  fecha_subida: string;
  usuarios?: Usuario;
  empleados?: { usuarios?: Usuario } | null;
}

// Payload de `POST /api/galeria`: `imagen_url` ya viene resuelta por `/upload`.
export interface DatosImagenNueva {
  subido_por: number;
  empleado_id?: number;
  imagen_url: string;
  titulo?: string;
  descripcion?: string;
  estilo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GaleriaService {
  private readonly url = `${environment.apiUrl}/galeria`;

  constructor(private http: HttpClient) {}

  /** Listado público; cada fila trae la ruta relativa de su imagen. */
  getGaleria(): Observable<ImagenGaleria[]> {
    return this.http.get<ImagenGaleria[]>(this.url);
  }

  /**
   * Registra la fila DESPUÉS de subir el archivo: `/upload` ya devolvió la url
   * y aquí se guardan título/estilo. Separarlo permite corregir metadatos sin
   * volver a enviar el binario. Solo admin.
   */
  crearImagen(datos: DatosImagenNueva): Observable<ImagenGaleria> {
    return this.http.post<ImagenGaleria>(this.url, datos);
  }

  /**
   * El backend borra la fila y su binario en `imagenes`, no solo el registro.
   * Solo admin.
   */
  eliminarImagen(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }

  /**
   * Sube un archivo de imagen al backend (multipart/form-data). Solo admin.
   *
   * El backend guarda el binario en la base de datos y devuelve la ruta
   * RELATIVA "/api/imagenes/<id>"; se guarda tal cual en `imagen_url` para
   * que la fila no dependa del host. Al pintar se resuelve con
   * `urlImagen()` (ver utils/imagen-url.ts).
   */
  subirArchivo(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('imagen', file, file.name);

    return this.http
      .post<{ url: string; id: number }>(`${this.url}/upload`, formData)
      .pipe(map((res) => res.url));
  }
}
