/**
 * Configuración de la aplicación Angular
 *
 * Punto de entrada de providers y configuración global.
 * Inicializa Firebase y provee los servicios esenciales
 * para toda la aplicación.
 */

import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { firebaseConfig } from './config/firebase.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth.interceptor';
import { loadingInterceptor } from './core/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    provideAuth(() => getAuth()),

    // HttpClient + JWT del backend en cada petición a la API.
    // El interceptor de carga va al final para medir también los errores.
    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor]))
  ]
};
