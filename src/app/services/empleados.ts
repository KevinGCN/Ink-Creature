import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Empleado } from '../models/empleado';

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private url = 'assets/empleados.json';
  constructor(private http: HttpClient){}
  getEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.url);
  }
}
