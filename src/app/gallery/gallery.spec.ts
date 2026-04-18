// gallery.spec.ts 

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Gallery } from './gallery';
import { CommonModule } from '@angular/common';
import { describe, it, expect, beforeEach } from 'vitest';

declare const spyOn: any;

describe('Gallery', () => {
  let component: Gallery;
  let fixture: ComponentFixture<Gallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gallery, CommonModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have an array of images', () => {
    expect(component.imagenes).toBeDefined();
    expect(Array.isArray(component.imagenes)).toBeTruthy();
    expect(component.imagenes.length).toBe(6);
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
    
    component.closeImage();
    expect(component.selectedImage).toBeNull();
  });

  it('should handle image error gracefully', () => {
    const mockEvent = {
      target: {
        src: 'wrong-path.jpg',
        classList: {
          add: spyOn(component, 'add')
        }
      }
    } as any;
    
    component.handleImageError(mockEvent);
    expect(mockEvent.target.src).toContain('placeholder.jpg');
  });

  // buscar .grid-item en lugar de .card
  it('should have grid items in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const gridItems = compiled.querySelectorAll('.grid-item');
    expect(gridItems.length).toBeGreaterThan(0);
  });

  //  hacer click en grid-item
  it('should call openImage when grid item is clicked', () => {
    const openImageSpy = spyOn(component, 'openImage');
    
    const compiled = fixture.nativeElement as HTMLElement;
    const firstGridItem = compiled.querySelector('.grid-item');
    
    expect(firstGridItem).toBeTruthy(); // Verificar que existe
    
    if (firstGridItem) {
      (firstGridItem as HTMLElement).click();
      expect(openImageSpy).toHaveBeenCalled();
    }
  });

  // Pruebas del visor
  it('should not show image viewer when no image is selected', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const viewer = compiled.querySelector('.image-viewer');
    expect(viewer).toBeNull();
  });

  it('should show image viewer when an image is selected', () => {
    component.selectedImage = 'assets/image/bendy.jpg';
    fixture.detectChanges();
    
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
    
    if (viewer) {
      (viewer as HTMLElement).click();
      expect(closeImageSpy).toHaveBeenCalled();
    }
  });
});