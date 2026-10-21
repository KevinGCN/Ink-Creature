import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { UsuarioService } from './usuarios';
import { environment } from '../../environments/environment';

const API = environment.apiUrl;

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe estar creado', () => {
    expect(service).toBeTruthy();
  });

  it('getUsuarios consulta GET /api/usuarios', () => {
    service.getUsuarios().subscribe();
    const req = httpMock.expectOne(`${API}/usuarios`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('crearUsuario consulta POST /api/usuarios', () => {
    service.crearUsuario({
      nombre: 'Ana',
      apellido: 'Pérez',
      email: 'ana@test.com',
      password: 'Clave12345',
    }).subscribe();
    const req = httpMock.expectOne(`${API}/usuarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('ana@test.com');
    req.flush({ id: 1 });
  });

  it('actualizarUsuario consulta PATCH /api/usuarios/:id', () => {
    service.actualizarUsuario(7, { nombre: 'Ana' }).subscribe();
    const req = httpMock.expectOne(`${API}/usuarios/7`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 7 });
  });

  it('cambiarRol consulta PATCH /api/usuarios/:id/rol con el rol en el body', () => {
    service.cambiarRol(7, 'empleado').subscribe();
    const req = httpMock.expectOne(`${API}/usuarios/7/rol`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ rol: 'empleado' });
    req.flush({ id: 7, rol: 'empleado' });
  });

  it('eliminarUsuario consulta DELETE /api/usuarios/:id', () => {
    service.eliminarUsuario(7).subscribe();
    const req = httpMock.expectOne(`${API}/usuarios/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
