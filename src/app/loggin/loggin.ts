/**
 * Componente de autenticación (Login / Registro) - Modal
 *
 * Interfaz modal para iniciar sesión o registrarse contra el
 * backend NestJS (POST /api/auth/login y POST /api/usuarios).
 *
 * NOTA: se eliminó el login con Google (@angular/fire): el backend
 * solo valida correo/contraseña con JWT.
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';

/**
 * Modal de acceso: alterna entre iniciar sesión y crear cuenta.
 *
 * El componente no guarda nada por su cuenta: delega en `AuthService`, que
 * hace `POST /api/auth/login` (o `POST /api/usuarios`), guarda el token en
 * `localStorage['access_token']` y publica el usuario en sus signals. Aquí
 * solo se valida el formulario, se muestra el error y se cierra el modal.
 */
@Component({
  selector: 'app-loggin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loggin.html',
  styleUrls: ['./loggin.css']
})
export class Loggin {
  /** Indica si el formulario activo es el de registro (true) o login (false) */
  modoRegistro = false;

  /** Evento emitido al cerrar el modal */
  @Output() cerrar = new EventEmitter<void>();

  /** Nombre del usuario (solo en registro) */
  nombre = '';

  /** Apellido del usuario (solo en registro; el backend lo requiere) */
  apellido = '';

  /** Correo electrónico del usuario */
  correo = '';

  /** Contraseña del usuario */
  password = '';

  /** Mensaje de error general mostrado bajo los botones */
  mensajeError = '';

  /** Estado de carga de los botones */
  cargandoLogin = false;
  cargandoRegistro = false;

  /** `AuthService` centraliza las llamadas HTTP y el almacenamiento del token */
  constructor(private auth: AuthService) {}

  /** Cierra el modal emitiendo el evento `cerrar` */
  cerrarModal() {
    this.cerrar.emit();
  }

  /** Cambia el formulario activo al modo registro */
  irARegistro() {
    this.modoRegistro = true;
    this.mensajeError = '';
  }

  /** Cambia el formulario activo al modo login */
  irALogin() {
    this.modoRegistro = false;
    this.mensajeError = '';
  }

  /**
   * Inicia sesión con correo y contraseña contra el backend.
   * Previene doble clic con estado de carga.
   *
   * `auth.login` hace `POST /api/auth/login`, guarda el JWT en
   * `localStorage['access_token']` y publica el usuario en sus signals; aquí
   * solo se cierra el modal (el navbar reacciona a la sesión ya iniciada, sin
   * recargar la página) o se muestra el mensaje de credenciales incorrectas.
   */
  async iniciarSesion() {
    if (this.cargandoLogin) return;

    this.mensajeError = '';

    // Comprobaciones locales rápidas: evitan un viaje al backend inútil.
    if (!this.correo || !this.password) {
      this.mensajeError = 'Por favor, ingresa tu correo y contraseña';
      return;
    }

    if (!this.correo.includes('@')) {
      this.mensajeError = 'Por favor, ingresa un correo electrónico válido';
      return;
    }

    this.cargandoLogin = true;

    try {
      // Devuelve true/false: los 401 se traducen a false en el servicio.
      const ok = await this.auth.login(this.correo, this.password);

      if (ok) {
        // Sesión guardada: se cierra el modal y la vista se actualiza sola.
        this.cerrarModal();
      } else {
        this.mensajeError = 'Correo o contraseña incorrectos. Por favor, verifica e intenta nuevamente.';
      }
    } catch {
      this.mensajeError = 'Error al iniciar sesión. Por favor, intenta nuevamente.';
    } finally {
      this.cargandoLogin = false;
    }
  }

  /**
   * Registra un usuario nuevo en el backend y lo deja logueado.
   * Validaciones: campos completos, correo válido y contraseña >= 8.
   */
  async registrarse() {
    if (this.cargandoRegistro) return;
    this.mensajeError = '';

    if (!this.nombre || !this.apellido || !this.correo || !this.password) {
      this.mensajeError = 'Por favor, completa todos los campos para registrarte';
      return;
    }
    if (!this.correo.includes('@')) {
      this.mensajeError = 'Por favor, ingresa un correo electrónico válido';
      return;
    }
    if (this.password.length < 8) {
      this.mensajeError = 'La contraseña debe tener al menos 8 caracteres para mayor seguridad';
      return;
    }

    this.cargandoRegistro = true;

    try {
      // El backend crea el usuario y devuelve el token: queda logueado.
      const ok = await this.auth.registrar({
        nombre: this.nombre,
        apellido: this.apellido,
        correo: this.correo,
        password: this.password,
      });
      if (ok) {
        this.cerrarModal();
      } else {
        this.mensajeError = 'Error al registrar. Intenta nuevamente.';
      }
    } catch (error) {
      // 409 = el correo ya existe (el backend lo comprueba con el índice único).
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.mensajeError = 'Este correo ya está registrado. Inicia sesión con él.';
      } else {
        this.mensajeError = 'Error al registrar. Por favor, intenta nuevamente.';
        console.error('Registro error:', error);
      }
    } finally {
      this.cargandoRegistro = false;
    }
  }
}
