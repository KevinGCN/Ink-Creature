/**
 * Módulo Workers (Tatuadores) — Angular 21.
 *
 * - Signals + control flow (@if/@for) en vez de NgModules/*ngIf/*ngFor.
 * - Datos en vivo desde el backend NestJS (GET/POST/PATCH/DELETE /api/empleados).
 * - La creación de un tatuador registra primero un usuario en el backend
 *   (POST /api/usuarios) y luego su vínculo empleado (POST /api/empleados).
 * - El CRUD solo está disponible para usuarios con rol 'admin' (el backend
 *   exige JWT en esas operaciones).
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import { Empleado, EmpleadoService } from '../services/empleados';
import { UsuarioService } from '../services/usuarios';
import { FOTO_PLACEHOLDER } from '../utils/placeholder';

/** Datos del formulario del modal (agregar/editar) */
interface FormTatuador {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  especialidad: string;
  biografia: string;
  foto: string;
  activo: boolean;
}

@Component({
  selector: 'app-employees',
  imports: [FormsModule, RouterLink],
  standalone: true,
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly empleadosService = inject(EmpleadoService);
  private readonly usuariosService = inject(UsuarioService);

  /** Estado reactivo */
  readonly tatuadores = signal<Empleado[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  /** Permisos administrativos derivados del rol del backend */
  readonly esAdmin = computed(() => this.auth.esAdmin());

  // ── Estado del modal ──────────────────────────────────────
  readonly mostrarModal = signal(false);
  readonly modoEdicion = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly form = signal<FormTatuador>(Employees.formVacio());
  readonly errorForm = signal('');
  readonly guardando = signal(false);

  readonly placeholder = FOTO_PLACEHOLDER;

  ngOnInit(): void {
    this.cargarTatuadores();
  }

  cargarTatuadores(): void {
    this.cargando.set(true);
    this.empleadosService.getEmpleados().subscribe({
      next: (empleados) => {
        this.tatuadores.set(empleados.filter((e) => e.activo));
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error cargando empleados:', err);
        this.error.set('No se pudo conectar con el backend para cargar los tatuadores.');
        this.cargando.set(false);
      }
    });
  }

  nombreCompleto(empleado: Empleado): string {
    return `${empleado.usuarios?.nombre ?? ''} ${empleado.usuarios?.apellido ?? ''}`.trim();
  }

  fotoDe(empleado: Empleado): string {
    return empleado.usuarios?.foto_perfil_url || FOTO_PLACEHOLDER;
  }

  // ── Modal: Agregar ────────────────────────────────────────
  abrirAgregar(): void {
    this.modoEdicion.set(false);
    this.editandoId.set(null);
    this.form.set(Employees.formVacio());
    this.errorForm.set('');
    this.mostrarModal.set(true);
  }

  // ── Modal: Editar ─────────────────────────────────────────
  abrirEditar(empleado: Empleado): void {
    this.modoEdicion.set(true);
    this.editandoId.set(empleado.id);
    this.form.set({
      nombre: empleado.usuarios?.nombre ?? '',
      apellido: empleado.usuarios?.apellido ?? '',
      email: empleado.usuarios?.email ?? '',
      password: '',
      especialidad: empleado.especialidad ?? '',
      biografia: empleado.biografia ?? '',
      foto: empleado.usuarios?.foto_perfil_url ?? '',
      activo: empleado.activo
    });
    this.errorForm.set('');
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  // ── Guardar (agregar o editar) ────────────────────────────
  guardar(): void {
    const f = this.form();

    if (!f.nombre.trim() || !f.apellido.trim()) {
      this.errorForm.set('Nombre y apellido son obligatorios.');
      return;
    }
    if (!f.especialidad.trim()) {
      this.errorForm.set('La especialidad es obligatoria.');
      return;
    }

    if (this.modoEdicion()) {
      this.editar(f);
    } else {
      this.crear(f);
    }
  }

  /** Paso 1: crear el usuario; Paso 2: vincularlo como empleado */
  private crear(f: FormTatuador): void {
    if (!f.email.trim() || !f.password) {
      this.errorForm.set('Correo y contraseña son obligatorios para crear la cuenta del tatuador.');
      return;
    }
    if (f.password.length < 8) {
      this.errorForm.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    this.guardando.set(true);
    this.errorForm.set('');

    this.usuariosService
      .crearUsuario({
        nombre: f.nombre.trim(),
        apellido: f.apellido.trim(),
        email: f.email.trim(),
        password: f.password,
        foto_perfil_url: f.foto.trim() || undefined
      })
      .subscribe({
        next: (usuario) => {
          this.empleadosService
            .crearEmpleado({
              usuario_id: usuario.id,
              especialidad: f.especialidad.trim(),
              biografia: f.biografia.trim() || undefined,
              activo: f.activo
            })
            .subscribe({
              next: () => {
                this.guardando.set(false);
                this.cerrarModal();
                this.cargarTatuadores();
              },
              error: (err: HttpErrorResponse) => {
                console.error('Error creando empleado:', err);
                this.guardando.set(false);
                this.errorForm.set(
                  this.mensajeDeError(err, 'El usuario se creó pero no se pudo vincularlo como tatuador.')
                );
              }
            });
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error creando usuario:', err);
          this.guardando.set(false);
          this.errorForm.set(this.mensajeDeError(err, 'No se pudo crear la cuenta del tatuador.'));
        }
      });
  }

  private editar(f: FormTatuador): void {
    const id = this.editandoId();
    if (id === null) return;
    const empleado = this.tatuadores().find((e) => e.id === id);
    if (!empleado) return;

    this.guardando.set(true);
    this.errorForm.set('');

    // 1) Actualizar los datos del usuario (nombre, apellido, foto)
    this.usuariosService
      .actualizarUsuario(empleado.usuario_id, {
        nombre: f.nombre.trim(),
        apellido: f.apellido.trim(),
        foto_perfil_url: f.foto.trim() || undefined
      })
      .subscribe({
        next: () => {
          // 2) Actualizar el empleado (especialidad, biografía, activo)
          this.empleadosService
            .actualizarEmpleado(id, {
              especialidad: f.especialidad.trim(),
              biografia: f.biografia.trim(),
              activo: f.activo
            })
            .subscribe({
              next: () => {
                this.guardando.set(false);
                this.cerrarModal();
                this.cargarTatuadores();
              },
              error: (err: HttpErrorResponse) => {
                console.error('Error actualizando tatuador:', err);
                this.guardando.set(false);
                this.errorForm.set(this.mensajeDeError(err, 'No se pudo actualizar el tatuador.'));
              }
            });
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error actualizando usuario:', err);
          this.guardando.set(false);
          this.errorForm.set(this.mensajeDeError(err, 'No se pudieron actualizar los datos personales.'));
        }
      });
  }

  // ── Eliminar ──────────────────────────────────────────────
  eliminar(empleado: Empleado): void {
    const nombre = this.nombreCompleto(empleado);
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${nombre}?`)) {
      return;
    }

    // Borrar el usuario elimina en cascada su registro empleado.
    this.usuariosService.eliminarUsuario(empleado.usuario_id).subscribe({
      next: () => this.cargarTatuadores(),
      error: (err: HttpErrorResponse) => {
        console.error('Error eliminando tatuador:', err);
        alert(
          this.mensajeDeError(
            err,
            'No se pudo eliminar al tatuador. Si tiene citas u horarios registrados, bórralos primero.'
          )
        );
      }
    });
  }

  // ── Utilidades ────────────────────────────────────────────
  private static formVacio(): FormTatuador {
    return {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      especialidad: '',
      biografia: '',
      foto: '',
      activo: true
    };
  }

  private mensajeDeError(err: HttpErrorResponse, porDefecto: string): string {
    if (err.status === 409) return 'El correo ingresado ya está registrado.';
    if (err.status === 401) return 'Tu sesión expiró. Cierra sesión y vuelve a entrar.';
    return porDefecto;
  }
}
