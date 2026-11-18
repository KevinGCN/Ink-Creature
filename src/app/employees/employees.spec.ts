import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Employees } from './employees';
import { AuthService } from '../services/auth';
import { ConfirmacionService } from '../services/confirmacion';
import { NotificacionesService } from '../services/notificaciones';
import { environment } from '../../environments/environment';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mocks
const mockAuthService = {
  obtenerUsuario: () => ({ charge: 'Tatuador' }),
  esAdmin: () => false,
};

const API = environment.apiUrl;

describe('Employees', () => {
  let component: Employees;
  let fixture: ComponentFixture<Employees>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Employees],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Employees);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // Resuelve la carga inicial del catálogo (empleados + horarios).
    httpMock.match(() => true).forEach((req) => req.flush([]));
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// La confirmación de eliminar tatuador sale del modal propio del proyecto
// (toasts + modal), nunca de confirm()/alert() nativos del navegador.
describe('Employees — notificaciones del proyecto (sin alert nativo)', () => {
  let component: Employees;
  let fixture: ComponentFixture<Employees>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Employees],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Employees);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.match(() => true).forEach((req) => req.flush([]));
    await fixture.whenStable();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => httpMock.verify());

  it('confirma la eliminación con el modal propio y avisa el error sin window.confirm ni window.alert', async () => {
    const servicio = TestBed.inject(NotificacionesService);
    const confirmacion = TestBed.inject(ConfirmacionService);
    const errorDe = vi.spyOn(servicio, 'error');

    // clic en "🗑️ Eliminar" del tatuador id 5
    const eliminando = component.eliminar(5);
    await fixture.whenStable();

    // La pregunta la hizo el modal del proyecto, no confirm() nativo.
    expect(window.confirm).not.toHaveBeenCalled();
    expect(confirmacion.estado()).not.toBeNull();

    confirmacion.responder(true);
    await eliminando;

    // La respuesta de error del backend avisa con un toast del proyecto.
    httpMock
      .expectOne(`${API}/empleados/5`)
      .flush({ message: 'x' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(errorDe).toHaveBeenCalled();
    expect(window.confirm).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('al aceptar elimina el tatuador y recarga el catálogo sin window.confirm', async () => {
    const confirmacion = TestBed.inject(ConfirmacionService);
    const cargarSpy = vi.spyOn(component, 'cargarTatuadores');

    const eliminando = component.eliminar(5);
    await fixture.whenStable();

    confirmacion.responder(true);
    await eliminando;

    httpMock.expectOne(`${API}/empleados/5`).flush(null);
    await fixture.whenStable();
    // La recarga del catálogo pide de nuevo empleados y horarios.
    httpMock.match((req) => req.method === 'GET').forEach((req) => req.flush([]));
    await fixture.whenStable();

    expect(cargarSpy).toHaveBeenCalled();
    expect(confirmacion.estado()).toBeNull();
  });
});
