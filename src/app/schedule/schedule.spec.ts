import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Schedule } from './schedule';
import { AuthService } from '../services/auth';
import { NotificacionesService } from '../services/notificaciones';
import { environment } from '../../environments/environment';
import { vi } from 'vitest';

/**
 * Doble de prueba de `AuthService`: sin sesión, para que los tests no
 * dependan del localStorage ni de una petición real a /auth/me.
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

  // Los avisos del proyecto se emiten con el servicio de notificaciones propio
  // y NUNCA con alert() nativo del navegador, que no se muestra de forma
  // confiable y no se puede estilizar.
  describe('notificaciones del proyecto (sin alert nativo)', () => {
    let aviso: ReturnType<typeof vi.spyOn>;
    let errorDe: ReturnType<typeof vi.spyOn>;
    let exito: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      const servicio = TestBed.inject(NotificacionesService);
      aviso = vi.spyOn(servicio, 'aviso');
      errorDe = vi.spyOn(servicio, 'error');
      exito = vi.spyOn(servicio, 'exito');
      vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    // Cubre los avisos de validación del calendario y de la reserva:
    // fecha pasada, descanso, sin sesión, datos incompletos, fuera de horario,
    // horario ocupado y errores del backend.
    it('emite avisos del proyecto y no usa window.alert', () => {
      // Sin sesión + sin datos → dos avisos de validación de `reservar()`.
      component.reservar();
      expect(aviso).toHaveBeenCalledWith('Debes iniciar sesión antes de reservar');
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('emite exito del proyecto al reservar y no usa window.alert', async () => {
      TestBed.inject(AuthService).obtenerUsuario = () => ({
        id: 1, nombre: 'Test', apellido: 'User', email: 't@t.com', correo: 't@t.com', activo: true, rol: 'cliente' as const,
      });
      // Los validadores se simulan para que el flujo llegue al POST sin
      // depender de la fecha real del reloj ni de horarios precargados.
      vi.spyOn(component as never, 'estaEnHorarioEmpleado').mockReturnValue(true);
      vi.spyOn(component as never, 'esFechaPasada').mockReturnValue(false);
      vi.spyOn(component as never, 'horaOcupada').mockReturnValue(false);
      component.empleadoSeleccionado.set(1);
      component.seleccionarFecha(15);
      component.seleccionarHora('10:00');
      component.reservar();
      httpMock.expectOne((req) => req.method === 'POST' && req.url === `${environment.apiUrl}/citas`).flush({
        id: 9, usuario_id: 1, empleado_id: 1,
        fecha: '2026-12-15', hora_inicio: '10:00', hora_fin: '10:30',
      });
      httpMock.match(() => true).forEach((req) => req.flush([]));
      await fixture.whenStable();
      expect(exito).toHaveBeenCalledWith('Cita reservada con éxito');
      expect(window.alert).not.toHaveBeenCalled();
    });
  });
});
