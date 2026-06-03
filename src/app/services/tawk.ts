import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

// Referencia al objeto global de la API de Tawk.to
declare const Tawk_API: any;

@Injectable({
  providedIn: 'root'
})
export class TawkService {

  /** Datos de contacto de soporte técnico */
  private readonly soporte = {
    whatsapp    : '+57 317 388 4278',
    whatsappUrl : 'https://wa.me/573173884278',
    instagram   : '@emersonmo.3',
    instagramUrl: 'https://www.instagram.com/emersonmo.3'
  };

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /** Carga el widget de Tawk.to (evita duplicados) */
  public loadChat(): void {
    if (this.document.getElementById('tawk-script')) return;

    const s1 = this.document.createElement('script');
    s1.id      = 'tawk-script';
    s1.async   = true;
    s1.src     = 'https://embed.tawk.to/6a18cdd53f9e9f1c33fcdc10/1jpoe82od';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');

    const s0 = this.document.getElementsByTagName('script')[0];
    s0.parentNode?.insertBefore(s1, s0);
  }

  /** Abre el widget del chat */
  public abrirChat(): void {
    if (typeof Tawk_API !== 'undefined') {
      Tawk_API.maximize();
    }
  }

  /** Cierra el widget del chat */
  public cerrarChat(): void {
    if (typeof Tawk_API !== 'undefined') {
      Tawk_API.minimize();
    }
  }

  /**
   * Devuelve la información de contacto de soporte.
   * Útil si quieres mostrarla en algún componente de la app.
   */
  public getContactoSoporte() {
    return { ...this.soporte };
  }
}
