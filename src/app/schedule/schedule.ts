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
  citaEditar: Cita | null = null;
  modoEdicion: boolean = false;

  constructor(
    private citaService: CitaService,
    private empleadoService: EmpleadoService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

   ngOnInit(): void {
    this.cargarEmpleados();

    const usuario = this.auth.obtenerUsuario();
    this.correoUsuario = usuario?.correo || '';

    // Verificar si viene una cita para editar
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    if (state && state['citaEditar']) {
      this.citaEditar = state['citaEditar'];
      this.modoEdicion = true;

      // Validar que citaEditar no sea null antes de acceder a sus propiedades
      if (this.citaEditar) {
        this.fechaSeleccionada = this.citaEditar.fecha;
        this.horaSeleccionada = this.citaEditar.hora;
        this.tatuadorSeleccionado = this.citaEditar.tatuador;
      }
    }
  }

  cargarEmpleados(): void {
    this.empleadoService.getEmpleados().subscribe({
      next: data => {
        this.empleados = data;
        this.cdr.detectChanges(); // fuerza refresco
      },
      error: err => {
        console.error(err);
      }
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

    if (!this.fechaSeleccionada || !this.horaSeleccionada || !this.tatuadorSeleccionado) {
      alert('Faltan datos');
      return;
    }
    const existe = this.citaService.getCitas().find(c =>
      c.fecha === this.fechaSeleccionada &&
      c.hora === this.horaSeleccionada &&
      c.tatuador === this.tatuadorSeleccionado &&
      (!this.citaEditar || c.id !== this.citaEditar.id)
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
      correo: this.correoUsuario
    };

    if (this.modoEdicion && this.citaEditar) {
      // Actualizar cita existente
      const citaActualizada: Cita = {
        ...this.citaEditar,
        fecha: this.fechaSeleccionada,
        hora: this.horaSeleccionada,
        tatuador: this.tatuadorSeleccionado
      };

      this.citaService.actualizarCita(citaActualizada);
      alert('Cita modificada con éxito');
    } else {
      // Crear nueva cita
      const nuevaCita: Cita = {
        id: Date.now(),
        fecha: this.fechaSeleccionada,
        hora: this.horaSeleccionada,
        tatuador: this.tatuadorSeleccionado,
        correo: this.correoUsuario
      };

      this.citaService.crearCita(nuevaCita);
      alert('Cita reservada con éxito');
    }

    // Resetear y volver
    this.router.navigate(['/profile']);
  }

  get citas() {
    return this.citaService
      .getCitas()
      .filter(c => c.correo === this.correoUsuario);
  }
}
