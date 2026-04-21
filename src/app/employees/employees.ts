import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Empleado {
  id: number;
  nombre: string;
  cargo: string;
  especialidad: string;
  experiencia: number;
  foto: string;
  estrellas: number;
}

@Component({
  selector: 'app-employees',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees {

  empleados: Empleado[] = [
    {
      id: 1,
      nombre: 'Emilia Soplano',
      cargo: 'Tatuador',
      especialidad: 'Estilo Anime',
      experiencia: 5,
      foto: 'image/Emilia Soplano.jpg',
      estrellas: 5
    },
    {
      id: 2,
      nombre: 'Gabe Fernandez',
      cargo: 'Tatuador',
      especialidad: 'Realismo y Fantasía Oscura',
      experiencia: 4,
      foto: 'image/Gabe Fernandez.jpg',
      estrellas: 5
    },
    {
      id: 3,
      nombre: 'Juan David Vernadez',
      cargo: 'Tatuador',
      especialidad: 'Arte Fantástico y de videojuegos',
      experiencia: 4,
      foto: 'image/Juan David Vernadez.webp',
      estrellas: 4
    },
    {
      id: 4,
      nombre: 'Valentina Ríos ',
      cargo: 'Tatuadora',
      especialidad: 'Minimalismo',
      experiencia: 3,
      foto: 'image/Valentina Ríos.jpg',
      estrellas: 5
    },
    {
      id: 5,
      nombre: 'Sebastián Morales',
      cargo: 'Tatuador',
      especialidad: 'Chivi',
      experiencia: 6,
      foto: 'image/Sebastián Morales.jpg',
      estrellas: 4
    },
    {
      id: 6,
      nombre: 'Leonardo Taza',
      cargo: 'Tatuador',
      especialidad: 'Warhammer 40k',
      experiencia: 3,
      foto: 'image/Leonardo Taza.png',
      estrellas: 5
    }
  ];

  obtenerEstrellas(cantidad: number): string {
    return '★'.repeat(cantidad) + '☆'.repeat(5 - cantidad);
  }
}
