import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserNavbar } from "./navbar/user-navbar/user-navbar";
import { MainNavbar } from "./navbar/main-navbar/main-navbar";
import { HttpClientModule } from '@angular/common/http';
import { Toasts } from './toasts/toasts';
import { ConfirmacionModal } from './confirmacion/confirmacion';
import { SeoService } from './core/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserNavbar, MainNavbar, HttpClientModule, Toasts, ConfirmacionModal],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App implements OnInit {   protected readonly title = signal('Ink-Creature');

  // Servicios de arranque: SEO global del sitio.
  constructor(private seoService: SeoService) {}

  // Carga los meta tags SEO cuando inicia la app
  ngOnInit() {
    this.seoService.init();
  }
}
