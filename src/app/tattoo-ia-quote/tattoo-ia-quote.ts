import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini';
import { NotificacionesService } from '../services/notificaciones';
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
  
  private gemini = inject(GeminiService);
  private notificaciones = inject(NotificacionesService);
  description = '';
  analysis: TattooAnalysis | null = null;
  loading = false;

  async analyzeTattoo() {
    if (!this.description.trim()) {
      return;
    }
    this.loading = true;
    try {
      const result =
        await this.gemini.analyzeTattoo(this.description);
      const cleanJson =
        result
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
      this.analysis = JSON.parse(cleanJson);
    } catch (error: any) {
      console.error('Error analizando tatuaje:', error);
      this.analysis = null;
      // El analisis de IA corre en el backend (la clave de Gemini nunca viaja
      // al navegador): los fallos se avisan con toasts propios del proyecto.
      if (error instanceof HttpErrorResponse && error.status === 503) {
        this.notificaciones.error('El servicio de IA no está disponible en este momento. Intenta más tarde.');
      } else if (error instanceof HttpErrorResponse && error.status === 401) {
        this.notificaciones.error('Tu sesión expiró. Inicia sesión nuevamente para cotizar.');
      } else {
        this.notificaciones.error('No se pudo analizar el tatuaje. Intenta nuevamente.');
      }
    }
    this.loading = false;
  }
}