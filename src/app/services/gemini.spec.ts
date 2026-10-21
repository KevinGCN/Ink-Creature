import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { GeminiService } from './gemini';
import { environment } from '../../environments/environment';

describe('GeminiService', () => {
  let service: GeminiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GeminiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('pide el analisis al backend, no a Google', async () => {
    const peticion = service.analyzeTattoo('un dragon de 15 cm en el antebrazo');

    const req = httpMock.expectOne(`${environment.apiUrl}/ia/analyze-tattoo`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      descripcion: 'un dragon de 15 cm en el antebrazo',
    });

    req.flush({ respuesta: '{"complejidad":"Media"}' });

    await expect(peticion).resolves.toBe('{"complejidad":"Media"}');
  });
});
