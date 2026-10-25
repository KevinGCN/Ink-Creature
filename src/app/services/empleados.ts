/**
 * Servicio de empleados (Workers) — consume el backend NestJS.
 *
 * GET    /api/empleados        → catálogo completo (público)
 * GET    /api/empleados/:id    → uno con sus datos de usuario (público)
 * POST   /api/empleados        → crear (solo admin)
 * PATCH  /api/empleados/:id    → actualizar (solo admin)
 * DELETE /api/empleados/:id    → eliminar (solo admin)
 *
 * Consultar es público (el catálogo se ve sin sesión); escribir exige además
 * rol `admin`: el backend responde 403 a un cliente logueado.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Empleado } from '../models/empleado';

export type { Empleado };

// Fila de `empleados`: enlaza una cuenta ya registrada con su ficha laboral.
// Tener esta fila es lo que convierte al usuario en tatuador del catálogo.
export interface DatosEmpleadoNuevo {
  usuario_id: number;
  especialidad?: string;
  biografia?: string;
  activo?: boolean;
}

// El dueño de la ficha no se edita: un PATCH no debe reasignar la fila a otra
// cuenta, porque el catálogo quedaría apuntando a un usuario distinto.
export type DatosEmpleadoEdicion = Partial<Omit<DatosEmpleadoNuevo, 'usuario_id'>>;

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private readonly url = `${environment.apiUrl}/empleados`;

  constructor(private http: HttpClient) {}

  /** Catálogo público: alimenta la sección de tatuadores sin pedir sesión. */
  getEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.url);
  }

  /** Ficha individual; el backend incluye los datos del usuario asociado. */
  getEmpleado(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.url}/${id}`);
  }

  /** Requiere JWT de admin: lo usa el panel de admin al convertir a alguien en tatuador. */
  crearEmpleado(datos: DatosEmpleadoNuevo): Observable<Empleado> {
    return this.http.post<Empleado>(this.url, datos);
  }

  /** Solo campos de la ficha laboral (especialidad, biografía, activo). */
  actualizarEmpleado(id: number, datos: DatosEmpleadoEdicion): Observable<Empleado> {
    return this.http.patch<Empleado>(`${this.url}/${id}`, datos);
  }

  /** Quita al tatuador del catálogo; la cuenta de usuario sigue existiendo. */
  eliminarEmpleado(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
