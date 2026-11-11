import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../services/auth';
import { GaleriaService } from '../services/galeria';
import { ConfirmacionService } from '../services/confirmacion';
import { NotificacionesService } from '../services/notificaciones';
import { EmpleadoService } from '../services/empleados';
import { Empleado } from '../models/empleado';
import { urlDeImagen } from '../core/api.routes';

interface ImagenGaleria {
  id?: number;
  src: string;
  alt: string;
  empleadoId: number;
}

@Component({
  selector: 'app-gallery',
  imports: [FormsModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly galeriaApi = inject(GaleriaService);
  private readonly empleadoService = inject(EmpleadoService);
  // Avisos y confirmación con el proyecto propio (toasts + modal; sin nativos)
  private readonly notificaciones = inject(NotificacionesService);
  private readonly confirmacion = inject(ConfirmacionService);

  // Imagen seleccionada para visualización ampliada
  readonly selectedImage = signal<string | null>(null);

  // Usuario reactivo y permisos administrativos derivados
  private readonly usuario = toSignal(this.auth.usuario$, {
    initialValue: this.auth.obtenerUsuario()
  });
  readonly esAdmin = computed(() => {
    const u = this.usuario();
    return u?.rol === 'admin' || u?.charge === 'CEO' || u?.charge === 'Admin';
  });

  // Lista de tatuadores para el selector (viene del backend)
  readonly tatuadores = signal<Empleado[]>([]);
  readonly imagenes = signal<ImagenGaleria[]>([]);

  readonly mostrarModalSubida = signal(false);
  readonly archivoTemporal = signal<File | null>(null);
  readonly previewTemporal = signal('');
  readonly tatuadorSeleccionado = signal<number | null>(null);
  readonly nombreImagenTemp = signal('');

  ngOnInit() {
    this.cargarImagenes();
    this.recargarTatuadores();
  }

  private recargarTatuadores() {
    this.empleadoService.getEmpleados().subscribe({
      next: (lista) => {
        this.tatuadores.set(lista);

        const actual = this.tatuadorSeleccionado();
        if (actual === null || !lista.some((t) => t.id === actual)) {
          this.tatuadorSeleccionado.set(lista[0]?.id ?? null);
        }
      },
      error: (err) => console.error('No se pudo cargar los tatuadores:', err),
    });
  }

  cargarImagenes() {
    this.galeriaApi.obtenerTodos().subscribe({
      next: (datos) => {
        this.imagenes.set(
          datos.map(d => ({
            id: d.id,
            src: urlDeImagen(d.imagen_url),
            alt: d.titulo ?? 'Tatuaje',
            empleadoId: d.empleado_id ?? 0
          }))
        );
      },
      error: (err) => {
        console.error('No se pudo cargar la galería desde la API:', err);
        this.imagenes.set([]);
      }
    });
  }

  openImage(img: string) {
    this.selectedImage.set(img);
  }

  closeImage() {
    this.selectedImage.set(null);
  }

  verTatuador(empleadoId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/employeeCV', empleadoId]);
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img.src.includes('tatuador.png')) return;
    console.error('Error cargando imagen:', event);
    img.src = 'image/tatuador.png';
  }

  obtenerNombreTatuador(id: number): string {
    const t = this.tatuadores().find(t => t.id === id);
    return t ? `${t.name} ${t.last_name}`.trim() : 'Tatuador';
  }

  // ── Paso 1: archivo seleccionado → abrir modal
  seleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.notificaciones.aviso('La imagen supera 5 MB.');
      input.value = '';
      return;
    }

    this.archivoTemporal.set(file);
    this.nombreImagenTemp.set(file.name.replace(/\.[^.]+$/, ''));

    // Recargar tatuadores por si se agregaron nuevos
    this.recargarTatuadores();

    this.previewTemporal.set(URL.createObjectURL(file));
    this.mostrarModalSubida.set(true);

    // Limpiar input para permitir resubir el mismo archivo
    input.value = '';
  }

  // ── Paso 2: confirmar con tatuador seleccionado
  confirmarSubida() {
    const archivo = this.archivoTemporal();
    const usuario = this.auth.obtenerUsuario();
    if (!archivo || !usuario?.id) return;

    const empleadoId = this.tatuadorSeleccionado() ?? undefined;
    const tatuador = this.tatuadores().find((t) => t.id === empleadoId);
    const titulo = this.nombreImagenTemp().trim() || archivo.name;

    this.galeriaApi
      .subirImagen(archivo)
      .pipe(
        switchMap((subida) =>
          this.galeriaApi.crear({
            subido_por: usuario.id,
            empleado_id: empleadoId,
            imagen_url: subida.url,
            titulo,
            estilo: tatuador?.especialidad,
          }),
        ),
      )
      .subscribe({
        next: () => {
          this.cargarImagenes();
          this.cerrarModalSubida();
        },
        error: (err) => {
          console.error('No se pudo subir la imagen:', err);
          this.notificaciones.error('No se pudo subir la imagen. Revisa tu sesión e intenta de nuevo.');
        },
      });
  }

  cerrarModalSubida() {
    this.mostrarModalSubida.set(false);
    this.archivoTemporal.set(null);
    this.previewTemporal.set('');
    this.nombreImagenTemp.set('');
  }

  /**
   * Elimina una imagen de la galería previa confirmación (modal propio del
   * proyecto). `stopPropagation` evita que el clic llegue a la tarjeta y abra
   * el visor. El backend borra la fila Y el binario.
   */
  async eliminarImagen(img: ImagenGaleria, event: Event): Promise<void> {
    event.stopPropagation();
    if (img.id == null) return;
    const aceptado = await this.confirmacion.confirmar({
      titulo: 'Eliminar imagen',
      mensaje: `¿Eliminar "${img.alt || 'esta imagen'}" de la galería?`,
      textoConfirmar: 'Eliminar',
      peligro: true,
    });
    if (!aceptado) return;

    this.galeriaApi.eliminar(img.id).subscribe({
      next: () => {
        this.imagenes.update((lista) => lista.filter((i) => i.id !== img.id));
      },
      error: (err) => {
        console.error('No se pudo eliminar la imagen:', err);
        this.notificaciones.error('No se pudo eliminar la imagen.');
      },
    });
  }
}
