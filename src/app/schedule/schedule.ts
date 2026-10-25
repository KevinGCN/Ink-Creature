/**
 * Módulo Schedules (Agenda de citas) — Angular 21.
 *
 * - Signals + control flow (@if/@for) en vez de NgModules/*ngIf/*ngFor.
 * - Citas en vivo desde el backend NestJS (GET/POST/PATCH/DELETE /api/citas).
 * - La disponibilidad por tatuador viene de /api/horarios-trabajador.
 * - Se corrige el bug del correo vs email: el filtro de "mis citas" ahora
 *   usa el usuario_id real del backend.
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { Cita, CitaService } from '../services/citas';
import { Empleado, EmpleadoService } from '../services/empleados';
import { HorarioService } from '../services/horarios';
import { HorarioTrabajador } from '../models/empleado';
import {
  NOMBRES_DIA,
  a12h,
  aFechaISO,
  aFechaLegible,
  aMinutos,
  deMinutos,
  diaDeLaSemana,
  fechaADate
} from '../utils/fechas';

/** Duración fija de una cita (30 minutos) */
const DURACION_CITA_MIN = 30;

/**
 * Agenda de citas: calendario mensual + franjas de 30 minutos.
 *
 * Flujo:
 * 1. `ngOnInit` carga los tatuadores activos y las citas del usuario.
 * 2. Al elegir tatuador y día, `horasFiltradas()` cruza tres fuentes:
 *    horarios del trabajador, citas ya reservadas y la hora actual.
 * 3. `reservar()` crea o modifica la cita y vuelve al perfil.
 *
 * Las fechas viajan como ISO "YYYY-MM-DD" y las horas como "HH:mm" para que
 * el backend (que trabaja en `APP_TIMEZONE`) no tenga que reinterpretarlas:
 * así se evita el desfase típico de `Date` con UTC al cruzar el día.
 */
