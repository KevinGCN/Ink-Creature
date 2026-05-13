import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { cargarListaTatuadores, Tatuador } from '../employees/employees';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css']
})
export class Gallery implements OnInit {

  // Imagen seleccionada para visualización ampliada
  selectedImage: string | null = null;

  // Indica si el usuario tiene permisos administrativos
  esAdmin = false;

  // Lista de tatuadores para el selector
  tatuadores: Tatuador[] = [];

  // Imágenes base
  imagenesBase = [
    { src: 'image/DBZ.jpg', alt: 'Goku Y Vegeta', empleadoId: 1 },
    { src: 'image/ladymaria.png', alt: 'Lady Maria', empleadoId: 2 },
    { src: 'image/mercy.png', alt: 'Mercy', empleadoId: 3 },
    { src: 'image/rem.png', alt: 'Rem', empleadoId: 4 },
    { src: 'image/kuromi.jpg', alt: 'Kuromi', empleadoId: 5 },
    { src: 'image/sorodita.png', alt: 'Sorodita', empleadoId: 6 },
    { src: 'image/arquemis.png', alt: 'Arquemis', empleadoId: 7 }
  ];
  imagenes: any[] = [];

  // ── Estado modal de subida 
  mostrarModalSubida = false;
  archivoTemporal: File | null = null;
  previewTemporal: string = '';
  tatuadorSeleccionado: number = 1;
  nombreImagenTemp: string = '';

  constructor(private router: Router, private auth: AuthService) {
    const usuario = this.auth.obtenerUsuario();
    this.esAdmin = usuario?.charge === 'CEO' || usuario?.charge === 'Admin';
  }

  // Inicializa la galería combinando imágenes base y almacenadas
  ngOnInit() {
    this.auth.usuario$.subscribe(usuario => {
      this.esAdmin =
        usuario?.charge === 'CEO' ||
        usuario?.charge === 'Admin';
    });
    this.cargarImagenes();
    this.tatuadores = cargarListaTatuadores();
    if (this.tatuadores.length > 0) {
      this.tatuadorSeleccionado = this.tatuadores[0].id;
    }
  }

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

  obtenerNombreTatuador(id: number): string {
    const t = this.tatuadores.find(t => t.id === id);
    return t ? t.nombre : 'Tatuador';
  }

  // ── Paso 1: archivo seleccionado → abrir modal 
  seleccionarArchivo(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.archivoTemporal = file;
    this.nombreImagenTemp = file.name.replace(/\.[^.]+$/, '');
    // Recargar tatuadores por si se agregaron nuevos
    this.tatuadores = cargarListaTatuadores();
    if (this.tatuadores.length > 0) {
      this.tatuadorSeleccionado = this.tatuadores[0].id;
    }

    this.previewTemporal = URL.createObjectURL(file);
    this.mostrarModalSubida = true;

    // Limpiar input para permitir resubir el mismo archivo
    event.target.value = '';
  }

  // ── Paso 2: confirmar con tatuador seleccionado 
  confirmarSubida() {
    if (!this.previewTemporal) return;

    const nuevaImagen = {
      id: Date.now(),
      src: this.previewTemporal,
      alt: this.nombreImagenTemp || 'Nueva imagen',
      empleadoId: this.tatuadorSeleccionado
    };

    this.imagenes = [...this.imagenes, nuevaImagen];
    this.guardarImagen(nuevaImagen);
    this.cerrarModalSubida();
  }

  cerrarModalSubida() {
    this.mostrarModalSubida = false;
    this.archivoTemporal = null;
    this.previewTemporal = '';
    this.nombreImagenTemp = '';
  }

  guardarImagen(nuevaImagen: any) {
    const data = localStorage.getItem('galeria');
    const existentes = data ? JSON.parse(data) : [];
    const yaExiste = existentes.some((img: any) => img.id === nuevaImagen.id);
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
      alert('No puedes eliminar imágenes base.');
      return;
    }
    this.imagenes = this.imagenes.filter(i => i !== img);
    const data = localStorage.getItem('galeria');
    let guardadas = data ? JSON.parse(data) : [];
    guardadas = guardadas.filter((i: any) => i.id !== img.id);
    localStorage.setItem('galeria', JSON.stringify(guardadas));
  }
}