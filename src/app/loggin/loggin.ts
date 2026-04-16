import { Component, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-loggin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loggin.html',
  styleUrls: ['./loggin.css'],
  providers: [AuthService],
})
export class Loggin {

  modoRegistro = false;

  @Output() cerrar = new EventEmitter<void>();

  nombre = '';
  correo = '';
  password = '';
  mensajeError = '';

  constructor(@Inject(AuthService) private auth: AuthService) {}

  cerrarModal() {
    this.cerrar.emit();
  }

  irARegistro() {
    this.modoRegistro = true;
  }

  irALogin() {
    this.modoRegistro = false;
  }

  iniciarSesion() {
    this.mensajeError = '';
    const ok = this.auth.login(this.correo, this.password);

    if (ok) {
      alert('Login exitoso');
      this.cerrarModal();
    } else {
      this.mensajeError = 'Correo o contraseña incorrectos';
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
    });

    alert('Registrado correctamente');
    this.cerrarModal();
  }
}