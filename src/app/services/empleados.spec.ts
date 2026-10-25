import { TestBed } from '@angular/core/testing';

import { EmpleadoService } from './empleados';

// Smoke test: confirma que el servicio del catálogo de tatuadores se puede
// instanciar sin backend (solo se verifica el wiring, no las peticiones).
describe('Empleados', () => {
  let service: EmpleadoService;

  // Inyector limpio por test: evita arrastrar instancias del servicio.
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpleadoService);
  });

  // Confirma que el servicio se construye con el HttpClient del TestBed.
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
