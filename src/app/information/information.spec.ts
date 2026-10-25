import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Information } from './information';

// Pruebas de la página informativa (contenido estático).
describe('Information', () => {
  let component: Information;
  let fixture: ComponentFixture<Information>;

  // Compila el componente aislado, sin providers: no consume servicios.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Information]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Information);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  // El componente no hace peticiones, así que basta con que se cree.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
