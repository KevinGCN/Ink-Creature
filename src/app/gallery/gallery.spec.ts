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

// Se monta el componente y se resuelven las dos peticiones que dispara ngOnInit
// (galería y empleados) para que no queden requests pendientes.
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

  // `verify()` falla si alguna petición quedó sin resolver o sin espía.
  afterEach(() => httpMock.verify());

  // El componente debe instanciarse correctamente.
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // `imagenes()` mezcla los assets locales con las imágenes de la BD.
  it('should expose the base images', () => {
    expect(component.imagenes()).toBeDefined();
    expect(Array.isArray(component.imagenes())).toBeTruthy();
    expect(component.imagenes().length).toBe(7); // 7 imágenes base
  });

  // El visor arranca cerrado (signal en null).
  it('should initialize with selectedImage as null', () => {
    expect(component.selectedImage()).toBeNull();
  });

  // Abrir el visor solo guarda la url recibida.
  it('should open image when openImage is called', () => {
    const testImage = 'assets/image/bendy.jpg';
    component.openImage(testImage);
    expect(component.selectedImage()).toBe(testImage);
  });

  // Cerrar el visor vuelve a dejarlo en null.
  it('should close image when closeImage is called', () => {
    component.openImage('assets/image/bendy.jpg');
    expect(component.selectedImage()).not.toBeNull();
    component.closeImage();
    expect(component.selectedImage()).toBeNull();
  });

  // Una url rota se sustituye por el placeholder inline (error de red del <img>).
  it('should fall back to the inline placeholder on image error', () => {
    const mockEvent = { target: { src: 'wrong-path.jpg' } } as unknown as Event;
    component.handleImageError(mockEvent);
    expect((mockEvent.target as HTMLImageElement).src).toBe(FOTO_PLACEHOLDER);
  });

  // La plantilla debe pintar el grid con las imágenes base.
  it('should have grid items in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const gridItems = compiled.querySelectorAll('.grid-item');
    expect(gridItems.length).toBeGreaterThan(0);
  });

  // El clic en una tarjeta debe delegar en openImage (visor ampliado).
  it('should call openImage when grid item is clicked', () => {
    const openImageSpy = vi.spyOn(component, 'openImage');

    const compiled = fixture.nativeElement as HTMLElement;
    const firstGridItem = compiled.querySelector('.grid-item') as HTMLElement;
    expect(firstGridItem).toBeTruthy();

    firstGridItem.click();
    expect(openImageSpy).toHaveBeenCalled();
  });

  // Sin selección no debe existir el nodo del visor (@if de la plantilla).
  it('should not show image viewer when no image is selected', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.image-viewer')).toBeNull();
  });

  // Con una imagen seleccionada el visor aparece y usa esa url en el <img>.
  it('should show image viewer when an image is selected', () => {
    component.selectedImage.set('assets/image/bendy.jpg');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const viewer = compiled.querySelector('.image-viewer');
    expect(viewer).toBeTruthy();

    const img = compiled.querySelector('.image-viewer img');
    expect(img?.getAttribute('src')).toBe('assets/image/bendy.jpg');
  });

  // El clic sobre el visor (fondo) lo cierra.
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
