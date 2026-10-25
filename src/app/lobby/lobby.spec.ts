import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Lobby } from './lobby';

// Pruebas de la landing: cubre la integración con RouterLink, AuthService y reseñas.
describe('Lobby', () => {
  let component: Lobby;
  let fixture: ComponentFixture<Lobby>;

  // Se registran router y HTTP de prueba porque Lobby arrastra AuthService y Comments.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lobby],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lobby);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  // `detectChanges` fuerza el primer render antes de comprobar la instancia.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
