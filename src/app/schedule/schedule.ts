import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CitaService } from '../services/citas';
import { EmpleadoService } from '../services/empleados';
import { AuthService } from '../services/auth';
import { Empleado } from '../models/empleado';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

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
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarEmpleados();
    this.generarCalendario();

    const usuario = this.auth.obtenerUsuario();
    this.correoUsuario = usuario?.correo || '';
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

    // Validar nuevamente antes de reservar
    if (this.esFechaPasada(this.fechaSeleccionada)) {
      alert('No puedes reservar en fechas pasadas');
      return;
    }

    const fechaNueva = new Date(this.anioActual, this.mesActual, this.fechaSeleccionada);

    const existe = this.citaService.getCitas().find(c => {
      const fechaCita = new Date(c.fecha);

      return (
        fechaCita.getFullYear() === fechaNueva.getFullYear() &&
        fechaCita.getMonth() === fechaNueva.getMonth() &&
        fechaCita.getDate() === fechaNueva.getDate() &&
        c.hora === this.horaSeleccionada &&
        c.tatuador === this.tatuadorSeleccionado
      );
    });

    if (existe) {
      alert('Ese horario ya está ocupado');
      return;
    }

    const nuevaCita = {
      id: Date.now(),
      fecha: `${this.fechaSeleccionada}/${this.mesActual + 1}/${this.anioActual}`,
      hora: this.horaSeleccionada,
      tatuador: this.tatuadorSeleccionado,
      correo: this.correoUsuario
    };

    this.citaService.crearCita(nuevaCita);
    alert('Cita reservada con éxito');
  }

  get citas() {
    return this.citaService
      .getCitas()
      .filter(c => c.correo === this.correoUsuario);
  }
}