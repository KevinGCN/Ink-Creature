/**
 * Tests del componente `Toasts`.
 *
 * Regla cubierta (S1/S2): los avisos del proyecto se renderizan en el DOM con
 * `role="alert"`, accesibles a lectores de pantalla, y el usuario puede cerrarlos.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Toasts } from './toasts';
import { NotificacionesService } from '../services/notificaciones';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Toasts', () => {
  let fixture: ComponentFixture<Toasts>;
  let servicio: NotificacionesService;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [Toasts],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(Toasts);
    servicio = TestBed.inject(NotificacionesService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function toasts(): HTMLElement[] {
    return [...fixture.nativeElement.querySelectorAll('.toast')];
  }

  it('no pinta nada cuando no hay notificaciones', () => {
    fixture.detectChanges();
    expect(toasts()).toHaveLength(0);
  });

  it('pinta cada notificación con su tipo y texto, y la declara como alerta', () => {
    servicio.error('No se pudo eliminar la imagen.');
    fixture.detectChanges();
    const renderizados = toasts();
    expect(renderizados).toHaveLength(1);
    expect(renderizados[0].getAttribute('role')).toBe('alert');
    expect(renderizados[0].textContent).toContain('No se pudo eliminar la imagen.');
    expect(renderizados[0].className).toContain('toast-error');
  });

  it('remueve del DOM la notificación cuando el usuario presiona cerrar', () => {
    servicio.exito('Cita reservada con éxito');
    fixture.detectChanges();
    expect(toasts()).toHaveLength(1);
    const boton = fixture.nativeElement.querySelector('.toast-cerrar') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();
    expect(servicio.items()).toHaveLength(0);
    expect(toasts()).toHaveLength(0);
  });

  it('remueve del DOM la notificación cuando expira su tiempo de vida', () => {
    servicio.exito('temporal');
    fixture.detectChanges();
    expect(toasts()).toHaveLength(1);
    vi.advanceTimersByTime(4200);
    fixture.detectChanges();
    expect(toasts()).toHaveLength(0);
  });
});
