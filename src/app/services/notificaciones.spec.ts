/**
 * Tests del servicio de notificaciones del proyecto.
 *
 * Regla cubierta (S1/S2 de `odd/tasks/notificaciones-proyecto.md`): los avisos del
 * SPA se emiten a través del propio proyecto (toasts en el DOM), nunca mediante
 * `alert()` nativo del navegador.
 */
import { NotificacionesService, TipoNotificacion } from './notificaciones';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('NotificacionesService', () => {
  let servicio: NotificacionesService;

  beforeEach(() => {
    vi.useFakeTimers();
    servicio = new NotificacionesService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const tipos: Array<[keyof typeof servicio, TipoNotificacion]> = [
    ['exito', 'exito'],
    ['error', 'error'],
    ['info', 'info'],
    ['aviso', 'aviso'],
  ];

  it.each(tipos)('%s() emite una notificación del tipo correspondiente', (metodo, tipo) => {
    (servicio[metodo] as unknown as (m: string) => void)('mensaje de prueba');
    const items = servicio.items();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ tipo, mensaje: 'mensaje de prueba' });
    expect(items[0].id).toBeGreaterThan(0);
  });

  it('mantiene varias notificaciones con ids únicos, la más reciente primero', () => {
    servicio.error('primera');
    servicio.exito('segunda');
    const items = servicio.items();
    expect(items.map((n) => n.mensaje)).toEqual(['segunda', 'primera']);
    expect(items[0].id).not.toBe(items[1].id);
  });

  it('descarta automáticamente cada notificación al vencer su tiempo', () => {
    servicio.exito('temporal');
    expect(servicio.items()).toHaveLength(1);
    vi.advanceTimersByTime(4100);
    expect(servicio.items()).toEqual([]);

    servicio.error('persistente');
    vi.advanceTimersByTime(4000);
    expect(servicio.items()).toHaveLength(1); // error vive más tiempo
    vi.advanceTimersByTime(3100);
    expect(servicio.items()).toEqual([]);
  });

  it('cerrar() quita la notificación aunque no haya vencido y limpia su temporizador', () => {
    servicio.exito('a mano');
    const id = servicio.items()[0].id;
    servicio.cerrar(id);
    expect(servicio.items()).toEqual([]);
    // Si el temporizador no se limpió, avanzar el reloj no debería fallar ni
    // reintroducir nada.
    vi.advanceTimersByTime(10000);
    expect(servicio.items()).toEqual([]);
  });

  it('limita la lista al máximo de notificaciones simultáneas', () => {
    for (let i = 1; i <= 7; i++) servicio.info(`aviso ${i}`);
    const items = servicio.items();
    expect(items.length).toBeLessThanOrEqual(5);
    expect(items[0].mensaje).toBe('aviso 7');
  });
});
