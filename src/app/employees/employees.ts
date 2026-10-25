/**
 * Módulo Workers (Tatuadores) — Angular 21.
 *
 * - Signals + control flow (@if/@for) en vez de NgModules/*ngIf/*ngFor.
 * - Datos en vivo desde el backend NestJS (GET/POST/PATCH/DELETE /api/empleados).
 * - La creación de un tatuador registra primero un usuario en el backend
 *   (POST /api/usuarios) y luego su vínculo empleado (POST /api/empleados).
 * - El CRUD de tatuadores y la gestión de roles solo están disponibles para
 *   usuarios con rol 'admin': el backend protege empleados y el cambio de rol
 *   con `JwtAuthGuard + RolesGuard` (403 si no eres admin) y listar usuarios
 *   con `GET /api/usuarios` también es solo de admin.
 *
 * Concepto que hay que tener claro en toda la pantalla:
 * - Un USUARIO registrado (tabla `usuarios`) solo es una cuenta con la que se
 *   puede iniciar sesión; por sí solo NO aparece en el catálogo de tatuadores.
 * - Un TATUADOR necesita DOS piezas a la vez: una fila en `empleados` (la ficha
 *   con especialidad/biografía que lo hace visible) y el rol `empleado` (el
 *   nivel de permiso con el que opera). "Promover a tatuador" es justamente
 *   crear la ficha y subir el rol de una cuenta que ya existía.
 * - La foto NO se captura como URL de texto: se elige un archivo y se sube
 *   como multipart (POST /api/usuarios/:id/foto). El backend guarda el binario
 *   en la base de datos y deja en `foto_perfil_url` la ruta relativa
 *   "/api/imagenes/<id>", que se pinta con `urlImagen()`.
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
/** Tipos MIME aceptados: el backend solo admite JPG, PNG y WEBP */
const FOTO_TIPOS = /^image\/(jpeg|png|webp)$/;

