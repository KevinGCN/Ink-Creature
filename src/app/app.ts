import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserNavbar } from "./navbar/user-navbar/user-navbar";
import { MainNavbar } from "./navbar/main-navbar/main-navbar";
import { HttpClientModule } from '@angular/common/http';
import { Toasts } from './toasts/toasts';
import { ConfirmacionModal } from './confirmacion/confirmacion';
import { TooltipDirective } from './core/tooltip.directive';
import { LoadingBar } from './core/loading-bar/loading-bar';
import { SeoService } from './core/seo.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    UserNavbar,
    MainNavbar,
    HttpClientModule,
    Toasts,
    ConfirmacionModal,
    TooltipDirective,
    LoadingBar,
  ],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Ink-Creature');

  /** Estado compartido con el menú lateral para reacomodar el contenido. */
  sidebarExpanded = false;

  // Servicios de arranque: SEO global del sitio.
  constructor(private seoService: SeoService) {}

  /** Abre o cierra el menú lateral y deja que la grilla se reacomode. */
  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  // Carga los meta tags SEO cuando inicia la app
  ngOnInit() {
    this.seoService.init();
  }
}
