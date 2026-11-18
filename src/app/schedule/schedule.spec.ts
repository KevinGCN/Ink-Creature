import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { vi } from 'vitest';

import { Schedule } from './schedule';
import { AuthService } from '../services/auth';
import { CitaService } from '../services/citas';
import { EmpleadoService } from '../services/empleados';
import { NotificacionesService } from '../services/notificaciones';
import { of } from 'rxjs';

describe('Schedule', () => {
  let component: Schedule;
  let fixture: ComponentFixture<Schedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Schedule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            obtenerUsuario: () => ({ id: 7, email: 'cliente@test.com' }),
            estaLogueado: () => true,
          },
        },
        {
          provide: CitaService,
          useValue: {
            obtenerCitas: () => of([]),
            crear: () => of({}),
            actualizar: () => of({}),
          },
        },
        {
          provide: EmpleadoService,
          useValue: { getEmpleados: () => of([]) },
        },
        {
          provide: Router,
          useValue: {
            getCurrentNavigation: () => null,
            navigate: () => Promise.resolve(true),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Schedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('convierte la hora visible de 12h a la hora de 24h del backend', () => {
    expect((component as any).a24h('2:00 PM')).toBe('14:00');
    expect((component as any).a24h('12:00 AM')).toBe('00:00');
    expect((component as any).a24h('9:30 AM')).toBe('09:30');
  });

  it('calcula la hora de fin 30 minutos después', () => {
    expect((component as any).sumarMinutos('14:00', 30)).toBe('14:30');
    expect((component as any).sumarMinutos('23:45', 30)).toBe('00:15');
  });
});

// Los avisos del proyecto se emiten con el servicio de notificaciones propio
// y NUNCA con alert() nativo del navegador.
describe('Schedule — notificaciones del proyecto (sin alert nativo)', () => {
  let component: Schedule;
  let fixture: ComponentFixture<Schedule>;

  // Estado mutable que los dobles leen: así un solo módulo cubre los tests.
  let sesionActiva = false;
  let empleadosData: never[] = [];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    sesionActiva = false;
    empleadosData = [];

    await TestBed.configureTestingModule({
      imports: [Schedule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            obtenerUsuario: () => (sesionActiva ? { id: 7, email: 'cliente@test.com' } : null),
            estaLogueado: () => sesionActiva,
          },
        },
        {
          provide: CitaService,
          useValue: {
            obtenerCitas: () => of([]),
            crear: () => of({}),
            actualizar: () => of({}),
          },
        },
        {
          provide: EmpleadoService,
          useValue: { getEmpleados: () => of(empleadosData) },
        },
        {
          provide: Router,
          useValue: {
            getCurrentNavigation: () => null,
            navigate: () => Promise.resolve(true),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Schedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('emite avisos del proyecto y no usa window.alert', () => {
    const servicio = TestBed.inject(NotificacionesService);
    const aviso = vi.spyOn(servicio, 'aviso');
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.reservar();

    expect(aviso).toHaveBeenCalledWith('Debes iniciar sesión antes de reservar');
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('emite exito del proyecto al reservar y no usa window.alert', () => {
    const servicio = TestBed.inject(NotificacionesService);
    const exito = vi.spyOn(servicio, 'exito');
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Sesión activa y un tatuador cargado para pasar todas las validaciones.
    sesionActiva = true;
    empleadosData = [{ id: 1, name: 'Test', last_name: 'User', activo: true } as never];
    component.empleados = empleadosData as never;
    (component as any).usuarioId = 7;

    // Selección futura (enero del próximo año) para no depender del reloj.
    component.anioActual = new Date().getFullYear() + 1;
    component.mesActual = 0;
    component.fechaSeleccionada = 15;
    component.horaSeleccionada = '10:00 AM';
    component.tatuadorSeleccionado = 'Test User';
    component.empleadoSeleccionadoId = 1;

    component.reservar();

    expect(exito).toHaveBeenCalledWith('Cita reservada con éxito');
    expect(window.alert).not.toHaveBeenCalled();
  });
});
