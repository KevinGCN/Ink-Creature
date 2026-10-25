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
 *
 * Flujo de subida (son DOS pasos, el backend no lo hace en una sola llamada):
 *   1) POST /api/galeria/upload con el campo multipart `imagen` → el backend
 *      guarda el binario en la base de datos y devuelve la url RELATIVA
 *      "/api/imagenes/<id>" (no una URL absoluta, para que las filas sigan
 *      siendo válidas en cualquier host).
 *   2) POST /api/galeria con esa url + título + tatuador → crea la fila de la
 *      galería que la hace aparecer en el grid.
 * La ruta relativa se resuelve al pintar con `urlImagen()`, que le antepone
 * el host del backend.
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
/**
 * Llevan ids negativos (-1, -2, ...) para que nunca choquen con los ids de la
 * base de datos y para poder reconocerlas con `esImagenDeBase()`. Al no tener
 * fila en la BD, la UI bloquea su borrado.
 */
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
  /** Navegación al CV del tatuador que subió la imagen */
  private readonly router = inject(Router);
  /** Sesión actual: decide si se muestran los controles de subida/borrado */
  private readonly auth = inject(AuthService);
  /** Galería del backend: listar, subir archivo, registrar y eliminar */
  private readonly galeriaService = inject(GaleriaService);
  /** Tatuadores para el <select> del modal de subida */
  private readonly empleadosService = inject(EmpleadoService);

  // ── Estado reactivo ───────────────────────────────────────
  /** Solo las imágenes que vienen del backend (privado: se une con las base) */
  private readonly imagenesDb = signal<ImagenGaleria[]>([]);
  /** Grid final = imágenes base + las de la base de datos */
  readonly imagenes = computed(() => [...IMAGENES_BASE, ...this.imagenesDb()]);
  /** `true` mientras se está pidiendo la galería al backend */
  readonly cargando = signal(true);
  /** Mensaje de error de carga (cadena vacía = sin error) */
  readonly error = signal('');

  /** Usuario reactivo y permisos administrativos derivados del rol */
  readonly esAdmin = computed(() => this.auth.esAdmin());

  /** Imagen seleccionada para visualización ampliada */
  readonly selectedImage = signal<string | null>(null);

  /** Tatuadores (empleados activos) para el selector de subida */
  readonly tatuadores = signal<Empleado[]>([]);

  // ── Modal de subida ───────────────────────────────────────
  /** Visibilidad del modal que confirma título y tatuador antes de subir */
  readonly mostrarModalSubida = signal(false);
  /** Archivo elegido (aún no subido); se envía al confirmar */
  readonly archivoTemporal = signal<File | null>(null);
  /** Object URL de la vista previa local del archivo elegido */
  readonly previewTemporal = signal('');
  /** Tatuador al que se atribuye la imagen (empleado_id) */
  readonly tatuadorSeleccionado = signal<number | null>(null);
  /** Título propuesto, precargado con el nombre del archivo sin extensión */
  readonly nombreImagenTemp = signal('');
  /** Bloquea el modal mientras se sube el archivo y se registra la fila */
  readonly subiendo = signal(false);
  /** Error del proceso de subida mostrado dentro del modal */
  readonly errorSubida = signal('');

  /** Placeholder inline usado por las imágenes base al fallar la carga */
  readonly placeholder = FOTO_PLACEHOLDER;

  /**
   * Carga inicial: la galería del backend y los tatuadores activos para el
   * selector del modal (sin ellos no se podría atribuir la imagen).
   */
  ngOnInit(): void {
    this.cargarImagenes();
    this.cargarTatuadores();
  }

  /**
   * Pide las imágenes al backend. Solo llena `imagenesDb`: el grid completo lo
   * compone el computed `imagenes`, que concatena las base con estas.
   */
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

  /**
   * Trae los tatuadores y se queda solo con los activos, porque una imagen no
   * debe atribuirse a alguien dado de baja. Si aún no hay ninguno elegido se
   * preselecciona el primero para no obligar a un clic extra.
   */
  private cargarTatuadores(): void {
    this.empleadosService.getEmpleados().subscribe({
      next: (empleados) => {
        // Solo los activos: el backend devuelve también los inactivos
        const activos = empleados.filter((e) => e.activo);
        this.tatuadores.set(activos);
        if (activos.length > 0 && this.tatuadorSeleccionado() === null) {
          this.tatuadorSeleccionado.set(activos[0].id);
        }
      },
      error: (err) => console.error('Error cargando tatuadores:', err)
    });
  }

  /** Nombre del tatuador autor; "Tatuador" si la imagen no tiene empleado */
  nombreTatuador(imagen: ImagenGaleria): string {
    const u = imagen.empleados?.usuarios;
    return u ? `${u.nombre} ${u.apellido}`.trim() : 'Tatuador';
  }

  /**
   * Las imágenes base se identifican por su id negativo (no existen en la BD),
   * y esa marca es la que impide borrarlas desde la UI.
   */
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

  /** Abre el visor ampliado con la url ya resuelta de la imagen */
  openImage(src: string): void {
    this.selectedImage.set(src);
  }

  /** Cierra el visor ampliado (null = sin selección) */
  closeImage(): void {
    this.selectedImage.set(null);
  }

  /**
   * Navega al CV del tatuador. `event.stopPropagation()` evita que el clic
   * burbujee hasta la tarjeta y abra también el visor de la imagen.
   */
  verTatuador(empleadoId: number | null, event: Event): void {
    event.stopPropagation();
    if (empleadoId) {
      this.router.navigate(['/employeeCV', empleadoId]);
    }
  }

  /** Sustituye una imagen rota por el placeholder (evita el icono de error) */
  handleImageError(event: Event): void {
    // Fallback inline (no depende de un archivo placeholder en disco)
    (event.target as HTMLImageElement).src = FOTO_PLACEHOLDER;
  }

  // ── Paso 1: archivo seleccionado → abrir modal ────────────
  /**
   * Guarda el archivo en memoria (no lo sube todavía) y abre el modal para
   * pedir el título y el tatuador. La vista previa usa `createObjectURL`, así
   * que la imagen se ve al instante sin subir nada aún.
   */
  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Se guarda el archivo y se propone el título con su nombre sin extensión
    this.archivoTemporal.set(file);
    this.nombreImagenTemp.set(file.name.replace(/\.[^.]+$/, ''));
    this.errorSubida.set('');
    this.previewTemporal.set(URL.createObjectURL(file));
    this.mostrarModalSubida.set(true);

    // Limpiar input para permitir resubir el mismo archivo
    input.value = '';
  }

  // ── Paso 2: confirmar → subir al backend y registrar ──────
  /**
   * Subida en dos llamadas encadenadas: primero el binario
   * (POST /api/galeria/upload, campo `imagen`) y después la fila de la
   * galería (POST /api/galeria) usando la url que devolvió la primera.
   * Si la primera falla no se registra nada; si falla la segunda el archivo
   * queda huérfano en la BD, pero el grid no muestra entradas a medias.
   */
  confirmarSubida(): void {
    const file = this.archivoTemporal();
    // Sin sesión no hay `subido_por`, y sin archivo no hay nada que subir
    const usuario = this.auth.obtenerUsuario();

    if (!file || !usuario) return;

    this.subiendo.set(true);
    this.errorSubida.set('');

    // 1) Subir el archivo a /uploads
    //    (comentario histórico: hoy el backend NO escribe en disco, guarda el
    //    binario en `proyecto7.imagenes` y devuelve "/api/imagenes/<id>")
    this.galeriaService.subirArchivo(file).subscribe({
      next: (url) => {
        // 2) Registrar el registro en la galería
        //    `url` es RELATIVA a propósito: mantenerla así permite cambiar de
        //    host sin reescribir filas; `urlImagen()` la resuelve al pintar.
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

  /**
   * Cierra el modal y limpia el estado temporal (archivo, vista previa,
   * título y error) para que la siguiente subida empiece en blanco.
   */
  cerrarModalSubida(): void {
    this.mostrarModalSubida.set(false);
    this.archivoTemporal.set(null);
    this.previewTemporal.set('');
    this.nombreImagenTemp.set('');
    this.errorSubida.set('');
  }

  // ── Eliminar (solo imágenes del backend) ──────────────────
  /**
   * Elimina una imagen de la galería. `stopPropagation` evita que el clic
   * llegue a la tarjeta y abra el visor. Las imágenes base no se borran porque
   * no existen en la BD. El backend borra la fila Y el binario.
   */
  eliminarImagen(imagen: ImagenGaleria, event: Event): void {
    event.stopPropagation();

    // Las base son assets del frontend: no hay nada que borrar en el backend
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

  /**
   * Traduce el 401 (sesión vencida) a un mensaje entendible; cualquier otro
   * estado cae en el texto por defecto de la operación que falló.
   */
  private mensajeDeError(err: HttpErrorResponse, porDefecto: string): string {
    if (err.status === 401) return 'Tu sesión expiró. Cierra sesión y vuelve a entrar.';
    return porDefecto;
  }
}
