/**
 * Servicio de horarios de trabajador — consume el backend NestJS.
 *
 * GET /api/horarios-trabajador                → todos (público)
 * GET /api/horarios-trabajador?empleado_id=   → disponibilidad de un tatuador
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HorarioTrabajador } from '../models/empleado';
import { horaCorta } from '../utils/fechas';

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private readonly url = `${environment.apiUrl}/horarios-trabajador`;

  constructor(private http: HttpClient) {}

  /**
   * Sin `empleadoId` trae todos los horarios (vista de administración); con él,
   * solo la disponibilidad de ese tatuador para el selector de citas.
   */
  getHorarios(empleadoId?: number): Observable<HorarioTrabajador[]> {
    // El filtro se arma como query porque el backend expone ambos casos en una sola ruta.
    const query = empleadoId ? `?empleado_id=${empleadoId}` : '';
    return this.http
      .get<HorarioTrabajador[]>(`${this.url}${query}`)
      .pipe(map((horarios) => this.normalizar(horarios)));
  }

  /** Normaliza las horas ISO de Prisma a "HH:mm" */
  private normalizar(horarios: HorarioTrabajador[]): HorarioTrabajador[] {
    return horarios.map((h) => ({
      ...h,
      hora_inicio: horaCorta(h.hora_inicio),
      hora_fin: horaCorta(h.hora_fin),
    }));
  }
}
