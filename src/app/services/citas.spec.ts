import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CitaService } from './citas';
import { API_ROUTES } from '../core/api.routes';

describe('Citas', () => {
  let service: CitaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CitaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('lista las citas del usuario y traduce fecha/hora al formato visible', () => {
    let resultado: any[] = [];

    service.obtenerCitas(7).subscribe((citas) => (resultado = citas));

    const peticion = http.expectOne(
      (req) =>
        req.url === API_ROUTES.citas &&
        req.params.get('usuario_id') === '7',
    );
    peticion.flush([
      {
        id: 1,
        usuario_id: 7,
        empleado_id: 4,
        fecha: '2026-11-07T00:00:00.000Z',
        hora_inicio: '1970-01-01T14:00:00.000Z',
        hora_fin: '1970-01-01T14:30:00.000Z',
        estado: 'pendiente',
        notas: null,
        empleados: {
          id: 4,
          usuarios: { id: 12, nombre: 'Kevin', apellido: 'Cobo' },
        },
      },
    ]);

    expect(resultado.length).toBe(1);
    expect(resultado[0].fecha).toBe('07/11/2026');
    expect(resultado[0].hora).toBe('2:00 PM');
    expect(resultado[0].tatuador).toBe('Kevin Cobo');
    expect(resultado[0].empleadoId).toBe(4);
  });

  it('crea una cita con fecha ISO y horas de 24h', () => {
    service
      .crear({
        usuario_id: 7,
        empleado_id: 4,
        fecha: '2026-11-08',
        hora_inicio: '09:00',
        hora_fin: '09:30',
      })
      .subscribe();

    const peticion = http.expectOne(API_ROUTES.citas);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toMatchObject({
      usuario_id: 7,
      empleado_id: 4,
      fecha: '2026-11-08',
      hora_inicio: '09:00',
      hora_fin: '09:30',
    });

    peticion.flush({
      id: 2,
      usuario_id: 7,
      empleado_id: 4,
      fecha: '2026-11-08T00:00:00.000Z',
      hora_inicio: '1970-01-01T09:00:00.000Z',
      hora_fin: '1970-01-01T09:30:00.000Z',
      estado: 'pendiente',
      notas: null,
      empleados: null,
    });
  });
});
