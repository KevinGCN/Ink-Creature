import { Component, OnInit } from '@angular/core';
import { CitaService } from '../services/citas';
import { EmpleadoService } from '../services/empleados';
import { AuthService } from '../services/auth';
import { Empleado } from '../models/empleado';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule implements OnInit {

  fechaSeleccionada: number = 0;
  horaSeleccionada: string = '';
  tatuadorSeleccionado: string = '';

  empleados: Empleado[] = [];

  constructor(
    private citaService: CitaService,
    private empleadoService: EmpleadoService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.empleadoService.getEmpleados().subscribe(data => {
      this.empleados = data;
    });
  }

  seleccionarFecha(dia: number) {
    this.fechaSeleccionada = dia;
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
  }

  seleccionarTatuador(nombre: string) {
    this.tatuadorSeleccionado = nombre;
  }

  reservar() {

    /* Verifica sesión iniciada */
    if (!this.auth.estaLogueado()) {
      alert('Debes iniciar sesión antes de reservar');
      return;
    }

    /* Verifica datos */
    if (
      !this.fechaSeleccionada ||
      !this.horaSeleccionada ||
      !this.tatuadorSeleccionado
    ) {
      alert('Faltan datos');
      return;
    }

    /* Verifica horario ocupado */
    const existe = this.citaService.getCitas().find(c =>
      c.fecha === this.fechaSeleccionada &&
      c.hora === this.horaSeleccionada &&
      c.tatuador === this.tatuadorSeleccionado
    );

    if (existe) {
      alert('Ese horario ya está ocupado');
      return;
    }

    /* Crear cita */
    const nuevaCita = {
      id: Date.now(),
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada,
      tatuador: this.tatuadorSeleccionado
    };

    this.citaService.crearCita(nuevaCita);

    alert('Cita reservada con éxito');
    console.log('Cita creada', nuevaCita);
  }

  get citas() {
    return this.citaService.getCitas();
  }
}