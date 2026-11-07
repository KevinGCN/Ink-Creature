export type EstadoCita =
  | 'pendiente'
  | 'confirmada'
  | 'cancelada'
  | 'completada';

/**
 * Cita tal como la usa la interfaz.
 *
 * `fecha` y `hora` son para mostrar; `fechaISO`, `horaInicio` y `horaFin`
 * son los valores que viajan al backend (`YYYY-MM-DD` y `HH:mm`).
 */
export interface Cita {
  id: number;
  fecha: string;
  hora: string;
  tatuador: string;
  correo?: string;
  fechaISO: string;
  horaInicio: string;
  horaFin: string;
  empleadoId: number;
  usuarioId: number;
  estado: EstadoCita;
  notas?: string;
}
