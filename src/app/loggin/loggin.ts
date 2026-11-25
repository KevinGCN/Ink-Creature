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
 * - Mensajes de error claros sin revelar si un correo está registrado
 */
import { Component, Output, EventEmitter, Optional, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-loggin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loggin.html',
  styleUrls: ['./loggin.css']
})
export class Loggin implements OnInit {
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

  /** Mensaje de éxito mostrado bajo los botones */
  mensajeExito = '';

  /** Aviso cuando la petición tarda demasiado (servidor despertando). */
  avisoDemora = '';

  /** Ruta a la que volver después de iniciar sesión (viene de ?volver=). */
  private volverA = '';

  private temporizadorDemora: ReturnType<typeof setTimeout> | null = null;

  /** Estado de carga de los botones */
  cargandoLogin = false;
  cargandoRegistro = false;
  cargandoGoogle = false;

  constructor(
    private auth: AuthService,
    @Optional() private router: Router
  ) {}

  ngOnInit(): void {
    // El guard de rutas protegidas redirige a /loggin?volver=/schedule, así
    // que tras autenticarse se vuelve a la página que el usuario buscaba.
    if (!this.router) return;
    const params = this.router.parseUrl(this.router.url).queryParams;
    this.volverA = typeof params['volver'] === 'string' ? params['volver'] : '';
  }

  /**
   * Cierra el login.
   *
   * - Dentro de la barra (modal): avisa al padre para que lo oculte.
   * - Como página (/loggin): no hay padre que escuche, así que navega
   *   de vuelta a la página de origen (`?volver=`) o al inicio.
   */
  cerrarModal() {
    if (!this.router) {
      this.cerrar.emit();
      return;
    }

    const ruta = this.router.url.split('?')[0].split('#')[0];

    if (ruta === '/loggin') {
      this.router.navigateByUrl(this.volverA || '/');
      return;
    }

    this.cerrar.emit();
  }

  /**
   * Cambia el formulario activo al modo registro
   */
  irARegistro() {
    this.modoRegistro = true;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  /**
   * Cambia el formulario activo al modo login
   */
  irALogin() {
    this.modoRegistro = false;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  /**
   * Navega al inicio solo cuando el componente se usa como página (/loggin).
   * Dentro de user-navbar (modal) el padre cierra el modal con el evento `cerrar`.
   */
  private irAlInicioSiEsRutaLoggin() {
    if (!this.router) return;

    // Si venimos de una ruta protegida (?volver=...), regresamos ahí.
    if (this.volverA) {
      const destino = this.volverA;
      setTimeout(() => this.router.navigateByUrl(destino), 900);
      return;
    }

    const ruta = this.router.url.split('?')[0].split('#')[0];
    if (ruta === '/loggin') {
      // Deja ver el mensaje de éxito antes de salir del formulario.
      setTimeout(() => this.router.navigate(['/']), 900);
    }
  }

  /**
   * Inicia sesión con correo y contraseña.
   * Valida campos vacíos y formato de correo antes de enviar.
   * Previene doble clic con estado de carga.
   */
  async iniciarSesion() {
    if (this.cargandoLogin) return;

    this.mensajeError = '';
    this.mensajeExito = '';
    this.avisoDemora = '';

    if (!this.correo || !this.password) {
      this.mensajeError = 'Ingresa tu correo y contraseña para continuar.';
      return;
    }

    if (!this.correo.includes('@')) {
      this.mensajeError =
        'Escribe un correo válido, por ejemplo nombre@dominio.com.';
      return;
    }

    this.cargandoLogin = true;
    // En el plan gratuito de Render el servicio se duerme y la primera
    // petición puede tardar. Avisamos en vez de dejar el botón mudo.
    this.temporizadorDemora = setTimeout(() => {
      this.avisoDemora =
        'El servidor está tardando más de lo normal (puede estar despertando). Espera unos segundos…';
    }, 6000);

    try {
      const ok = await this.auth.login(this.correo, this.password);

      if (ok) {
        this.mensajeExito = 'Sesión iniciada correctamente.';
        this.cerrarModal();
        this.irAlInicioSiEsRutaLoggin();
      } else {
        this.mensajeError =
          'No pudimos iniciar sesión. Inténtalo de nuevo.';
      }
    } catch (error: any) {
      const status = error?.status;

      if (status === 401) {
        // El backend no distingue entre correo inexistente y contraseña
        // incorrecta (evita revelar qué cuentas existen), así que el mensaje
        // cubre los dos casos y también el de una cuenta desactivada.
        this.mensajeError =
          'El correo o la contraseña no son correctos. Verifica que estén bien escritos. Si aún no tienes cuenta, usa «Registrarse»; si el problema continúa, tu cuenta podría estar desactivada.';
      } else if (status === 0 || status === undefined) {
        this.mensajeError =
          'No pudimos conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.';
      } else if (status >= 500) {
        this.mensajeError =
          'El servidor está teniendo problemas. Espera unos segundos y vuelve a intentarlo.';
      } else {
        this.mensajeError =
          'Ocurrió un error inesperado al iniciar sesión. Inténtalo de nuevo.';
        console.error('Error de login:', error);
      }
    } finally {
      if (this.temporizadorDemora) {
        clearTimeout(this.temporizadorDemora);
        this.temporizadorDemora = null;
      }
      this.avisoDemora = '';
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
    this.mensajeExito = '';
    if (!this.nombre || !this.correo || !this.password) {
      this.mensajeError =
        'Completa nombre, correo y contraseña para crear tu cuenta.';
      return;
    }
    if (!this.correo.includes('@')) {
      this.mensajeError =
        'Escribe un correo válido, por ejemplo nombre@dominio.com.';
      return;
    }
    if (this.password.length < 8) {
      this.mensajeError = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    this.cargandoRegistro = true;

    try {
      const ok = await this.auth.registrar({
        nombre: this.nombre,
        correo: this.correo,
        password: this.password,
      });
      if (ok) {
        this.mensajeExito = 'Cuenta creada correctamente.';
        this.cerrarModal();
        this.irAlInicioSiEsRutaLoggin();
      } else {
        this.mensajeError =
          'No pudimos crear tu cuenta. Inténtalo de nuevo.';
      }
    } catch (error: any) {
      if (error?.status === 409) {
        this.mensajeError =
          'Ya existe una cuenta con ese correo. Inicia sesión o usa otro correo.';
      } else if (error?.status === 400) {
        this.mensajeError =
          'Revisa los datos: el correo debe ser válido y la contraseña tener al menos 8 caracteres.';
      } else {
        this.mensajeError =
          'No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo.';
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
    this.mensajeExito = '';
    this.cargandoGoogle = true;

    try {
      const ok = await this.auth.loginConGoogle();
      if (ok) {
        this.mensajeExito = 'Sesión iniciada correctamente.';
        this.cerrarModal();
        this.irAlInicioSiEsRutaLoggin();
      } else {
        this.mensajeError =
          'No se completó el inicio de sesión con Google. Inténtalo de nuevo.';
      }
    } catch (error: any) {
      this.mensajeError =
        'No pudimos iniciar sesión con Google. Si se abrió una ventana, ciérrala e inténtalo otra vez, o usa correo y contraseña.';
    } finally {
      this.cargandoGoogle = false;
    }
  }
}