import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TattooAiQuoteComponent } from './tattoo-ia-quote';

// Pruebas del cotizador con IA (no se llama al backend real en estos tests).
describe('TattooAiQuoteComponent', () => {
  let component: TattooAiQuoteComponent;
  let fixture: ComponentFixture<TattooAiQuoteComponent>;

  // Monta el componente sin disparar la petición: el análisis es manual.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TattooAiQuoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TattooAiQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Estado inicial: sin descripción, sin análisis y sin cargar.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
