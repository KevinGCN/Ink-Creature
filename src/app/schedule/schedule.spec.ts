import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Schedule } from './schedule';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment';

const mockAuthService = {
  esAdmin: () => false,
  obtenerUsuario: () => null,
  estaLogueado: () => false
};

describe('Schedule', () => {
  let component: Schedule;
  let fixture: ComponentFixture<Schedule>;
  let httpMock: HttpTestingController;

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
