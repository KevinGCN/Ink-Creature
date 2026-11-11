/**
 * Servicio de gestión de empleados - Fuente de datos Firestore
 *
 * Los empleados (tatuadores) se almacenan en la colección `empleados`
 * de Firestore. Este servicio expone la lectura de la colección y la
 * búsqueda por correo, que usa AuthService para resolver el rol.
 *
 * Seguridad:
 * - Las reglas de Firestore (firestore.rules) controlan quién puede leer
 *   y escribir la colección.
 * - No se almacenan contraseñas: la autenticación pertenece a Firebase Auth.
 *
 * Uso típico:
 *   this.empleadoService.getEmpleados().subscribe(empleados => ...)
 */
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable, catchError, map, of } from 'rxjs';
import { Empleado } from '../models/empleado';

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private firestore = inject(Firestore);
  private readonly coleccion = 'empleados';

  /**
   * Obtiene el catálogo completo de empleados.
   * Devuelve un array vacío si la lectura falla, para no romper la vista.
   */
  getEmpleados(): Observable<Empleado[]> {
    const ref = collection(this.firestore, this.coleccion);
    return (collectionData(ref, { idField: 'id' }) as Observable<Empleado[]>).pipe(
      catchError((error) => {
        console.error('[EmpleadoService] Error leyendo empleados:', error);
        return of([]);
      })
    );
  }

  /**
   * Busca un empleado por correo electrónico.
   * Devuelve `null` cuando no existe o la lectura falla.
   */
  getEmpleadoPorEmail(email: string): Observable<Empleado | null> {
    const ref = collection(this.firestore, this.coleccion);
    const q = query(ref, where('email', '==', email));
    return (collectionData(q, { idField: 'id' }) as Observable<Empleado[]>).pipe(
      map((empleados) => (empleados.length > 0 ? empleados[0] : null)),
      catchError((error) => {
        console.error('[EmpleadoService] Error buscando empleado:', error);
        return of(null);
      })
    );
  }
}
