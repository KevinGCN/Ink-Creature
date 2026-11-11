import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ROUTES } from '../core/api.routes';
import { Cita, EstadoCita } from '../models/cita';

interface CitaApi {
  id: number;
  usuario_id: number;
  empleado_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoCita;
  notas: string | null;
  empleados: {
    id: number;
    usuarios: {
      id: number;
      nombre: string;
      apellido: string;
    } | null;
  } | null;
}

export interface CrearCitaDto {
  usuario_id: number;
  empleado_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado?: EstadoCita;
  notas?: string;
}

export type ActualizarCitaDto = Partial<CrearCitaDto>;

/** "1970-01-01T14:00:00.000Z" o "14:00:00" → "14:00". */
function aHHMM(valor: string): string {
  return valor.includes('T') ? valor.slice(11, 16) : valor.slice(0, 5);
}

/** "14:00" → "2:00 PM". */
function a12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const periodo = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${periodo}`;
}

/**
 * Citas contra `/citas`.
 *
 * El backend devuelve fechas y horas como ISO; aquí se convierten a los
 * formatos que ya usan la agenda y “Mis citas” (`dd/mm/yyyy` y `7:00 AM`).
 */
@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private readonly http = inject(HttpClient);

  obtenerCitas(usuarioId?: number): Observable<Cita[]> {
    let params = new HttpParams();
    if (usuarioId) {
      params = params.set('usuario_id', String(usuarioId));
    }

    return this.http
      .get<CitaApi[]>(API_ROUTES.citas, { params })
      .pipe(map((citas) => citas.map((c) => this.mapear(c))));
  }

  crear(dto: CrearCitaDto): Observable<Cita> {
    return this.http
      .post<CitaApi>(API_ROUTES.citas, dto)
      .pipe(map((c) => this.mapear(c)));
  }

  actualizar(id: number, dto: ActualizarCitaDto): Observable<Cita> {
    return this.http
      .patch<CitaApi>(`${API_ROUTES.citas}/${id}`, dto)
      .pipe(map((c) => this.mapear(c)));
  }

  eliminar(id: number): Observable<unknown> {
    return this.http.delete(`${API_ROUTES.citas}/${id}`);
  }

  private mapear(c: CitaApi): Cita {
    const fechaISO = c.fecha.slice(0, 10);
    const [anio, mes, dia] = fechaISO.split('-');
    const horaInicio = aHHMM(c.hora_inicio);
    const horaFin = aHHMM(c.hora_fin);
    const nombre = c.empleados?.usuarios?.nombre ?? '';
    const apellido = c.empleados?.usuarios?.apellido ?? '';

    return {
      id: c.id,
      fecha: `${dia}/${mes}/${anio}`,
      hora: a12h(horaInicio),
      tatuador: `${nombre} ${apellido}`.trim() || 'Tatuador',
      fechaISO,
      horaInicio,
      horaFin,
      empleadoId: c.empleado_id,
      usuarioId: c.usuario_id,
      estado: c.estado,
      notas: c.notas ?? undefined,
    };
  }
}
