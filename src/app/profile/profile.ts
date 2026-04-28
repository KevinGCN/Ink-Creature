import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { CitaService } from '../services/citas';
import { Cita } from '../models/cita';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  usuario: any = {};
  citas: Cita[] = [];
  foto: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private citaService: CitaService
  ) {}

  ngOnInit() {
    this.usuario = this.auth.obtenerUsuario();
    this.cargarCitas();
    this.cargarFoto();
  }

  cargarCitas() {
    this.citas = this.citaService.getCitas();
  }

  eliminar(id: number) {
    this.citaService.eliminarCita(id);
    this.cargarCitas();
  }

  cargarFoto() {
    this.foto = localStorage.getItem('fotoPerfil') || '';
  }

  cambiarFoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();

    reader.onload = () => {
      this.foto = reader.result as string;
      localStorage.setItem('fotoPerfil', this.foto);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  irAgenda() {
    this.router.navigate(['/schedule']);
  }
}