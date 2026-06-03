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
  
  private gemini = inject(GeminiService);
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
        console.log('RESPUESTA GEMINI:', result);
      const cleanJson =
        result
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
      this.analysis = JSON.parse(cleanJson);
      console.log('ANALYSIS:', this.analysis);
    } catch (error: any) {
      console.error('ERROR GEMINI:', error);
      this.analysis = null;
      console.error(error);
    }
    this.loading = false;
  }
}