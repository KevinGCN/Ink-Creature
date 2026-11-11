// gallery.spec.ts — adaptado a la versión de señales + backend de esta rama
// (misma estructura que la referencia de main: providers reales + HTTP de pruebas).
//
// Incluye:
//  - La suite original de esta rama (subida, borrado, toasts, modal propio).
//  - Los tests del rediseño "explorador con detalle" (artboard main
//    design/ink-galeria/03): auto-selección, panel de detalle, chips de
//    estilo, búsqueda y ficha del tatuador.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Gallery } from './gallery';
import { AuthService } from '../services/auth';
import { ConfirmacionService } from '../services/confirmacion';
import { NotificacionesService } from '../services/notificaciones';
import { environment } from '../../environments/environment';

const API = environment.apiUrl;

// Doble del AuthService: Gallery solo lee usuario$ y obtenerUsuario().
const mockAuthService = {
  usuario$: of({ id: 7, rol: 'admin' }),
  obtenerUsuario: () => ({ id: 7, rol: 'admin' }),
};

// Dos filas del backend para poblar la grilla.
const filas = [
  { id: 1, subido_por: 1, empleado_id: null, imagen_url: '/imagenes/1', titulo: 'Serpiente lineal', estilo: 'Fine line', fecha_subida: '' },
  { id: 2, subido_por: 1, empleado_id: null, imagen_url: '/imagenes/2', titulo: 'Luna reversa', estilo: 'Blackwork', fecha_subida: '' }
];

// Pieza atribuida a un tatuador con su ficha completa (lo que el backend
// devuelve con `empleados: { include: { usuarios: usuarioSeguro } }`).
const filaConTatuador = {
  id: 3,
  subido_por: 2,
  empleado_id: 5,
  imagen_url: '/imagenes/3',
  titulo: 'Dragón neotrad',
  estilo: 'Neotradicional',
  fecha_subida: '',
  empleados: {
    id: 5,
    especialidad: 'Neotradicional / Color',
    biografia: 'Llevo 8 años tatuando dragones y criaturas mitológicas.',
    activo: true,
    usuarios: { id: 9, nombre: 'Ana', apellido: 'Gómez', foto_perfil_url: '/imagenes/50' }
  }
};

