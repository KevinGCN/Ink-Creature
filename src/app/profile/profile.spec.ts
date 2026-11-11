import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profile } from './profile';
import { ConfirmacionService } from '../services/confirmacion';
import { vi } from 'vitest';

// Suite de la pantalla de perfil (datos del usuario, foto y citas).
describe('Profile', () => {
  // Referencias al componente y su fixture, reusadas por cada test.
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  // Se compila el componente real; las dependencias quedan con las de por
  // defecto de TestBed, suficiente para comprobar que se instancia.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  // Caso base: el componente debe crearse sin errores de inyección.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// La confirmación de eliminar cita debe salir del modal propio del proyecto,
// no del confirm() nativo del navegador.
describe('Profile — confirmación del proyecto (sin confirm nativo)', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile]
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
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
    confirmacion.responder(false);
    await eliminando;
  });
});
