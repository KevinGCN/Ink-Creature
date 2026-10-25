/**
 * Perfil de usuario — consume el backend NestJS.
 *
 * - Datos del usuario: estado real del AuthService (GET /api/auth/me).
 * - Edición de perfil: PATCH /api/usuarios/:id (vía auth.actualizarPerfil).
 * - Foto de perfil: POST /api/usuarios/:id/foto (multipart). El backend
 *   guarda el archivo en la base de datos y devuelve el usuario con
 *   `foto_perfil_url` = "/api/imagenes/<id>".
 * - Mis citas: GET /api/citas?usuario_id=…
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { Cita, CitaService } from '../services/citas';
import { UsuarioService } from '../services/usuarios';
import { Usuario } from '../models/usuario';
import { a12h, aFechaLegible } from '../utils/fechas';
import { urlImagen } from '../utils/imagen-url';

/** Tamaño máximo de la foto de perfil (2 MB). */
const FOTO_MAX_BYTES = 2 * 1024 * 1024;
const FOTO_TIPOS = /^image\/(jpeg|png|webp)$/;

/**
 * Pantalla de perfil del usuario autenticado.
 *
 * Flujo:
 * 1. `ngOnInit` toma el usuario ya restaurado por `AuthService` (que a su vez
 *    lo valida contra `GET /api/auth/me`) y pinta sus datos.
 * 2. Carga sus citas con `GET /api/citas?usuario_id=…` y permite editarlas
 *    (navegando a la agenda con `state.citaEditar`) o eliminarlas.
 * 3. La foto se sube con `POST /api/usuarios/:id/foto`; el backend la guarda
 *    en `proyecto7.imagenes` y devuelve `foto_perfil_url` relativa, que el
 *    template resuelve con `urlImagen()`.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  /** Copia local del usuario; se rellena desde el AuthService en ngOnInit */
  usuario: Usuario | null = null;
  /** Citas del usuario, en un signal para que el template reaccione solo */
  citas = signal<Cita[]>([]);
  /** URL final (absoluta) de la foto, ya resuelta para el `<img>` */
  foto = '';

  /** true mientras se sube la foto de perfil al backend */
  subiendoFoto = false;

  // Control de edición
  editando = false;

  // Mensajes para el usuario
  mensajeError = '';
  mensajeExito = '';

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly citaService = inject(CitaService);
  private readonly usuarioService = inject(UsuarioService);

  /**
   * Carga la sesión que el AuthService mantiene en memoria y dispara las
   * tres tareas de la pantalla: citas, foto y limpieza de fotos antiguas.
   */
  ngOnInit() {
    this.usuario = this.auth.obtenerUsuario();
    this.cargarCitas();
    this.cargarFoto();
    // Las fotos viejas en base64 viven solo en este navegador: se borran.
    this.limpiarFotosLocales();
  }

  // =========================
  // CITAS
  // =========================
  /**
   * Citas del usuario. Se filtra por `usuario.id` en el backend, así que la
   * respuesta ya viene acotada. Un 401 no muestra error porque el
   * interceptor ya limpia la sesión y redirige.
   */
  cargarCitas() {
    if (!this.usuario) return;

    this.citaService.getCitasDeUsuario(this.usuario.id).subscribe({
      next: (citas) => this.citas.set(citas),
      error: (err: HttpErrorResponse) => {
        console.error('Error cargando citas:', err);
        if (err.status !== 401) {
          this.mensajeError = 'No se pudieron cargar tus citas.';
        }
      }
    });
  }

  /**
   * Borra una cita (DELETE /api/citas/:id) previa confirmación y recarga la
   * lista; el backend también libera la franja horaria al eliminarla.
   */
  eliminar(id: number) {
    if (!confirm('¿Eliminar esta cita?')) return;

    this.citaService.eliminarCita(id).subscribe({
      next: () => this.cargarCitas(),
      error: (err: HttpErrorResponse) => {
        console.error('Error eliminando cita:', err);
        this.mensajeError =
          err.status === 401
            ? 'Tu sesión expiró. Cierra sesión y vuelve a entrar.'
            : 'No se pudo eliminar la cita.';
      }
    });
  }

  // Helpers para el template
  mostrarFecha(iso: string): string {
    return aFechaLegible(iso);
  }

  mostrarHora(hora: string): string {
    return a12h(hora);
  }

  nombreDeCita(cita: Cita): string {
    const u = cita.empleados?.usuarios;
    return u ? `${u.nombre} ${u.apellido}`.trim() : `Empleado #${cita.empleado_id}`;
  }

  // =========================
  // FOTO DE PERFIL
  // =========================
  /**
   * La foto vive en el backend (tabla `imagenes`). Se resuelve la ruta
   * relativa "/api/imagenes/<id>" contra el origen del API.
   */
  cargarFoto() {
    this.foto = urlImagen(this.usuario?.foto_perfil_url);
  }

  /**
   * Sube la foto de perfil al backend, que la guarda en la base de datos.
   * Antes se guardaba en base64 dentro del localStorage (solo en ese
   * navegador); esas fotos antiguas se limpian al cargar el perfil.
   */
  cambiarFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;

    // Validación en el cliente: mismos tipos y tamaño que acepta el backend.
    if (!FOTO_TIPOS.test(file.type)) {
      this.mensajeError = 'La foto debe ser una imagen JPG, PNG o WEBP';
      return;
    }
    if (!this.validarTamanoArchivo(file, 2)) return;

    // Se guarda una referencia porque `this.usuario` cambia al terminar.
    const usuario = this.usuario;
    if (!usuario) return;

    this.subiendoFoto = true;
    this.mensajeError = '';

    // multipart/form-data con el campo `imagen`; el backend responde con el
    // usuario actualizado (incluida la nueva `foto_perfil_url`).
    this.usuarioService.subirFoto(usuario.id, file).subscribe({
      next: (actualizado) => {
        this.subiendoFoto = false;
        // Se propaga al AuthService para que navbar/otros componentes
        // muestren la foto nueva sin recargar la página.
        this.auth.actualizarUsuario(actualizado);
        this.usuario = actualizado;
        this.cargarFoto();
        this.mensajeExito = 'Foto de perfil actualizada';
        setTimeout(() => (this.mensajeExito = ''), 3000);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error subiendo la foto:', err);
        this.subiendoFoto = false;
        this.mensajeError =
          err.status === 401
            ? 'Tu sesión expiró. Cierra sesión y vuelve a entrar.'
            : 'No se pudo subir la foto. Intenta nuevamente.';
      },
    });
  }

  /**
   * Limpia las fotos en base64 que la versión anterior guardaba en el
   * localStorage: ya no se usan (ahora viven en la base de datos).
   */
  private limpiarFotosLocales() {
    try {
      // Las claves seguían el patrón `fotoPerfil_<id>` con un data URL base64.
      const claves = Object.keys(localStorage).filter((k) => k.startsWith('fotoPerfil_'));
      claves.forEach((k) => localStorage.removeItem(k));
      if (claves.length) {
        console.info(`Se limpiaron ${claves.length} foto(s) antigua(s) del localStorage.`);
      }
    } catch {
      // localStorage puede estar bloqueado: no es crítico.
    }
  }

  // =========================
  // VALIDACIÓN DE TAMAÑO
  // =========================
  /**
   * Valida el peso del archivo antes de enviarlo, para no gastar ancho de
   * banda ni provocar un 413 del backend. Devuelve false si lo supera.
   */
  validarTamanoArchivo(file: File, maxMB: number = 2): boolean {
    const maxBytes = maxMB * 1024 * 1024;

    if (file.size > maxBytes) {
      this.mensajeError = `El archivo supera ${maxMB} MB`;
      return false;
    }

    this.mensajeError = '';
    return true;
  }

  // =========================
  // EDICIÓN DE USUARIO
  // =========================
  /** Pasa el formulario a modo edición (los inputs se habilitan) */
  activarEdicion() {
    this.editando = true;
    this.mensajeExito = '';
  }

  /**
   * Cancela la edición y descarta los cambios: se vuelve a leer el usuario
   * del AuthService, que conserva la última versión confirmada por el backend.
   */
  cancelarEdicion() {
    this.editando = false;
    this.usuario = this.auth.obtenerUsuario(); // restaurar datos originales
    this.mensajeError = '';
  }

  /**
   * Persiste los datos editados con `PATCH /api/usuarios/:id` (lo hace
   * `AuthService.actualizarPerfil`) y refresca la copia local con la
   * respuesta del servidor, no con lo que había en el formulario.
   */
  async guardarCambios() {
    if (!this.usuario?.nombre || !this.usuario?.apellido) {
      this.mensajeError = 'Nombre y apellido son obligatorios';
      return;
    }

    const ok = await this.auth.actualizarPerfil({
      nombre: this.usuario.nombre,
      apellido: this.usuario.apellido,
      telefono: this.usuario.telefono ?? ''
    });

    if (ok) {
      this.usuario = this.auth.obtenerUsuario();
      this.editando = false;
      this.mensajeError = '';
      this.mensajeExito = 'Perfil actualizado correctamente';
      setTimeout(() => (this.mensajeExito = ''), 3000);
    } else {
      this.mensajeError =
        'No se pudo actualizar el perfil. Verifica tu sesión e intenta nuevamente.';
    }
  }

  // =========================
  // NAVEGACIÓN
  // =========================
  /** Navega a la agenda para reservar una cita nueva */
  irAgenda() {
    this.router.navigate(['/schedule']);
  }

  /** Las reseñas aún no tienen pantalla propia: se vuelve al inicio */
  irResenas() {
    this.router.navigate(['/']);
  }

  /**
   * Abre la agenda en modo edición pasando la cita por `state` (no por URL,
   * porque la cita es un objeto y no debe quedar visible en el historial).
   */
  editarCita(cita: Cita) {
    this.router.navigate(['/schedule'], { state: { citaEditar: cita } });
  }
}
