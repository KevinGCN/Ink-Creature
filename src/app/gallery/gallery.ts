import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  // Imagen seleccionada para visualización ampliada
  selectedImage: string | null = null;

  // Indica si el usuario tiene permisos administrativos
  esAdmin = false;

  // Imágenes predefinidas que no se almacenan en localStorage
  imagenesBase = [
    { src: 'image/DBZ.jpg', alt: 'Goku Y Vegeta', empleadoId: 1 },
    { src: 'image/arquemis.png', alt: 'Arquemis', empleadoId: 1 },
    { src: 'image/ladymaria.png', alt: 'Lady Maria', empleadoId: 2 },
    { src: 'image/mercy.png', alt: 'Mercy', empleadoId: 3 },
    { src: 'image/rem.png', alt: 'Rem', empleadoId: 4 },
    { src: 'image/kuromi.jpg', alt: 'Kuromi', empleadoId: 5 },
    { src: 'image/sorodita.png', alt: 'Sorodita', empleadoId: 6 }
  ];

  // Arreglo que contiene las imágenes visibles en la galería
  imagenes: any[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    const usuario = this.auth.obtenerUsuario();
    this.esAdmin = usuario?.charge === 'CEO' || usuario?.charge === 'Admin';
  }

  // Inicializa la galería combinando imágenes base y almacenadas
  ngOnInit() {
    this.cargarImagenes();
  }

  // Obtiene imágenes desde localStorage y evita duplicados con las imágenes base
  cargarImagenes() {
    const data = localStorage.getItem('galeria');
    const guardadas = data ? JSON.parse(data) : [];

    const unicas = guardadas.filter((img: any) =>
      !this.imagenesBase.some(base => base.src === img.src)
    );

    this.imagenes = [...this.imagenesBase, ...unicas];
  }

  // Muestra la imagen seleccionada en el visor
  openImage(img: string) {
    this.selectedImage = img;
  }

  // Cierra el visor de imágenes
  closeImage() {
    this.selectedImage = null;
  }

  // Redirige al perfil del tatuador asociado
  verTatuador(empleadoId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/employeeCV', empleadoId]);
  }

  // Reemplaza la imagen por una alternativa en caso de error
  handleImageError(event: any) {
    event.target.src = 'image/placeholder.jpg';
  }

  // Procesa la carga de una nueva imagen desde el input
  cargarImagen(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamaño antes de procesar
    if (!this.validarTamanoArchivo(file, 2)) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const nuevaImagen = {
        id: Date.now(),
        src: reader.result as string,
        alt: file.name,
        empleadoId: 1
      };

      this.guardarImagenes(nuevaImagen);
      this.imagenes = [...this.imagenes, nuevaImagen];
      this.cdr.detectChanges();

      event.target.value = '';
    };

    reader.readAsDataURL(file);
  }

  // Almacena una nueva imagen en localStorage evitando duplicados
  guardarImagenes(nuevaImagen: any) {
    const data = localStorage.getItem('galeria');
    const existentes = data ? JSON.parse(data) : [];

    const yaExiste = existentes.some((img: any) =>
      img.id === nuevaImagen.id || img.src === nuevaImagen.src
    );

    if (!yaExiste) {
      existentes.push(nuevaImagen);
      localStorage.setItem('galeria', JSON.stringify(existentes));
    }
  }

  // Elimina una imagen almacenada, excluyendo las imágenes base
  eliminarImagen(img: any, event: Event) {
    event.stopPropagation();

    const esBase = this.imagenesBase.some(base => base.src === img.src);
    if (esBase) {
      alert('No puedes eliminar imágenes base');
      return;
    }

    this.imagenes = this.imagenes.filter(i => i !== img);

    const data = localStorage.getItem('galeria');
    let guardadas = data ? JSON.parse(data) : [];

    guardadas = guardadas.filter((i: any) => i.id !== img.id);

    localStorage.setItem('galeria', JSON.stringify(guardadas));

    this.cdr.detectChanges();
  }

  validarTamanoArchivo(file: File, maxMB: number = 2): boolean {
    const maxBytes = maxMB * 1024 * 1024;

    if (file.size > maxBytes) {
      alert(`El archivo supera el tamaño permitido de ${maxMB} MB`);
      return false;
    }

    return true;
  }
}