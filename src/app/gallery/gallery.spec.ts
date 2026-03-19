import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD

=======
>>>>>>> master
import { Gallery } from './gallery';

describe('Gallery', () => {
  let component: Gallery;
  let fixture: ComponentFixture<Gallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
<<<<<<< HEAD
      imports: [Gallery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    await fixture.whenStable();
=======
      imports: [Gallery] 
    }).compileComponents();

    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
>>>>>>> master
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
<<<<<<< HEAD
});
=======

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
>>>>>>> master
