import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeCV } from './employee-cv';

describe('EmployeeCV', () => {
  let component: EmployeeCV;
  let fixture: ComponentFixture<EmployeeCV>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeCV]
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
