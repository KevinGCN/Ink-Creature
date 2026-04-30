/**
 * Servicio de gestión de citas - Almacenamiento local
 * 
 * Servicio singleton (@Injectable providedIn: 'root') que gestiona
 * la creación, lectura y eliminación de citas con persistencia
 * en localStorage del navegador.
 * 
 * Arquitectura: Patron Repository
 * - La lógica de acceso a datos está encapsulada aquí
 * - Los componentes no acceden a localStorage directamente
 * 
 * Persistencia:
 * - Todas las operaciones actualizan inmediatamente el localStorage
 * - Datos serializados como JSON bajo la clave 'citas'
 */
import { Injectable } from '@angular/core';
import { Cita } from '../models/cita';

@Injectable({
  providedIn: 'root', // Singleton global - misma instancia en toda la aplicación
})
export class CitaService {
  /** Array en memoria de todas las citas */
  private citas: Cita[] = this.cargarDesdeStorage();

  /**
   * Carga las citas iniciales desde localStorage
   * @returns Array de citas (vacío si no hay datos)
   */
  private cargarDesdeStorage(): Cita[] {
    return JSON.parse(localStorage.getItem('citas') || '[]');
  }

  /**
   * Persiste el estado actual en localStorage
   * Se llama después de cada mutación (crear/eliminar)
   */
  private guardar(): void {
    localStorage.setItem('citas', JSON.stringify(this.citas));
  }

  /**
   * Obtiene todas las citas
   * @returns Array de citas (copia no requerida por uso interno)
   */
  getCitas(): Cita[] {
    return this.citas;
  }

  /**
   * Crea una nueva cita y la persiste
   * @param cita Objeto Cita a crear (sin ID - se genera externamente)
   */
  crearCita(cita: Cita) {
    this.citas.push(cita);
    this.guardar();
  }

  /**
   * Elimina una cita por su ID
   * @param id Identificador único de la cita
   */
  eliminarCita(id: number) {
    this.citas = this.citas.filter(c => c.id !== id);
    this.guardar();
  }
}

