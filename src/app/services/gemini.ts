import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_ROUTES } from '../core/api.routes';

/**
 * Análisis de tatuajes mediante el proxy del backend.
 *
 * La clave de Gemini vive solo en Render (`GEMINI_API_KEY`); el navegador
 * nunca la ve. El endpoint exige JWT, que agrega `authInterceptor`.
 */
@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly http = inject(HttpClient);

  async analyzeTattoo(description: string): Promise<string> {
    const res = await firstValueFrom(
      this.http.post<{ respuesta: string }>(API_ROUTES.ia.analyzeTattoo, {
        descripcion: description,
      }),
    );

    return res.respuesta ?? '{}';
  }
}
