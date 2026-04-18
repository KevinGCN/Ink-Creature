import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css']
})
export class Gallery {

  selectedImage: string | null = null;

  // Cada imagen tiene su empleadoId — un mismo tatuaje no aparece en otro artista
  imagenes = [
    { src: 'image/DBZ.jpg',     alt: 'Goku Y Vegeta',       empleadoId: 1 },
    { src: 'image/arquemis.png',  alt: 'Arquemis',         empleadoId: 1 },
    { src: 'image/ladymaria.png', alt: 'Lady Maria',       empleadoId: 2 },
    { src: 'image/mercy.png',     alt: 'Mercy',            empleadoId: 3 },
    { src: 'image/rem.png',       alt: 'Rem',              empleadoId: 4 },
    { src: 'image/kuromi.jpg',     alt: 'Kuromi',            empleadoId: 5 },
    { src: 'image/sorodita.png',  alt: 'Sorodita',         empleadoId: 6 }
  ];

  constructor(private router: Router) {}

  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }

  verTatuador(empleadoId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/employeeCV', empleadoId]);
  }

  handleImageError(event: any) {
    console.error('Error cargando imagen:', event);
    event.target.src = 'image/placeholder.jpg';
  }
}
