import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, DatosPerfil } from '../services/auth';
import { CitaService } from '../services/citas';
import { Cita } from '../models/cita';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  usuario: any = {};
  citas: Cita[] = [];
  foto: string = '';

  // Control de edición
  editando = false;
  guardando = false;
  subiendoFoto = false;
  formulario: DatosPerfil = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
  };

  // Mensajes para el usuario
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private citaService: CitaService
  ) {}

  ngOnInit() {
    this.usuario = this.auth.obtenerUsuario();
    this.prepararFormulario();
    this.cargarCitas();
    this.cargarFoto();
  }

  // =========================
  // CITAS
  // =========================
  cargarCitas() {
    const usuarioId = this.usuario?.id ?? this.usuario?.uid;

    if (!usuarioId) {
      this.citas = [];
      return;
    }

    this.citaService.obtenerCitas(usuarioId).subscribe({
      next: citas => {
        this.citas = citas;
      },
      error: (error: HttpErrorResponse) => {
        this.mensajeError = this.mensajeDeError(
          error,
          'No se pudieron cargar tus citas.'
        );
      }
    });
  }

  eliminar(id: number) {
    if (!window.confirm('¿Seguro que quieres eliminar esta cita?')) {
      return;
    }

    this.citaService.eliminar(id).subscribe({
      next: () => {
        this.mensajeExito = 'Cita eliminada.';
        this.mensajeError = '';
        this.cargarCitas();
      },
      error: (error: HttpErrorResponse) => {
        this.mensajeExito = '';
        this.mensajeError = this.mensajeDeError(
          error,
          'No se pudo eliminar la cita.'
        );
      }
    });
  }

  // =========================
  // FOTO DE PERFIL
  // =========================
  cargarFoto() {
    this.foto =
      this.usuario?.foto_perfil_url ||
      this.usuario?.photoURL ||
      '';
  }

  cambiarFoto(event: any) {
    const file = event.target.files[0] as File | undefined;
    event.target.value = '';

    if (!file) return;
    if (!this.validarTamanoArchivo(file, 2)) return;

    this.subiendoFoto = true;
    this.mensajeError = '';

    this.auth.subirFotoPerfil(file).subscribe({
      next: (usuario) => {
        this.subiendoFoto = false;
        this.usuario = usuario;
        this.cargarFoto();
        this.mensajeExito = 'Foto de perfil actualizada.';
      },
      error: (error: HttpErrorResponse) => {
        this.subiendoFoto = false;
        this.mensajeExito = '';
        this.mensajeError = this.mensajeDeError(
          error,
          'No se pudo subir la foto.'
        );
      }
    });
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
    this.prepararFormulario();
    this.editando = true;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  cancelarEdicion() {
    this.editando = false;
    this.formulario = {};
    this.prepararFormulario();
    this.mensajeError = '';
  }

  guardarCambios() {
    const nombre = (this.formulario.nombre || '').trim();
    const apellido = (this.formulario.apellido || '').trim();
    const email = (this.formulario.email || '').trim();
    const telefono = (this.formulario.telefono || '').trim();

    if (!nombre || !apellido) {
      this.mensajeError = 'Nombre y apellido son obligatorios';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.mensajeError = 'Escribe un correo válido';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';

    this.auth.actualizarPerfil({ nombre, apellido, email, telefono }).subscribe({
      next: (usuario) => {
        this.guardando = false;
        this.usuario = usuario;
        this.prepararFormulario();
        this.editando = false;
        this.mensajeExito = 'Perfil actualizado.';
      },
      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mensajeExito = '';
        this.mensajeError = this.mensajeDeError(
          error,
          'No se pudo guardar el perfil.'
        );
      }
    });
  }

  private prepararFormulario() {
    this.formulario = {
      nombre: this.usuario?.nombre || '',
      apellido: this.usuario?.apellido || '',
      email: this.usuario?.email || '',
      telefono: this.usuario?.telefono || '',
    };
  }

  private mensajeDeError(error: HttpErrorResponse, porDefecto: string): string {
    if (error.status === 401) {
      return 'Tu sesión venció. Inicia sesión de nuevo.';
    }
    if (error.status === 403) {
      return 'No tienes permiso para esta acción.';
    }
    if (error.status === 409) {
      return 'Ese correo ya está registrado.';
    }
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }

    const mensaje = error.error?.message;
    return Array.isArray(mensaje) ? mensaje.join(' ') : mensaje || porDefecto;
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
