import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Loggin } from './loggin';
import { AuthService } from '../services/auth';
import { NotificacionesService } from '../services/notificaciones';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Doble del AuthService: el componente necesita login/registrar/loginConGoogle,
// pero los tests no deben depender de Firebase ni de una petición real.
const mockAuthService = {
  login: vi.fn(),
  registrar: vi.fn(),
  loginConGoogle: vi.fn(),
};

describe('Loggin', () => {
  let component: Loggin;
  let fixture: ComponentFixture<Loggin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loggin],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Loggin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

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

    // Cuenta inexistente o contraseña equivocada: la API responde 401 y el
    // login avisa con un toast del proyecto.
    it('avisa con el proyecto cuando las credenciales no son válidas', async () => {
      vi.mocked(auth.login).mockResolvedValue(false);
      component.correo = 'no-existe@test.com';
      component.password = 'incorrecta123';
      await component.iniciarSesion();
      expect(errorDe).toHaveBeenCalledWith('Correo o contraseña incorrectos. Por favor, verifica e intenta nuevamente.');
      expect(window.alert).not.toHaveBeenCalled();
    });

    // Cuenta correcta: bienvenida con toast del proyecto.
    it('anuncia el inicio de sesión con el proyecto y no usa window.alert', async () => {
      vi.mocked(auth.login).mockResolvedValue(true);
      component.correo = 'cr7@gmail.com';
      component.password = '12345678';
      await component.iniciarSesion();
      expect(exito).toHaveBeenCalledWith('¡Bienvenido de nuevo! Iniciaste sesión correctamente.');
      expect(window.alert).not.toHaveBeenCalled();
    });

    // Fallo de red u otro error del backend: también avisa el proyecto.
    it('avisa con el proyecto cuando el login falla por el backend', async () => {
      vi.mocked(auth.login).mockRejectedValue(new Error('boom'));
      component.correo = 'cr7@gmail.com';
      component.password = '12345678';
      await component.iniciarSesion();
      expect(errorDe).toHaveBeenCalledWith('Error al iniciar sesión. Por favor, intenta nuevamente.');
      expect(window.alert).not.toHaveBeenCalled();
    });

    // Registro correcto: cuenta creada con toast del proyecto.
    it('anuncia el registro con el proyecto y no usa window.alert', async () => {
      vi.mocked(auth.registrar).mockResolvedValue(true);
      component.nombre = 'Test';
      component.correo = 'nuevo@test.com';
      component.password = '12345678';
      await component.registrarse();
      expect(exito).toHaveBeenCalledWith('¡Cuenta creada con éxito! Ya estás dentro.');
      expect(window.alert).not.toHaveBeenCalled();
    });

    // Correo ya registrado (409): aviso con toast del proyecto.
    it('avisa con el proyecto cuando el correo ya está registrado', async () => {
      const aviso = vi.spyOn(servicio, 'aviso');
      vi.mocked(auth.registrar).mockRejectedValue(Object.assign(new Error('conflicto'), { status: 409 }));
      component.nombre = 'Test';
      component.correo = 'existe@test.com';
      component.password = '12345678';
      await component.registrarse();
      expect(aviso).toHaveBeenCalledWith('Ya existe una cuenta con este correo. Inicia sesión.');
      expect(window.alert).not.toHaveBeenCalled();
    });

    // Inicio de sesión con Google: también notifica con el proyecto.
    it('anuncia el inicio de sesión con Google y no usa window.alert', async () => {
      vi.mocked(auth.loginConGoogle).mockResolvedValue(true);
      await component.loginConGoogle();
      expect(exito).toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });

    // Fallo del login con Google: el proyecto avisa con un toast de error.
    it('avisa con el proyecto cuando falla el login con Google', async () => {
      vi.mocked(auth.loginConGoogle).mockRejectedValue(new Error('popup cerrado'));
      await component.loginConGoogle();
      expect(errorDe).toHaveBeenCalledWith('No se pudo iniciar sesión con Google. Por favor, intenta nuevamente o usa correo y contraseña.');
      expect(window.alert).not.toHaveBeenCalled();
    });
  });
});
