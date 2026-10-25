/**
 * Servicio de citas (Schedules) — consume el backend NestJS.
 *
 * GET    /api/citas                → todas (público)
 * GET    /api/citas?usuario_id=    → citas de un usuario (agenda personal)
 * POST   /api/citas                → crear (requiere JWT)
 * PATCH  /api/citas/:id            → actualizar (requiere JWT)
 * DELETE /api/citas/:id            → eliminar (requiere JWT)
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Cita, NuevaCita } from '../models/cita';

export type { Cita, NuevaCita };
import { horaCorta } from '../utils/fechas';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  // URL base única: los métodos solo añaden el id o el query string necesario.
  private readonly url = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  /** Todas las citas del sistema */
  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.url).pipe(map((citas) => this.normalizar(citas)));
  }

  /** Citas de un usuario concreto (la agenda personal en Profile/Schedule) */
  getCitasDeUsuario(usuarioId: number): Observable<Cita[]> {
    return this.http
      .get<Cita[]>(`${this.url}?usuario_id=${usuarioId}`)
      .pipe(map((citas) => this.normalizar(citas)));
  }

  /** Crea la cita y la devuelve ya normalizada para pintarla sin recargar. */
  crearCita(cita: NuevaCita): Observable<Cita> {
    return this.http.post<Cita>(this.url, cita).pipe(map((c) => this.normalizar([c])[0]));
  }

  /**
   * PATCH parcial: solo se envían los campos presentes para que el backend no
   * borre datos que la pantalla no estaba editando.
   */
  actualizarCita(id: number, cambios: Partial<NuevaCita>): Observable<Cita> {
    return this.http
      .patch<Cita>(`${this.url}/${id}`, cambios)
      .pipe(map((c) => this.normalizar([c])[0]));
  }

  /** El backend responde sin cuerpo útil, por eso el retorno es `unknown`. */
  eliminarCita(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }

  /**
   * Prisma devuelve `hora_inicio`/`hora_fin` como ISO completo aunque la
   * columna sea @db.Time; aquí se normalizan a "HH:mm".
   */
  private normalizar(citas: Cita[]): Cita[] {
    return citas.map((c) => ({
      ...c,
      hora_inicio: horaCorta(c.hora_inicio),
      hora_fin: horaCorta(c.hora_fin),
    }));
  }
}
