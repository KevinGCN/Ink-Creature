/**
 * Contenedor de toasts del proyecto: pinta en el DOM las notificaciones que los
 * componentes emiten a través de `NotificacionesService`.
 *
 * Se monta una única vez en el shell raíz (`App`), así que los avisos aparecen
 * desde cualquier ruta.
 */
import { Component, inject, OnDestroy } from '@angular/core';
import { NotificacionesService } from '../services/notificaciones';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [],
  templateUrl: './toasts.html',
  styleUrl: './toasts.css',
})
export class Toasts implements OnDestroy {
  protected readonly servicio = inject(NotificacionesService);

  ngOnDestroy(): void {
    // Evita temporizadores huérfanos si el contenedor se llega a destruir.
    this.servicio.limpiar();
  }
}
