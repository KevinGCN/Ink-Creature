import { TestBed } from '@angular/core/testing';

import { CitaService } from './citas';

describe('Citas', () => {
  let service: CitaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CitaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
