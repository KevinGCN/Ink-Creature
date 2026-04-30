<<<<<<< HEAD
// gallery.spec.ts - Versión corregida
=======
// gallery.spec.ts 
>>>>>>> 6ff5d480ab359898f8b61316e91b947e931580cb

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Gallery } from './gallery';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Gallery', () => {
  let component: any;
=======
import { describe, it, expect, beforeEach } from 'vitest';

declare const spyOn: any;

describe('Gallery', () => {
  let component: Gallery;
>>>>>>> 6ff5d480ab359898f8b61316e91b947e931580cb
  let fixture: ComponentFixture<Gallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gallery, CommonModule]
<<<<<<< HEAD
    }).compileComponents();

=======
    })
    .compileComponents();
    
>>>>>>> 6ff5d480ab359898f8b61316e91b947e931580cb
    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

<<<<<<< HEAD
  it('should have an array of image', () => {
    expect(component.image).toBeDefined();
    expect(Array.isArray(component.image)).toBe(true);
    expect(component.image.length).toBe(6);
=======
  it('should have an array of images', () => {
    expect(component.imagenes).toBeDefined();
    expect(Array.isArray(component.imagenes)).toBeTruthy();
    expect(component.imagenes.length).toBe(6);
>>>>>>> 6ff5d480ab359898f8b61316e91b947e931580cb
  });

  it('should initialize with selectedImage as null', () => {
    expect(component.selectedImage).toBeNull();
  });

  it('should open image when openImage is called', () => {
    const testImage = 'assets/image/bendy.jpg';
    component.openImage(testImage);
    expect(component.selectedImage).toBe(testImage);
  });

  it('should close image when closeImage is called', () => {
    component.openImage('assets/image/bendy.jpg');
    expect(component.selectedImage).not.toBeNull();
<<<<<<< HEAD
=======
    
>>>>>>> 6ff5d480ab359898f8b61316e91b947e931580cb
    component.closeImage();
    expect(component.selectedImage).toBeNull();
  });

  it('should handle image error gracefully', () => {
    const mockEvent = {
      target: {
        src: 'wrong-path.jpg',
<<<<<<< HEAD
        classList: { add: vi.fn() }  
      }
    } as any;

=======
        classList: {
          add: spyOn(component, 'add')
        }
      }
    } as any;
    
>>>>>>> 6ff5d480ab359898f8b61316e91b947e931580cb
    component.handleImageError(mockEvent);
    expect(mockEvent.target.src).toContain('placeholder.jpg');
  });

<<<<<<< HEAD
=======
  // buscar .grid-item en lugar de .card
>>>>>>> 6ff5d480ab359898f8b61316e91b947e931580cb
  it('should have grid items in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const gridItems = compiled.querySelectorAll('.grid-item');
    expect(gridItems.length).toBeGreaterThan(0);
  });

<<<<<<< HEAD
  it('should call openImage when grid item is clicked', () => {
    const openImageSpy = vi.spyOn(component, 'openImage');  

    const compiled = fixture.nativeElement as HTMLElement;
    const firstGridItem = compiled.querySelector('.grid-item');
    expect(firstGridItem).toBeTruthy();

=======
  //  hacer click en grid-item
  it('should call openImage when grid item is clicked', () => {
    const openImageSpy = spyOn(component, 'openImage');
    
    const compiled = fixture.nativeElement as HTMLElement;
    const firstGridItem = compiled.querySelector('.grid-item');
    
    expect(firstGridItem).toBeTruthy(); // Verificar que existe
    
>>>>>>> 6ff5d480ab359898f8b61316e91b947e931580cb
    if (firstGridItem) {
      (firstGridItem as HTMLElement).click();
      expect(openImageSpy).toHaveBeenCalled();
    }
  });

<<<<<<< HEAD
=======
  // Pruebas del visor
>>>>>>> 6ff5d480ab359898f8b61316e91b947e931580cb
  it('should not show image viewer when no image is selected', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const viewer = compiled.querySelector('.image-viewer');
    expect(viewer).toBeNull();
  });

  it('should show image viewer when an image is selected', () => {
    component.selectedImage = 'assets/image/bendy.jpg';
    fixture.detectChanges();
<<<<<<< HEAD

    const compiled = fixture.nativeElement as HTMLElement;
    const viewer = compiled.querySelector('.image-viewer');
    expect(viewer).toBeTruthy();

    const img = compiled.querySelector('.image-viewer img');
    expect(img?.getAttribute('src')).toBe('assets/image/bendy.jpg');
  });

  it('should call closeImage when viewer is clicked', () => {
    component.selectedImage = 'assets/image/bendy.jpg';
    fixture.detectChanges();

    const closeImageSpy = vi.spyOn(component, 'closeImage');  // ✅ vi.spyOn

    const compiled = fixture.nativeElement as HTMLElement;
    const viewer = compiled.querySelector('.image-viewer');

=======
    
    const compiled = fixture.nativeElement as HTMLElement;
    const viewer = compiled.querySelector('.image-viewer');
    expect(viewer).toBeTruthy();
    
    const img = compiled.querySelector('.image-viewer img');
    expect(img?.getAttribute('src')).toBe('assets/image/DBZ.jpg');
  });

  it('should call closeImage when viewer is clicked', () => {
    component.selectedImage = 'assets/image/DBZ.jpg';
    fixture.detectChanges();
    
    const closeImageSpy = spyOn(component, 'closeImage');
    
    const compiled = fixture.nativeElement as HTMLElement;
    const viewer = compiled.querySelector('.image-viewer');
    
>>>>>>> 6ff5d480ab359898f8b61316e91b947e931580cb
    if (viewer) {
      (viewer as HTMLElement).click();
      expect(closeImageSpy).toHaveBeenCalled();
    }
  });
});