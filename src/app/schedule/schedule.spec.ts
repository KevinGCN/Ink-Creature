import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Schedule } from './schedule';
import { AuthService } from '../services/auth';
import { CitaService } from '../services/citas';
import { EmpleadoService } from '../services/empleados';

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
