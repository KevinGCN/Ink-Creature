/**
 * Servicio de reseñas — por ahora vive solo en el navegador.
 *
 * No hay tabla de reseñas en el backend, así que se persisten en
 * `localStorage` para que no se pierdan al recargar. Es una solución de
 * demostración: cada navegador ve únicamente sus propias reseñas.
 */
import { Injectable } from '@angular/core';
import { Resena } from '../models/resena';

@Injectable({
  providedIn: 'root',
})
export class ResenaService {
  // Se carga una sola vez al construir el servicio y queda en memoria; el
  // arreglo es la fuente de verdad y `guardar()` lo refleja en localStorage.
  private resenas: Resena[] = this.cargarDesdeStorage();

  /** Primer arranque: la clave todavía no existe y se parte de lista vacía. */
  private cargarDesdeStorage(): Resena[] {
    return JSON.parse(localStorage.getItem('resenas') || '[]');
  }

  /** Vuelca el arreglo completo: localStorage no admite escrituras parciales. */
  private guardar(): void {
    localStorage.setItem('resenas', JSON.stringify(this.resenas));
  }

  /**
   * Copia invertida (la más reciente primero) para que la vista ordene sin
   * poder mutar el arreglo interno del servicio.
   */
  getResenas(): Resena[] {
    return [...this.resenas].reverse();
  }

  /** El id lo asigna el servicio para que el formulario no tenga que hacerlo. */
  publicarResena(datos: Omit<Resena, 'id'>): void {
    const nueva: Resena = {
      id: this.generarId(),
      ...datos,
    };
    this.resenas.push(nueva);
    this.guardar();
  }

  /** Id incremental sobre el máximo actual, para no repetir uno ya usado. */
  private generarId(): number {
    if (this.resenas.length === 0) return 1;
    return Math.max(...this.resenas.map(r => r.id)) + 1;
  }
}
