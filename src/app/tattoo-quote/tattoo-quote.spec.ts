import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TattooQuote } from './tattoo-quote';

describe('TattooQuote', () => {
  let component: TattooQuote;
  let fixture: ComponentFixture<TattooQuote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TattooQuote]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TattooQuote);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
