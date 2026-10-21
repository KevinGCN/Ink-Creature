/**
 * Módulo Gallery — Angular 21.
 *
 * - Signals + control flow (@if/@for) en vez de NgModules/*ngIf/*ngFor.
 * - Imágenes en vivo desde el backend NestJS (GET/POST/DELETE /api/galeria).
 * - La subida de archivos usa POST /api/galeria/upload (multipart) del
 *   backend, que guarda el archivo en la base de datos y devuelve su ruta
 *   "/api/imagenes/<id>", que se resuelve con `urlImagen()` al pintarla.
 * - Se muestran además las imágenes base del proyecto (assets locales),
 *   que no se pueden eliminar desde la UI.
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Empleado, EmpleadoService } from '../services/empleados';
import { GaleriaService, ImagenGaleria } from '../services/galeria';
import { FOTO_PLACEHOLDER } from '../utils/placeholder';
import { urlImagen } from '../utils/imagen-url';

/** Imágenes base embebidas en el frontend (no pertenecen al backend) */
const IMAGENES_BASE: ImagenGaleria[] = [
  { id: -1, subido_por: 0, empleado_id: null, imagen_url: 'image/DBZ.jpg', titulo: 'Goku Y Vegeta', fecha_subida: '' },
  { id: -2, subido_por: 0, empleado_id: null, imagen_url: 'image/ladymaria.png', titulo: 'Lady Maria', fecha_subida: '' },
  { id: -3, subido_por: 0, empleado_id: null, imagen_url: 'image/mercy.png', titulo: 'Mercy', fecha_subida: '' },
  { id: -4, subido_por: 0, empleado_id: null, imagen_url: 'image/rem.png', titulo: 'Rem', fecha_subida: '' },
  { id: -5, subido_por: 0, empleado_id: null, imagen_url: 'image/kuromi.jpg', titulo: 'Kuromi', fecha_subida: '' },
  { id: -6, subido_por: 0, empleado_id: null, imagen_url: 'image/sorodita.png', titulo: 'Sorodita', fecha_subida: '' },
  { id: -7, subido_por: 0, empleado_id: null, imagen_url: 'image/arquemis.png', titulo: 'Arquemis', fecha_subida: '' }
];

