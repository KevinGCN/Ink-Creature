import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { TattooAiQuoteComponent } from './tattoo-ia-quote';
import { GeminiService } from '../services/gemini';
import { NotificacionesService } from '../services/notificaciones';

describe('TattooIaQuote', () => {
  let component: TattooAiQuoteComponent;
  let fixture: ComponentFixture<TattooAiQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TattooAiQuoteComponent],
      providers: [
        { provide: GeminiService, useValue: { analyzeTattoo: async () => '{}' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TattooAiQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // El analisis de IA corre en el backend (la clave de Gemini nunca viaja al
  // navegador): cuando falla, el usuario debe recibir un aviso del proyecto
  // (toast), no un alert() nativo ni silencio.
  describe('avisos del proyecto en el analisis IA (sin alert nativo)', () => {
    let servicio: NotificacionesService;
    let errorDe: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      servicio = TestBed.inject(NotificacionesService);
      errorDe = vi.spyOn(servicio, 'error');
      vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => vi.restoreAllMocks());

    it('avisa con el proyecto cuando el backend responde 503 (falta la clave en el servidor)', async () => {
      TestBed.inject(GeminiService).analyzeTattoo = async () => {
        throw new HttpErrorResponse({ status: 503 });
      };
      component.description = 'un dragon en el brazo';
      await component.analyzeTattoo();
      expect(errorDe).toHaveBeenCalledWith('El servicio de IA no está disponible en este momento. Intenta más tarde.');
      expect(window.alert).not.toHaveBeenCalled();
      expect(component.analysis).toBeNull();
    });

    it('avisa con el proyecto cuando la sesion expiro (401)', async () => {
      TestBed.inject(GeminiService).analyzeTattoo = async () => {
        throw new HttpErrorResponse({ status: 401 });
      };
      component.description = 'una rosa en el hombro';
      await component.analyzeTattoo();
      expect(errorDe).toHaveBeenCalledWith('Tu sesión expiró. Inicia sesión nuevamente para cotizar.');
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('avisa con el proyecto ante un fallo generico', async () => {
      TestBed.inject(GeminiService).analyzeTattoo = async () => {
        throw new HttpErrorResponse({ status: 500 });
      };
      component.description = 'texto';
      await component.analyzeTattoo();
      expect(errorDe).toHaveBeenCalledWith('No se pudo analizar el tatuaje. Intenta nuevamente.');
      expect(window.alert).not.toHaveBeenCalled();
    });
  });
});
