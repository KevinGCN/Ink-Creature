/**
 * Modelo de citas (Schedules) — espejo del backend NestJS (tabla `citas`).
 */
import { Empleado } from './empleado';
import { Usuario } from './usuario';

/**
 * Máquina de estados de una cita: "pendiente" es una solicitud sin confirmar,
 * "confirmada" ya ocupa el hueco del tatuador, "cancelada" lo libera y
 * "completada" marca que ya se atendió (se conserva como historial).
 */
export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

// Arreglo paralelo al tipo: `EstadoCita` desaparece al compilar, así que esta
// lista es la única fuente para poblar selectores y validar en tiempo de
// ejecución.
export const ESTADOS_CITA: EstadoCita[] = [
  'pendiente',
  'confirmada',
  'cancelada',
  'completada',
];

/** Fila de `citas` tal como la devuelve la API (nombres snake_case del backend). */
export interface Cita {
  id: number;
  /** Cliente que reserva; el backend lo cruza con el `sub` del JWT. */
  usuario_id: number;
  /** Tatuador que atiende: apunta a `empleados.id`, no a `usuarios.id`. */
  empleado_id: number;
  /** Fecha ISO "YYYY-MM-DD" */
  fecha: string;
  /** Hora 24h "HH:mm" */
  hora_inicio: string;
  /** Hora 24h "HH:mm" */
  hora_fin: string;
  estado: EstadoCita;
  /** Texto libre del cliente (idea, zona del cuerpo, referencias). */
  notas?: string | null;
  // Marcas de auditoría que pone la base de datos; el frontend solo las lee.
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  /** Relaciones incluidas por el backend */
  usuarios?: Usuario;
  empleados?: Empleado;
}

// `estado` es opcional aquí porque el backend aplica su valor por defecto
// ("pendiente") cuando el formulario no lo envía.
/** Payload de POST /api/citas */
export interface NuevaCita {
  usuario_id: number;
  empleado_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado?: EstadoCita;
  notas?: string;
}
