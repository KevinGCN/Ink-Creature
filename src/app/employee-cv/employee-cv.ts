import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EmpleadoService } from '../services/empleados';
import { Empleado } from '../models/empleado';

@Component({
  selector: 'app-employee-cv',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './employee-cv.html',
  styleUrl: './employee-cv.css',
})
export class EmployeeCV implements OnInit {

  empleado: Empleado | null = null;

  constructor(
    private route: ActivatedRoute,
    private empleadoService: EmpleadoService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // El id de la URL es `empleados.id`, el mismo que usa la galería.
    this.empleadoService.getEmpleado(id).subscribe({
      next: (empleado) => (this.empleado = empleado ?? null),
      error: (err) => console.error('No se pudo cargar el perfil:', err),
    });
  }

  usarFotoPorDefecto(event: Event) {
    (event.target as HTMLImageElement).src = 'image/tatuador.png';
  }
}
