import { Component, OnInit } from '@angular/core';
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
    if (!this.auth.estaLogueado()) {
      alert('Debes iniciar sesión antes de reservar');
      return;
    }
    if (
      !this.fechaSeleccionada ||
      !this.horaSeleccionada ||
      !this.tatuadorSeleccionado
    ) {
      alert('Faltan datos');
      return;
    }

    const usuario = this.auth.obtenerUsuario();
    const existe = this.citaService.getCitas().find(c =>
      c.fecha === this.fechaSeleccionada &&
      c.hora === this.horaSeleccionada &&
      c.tatuador === this.tatuadorSeleccionado
    );

    if (existe) {
      alert('Ese horario ya está ocupado');
      return;
    }

    const nuevaCita = {
      id: Date.now(),
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada,
      tatuador: this.tatuadorSeleccionado,
      correo: usuario.correo
    };

    this.citaService.crearCita(nuevaCita);
    alert('Cita reservada con éxito');
    console.log('Cita creada', nuevaCita);
  }

  get citas() {
    const correo = this.auth.obtenerUsuario().correo;
    return this.citaService.getCitas().filter(c => c.correo === correo);
  }
}