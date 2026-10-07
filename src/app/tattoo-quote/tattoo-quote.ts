import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tattoo-quote',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './tattoo-quote.html',
  styleUrl: './tattoo-quote.css'
})

export class TattooQuote {

  size = '';
  area = '';
  color = false;
  detail = '';

  price = 0;
  hours = 0;
  recommendation = '';

  calculateQuote() {

    let total = 0;
    let estimatedHours = 1;

    // Tamaño
    switch (this.size) {
      case 'small':
        total += 100000;
        estimatedHours += 1;
        break;

      case 'medium':
        total += 200000;
        estimatedHours += 3;
        break;

      case 'large':
        total += 350000;
        estimatedHours += 5;
        break;
    }

    // Zona
    switch (this.area) {
      case 'arm':
        total += 0;
        break;

      case 'forearm':
        total += 30000;
        break;

      case 'leg':
        total += 50000;
        break;

      case 'chest':
        total += 80000;
        break;

      case 'back':
        total += 100000;
        break;
    }

    // Color
    if (this.color) {
      total += 100000;
      estimatedHours += 1;
    }

    // Detalle
    switch (this.detail) {
      case 'medium':
        total += 50000;
        estimatedHours += 1;
        break;

      case 'high':
        total += 150000;
        estimatedHours += 2;
        break;
    }

    this.price = total;
    this.hours = estimatedHours;

    this.recommendation =
      `Este tatuaje requerirá aproximadamente ${estimatedHours} horas de trabajo y tiene un costo estimado de $${total.toLocaleString('es-CO')}.`;
  }
}