import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TattooAiQuoteComponent } from './tattoo-ia-quote';
import { GeminiService } from '../services/gemini';

describe('TattooIaQuote', () => {
  let component: TattooAiQuoteComponent;
  let fixture: ComponentFixture<TattooAiQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TattooAiQuoteComponent],
      providers: [
        { provide: GeminiService, useValue: { analyzeTattoo: async () => '{}' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TattooAiQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
