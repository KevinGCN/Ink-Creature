/**
 * Página informativa (Information) — ruta pública `/information`.
 *
 * No tiene lógica: todo el contenido (precios, cuidados, contacto) está escrito
 * directamente en `information.html`, así que la clase queda vacía a propósito.
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-information',
  imports: [],
  standalone: true,
  templateUrl: './information.html',
  styleUrl: './information.css',
})
export class Information {

  // Sin estado ni dependencias: si algún día el contenido se dinamiza, va aquí.
}
