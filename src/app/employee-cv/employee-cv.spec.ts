import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { EmployeeCV } from './employee-cv';

// Mock de ActivatedRoute
const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: (id: string) => '1'
    }
  }
};

// Pruebas de la ficha pública del tatuador.
describe('EmployeeCV', () => {
  let component: EmployeeCV;
  let fixture: ComponentFixture<EmployeeCV>;

  // Se sustituye ActivatedRoute por un mock porque el id solo existe en la URL real.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeCV],
      providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeCV);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  // Con el id simulado ('1') el componente debe montarse sin errores.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
