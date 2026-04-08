import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loggin } from '../../loggin/loggin';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [CommonModule, Loggin, RouterLink],
  templateUrl: './user-navbar.html',
  styleUrls: ['./user-navbar.css']
})
export class UserNavbar {
  mostrarLogin = false;

  constructor(public auth: AuthService) {}
  abrirLogin() {
    this.mostrarLogin = true;
  }
  cerrarLogin() {
    this.mostrarLogin = false;
  }

  logueado = false;
  login() {
    const accesoValido = true;
    if (accesoValido){
      this.logueado = true;
    }else {
      alert('Credenciales Invalidas');
    }
  }
}
