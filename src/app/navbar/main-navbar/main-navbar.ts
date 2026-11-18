/**
 * Barra de navegación principal (sidebar colapsable)
 *
 * Componente de navegación principal que muestra u oculta los textos
 * de los enlaces según el estado que recibe del layout.
 *
 * Responsabilidades:
 * - Recibir el estado abierto/cerrado desde App
 * - Mostrar iconos y textos de navegación
 * - Proveer acceso a las rutas principales
 *
 * @component
 */
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-main-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './main-navbar.html',
  styleUrl: './main-navbar.css',
})
export class MainNavbar {
  /**
   * Estado colapsado del sidebar.
   * true = menú cerrado (solo iconos), false = menú abierto
   */
  @Input() collapsed = true;
}
