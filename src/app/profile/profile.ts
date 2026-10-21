/**
 * Perfil de usuario — consume el backend NestJS.
 *
 * - Datos del usuario: estado real del AuthService (GET /api/auth/me).
 * - Edición de perfil: PATCH /api/usuarios/:id (vía auth.actualizarPerfil).
 * - Mis citas: GET /api/citas?usuario_id=…
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { Cita, CitaService } from '../services/citas';
import { Usuario } from '../models/usuario';
import { a12h, aFechaLegible } from '../utils/fechas';

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

  // Control de edición
  editando = false;

  // Mensajes para el usuario
  mensajeError = '';
  mensajeExito = '';

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly citaService = inject(CitaService);

  ngOnInit() {
    this.usuario = this.auth.obtenerUsuario();
    this.cargarCitas();
    this.cargarFoto();
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
  cargarFoto() {
    if (this.usuario?.foto_perfil_url) {
      this.foto = this.usuario.foto_perfil_url;
      return;
    }
    this.foto = this.usuario ? localStorage.getItem('fotoPerfil_' + this.usuario.id) || '' : '';
  }

  cambiarFoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamaño antes de cargar
    if (!this.validarTamanoArchivo(file, 2)) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.foto = reader.result as string;
      if (this.usuario) {
        localStorage.setItem('fotoPerfil_' + this.usuario.id, this.foto);
      }
    };

    reader.readAsDataURL(file);
    event.target.value = ''; // Resetea el input para evitar doble explorador
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
