import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { Profile } from './profile';
import { AuthService } from '../services/auth';
import { CitaService } from '../services/citas';

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
