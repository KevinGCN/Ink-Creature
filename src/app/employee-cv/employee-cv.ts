/**
 * Ficha de tatuador (EmployeeCV) — carga el empleado desde el backend
 * (GET /api/empleados/:id) en vez de la lista local de TATUADORES_BASE.
 *
 * Ruta pública `/employeeCV/:id`: se llega desde el catálogo de tatuadores,
 * por eso aquí no se exige sesión para ver el perfil.
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Empleado, EmpleadoService } from '../services/empleados';
import { FOTO_PLACEHOLDER } from '../utils/placeholder';
import { urlImagen } from '../utils/imagen-url';

@Component({
  selector: 'app-employee-cv',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './employee-cv.html',
  styleUrl: './employee-cv.css',
})
export class EmployeeCV implements OnInit {

  /** Datos del tatuador; `null` mientras no llega la respuesta. */
  readonly empleado = signal<Empleado | null>(null);
  /** Controla el spinner/skeleton del template durante la petición. */
  readonly cargando = signal(true);
  /** Mensaje de fallo legible para el visitante (nunca el error crudo). */
  readonly error = signal('');
  /** Imagen de reserva cuando el tatuador no tiene foto de perfil. */
  readonly placeholder = FOTO_PLACEHOLDER;

  /** `ActivatedRoute` se usa solo para leer el `:id` de la URL. */
  private readonly route = inject(ActivatedRoute);
  private readonly empleadosService = inject(EmpleadoService);

  ngOnInit(): void {
    // El id llega como texto en la ruta; se convierte para pedirlo al backend.
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.empleadosService.getEmpleado(id).subscribe({
      next: (empleado) => {
        this.empleado.set(empleado);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        // Se registra el error técnico pero al usuario se le da un texto claro.
        console.error('Error cargando empleado:', err);
        this.error.set(
          // El 404 merece su propio mensaje: el tatuador pudo ser dado de baja.
          err.status === 404
            ? 'Este tatuador no existe o ya no forma parte del equipo.'
            : 'No se pudo cargar el perfil del tatuador.'
        );
        this.cargando.set(false);
      }
    });
  }

  /**
   * Une nombre y apellido del usuario asociado; devuelve vacío si aún no hay
   * datos para que el template no pinte "undefined undefined".
   */
  nombreCompleto(): string {
    const e = this.empleado();
    return e ? `${e.usuarios?.nombre ?? ''} ${e.usuarios?.apellido ?? ''}`.trim() : '';
  }

  /**
   * Resuelve la URL de la foto con `urlImagen()` porque el backend guarda la
   * ruta relativa `/api/imagenes/<id>`; sin eso la imagen no carga.
   */
  foto(): string {
    return urlImagen(this.empleado()?.usuarios?.foto_perfil_url) || FOTO_PLACEHOLDER;
  }
}
