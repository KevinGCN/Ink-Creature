import { TestBed } from '@angular/core/testing';

import { TattooIa } from './tattoo-ia';

describe('TattooIa', () => {
  let service: TattooIa;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TattooIa);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
