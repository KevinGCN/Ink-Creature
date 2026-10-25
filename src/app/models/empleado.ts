/**
 * Modelos de empleados (Workers) y horarios — espejo del backend NestJS
 * (tablas `empleados` y `horarios_trabajador`).
 */
import { Usuario } from './usuario';

/** Ficha del tatuador en el catálogo; su `id` es el que usan las citas. */
export interface Empleado {
  id: number;
  /** Usuario (con `rol = 'empleado'`) dueño de la ficha: de ahí salen nombre y foto. */
  usuario_id: number;
  especialidad?: string | null;
  biografia?: string | null;
  // Opcional: los tatuadores que se promueven desde el panel no tienen fecha
  // de contratación real y no se debe inventar una.
  fecha_contratacion?: string;
  /** Baja lógica: se oculta del catálogo sin borrar sus citas históricas. */
  activo: boolean;
  /** Datos públicos del usuario dueño del registro empleado */
  usuarios: Usuario;
}

/** Registro de disponibilidad semanal de un tatuador */
// El backend incluye siempre la relación `usuarios` con un select seguro
// (sin `password_hash`), así que aquí se puede asumir que viene completa.
export interface HorarioTrabajador {
  id: number;
  /** Apunta a `empleados.id`: cada tatuador define su propia rejilla. */
  empleado_id: number;
  /** 0 = Domingo … 6 = Sábado */
  dia_semana: number;
  /** Formato 24h "HH:mm" */
  hora_inicio: string;
  /** Formato 24h "HH:mm" */
  hora_fin: string;
}
