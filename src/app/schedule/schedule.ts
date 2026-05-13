import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CitaService } from '../services/citas';
import { EmpleadoService } from '../services/empleados';
import { AuthService } from '../services/auth';
import { Empleado } from '../models/empleado';
import { Cita } from '../models/cita';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from "@angular/router";

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

  empleados: Empleado[] = [];
  private correoUsuario: string = '';
  modoEdicion: boolean = false;
  citaEditar: Cita | null = null;

  // =========================
  // CALENDARIO DINÁMICO
  // =========================
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  anios = [2026, 2027];
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
    this.cargarEmpleados();
    this.generarCalendario();

    const usuario = this.auth.obtenerUsuario();
    this.correoUsuario = usuario?.correo || '';

    // Verificar si viene una cita para editar
    const state = this.router.getCurrentNavigation()?.extras?.state || history.state;
    if (state && state['citaEditar']) {

      this.citaEditar = state['citaEditar'];
      this.modoEdicion = true;

      if (this.citaEditar && this.citaEditar.fecha) {

        const partes = this.citaEditar.fecha.split('/');

        // Validar formato correcto
        if (partes.length === 3) {

          const dia = parseInt(partes[0], 10);
          const mes = parseInt(partes[1], 10) - 1;
          const anio = parseInt(partes[2], 10);

          // Validar que sean números válidos
          if (!isNaN(dia) && !isNaN(mes) && !isNaN(anio)) {

            this.fechaSeleccionada = dia;
            this.mesActual = mes;
            this.anioActual = anio;
          }
        }

        // Asignar otros campos siempre
        this.horaSeleccionada = this.citaEditar.hora;
        this.tatuadorSeleccionado = this.citaEditar.tatuador;
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
          this.cdr.detectChanges();
        },
        error: err => {
          console.error(err);
        }
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
//aqui vamos a validar que la hora no sea pasada, pero solo si la fecha seleccionada es el día actual
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

      this.fechaSeleccionada = dia;
    }

    seleccionarHora(hora: string) {
      this.horaSeleccionada = hora;
    }

    seleccionarTatuador(nombre: string) {
      this.tatuadorSeleccionado = nombre;
    }

    reservar() {
      if (!this.auth.estaLogueado()) {
        alert('Debes iniciar sesión antes de reservar');
        return;
      }

      if (!this.fechaSeleccionada || !this.horaSeleccionada || !this.tatuadorSeleccionado) {
        alert('Faltan datos');
        return;
      }

      if (this.esFechaPasada(this.fechaSeleccionada)) {
        alert('No puedes reservar en fechas pasadas');
        return;
      }

      const fechaFormateada = `${this.fechaSeleccionada}/${this.mesActual + 1}/${this.anioActual}`;

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

      // Validar duplicados
      const existe = this.citaService.getCitas().find(c =>
        c.fecha === fechaFormateada &&
        c.hora === this.horaSeleccionada &&
        c.tatuador === this.tatuadorSeleccionado &&
        (!this.modoEdicion || c.id !== this.citaEditar?.id)
      );

      if (existe) {
        alert('Ese horario ya está ocupado');
        return;
      }

      // MODO EDICIÓN
      if (this.modoEdicion && this.citaEditar) {

        const citaActualizada: Cita = {
          ...this.citaEditar,
          fecha: fechaFormateada,
          hora: this.horaSeleccionada,
          tatuador: this.tatuadorSeleccionado
        };

        this.citaService.actualizarCita(citaActualizada);
        alert('Cita modificada con éxito');

      }
      // MODO CREACIÓN
      else {

        const nuevaCita: Cita = {
          id: Date.now(),
          fecha: fechaFormateada,
          hora: this.horaSeleccionada,
          tatuador: this.tatuadorSeleccionado,
          correo: this.correoUsuario
        };

        this.citaService.crearCita(nuevaCita);
        alert('Cita reservada con éxito');
      }

      this.router.navigate(['/profile']);
    }

  get citas() {
      return this.citaService
        .getCitas()
        .filter(c => c.correo === this.correoUsuario);
    }
  }