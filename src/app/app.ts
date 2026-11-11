import { Component, signal, OnInit } from '@angular/core'; // 1. Añadimos OnInit aquí
import { RouterOutlet } from '@angular/router';
import { UserNavbar } from "./navbar/user-navbar/user-navbar";
import { MainNavbar } from "./navbar/main-navbar/main-navbar";
import { HttpClientModule } from '@angular/common/http';
// 2. Importamos tu servicio de Tawk (ajusta los puntos si la carpeta está en otro nivel)
import { TawkService } from './services/tawk';
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
export class App implements OnInit { // 3. Le decimos que implemente OnInit
  protected readonly title = signal('Ink-Creature');

  // 4. Inyectamos el servicio en el constructor
  constructor(
    private tawkService: TawkService,
    private seoService: SeoService
  ) {}

  // 5. Ejecutamos la carga del chat y los meta tags SEO cuando inicie la app
  ngOnInit() {
    this.tawkService.loadChat();
    this.seoService.init();
  }
}
