import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GaleriaApi {
  id: number;
  subido_por: number;
  empleado_id: number | null;
  imagen_url: string;
  titulo: string | null;
  descripcion: string | null;
  estilo: string | null;
  fecha_subida: string;
}

@Injectable({
  providedIn: 'root',
})
export class GaleriaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/galeria`;

  obtenerTodos(): Observable<GaleriaApi[]> {
    return this.http.get<GaleriaApi[]>(this.url);
  }
}
