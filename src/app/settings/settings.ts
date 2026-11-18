import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import { UsuarioService } from '../services/usuarios';

/**
 * Página de Ajustes de la cuenta.
 *
 * Reúne lo que el usuario necesita para gestionar su sesión y su cuenta:
 * - Datos básicos y acceso al perfil editable.
 * - Cerrar sesión en este dispositivo.
 * - Eliminar la cuenta (con confirmación escrita) o solicitar la baja por WhatsApp.
 *
 * Nota: el backend solo permite `DELETE /usuarios/:id` a administradores. Por eso,
 * si un cliente o tatuador intenta borrar su cuenta, se le ofrece la vía de
 * WhatsApp en lugar de mostrar un error técnico.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  usuario: any = {};
  esAdmin = false;

  confirmandoEliminar = false;
  textoConfirmacion = '';
  eliminando = false;

  mensajeError = '';
  mensajeExito = '';

  /** Contacto del estudio para solicitar la baja de la cuenta. */
  readonly whatsapp = 'https://wa.me/573113884278';

  constructor(
    private auth: AuthService,
    private router: Router,
    private usuarios: UsuarioService,
  ) {}

  ngOnInit(): void {
    this.usuario = this.auth.obtenerUsuario() ?? {};
    this.esAdmin = this.auth.esAdmin();
  }

  get nombreCompleto(): string {
    const nombre = this.usuario?.nombre || this.usuario?.name || '';
    const apellido = this.usuario?.apellido || this.usuario?.last_name || '';
    return `${nombre} ${apellido}`.trim() || 'Sin nombre';
  }

  get correo(): string {
    return this.usuario?.email || this.usuario?.correo || 'Sin correo';
  }

  get rolEtiqueta(): string {
    switch (this.usuario?.rol) {
      case 'admin':
        return 'Administrador';
      case 'empleado':
        return 'Tatuador / empleado';
      default:
        return 'Cliente';
    }
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  abrirConfirmacion(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.textoConfirmacion = '';
    this.confirmandoEliminar = true;
  }

  cancelarConfirmacion(): void {
    this.confirmandoEliminar = false;
    this.textoConfirmacion = '';
  }

  async eliminarCuenta(): Promise<void> {
    if (this.eliminando) return;

    if (this.textoConfirmacion.trim().toUpperCase() !== 'ELIMINAR') {
      this.mensajeError = 'Escribe la palabra ELIMINAR para confirmar.';
      return;
    }

    const id = this.usuario?.id ?? this.usuario?.uid;
    if (!id) {
      this.mensajeError =
        'No pudimos identificar tu cuenta. Escríbenos por WhatsApp y la eliminamos manualmente.';
      return;
    }

    this.eliminando = true;
    this.mensajeError = '';

    try {
      await this.usuarios.eliminarUsuario(id);
      this.mensajeExito = 'Tu cuenta fue eliminada. Cerrando sesión…';
      setTimeout(() => {
        this.auth.logout();
        this.router.navigate(['/']);
      }, 1200);
    } catch (error: any) {
      const status = error?.status;

      if (status === 403) {
        this.mensajeError =
          'Tu tipo de cuenta no se puede eliminar desde aquí. Escríbenos por WhatsApp y la eliminamos manualmente.';
      } else if (status === 0 || status === undefined) {
        this.mensajeError =
          'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.';
      } else {
        this.mensajeError =
          'No se pudo eliminar la cuenta. Escríbenos por WhatsApp para ayudarte.';
        console.error('Error al eliminar la cuenta:', error);
      }
      this.eliminando = false;
    }
  }

  /** Enlace de WhatsApp con el mensaje de baja ya escrito. */
  get enlaceBajaWhatsapp(): string {
    const texto = `Hola, quiero solicitar la eliminación de mi cuenta de Ink Creature (${this.correo}).`;
    return `${this.whatsapp}?text=${encodeURIComponent(texto)}`;
  }
}
