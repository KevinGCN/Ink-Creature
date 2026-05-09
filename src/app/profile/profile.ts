import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
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

  // Mensaje de error para validaciones
  mensajeError = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private citaService: CitaService
  ) {}

  ngOnInit() {
    this.usuario = this.auth.obtenerUsuario();
    this.cargarCitas();
    this.cargarFoto();
  }

  // =========================
  // CITAS
  // =========================
  cargarCitas() {
    this.citas = this.citaService.getCitas();
  }

  eliminar(id: number) {
    this.citaService.eliminarCita(id);
    this.cargarCitas();
  }

  // =========================
  // FOTO DE PERFIL
  // =========================
  cargarFoto() {
    const usuario = this.auth.obtenerUsuario();
    const uid = usuario?.uid;
    if (uid) {
      this.foto = localStorage.getItem('fotoPerfil_' + uid) || '';
    } else {
      this.foto = '';
    }
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
      const uid = this.auth.getAuthUser()?.uid || this.usuario?.uid;
      if (uid) {
        localStorage.setItem('fotoPerfil_' + uid, this.foto);
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
  }

  cancelarEdicion() {
    this.editando = false;
    this.usuario = this.auth.obtenerUsuario(); // restaurar datos originales
  }

  guardarCambios() {
    // Validación básica
    if (!this.usuario.nombre || !this.usuario.email) {
      this.mensajeError = 'Nombre y correo son obligatorios';
      return;
    }

    this.auth.actualizarUsuario(this.usuario);
    this.editando = false;
    this.mensajeError = '';
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