@Component({
  selector: 'app-gallery',
  imports: [FormsModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly galeriaService = inject(GaleriaService);
  private readonly empleadosService = inject(EmpleadoService);

  // ── Estado reactivo ───────────────────────────────────────
  private readonly imagenesDb = signal<ImagenGaleria[]>([]);
  readonly imagenes = computed(() => [...IMAGENES_BASE, ...this.imagenesDb()]);
  readonly cargando = signal(true);
  readonly error = signal('');

  /** Usuario reactivo y permisos administrativos derivados del rol */
  readonly esAdmin = computed(() => this.auth.esAdmin());

  /** Imagen seleccionada para visualización ampliada */
  readonly selectedImage = signal<string | null>(null);

  /** Tatuadores (empleados activos) para el selector de subida */
  readonly tatuadores = signal<Empleado[]>([]);

  // ── Modal de subida ───────────────────────────────────────
  readonly mostrarModalSubida = signal(false);
  readonly archivoTemporal = signal<File | null>(null);
  readonly previewTemporal = signal('');
  readonly tatuadorSeleccionado = signal<number | null>(null);
  readonly nombreImagenTemp = signal('');
  readonly subiendo = signal(false);
  readonly errorSubida = signal('');

  readonly placeholder = FOTO_PLACEHOLDER;

  ngOnInit(): void {
    this.cargarImagenes();
    this.cargarTatuadores();
  }

  cargarImagenes(): void {
    this.cargando.set(true);
    this.galeriaService.getGaleria().subscribe({
      next: (imagenes) => {
        this.imagenesDb.set(imagenes);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error cargando galería:', err);
        this.error.set('No se pudo conectar con el backend para cargar la galería.');
        this.cargando.set(false);
      }
    });
  }

  private cargarTatuadores(): void {
    this.empleadosService.getEmpleados().subscribe({
      next: (empleados) => {
        const activos = empleados.filter((e) => e.activo);
        this.tatuadores.set(activos);
        if (activos.length > 0 && this.tatuadorSeleccionado() === null) {
          this.tatuadorSeleccionado.set(activos[0].id);
        }
      },
      error: (err) => console.error('Error cargando tatuadores:', err)
    });
  }

  nombreTatuador(imagen: ImagenGaleria): string {
    const u = imagen.empleados?.usuarios;
    return u ? `${u.nombre} ${u.apellido}`.trim() : 'Tatuador';
  }

  esImagenDeBase(imagen: ImagenGaleria): boolean {
    return imagen.id < 0;
  }

  /**
   * URL real de la imagen. Las guardadas en la BD son rutas relativas
   * ("/api/imagenes/<id>") y se resuelven contra el backend; las externas
   * (https://...) y las de los assets se usan tal cual.
   */
  srcImagen(imagen: ImagenGaleria): string {
    return urlImagen(imagen.imagen_url);
  }

  openImage(src: string): void {
    this.selectedImage.set(src);
  }

  closeImage(): void {
    this.selectedImage.set(null);
  }

  verTatuador(empleadoId: number | null, event: Event): void {
    event.stopPropagation();
    if (empleadoId) {
      this.router.navigate(['/employeeCV', empleadoId]);
    }
  }

  handleImageError(event: Event): void {
    // Fallback inline (no depende de un archivo placeholder en disco)
    (event.target as HTMLImageElement).src = FOTO_PLACEHOLDER;
  }

  // ── Paso 1: archivo seleccionado → abrir modal ────────────
  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.archivoTemporal.set(file);
    this.nombreImagenTemp.set(file.name.replace(/\.[^.]+$/, ''));
    this.errorSubida.set('');
    this.previewTemporal.set(URL.createObjectURL(file));
    this.mostrarModalSubida.set(true);

    // Limpiar input para permitir resubir el mismo archivo
    input.value = '';
  }

  // ── Paso 2: confirmar → subir al backend y registrar ──────
  confirmarSubida(): void {
    const file = this.archivoTemporal();
    const usuario = this.auth.obtenerUsuario();

    if (!file || !usuario) return;

    this.subiendo.set(true);
    this.errorSubida.set('');

    // 1) Subir el archivo a /uploads
    this.galeriaService.subirArchivo(file).subscribe({
      next: (url) => {
        // 2) Registrar el registro en la galería
        this.galeriaService
          .crearImagen({
            subido_por: usuario.id,
            empleado_id: this.tatuadorSeleccionado() ?? undefined,
            imagen_url: url,
            titulo: this.nombreImagenTemp().trim() || undefined
          })
          .subscribe({
            next: () => {
              this.subiendo.set(false);
              this.cerrarModalSubida();
              this.cargarImagenes();
            },
            error: (err: HttpErrorResponse) => {
              console.error('Error registrando imagen:', err);
              this.subiendo.set(false);
              this.errorSubida.set(this.mensajeDeError(err, 'No se pudo registrar la imagen.'));
            }
          });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error subiendo imagen:', err);
        this.subiendo.set(false);
        this.errorSubida.set(this.mensajeDeError(err, 'No se pudo subir el archivo.'));
      }
    });
  }

  cerrarModalSubida(): void {
    this.mostrarModalSubida.set(false);
    this.archivoTemporal.set(null);
    this.previewTemporal.set('');
    this.nombreImagenTemp.set('');
    this.errorSubida.set('');
  }

  // ── Eliminar (solo imágenes del backend) ──────────────────
  eliminarImagen(imagen: ImagenGaleria, event: Event): void {
    event.stopPropagation();

    if (this.esImagenDeBase(imagen)) {
      alert('No puedes eliminar imágenes base.');
      return;
    }
    if (!confirm(`¿Eliminar "${imagen.titulo || 'esta imagen'}" de la galería?`)) return;

    this.galeriaService.eliminarImagen(imagen.id).subscribe({
      next: () => this.cargarImagenes(),
      error: (err: HttpErrorResponse) => {
        console.error('Error eliminando imagen:', err);
        alert(this.mensajeDeError(err, 'No se pudo eliminar la imagen.'));
      }
    });
  }

  private mensajeDeError(err: HttpErrorResponse, porDefecto: string): string {
    if (err.status === 401) return 'Tu sesión expiró. Cierra sesión y vuelve a entrar.';
    return porDefecto;
  }
}
