import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Gallery } from './gallery';

describe('Gallery', () => {
  let component: Gallery;
  let fixture: ComponentFixture<Gallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gallery] 
    }).compileComponents();

    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open image', () => {
    component.openImage('/image/test.jpg');
    expect(component.selectedImage).toBe('/image/test.jpg');
  });

  it('should close image', () => {
    component.selectedImage = '/image/test.jpg';
    component.closeImage();
    expect(component.selectedImage).toBeNull();
  });

});