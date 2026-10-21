// gallery.spec.ts — adaptado a la versión Angular 21 (signals + backend).

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Gallery } from './gallery';
import { FOTO_PLACEHOLDER } from '../utils/placeholder';
import { environment } from '../../environments/environment';

const API = environment.apiUrl;

describe('Gallery', () => {
  let component: Gallery;
  let fixture: ComponentFixture<Gallery>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gallery],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // ngOnInit dispara la carga de imágenes y de tatuadores.
    httpMock.expectOne(`${API}/galeria`).flush([]);
    httpMock.expectOne(`${API}/empleados`).flush([]);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the base images', () => {
    expect(component.imagenes()).toBeDefined();
    expect(Array.isArray(component.imagenes())).toBeTruthy();
    expect(component.imagenes().length).toBe(7); // 7 imágenes base
  });

  it('should initialize with selectedImage as null', () => {
    expect(component.selectedImage()).toBeNull();
  });

  it('should open image when openImage is called', () => {
    const testImage = 'assets/image/bendy.jpg';
    component.openImage(testImage);
    expect(component.selectedImage()).toBe(testImage);
  });

  it('should close image when closeImage is called', () => {
    component.openImage('assets/image/bendy.jpg');
    expect(component.selectedImage()).not.toBeNull();
    component.closeImage();
    expect(component.selectedImage()).toBeNull();
  });

  it('should fall back to the inline placeholder on image error', () => {
    const mockEvent = { target: { src: 'wrong-path.jpg' } } as unknown as Event;
    component.handleImageError(mockEvent);
    expect((mockEvent.target as HTMLImageElement).src).toBe(FOTO_PLACEHOLDER);
  });

  it('should have grid items in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const gridItems = compiled.querySelectorAll('.grid-item');
    expect(gridItems.length).toBeGreaterThan(0);
  });

  it('should call openImage when grid item is clicked', () => {
    const openImageSpy = vi.spyOn(component, 'openImage');

    const compiled = fixture.nativeElement as HTMLElement;
    const firstGridItem = compiled.querySelector('.grid-item') as HTMLElement;
    expect(firstGridItem).toBeTruthy();

    firstGridItem.click();
    expect(openImageSpy).toHaveBeenCalled();
  });

  it('should not show image viewer when no image is selected', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.image-viewer')).toBeNull();
  });

  it('should show image viewer when an image is selected', () => {
    component.selectedImage.set('assets/image/bendy.jpg');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const viewer = compiled.querySelector('.image-viewer');
    expect(viewer).toBeTruthy();

    const img = compiled.querySelector('.image-viewer img');
    expect(img?.getAttribute('src')).toBe('assets/image/bendy.jpg');
  });

  it('should call closeImage when viewer is clicked', () => {
    component.selectedImage.set('assets/image/DBZ.jpg');
    fixture.detectChanges();

    const closeImageSpy = vi.spyOn(component, 'closeImage');

    const compiled = fixture.nativeElement as HTMLElement;
    const viewer = compiled.querySelector('.image-viewer') as HTMLElement;
    expect(viewer).toBeTruthy();

    viewer.click();
    expect(closeImageSpy).toHaveBeenCalled();
  });
});
