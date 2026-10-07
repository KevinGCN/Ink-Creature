import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TattooIaQuote } from './tattoo-ia-quote';

describe('TattooIaQuote', () => {
  let component: TattooIaQuote;
  let fixture: ComponentFixture<TattooIaQuote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TattooIaQuote]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TattooIaQuote);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
