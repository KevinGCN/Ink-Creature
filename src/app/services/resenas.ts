import { Injectable } from '@angular/core';
import { Resena } from '../models/resena';

@Injectable({
  providedIn: 'root',
})
export class ResenaService {
  private resenas: Resena[] = this.cargarDesdeStorage();

  private cargarDesdeStorage(): Resena[] {
    return JSON.parse(localStorage.getItem('resenas') || '[]');
  }

  private guardar(): void {
    localStorage.setItem('resenas', JSON.stringify(this.resenas));
  }

  getResenas(): Resena[] {
    return [...this.resenas].reverse();
  }

  publicarResena(datos: Omit<Resena, 'id'>): void {
    const nueva: Resena = {
      id: this.generarId(),
      ...datos,
    };
    this.resenas.push(nueva);
    this.guardar();
  }

  private generarId(): number {
    if (this.resenas.length === 0) return 1;
    return Math.max(...this.resenas.map(r => r.id)) + 1;
  }
}
