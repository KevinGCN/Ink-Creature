import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile {

  usuario: any = {};
  citas: any[] = [];
  foto: string = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.usuario = this.auth.obtenerUsuario();
    this.cargarCitas();
    this.cargarFoto();
  }

  cargarCitas() {
    const data = localStorage.getItem('citas');
    if (data) {
      this.citas = JSON.parse(data);
    }
  }

  irACitas() {
    this.router.navigate(['/citas']);
  }

  cargarFoto() {
    this.foto = localStorage.getItem('fotoPerfil') || '';
  }

  
  cambiarFoto(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.foto = reader.result as string;
      localStorage.setItem('fotoPerfil', this.foto);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }
}