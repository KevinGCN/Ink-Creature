import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profile } from './profile';

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
