import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Schedule } from './schedule';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment';

/**
 * Doble de prueba de `AuthService`: sin sesión, para que los tests no
 * dependan del localStorage ni de una petición real a /api/auth/me.
 */
const mockAuthService = {
  esAdmin: () => false,
  obtenerUsuario: () => null,
  estaLogueado: () => false
};

// Suite del componente de agenda (calendario + reserva de citas).
describe('Schedule', () => {
  // Referencias al componente, su fixture y el mock de HTTP, reusadas por cada test.
  let component: Schedule;
  let fixture: ComponentFixture<Schedule>;
  let httpMock: HttpTestingController;

  // Se crea el componente con el AuthService simulado y HTTP de pruebas.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Schedule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Schedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // Vacía las peticiones iniciales (citas, empleados y/o horarios).
    httpMock.match(() => true).forEach((req) => req.flush([]));
    await fixture.whenStable();
    fixture.detectChanges();
  });

  // Caso base: el componente debe instanciarse sin errores de DI.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
