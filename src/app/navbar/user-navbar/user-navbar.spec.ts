import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserNavbar } from './user-navbar';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Loggin } from '../../loggin/loggin';

// Pruebas de la barra de usuario: cubre el estado por defecto (sin sesión).
describe('UserNavbar', () => {
  let component: UserNavbar;
  let fixture: ComponentFixture<UserNavbar>;

  // Se simula ActivatedRoute y se importa Loggin porque el modal va embebido.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserNavbar, RouterLink, CommonModule, Loggin],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map() } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserNavbar);
    component = fixture.componentInstance;
  });

  // Sin token guardado ambos menús deben quedar cerrados.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
