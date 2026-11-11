import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../services/auth';
import { GaleriaService, FichaEmpleadoGaleria } from '../services/galeria';
import { ConfirmacionService } from '../services/confirmacion';
import { NotificacionesService } from '../services/notificaciones';
import { EmpleadoService } from '../services/empleados';
import { Empleado } from '../models/empleado';
import { urlDeImagen } from '../core/api.routes';
import { urlImagen } from '../utils/imagen-url';
import { FOTO_PLACEHOLDER } from '../utils/placeholder';

/**
 * Fila de la galería ya mapeada para la UI: `src` es la url absoluta
 * (resuelta con `urlDeImagen`), y `empleados` conserva la ficha del tatuador
 * tal como la manda el backend (solo presente si la respuesta la incluye).
 */
interface ImagenGaleria {
  id?: number;
  src: string;
  alt: string;
  titulo: string;
  estilo?: string | null;
  descripcion?: string | null;
  empleadoId: number;
  empleados?: FichaEmpleadoGaleria | null;
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

  // ── Estado reactivo ───────────────────────────────────────
  /** Grid de imágenes traídas del backend */
  readonly imagenes = signal<ImagenGaleria[]>([]);
  /** `true` mientras se está pidiendo la galería al backend */
  readonly cargando = signal(true);
  /** Mensaje de error de carga (cadena vacía = sin error) */
  readonly error = signal('');

  // ── Explorador con detalle (artboard design/ink-galeria/03) ──
  /** Pieza seleccionada que muestra el panel de detalle fijo */
  readonly seleccionada = signal<ImagenGaleria | null>(null);
  /** Filtro activo por estilo ('todos' = sin filtro) */
  readonly estiloFiltro = signal('todos');
  /** Búsqueda por título o autor (vacía = sin filtro) */
  readonly busqueda = signal('');

  /** Estilos distintos presentes en la galería, para los chips de filtro */
  readonly estilosDisponibles = computed(() => {
    const estilos = new Set<string>();
    for (const img of this.imagenes()) {
      const estilo = (img.estilo ?? '').trim();
      if (estilo) estilos.add(estilo);
    }
    return [...estilos];
  });

  /** Grilla visible = imágenes filtradas por estilo activo y búsqueda */
  readonly filtradas = computed(() => {
    const estilo = this.estiloFiltro();
    const texto = this.busqueda().trim().toLowerCase();
    return this.imagenes().filter((img) => {
      if (estilo !== 'todos' && (img.estilo ?? '').trim() !== estilo) return false;
      if (!texto) return true;
      const titulo = (img.titulo ?? img.alt).toLowerCase();
      const autor = this.nombreTatuador(img).toLowerCase();
      return titulo.includes(texto) || autor.includes(texto);
    });
  });

  // ── Visor ampliado ────────────────────────────────────────
  /** Imagen seleccionada para visualización ampliada */
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

  // ── Modal de subida ───────────────────────────────────────
  readonly mostrarModalSubida = signal(false);
  readonly archivoTemporal = signal<File | null>(null);
  readonly previewTemporal = signal('');
  readonly tatuadorSeleccionado = signal<number | null>(null);
  readonly nombreImagenTemp = signal('');
  /** Bloquea el modal mientras se sube el archivo y se registra la fila */
  readonly subiendo = signal(false);
  /** Error del proceso de subida mostrado dentro del modal */
  readonly errorSubida = signal('');

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

  /**
   * Pide las imágenes al backend y las mapea a la forma de la UI. Al cargar se
   * preselecciona la primera pieza para que el panel de detalle nunca arranque
   * vacío con galería poblada (si la pieza seleccionada ya no existe, se
   * selecciona la primera disponible).
   */
  cargarImagenes() {
    this.cargando.set(true);
    this.galeriaApi.obtenerTodos().subscribe({
      next: (datos) => {
        const mapeadas = datos.map(d => ({
          id: d.id,
          src: urlDeImagen(d.imagen_url),
          alt: d.titulo ?? 'Tatuaje',
          titulo: d.titulo ?? '',
          estilo: d.estilo ?? null,
          descripcion: d.descripcion ?? null,
          empleadoId: d.empleado_id ?? 0,
          empleados: d.empleados ?? null
        }));
        this.imagenes.set(mapeadas);
        this.cargando.set(false);
        this.error.set('');

        const actual = this.seleccionada();
        if (!actual || !mapeadas.some((i) => i.id !== undefined && i.id === actual.id)) {
          this.seleccionada.set(mapeadas[0] ?? null);
        }
      },
      error: (err) => {
        console.error('No se pudo cargar la galería desde la API:', err);
        this.imagenes.set([]);
        this.cargando.set(false);
        this.error.set('No se pudo conectar con el backend para cargar la galería.');
      }
    });
  }

