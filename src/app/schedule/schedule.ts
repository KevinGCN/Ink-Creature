import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CitaService } from '../services/citas';
import { EmpleadoService } from '../services/empleados';
import { AuthService } from '../services/auth';
import { Empleado } from '../models/empleado';
import { Cita } from '../models/cita';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-schedule',
  imports: [CommonModule, FormsModule, RouterLink],
  standalone: true,
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule implements OnInit {
  fechaSeleccionada: number = 0;
  horaSeleccionada: string = '';
  tatuadorSeleccionado: string = '';
  empleadoSeleccionadoId: number | null = null;

  empleados: Empleado[] = [];
  citas: Cita[] = [];
  private usuarioId: number = 0;
  modoEdicion: boolean = false;
  citaEditar: Cita | null = null;
  reservando: boolean = false;

  // =========================
  // CALENDARIO DINÁMICO
  // =========================
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  anios = [2026, 2027];

  // Horas disponibles por defecto (se filtrarán según empleado)
  horasDisponibles = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM',
    '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'
  ];

  mesActual = new Date().getMonth();
  anioActual = new Date().getFullYear();

  diasMes: number[] = [];

  constructor(
    private citaService: CitaService,
    private empleadoService: EmpleadoService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    const usuario = this.auth.obtenerUsuario();
    this.usuarioId = usuario?.id ?? usuario?.uid ?? 0;

    this.cargarEmpleados();
    this.generarCalendario();
    this.cargarCitas();

    // Verificar si viene una cita para editar
    const state = this.router.getCurrentNavigation()?.extras?.state || history.state;
    if (state && state['citaEditar']) {
      this.citaEditar = state['citaEditar'];
      this.modoEdicion = true;

      if (this.citaEditar) {
        const fechaISO =
          this.citaEditar.fechaISO || this.fechaVisibleAISO(this.citaEditar.fecha);
        const [anio, mes, dia] = fechaISO.split('-').map(Number);

        if (!isNaN(dia) && !isNaN(mes) && !isNaN(anio)) {
          this.fechaSeleccionada = dia;
          this.mesActual = mes - 1;
          this.anioActual = anio;
          this.generarCalendario();
        }

        this.horaSeleccionada = this.citaEditar.hora;
        this.tatuadorSeleccionado = this.citaEditar.tatuador;
        this.empleadoSeleccionadoId = this.citaEditar.empleadoId ?? null;
      }
    }
  }

  // Genera los días según mes y año
  generarCalendario() {
    const dias = new Date(this.anioActual, this.mesActual + 1, 0).getDate();
    this.diasMes = Array.from({ length: dias }, (_, i) => i + 1);
  }

  cargarEmpleados(): void {
    this.empleadoService.getEmpleados().subscribe({
      next: data => {
        this.empleados = data;

        // Al editar, el nombre guardado en la cita puede no coincidir con el
        // nombre actual del empleado; el id sí es estable.
        if (this.empleadoSeleccionadoId !== null) {
          const empleado = this.empleados.find(
            e => e.id === this.empleadoSeleccionadoId
          );
          if (empleado) {
            this.tatuadorSeleccionado = this.nombreEmpleado(empleado);
          }
        }

        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);
      }
    });
  }

  cargarCitas(): void {
    if (!this.usuarioId) {
      this.citas = [];
      return;
    }

    this.citaService.obtenerCitas(this.usuarioId).subscribe({
      next: citas => {
        this.citas = citas;
        this.cdr.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  // =========================
  // VALIDACIÓN DE FECHA
  // =========================
  esFechaPasada(dia: number): boolean {
    const hoy = new Date();

    const fechaSeleccion = new Date(this.anioActual, this.mesActual, dia);

    // Comparar solo fecha (sin horas)
    hoy.setHours(0, 0, 0, 0);
    fechaSeleccion.setHours(0, 0, 0, 0);

    return fechaSeleccion < hoy;
  }
  // Verifica si el empleado trabaja en el día y hora seleccionados
  estaEnHorarioEmpleado(hora: string): boolean {
    if (!this.tatuadorSeleccionado) return true;

    const empleado = this.buscarEmpleadoSeleccionado();
    if (!empleado?.schedule) return true;

    // Verificar si el empleado trabaja el día seleccionado
    const nombreDia = this.obtenerNombreDia(this.fechaSeleccionada, this.mesActual, this.anioActual);
    if (!empleado.schedule.days.includes(nombreDia)) return false;

    const horaNum = this.horaATiempo(hora);
    const startNum = this.horaATiempo(empleado.schedule.start);
    const endNum = this.horaATiempo(empleado.schedule.end);

    return horaNum >= startNum && horaNum <= endNum;
  }

  // Verifica si el empleado seleccionado descansa en un día dado
  esDescansoEmpleado(dia: number): boolean {
    if (!this.tatuadorSeleccionado) return false;

    const empleado = this.buscarEmpleadoSeleccionado();
    if (!empleado?.schedule) return false;

    const nombreDia = this.obtenerNombreDia(dia, this.mesActual, this.anioActual);
    return !empleado.schedule.days.includes(nombreDia);
  }

  // Convierte una fecha a nombre de día en español
  private obtenerNombreDia(dia: number, mes: number, anio: number): string {
    const nombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fecha = new Date(anio, mes, dia);
    return nombres[fecha.getDay()];
  }

  // Convierte hora "8:00 AM" a objeto {hora, minuto} en formato 24h
  private horaATiempo(hora: string): number {
    // Manejar formato "8:00 AM" o "08:00"
    if (hora.includes('AM') || hora.includes('PM')) {
      const [parte, periodo] = hora.split(' ');
      let [h, m] = parte.split(':').map(Number);
      if (periodo === 'PM' && h !== 12) h += 12;
      if (periodo === 'AM' && h === 12) h = 0;
      return h + m / 60;
    } else {
      // Formato 24h "08:00"
      const [h, m] = hora.split(':').map(Number);
      return h + m / 60;
    }
  }

  //aqui vamos a validar que la hora no sea pasada, pero solo si la fecha seleccionada es el día actual//
  esHoraPasada(hora: string): boolean {
    const hoy = new Date();
    const esHoy =
      this.fechaSeleccionada === hoy.getDate() &&
      this.mesActual === hoy.getMonth() &&
      this.anioActual === hoy.getFullYear();

    if (!esHoy) {
      return false;
    }

    const [horaParte, minutoParte, periodo] = hora.split(/[: ]/);
    let horaNumero = parseInt(horaParte);
    const minutoNumero = parseInt(minutoParte);

    if (periodo === 'PM' && horaNumero !== 12) {
      horaNumero += 12;
    }
    if (periodo === 'AM' && horaNumero === 12) {
      horaNumero = 0;
    }

    const horaActual = hoy.getHours();
    const minutoActual = hoy.getMinutes();

    return horaNumero < horaActual || (horaNumero === horaActual && minutoNumero <= minutoActual);
  }

  seleccionarFecha(dia: number) {
    if (this.esFechaPasada(dia)) {
      alert('No puedes seleccionar fechas pasadas');
      return;
    }

    if (this.esDescansoEmpleado(dia)) {
      alert('El tatuador seleccionado descansa ese día');
      return;
    }

    this.fechaSeleccionada = dia;
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
  }

  seleccionarTatuador(empleado: Empleado) {
    this.tatuadorSeleccionado = this.nombreEmpleado(empleado);
    this.empleadoSeleccionadoId = empleado.id;
  }

  nombreEmpleado(empleado: Empleado): string {
    return `${empleado.name} ${empleado.last_name}`.trim();
  }

  private buscarEmpleadoSeleccionado(): Empleado | undefined {
    if (this.empleadoSeleccionadoId !== null) {
      const porId = this.empleados.find(e => e.id === this.empleadoSeleccionadoId);
      if (porId) return porId;
    }

    return this.empleados.find(
      e => this.nombreEmpleado(e) === this.tatuadorSeleccionado
    );
  }

  // Filtra horas según el horario y días del empleado seleccionado
  horasFiltradas(): string[] {
    if (!this.tatuadorSeleccionado) return this.horasDisponibles;

    const empleado = this.buscarEmpleadoSeleccionado();
    if (!empleado?.schedule) return this.horasDisponibles;

    // Verificar si el empleado trabaja el día seleccionado
    const nombreDia = this.obtenerNombreDia(this.fechaSeleccionada, this.mesActual, this.anioActual);
    if (!empleado.schedule.days.includes(nombreDia)) return [];

    return this.horasDisponibles.filter(hora => {
      const horaNum = this.horaATiempo(hora);
      const startNum = this.horaATiempo(empleado.schedule!.start);
      const endNum = this.horaATiempo(empleado.schedule!.end);
      return horaNum >= startNum && horaNum <= endNum;
    });
  }

  reservar() {
    if (!this.auth.estaLogueado() || !this.usuarioId) {
      alert('Debes iniciar sesión antes de reservar');
      return;
    }

    if (!this.fechaSeleccionada || !this.horaSeleccionada || !this.tatuadorSeleccionado) {
      alert('Faltan datos');
      return;
    }

    const empleado = this.buscarEmpleadoSeleccionado();
    if (!empleado) {
      alert('Selecciona un tatuador válido');
      return;
    }

    // Validar que la hora esté dentro del horario del empleado
    if (!this.estaEnHorarioEmpleado(this.horaSeleccionada)) {
      alert('La hora seleccionada está fuera del horario de ' + this.tatuadorSeleccionado);
      return;
    }

    if (this.esFechaPasada(this.fechaSeleccionada)) {
      alert('No puedes reservar en fechas pasadas');
      return;
    }

    // Validar hora si es el día actual
    const hoy = new Date();
    const esHoy =
      this.fechaSeleccionada === hoy.getDate() &&
      this.mesActual === hoy.getMonth() &&
      this.anioActual === hoy.getFullYear();

    if (esHoy) {
      const [hora, minuto] = this.horaSeleccionada.split(/[: ]/);
      let horaNumero = parseInt(hora);

      if (this.horaSeleccionada.includes('PM') && horaNumero !== 12) {
        horaNumero += 12;
      }
      if (this.horaSeleccionada.includes('AM') && horaNumero === 12) {
        horaNumero = 0;
      }

      const horaActual = hoy.getHours();
      const minutoActual = hoy.getMinutes();

      if (horaNumero < horaActual || (horaNumero === horaActual && parseInt(minuto) <= minutoActual)) {
        alert('No puedes seleccionar una hora pasada');
        return;
      }
    }

    const fecha = this.fechaISOSeleccionada();
    const horaInicio = this.a24h(this.horaSeleccionada);
    const horaFin = this.sumarMinutos(horaInicio, 30);
    this.reservando = true;

    const peticion = this.modoEdicion && this.citaEditar
      ? this.citaService.actualizar(this.citaEditar.id, {
          empleado_id: empleado.id,
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
        })
      : this.citaService.crear({
          usuario_id: this.usuarioId,
          empleado_id: empleado.id,
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
        });

    peticion.subscribe({
      next: () => {
        this.reservando = false;
        alert(this.modoEdicion ? 'Cita modificada con éxito' : 'Cita reservada con éxito');
        this.router.navigate(['/profile']);
      },
      error: (error: HttpErrorResponse) => {
        this.reservando = false;
        alert(this.mensajeDeError(error));
      }
    });
  }

  /** "2:00 PM" → "14:00". */
  private a24h(hora: string): string {
    if (!hora.includes('AM') && !hora.includes('PM')) {
      return hora.slice(0, 5).padStart(5, '0');
    }

    const [parte, periodo] = hora.split(' ');
    let [h, m] = parte.split(':').map(Number);
    if (periodo === 'PM' && h !== 12) h += 12;
    if (periodo === 'AM' && h === 12) h = 0;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /** "14:00" + 30 → "14:30". */
  private sumarMinutos(hhmm: string, minutos: number): string {
    const [h, m] = hhmm.split(':').map(Number);
    const total = h * 60 + m + minutos;
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  private fechaISOSeleccionada(): string {
    return `${this.anioActual}-${String(this.mesActual + 1).padStart(2, '0')}-${String(this.fechaSeleccionada).padStart(2, '0')}`;
  }

  /** "7/11/2026" → "2026-11-07" (compatibilidad con citas viejas). */
  private fechaVisibleAISO(fecha: string): string {
    const [dia, mes, anio] = fecha.split('/');
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  private mensajeDeError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Tu sesión venció. Inicia sesión de nuevo.';
    }
    if (error.status === 403) {
      return 'No tienes permiso para gestionar esta cita.';
    }
    if (error.status === 409) {
      return 'Ese horario ya está ocupado. Elige otro.';
    }
    if (error.status === 404) {
      return 'El tatuador o el usuario ya no existe.';
    }
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }

    const mensaje = error.error?.message;
    return Array.isArray(mensaje)
      ? mensaje.join(' ')
      : mensaje || 'No se pudo guardar la cita.';
  }
}
