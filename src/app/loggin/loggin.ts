import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 

declare const google: any;

@Component({
  selector: 'app-loggin',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './loggin.html',
  styleUrls: ['./loggin.css']
})
export class Loggin implements AfterViewInit {

  visible = false;

  abrir() { this.visible = true; }
  cerrar() { this.visible = false; }

  ngAfterViewInit(): void {
    
    google.accounts.id.initialize({
      client_id: "903319886114-ntklvvdveb7mqjttokdjl8gq7r9l6q6a.apps.googleusercontent.com",
      callback: (response: any) => {
        console.log("Usuario autenticado:", response);
      }
    });

    google.accounts.id.renderButton(
      document.getElementById("googleButton"),
      { theme: "outline", size: "large", width: 250 }
    );
  }
}