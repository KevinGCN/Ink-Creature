/**
 * Componente raíz de la aplicación.
 *
 * Es el "shell" de la SPA: solo compone los dos navbars y deja el
 * `router-outlet` como punto de inserción de las vistas, de modo que la
 * navegación no vuelva a montar la cabecera en cada cambio de ruta.
 */
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserNavbar } from "./navbar/user-navbar/user-navbar";
import { MainNavbar } from "./navbar/main-navbar/main-navbar";

// Se declara standalone para que el componente sea autocontenido y se pueda
// importar directamente (este proyecto no usa NgModules en ningún punto).
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserNavbar, MainNavbar],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App {
  // Se usa una señal (y no una propiedad plana) para que, si algún día se
  // pinta en la plantilla, un cambio de título dispare la detección de
  // cambios sin depender de Zone en modo "zoneless".
  protected readonly title = signal('Ink-Creature');
}
