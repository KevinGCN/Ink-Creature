/**
 * Tests del servicio y del modal de confirmación propios del proyecto.
 *
 * Regla cubierta (S2): las confirmaciones no usan `window.confirm` nativo; el
 * modal del proyecto resuelve la promesa del componente que preguntó.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ConfirmacionService } from '../services/confirmacion';
import { ConfirmacionModal } from './confirmacion';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ConfirmacionModal', () => {
  let fixture: ComponentFixture<ConfirmacionModal>;
  let servicio: ConfirmacionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmacionModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmacionModal);
    servicio = TestBed.inject(ConfirmacionService);
  });

  function ventana(): HTMLElement {
    return fixture.nativeElement.querySelector('.confirmacion-ventana');
  }

  it('no muestra ninguna ventana cuando no hay confirmación pendiente', () => {
    fixture.detectChanges();
    expect(ventana()).toBeNull();
  });

  it('muestra el mensaje pedido en una ventana de diálogo y resuelve true al aceptar', async () => {
    const promesa = servicio.confirmar({
      titulo: 'Eliminar imagen',
      mensaje: '¿Eliminar "Pieza X" de la galería?',
      textoConfirmar: 'Eliminar',
      peligro: true,
    });
    fixture.detectChanges();
    expect(ventana().getAttribute('role')).toBe('dialog');
    expect(ventana().textContent).toContain('¿Eliminar "Pieza X" de la galería?');
    const aceptar = ventana().querySelector('.confirmacion-aceptar') as HTMLButtonElement;
    expect(aceptar.textContent).toContain('Eliminar');
    expect(ventana().querySelector('.confirmacion-cancelar')).not.toBeNull();

    aceptar.click();
    fixture.detectChanges();
    await expect(promesa).resolves.toBe(true);
    expect(ventana()).toBeNull(); // se cierra tras responder
  });

  it('resuelve false cuando el usuario cancela', async () => {
    const promesa = servicio.confirmar({ mensaje: '¿Eliminar esta cita?' });
    fixture.detectChanges();
    (ventana().querySelector('.confirmacion-cancelar') as HTMLButtonElement).click();
    fixture.detectChanges();
    await expect(promesa).resolves.toBe(false);
  });
});
