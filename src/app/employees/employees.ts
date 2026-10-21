/**
 * Módulo Workers (Tatuadores) — Angular 21.
 *
 * - Signals + control flow (@if/@for) en vez de NgModules/*ngIf/*ngFor.
 * - Datos en vivo desde el backend NestJS (GET/POST/PATCH/DELETE /api/empleados).
 * - La creación de un tatuador registra primero un usuario en el backend
 *   (POST /api/usuarios) y luego su vínculo empleado (POST /api/empleados).
 * - El CRUD y la gestión de roles solo están disponibles para usuarios con
 *   rol 'admin' (el backend exige JWT y, para cambiar roles, rol admin).
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import { Empleado, EmpleadoService } from '../services/empleados';
import { UsuarioService } from '../services/usuarios';
import { RolUsuario, Usuario } from '../models/usuario';
import { FOTO_PLACEHOLDER } from '../utils/placeholder';
import { urlImagen } from '../utils/imagen-url';

/** Datos del formulario del modal (agregar/editar/promover) */
interface FormTatuador {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  especialidad: string;
  biografia: string;
  /** Ruta de la foto ya guardada en el backend ("/api/imagenes/<id>") */
  foto: string;
  activo: boolean;
  rol: RolUsuario;
}

/** Tamaño máximo de la foto de perfil (2 MB). */
const FOTO_MAX_BYTES = 2 * 1024 * 1024;
const FOTO_TIPOS = /^image\/(jpeg|png|webp)$/;

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
  readonly empleados = signal<Empleado[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  /** Solo los tatuadores activos se muestran en el catálogo */
  readonly tatuadores = computed(() => this.empleados().filter((e) => e.activo));

  /** Permisos administrativos derivados del rol del backend */
  readonly esAdmin = computed(() => this.auth.esAdmin());

  /** Usuarios registrados que todavía no son tatuadores (para promoverlos) */
  readonly usuariosSinTatuador = computed(() =>
    this.usuarios().filter((u) => !this.empleados().some((e) => e.usuario_id === u.id))
  );

  /** Estado del panel colapsable de usuarios pendientes (cerrado por defecto) */
  readonly pendientesAbierto = signal(false);

  /** Texto del buscador de usuarios pendientes */
  readonly busquedaPendientes = signal('');

  /** Usuarios pendientes filtrados por nombre, apellido o correo */
  readonly usuariosPendientesFiltrados = computed(() => {
    const q = this.busquedaPendientes().trim().toLowerCase();
    const lista = this.usuariosSinTatuador();
    if (!q) return lista;
    return lista.filter((u) =>
      `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q)
    );
  });

  /** Roles disponibles en el backend */
  readonly roles: RolUsuario[] = ['cliente', 'empleado', 'admin'];

  // ── Estado del modal ──────────────────────────────────────
  readonly mostrarModal = signal(false);
  readonly modoEdicion = signal(false);
  /** Modo promoción: el usuario ya existe y solo se crea su ficha de empleado */
  readonly modoPromocion = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly form = signal<FormTatuador>(Employees.formVacio());
  readonly errorForm = signal('');
  readonly guardando = signal(false);

  /** Archivo de foto elegido en el modal (aún no subido al backend) */
  readonly fotoArchivo = signal<File | null>(null);
  /** Vista previa local del archivo elegido */
  readonly vistaPreviaFoto = signal('');

  readonly placeholder = FOTO_PLACEHOLDER;

  ngOnInit(): void {
    this.cargarTatuadores();
    this.cargarUsuarios();
  }

  cargarTatuadores(): void {
    this.cargando.set(true);
    this.empleadosService.getEmpleados().subscribe({
      next: (empleados) => {
        this.empleados.set(empleados);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error cargando empleados:', err);
        this.error.set('No se pudo conectar con el backend para cargar los tatuadores.');
        this.cargando.set(false);
      }
    });
  }

  /** Carga todos los usuarios registrados (endpoint público) */
  cargarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: (err) => console.error('Error cargando usuarios:', err)
    });
  }

  nombreCompleto(empleado: Empleado): string {
    return `${empleado.usuarios?.nombre ?? ''} ${empleado.usuarios?.apellido ?? ''}`.trim();
  }

  fotoDe(empleado: Empleado): string {
    return urlImagen(empleado.usuarios?.foto_perfil_url) || FOTO_PLACEHOLDER;
  }

  /**
   * Foto a mostrar en el modal: la vista previa del archivo recién elegido
   * o, si no hay, la foto ya guardada en el backend.
   */
  fotoDelFormulario(): string {
    return this.vistaPreviaFoto() || urlImagen(this.form().foto);
  }

  // ── Modal: Agregar ────────────────────────────────────────
  abrirAgregar(): void {
    this.modoEdicion.set(false);
    this.modoPromocion.set(false);
    this.editandoId.set(null);
    this.form.set(Employees.formVacio());
    this.limpiarFotoElegida();
    this.errorForm.set('');
    this.mostrarModal.set(true);
  }

  // ── Modal: Editar ─────────────────────────────────────────
  abrirEditar(empleado: Empleado): void {
    this.modoEdicion.set(true);
    this.modoPromocion.set(false);
    this.editandoId.set(empleado.id);
    this.form.set({
      nombre: empleado.usuarios?.nombre ?? '',
      apellido: empleado.usuarios?.apellido ?? '',
      email: empleado.usuarios?.email ?? '',
      password: '',
      especialidad: empleado.especialidad ?? '',
      biografia: empleado.biografia ?? '',
      foto: empleado.usuarios?.foto_perfil_url ?? '',
      activo: empleado.activo,
      rol: empleado.usuarios?.rol ?? 'empleado'
    });
    this.limpiarFotoElegida();
    this.errorForm.set('');
    this.mostrarModal.set(true);
  }

  // ── Modal: Promover usuario existente a tatuador ─────────
  abrirPromover(usuario: Usuario): void {
    this.modoEdicion.set(false);
    this.modoPromocion.set(true);
    this.editandoId.set(null);
    this.form.set({
      ...Employees.formVacio(),
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      foto: usuario.foto_perfil_url ?? '',
      rol: 'empleado'
    });
    this.limpiarFotoElegida();
    this.errorForm.set('');
    this.mostrarModal.set(true);
  }

  // ── Foto del tatuador ─────────────────────────────────────
  /**
   * Elige un archivo de imagen para la foto del tatuador. El archivo se
   * sube al backend al guardar (POST /api/usuarios/:id/foto), que lo
   * almacena en la base de datos.
   */
  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = ''; // permite volver a elegir el mismo archivo
    if (!archivo) return;

    if (!FOTO_TIPOS.test(archivo.type)) {
      this.errorForm.set('La foto debe ser una imagen JPG, PNG o WEBP.');
      return;
    }
    if (archivo.size > FOTO_MAX_BYTES) {
      this.errorForm.set('La foto no puede pesar más de 2 MB.');
      return;
    }

    this.errorForm.set('');
    this.fotoArchivo.set(archivo);
    this.vistaPreviaFoto.set(URL.createObjectURL(archivo));
  }

  /** Descarta el archivo elegido (sigue la foto que ya estaba guardada). */
  quitarFoto(): void {
    this.limpiarFotoElegida();
  }

  private limpiarFotoElegida(): void {
    const previa = this.vistaPreviaFoto();
    if (previa) URL.revokeObjectURL(previa);
    this.fotoArchivo.set(null);
    this.vistaPreviaFoto.set('');
  }

  /**
   * Sube la foto elegida al backend (si hay). El backend guarda el binario
   * en la base de datos y actualiza `foto_perfil_url` del usuario.
   */
  private subirFotoElegida(
    usuarioId: number,
    alTerminar: (error?: HttpErrorResponse) => void,
  ): void {
    const archivo = this.fotoArchivo();
    if (!archivo) {
      alTerminar();
      return;
    }

    this.usuariosService.subirFoto(usuarioId, archivo).subscribe({
      next: () => alTerminar(),
      error: (err: HttpErrorResponse) => alTerminar(err),
    });
  }

  cerrarModal(): void {
    this.limpiarFotoElegida();
    this.mostrarModal.set(false);
  }

  /** Handler del <select> de rol (tipado-safe) */
  seleccionarRol(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value as RolUsuario;
    this.form.set({ ...this.form(), rol: valor });
  }

  /** Abre/cierra el panel de usuarios pendientes */
  togglePendientes(): void {
    this.pendientesAbierto.update((abierto) => !abierto);
  }

  /** Iniciales para el avatar de la lista de pendientes */
  iniciales(usuario: Usuario): string {
    const nombre = (usuario.nombre ?? '').trim();
    const apellido = (usuario.apellido ?? '').trim();
    const ini = (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
    return ini || '?';
  }

  // ── Guardar (agregar, editar o promover) ──────────────────
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

    if (this.modoPromocion()) {
      this.promover(f);
    } else if (this.modoEdicion()) {
      this.editar(f);
    } else {
      this.crear(f);
    }
  }

  /** Paso 1: crear el usuario; Paso 2: vincularlo como empleado; Paso 3: rol */
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
        password: f.password
      })
      .subscribe({
        next: (usuario) => {
          // La foto (si se eligió un archivo) se sube al backend, que la
          // guarda en la base de datos.
          this.subirFotoElegida(usuario.id, (errorFoto) => {
            if (errorFoto) {
              console.error('Error subiendo la foto:', errorFoto);
              this.guardando.set(false);
              this.errorForm.set(
                this.mensajeDeError(
                  errorFoto,
                  'El tatuador se creó, pero no se pudo subir su foto.'
                )
              );
              return;
            }

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
                  this.aplicarRol(usuario.id, f.rol, () => {
                    this.cerrarModal();
                    this.cargarTatuadores();
                    this.cargarUsuarios();
                  });
                },
                error: (err: HttpErrorResponse) => {
                  console.error('Error creando empleado:', err);
                  this.guardando.set(false);
                  this.errorForm.set(
                    this.mensajeDeError(err, 'El usuario se creó pero no se pudo vincularlo como tatuador.')
                  );
                }
              });
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
    const empleado = this.empleados().find((e) => e.id === id);
    if (!empleado) return;

    this.guardando.set(true);
    this.errorForm.set('');

    // 1) Actualizar los datos del usuario (nombre, apellido).
    //    La foto NO se manda aquí: si se eligió un archivo se sube después
    //    con POST /api/usuarios/:id/foto.
    this.usuariosService
      .actualizarUsuario(empleado.usuario_id, {
        nombre: f.nombre.trim(),
        apellido: f.apellido.trim()
      })
      .subscribe({
        next: () => {
          this.subirFotoElegida(empleado.usuario_id, (errorFoto) => {
            if (errorFoto) {
              console.error('Error subiendo la foto:', errorFoto);
              this.guardando.set(false);
              this.errorForm.set(
                this.mensajeDeError(
                  errorFoto,
                  'Se actualizaron los datos, pero no se pudo subir la foto.'
                )
              );
              return;
            }

            // 2) Actualizar el empleado (especialidad, biografía, activo)
            this.empleadosService
              .actualizarEmpleado(id, {
                especialidad: f.especialidad.trim(),
                biografia: f.biografia.trim() || undefined,
                activo: f.activo
              })
              .subscribe({
                next: () => {
                  this.guardando.set(false);
                  this.aplicarRol(empleado.usuario_id, f.rol, () => {
                    this.cerrarModal();
                    this.cargarTatuadores();
                    this.cargarUsuarios();
                  });
                },
                error: (err: HttpErrorResponse) => {
                  console.error('Error actualizando tatuador:', err);
                  this.guardando.set(false);
                  this.errorForm.set(this.mensajeDeError(err, 'No se pudo actualizar el tatuador.'));
                }
              });
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error actualizando usuario:', err);
          this.guardando.set(false);
          this.errorForm.set(this.mensajeDeError(err, 'No se pudieron actualizar los datos personales.'));
        }
      });
  }

  /**
   * Convierte un usuario ya registrado en tatuador: crea su ficha de
   * empleado y le asigna el rol elegido.
   */
  private promover(f: FormTatuador): void {
    const usuario = this.usuarios().find((u) => u.email === f.email.trim());
    if (!usuario) {
      this.errorForm.set('No se encontró el usuario a promover.');
      return;
    }

    this.guardando.set(true);
    this.errorForm.set('');

    this.empleadosService
      .crearEmpleado({
        usuario_id: usuario.id,
        especialidad: f.especialidad.trim(),
        biografia: f.biografia.trim() || undefined,
        activo: true
      })
      .subscribe({
        next: () => {
          this.subirFotoElegida(usuario.id, (errorFoto) => {
            if (errorFoto) {
              console.error('Error subiendo la foto:', errorFoto);
              this.guardando.set(false);
              this.errorForm.set(
                this.mensajeDeError(
                  errorFoto,
                  'Se creó la ficha de tatuador, pero no se pudo subir la foto.'
                )
              );
              return;
            }

            this.guardando.set(false);
            this.aplicarRol(usuario.id, f.rol, () => {
              this.cerrarModal();
              this.cargarTatuadores();
              this.cargarUsuarios();
            });
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error creando ficha de empleado:', err);
          this.guardando.set(false);
          this.errorForm.set(this.mensajeDeError(err, 'No se pudo convertir en tatuador.'));
        }
      });
  }

  /**
   * Asigna el rol al usuario. Requiere ser admin; si el backend responde 403
   * se avisa, pero NO se deshace lo ya creado.
   */
  private aplicarRol(usuarioId: number, rol: RolUsuario, alTerminar: () => void): void {
    this.usuariosService.cambiarRol(usuarioId, rol).subscribe({
      next: () => alTerminar(),
      error: (err: HttpErrorResponse) => {
        console.error('Error cambiando el rol:', err);
        if (err.status === 403) {
          this.errorForm.set(
            'Se guardó la ficha, pero solo un administrador puede cambiar el rol del usuario.'
          );
        }
        alTerminar();
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
      next: () => {
        this.cargarTatuadores();
        this.cargarUsuarios();
      },
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
      activo: true,
      rol: 'empleado'
    };
  }

  private mensajeDeError(err: HttpErrorResponse, porDefecto: string): string {
    if (err.status === 409) return 'El correo ingresado ya está registrado.';
    if (err.status === 401) return 'Tu sesión expiró. Cierra sesión y vuelve a entrar.';
    if (err.status === 403) return 'Necesitas rol de administrador para esta operación.';
    return porDefecto;
  }
}