@Component({
  selector: 'app-employees',
  imports: [FormsModule, RouterLink],
  standalone: true,
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  /** Sesión actual: de aquí sale el rol que habilita el CRUD y el selector de rol */
  private readonly auth = inject(AuthService);
  /** Fichas de tatuador (tabla `empleados`) */
  private readonly empleadosService = inject(EmpleadoService);
  /** Cuentas de usuario: crear, editar, cambiar rol y subir la foto */
  private readonly usuariosService = inject(UsuarioService);

  /** Estado reactivo */
  /** Fichas de la tabla `empleados` (activos e inactivos) */
  readonly empleados = signal<Empleado[]>([]);
  /** Cuentas registradas: sirven para detectar a quién le falta la ficha */
  readonly usuarios = signal<Usuario[]>([]);
  /** `true` mientras hay una petición de carga en curso */
  readonly cargando = signal(true);
  /** Mensaje de error de carga (cadena vacía = sin error) */
  readonly error = signal('');

  /** Solo los tatuadores activos se muestran en el catálogo */
  readonly tatuadores = computed(() => this.empleados().filter((e) => e.activo));

  /** Permisos administrativos derivados del rol del backend */
  readonly esAdmin = computed(() => this.auth.esAdmin());

  /** Usuarios registrados que todavía no son tatuadores (para promoverlos) */
  /**
   * La comprobación se hace contra `empleados.usuario_id` y no contra el rol:
   * alguien con rol `empleado` pero sin ficha tampoco saldría en el catálogo,
   * así que se le sigue considerando "pendiente" hasta crearle la ficha.
   */
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
  /** Visibilidad del modal único que sirve para agregar, editar y promover */
  readonly mostrarModal = signal(false);
  /** `true` cuando el modal está editando una ficha ya existente */
  readonly modoEdicion = signal(false);
  /** Modo promoción: el usuario ya existe y solo se crea su ficha de empleado */
  readonly modoPromocion = signal(false);
  /** Id de la ficha (`empleados.id`) en edición; null al agregar o promover */
  readonly editandoId = signal<number | null>(null);
  /** Contenido actual del formulario (se reemplaza entero en cada cambio) */
  readonly form = signal<FormTatuador>(Employees.formVacio());
  /** Error de validación o del backend mostrado dentro del modal */
  readonly errorForm = signal('');
  /** Bloquea los botones mientras hay peticiones en vuelo */
  readonly guardando = signal(false);

  /** Archivo de foto elegido en el modal (aún no subido al backend) */
  readonly fotoArchivo = signal<File | null>(null);
  /** Vista previa local del archivo elegido */
  readonly vistaPreviaFoto = signal('');

  /** Placeholder inline para cuando no hay foto (no usa un archivo en disco) */
  readonly placeholder = FOTO_PLACEHOLDER;

  /**
   * Carga inicial: fichas de tatuador y todas las cuentas registradas.
   * Se necesitan las dos listas para poder calcular quién puede promoverse.
   */
  ngOnInit(): void {
    this.cargarTatuadores();
    this.cargarUsuarios();
  }

  /**
   * Trae las fichas de tatuador. No filtra por `activo` a propósito: el panel
   * de administración también muestra las inactivas (para poder reactivarlas);
   * solo el catálogo usa el computed `tatuadores`, que sí filtra.
   */
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

  /** Carga todos los usuarios registrados (GET /api/usuarios, solo admin) */
  cargarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: (err) => console.error('Error cargando usuarios:', err)
    });
  }

  /** Nombre y apellido del usuario asociado a la ficha, ya recortados */
  nombreCompleto(empleado: Empleado): string {
    return `${empleado.usuarios?.nombre ?? ''} ${empleado.usuarios?.apellido ?? ''}`.trim();
  }

  /** Foto del tatuador resuelta contra el backend, con placeholder de respaldo */
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
  /**
   * Abre el modal en modo "agregar". Este es el único modo que crea la cuenta
   * desde cero, así que el formulario incluirá correo y contraseña además de
   * los datos de la ficha.
   */
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
  /**
   * Abre el modal en modo "editar", precargando lo que ya está en el backend.
   * La contraseña se deja vacía a propósito (aquí no se cambia) y la foto solo
   * se reemplaza si el admin elige un archivo nuevo.
   */
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
  /**
   * Abre el modal en modo "promover": el usuario ya existe, así que no se
   * piden correo ni contraseña, solo los datos de la ficha (especialidad,
   * biografía, activo) y el rol que se le asignará al confirmar.
   */
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

    // Validación temprana en el cliente (tipo y tamaño): así el admin ve el
    // error antes de encadenar las peticiones de alta.
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

  /**
   * Suelta el archivo elegido y libera el object URL de la vista previa:
   * el navegador mantiene vivo el blob hasta que se hace `revokeObjectURL`,
   * así que sin esto cada apertura del modal dejaría memoria retenida.
   */
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

  /** Cierra el modal y descarta la foto elegida (no toca la ya guardada) */
  cerrarModal(): void {
    this.limpiarFotoElegida();
    this.mostrarModal.set(false);
  }

  /** Handler del <select> de rol (tipado-safe) */
  /**
   * El rol NO viaja con el PATCH del usuario: `UpdateUsuarioDto` lo excluye a
   * propósito para que un cliente no pueda auto-promoverse. Por eso se aplica
   * aparte con `aplicarRol()` → PATCH /api/usuarios/:id/rol, endpoint que el
   * backend restringe a admin (403 para el resto).
   */
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
  /**
   * Punto de entrada del botón "Guardar": valida lo que comparten los tres
   * modos y delega en `crear`, `editar` o `promover` según cómo se abrió el
   * modal. Un solo botón evita duplicar la lógica de guardado en la plantilla.
   */
  guardar(): void {
    const f = this.form();

    // Validaciones comunes: sin nombre ni especialidad no hay ficha válida
    if (!f.nombre.trim() || !f.apellido.trim()) {
      this.errorForm.set('Nombre y apellido son obligatorios.');
      return;
    }
    if (!f.especialidad.trim()) {
      this.errorForm.set('La especialidad es obligatoria.');
      return;
    }

    // El modo decide el flujo: promover no crea cuenta, editar no crea nada
    if (this.modoPromocion()) {
      this.promover(f);
    } else if (this.modoEdicion()) {
      this.editar(f);
    } else {
      this.crear(f);
    }
  }

  /**
   * Alta completa de un tatuador nuevo. El backend no tiene un endpoint que
   * haga todo, así que se encadenan peticiones (si una falla, se corta):
   *   1) POST /api/usuarios            → crea la cuenta y devuelve su id
   *      y, si se eligió un archivo, POST /api/usuarios/:id/foto
   *   2) POST /api/empleados           → crea la ficha que lo hace tatuador
   *   3) PATCH /api/usuarios/:id/rol   → le asigna el rol elegido
   * El orden importa: sin usuario no hay a quién vincular ni a quién poner rol.
   */
  /** Paso 1: crear el usuario; Paso 2: vincularlo como empleado; Paso 3: rol */
  private crear(f: FormTatuador): void {
    // Solo en este modo hay que crear la cuenta, así que aquí sí se exigen
    // correo y contraseña (en "editar" y "promover" la cuenta ya existe).
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

    // Paso 1: crear la cuenta. A partir de aquí `usuario.id` es el nexo entre
    // la cuenta, la foto y la ficha de empleado.
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

            // Paso 2: la ficha de empleado es lo que lo convierte en tatuador
            // (aparecer en el catálogo); sin ella el rol no basta.
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
                  // Paso 3: el rol se aplica al final; si el backend lo rechaza
                  // (403) la ficha ya quedó creada y solo se avisa al admin.
                  this.aplicarRol(usuario.id, f.rol, () => {
                    this.cerrarModal();
                    this.cargarTatuadores();
                    this.cargarUsuarios();
                  });
                },
                error: (err: HttpErrorResponse) => {
                  console.error('Error creando empleado:', err);
                  // La cuenta ya existe (el paso 1 terminó); solo falló el vínculo,
                  // por eso el mensaje habla de "usuario creado sin tatuador".
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

  /**
   * Edición de una ficha existente. Se actualiza en cadena: datos del usuario,
   * foto (si se eligió archivo) y ficha de empleado, dejando el rol para el
   * final. Así nunca queda una ficha a medias con permisos ya cambiados.
   */
  private editar(f: FormTatuador): void {
    const id = this.editandoId();
    if (id === null) return;
    // La ficha da el `usuario_id` que hay que tocar; sin ella no hay nada que editar
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
   * No se crea cuenta ni contraseña porque la cuenta ya existe (es justamente
   * lo que se está promoviendo), así que el flujo es ficha → foto → rol.
   */
  private promover(f: FormTatuador): void {
    // El correo es el identificador que llega del panel de pendientes
    const usuario = this.usuarios().find((u) => u.email === f.email.trim());
    if (!usuario) {
      this.errorForm.set('No se encontró el usuario a promover.');
      return;
    }

    this.guardando.set(true);
    this.errorForm.set('');

    // Paso 1: crear la ficha. Se fuerza `activo: true` porque se está
    // incorporando al catálogo en este momento.
    this.empleadosService
      .crearEmpleado({
        usuario_id: usuario.id,
        especialidad: f.especialidad.trim(),
        biografia: f.biografia.trim() || undefined,
        activo: true
      })
      .subscribe({
        next: () => {
          // Paso 2: la foto es opcional; si se eligió archivo se sube ahora,
          // cuando ya existe el usuario al que asociarla.
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

            // Paso 3: el rol es lo que le da permiso de empleado; la ficha sola
            // lo haría visible en el catálogo pero sin nivel de acceso.
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
  /**
   * Elimina al tatuador borrando su cuenta de usuario: el backend arrastra la
   * ficha de `empleados` en cascada. Si el empleado tiene citas u horarios, la
   * FK lo impide y el backend responde con error (se avisa en el alert).
   */
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
  /**
   * Formulario neutro reutilizado al agregar y al promover. Los valores por
   * defecto (`activo: true`, rol `empleado`) ya apuntan a "tatuador en alta".
   */
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

  /**
   * Traduce los códigos HTTP que el backend usa para casos conocidos (correo
   * duplicado, sesión vencida, falta de permisos). Cualquier otro estado cae
   * en el mensaje por defecto de la operación que estaba en curso.
   */
  private mensajeDeError(err: HttpErrorResponse, porDefecto: string): string {
    if (err.status === 409) return 'El correo ingresado ya está registrado.';
    if (err.status === 401) return 'Tu sesión expiró. Cierra sesión y vuelve a entrar.';
    if (err.status === 403) return 'Necesitas rol de administrador para esta operación.';
    return porDefecto;
  }
}
