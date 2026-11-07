export interface Schedule {
  start: string;
  end: string;
  days: string[];
}

/**
 * Empleado tal como lo usa el frontend.
 *
 * `id` es `empleados.id` (no el id del usuario): es el que usan las rutas
 * `/employeeCV/:id` y `galeria.empleado_id`.
 */
export interface Empleado {
  id: number;
  usuarioId: number;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  charge: string;
  especialidad: string;
  descripcion: string;
  foto: string;
  experiencia: number;
  schedule?: Schedule;
  activo: boolean;
}
