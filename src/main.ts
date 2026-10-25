/**
 * Punto de entrada del SPA.
 *
 * La app es "standalone" (sin AppModule), así que el arranque se hace aquí:
 * se le pasan a `bootstrapApplication` el componente raíz y el objeto de
 * configuración que contiene todos los providers.
 *
 * `zone.js` se importa de forma explícita porque la detección de cambios de
 * Angular depende de que Zone parchee las APIs asíncronas del navegador; si
 * se omitiera, la vista dejaría de refrescarse tras eventos y respuestas HTTP.
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { routes } from './app/app.routes';
import { App } from './app/app';
import 'zone.js';

// Un fallo al montar la app no lanza una excepción no capturada: se registra
// en consola porque es el único rastro disponible cuando todavía no existe
// ningún componente que pueda mostrar el error al usuario.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
