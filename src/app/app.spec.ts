import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { expect, describe, it, beforeEach } from 'vitest';
import { App } from './app';
import { AuthService } from './services/auth';
import { TawkService } from './services/tawk';

// Doble del AuthService: evita depender del `Auth` de Firebase ni de peticiones
// reales (mismo enfoque que loggin.spec.ts y employees.spec.ts).
export const mockAuthService = {
  isLoggedIn$: new BehaviorSubject<boolean>(false),
  usuario$: new BehaviorSubject<any>(null),
  estaLogueado: () => false,
  esAdmin: () => false,
  obtenerUsuario: () => ({}),
  logout: () => undefined,
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        // El widget de Tawk.to no se carga en tests: `loadChat` asume que hay
        // etiquetas <script> en el DOM.
        { provide: TawkService, useValue: { loadChat: () => undefined } },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // El título ya no se pinta en el shell raíz: App monta las barras de
  // navegación y el router-outlet.
  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-user-navbar')).toBeTruthy();
    expect(compiled.querySelector('app-main-navbar')).toBeTruthy();
  });
});