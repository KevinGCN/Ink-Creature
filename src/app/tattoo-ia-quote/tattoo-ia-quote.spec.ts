import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TattooAiQuoteComponent } from './tattoo-ia-quote';

describe('TattooAiQuoteComponent', () => {
  let component: TattooAiQuoteComponent;
  let fixture: ComponentFixture<TattooAiQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TattooAiQuoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TattooAiQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
