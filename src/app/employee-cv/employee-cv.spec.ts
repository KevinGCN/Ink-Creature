import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { EmployeeCV } from './employee-cv';
import { AuthService } from '../services/auth';

// Mock de ActivatedRoute
const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: (id: string) => '1'
    }
  }
};

// Doble del AuthService: evita depender del `Auth` de Firebase ni de peticiones
// reales (mismo enfoque que loggin.spec.ts y employees.spec.ts).
const mockAuthService = {
  isLoggedIn$: new BehaviorSubject<boolean>(false),
  usuario$: new BehaviorSubject<any>(null),
  estaLogueado: () => false,
  esAdmin: () => false,
  obtenerUsuario: () => ({}),
  logout: () => undefined,
};

describe('EmployeeCV', () => {
  let component: EmployeeCV;
  let fixture: ComponentFixture<EmployeeCV>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeCV],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: mockAuthService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(EmployeeCV);
    component = fixture.componentInstance;
    await fixture.whenStable();
    // Resuelve la carga inicial del perfil (empleados + horarios).
    httpMock.match(() => true).forEach((req) => req.flush([]));
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
