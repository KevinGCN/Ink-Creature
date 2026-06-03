import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private ai = new GoogleGenAI({
    apiKey: environment.geminiApiKey
  });

  async analyzeTattoo(description: string): Promise<string> {

    const prompt = `
Actúa como un tatuador profesional colombiano del estudio Ink Creature.

Analiza la siguiente solicitud:

"${description}"

Debes responder EXCLUSIVAMENTE con un JSON válido.

No uses markdown.
No uses comillas triples.
No agregues explicaciones fuera del JSON.

Formato:

{
  "complejidad": "Baja | Media | Alta",
  "tiempo": "texto",
  "precioMin": numero,
  "precioMax": numero,
  "justificacion": "texto"
}

Precios realistas para Colombia:
Pequeño:
100000 - 300000 COP
Mediano:
300000 - 700000 COP
Grande:
700000 - 2000000 COP
`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text ?? '{}';
  }
}