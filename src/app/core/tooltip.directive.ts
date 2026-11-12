import {
  Directive,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Etiqueta pequeña que sigue al cursor cuando pasa sobre un botón o un enlace.
 *
 * Se aplica una sola vez en el contenedor raíz (`.layout`) y delega en los
 * elementos interactivos que haya dentro, así no hay que tocar cada plantilla.
 *
 * El texto se toma en este orden:
 *   1. `data-tooltip` (para textos explícitos)
 *   2. `aria-label` (lo que ya usan los iconos de la barra lateral)
 *   3. el texto visible del elemento (botones con texto, ej. "Registrarse")
 *
 * La etiqueta es puramente visual: lleva `aria-hidden` porque el elemento que
 * la origina ya tiene nombre accesible propio. En pantallas táctiles no se
 * muestra (ver `styles.css`).
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  /** Elementos que pueden originar una etiqueta. */
  private readonly selector =
    'button, a, [role="button"], [data-tooltip]';

  private etiqueta: HTMLElement | null = null;
  private disparador: HTMLElement | null = null;
  private temporizador: ReturnType<typeof setTimeout> | null = null;
  private x = 0;
  private y = 0;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private readonly doc: Document,
  ) {}

  @HostListener('pointerover', ['$event'])
  alEntrar(evento: PointerEvent): void {
    const objetivo = (evento.target as HTMLElement | null)?.closest<HTMLElement>(
      this.selector,
    );
    if (!objetivo || objetivo === this.disparador) return;

    this.ocultar();

    const texto = this.textoDe(objetivo);
    if (!texto) return;

    this.disparador = objetivo;
    this.x = evento.clientX;
    this.y = evento.clientY;
    this.temporizador = setTimeout(() => this.mostrar(texto), 120);
  }

  @HostListener('pointermove', ['$event'])
  alMover(evento: PointerEvent): void {
    if (!this.disparador) return;
    this.x = evento.clientX;
    this.y = evento.clientY;
    if (this.etiqueta) this.colocar();
  }

  @HostListener('pointerout', ['$event'])
  alSalir(evento: PointerEvent): void {
    // Ignorar el cambio entre hijos del mismo disparador (el texto → el icono).
    const destino = evento.relatedTarget as Node | null;
    if (this.disparador && destino && this.disparador.contains(destino)) return;
    this.ocultar();
  }

  @HostListener('pointerdown')
  @HostListener('window:scroll')
  @HostListener('window:blur')
  ocultar(): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
    this.disparador = null;
    this.etiqueta?.classList.remove('visible');
  }

  ngOnDestroy(): void {
    this.ocultar();
    this.etiqueta?.remove();
    this.etiqueta = null;
  }

  private textoDe(el: HTMLElement): string {
    const crudo = (
      el.dataset['tooltip'] ??
      el.getAttribute('aria-label') ??
      el.textContent ??
      ''
    )
      .replace(/\s+/g, ' ')
      .trim();

    if (!crudo) return '';
    return crudo.length > 48 ? `${crudo.slice(0, 45)}…` : crudo;
  }

  private mostrar(texto: string): void {
    if (!this.disparador) return;

    if (!this.etiqueta) {
      const creada = this.doc.createElement('div');
      creada.className = 'cursor-tooltip';
      creada.setAttribute('aria-hidden', 'true');
      this.doc.body.appendChild(creada);
      this.etiqueta = creada;
    }

    this.etiqueta.textContent = texto;
    this.etiqueta.classList.add('visible');
    this.colocar();
  }

  private colocar(): void {
    const el = this.etiqueta;
    if (!el) return;

    const margen = 14;
    const ancho = el.offsetWidth;
    const alto = el.offsetHeight;

    let x = this.x + margen;
    let y = this.y + margen + 4;

    // Si no cabe a la derecha/abajo, se dibuja al otro lado del cursor.
    if (x + ancho > window.innerWidth - 8) x = this.x - ancho - margen;
    if (y + alto > window.innerHeight - 8) y = this.y - alto - margen;

    el.style.left = `${Math.max(8, x)}px`;
    el.style.top = `${Math.max(8, y)}px`;
  }
}
