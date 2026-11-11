/**
 * Modelo de empleado / tatuador.
 *
 * Los datos viven en la colección `empleados` de Firestore.
 * Este modelo contiene únicamente campos de presentación y rol:
 * nunca contraseñas, que pertenecen exclusivamente a Firebase Auth.
 */
export interface Empleado {
  id: string;
  name: string;
  last_name: string;
  email: string;
  phone?: string;
  charge: string;
}
