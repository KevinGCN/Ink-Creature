import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth';

// Smoke test: comprueba que el servicio se pueda inyectar con la configuración
// mínima de TestBed, sin levantar HTTP real.
describe('Auth', () => {
  let service: AuthService;

  // Se crea un módulo de pruebas nuevo por test para que no se filtren
  // peticiones ni estado de un caso al siguiente.
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  // Confirma que Angular puede construir el servicio (y sus dependencias) desde
  // el inyector; no valida comportamiento de sesión.
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
