import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { GeminiService } from './gemini';
import { environment } from '../../environments/environment';

// Cubre el contrato del proxy: la SPA habla con nuestro backend y este, a su
// vez, con Google. Ninguna llave debe pasar por el navegador.
describe('GeminiService', () => {
  let service: GeminiService;
  let httpMock: HttpTestingController;

  // `provideHttpClientTesting` sustituye la red por un controlador que permite
  // inspeccionar las peticiones y responderlas a mano con `flush`.
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GeminiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Falla el test si alguna petición quedó sin responder: detecta llamadas de
  // más que el código hiciera por su cuenta.
  afterEach(() => {
    httpMock.verify();
  });

  // Si faltara el HttpClient, TestBed fallaría aquí y no en la petición.
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Regresión de seguridad: la ruta debe ser la del backend propio. Si alguien
  // volviera a llamar a Google desde el navegador, la llave viajaría al bundle.
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
