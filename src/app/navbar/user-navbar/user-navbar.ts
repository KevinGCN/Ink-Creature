import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loggin } from '../../loggin/loggin';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router';
import { Profile } from '../../profile/profile';
@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, Loggin, Profile],
  templateUrl: './user-navbar.html',
  styleUrls: ['./user-navbar.css']
})
export class UserNavbar {
  mostrarLogin = false;
  mostrarPerfil = false;
  mostrarAjustes = false;

  constructor(public auth: AuthService) {}

  abrirLogin() {
    this.mostrarLogin = true;
  }

  cerrarLogin() {
    this.mostrarLogin = false;
  }

  abrirPerfil() {
    this.mostrarPerfil = true;
    this.mostrarAjustes = false;
  }

  cerrarPerfil() {
    this.mostrarPerfil = false;
  }

  toggleAjustes() {
    this.mostrarAjustes = !this.mostrarAjustes;
  }

  logout() {
    this.auth.logout();

   
    this.mostrarAjustes = false;
    this.mostrarPerfil = false;
    this.mostrarLogin = false;
  }
}
