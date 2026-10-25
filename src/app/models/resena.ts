/**
 * Reseña del muro de comentarios del lobby.
 *
 * No tiene equivalente en el backend: `ResenaService` la persiste en
 * `localStorage`, así que el modelo describe lo que se guarda en el navegador
 * y no una tabla de Postgres.
 */
export interface Resena {
    /** Lo asigna el servicio al publicar (id incremental local). */
    id: number;
    // Nombre desnormalizado a propósito: se guarda como texto para que la
    // reseña siga siendo legible aunque el usuario cambie de nombre o se
    // borre la cuenta (y para el caso "Usuario" sin sesión).
    nombreUsuario: string;
    comentario: string;
    /** Fecha ya formateada para mostrar ("dd/mm/aaaa"), no un ISO. */
    fecha: string;
    /** Estrellas de 1 a 5 (el formulario no permite valores fuera del rango). */
    calificacion: number;
}
