import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { Auth } from '@angular/fire/auth';
import { AuthService } from './auth';
import { API_ROUTES } from '../core/api.routes';

describe('Auth', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const perfilApi = {
    id: 7,
    nombre: 'Nuevo',
    apellido: 'Mosquera',
    email: 'nuevo@test.com',
    telefono: '3000000000',
    foto_perfil_url: null,
    rol: 'cliente' as const,
    activo: true,
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Auth, useValue: { onAuthStateChanged: () => () => undefined } },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('actualiza el perfil con PATCH y refresca localStorage', () => {
    localStorage.setItem('usuario', JSON.stringify({ id: 7, nombre: 'Viejo' }));
    let resultado: any;

    service
      .actualizarPerfil({ nombre: 'Nuevo', apellido: 'Mosquera' })
      .subscribe((usuario) => (resultado = usuario));

    const peticion = http.expectOne(`${API_ROUTES.usuarios}/7`);
    expect(peticion.request.method).toBe('PATCH');
    expect(peticion.request.body).toEqual({
      nombre: 'Nuevo',
      apellido: 'Mosquera',
    });
    peticion.flush(perfilApi);

    expect(resultado.nombre).toBe('Nuevo');
    expect(JSON.parse(localStorage.getItem('usuario') || '{}').nombre).toBe(
      'Nuevo',
    );
  });

  it('sube la foto en multipart y guarda la URL devuelta', () => {
    localStorage.setItem('usuario', JSON.stringify({ id: 7 }));
    const archivo = new File(['foto'], 'foto.png', { type: 'image/png' });

    service.subirFotoPerfil(archivo).subscribe();

    const peticion = http.expectOne(`${API_ROUTES.usuarios}/7/foto`);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body instanceof FormData).toBe(true);

    peticion.flush({ ...perfilApi, foto_perfil_url: '/imagenes/9' });

    expect(JSON.parse(localStorage.getItem('usuario') || '{}').foto_perfil_url)
      .toContain('/imagenes/9');
  });
});
