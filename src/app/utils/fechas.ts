/**
 * Utilidades de fecha/hora para trabajar con las columnas del backend:
 * - `fecha` de citas: string "YYYY-MM-DD"
 * - `hora_inicio` / `hora_fin`: Prisma las devuelve como ISO completo
 *   ("1970-01-01T10:00:00.000Z") aunque la columna sea @db.Time.
 */

// El backend normaliza con APP_TIMEZONE (America/Bogota) antes de guardar, así
// que aquí solo se formatea lo que llega como "hora local del negocio":
// reconvertir zonas en el cliente volvería a desplazar las citas. Y se corta
// el string en vez de usar `getHours()` porque Prisma devuelve las horas con
// el prefijo 1970-01-01 en UTC (con Date saldrían 5 horas antes).
/** Convierte cualquier fecha ISO a "HH:mm" */
export function horaCorta(iso: string | Date): string {
  const s = typeof iso === 'string' ? iso : iso.toISOString();
  return s.slice(11, 16);
}

// Toda la agenda compara rangos en minutos: sumar/restar enteros evita la
// aritmética frágil de strings "HH:mm" al calcular huecos libres.
/** Convierte "HH:mm" a minutos desde medianoche */
export function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Convierte minutos a "HH:mm" */
export function deMinutos(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

// La rejilla de horarios se pinta en 12h; la medianoche se muestra como "12"
// porque un "0:00 AM" no existe en el formato y confundiría al usuario.
/** "HH:mm" → "8:00 AM" / "14:30 PM" (formato de visualización usado en la agenda) */
export function a12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const sufijo = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

// La medianoche se fija en UTC a propósito: con el constructor de hora local,
// el día cambiaría según la zona y `diaDeLaSemana()` podría devolver un día
// de más o de menos justo en los bordes del calendario.
/** "YYYY-MM-DD" → Date (medianoche UTC, sin sorpresas de zona horaria) */
export function fechaADate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

// Se usan las partes LOCALES: el Date del calendario representa un día del
// usuario, y `toISOString()` lo pasaría a UTC pudiendo devolver el día previo.
/** Date → "YYYY-MM-DD" (parte de fecha local) */
export function aFechaISO(d: Date): string {
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

// Misma convención que el backend (0 = domingo, igual que `Date.getDay()`),
// así los horarios guardados se comparan sin remapear índices.
/** "YYYY-MM-DD" → día de la semana local (0 = Domingo … 6 = Sábado) */
export function diaDeLaSemana(iso: string): number {
  return fechaADate(iso).getDay();
}

// Reordenar el string a mano (en lugar de usar Date/locale) evita que la
// fecha se desplace un día por la zona horaria del navegador.
/** "YYYY-MM-DD" → "15/11/2026" */
export function aFechaLegible(iso: string): string {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}

// El índice debe coincidir con `dia_semana` del backend (0 = Domingo): se
// empieza en domingo y no en lunes para no tener que traducir al pintar.
export const NOMBRES_DIA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
