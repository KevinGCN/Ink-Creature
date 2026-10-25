/**
 * Reseñas de clientes (Comments) — se incrusta dentro del Lobby, la ruta
 * pública `''` (inicio), como bloque de prueba social bajo la bienvenida.
 *
 * Las reseñas no viajan al backend: `ResenaService` las persiste en
 * `localStorage`, así que solo se ven en el navegador donde se escribieron.
 */
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

  /** Reseñas ya ordenadas de la más reciente a la más antigua. */
  resenas: Resena[] = [];
  /** Texto que el usuario está escribiendo; se vacía al publicar. */
  comentario: string = '';
  /** Puntaje elegido con las estrellas; 5 por defecto para no obligar a cambiarlo. */
  calificacion: number = 5;
  /** Aviso de "reseña publicada" que se apaga solo a los 3 segundos. */
  exito: boolean = false;

  /**
   * Dependencias inyectadas: `auth` es público porque el template necesita
   * saber si hay sesión y con qué nombre firmar la reseña.
   */

  constructor(
    public auth: AuthService,
    private resenaService: ResenaService
  ) {}

  ngOnInit() {
    // Al entrar a la página se muestra lo que ya esté guardado en el navegador.
    this.cargarResenas();
  }

  /** Relee la lista del servicio; también se llama después de publicar. */
  cargarResenas() {
    this.resenas = this.resenaService.getResenas();
  }

  /**
   * Valida, firma con el usuario actual y guarda la reseña.
   * El servicio la persiste y aquí se refresca la lista para que aparezca sin
   * recargar la página; el formulario vuelve a su estado inicial.
   */
  publicar() {
    // Sin texto no hay nada que publicar (evita reseñas vacías).
    if (!this.comentario.trim()) return;

    // El formulario solo se pinta con sesión iniciada; el "Usuario" por defecto
    // cubre el caso de que la sesión se pierda justo antes de publicar (así no
    // se guarda un nombre `undefined`).
    const usuario = this.auth.obtenerUsuario();
    this.resenaService.publicarResena({
      nombreUsuario: usuario?.nombre || 'Usuario',
      comentario: this.comentario.trim(),
      fecha: new Date().toLocaleDateString('es-CO'),
      calificacion: this.calificacion,
    });

    // Se limpia el formulario y se confirma visualmente durante unos segundos.
    this.comentario = '';
    this.calificacion = 5;
    this.exito = true;
    this.cargarResenas();

    setTimeout(() => (this.exito = false), 3000);
  }

  /** Dibuja la nota como estrellas llenas y vacías (`★★★★☆`). */
  estrellas(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }
}
