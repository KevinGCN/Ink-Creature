import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs/operators';

/**
 * Servicio de SEO para la SPA.
 *
 * Actualiza el título, la meta description, las etiquetas Open Graph
 * y el canonical cada vez que cambia la ruta activa, leyendo los datos
 * declarados en `data: { titulo, descripcion }` de `app.routes.ts`.
 */
@Injectable({
  providedIn: 'root'
})
export class SeoService {

  /** URL base pública del sitio (sin barra final). */
  private readonly baseUrl = 'https://ink-creature-v2.netlify.app';

  /** Título por defecto cuando la ruta no declara uno. */
  private readonly tituloPorDefecto = 'Ink Creature — Estudio de tatuajes';

  /** Descripción por defecto cuando la ruta no declara una. */
  private readonly descripcionPorDefecto =
    'Ink Creature es tu estudio de tatuajes: diseños personalizados, artistas profesionales y una experiencia segura para tu próxima idea.';

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  /**
   * Empieza a escuchar los cambios de navegación y aplica los meta tags
   * correspondientes a la ruta actual (incluida la carga inicial).
   */
  public init(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.actualizarMetaTags());

    // Cubre la navegación inicial si `init()` corre después del primer NavigationEnd.
    this.actualizarMetaTags();
  }

  /** Recorre el árbol de rutas hasta la hoja y aplica sus datos SEO. */
  private actualizarMetaTags(): void {
    let rutaHija: ActivatedRoute | null = this.route.firstChild;

    while (rutaHija?.firstChild) {
      rutaHija = rutaHija.firstChild;
    }

    const data = (rutaHija ?? this.route).snapshot.data;
    const titulo: string = data['titulo'] || this.tituloPorDefecto;
    const descripcion: string = data['descripcion'] || this.descripcionPorDefecto;

    const rutaLimpia = this.router.url.split('?')[0] || '/';
    const canonicalUrl =
      rutaLimpia === '/' ? `${this.baseUrl}/` : `${this.baseUrl}${rutaLimpia}`;

    this.title.setTitle(titulo);

    this.meta.updateTag({ name: 'description', content: descripcion });
    this.meta.updateTag({ property: 'og:title', content: titulo });
    this.meta.updateTag({ property: 'og:description', content: descripcion });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });

    this.setCanonical(canonicalUrl);
  }

  /** Crea o actualiza el <link rel="canonical"> del documento. */
  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}