// Se monta el componente y se resuelven las dos peticiones que dispara ngOnInit
// (galería y tatuadores) para que no queden requests pendientes.
describe('Gallery', () => {
  let component: Gallery;
  let fixture: ComponentFixture<Gallery>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Gallery],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // ngOnInit dispara la carga de imágenes y de tatuadores.
    httpMock.expectOne(`${API}/galeria`).flush(filas);
    httpMock.match((req) => req.method === 'GET').forEach((req) => req.flush([]));
    fixture.detectChanges();
  });

  // `verify()` falla si alguna petición quedó sin resolver.
  afterEach(() => httpMock.verify());

  // El componente debe instanciarse correctamente.
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // `imagenes()` expone las imágenes traídas del backend.
  it('should have an array of images', () => {
    expect(component.imagenes).toBeDefined();
    expect(Array.isArray(component.imagenes())).toBeTruthy();
    expect(component.imagenes().length).toBe(2);
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

  // Una url rota se sustituye por la imagen del tatuador por defecto.
  it('should handle image error gracefully', () => {
    const mockEvent = {
      target: { src: 'wrong-path.jpg' },
    } as unknown as Event;

    component.handleImageError(mockEvent);
    expect((mockEvent.target as HTMLImageElement).src).toContain('tatuador.png');
  });

  // La plantilla debe pintar el grid con las imágenes del backend.
  it('should have grid items in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const gridItems = compiled.querySelectorAll('.grid-item');
    expect(gridItems.length).toBeGreaterThan(0);
  });

  // El clic en una tarjeta selecciona esa pieza en el panel de detalle
  // (rediseño: la tarjeta ya no abre el visor; el panel sí puede ampliar).
  it('should select the piece when grid item is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const firstGridItem = compiled.querySelector('.grid-item');
    expect(firstGridItem).toBeTruthy();

    (firstGridItem as HTMLElement).click();
    expect(component.seleccionada()?.titulo).toBe('Serpiente lineal');
    // La tarjeta ya no abre el visor directamente.
    expect(component.selectedImage()).toBeNull();
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

/**
 * Explorador con detalle (artboard design/ink-galeria/03-explorador-detalle):
 * grilla + panel de detalle fijo, filtros por estilo, búsqueda y ficha del
 * tatuador.
 */
describe('Gallery — explorador con detalle', () => {
  let component: Gallery;
  let fixture: ComponentFixture<Gallery>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Gallery],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne(`${API}/galeria`).flush(filas);
    httpMock.match((req) => req.method === 'GET').forEach((req) => req.flush([]));
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  // Al cargar, la primera pieza queda seleccionada en el panel de detalle.
  it('should auto-select the first piece after loading', () => {
    expect(component.seleccionada()?.titulo).toBe('Serpiente lineal');
  });

  // El panel de detalle muestra título y estilo de la pieza seleccionada.
  it('should show the detail panel with the selected piece title and author', () => {
    component.seleccionada.set(filas[0] as never);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const detalle = compiled.querySelector('.detalle');
    expect(detalle?.textContent).toContain('Serpiente lineal');
    expect(detalle?.textContent).toContain('Fine line');
  });

  // El chip de estilo filtra la grilla y el contador refleja el recorte.
  it('should filter the grid when a estilo chip is pressed', () => {
    component.estiloFiltro.set('Blackwork');
    fixture.detectChanges();

    expect(component.filtradas().map((i) => i.titulo)).toEqual(['Luna reversa']);
  });

  // La búsqueda cubre título y autor.
  it('should filter by search text on title', () => {
    component.busqueda.set('serpiente');
    expect(component.filtradas().map((i) => i.titulo)).toEqual(['Serpiente lineal']);
  });

  // El visor ampliado se abre desde el panel de detalle, no desde la grilla.
  it('should open the enlarged viewer from the detail panel', () => {
    component.seleccionada.set(filas[0] as never);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('.detalle-imagen') as HTMLElement).click();
    expect(component.selectedImage()).not.toBeNull();
  });

  // El panel de detalle muestra la ficha del tatuador: foto, nombre,
  // especialidad, biografía y acceso a su CV. La pieza va en la forma
  // mapeada de la UI (`empleadoId`), conservando la ficha `empleados`
  // tal como la manda el backend.
  it('should show the worker profile in the detail panel when the piece has a tatuador', () => {
    component.seleccionada.set({
      id: 3,
      src: `${API}/imagenes/3`,
      alt: 'Dragón neotrad',
      titulo: 'Dragón neotrad',
      estilo: 'Neotradicional',
      descripcion: null,
      empleadoId: 5,
      empleados: filaConTatuador.empleados
    } as never);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const ficha = compiled.querySelector('.detalle-tatuador');
    expect(ficha).toBeTruthy();
    expect(ficha?.textContent).toContain('Ana Gómez');
    expect(ficha?.textContent).toContain('Neotradicional / Color');
    expect(ficha?.textContent).toContain('Llevo 8 años tatuando dragones');

    // La foto del trabajador se resuelve contra el backend
    const foto = ficha?.querySelector('img')?.getAttribute('src');
    expect(foto).toBe(`${API}/imagenes/50`);

    // El enlace al CV del tatuador sigue presente
    expect(ficha?.querySelector('.detalle-autor')).toBeTruthy();
  });

  // Sin tatuador vinculado no aparece la ficha (solo el autor plano):
  // degrada con elegancia cuando el backend no manda la relación.
  it('should not show the worker profile when the piece has no tatuador', () => {
    component.seleccionada.set(filas[0] as never);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.detalle-tatuador')).toBeNull();
  });

  // El CTA del panel lleva a la agenda.
  it('should navigate to /schedule when pedir cita is clicked', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.pedirCita();
    expect(navigateSpy).toHaveBeenCalledWith(['/schedule']);
  });
});

