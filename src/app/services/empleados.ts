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
  /** Ruta al recurso JSON (empaquetado en assets durante build) */
  private url = 'assets/empleados.json';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el catálogo completo de empleados
   * @returns Observable que emite el array de empleados
   */
  getEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.url);
  }
}
