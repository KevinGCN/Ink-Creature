/**
 * Servicio de notificaciones del proyecto (reemplaza los `alert()` nativos del
 * navegador).
 *
 * Los componentes piden los avisos a este servicio con `exito()`, `error()`,
 * `info()` o `aviso()`, y el componente `Toasts` los pinta en el DOM en una
 * esquina fija de la pantalla. Cada notificación se cierra sola después de su
 * tiempo de vida (los errores aguantan más) o cuando el usuario la descarta.
 *
 * Está construido con señales (`signal`) como el resto de la app, de modo que
 * la detección de cambios no dependa de Zone.
 */
import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error' | 'info' | 'aviso';

export interface Notificacion {
  /** Identificador único para `@for (track ...)` y para cerrar una sola. */
  id: number;
  /** Color e icono del toast. */
  tipo: TipoNotificacion;
  /** Texto mostrado al usuario. */
  mensaje: string;
}

/** Tiempo de vida de cada tipo, en milisegundos. */
const DURACION_MS: Record<TipoNotificacion, number> = {
  exito: 4000,
  info: 5000,
  aviso: 5000,
  error: 7000,
};

/** Máximo de toasts simultáneos: la más antigua se descarta de sobra si llega más gente. */
const MAXIMO_SIMULTANEAS = 5;

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private contador = 0;
  private temporizadores = new Map<number, ReturnType<typeof setTimeout>>();

  /** Notificaciones visibles, la más reciente primero. */
  readonly items = signal<Notificacion[]>([]);

  exito(mensaje: string): void {
    this.agregar('exito', mensaje);
  }

  error(mensaje: string): void {
    this.agregar('error', mensaje);
  }

  info(mensaje: string): void {
    this.agregar('info', mensaje);
  }

  aviso(mensaje: string): void {
    this.agregar('aviso', mensaje);
  }

  /** Descarta una notificación manualmente (botón ✕ del toast). */
  cerrar(id: number): void {
    const temporizador = this.temporizadores.get(id);
    if (temporizador) {
      clearTimeout(temporizador);
      this.temporizadores.delete(id);
    }
    this.quitar(id);
  }

  /** Se llama cuando `Toasts` se destruye, para no dejar temporizadores sueltos. */
  limpiar(): void {
    for (const temporizador of this.temporizadores.values()) clearTimeout(temporizador);
    this.temporizadores.clear();
    this.items.set([]);
  }

  private agregar(tipo: TipoNotificacion, mensaje: string): void {
    const id = ++this.contador;
    this.items.update((actuales) =>
      [{ id, tipo, mensaje }, ...actuales].slice(0, MAXIMO_SIMULTANEAS),
    );
    const temporizador = setTimeout(() => {
      this.temporizadores.delete(id);
      this.quitar(id);
    }, DURACION_MS[tipo]);
    this.temporizadores.set(id, temporizador);
  }

  private quitar(id: number): void {
    this.items.update((actuales) => actuales.filter((n) => n.id !== id));
  }
}