// Los avisos y confirmaciones deben salir del propio proyecto (toasts y modal),
// nunca de alert()/confirm() nativos del navegador.
describe('Gallery — notificaciones del proyecto (sin alert nativo)', () => {
  let component: Gallery;
  let fixture: ComponentFixture<Gallery>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Gallery],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne(`${API}/galeria`).flush([]);
    httpMock.match((req) => req.method === 'GET').forEach((req) => req.flush([]));
    fixture.detectChanges();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => httpMock.verify());

  // Un archivo mayor a 5 MB se rechaza con un aviso del proyecto.
  it('avisa con el proyecto cuando la imagen supera 5 MB y no usa window.alert', () => {
    const servicio = TestBed.inject(NotificacionesService);
    const aviso = vi.spyOn(servicio, 'aviso');

    const archivoGrande = new File([new ArrayBuffer(6 * 1024 * 1024)], 'grande.png', { type: 'image/png' });
    const input = { files: [archivoGrande], value: 'grande.png' } as unknown as HTMLInputElement;

    component.seleccionarArchivo({ target: input } as unknown as Event);

    expect(aviso).toHaveBeenCalledWith('La imagen supera 5 MB.');
    expect(component.mostrarModalSubida()).toBe(false);
    expect(window.alert).not.toHaveBeenCalled();
  });

  // El error de subida se informa con un toast del proyecto.
  it('avisa del error de subida con el proyecto y no usa window.alert', async () => {
    const servicio = TestBed.inject(NotificacionesService);
    const errorDe = vi.spyOn(servicio, 'error');

    component.archivoTemporal.set(new File(['datos'], 'pieza.png', { type: 'image/png' }));
    component.nombreImagenTemp.set('pieza');
    component.confirmarSubida();
    await fixture.whenStable();

    httpMock
      .expectOne((req) => req.method === 'POST' && req.url === `${API}/galeria/upload`)
      .flush({ message: 'x' }, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(errorDe).toHaveBeenCalledWith('No se pudo subir la imagen. Revisa tu sesión e intenta de nuevo.');
    expect(window.alert).not.toHaveBeenCalled();
  });

  // La eliminación pregunta con el modal propio del proyecto y, si el backend
  // falls, avisa con un toast; nunca con confirm()/alert() nativos.
  it('confirma la eliminación con el modal propio y avisa el error sin window.confirm ni window.alert', async () => {
    const servicio = TestBed.inject(NotificacionesService);
    const confirmacion = TestBed.inject(ConfirmacionService);
    const errorDe = vi.spyOn(servicio, 'error');

    component.imagenes.set([
      { id: 7, src: `${API}/imagenes/7`, alt: 'Pieza', empleadoId: 0 },
    ] as never);

    // Sin `await` todavía: la promesa se resuelve al responder en el modal.
    const borrando = component.eliminarImagen(
      { id: 7, src: `${API}/imagenes/7`, alt: 'Pieza', empleadoId: 0 } as never,
      { stopPropagation: () => {} } as unknown as Event,
    );
    await fixture.whenStable();

    expect(window.confirm).not.toHaveBeenCalled();
    expect(confirmacion.estado()).not.toBeNull();

    confirmacion.responder(true);
    await borrando;

    httpMock
      .expectOne(`${API}/galeria/7`)
      .flush({ message: 'x' }, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(errorDe).toHaveBeenCalled();
    expect(window.confirm).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  // Camino feliz previo conservado: al aceptar, la pieza sale de la grilla.
  it('elimina la pieza de la grilla tras aceptar en el modal propio', async () => {
    const confirmacion = TestBed.inject(ConfirmacionService);

    component.imagenes.set([
      { id: 7, src: `${API}/imagenes/7`, alt: 'Pieza', empleadoId: 0 },
      { id: 8, src: `${API}/imagenes/8`, alt: 'Otra', empleadoId: 0 },
    ] as never);

    const borrando = component.eliminarImagen(
      { id: 7, src: `${API}/imagenes/7`, alt: 'Pieza', empleadoId: 0 } as never,
      { stopPropagation: () => {} } as unknown as Event,
    );
    await fixture.whenStable();

    confirmacion.responder(true);
    await borrando;

    httpMock.expectOne(`${API}/galeria/7`).flush(null);
    await fixture.whenStable();

    expect(component.imagenes().map((i) => i.id)).toEqual([8]);
    expect(confirmacion.estado()).toBeNull();
  });
});
