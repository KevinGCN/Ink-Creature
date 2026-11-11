import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ROUTES } from '../core/api.routes';

/**
 * Ficha del tatuador que el backend incluye en cada fila
 * (`empleados: { include: { usuarios: usuarioSeguro } }`). Opcional: filas
 * sin tatuador vinculado (o respuestas antiguas) no la traen.
 */
export interface FichaEmpleadoGaleria {
  id?: number;
  especialidad?: string | null;
  biografia?: string | null;
  activo?: boolean;
  usuarios?: {
    id?: number;
    nombre?: string | null;
    apellido?: string | null;
    foto_perfil_url?: string | null;
  } | null;
}

export interface GaleriaApi {
  id: number;
  subido_por: number;
  empleado_id: number | null;
  imagen_url: string;
  titulo: string | null;
  descripcion: string | null;
  estilo: string | null;
  fecha_subida: string;
  // Relación con el tatuador autor; solo se pinta la ficha cuando el
  // backend la incluye realmente.
  empleados?: FichaEmpleadoGaleria | null;
}

export interface CrearGaleriaDto {
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
  private readonly http = inject(HttpClient);
  private readonly url = API_ROUTES.galeria;

  obtenerTodos(): Observable<GaleriaApi[]> {
    return this.http.get<GaleriaApi[]>(this.url);
  }

  /** Primer paso: guarda el binario en `imagenes` y devuelve su URL. */
  subirImagen(archivo: File): Observable<{ url: string; id: number }> {
    const formData = new FormData();
    formData.append('imagen', archivo);
    return this.http.post<{ url: string; id: number }>(
      `${this.url}/upload`,
      formData,
    );
  }

  /** Segundo paso: registra la fila de la galería con los metadatos. */
  crear(dto: CrearGaleriaDto): Observable<GaleriaApi> {
    return this.http.post<GaleriaApi>(this.url, dto);
  }

  eliminar(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
