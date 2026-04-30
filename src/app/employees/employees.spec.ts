import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Employees } from './employees';
import { AuthService } from '../services/auth';
import { ActivatedRoute } from '@angular/router';

// Mocks
const mockAuthService = {
  obtenerUsuario: () => ({ charge: 'Tatuador' })
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: (id: string) => null
    }
  }
};

describe('Employees', () => {
  let component: Employees;
  let fixture: ComponentFixture<Employees>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Employees],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Employees);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
