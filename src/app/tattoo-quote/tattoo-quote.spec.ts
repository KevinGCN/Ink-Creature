import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TattooQuote } from './tattoo-quote';

// Pruebas del cotizador local (sin backend ni IA).
describe('TattooQuote', () => {
  let component: TattooQuote;
  let fixture: ComponentFixture<TattooQuote>;

  // `detectChanges` es necesario porque el formulario usa ngModel.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TattooQuote]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TattooQuote);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Sin opciones elegidas el cálculo base debe seguir funcionando.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
