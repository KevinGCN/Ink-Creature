import { TestBed } from '@angular/core/testing';

import { CitaService } from './citas';

// Smoke test: valida que el servicio de citas se resuelva por inyección de
// dependencias con el TestBed básico (los flujos HTTP se prueban aparte).
describe('Citas', () => {
  let service: CitaService;

  // Inyector limpio por test: evita arrastrar instancias del servicio.
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CitaService);
  });

  // Confirma que el servicio se construye con el HttpClient del TestBed.
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
