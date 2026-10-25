/**
 * Contrato de `urlImagen()`: cada caso (ruta del backend, URL absoluta,
 * base64, asset local y vacío) se prueba por separado porque un cambio en el
 * orden de las comprobaciones rompería solo uno de ellos y es fácil que pase
 * desapercibido.
 */
import { describe, it, expect } from 'vitest';

import { urlImagen, ORIGEN_API } from './imagen-url';

// El caso crítico: las rutas relativas guardadas en la BD deben apuntar al
// backend, no al host donde se sirve el SPA.
describe('urlImagen', () => {
  // Ruta relativa del backend → absoluta contra el origen del API.
  it('resuelve la ruta del backend contra el origen del API', () => {
    expect(urlImagen('/api/imagenes/12')).toBe(`${ORIGEN_API}/api/imagenes/12`);
  });

  // Una URL ya absoluta (foto subida a un CDN o pegada a mano) no se debe
  // reescribir ni duplicar el origen.
  it('deja intactas las URLs absolutas', () => {
    expect(urlImagen('https://ejemplo.com/foto.jpg')).toBe('https://ejemplo.com/foto.jpg');
    expect(urlImagen('http://ejemplo.com/foto.jpg')).toBe('http://ejemplo.com/foto.jpg');
  });

  // `data:` es el formato de las fotos embebidas en base64: el navegador la
  // renderiza sola y anteponerle el origen la dejaría inservible.
  it('deja intactas las imágenes embebidas en base64', () => {
    expect(urlImagen('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA');
  });

  // Sin "/" inicial es un asset del SPA: debe seguir siendo relativo para que
  // lo sirva el mismo host que la app.
  it('deja intactas las rutas de los assets del frontend', () => {
    expect(urlImagen('image/DBZ.jpg')).toBe('image/DBZ.jpg');
  });

  // Los campos opcionales llegan vacíos desde la API; devolver "" (y no un
  // origen suelto) permite sustituirlos por el placeholder.
  it('devuelve vacío cuando no hay url', () => {
    expect(urlImagen()).toBe('');
    expect(urlImagen(null)).toBe('');
    expect(urlImagen('   ')).toBe('');
  });
});
