/**
 * Cotizador con IA (TattooAiQuoteComponent) — ruta `/gemini-ia`, protegida por
 * `authGuard` porque cada análisis consume cuota del servicio.
 *
 * El navegador nunca habla con Google: `GeminiService` hace
 * `POST /api/ia/analyze-tattoo` y el backend es el único que conoce la llave
 * `GEMINI_API_KEY` (variable de entorno). Así la clave no viaja al bundle ni se
 * puede copiar desde la consola del navegador.
 */
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini';
import { TattooAnalysis } from '../models/tattoo-analysis';
import { CurrencyPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-tattoo-ai-quote',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, NgIf],
  templateUrl: './tattoo-ia-quote.html',
  styleUrl: './tattoo-ia-quote.css'
})

export class TattooAiQuoteComponent {
  
  // Proxy del backend: este servicio es el único punto de contacto con la IA.
  private gemini = inject(GeminiService);
  /** Lo que el usuario escribe sobre el tatuaje que quiere hacerse. */
  description = '';
  /** Resultado ya parseado; `null` mientras no hay análisis válido. */
  analysis: TattooAnalysis | null = null;
  /** Deshabilita el botón y muestra el estado de carga durante la petición. */
  loading = false;

  /** Pide el análisis a la IA y deja el resultado listo para la plantilla. */
  async analyzeTattoo() {
    // Sin descripción no se gasta una llamada (y la IA no tendría contexto).
    if (!this.description.trim()) {
      return;
    }
    this.loading = true;
    try {
      const result =
        await this.gemini.analyzeTattoo(this.description);
        console.log('RESPUESTA GEMINI:', result);
      // La IA suele envolver el JSON en bloques markdown (```json … ```):
      // se quitan las cercas antes de parsear o JSON.parse fallaría.
      const cleanJson =
        result
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
      this.analysis = JSON.parse(cleanJson);
      console.log('ANALYSIS:', this.analysis);
    } catch (error: any) {
      // Fallo de red o JSON inválido: se limpia el resultado anterior para no
      // mostrar una cotización vieja como si fuera la nueva.
      console.error('ERROR GEMINI:', error);
      this.analysis = null;
      console.error(error);
    }
    // Se libera el botón tanto si hubo éxito como si hubo error.
    this.loading = false;
  }
}