import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css']
})
export class Gallery implements OnInit {

  selectedImage: string | null = null;
  esAdmin = false;

  // Imágenes base
  imagenesBase = [
    { src: 'image/DBZ.jpg', alt: 'Goku Y Vegeta', empleadoId: 1 },
    { src: 'image/arquemis.png', alt: 'Arquemis', empleadoId: 1 },
    { src: 'image/ladymaria.png', alt: 'Lady Maria', empleadoId: 2 },
    { src: 'image/mercy.png', alt: 'Mercy', empleadoId: 3 },
    { src: 'image/rem.png', alt: 'Rem', empleadoId: 4 },
    { src: 'image/kuromi.jpg', alt: 'Kuromi', empleadoId: 5 },
    { src: 'image/sorodita.png', alt: 'Sorodita', empleadoId: 6 }
  ];

  // Aquí se combinan base + nuevas
  imagenes: any[] = [];

  constructor(
    private router: Router,
    private auth: AuthService
  ) {
    const usuario = this.auth.obtenerUsuario();
    this.esAdmin = usuario?.charge === 'CEO' || usuario?.charge === 'Admin';
  }

  ngOnInit() {
    this.cargarImagenes();
  }

  // Cargar imágenes evitando duplicados
  cargarImagenes() {
    const data = localStorage.getItem('galeria');
    const guardadas = data ? JSON.parse(data) : [];

    const unicas = guardadas.filter((img: any) =>
      !this.imagenesBase.some(base => base.src === img.src)
    );

    this.imagenes = [...this.imagenesBase, ...unicas];
  }

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

  // Subir imagen
  cargarImagen(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const nuevaImagen = {
        id: Date.now(), // 🔥 ID único
        src: reader.result as string,
        alt: 'Nueva imagen',
        empleadoId: 1
      };

      this.imagenes = [...this.imagenes, nuevaImagen];

      this.guardarImagenes(nuevaImagen);

      event.target.value = '';
    };

    reader.readAsDataURL(file);
  }

  // Guardar solo imágenes nuevas (no base)
  guardarImagenes(nuevaImagen: any) {
    const data = localStorage.getItem('galeria');
    const existentes = data ? JSON.parse(data) : [];

    // compara por ID
    const yaExiste = existentes.some((img: any) => img.id === nuevaImagen.id);

    if (!yaExiste) {
      existentes.push(nuevaImagen);
      localStorage.setItem('galeria', JSON.stringify(existentes));
    }
  }

  eliminarImagen(img: any, event: Event) {
  event.stopPropagation(); // evita que abra la imagen

  // NO permitir borrar imágenes base
  const esBase = this.imagenesBase.some(base => base.src === img.src);
  if (esBase) {
    alert('No puedes eliminar imágenes base');
    return;
  }

  // eliminar del array visual
  this.imagenes = this.imagenes.filter(i => i !== img);

  // eliminar del localStorage
  const data = localStorage.getItem('galeria');
  let guardadas = data ? JSON.parse(data) : [];

  guardadas = guardadas.filter((i: any) => i.id !== img.id);

  localStorage.setItem('galeria', JSON.stringify(guardadas));
}
}
