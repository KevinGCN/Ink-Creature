import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'zone.js';

bootstrapApplication(App, appConfig).catch((err) => {
  console.error('Bootstrap failed:', err);
  document.body.insertAdjacentHTML(
    'beforeend',
    '<pre style="color:#b00020;background:#fff;padding:16px;font:13px monospace">' +
      'Error al iniciar la aplicación. Revisa la consola del navegador.\n\n' +
      String(err) +
      '</pre>'
  );
});
