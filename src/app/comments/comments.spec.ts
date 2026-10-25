import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Comments } from './comments';

// Pruebas del bloque de reseñas: solo comprueba que el componente se instancie.
describe('Comments', () => {
  let component: Comments;
  let fixture: ComponentFixture<Comments>;

  // Monta el componente tal cual se usa en el Lobby (solo depende de Auth y ResenaService).
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Comments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Comments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  // Caso base: la creación no lanza y el fixture queda disponible.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