@Component({
  selector: 'app-schedule',
  imports: [FormsModule, RouterLink],
  standalone: true,
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule implements OnInit {
  private readonly citaService = inject(CitaService);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly horarioService = inject(HorarioService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // ── Datos del backend ─────────────────────────────────────
  /** Catálogo de tatuadores activos (se descartan los inactivos al cargar) */
  readonly empleados = signal<Empleado[]>([]);
  /** Horarios de trabajo de todos los tatuadores (día de la semana + rango) */
  readonly horarios = signal<HorarioTrabajador[]>([]);
  /** Citas del usuario autenticado (filtradas en el backend por usuario_id) */
  readonly misCitas = signal<Cita[]>([]);
  /**
   * Todas las citas del sistema (endpoint público): se usan solo para saber
   * qué franjas ya están ocupadas y no ofrecerlas como disponibles.
   */
  readonly todasLasCitas = signal<Cita[]>([]);
  /** true mientras se traen tatuadores del backend (bloquea el calendario) */
  readonly cargando = signal(true);
  /** Mensaje de error global mostrado en el template */
  readonly error = signal('');
  /** true mientras se envía la cita al backend (evita doble reserva) */
  readonly reservando = signal(false);

  // ── Selección ─────────────────────────────────────────────
  /** Día del mes pulsado (0 = ninguno todavía) */
  readonly fechaSeleccionada = signal(0);
  /** Franja horaria elegida en formato "HH:mm" ('' = ninguna) */
  readonly horaSeleccionada = signal('');
  /** Id del tatuador elegido; null fuerza a seleccionarlo antes de reservar */
  readonly empleadoSeleccionado = signal<number | null>(null);

  // ── Edición de una cita existente ─────────────────────────
  /** true cuando el formulario modifica una cita existente en vez de crear una */
  readonly modoEdicion = signal(false);
  /** Cita que se está editando (llega por `state` desde el perfil) */
  readonly citaEditar = signal<Cita | null>(null);

  // ── Calendario ────────────────────────────────────────────
  /** Nombres de mes tal como se muestran en el `<select>` del calendario */
  readonly meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  /** Solo se permite agendar en el año actual o el siguiente */
  readonly anios = [new Date().getFullYear(), new Date().getFullYear() + 1];

  /** Mes visible (0 = enero) */
  readonly mesActual = signal(new Date().getMonth());
  /** Año visible */
  readonly anioActual = signal(new Date().getFullYear());

  /**
   * Días que tiene el mes visible. Se usa el truco `new Date(año, mes + 1, 0)`:
   * el día 0 del mes siguiente equivale al último día del mes actual, así
   * febrero y los meses de 31 días se resuelven sin tablas ni bisiestos a mano.
   */
  readonly diasMes = computed(() => {
    const dias = new Date(this.anioActual(), this.mesActual() + 1, 0).getDate();
    return Array.from({ length: dias }, (_, i) => i + 1);
  });

  /** Franjas de media hora: 8:00 → 20:30 (en formato "HH:mm") */
  readonly horasDisponibles: string[] = (() => {
    const horas: string[] = [];
    for (let min = 8 * 60; min <= 20 * 60 + 30; min += 30) {
      horas.push(deMinutos(min));
    }
    return horas;
  })();

  /** Nombre del tatuador seleccionado (para mensajes) */
  readonly nombreTatuadorSeleccionado = computed(() => {
    const id = this.empleadoSeleccionado();
    const empleado = this.empleados().find((e) => e.id === id);
    return empleado
      ? `${empleado.usuarios?.nombre ?? ''} ${empleado.usuarios?.apellido ?? ''}`.trim()
      : '';
  });

  /**
   * Ciclo de vida: precarga catálogos y, si venimos del perfil con una cita
   * en `state`, rellena el calendario para editarla en el mismo formulario.
   */
  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarMisCitas();

    // Verificar si viene una cita para editar (navegación desde Profile)
    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    const citaEditar: Cita | undefined = state?.['citaEditar'];
    if (citaEditar?.fecha) {
      this.citaEditar.set(citaEditar);
      this.modoEdicion.set(true);

      // La fecha llega como "YYYY-MM-DD": se descompone a mano para no pasar
      // por `new Date(...)`, que interpretaría el ISO como UTC y podría
      // devolver el día anterior según la zona del navegador.
      const partes = citaEditar.fecha.split('-');
      const dia = parseInt(partes[2], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const anio = parseInt(partes[0], 10);

      if (!isNaN(dia) && !isNaN(mes) && !isNaN(anio)) {
        this.fechaSeleccionada.set(dia);
        this.mesActual.set(mes);
        this.anioActual.set(anio);
      }

      // Se restauran también hora y tatuador para que el formulario quede
      // igual que la cita original y solo se cambie lo que el usuario toque.
      this.horaSeleccionada.set(citaEditar.hora_inicio);
      this.empleadoSeleccionado.set(citaEditar.empleado_id);
    }
  }

  // ── Carga de datos ────────────────────────────────────────

  /**
   * Trae el catálogo de tatuadores. Solo se muestran los `activo`: un
   * tatuador dado de baja no debe poder recibir citas nuevas.
   * Al terminar encadena `cargarHorarios()`, que necesita la lista.
   */
  private cargarEmpleados(): void {
    this.cargando.set(true);
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        this.empleados.set(empleados.filter((e) => e.activo));
        this.cargando.set(false);
        this.cargarHorarios();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error cargando empleados:', err);
        this.error.set('No se pudo conectar con el backend para cargar los tatuadores.');
        this.cargando.set(false);
      }
    });
  }

  /**
   * Carga los horarios de los trabajadores y, en paralelo, todas las citas.
   * Las citas se piden sin filtrar porque solo se usan para marcar franjas
   * ocupadas; los errores se registran pero no bloquean la agenda.
   */
  private cargarHorarios(): void {
    this.horarioService.getHorarios().subscribe({
      next: (horarios) => this.horarios.set(horarios),
      error: (err) => console.error('Error cargando horarios:', err)
    });

    // Todas las citas (público) para ocupar los horarios ya reservados
    this.citaService.getCitas().subscribe({
      next: (citas) => this.todasLasCitas.set(citas),
      error: (err) => console.error('Error cargando citas:', err)
    });
  }

  /**
   * Citas del usuario logueado. Se usa `usuario.id` (no el correo): ese fue
   * el bug histórico que hacía que un usuario viera citas de otro o ninguna.
   * Un 401 se ignora a propósito porque el interceptor ya cierra la sesión.
   */
  private cargarMisCitas(): void {
    const usuario = this.auth.obtenerUsuario();
    if (!usuario) return;

    this.citaService.getCitasDeUsuario(usuario.id).subscribe({
      next: (citas) => this.misCitas.set(citas),
      error: (err: HttpErrorResponse) => {
        console.error('Error cargando mis citas:', err);
        if (err.status !== 401) {
          this.error.set('No se pudieron cargar tus citas.');
        }
      }
    });
  }

  // ── Calendario ────────────────────────────────────────────

  /**
   * Cambia de mes y limpia el día elegido: el número de día no es comparable
   * entre meses (el 31 de enero no existe en febrero).
   */
  cambiarMes(mes: number): void {
    this.mesActual.set(Number(mes));
    this.fechaSeleccionada.set(0);
  }

  /** Cambia de año; también reinicia el día por el mismo motivo que el mes. */
  cambiarAnio(anio: number): void {
    this.anioActual.set(Number(anio));
    this.fechaSeleccionada.set(0);
  }

  /** Fecha ISO ("YYYY-MM-DD") del día seleccionado en el calendario */
  private fechaISODe(dia: number): string {
    return aFechaISO(new Date(this.anioActual(), this.mesActual(), dia));
  }

  // ── Validaciones ──────────────────────────────────────────

  /**
   * Un día anterior a hoy no se puede reservar. Se normaliza "hoy" a
   * medianoche para comparar solo fechas y no horas del día.
   */
  esFechaPasada(dia: number): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaADate(this.fechaISODe(dia)) < hoy;
  }

  /** Horarios del tatuador seleccionado para el día de la semana dado */
  private horariosDelDia(dia: number): HorarioTrabajador[] {
    const id = this.empleadoSeleccionado();
    if (!id) return [];
    const dow = diaDeLaSemana(this.fechaISODe(dia));
    return this.horarios().filter((h) => h.empleado_id === id && h.dia_semana === dow);
  }

  /** true si el tatuador tiene horarios cargados pero ninguno ese día */
  esDescansoEmpleado(dia: number): boolean {
    const id = this.empleadoSeleccionado();
    if (!id) return false;
    const delTatuador = this.horarios().filter((h) => h.empleado_id === id);
    if (delTatuador.length === 0) return false; // sin horarios cargados → disponible
    return this.horariosDelDia(dia).length === 0;
  }

  /** true si la hora está dentro de algún rango de trabajo ese día */
  estaEnHorarioEmpleado(hora: string): boolean {
    const dia = this.fechaSeleccionada();
    if (!dia) return true;
    const rangos = this.horariosDelDia(dia);
    if (rangos.length === 0) return true; // sin horarios cargados → disponible

    const min = aMinutos(hora);
    return rangos.some(
      (r) => min >= aMinutos(r.hora_inicio) && min <= aMinutos(r.hora_fin)
    );
  }

  /** true si ese horario ya está reservado para el tatuador en esa fecha */
  horaOcupada(hora: string): boolean {
    const dia = this.fechaSeleccionada();
    const id = this.empleadoSeleccionado();
    if (!dia || !id) return false;

    const fecha = this.fechaISODe(dia);
    // Se excluye la cita que se está editando: si no, su propia franja
    // aparecería como ocupada y no se podría guardar sin cambiar de hora.
    return this.todasLasCitas().some(
      (c) =>
        c.empleado_id === id &&
        c.fecha === fecha &&
        c.hora_inicio === hora &&
        c.estado !== 'cancelada' &&
        c.id !== this.citaEditar()?.id
    );
  }

  /**
   * Hora ya vencida del día de hoy (no se puede reservar hacia atrás).
   * Si el día es futuro no hay nada que comprobar; si es hoy se comparan
   * minutos absolutos del día, que evitan lidiar con objetos `Date`.
   */
  esHoraPasada(hora: string): boolean {
    const dia = this.fechaSeleccionada();
    if (!dia) return false;

    const seleccion = fechaADate(this.fechaISODe(dia));
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (seleccion > hoy) return false;

    const ahoraMin = hoy.getHours() * 60 + hoy.getMinutes();
    return aMinutos(hora) <= ahoraMin;
  }

  /** Horas filtradas por horario del tatuador, ocupadas y hora pasada */
  horasFiltradas(): string[] {
    return this.horasDisponibles.filter(
      (hora) =>
        this.estaEnHorarioEmpleado(hora) &&
        !this.horaOcupada(hora) &&
        !this.esHoraPasada(hora)
    );
  }

  // ── Selección ─────────────────────────────────────────────

  /**
   * Selecciona un día del calendario validando antes las dos reglas de
   * negocio (no pasado y no día de descanso del tatuador).
   */
  seleccionarFecha(dia: number): void {
    if (this.esFechaPasada(dia)) {
      alert('No puedes seleccionar fechas pasadas');
      return;
    }
    if (this.esDescansoEmpleado(dia)) {
      alert(`${this.nombreTatuadorSeleccionado() || 'El tatuador'} descansa ese día`);
      return;
    }
    this.fechaSeleccionada.set(dia);
  }

  /** Fija la franja horaria elegida (ya viene filtrada por el template) */
  seleccionarHora(hora: string): void {
    this.horaSeleccionada.set(hora);
  }

  /**
   * Cambiar de tatuador invalida la hora elegida: los horarios son por
   * persona, así que la franja anterior puede no existir para el nuevo.
   */
  seleccionarEmpleado(id: number): void {
    this.empleadoSeleccionado.set(id);
    this.horaSeleccionada.set('');
  }

  // ── Reservar / actualizar ─────────────────────────────────

  /**
   * Crea la cita o, en modo edición, actualiza la existente.
   *
   * Se repiten en el cliente las validaciones del backend (horario, fecha
   * pasada y ocupación) para dar un mensaje inmediato; el backend vuelve a
   * validar y es la autoridad final. La duración siempre es de 30 minutos,
   * por eso `hora_fin` se calcula sumando `DURACION_CITA_MIN`.
   */
  reservar(): void {
    const usuario = this.auth.obtenerUsuario();
    if (!usuario) {
      alert('Debes iniciar sesión antes de reservar');
      return;
    }

    const dia = this.fechaSeleccionada();
    const hora = this.horaSeleccionada();
    const empleadoId = this.empleadoSeleccionado();

    // Validaciones de entrada antes de tocar la red.
    if (!dia || !hora || !empleadoId) {
      alert('Faltan datos: selecciona tatuador, fecha y hora');
      return;
    }
    // La hora debe caer dentro de algún rango de trabajo del tatuador.
    if (!this.estaEnHorarioEmpleado(hora)) {
      alert(`La hora seleccionada está fuera del horario de ${this.nombreTatuadorSeleccionado()}`);
      return;
    }
    if (this.esFechaPasada(dia)) {
      alert('No puedes reservar en fechas pasadas');
      return;
    }
    if (this.horaOcupada(hora)) {
      alert('Ese horario ya está ocupado');
      return;
    }

    const fecha = this.fechaISODe(dia);
    // La cita dura siempre media hora: el fin se deriva del inicio.
    const horaFin = deMinutos(aMinutos(hora) + DURACION_CITA_MIN);
    this.reservando.set(true);

    // Una sola petición según el modo: PATCH si se edita, POST si es nueva.
    const peticion = this.modoEdicion() && this.citaEditar()
      ? this.citaService.actualizarCita(this.citaEditar()!.id, {
          empleado_id: empleadoId,
          fecha,
          hora_inicio: hora,
          hora_fin: horaFin
        })
      : this.citaService.crearCita({
          usuario_id: usuario.id,
          empleado_id: empleadoId,
          fecha,
          hora_inicio: hora,
          hora_fin: horaFin
        });

    peticion.subscribe({
      next: () => {
        this.reservando.set(false);
        alert(this.modoEdicion() ? 'Cita modificada con éxito' : 'Cita reservada con éxito');
        // Se refresca la lista y se vuelve al perfil, donde viven las citas.
        this.cargarMisCitas();
        this.router.navigate(['/profile']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error guardando cita:', err);
        this.reservando.set(false);
        // 409 = otra persona tomó esa franja entre la carga y el envío.
        if (err.status === 409) {
          alert('Ese horario acaba de ser reservado para otro usuario. Elige otra hora.');
        } else if (err.status === 401) {
          alert('Tu sesión expiró. Cierra sesión y vuelve a entrar.');
        } else {
          alert('No se pudo guardar la cita. Intenta nuevamente.');
        }
      }
    });
  }

  // ── Helpers para el template ──────────────────────────────

  /** Pasa "HH:mm" (24 h) al formato de 12 horas que se muestra al usuario */
  mostrarHora(hora: string): string {
    return a12h(hora);
  }

  /** Nombre del día de la semana (Lunes…Domingo) para el número de día dado */
  nombreDia(dia: number): string {
    return NOMBRES_DIA[diaDeLaSemana(this.fechaISODe(dia))];
  }

  /** Nombre del tatuador de una cita ya guardada, con fallback por si falta */
  nombreDeCita(cita: Cita): string {
    const u = cita.empleados?.usuarios;
    return u ? `${u.nombre} ${u.apellido}`.trim() : `Empleado #${cita.empleado_id}`;
  }

  /** Fecha ISO → texto legible (p. ej. "lunes, 3 de noviembre de 2026") */
  mostrarFecha(iso: string): string {
    return aFechaLegible(iso);
  }
}
