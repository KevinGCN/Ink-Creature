/**
 * Modelo de usuario — espejo del backend NestJS (tabla `usuarios`).
 *
 * NOTA: el backend NUNCA devuelve `password_hash` (usa select seguro).
 */
export type RolUsuario = 'cliente' | 'empleado' | 'admin';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  telefono?: string | null;
  foto_perfil_url?: string | null;
  fecha_registro?: string;
  fecha_actualizacion?: string;
}

/** Respuesta de POST /api/auth/login */
export interface LoginResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}
