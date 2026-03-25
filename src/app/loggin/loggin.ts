import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-loggin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loggin.html',
  styleUrls: ['./loggin.css'], 
})
export class Loggin implements AfterViewInit {

  modoRegistro = false;

  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }

 ngAfterViewInit(): void {
  if (typeof google !== 'undefined') {

    google.accounts.id.initialize({
      client_id: "TU_CLIENT_ID_DE_GOOGLE.apps.googleusercontent.com",
      callback: (response: any) => {
        console.log("Usuario autenticado:", response);
      }
    });

    // Login
    google.accounts.id.renderButton(
      document.getElementById("googleLogin"),
      { theme: "outline", size: "large", width: 250 }
    );

    // Registro
    google.accounts.id.renderButton(
      document.getElementById("googleRegister"),
      { theme: "outline", size: "large", width: 250 }
    );
  }
  
}
irALogin() {
  this.modoRegistro = false;
}

irARegistro() {
  this.modoRegistro = true;
}
}