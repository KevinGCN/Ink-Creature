import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Loggin } from './loggin';
import { vi } from 'vitest';

describe('Loggin', () => {
  let component: Loggin;
  let fixture: ComponentFixture<Loggin>;

  beforeEach(async () => {
    // Simulación de Google API
    (window as any).google = {
      accounts: {
        id: {
          initialize: jasmine.createSpy('initialize'),
          renderButton: jasmine.createSpy('renderButton')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [Loggin]
    }).compileComponents();

    fixture = TestBed.createComponent(Loggin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});