/**
 * Pruebas del componente raíz: comprueban que el "shell" monta sin errores y
 * que la estructura (navbars + outlet) existe, que es de lo que dependen
 * todas las vistas hijas para renderizarse dentro.
 */
import { TestBed } from '@angular/core/testing';
import { expect, describe, it, beforeEach } from 'vitest';
import { App } from './app';
import { ActivatedRoute } from '@angular/router';

// Suite del componente raíz.
describe('App', () => {
  // Se configura el TestBed antes de cada prueba para que cada `it` parta de
  // un módulo limpio (Vitest no reinicia Angular automáticamente).
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          // Se simula `ActivatedRoute` porque los navbars lo inyectan; sin
          // este stub su constructor falla al no existir una ruta activa.
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map() }
          }
        }
      ]
    }).compileComponents();
  });

  // La instancia debe crearse sin lanzar.
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Verifica el layout completo: si falta alguno de los tres, la navegación
  // o la cabecera dejarían de pintarse en TODAS las rutas.
  it('should render the app layout (navbars + router outlet)', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-user-navbar')).toBeTruthy();
    expect(compiled.querySelector('app-main-navbar')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});