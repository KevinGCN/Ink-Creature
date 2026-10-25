/**
 * Cotizador manual de tatuajes (TattooQuote) — ruta pública `/tattoo-ia`.
 *
 * Es un formulario de estimación: el usuario elige tamaño, zona, color y nivel
 * de detalle y el cálculo se hace **en el navegador** con una tabla de precios
 * fija en pesos colombianos. No consulta al backend ni usa IA; sirve como
 * referencia rápida antes de pedir una cita. (`/gemini-ia` es el cotizador con
 * IA, que sí llama al backend.)
 */
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

  // Valores del formulario, enlazados con ngModel desde la plantilla.
  size = '';
  area = '';
  color = false;
  detail = '';

  // Resultado del cálculo: se pinta tal cual en la plantilla.
  price = 0;
  hours = 0;
  recommendation = '';

  /**
   * Suma los recargos de cada opción elegida y arma el texto final.
   * Se recalcula desde cero en cada clic para que cambiar de opción no acumule
   * importes de la selección anterior.
   */
  calculateQuote() {

    let total = 0;
    // La hora base cubre preparación y montaje, por eso nunca baja de 1.
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

    // Se formatea en es-CO para que el precio se lea con separadores de miles.
    this.recommendation =
      `Este tatuaje requerirá aproximadamente ${estimatedHours} horas de trabajo y tiene un costo estimado de $${total.toLocaleString('es-CO')}.`;
  }
}