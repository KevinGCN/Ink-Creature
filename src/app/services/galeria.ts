/**
 * Servicio de galería (Gallery) — consume el backend NestJS.
 *
 * GET    /api/galeria             → todas las imágenes (público)
 * POST   /api/galeria             → registrar imagen (requiere JWT)
 * DELETE /api/galeria/:id         → eliminar (requiere JWT)
 * POST   /api/galeria/upload      → subir archivo a /uploads (requiere JWT)
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

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

  getGaleria(): Observable<ImagenGaleria[]> {
    return this.http.get<ImagenGaleria[]>(this.url);
  }

  crearImagen(datos: DatosImagenNueva): Observable<ImagenGaleria> {
    return this.http.post<ImagenGaleria>(this.url, datos);
  }

  eliminarImagen(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }

  /**
   * Sube un archivo de imagen al backend (multipart/form-data) y
   * devuelve la URL absoluta lista para usar en `imagen_url`.
   */
  subirArchivo(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('imagen', file, file.name);

    return this.http
      .post<{ url: string }>(`${this.url}/upload`, formData)
      .pipe(map((res) => `${environment.apiUrl.replace(/\/api$/, '')}${res.url}`));
  }
}
