import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserNavbar } from "./navbar/user-navbar/user-navbar";
import { MainNavbar } from "./navbar/main-navbar/main-navbar";
import { HttpClientModule } from '@angular/common/http';
import { SeoService } from './core/seo.service';
import { TooltipDirective } from './core/tooltip.directive';
import { LoadingBar } from './core/loading-bar/loading-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserNavbar, MainNavbar, HttpClientModule, TooltipDirective, LoadingBar],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Ink-Creature');

  /** Estado compartido con el menú lateral para reacomodar el contenido. */
  sidebarExpanded = false;

  constructor(private seoService: SeoService) {}

  /** Abre o cierra el menú lateral y deja que la grilla se reacomode. */
  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  ngOnInit() {
    this.seoService.init();
  }
}
