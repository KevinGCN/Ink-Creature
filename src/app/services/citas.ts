import { Injectable } from '@angular/core';
import { Cita } from '../models/cita';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private citas: Cita[] = [];

  getCitas(): Cita[] {
    return this.citas;
  }

  crearCita(cita: Cita) {
    this.citas.push(cita);
  }

  eliminarCita(id: number) {
    this.citas = this.citas.filter(c => c.id !== id);
  }
}
