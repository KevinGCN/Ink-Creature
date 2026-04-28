import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-loggin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loggin.html',
  styleUrls: ['./loggin.css']
})
export class Loggin {

  modoRegistro = false;

  @Output() cerrar = new EventEmitter<void>();

  nombre = '';
  correo = '';
  password = '';
  mensajeError = '';
  cargandoGoogle = false;

  constructor(private auth: AuthService) {}

  cerrarModal() {
    this.cerrar.emit();
  }

  irARegistro() {
    this.modoRegistro = true;
  }

  irALogin() {
    this.modoRegistro = false;
  }

  async iniciarSesion() {
    this.mensajeError = '';
    const ok = await this.auth.login(this.correo, this.password);

    if (ok) {
      alert('Login exitoso');
      this.cerrarModal();
    } else {
      this.mensajeError = 'Correo o contraseña incorrectos';
    }
  }

  async recuperarContrasena() {
    if (!this.correo) {
      alert('Por favor ingresa tu correo electrónico');
      return;
    }

    const ok = await this.auth.enviarRecuperacionContrasena(this.correo);
    if (ok) {
      alert('Se ha enviado un correo de recuperación a ' + this.correo);
    } else {
      alert('Error al enviar el correo de recuperación');
    }
  }

  registrarse() {
    this.mensajeError = '';

    if (!this.nombre || !this.correo || !this.password) {
      this.mensajeError = 'Todos los campos son obligatorios';
      return;
    }

    if (this.password.length < 8) {
      this.mensajeError = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    this.auth.registrar({
      nombre: this.nombre,
      correo: this.correo,
      password: this.password
    }).then(() => {
      alert('Registrado correctamente');
      this.cerrarModal();
    }).catch((error: any) => {
      this.mensajeError = 'Error al registrar: ' + error.message;
    });
  }

  async loginConGoogle() {
    this.mensajeError = '';
    this.cargandoGoogle = true;

    try {
      const ok = await this.auth.loginConGoogle();
      if (ok) {
        alert('Login con Google exitoso');
        this.cerrarModal();
      } else {
        this.mensajeError = 'Error al iniciar con Google';
      }
    } catch (error: any) {
      this.mensajeError = 'Error: ' + error.message;
    } finally {
      this.cargandoGoogle = false;
    }
  }
}
