import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { ResenaService } from '../services/resenas';
import { Resena } from '../models/resena';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.html',
  styleUrl: './comments.css',
})
export class Comments implements OnInit {

  resenas: Resena[] = [];
  comentario: string = '';
  calificacion: number = 5;
  exito: boolean = false;

  constructor(
    public auth: AuthService,
    private resenaService: ResenaService
  ) {}

  ngOnInit() {
    this.cargarResenas();
  }

  cargarResenas() {
    this.resenas = this.resenaService.getResenas();
  }

  publicar() {
    if (!this.comentario.trim()) return;

    const usuario = this.auth.obtenerUsuario();
    this.resenaService.publicarResena({
      nombreUsuario: usuario.nombre || usuario.name || 'Usuario',
      comentario: this.comentario.trim(),
      fecha: new Date().toLocaleDateString('es-CO'),
      calificacion: this.calificacion,
    });

    this.comentario = '';
    this.calificacion = 5;
    this.exito = true;
    this.cargarResenas();

    setTimeout(() => (this.exito = false), 3000);
  }

  estrellas(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }
}
