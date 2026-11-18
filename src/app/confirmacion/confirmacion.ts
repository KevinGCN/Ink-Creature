/**
 * Modal de confirmación del proyecto.
 *
 * Renderiza la confirmación pendiente de `ConfirmacionService` (montado una vez
 * en el shell raíz) y responde con el botón elegido o con la tecla Escape.
 */
import { Component, inject } from '@angular/core';
import { ConfirmacionService } from '../services/confirmacion';

@Component({
  selector: 'app-confirmacion-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.css',
  host: {
    '(document:keydown.escape)': 'cancelar()',
  },
})
export class ConfirmacionModal {
  protected readonly servicio = inject(ConfirmacionService);

  aceptar(): void {
    this.servicio.responder(true);
  }

  cancelar(): void {
    this.servicio.responder(false);
  }
}
