import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Profile } from './profile';
import { AuthService } from '../services/auth';
import { CitaService } from '../services/citas';
import { ConfirmacionService } from '../services/confirmacion';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        {
          provide: AuthService,
          useValue: {
            obtenerUsuario: () => ({
              id: 7,
              nombre: 'Emerson',
              apellido: 'Mosquera',
              email: 'emerson@test.com',
              telefono: '3001234567',
            }),
            actualizarPerfil: () => of({}),
            subirFotoPerfil: () => of({}),
          },
        },
        {
          provide: CitaService,
          useValue: {
            obtenerCitas: () => of([]),
            eliminar: () => of({}),
          },
        },
        {
          provide: Router,
          useValue: { navigate: () => Promise.resolve(true) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carga el formulario con los datos del usuario', () => {
    expect(component.formulario.nombre).toBe('Emerson');
    expect(component.formulario.apellido).toBe('Mosquera');
    expect(component.formulario.email).toBe('emerson@test.com');
    expect(component.formulario.telefono).toBe('3001234567');
  });
});

// La confirmación de eliminar cita debe salir del modal propio del proyecto,
// no del confirm() nativo del navegador.
describe('Profile — confirmación del proyecto (sin confirm nativo)', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        {
          provide: AuthService,
          useValue: {
            obtenerUsuario: () => ({ id: 7, nombre: 'Emerson', apellido: 'Mosquera', email: 'emerson@test.com' }),
            actualizarPerfil: () => of({}),
            subirFotoPerfil: () => of({}),
          },
        },
        {
          provide: CitaService,
          useValue: { obtenerCitas: () => of([]), eliminar: () => of({}) },
        },
        {
          provide: Router,
          useValue: { navigate: () => Promise.resolve(true) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('pregunta con el modal propio y no usa window.confirm', async () => {
    const confirmacion = TestBed.inject(ConfirmacionService);

    // Sin `await` todavía: la promesa se resuelve al responder en el modal.
    const eliminando = component.eliminar(3);
    await fixture.whenStable();

    expect(window.confirm).not.toHaveBeenCalled();
    expect(confirmacion.estado()?.mensaje).toBe('¿Eliminar esta cita?');

    confirmacion.responder(true);
    await eliminando;

    // Al aceptar se elimina la cita en el backend y se avisa con el proyecto.
    expect(component.mensajeExito).toBe('Cita eliminada.');
    expect(confirmacion.estado()).toBeNull();
  });
});
