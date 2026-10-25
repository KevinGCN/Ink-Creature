/**
 * Modelo de citas (Schedules) — espejo del backend NestJS (tabla `citas`).
 */
import { Empleado } from './empleado';
import { Usuario } from './usuario';

export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export const ESTADOS_CITA: EstadoCita[] = [
  'pendiente',
  'confirmada',
  'cancelada',
  'completada',
];

export interface Cita {
  id: number;
  usuario_id: number;
  empleado_id: number;
  /** Fecha ISO "YYYY-MM-DD" */
  fecha: string;
  /** Hora 24h "HH:mm" */
  hora_inicio: string;
  /** Hora 24h "HH:mm" */
  hora_fin: string;
  estado: EstadoCita;
  notas?: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  /** Relaciones incluidas por el backend */
  usuarios?: Usuario;
  empleados?: Empleado;
}

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
