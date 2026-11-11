/**
 * Configuración de la aplicación Angular
 *
 * Punto de entrada de providers y configuración global.
 * Inicializa Firebase y provee los servicios esenciales
 * para toda la aplicación.
 *
 * Providers:
 * 1. provideBrowserGlobalErrorListeners() - Captura errores globales
 * 2. provideRouter() - Sistema de enrutamiento
 * 3. provideFirebaseApp() - Inicialización Firebase
 * 4. provideAuth() - Servicio de autenticación Firebase
 * 5. provideHttpClient() - HTTP con interceptor JWT para el backend
 * 6. provideFirestore() - Base de datos Firestore
 *
 * Integración Firebase:
 * - provideFirebaseApp inicializa la app con firebaseConfig
 * - provideAuth expone getAuth() para inyección en servicios
 * - provideFirestore expone getFirestore() para inyección en servicios
 * - Todos usan factories () => para lazy-initialization
 */

import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { firebaseConfig } from './config/firebase.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    // Proveedor del servicio Auth de Firebase
    provideAuth(() => getAuth()),

    // HttpClient + JWT del backend en cada petición a la API
    provideHttpClient(withInterceptors([authInterceptor])),

    // Proveedor de Firestore (empleados y roles)
    provideFirestore(() => getFirestore())
  ]
};
