/**
 * Bootstrap del entorno de pruebas (Vitest + Angular).
 *
 * Cada spec importa este archivo de forma implícita: sin inicializar el
 * `TestBed` antes del primer `describe`, `TestBed.configureTestingModule()`
 * lanza un error porque no hay plataforma de pruebas registrada.
 *
 * Se importa `zone.js/testing` (y no `zone.js`) porque es la variante que
 * además instrumenta las APIs necesarias para que `fixture.whenStable()`
 * espere a que se estabilicen las tareas asíncronas.
 */
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Inicializar entorno de pruebas de Angular
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
