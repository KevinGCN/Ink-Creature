import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Loggin } from './loggin';
import { AuthService } from '../services/auth';
import { NotificacionesService } from '../services/notificaciones';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Suite del modal de login/registro.
describe('Loggin', () => {
  // Referencias al componente y su fixture, reusadas por cada test.
  let component: Loggin;
  let fixture: ComponentFixture<Loggin>;

  // Se compila el componente real con las dependencias por defecto de TestBed.
  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [Loggin]
    }).compileComponents();

    fixture = TestBed.createComponent(Loggin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  // Caso base: el componente debe instanciarse sin errores de DI.
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Los avisos de inicio de sesión salen por el sistema propio del proyecto
  // (toasts), nunca con alert() nativo del navegador.
  describe('notificaciones del proyecto en el login (sin alert nativo)', () => {
    let auth: AuthService;
    let servicio: NotificacionesService;
    let errorDe: ReturnType<typeof vi.spyOn>;
    let exito: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      auth = TestBed.inject(AuthService);
      servicio = TestBed.inject(NotificacionesService);
      errorDe = vi.spyOn(servicio, 'error');
      exito = vi.spyOn(servicio, 'exito');
      vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => vi.restoreAllMocks());

    // Cuenta inexistente o contraseña equivocada: la API responde 401 y el
    // login avisa con un toast del proyecto.
    it('avisa con el proyecto cuando las credenciales no son válidas', async () => {
      vi.spyOn(auth, 'login').mockResolvedValue(false);
      component.correo = 'no-existe@test.com';
      component.password = 'incorrecta123';
      await component.iniciarSesion();
      expect(errorDe).toHaveBeenCalledWith('Correo o contraseña incorrectos. Por favor, verifica e intenta nuevamente.');
      expect(window.alert).not.toHaveBeenCalled();
    });

    // Cuenta correcta: bienvenida con toast del proyecto.
    it('anuncia el inicio de sesión con el proyecto y no usa window.alert', async () => {
      vi.spyOn(auth, 'login').mockResolvedValue(true);
      component.correo = 'cr7@gmail.com';
      component.password = '12345678';
      await component.iniciarSesion();
      expect(exito).toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });

    // Fallo de red u otro error del backend: también avisa el proyecto.
    it('avisa con el proyecto cuando el login falla por el backend', async () => {
      vi.spyOn(auth, 'login').mockRejectedValue(new Error('boom'));
      component.correo = 'cr7@gmail.com';
      component.password = '12345678';
      await component.iniciarSesion();
      expect(errorDe).toHaveBeenCalledWith('Error al iniciar sesión. Por favor, intenta nuevamente.');
      expect(window.alert).not.toHaveBeenCalled();
    });
  });
});