  /** Nombre del tatuador autor; "Tatuador" si la imagen no tiene empleado */
  nombreTatuador(imagen: ImagenGaleria): string {
    const ficha = imagen.empleados?.usuarios;
    if (ficha) {
      return `${ficha.nombre ?? ''} ${ficha.apellido ?? ''}`.trim() || 'Tatuador';
    }
    const t = this.tatuadores().find(t => t.id === imagen.empleadoId);
    return t ? `${t.name} ${t.last_name}`.trim() : 'Tatuador';
  }

  /**
   * Ficha del tatuador autor para el panel de detalle: foto, especialidad y
   * biografía. SOLO se muestra cuando la respuesta del backend realmente
   * incluye la relación `empleados` con su usuario; en cualquier otro caso
   * devuelve null y el panel muestra solo el autor plano (degradación
   * elegante, sin fabricar datos).
   */
  datosTatuador(imagen: ImagenGaleria | null): {
    nombre: string;
    foto: string;
    especialidad?: string;
    biografia?: string;
    empleadoId: number;
  } | null {
    const ficha = imagen?.empleados;
    const u = ficha?.usuarios;
    if (!imagen?.empleadoId || !u) return null;
    return {
      nombre: `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim(),
      // Sin foto de perfil se usa el placeholder, igual que en el resto de la app
      foto: u.foto_perfil_url ? urlImagen(u.foto_perfil_url) : FOTO_PLACEHOLDER,
      especialidad: ficha?.especialidad ?? undefined,
      biografia: ficha?.biografia ?? undefined,
      empleadoId: imagen.empleadoId
    };
  }

  /** Abre el visor ampliado con la url ya resuelta de la imagen */
  openImage(src: string) {
    this.selectedImage.set(src);
  }

  /** Cierra el visor ampliado (null = sin selección) */
  closeImage() {
    this.selectedImage.set(null);
  }

  /** Selecciona una pieza para el panel de detalle */
  seleccionarPieza(imagen: ImagenGaleria): void {
    this.seleccionada.set(imagen);
  }

  /** Navega a la agenda para pedir una cita (CTA del panel de detalle) */
  pedirCita(): void {
    this.router.navigate(['/schedule']);
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
    this.errorSubida.set('');

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

    this.subiendo.set(true);
    this.errorSubida.set('');

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
          this.subiendo.set(false);
          this.cargarImagenes();
          this.cerrarModalSubida();
        },
        error: (err) => {
          console.error('No se pudo subir la imagen:', err);
          this.subiendo.set(false);
          this.errorSubida.set('No se pudo subir la imagen. Revisa tu sesión e intenta de nuevo.');
          this.notificaciones.error('No se pudo subir la imagen. Revisa tu sesión e intenta de nuevo.');
        },
      });
  }

  cerrarModalSubida() {
    this.mostrarModalSubida.set(false);
    this.archivoTemporal.set(null);
    this.previewTemporal.set('');
    this.nombreImagenTemp.set('');
    this.errorSubida.set('');
  }

  /**
   * Elimina una imagen de la galería previa confirmación (modal propio del
   * proyecto). `stopPropagation` evita que el clic llegue a la tarjeta y abra
   * el visor. El backend borra la fila Y el binario. Si la pieza eliminada
   * estaba en el panel de detalle, se pasa a la primera disponible.
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
        if (this.seleccionada()?.id === img.id) {
          this.seleccionada.set(this.imagenes()[0] ?? null);
        }
      },
      error: (err) => {
        console.error('No se pudo eliminar la imagen:', err);
        this.notificaciones.error('No se pudo eliminar la imagen.');
      },
    });
  }
}
