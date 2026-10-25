/**
 * Modelo de usuario — espejo del backend NestJS (tabla `usuarios`).
 *
 * NOTA: el backend NUNCA devuelve `password_hash` (usa select seguro).
 */
/**
 * Los tres valores son excluyentes y los decide el backend: "cliente" solo
 * reserva, "empleado" aparece en el catálogo de tatuadores y "admin" gestiona
 * catálogo, roles y usuarios. Se usan para mostrar/ocultar controles, pero el
 * permiso real lo valida el servidor (RolesGuard).
 */
export type RolUsuario = 'cliente' | 'empleado' | 'admin';

/** Fila de `usuarios` (el backend aplica un select seguro que omite la clave). */
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  // No viene en `UpdateUsuarioDto` a propósito: un cliente que pudiera
  // enviarlo se auto-ascendería. Solo cambia por PATCH /api/usuarios/:id/rol.
  rol: RolUsuario;
  /** Baja lógica: desactivar conserva citas y reseñas del usuario. */
  activo: boolean;
  /** Solo dígitos o formato local; el backend no lo normaliza. */
  telefono?: string | null;
  // Ruta relativa ("/api/imagenes/<id>") y no absoluta: así la fila sigue
  // siendo válida en cualquier host. Hay que pasarla por `urlImagen()`.
  foto_perfil_url?: string | null;
  fecha_registro?: string;
  fecha_actualizacion?: string;
}

// El backend trabaja en UTC y `expires_in` son segundos (no una fecha): así el
// cliente no depende del reloj del servidor ni del suyo para caducar la sesión.
/** Respuesta de POST /api/auth/login */
export interface LoginResponse {
  access_token: string;
  /** Esquema que espera el header `Authorization` del backend. */
  token_type: 'Bearer';
  expires_in: number;
}
