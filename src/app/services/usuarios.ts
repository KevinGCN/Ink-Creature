/**
 * Servicio de gestión de usuarios - Estado en memoria con JSON inicial
 * 
 * Servicio que combina datos iniciales desde JSON estático con estado
 * mutable en memoria. Útil para prototipado o gestión temporal sin
 * backend real.
 * 
 * Arquitectura:
 * - Carga inicial desde assets/usuarios.json
 * - Estado mutable en memoria (this.usuarios)
 * - Operaciones CRUD locales (sin persistencia)
 * 
 * Limitaciones conocidas:
 * - No persiste cambios (recarga de página pierde modificaciones)
 * - Sin validación de duplicados en creación
 * - getUsuarios() devuelve referencia directa (no inmutable)
 * 
 * Mejoras potenciales:
 * - Implementar Subject/BehaviorSubject para reactividad
 * - Añadir persistencia en localStorage
 * - Retornar copias defensivas (getUsuarios())
 */
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})

export class UsuarioService {
  /** URL del recurso JSON inicial */
  private url = 'assets/usuarios.json';
  
  /** Estado en memoria de la colección de usuarios */
  private usuarios: Usuario[] = [];

  constructor(private http: HttpClient) {}

  /**
   * Carga inicial de usuarios desde JSON estático
   * Suscripción interna - dispara side effect
   */
  cargarUsuarios() {
    this.http.get<Usuario[]>(this.url).subscribe(data => {
      this.usuarios = data;
    });
  }

  /**
   * Retorna la colección actual de usuarios
   * ⚠️ Retorna referencia directa, no copia defensiva
   */
  getUsuarios(): Usuario[] {
    return this.usuarios;
  }

  /**
   * Crea un nuevo usuario en memoria
   * @param name Nombre completo
   * @param email Correo electrónico
   * @param password Contraseña (texto plano)
   */
  crearUsuario(name: string, email: string, password: string) {
    const nuevo: Usuario = {
      id: this.generarId(),
      name: name,
      email: email,
      password: password
    };
    this.usuarios.push(nuevo);
  }

  /**
   * Actualiza el nombre de un usuario existente
   * @param id Identificador del usuario
   * @param name Nuevo nombre
   */
  setUsuarName(id: number, name: string): void {
    const usuario = this.usuarios.find(u => u.id === id);
    if (usuario) {
      usuario.name = name;
    }
  }

  /**
   * Elimina un usuario por ID
   * @param id Identificador del usuario a eliminar
   */
  eliminarUsuario(id: number) {
    this.usuarios = this.usuarios.filter(u => u.id !== id);
  }

  /**
   * Genera ID secuencial automático
   * @returns Siguiente ID disponible (max + 1)
   */
  private generarId(): number {
    if (this.usuarios.length === 0) return 1;
    return Math.max(...this.usuarios.map(u => u.id)) + 1;
  }
}
