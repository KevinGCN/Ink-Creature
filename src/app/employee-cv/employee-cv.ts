import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

interface Empleado {
  id: number;
  nombre: string;
  cargo: string;
  especialidad: string;
  experiencia: number;
  descripcion: string;
  foto: string;
  estrellas: number;
}

@Component({
  selector: 'app-employee-cv',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './employee-cv.html',
  styleUrl: './employee-cv.css',
})
export class EmployeeCV implements OnInit {

  empleado: Empleado | null = null;

  // Datos de los tatuadores — llena el campo descripcion
  empleados: Empleado[] = [
    {
      id: 1,
      nombre: 'Emilia Soplano',
      cargo: 'Tatuador',
      especialidad: 'Estilo Anime',
      experiencia: 5,
      descripcion: 'Tatuadora especializada en anime y Dragon Ball: líneas que parecen Kamehamehas y color digno de una esfera del dragón.',
      foto: 'image/Emilia Soplano.jpg',
      estrellas: 5
    },
    {
      id: 2,
      nombre: 'Gabe Fernandez',
      cargo: 'Tatuador',
      especialidad: 'Realismo y Fantasía Oscura',
      experiencia: 4,
      descripcion: 'Tatuador especializado en estilo Souls: cinismo, armaduras rotas y fuegos fatuos con la misma elegancia oscura de morir una y otra vez.,',
      foto: 'image/Gabe Fernandez.jpg',
      estrellas: 5
    },
    {
      id: 3,
      nombre: 'Juan David Vernadez',
      cargo: 'Tatuador',
      especialidad: 'Arte Fantástico y de videojuegos',
      experiencia: 4,
      descripcion: 'Soy bueno dandole caracteristicas unicas a los personajes',
      foto: 'image/Juan David Vernadez.webp',
      estrellas: 4
    },
    {
      id: 4,
      nombre: 'Valentina Ríos ',
      cargo: 'Tatuadora',
      especialidad: 'Minimalismo y Anime',
      experiencia: 3,
      descripcion: 'Tatuadora de mundos fantasticos: personakes memorables, magia arcana y KasuGOD > Basuro',
      foto: 'image/Valentina Ríos.jpg',
      estrellas: 5
    },
    {
      id: 5,
      nombre: 'Sebastián Morales',
      cargo: 'Tatuador',
      especialidad: 'Chivi',
      experiencia: 6,
      descripcion: 'Soy experto en hacer arte lindo y adorable',
      foto: 'image/Sebastián Morales.png',
      estrellas: 4
    },
    {
      id: 6,
      nombre: 'Leonardo Taza',
      cargo: 'Tatuador',
      especialidad: 'Warhammer 40k',
      experiencia: 3,
      descripcion: 'Quieres el tatuaje de una monja de batalla con lanzallamas? Pues si la respuesta es si, yo soy tu hombre',
      foto: 'image/Leonardo Taza.png',
      estrellas: 5
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.empleado = this.empleados.find(e => e.id === id) || null;
  }

  obtenerEstrellas(cantidad: number): string {
    return '★'.repeat(cantidad) + '☆'.repeat(5 - cantidad);
  }
}
