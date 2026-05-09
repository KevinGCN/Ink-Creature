/**
 * Componente de autenticación (Login / Registro) - Modal
 * 
 * Proporciona una interfaz modal para que los usuarios puedan:
 * - Iniciar sesión con correo/contraseña o Google
 * - Registrarse creando una cuenta nueva
 * 
 * Validaciones:
 * - Registro: verifica correo duplicado en empleados.json
 * - Login: previene doble clic con estado de carga
 * - Mensajes de error específicos por tipo de cuenta existente
 */
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';

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

  /** Nombre completo del usuario (solo en registro) */
  nombre = '';

  /** Correo electrónico del usuario */
  correo = '';

  /** Contraseña del usuario */
  password = '';

  /** Mensaje de error general mostrado bajo los botones */
  mensajeError = '';

  /** Estado de carga de los botones */
  cargandoLogin = false;
  cargandoRegistro = false;
  cargandoGoogle = false;

  constructor(private auth: AuthService) {}

  /**
   * Cierra el modal emitiendo el evento `cerrar`
   */
  cerrarModal() {
    this.cerrar.emit();
  }

  /**
   * Cambia el formulario activo al modo registro
   */
  irARegistro() {
    this.modoRegistro = true;
  }

  /**
   * Cambia el formulario activo al modo login
   */
  irALogin() {
    this.modoRegistro = false;
  }

  /**
   * Inicia sesión con correo y contraseña.
   * Valida campos vacíos y formato de correo antes de enviar.
   * Previene doble clic con estado de carga.
   */
  async iniciarSesion() {
    if (this.cargandoLogin) return;
    
    this.mensajeError = '';

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
      const ok = await this.auth.login(this.correo, this.password);

      if (ok) {
        this.cerrarModal();
      } else {
        this.mensajeError = 'Correo o contraseña incorrectos. Por favor, verifica e intenta nuevamente.';
      }
    } catch (error: any) {
      this.mensajeError = 'Error al iniciar sesión. Por favor, intenta nuevamente.';
    } finally {
      this.cargandoLogin = false;
    }
  }

  /**
   * Registra un usuario nuevo validando:
   * - Todos los campos completos
   * - Formato de correo válido
   * - Contraseña mínima de 8 caracteres
   * - Verifica si el correo ya existe (en empleados.json o Firebase)
   */
  async registrarse() {
    if (this.cargandoRegistro) return;
    
    this.mensajeError = '';

    if (!this.nombre || !this.correo || !this.password) {
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

    // Verificar si el correo ya existe en empleados.json (cuenta registrada local)
    try {
      const res = await fetch('assets/empleados.json');
      const empleados: any[] = await res.json();
      const empleadoExiste = empleados.some(e => e.email === this.correo);
      if (empleadoExiste) {
        this.mensajeError = 'Ya tienes una cuenta registrada con este correo. Inicia sesión.';
        return;
      }
    } catch (error) {
      console.error('Error al verificar empleados:', error);
      // Continuamos de todos modos, por si el JSON no está disponible
    }

    this.cargandoRegistro = true;

    try {
      const ok = await this.auth.registrar({
        nombre: this.nombre,
        correo: this.correo,
        password: this.password,
      });

      if (ok) {
        this.cerrarModal();
      } else {
        this.mensajeError = 'Error al registrar. Intenta nuevamente.';
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // El correo ya existe en Firebase (probablemente cuenta de Google)
        this.mensajeError = 'Este correo ya está vinculado a una cuenta de Google. Inicia sesión con Google.';
      } else {
        this.mensajeError = 'Error al registrar. Por favor, intenta nuevamente.';
        console.error('Registro error:', error);
      }
    } finally {
      this.cargandoRegistro = false;
    }
  }

  /**
   * Inicia sesión mediante Google Popup.
   * Maneja estado de carga del botón y traduce errores a mensajes amigables.
   */
  async loginConGoogle() {
    this.mensajeError = '';
    this.cargandoGoogle = true;

    try {
      const ok = await this.auth.loginConGoogle();
      if (ok) {
        this.cerrarModal();
      } else {
        this.mensajeError = 'Error al iniciar con Google. Por favor, intenta nuevamente.';
      }
    } catch (error: any) {
      this.mensajeError = 'No se pudo iniciar sesión con Google. Por favor, intenta nuevamente o usa correo y contraseña.';
    } finally {
      this.cargandoGoogle = false;
    }
  }
}
