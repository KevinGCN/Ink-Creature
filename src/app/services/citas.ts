import { Injectable } from '@angular/core';
import { Cita } from '../models/cita';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private citas: Cita[] = this.cargarDesdeStorage();

  private cargarDesdeStorage(): Cita[] {
    return JSON.parse(localStorage.getItem('citas') || '[]');
  }

  private guardar(): void {
    localStorage.setItem('citas', JSON.stringify(this.citas));
  }

  getCitas(): Cita[] {
    return this.citas;
  }

  crearCita(cita: Cita) {
    this.citas.push(cita);
    this.guardar();
  }

  eliminarCita(id: number) {
    this.citas = this.citas.filter(c => c.id !== id);
    this.guardar();
  }
}
