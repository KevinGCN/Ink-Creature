import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Loggin } from '../../loggin/loggin';


@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, Loggin],
  templateUrl: './user-navbar.html',
  styleUrls: ['./user-navbar.css']
})
export class UserNavbar {

  mostrarLogin = false; 

  abrirLogin() {
    this.mostrarLogin = true;
  }

  cerrarLogin() {
    this.mostrarLogin = false;
  }
}
