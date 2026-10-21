/**
 * Utilidades de fecha/hora para trabajar con las columnas del backend:
 * - `fecha` de citas: string "YYYY-MM-DD"
 * - `hora_inicio` / `hora_fin`: Prisma las devuelve como ISO completo
 *   ("1970-01-01T10:00:00.000Z") aunque la columna sea @db.Time.
 */

/** Convierte cualquier fecha ISO a "HH:mm" */
export function horaCorta(iso: string | Date): string {
  const s = typeof iso === 'string' ? iso : iso.toISOString();
  return s.slice(11, 16);
}

/** Convierte "HH:mm" a minutos desde medianoche */
export function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Convierte minutos a "HH:mm" */
export function deMinutos(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

/** "HH:mm" → "8:00 AM" / "14:30 PM" (formato de visualización usado en la agenda) */
export function a12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const sufijo = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

/** "YYYY-MM-DD" → Date (medianoche UTC, sin sorpresas de zona horaria) */
export function fechaADate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

/** Date → "YYYY-MM-DD" (parte de fecha local) */
export function aFechaISO(d: Date): string {
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** "YYYY-MM-DD" → día de la semana local (0 = Domingo … 6 = Sábado) */
export function diaDeLaSemana(iso: string): number {
  return fechaADate(iso).getDay();
}

/** "YYYY-MM-DD" → "15/11/2026" */
export function aFechaLegible(iso: string): string {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}

export const NOMBRES_DIA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
