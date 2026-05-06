/**
 * Barra de navegación principal (sidebar colapsable)
 * 
 * Componente de navegación principal que se expande/colapsa
 * mediante toggle. Muestra enlaces de navegación de la aplicación.
 * 
 * Responsabilidades:
 * - Controlar estado colapsado/expandido del sidebar
 * - Proveer acceso al AuthService para mostrar estado de sesión
 * - Emitir comandos de navegación mediante RouterLink
 * 
 * Interacción:
 * - Botón toggle cambia estado `collapsed`
 * - Usa template-driven para transiciones CSS
 * - Consume AuthService para mostrar login/logout
 * 
 * @component
 */
import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Observable } from 'rxjs';
import { RouterLink, RouterLinkActive } from '@angular/router';



@Component({
  selector: 'app-main-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './main-navbar.html',
  styleUrl: './main-navbar.css',
})
export class MainNavbar {
  /**
   * Estilo CSS inline para la grilla del sidebar.
   * Controla el ancho del panel colapsado mediante grid-template-columns.
   */
  gridTemplateColumnsLayout = 'grid-template-columns:0px 1fr;';

  /**
   * Estado colapsado del sidebar.
   * true = panel oculto (solo iconos/mini), false = panel expandido
   */
  collapsed = true;

  /**
   * Constructor - inyección de AuthService para el template
   * @param auth Servicio de autenticación (público para usar en template)
   */
  constructor(public auth: AuthService) {}

  /**
   * Alterna el estado colapsado/expandido del sidebar.
   * Restablece el layout CSS al expandir.
   */
  toggleNavbar() {
    this.collapsed = !this.collapsed;
    this.gridTemplateColumnsLayout = 'grid-template-columns:0px 1fr;';
  }
}

