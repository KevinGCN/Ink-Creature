import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare const google: any;

@Component({
  selector: 'app-loggin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loggin.html',
  styleUrls: ['./loggin.css'], 
})
export class Loggin {

  modoRegistro = false;

  @Output() cerrar = new EventEmitter<void>();

  nombre: string = '';
  correo: string = '';
  password: string = '';
  mensajeError: string = '';

  
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

    if (!this.correo || !this.password) {
      this.mensajeError = 'Todos los campos son obligatorios';
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValido.test(this.correo)) {
      this.mensajeError = 'Correo inválido';
      return;
    }

    if (this.password.length < 8) {
      this.mensajeError = 'La contraseña debe tener mínimo 8 caracteres';
      return;
    }

    console.log('Login correcto');
  }

  
  registrarse() {
    this.mensajeError = '';

    if (!this.nombre || !this.correo || !this.password) {
      this.mensajeError = 'Todos los campos son obligatorios';
      return;
    }

    const passwordValida = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordValida.test(this.password)) {
      this.mensajeError =
        'Debe tener 8 caracteres, mayúscula, número y símbolo';
      return;
    }

    console.log('Registro correcto');
  }

ngAfterViewInit(): void {
  if (typeof window !== 'undefined' && typeof google !== 'undefined') {

    google.accounts.id.initialize({
      client_id: "TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com",
      callback: (response: any) => {
        console.log("Usuario autenticado:", response);
      }
    });

    google.accounts.id.renderButton(
      document.getElementById("googleLogin"),
      { theme: "outline", size: "large", width: 250 }
    );

    google.accounts.id.renderButton(
      document.getElementById("googleRegister"),
      { theme: "outline", size: "large", width: 250 }
    );
  }
}
renderGoogle() {
  if (typeof window !== 'undefined' && typeof google !== 'undefined') {

    google.accounts.id.initialize({
      client_id: "TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com",
      callback: (response: any) => {
        console.log("Usuario autenticado:", response);
      }
    });

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