import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { cargarListaTatuadores, Tatuador } from '../employees/employees';

@Component({
  selector: 'app-employee-cv',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './employee-cv.html',
  styleUrl: './employee-cv.css',
})
export class EmployeeCV implements OnInit {

  empleado: Tatuador | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Lee la lista unificada (base + personalizados del localStorage)
    const todos = cargarListaTatuadores();
    this.empleado = todos.find(e => e.id === id) || null;
  }

  obtenerEstrellas(cantidad: number): string {
    return '★'.repeat(cantidad) + '☆'.repeat(5 - cantidad);
  }
}
