/**
 * Servicio de confirmación del proyecto (reemplaza el `confirm()` nativo del
 * navegador).
 *
 * Un componente llama `confirmar(...)` y recibe una promesa que se resuelve con
 * `true` (aceptó) o `false` (canceló) cuando el usuario responde en el modal
 * `ConfirmacionModal`, montado una única vez en el shell raíz de la app.
 */
import { Injectable, signal } from '@angular/core';

export interface OpcionesConfirmacion {
  /** Título opcional de la ventana (por defecto "Confirmar acción"). */
  titulo?: string;
  /** Mensaje que se le muestra al usuario. */
  mensaje: string;
  /** Texto del botón afirmativo (por defecto "Aceptar"). */
  textoConfirmar?: string;
  /** Texto del botón negativo (por defecto "Cancelar"). */
  textoCancelar?: string;
  /** `true` para pintar el botón principal en rojo (acciones destructivas). */
  peligro?: boolean;
}

interface EstadoConfirmacion extends Required<Omit<OpcionesConfirmacion, 'titulo'>> {
  titulo: string;
  resolver: (aceptado: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  /** La confirmación pendiente, o `null` cuando no hay ninguna. La lee `ConfirmacionModal`. */
  readonly estado = signal<EstadoConfirmacion | null>(null);

  /** Abre el modal y devuelve la promesa que se resuelve con la respuesta del usuario. */
  confirmar(opciones: OpcionesConfirmacion): Promise<boolean> {
    return new Promise((resolver) => {
      this.estado.set({
        titulo: opciones.titulo ?? 'Confirmar acción',
        mensaje: opciones.mensaje,
        textoConfirmar: opciones.textoConfirmar ?? 'Aceptar',
        textoCancelar: opciones.textoCancelar ?? 'Cancelar',
        peligro: opciones.peligro ?? false,
        resolver,
      });
    });
  }

  /** Responde la confirmación pendiente (la llama `ConfirmacionModal`). */
  responder(aceptado: boolean): void {
    const pendiente = this.estado();
    if (!pendiente) return;
    this.estado.set(null);
    pendiente.resolver(aceptado);
  }
}
