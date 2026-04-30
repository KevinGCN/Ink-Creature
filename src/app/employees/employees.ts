import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

export interface Tatuador {
  id: number;
  nombre: string;
  cargo: string;
  especialidad: string;
  experiencia: number;
  descripcion: string;
  foto: string;
  estrellas: number;
}

export const TATUADORES_BASE: Tatuador[] = [
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
    descripcion: 'Tatuador especializado en estilo Souls: cinismo, armaduras rotas y fuegos fatuos con la misma elegancia oscura de morir una y otra vez.',
    foto: 'image/Gabe Fernandez.jpg',
    estrellas: 5
  },
  {
    id: 3,
    nombre: 'Juan David Vernadez',
    cargo: 'Tatuador',
    especialidad: 'Arte Fantástico y de videojuegos',
    experiencia: 4,
    descripcion: 'Soy bueno dandole caracteristicas unicas a los personajes.',
    foto: 'image/Juan David Vernadez.webp',
    estrellas: 4
  },
  {
    id: 4,
    nombre: 'Valentina Ríos',
    cargo: 'Tatuadora',
    especialidad: 'Minimalismo',
    experiencia: 3,
    descripcion: 'Tatuadora de mundos fantasticos: personajes memorables, magia arcana y KasuGOD > Basuro.',
    foto: 'image/Valentina Ríos.jpg',
    estrellas: 5
  },
  {
    id: 5,
    nombre: 'Sebastián Morales',
    cargo: 'Tatuador',
    especialidad: 'Chivi',
    experiencia: 6,
    descripcion: 'Soy experto en hacer arte lindo y adorable.',
    foto: 'image/Sebastián Morales.jpg',
    estrellas: 4
  },
  {
    id: 6,
    nombre: 'Leonardo Taza',
    cargo: 'Tatuador',
    especialidad: 'Warhammer 40k',
    experiencia: 3,
    descripcion: 'Quieres el tatuaje de una monja de batalla con lanzallamas? Pues si la respuesta es si, yo soy tu hombre.',
    foto: 'image/Leonardo Taza.png',
    estrellas: 5
  }
];

/** Carga la lista combinada de tatuadores (base + personalizados - eliminados) */
export function cargarListaTatuadores(): Tatuador[] {
  const custom: Tatuador[] = JSON.parse(localStorage.getItem('tatuadores_custom') || '[]');
  const deleted: number[] = JSON.parse(localStorage.getItem('tatuadores_deleted') || '[]');

  const merged = [...TATUADORES_BASE];
  custom.forEach((c: Tatuador) => {
    const idx = merged.findIndex(t => t.id === c.id);
    if (idx >= 0) merged[idx] = c;
    else merged.push(c);
  });

  return merged.filter(t => !deleted.includes(t.id));
}

@Component({
  selector: 'app-employees',
  imports: [CommonModule, FormsModule, RouterLink],
  standalone: true,
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {

  tatuadores: Tatuador[] = [];
  esAdmin = false;

  // ── Estado del modal ──────────────────────────────────────
  mostrarModal = false;
  modoEdicion = false;
  editandoId: number | null = null;

  // ── Formulario ────────────────────────────────────────────
  form: Partial<Tatuador> = {};
  fotoPreview = '';
  errorForm = '';

  constructor(private auth: AuthService) {}

  ngOnInit() {
    const usuario = this.auth.obtenerUsuario();
    this.esAdmin = usuario?.charge === 'CEO' || usuario?.charge === 'Admin';
    this.cargarTatuadores();
  }

  cargarTatuadores() {
    this.tatuadores = cargarListaTatuadores();
  }

  obtenerEstrellas(cantidad: number): string {
    return '★'.repeat(cantidad) + '☆'.repeat(5 - cantidad);
  }

  // ── Modal: Agregar ────────────────────────────────────────
  abrirAgregar() {
    this.modoEdicion = false;
    this.editandoId = null;
    this.form = {
      nombre: '',
      cargo: 'Tatuador',
      especialidad: '',
      experiencia: 1,
      descripcion: '',
      foto: '',
      estrellas: 5
    };
    this.fotoPreview = '';
    this.errorForm = '';
    this.mostrarModal = true;
  }

  // ── Modal: Editar ─────────────────────────────────────────
  abrirEditar(t: Tatuador) {
    this.modoEdicion = true;
    this.editandoId = t.id;
    this.form = { ...t };
    this.fotoPreview = t.foto;
    this.errorForm = '';
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  // ── Foto del tatuador en formulario ───────────────────────
  cargarFoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreview = reader.result as string;
      this.form.foto = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ── Guardar (add o edit) ──────────────────────────────────
  guardar() {
    this.errorForm = '';
    if (!this.form.nombre?.trim()) {
      this.errorForm = 'El nombre es obligatorio.';
      return;
    }
    if (!this.form.especialidad?.trim()) {
      this.errorForm = 'La especialidad es obligatoria.';
      return;
    }
    if (!this.form.foto) {
      this.errorForm = 'Debes subir una foto.';
      return;
    }

    const custom: Tatuador[] = JSON.parse(localStorage.getItem('tatuadores_custom') || '[]');

    if (this.modoEdicion && this.editandoId !== null) {
      // Editar existente
      const idx = custom.findIndex(t => t.id === this.editandoId);
      const updated: Tatuador = {
        id: this.editandoId,
        nombre: this.form.nombre!,
        cargo: this.form.cargo || 'Tatuador',
        especialidad: this.form.especialidad!,
        experiencia: this.form.experiencia || 1,
        descripcion: this.form.descripcion || '',
        foto: this.form.foto!,
        estrellas: this.form.estrellas || 5
      };
      if (idx >= 0) custom[idx] = updated;
      else custom.push(updated);
    } else {
      // Agregar nuevo
      const todos = cargarListaTatuadores();
      const maxId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) : 0;
      const nuevo: Tatuador = {
        id: maxId + 1,
        nombre: this.form.nombre!,
        cargo: this.form.cargo || 'Tatuador',
        especialidad: this.form.especialidad!,
        experiencia: this.form.experiencia || 1,
        descripcion: this.form.descripcion || '',
        foto: this.form.foto!,
        estrellas: this.form.estrellas || 5
      };
      custom.push(nuevo);
    }

    localStorage.setItem('tatuadores_custom', JSON.stringify(custom));
    this.cargarTatuadores();
    this.cerrarModal();
  }

  // ── Eliminar ──────────────────────────────────────────────
  eliminar(id: number) {
    if (!confirm('¿Estás seguro de que quieres eliminar este tatuador?')) return;

    const deleted: number[] = JSON.parse(localStorage.getItem('tatuadores_deleted') || '[]');
    if (!deleted.includes(id)) deleted.push(id);
    localStorage.setItem('tatuadores_deleted', JSON.stringify(deleted));

    // Remover también de custom si está allí
    const custom: Tatuador[] = JSON.parse(localStorage.getItem('tatuadores_custom') || '[]');
    const filtered = custom.filter(t => t.id !== id);
    localStorage.setItem('tatuadores_custom', JSON.stringify(filtered));

    this.cargarTatuadores();
  }
}
