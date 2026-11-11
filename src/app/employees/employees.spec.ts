// employees.spec.ts — prueba de humo del módulo Workers (Angular 21 + Vitest).

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Employees } from './employees';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment';
import { ConfirmacionService } from '../services/confirmacion';
import { NotificacionesService } from '../services/notificaciones';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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

// Los avisos y confirmaciones del módulo Workers salen del propio proyecto
// (toasts + modal), nunca de alert()/confirm() nativos del navegador.
const API = environment.apiUrl;

describe('Employees — notificaciones del proyecto (sin alert nativo)', () => {
  let component: Employees;
  let fixture: ComponentFixture<Employees>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Employees],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Employees);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // Resuelve las cargas iniciales para no dejar requests pendientes.
    httpMock.match(() => true).forEach((req) => req.flush([]));
    await fixture.whenStable();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('confirma la eliminación con el modal propio y avisa el error sin window.confirm/alert', async () => {
    const servicio = TestBed.inject(NotificacionesService);
    const confirmacion = TestBed.inject(ConfirmacionService);
    const errorDe = vi.spyOn(servicio, 'error');
    // Sin `await` todavía: la promesa se resuelve al responder en el modal.
    const eliminando = component.eliminar({ id: 1, usuario_id: 5, usuarios: { nombre: 'Ana', apellido: 'Gómez' } } as never);
    await fixture.whenStable();
    expect(window.confirm).not.toHaveBeenCalled();
    expect(confirmacion.estado()).not.toBeNull();
    confirmacion.responder(true);
    await eliminando;
    // La respuesta de error del backend (FK de citas) avisa con un toast.
    httpMock
      .expectOne(`${API}/usuarios/5`)
      .flush({ message: 'x' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();
    expect(errorDe).toHaveBeenCalled();
    expect(window.confirm).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });
});
