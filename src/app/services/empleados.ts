/**
 * Servicio de empleados (Workers) — consume el backend NestJS.
 *
 * GET    /api/empleados        → catálogo completo (público)
 * GET    /api/empleados/:id    → uno con sus datos de usuario (público)
 * POST   /api/empleados        → crear (requiere JWT)
 * PATCH  /api/empleados/:id    → actualizar (requiere JWT)
 * DELETE /api/empleados/:id    → eliminar (requiere JWT)
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Empleado } from '../models/empleado';

export type { Empleado };

export interface DatosEmpleadoNuevo {
  usuario_id: number;
  especialidad?: string;
  biografia?: string;
  activo?: boolean;
}

export type DatosEmpleadoEdicion = Partial<Omit<DatosEmpleadoNuevo, 'usuario_id'>>;

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private readonly url = `${environment.apiUrl}/empleados`;

  constructor(private http: HttpClient) {}

  getEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.url);
  }

  getEmpleado(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.url}/${id}`);
  }

  crearEmpleado(datos: DatosEmpleadoNuevo): Observable<Empleado> {
    return this.http.post<Empleado>(this.url, datos);
  }

  actualizarEmpleado(id: number, datos: DatosEmpleadoEdicion): Observable<Empleado> {
    return this.http.patch<Empleado>(`${this.url}/${id}`, datos);
  }

  eliminarEmpleado(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
