import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import { EmpleadoService } from '../services/empleados';
import { ConfirmacionService } from '../services/confirmacion';
import { NotificacionesService } from '../services/notificaciones';
import { Empleado } from '../models/empleado';

/**
 * Catálogo de tatuadores.
 *
 * Los datos viven en el backend (`/empleados` + `/usuarios` + `/horarios-trabajador`).
 * El alta crea primero el usuario, luego la ficha de empleado; la edición toca
 * ambas tablas y el borrado solo quita la ficha del catálogo.
 */
@Component({
  selector: 'app-employees',
  imports: [CommonModule, FormsModule, RouterLink],
  standalone: true,
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  tatuadores: Empleado[] = [];
  esAdmin = false;
  cargando = false;
  mensaje = '';

  // Estado del modal
  mostrarModal = false;
  modoEdicion = false;
  editando: Empleado | null = null;

  // ── Formulario ────────────────────────────────────────────
  form = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    especialidad: '',
    descripcion: '',
  };
  fotoFile: File | null = null;
  fotoPreview = '';
  errorForm = '';

  constructor(
    private auth: AuthService,
    private empleadoService: EmpleadoService,
    // Avisos y confirmación con el proyecto propio (toasts + modal; sin nativos)
    private notificaciones: NotificacionesService,
    private confirmacion: ConfirmacionService,
  ) {}

  ngOnInit() {
    this.esAdmin = this.auth.esAdmin();
    this.cargarTatuadores();
  }

  cargarTatuadores() {
    this.cargando = true;
    this.mensaje = '';
    this.empleadoService.getEmpleados().subscribe({
      next: (lista) => {
        this.tatuadores = lista;
        this.cargando = false;
      },
      error: (err) => {
        console.error('No se pudo cargar el catálogo:', err);
        this.mensaje = 'No se pudo cargar el catálogo desde el servidor.';
        this.cargando = false;
      },
    });
  }

  usarFotoPorDefecto(event: Event) {
    (event.target as HTMLImageElement).src = 'image/tatuador.png';
  }

  // Modal: Agregar
  abrirAgregar() {
    this.modoEdicion = false;
    this.editando = null;
    this.form = {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      especialidad: '',
      descripcion: '',
    };
    this.fotoFile = null;
    this.fotoPreview = '';
    this.errorForm = '';
    this.mostrarModal = true;
  }

  // ── Modal: Editar ─────────────────────────────────────────
  abrirEditar(t: Empleado) {
    this.modoEdicion = true;
    this.editando = t;
    this.form = {
      nombre: t.name,
      apellido: t.last_name,
      email: '',
      password: '',
      especialidad: t.especialidad,
      descripcion: t.descripcion,
    };
    this.fotoFile = null;
    this.fotoPreview = t.foto === 'image/tatuador.png' ? '' : t.foto;
    this.errorForm = '';
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  // ── Foto del tatuador en formulario ───────────────────────
  cargarFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.errorForm = 'La foto supera 5 MB.';
      input.value = '';
      return;
    }

    this.errorForm = '';
    this.fotoFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.fotoPreview = reader.result as string;
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  // Guardar agregar o editar
  guardar() {
    this.errorForm = '';

    if (!this.form.nombre.trim()) {
      this.errorForm = 'El nombre es obligatorio.';
      return;
    }
    if (!this.form.apellido.trim()) {
      this.errorForm = 'El apellido es obligatorio.';
      return;
    }
    if (!this.form.especialidad.trim()) {
      this.errorForm = 'La especialidad es obligatoria.';
      return;
    }
    if (!this.modoEdicion) {
      if (!this.form.email.trim()) {
        this.errorForm = 'El correo es obligatorio.';
        return;
      }
      if (this.form.password.length < 8) {
        this.errorForm = 'La contraseña debe tener al menos 8 caracteres.';
        return;
      }
    }

    const datos = {
      nombre: this.form.nombre.trim(),
      apellido: this.form.apellido.trim(),
      email: this.form.email.trim(),
      password: this.form.password,
      especialidad: this.form.especialidad.trim(),
      biografia: this.form.descripcion.trim(),
    };

    const peticion =
      this.modoEdicion && this.editando
        ? this.empleadoService.actualizar(this.editando, datos, this.fotoFile ?? undefined)
        : this.empleadoService.crear(datos, this.fotoFile ?? undefined);

    peticion.subscribe({
      next: () => {
        this.cargarTatuadores();
        this.cerrarModal();
      },
      error: (err) => {
        if (err?.status === 409) {
          this.errorForm = 'Ya existe una cuenta con ese correo.';
        } else if (err?.status === 400) {
          this.errorForm = 'Revisa los datos: la contraseña debe tener 8 caracteres o más.';
        } else {
          this.errorForm = 'No se pudo guardar. Intenta de nuevo.';
        }
        console.error('Error guardando tatuador:', err);
      },
    });
  }

  // Eliminar
  /**
   * Elimina al tatuador previa confirmación (modal propio del proyecto). Si el
   * empleado tiene citas u horarios, la FK lo impide y el backend responde con
   * error (se avisa con un toast del proyecto).
   */
  async eliminar(id: number): Promise<void> {
    const tatuador = this.tatuadores.find((t) => t.id === id);
    const nombre = tatuador
      ? `${tatuador.name} ${tatuador.last_name}`.trim()
      : 'este tatuador';
    const aceptado = await this.confirmacion.confirmar({
      titulo: 'Eliminar tatuador',
      mensaje: `¿Estás seguro de que quieres eliminar a ${nombre}?`,
      textoConfirmar: 'Eliminar',
      peligro: true,
    });
    if (!aceptado) {
      return;
    }

    this.empleadoService.eliminar(id).subscribe({
      next: () => this.cargarTatuadores(),
      error: (err) => {
        console.error('No se pudo eliminar el tatuador:', err);
        const texto =
          err?.error?.message ||
          'No se pudo eliminar el tatuador. Intenta de nuevo.';
        this.mensaje = texto;
        this.notificaciones.error(texto);
      },
    });
  }
}

