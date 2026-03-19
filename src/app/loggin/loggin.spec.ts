import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loggin } from './loggin';

describe('Loggin', () => {
  let component: Loggin;
  let fixture: ComponentFixture<Loggin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loggin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loggin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
