import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';

declare const google: any;

@Component({
  selector: 'app-loggin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loggin.html',
  styleUrls: ['./loggin.css'], 
})
export class Loggin implements AfterViewInit {

  modoRegistro = false;

  @Output() cerrar = new EventEmitter<void>();

  nombre = '';
  correo = '';
  password = '';
  mensajeError = '';

  constructor(private auth: AuthService) {}

  cerrarModal() {
    this.cerrar.emit();
  }

  irARegistro() {
    this.modoRegistro = true;
    setTimeout(() => this.renderGoogle(), 100);
  }

  irALogin() {
    this.modoRegistro = false;
    setTimeout(() => this.renderGoogle(), 100);
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

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && typeof google !== 'undefined') {
      this.initGoogle();
      this.renderGoogle();
    }
  }

  initGoogle() {
    google.accounts.id.initialize({
      client_id: "TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com",
      callback: (res: any) => console.log(res)
    });
  }

  renderGoogle() {
    if (typeof window !== 'undefined' && typeof google !== 'undefined') {
      const loginBtn = document.getElementById("googleLogin");
      if (loginBtn) {
        loginBtn.innerHTML = '';
        google.accounts.id.renderButton(loginBtn, {
          theme: "outline",
          size: "large",
          width: 250
        });
      }

      const registerBtn = document.getElementById("googleRegister");
      if (registerBtn) {
        registerBtn.innerHTML = '';
        google.accounts.id.renderButton(registerBtn, {
          theme: "outline",
          size: "large",
          width: 250
        });
      }
    }
  }
}