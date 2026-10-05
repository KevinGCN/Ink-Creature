import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { cargarListaTatuadores, Tatuador } from '../employees/employees';

interface ImagenGaleria {
  id?: number;
  src: string;
  alt: string;
  empleadoId: number;
}

@Component({
  selector: 'app-gallery',
  imports: [FormsModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  // Imagen seleccionada para visualización ampliada
  readonly selectedImage = signal<string | null>(null);

  // Usuario reactivo y permisos administrativos derivados
  private readonly usuario = toSignal(this.auth.usuario$, {
    initialValue: this.auth.obtenerUsuario()
  });
  readonly esAdmin = computed(() => {
    const cargo = this.usuario()?.charge;
    return cargo === 'CEO' || cargo === 'Admin';
  });

  // Lista de tatuadores para el selector
  readonly tatuadores = signal<Tatuador[]>([]);

  // Imágenes base
  private readonly imagenesBase: ImagenGaleria[] = [
    { src: 'image/DBZ.jpg', alt: 'Goku Y Vegeta', empleadoId: 1 },
    { src: 'image/ladymaria.png', alt: 'Lady Maria', empleadoId: 2 },
    { src: 'image/mercy.png', alt: 'Mercy', empleadoId: 3 },
    { src: 'image/rem.png', alt: 'Rem', empleadoId: 4 },
    { src: 'image/kuromi.jpg', alt: 'Kuromi', empleadoId: 5 },
    { src: 'image/sorodita.png', alt: 'Sorodita', empleadoId: 6 },
    { src: 'image/arquemis.png', alt: 'Arquemis', empleadoId: 7 }
  ];
  readonly imagenes = signal<ImagenGaleria[]>([]);

  // ── Estado modal de subida
  readonly mostrarModalSubida = signal(false);
  readonly archivoTemporal = signal<File | null>(null);
  readonly previewTemporal = signal('');
  readonly tatuadorSeleccionado = signal(1);
  readonly nombreImagenTemp = signal('');

  // Inicializa la galería combinando imágenes base y almacenadas
  ngOnInit() {
    this.cargarImagenes();
    this.recargarTatuadores();
  }

  private recargarTatuadores() {
    const lista = cargarListaTatuadores();
    this.tatuadores.set(lista);
    if (lista.length > 0) {
      this.tatuadorSeleccionado.set(lista[0].id);
    }
  }

  cargarImagenes() {
    const data = localStorage.getItem('galeria');
    const guardadas: ImagenGaleria[] = data ? JSON.parse(data) : [];
    const unicas = guardadas.filter(
      img => !this.imagenesBase.some(base => base.src === img.src)
    );
    this.imagenes.set([...this.imagenesBase, ...unicas]);
  }

  openImage(img: string) {
    this.selectedImage.set(img);
  }

  closeImage() {
    this.selectedImage.set(null);
  }

  verTatuador(empleadoId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/employeeCV', empleadoId]);
  }

  handleImageError(event: Event) {
    console.error('Error cargando imagen:', event);
    (event.target as HTMLImageElement).src = 'image/placeholder.jpg';
  }

  obtenerNombreTatuador(id: number): string {
    const t = this.tatuadores().find(t => t.id === id);
    return t ? t.nombre : 'Tatuador';
  }

  // ── Paso 1: archivo seleccionado → abrir modal
  seleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.archivoTemporal.set(file);
    this.nombreImagenTemp.set(file.name.replace(/\.[^.]+$/, ''));

    // Recargar tatuadores por si se agregaron nuevos
    this.recargarTatuadores();

    this.previewTemporal.set(URL.createObjectURL(file));
    this.mostrarModalSubida.set(true);

    // Limpiar input para permitir resubir el mismo archivo
    input.value = '';
  }

  // ── Paso 2: confirmar con tatuador seleccionado
  confirmarSubida() {
    if (!this.previewTemporal()) return;

    const nuevaImagen: ImagenGaleria = {
      id: Date.now(),
      src: this.previewTemporal(),
      alt: this.nombreImagenTemp() || 'Nueva imagen',
      empleadoId: this.tatuadorSeleccionado()
    };

    this.imagenes.update(lista => [...lista, nuevaImagen]);
    this.guardarImagen(nuevaImagen);
    this.cerrarModalSubida();
  }

  cerrarModalSubida() {
    this.mostrarModalSubida.set(false);
    this.archivoTemporal.set(null);
    this.previewTemporal.set('');
    this.nombreImagenTemp.set('');
  }

  guardarImagen(nuevaImagen: ImagenGaleria) {
    const data = localStorage.getItem('galeria');
    const existentes: ImagenGaleria[] = data ? JSON.parse(data) : [];
    if (!existentes.some(img => img.id === nuevaImagen.id)) {
      existentes.push(nuevaImagen);
      localStorage.setItem('galeria', JSON.stringify(existentes));
    }
  }

  // Elimina una imagen almacenada, excluyendo las imágenes base
  eliminarImagen(img: ImagenGaleria, event: Event) {
    event.stopPropagation();
    if (this.imagenesBase.some(base => base.src === img.src)) {
      alert('No puedes eliminar imágenes base.');
      return;
    }
    this.imagenes.update(lista => lista.filter(i => i !== img));

    const data = localStorage.getItem('galeria');
    const guardadas: ImagenGaleria[] = data ? JSON.parse(data) : [];
    localStorage.setItem(
      'galeria',
      JSON.stringify(guardadas.filter(i => i.id !== img.id))
    );
  }
}