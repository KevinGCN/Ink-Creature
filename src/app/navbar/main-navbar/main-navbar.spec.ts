import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainNavbar } from './main-navbar';
import { RouterLink, ActivatedRoute } from '@angular/router';

// Pruebas del sidebar público de navegación.
describe('MainNavbar', () => {
  let component: MainNavbar;
  let fixture: ComponentFixture<MainNavbar>;

  // Se simula ActivatedRoute para satisfacer RouterLinkActive al compilar.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainNavbar, RouterLink],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map() } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainNavbar);
    component = fixture.componentInstance;
  });

  // Arranca colapsado (`collapsed = true`) y con un AuthService válido.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});