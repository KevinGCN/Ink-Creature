import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TawkService {

  constructor(@Inject(DOCUMENT) private document: Document) {}

  public loadChat() {
    // Evita duplicar el chat si el servicio se vuelve a llamar
    if (this.document.getElementById('tawk-script')) return;

    const s1 = this.document.createElement('script');
    s1.id = 'tawk-script';
    s1.async = true;
    // REEMPLAZA ESTA URL POR LA QUE TE DIO TAWK.TO EN TU REGISTRO
    s1.src = 'https://embed.tawk.to/6a18cdd53f9e9f1c33fcdc10/1jpoe82od';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');

    const s0 = this.document.getElementsByTagName('script')[0];
    s0.parentNode?.insertBefore(s1, s0);
  }
}
