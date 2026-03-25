import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Loggin } from './loggin';

describe('Loggin', () => {
  let component: Loggin;
  let fixture: ComponentFixture<Loggin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loggin]
    }).compileComponents();

    fixture = TestBed.createComponent(Loggin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

it('should toggle visibility using abrir() and cerrar()', () => {

  expect(component.loginService.visible).toBe(false);

  component.abrir();
  expect(component.loginService.visible).toBe(true);

  component.cerrar();
  expect(component.loginService.visible).toBe(false);
});

  it('should render the login container when visible', () => {
    component.abrir();
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.login-container'));
    expect(container).toBeTruthy();
  });

  it('should not render the login container when not visible', () => {
    component.cerrar();
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.login-container'));
    expect(container).toBeFalsy(); 
  });
});