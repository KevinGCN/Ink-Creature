/**
 * Servicio de gestión de empleados - Fuente de datos HTTP
 * 
 * Servicio que obtiene la lista de empleados desde un archivo
 * JSON estático vía HTTP. Ideal para catálogos o datos maestros
 * que no cambian frecuentemente.
 * 
 * Características:
 * - Uso de HttpClient con tipado fuerte (Observable<Empleado[]>)
 * - URL relativa a assets (empaquetada con la build)
 * - Patrón de diseño: Repository sobre datos estáticos
 * 
 * Uso típico:
 *   this.empleadoService.getEmpleados().subscribe(empleados => ...)
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Empleado } from '../models/empleado';

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {

  // URL del backend local.
  // Cuando usemos el backend desplegado, cambiaremos esta URL.
  private url = 'http://localhost:3000/empleados';

  constructor(private http: HttpClient) {}

  getEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.url);
  }

   getEmpleado(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.url}/${id}`);
  }

  crearEmpleado(datos: Partial<Empleado>): Observable<Empleado> {
    return this.http.post<Empleado>(this.url, datos);
  }

  actualizarEmpleado(
    id: number,
    datos: Partial<Empleado>
  ): Observable<Empleado> {
    return this.http.patch<Empleado>(`${this.url}/${id}`, datos);
  }

  eliminarEmpleado(id: number): Observable<Empleado> {
    return this.http.delete<Empleado>(`${this.url}/${id}`);
  }
}