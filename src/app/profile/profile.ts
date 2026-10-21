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

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  usuario: Usuario | null = null;
  citas = signal<Cita[]>([]);
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

  ngOnInit() {
    this.usuario = this.auth.obtenerUsuario();
    this.cargarCitas();
    this.cargarFoto();
    this.limpiarFotosLocales();
  }

  // =========================
  // CITAS
  // =========================
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

    if (!FOTO_TIPOS.test(file.type)) {
      this.mensajeError = 'La foto debe ser una imagen JPG, PNG o WEBP';
      return;
    }
    if (!this.validarTamanoArchivo(file, 2)) return;

    const usuario = this.usuario;
    if (!usuario) return;

    this.subiendoFoto = true;
    this.mensajeError = '';

    this.usuarioService.subirFoto(usuario.id, file).subscribe({
      next: (actualizado) => {
        this.subiendoFoto = false;
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
  activarEdicion() {
    this.editando = true;
    this.mensajeExito = '';
  }

  cancelarEdicion() {
    this.editando = false;
    this.usuario = this.auth.obtenerUsuario(); // restaurar datos originales
    this.mensajeError = '';
  }

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
  irAgenda() {
    this.router.navigate(['/schedule']);
  }

  irResenas() {
    this.router.navigate(['/']);
  }

  editarCita(cita: Cita) {
    this.router.navigate(['/schedule'], { state: { citaEditar: cita } });
  }
}
