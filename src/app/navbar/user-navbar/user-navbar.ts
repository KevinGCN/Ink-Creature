import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Loggin } from '../../loggin/loggin';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [CommonModule, Loggin],
  templateUrl: './user-navbar.html',
  styleUrls: ['./user-navbar.css']
})
export class UserNavbar {
  mostrarLogin = false;
  mostrarAjustes = false;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  abrirLogin() {
    this.mostrarLogin = true;
  }

  cerrarLogin() {
    this.mostrarLogin = false;
  }

  toggleAjustes() {
    this.mostrarAjustes = !this.mostrarAjustes;
  }

  irPerfil() {
    this.mostrarAjustes = false; // cerrar dropdown
    this.router.navigate(['/profile']); // ir a página
  }

  logout() {
    this.auth.logout();
    this.mostrarAjustes = false;
    this.router.navigate(['/']);
  }
}