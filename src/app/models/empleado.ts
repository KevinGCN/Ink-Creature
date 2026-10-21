/**
 * Modelos de empleados (Workers) y horarios — espejo del backend NestJS
 * (tablas `empleados` y `horarios_trabajador`).
 */
import { Usuario } from './usuario';

export interface Empleado {
  id: number;
  usuario_id: number;
  especialidad?: string | null;
  biografia?: string | null;
  fecha_contratacion?: string;
  activo: boolean;
  /** Datos públicos del usuario dueño del registro empleado */
  usuarios: Usuario;
}

/** Registro de disponibilidad semanal de un tatuador */
export interface HorarioTrabajador {
  id: number;
  empleado_id: number;
  /** 0 = Domingo … 6 = Sábado */
  dia_semana: number;
  /** Formato 24h "HH:mm" */
  hora_inicio: string;
  /** Formato 24h "HH:mm" */
  hora_fin: string;
}
