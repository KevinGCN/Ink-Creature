/**
 * Servicio de análisis de tatuajes con IA.
 *
 * El navegador **no** habla con Google directamente: la llave de Gemini
 * vive en el backend (`GEMINI_API_KEY`) y el frontend llama a
 * `POST /api/ia/analyze-tattoo`. Así la llave nunca llega al bundle ni
 * al navegador (donde cualquiera podría copiarla de la consola).
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly url = `${environment.apiUrl}/ia`;

  constructor(private http: HttpClient) {}

  /**
   * Analiza la descripción de un tatuaje y devuelve el texto de la IA
   * (un JSON con complejidad, tiempo, precioMin, precioMax y justificación).
   */
  async analyzeTattoo(description: string): Promise<string> {
    const respuesta = await firstValueFrom(
      this.http.post<{ respuesta: string }>(`${this.url}/analyze-tattoo`, {
        descripcion: description,
      }),
    );

    return respuesta.respuesta;
  }
}
