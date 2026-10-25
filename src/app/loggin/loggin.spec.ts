import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Loggin } from './loggin';

// Suite del modal de login/registro.
describe('Loggin', () => {
  // Referencias al componente y su fixture, reusadas por cada test.
  let component: Loggin;
  let fixture: ComponentFixture<Loggin>;

  // Se compila el componente real con las dependencias por defecto de TestBed.
  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [Loggin]
    }).compileComponents();

    fixture = TestBed.createComponent(Loggin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  // Caso base: el componente debe instanciarse sin errores de DI.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});