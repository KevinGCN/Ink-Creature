// employees.spec.ts — prueba de humo del módulo Workers (Angular 21 + Vitest).

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Employees } from './employees';
import { AuthService } from '../services/auth';

// Mock mínimo de la sesión: Employees solo consulta esAdmin().
const mockAuthService = {
  esAdmin: () => false,
  obtenerUsuario: () => null,
  estaLogueado: () => false
};

// Smoke test del componente: solo comprueba que se instancia con sus
// dependencias reales (servicios HTTP de pruebas + router vacío).
describe('Employees', () => {
  let component: Employees;
  let fixture: ComponentFixture<Employees>;

  // Monta el componente con AuthService sustituido por un mock: así no se
  // depende de una sesión real y `esAdmin()` queda en false (usuario normal).
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Employees],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Employees);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  // El componente debe crearse sin errores (ngOnInit lanza las cargas HTTP,
  // que quedan pendientes en el backend de pruebas).
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
