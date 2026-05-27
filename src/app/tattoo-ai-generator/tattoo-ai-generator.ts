import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AiService } from '../services/ai.service';

@Component({
  selector: 'app-tattoo-ai-generator',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './tattoo-ai-generator.html',
  styleUrl: './tattoo-ai-generator.css'
})
export class TattooAiGeneratorComponent {

  prompt = '';
  response = '';
  loading = false;

  constructor(private aiService: AiService) { }

  generateTattoo() {

    if (!this.prompt.trim()) return;

    this.loading = true;

    this.aiService.generateTattoo(this.prompt)
      .subscribe({
        next: (data) => {

          this.response = data.result;

          this.loading = false;
        },

        error: (error) => {

          console.log(error);

          this.loading = false;
        }
      });

  }

}