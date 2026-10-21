import { describe, it, expect } from 'vitest';

import { urlImagen, ORIGEN_API } from './imagen-url';

describe('urlImagen', () => {
  it('resuelve la ruta del backend contra el origen del API', () => {
    expect(urlImagen('/api/imagenes/12')).toBe(`${ORIGEN_API}/api/imagenes/12`);
  });

  it('deja intactas las URLs absolutas', () => {
    expect(urlImagen('https://ejemplo.com/foto.jpg')).toBe('https://ejemplo.com/foto.jpg');
    expect(urlImagen('http://ejemplo.com/foto.jpg')).toBe('http://ejemplo.com/foto.jpg');
  });

  it('deja intactas las imágenes embebidas en base64', () => {
    expect(urlImagen('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA');
  });

  it('deja intactas las rutas de los assets del frontend', () => {
    expect(urlImagen('image/DBZ.jpg')).toBe('image/DBZ.jpg');
  });

  it('devuelve vacío cuando no hay url', () => {
    expect(urlImagen()).toBe('');
    expect(urlImagen(null)).toBe('');
    expect(urlImagen('   ')).toBe('');
  });
});
