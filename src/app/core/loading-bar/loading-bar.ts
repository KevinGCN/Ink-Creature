import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from '../loading.service';

/**
 * Barra fina de progreso en la parte superior.
 *
 * Se alimenta de dos fuentes: peticiones HTTP y navegación entre rutas.
 * No bloquea la pantalla; solo confirma que la interacción fue recibida.
 */
@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="barra-carga"
      [class.visible]="visible"
      role="progressbar"
      aria-label="Cargando"
      [attr.aria-hidden]="!visible"
    >
      <span class="barra-carga__relleno"></span>
    </div>
  `,
  styles: [
    `
      .barra-carga {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        z-index: 4000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
      }

      .barra-carga.visible {
        opacity: 1;
      }

      .barra-carga__relleno {
        display: block;
        height: 100%;
        width: 40%;
        background: linear-gradient(90deg, #7e57c2, #2563eb, #7e57c2);
        border-radius: 0 3px 3px 0;
      }

      .barra-carga.visible .barra-carga__relleno {
        animation: barra-carga-avance 1.1s ease-in-out infinite;
      }

      @keyframes barra-carga-avance {
        0% {
          transform: translateX(-110%);
        }
        100% {
          transform: translateX(360%);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .barra-carga.visible .barra-carga__relleno {
          animation: none;
          width: 100%;
        }
      }
    `,
  ],
})
export class LoadingBar implements OnInit, OnDestroy {
  visible = false;

  private suscripciones = new Subscription();

  constructor(
    private loading: LoadingService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.suscripciones.add(
      this.loading.visible$.subscribe((visible) => (this.visible = visible)),
    );

    this.suscripciones.add(
      this.router.events.subscribe((evento) => {
        if (evento instanceof NavigationStart) {
          this.loading.iniciarNavegacion();
        } else if (
          evento instanceof NavigationEnd ||
          evento instanceof NavigationCancel ||
          evento instanceof NavigationError
        ) {
          this.loading.terminarNavegacion();
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }
}
