import { Component } from '@angular/core';
import { CitaService } from '../services/citas';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule {
  fechaSeleccionada: number = 0;
  horaSeleccionada: string = '';
  tatuadorSeleccionado: string = '';

  constructor(private citaService: CitaService) { }

  seleccionarFecha(dia: number) {
    this.fechaSeleccionada = dia;
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
  }

  seleccionarTatuador(t: string) {
    this.tatuadorSeleccionado = t;
  }

  reservar() {
    if (!this.fechaSeleccionada || !this.horaSeleccionada || !this.tatuadorSeleccionado) {
      alert('Faltan datos');
      return;
    }
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
      tatuador: this.tatuadorSeleccionado
    };
    this.citaService.crearCita(nuevaCita);
    console.log('Cita creada', nuevaCita);
  }

  get citas() {
    return this.citaService.getCitas();
  }
}
