import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TattooAiGenerator } from './tattoo-ai-generator';

describe('TattooAiGenerator', () => {
  let component: TattooAiGenerator;
  let fixture: ComponentFixture<TattooAiGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TattooAiGenerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TattooAiGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
