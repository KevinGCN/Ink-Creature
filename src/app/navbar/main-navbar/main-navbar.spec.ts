import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MainNavbar } from './main-navbar';
import { AuthService } from '../../services/auth';

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

describe('MainNavbar', () => {
  let component: MainNavbar;
  let fixture: ComponentFixture<MainNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainNavbar],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainNavbar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
