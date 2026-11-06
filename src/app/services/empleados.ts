import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Empleado } from '../models/empleado';
import { API_ROUTES } from '../core/api.routes';

/**
 * Forma en que el backend devuelve un empleado (`GET /empleados`).
 * El nombre y el apellido viven en la relación `usuarios`.
 */
interface EmpleadoApi {
  id: number;
  usuario_id: number;
  especialidad: string | null;
  biografia: string | null;
  fecha_contratacion: string;
  activo: boolean;
  usuarios: {
    id: number;
    nombre: string;
    apellido: string;
    foto_perfil_url: string | null;
  } | null;
}

/**
 * Catálogo de tatuadores desde el backend.
 *
 * `schedule` no viene en `/empleados` (los horarios tienen su propio módulo),
 * así que queda sin definir: la agenda lo interpreta como "sin restricción".
 */
@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  constructor(private http: HttpClient) {}

  getEmpleados(): Observable<Empleado[]> {
    return this.http.get<EmpleadoApi[]>(API_ROUTES.empleados).pipe(
      map((items) =>
        items
          .filter((e) => e.activo)
          .map((e) => ({
            id: e.id,
            name: e.usuarios?.nombre ?? '',
            last_name: e.usuarios?.apellido ?? '',
            email: '',
            password: '',
            phone: '',
            charge: '',
            schedule: undefined,
          })),
      ),
    );
  }
}
