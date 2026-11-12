import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { Lobby } from './lobby';
import { AuthService } from '../services/auth';

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

describe('Lobby', () => {
  let component: Lobby;
  let fixture: ComponentFixture<Lobby>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lobby],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lobby);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // El botón flotante del "Ayudante" (widget de chat Tawk) se eliminó por
  // inutilizable: este test impide que reaparezca por accidente.
  it('no muestra el botón flotante del Ayudante', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.chat-float')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Ayudante');
  });
});
