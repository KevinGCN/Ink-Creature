/**
 * Ficha de tatuador (EmployeeCV) — carga el empleado desde el backend
 * (GET /api/empleados/:id) en vez de la lista local de TATUADORES_BASE.
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

  readonly empleado = signal<Empleado | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly placeholder = FOTO_PLACEHOLDER;

  private readonly route = inject(ActivatedRoute);
  private readonly empleadosService = inject(EmpleadoService);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.empleadosService.getEmpleado(id).subscribe({
      next: (empleado) => {
        this.empleado.set(empleado);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error cargando empleado:', err);
        this.error.set(
          err.status === 404
            ? 'Este tatuador no existe o ya no forma parte del equipo.'
            : 'No se pudo cargar el perfil del tatuador.'
        );
        this.cargando.set(false);
      }
    });
  }

  nombreCompleto(): string {
    const e = this.empleado();
    return e ? `${e.usuarios?.nombre ?? ''} ${e.usuarios?.apellido ?? ''}`.trim() : '';
  }

  foto(): string {
    return urlImagen(this.empleado()?.usuarios?.foto_perfil_url) || FOTO_PLACEHOLDER;
  }
}
