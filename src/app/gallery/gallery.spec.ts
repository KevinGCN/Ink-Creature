// gallery.spec.ts 

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Gallery } from './gallery';
import { CommonModule } from '@angular/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Gallery', () => {
  let component: any;
  let fixture: ComponentFixture<Gallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gallery, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have an array of images', () => {
    expect(component.images).toBeDefined();
    expect(Array.isArray(component.images)).toBe(true);
    expect(component.images.length).toBe(6);
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
        classList: { add: vi.fn() }  
      }
    } as any;

    component.handleImageError(mockEvent);
    expect(mockEvent.target.src).toContain('placeholder.jpg');
  });

  it('should have grid items in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const gridItems = compiled.querySelectorAll('.grid-item');
    expect(gridItems.length).toBeGreaterThan(0);
  });

  it('should call openImage when grid item is clicked', () => {
    const openImageSpy = vi.spyOn(component, 'openImage');  

    const compiled = fixture.nativeElement as HTMLElement;
    const firstGridItem = compiled.querySelector('.grid-item');
    expect(firstGridItem).toBeTruthy();

    if (firstGridItem) {
      (firstGridItem as HTMLElement).click();
      expect(openImageSpy).toHaveBeenCalled();
    }
  });

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
    expect(img?.getAttribute('src')).toBe('assets/image/bendy.jpg');
  });

  it('should call closeImage when viewer is clicked', () => {
    component.selectedImage = 'assets/image/bendy.jpg';
    fixture.detectChanges();

    const closeImageSpy = vi.spyOn(component, 'closeImage');  // ✅ vi.spyOn

    const compiled = fixture.nativeElement as HTMLElement;
    const viewer = compiled.querySelector('.image-viewer');

    if (viewer) {
      (viewer as HTMLElement).click();
      expect(closeImageSpy).toHaveBeenCalled();
    }
  });
});