/**
 * Configuración de la aplicación Angular
 *
 * Punto de entrada de providers de la app.
 *
 * Providers:
 * 1. provideBrowserGlobalErrorListeners() - Captura errores globales
 * 2. provideRouter() - Sistema de enrutamiento
 * 3. provideHttpClient(withInterceptors) - HttpClient con el interceptor
 *    que adjunta el JWT del backend a cada petición.
 *
 * NOTA: se eliminó por completo la inicialización de Firebase
 * (@angular/fire): la autenticación ahora la gestiona el backend
 * NestJS vía JWT (ver services/auth.ts).
 */
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Manejo de errores globales no capturados
    provideBrowserGlobalErrorListeners(),

    // Proveedor del sistema de enrutamiento
    provideRouter(routes),

    // HttpClient + interceptor global de autenticación (JWT Bearer)
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
