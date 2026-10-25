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
  readonly empleados = signal<Empleado[]>([]);
  readonly horarios = signal<HorarioTrabajador[]>([]);
  readonly misCitas = signal<Cita[]>([]);
  readonly todasLasCitas = signal<Cita[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly reservando = signal(false);

  // ── Selección ─────────────────────────────────────────────
  readonly fechaSeleccionada = signal(0);
  readonly horaSeleccionada = signal('');
  readonly empleadoSeleccionado = signal<number | null>(null);

  // ── Edición de una cita existente ─────────────────────────
  readonly modoEdicion = signal(false);
  readonly citaEditar = signal<Cita | null>(null);

  // ── Calendario ────────────────────────────────────────────
  readonly meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  readonly anios = [new Date().getFullYear(), new Date().getFullYear() + 1];

  readonly mesActual = signal(new Date().getMonth());
  readonly anioActual = signal(new Date().getFullYear());

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

  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarMisCitas();

    // Verificar si viene una cita para editar (navegación desde Profile)
    const state = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    const citaEditar: Cita | undefined = state?.['citaEditar'];
    if (citaEditar?.fecha) {
      this.citaEditar.set(citaEditar);
      this.modoEdicion.set(true);

      const partes = citaEditar.fecha.split('-');
      const dia = parseInt(partes[2], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const anio = parseInt(partes[0], 10);

      if (!isNaN(dia) && !isNaN(mes) && !isNaN(anio)) {
        this.fechaSeleccionada.set(dia);
        this.mesActual.set(mes);
        this.anioActual.set(anio);
      }

      this.horaSeleccionada.set(citaEditar.hora_inicio);
      this.empleadoSeleccionado.set(citaEditar.empleado_id);
    }
  }

  // ── Carga de datos ────────────────────────────────────────

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

  cambiarMes(mes: number): void {
    this.mesActual.set(Number(mes));
    this.fechaSeleccionada.set(0);
  }

  cambiarAnio(anio: number): void {
    this.anioActual.set(Number(anio));
    this.fechaSeleccionada.set(0);
  }

  /** Fecha ISO ("YYYY-MM-DD") del día seleccionado en el calendario */
  private fechaISODe(dia: number): string {
    return aFechaISO(new Date(this.anioActual(), this.mesActual(), dia));
  }

  // ── Validaciones ──────────────────────────────────────────

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
    return this.todasLasCitas().some(
      (c) =>
        c.empleado_id === id &&
        c.fecha === fecha &&
        c.hora_inicio === hora &&
        c.estado !== 'cancelada' &&
        c.id !== this.citaEditar()?.id
    );
  }

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

  seleccionarHora(hora: string): void {
    this.horaSeleccionada.set(hora);
  }

  seleccionarEmpleado(id: number): void {
    this.empleadoSeleccionado.set(id);
    this.horaSeleccionada.set('');
  }

  // ── Reservar / actualizar ─────────────────────────────────

  reservar(): void {
    const usuario = this.auth.obtenerUsuario();
    if (!usuario) {
      alert('Debes iniciar sesión antes de reservar');
      return;
    }

    const dia = this.fechaSeleccionada();
    const hora = this.horaSeleccionada();
    const empleadoId = this.empleadoSeleccionado();

    if (!dia || !hora || !empleadoId) {
      alert('Faltan datos: selecciona tatuador, fecha y hora');
      return;
    }
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
    const horaFin = deMinutos(aMinutos(hora) + DURACION_CITA_MIN);
    this.reservando.set(true);

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
        this.cargarMisCitas();
        this.router.navigate(['/profile']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error guardando cita:', err);
        this.reservando.set(false);
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

  mostrarHora(hora: string): string {
    return a12h(hora);
  }

  nombreDia(dia: number): string {
    return NOMBRES_DIA[diaDeLaSemana(this.fechaISODe(dia))];
  }

  nombreDeCita(cita: Cita): string {
    const u = cita.empleados?.usuarios;
    return u ? `${u.nombre} ${u.apellido}`.trim() : `Empleado #${cita.empleado_id}`;
  }

  mostrarFecha(iso: string): string {
    return aFechaLegible(iso);
  }
}
