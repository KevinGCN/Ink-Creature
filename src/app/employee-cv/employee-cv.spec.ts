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

describe('EmployeeCV', () => {
  let component: EmployeeCV;
  let fixture: ComponentFixture<EmployeeCV>;

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
