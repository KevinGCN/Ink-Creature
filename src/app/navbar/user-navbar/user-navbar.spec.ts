import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserNavbar } from './user-navbar';
import { Loggin } from '../../loggin/loggin';
import { AuthService } from '../../services/auth';

// Doble del AuthService: el componente (y el modal Loggin que importa) necesita
// el estado de sesión sin Firebase ni peticiones reales (ver loggin.spec.ts).
const mockAuthService = {
  isLoggedIn$: new BehaviorSubject<boolean>(false),
  usuario$: new BehaviorSubject<any>(null),
  estaLogueado: () => false,
  esAdmin: () => false,
  obtenerUsuario: () => ({}),
  login: () => Promise.resolve(false),
  registrar: () => Promise.resolve(false),
  loginConGoogle: () => Promise.resolve(false),
  logout: () => undefined,
};

describe('UserNavbar', () => {
  let component: UserNavbar;
  let fixture: ComponentFixture<UserNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserNavbar, Loggin],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserNavbar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
