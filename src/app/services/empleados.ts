import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Empleado } from '../models/empleado';
import { API_ROUTES, urlDeImagen } from '../core/api.routes';

/**
 * Forma en que el backend devuelve un empleado (`GET /empleados`).
 * El nombre y el apellido viven en la relación `usuarios`.
 */
interface EmpleadoApi {
  id: number;
  usuario_id: number;
  especialidad: string | null;
  biografia: string | null;
  fecha_contratacion: string;
  activo: boolean;
  usuarios: {
    id: number;
    nombre: string;
    apellido: string;
    foto_perfil_url: string | null;
  } | null;
}

/** Franja semanal que devuelve `GET /horarios-trabajador`. */
interface HorarioApi {
  empleado_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface DatosEmpleado {
  nombre: string;
  apellido: string;
  email?: string;
  password?: string;
  especialidad: string;
  biografia: string;
}

const DIAS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

/** "1970-01-01T07:00:00.000Z" o "07:00:00" → "07:00". */
function aHHMM(valor: string): string {
  return valor.includes('T') ? valor.slice(11, 16) : valor.slice(0, 5);
}

/**
 * Catálogo de tatuadores desde el backend.
 *
 * La página pública de empleados y el calendario leen de aquí. La experiencia
 * se calcula desde `fecha_contratacion`; los horarios se agrupan en una sola
 * franja por empleado (el formulario de citas solo necesita inicio/fin/días).
 */
@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  constructor(private http: HttpClient) {}

  getEmpleados(): Observable<Empleado[]> {
    return forkJoin({
      empleados: this.http.get<EmpleadoApi[]>(API_ROUTES.empleados),
      horarios: this.http
        .get<HorarioApi[]>(API_ROUTES.horarios)
        .pipe(catchError(() => of([] as HorarioApi[]))),
    }).pipe(
      map(({ empleados, horarios }) =>
        empleados
          .filter((e) => e.activo)
          .map((e) => this.mapear(e, horarios)),
      ),
    );
  }

  getEmpleado(id: number): Observable<Empleado | undefined> {
    return this.getEmpleados().pipe(
      map((lista) => lista.find((e) => e.id === id)),
    );
  }

  /** Alta: usuario público + foto opcional + ficha de empleado. */
  crear(datos: DatosEmpleado, foto?: File): Observable<Empleado | undefined> {
    return this.http
      .post<{ id: number }>(API_ROUTES.usuarios, {
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        password: datos.password,
      })
      .pipe(
        switchMap((usuario) =>
          this.http
            .patch(`${API_ROUTES.usuarios}/${usuario.id}/rol`, {
              rol: 'empleado',
            })
            .pipe(
              switchMap(() => this.subirFotoSiHay(usuario.id, foto)),
              switchMap(() =>
                this.http.post<{ id: number }>(API_ROUTES.empleados, {
                  usuario_id: usuario.id,
                  especialidad: datos.especialidad,
                  biografia: datos.biografia,
                }),
              ),
            ),
        ),
        switchMap((empleado) => this.getEmpleado(empleado.id)),
      );
  }

  /** Edición: datos del usuario, foto opcional y datos de la ficha. */
  actualizar(
    empleado: Empleado,
    datos: DatosEmpleado,
    foto?: File,
  ): Observable<Empleado | undefined> {
    return this.http
      .patch(`${API_ROUTES.usuarios}/${empleado.usuarioId}`, {
        nombre: datos.nombre,
        apellido: datos.apellido,
      })
      .pipe(
        switchMap(() => this.subirFotoSiHay(empleado.usuarioId, foto)),
        switchMap(() =>
          this.http.patch(`${API_ROUTES.empleados}/${empleado.id}`, {
            especialidad: datos.especialidad,
            biografia: datos.biografia,
          }),
        ),
        switchMap(() => this.getEmpleado(empleado.id)),
      );
  }

  eliminar(id: number): Observable<unknown> {
    return this.http.delete(`${API_ROUTES.empleados}/${id}`);
  }

  private subirFotoSiHay(usuarioId: number, foto?: File): Observable<unknown> {
    if (!foto) return of(null);

    const formData = new FormData();
    formData.append('imagen', foto);
    return this.http.post(`${API_ROUTES.usuarios}/${usuarioId}/foto`, formData);
  }

  private mapear(empleado: EmpleadoApi, horarios: HorarioApi[]): Empleado {
    const anioContratacion = new Date(
      empleado.fecha_contratacion,
    ).getUTCFullYear();

    return {
      id: empleado.id,
      usuarioId: empleado.usuario_id,
      name: empleado.usuarios?.nombre ?? '',
      last_name: empleado.usuarios?.apellido ?? '',
      email: '',
      phone: '',
      charge: 'Tatuador',
      especialidad: empleado.especialidad ?? '',
      descripcion: empleado.biografia ?? '',
      foto:
        urlDeImagen(empleado.usuarios?.foto_perfil_url) ||
        'image/tatuador.png',
      experiencia: Math.max(0, new Date().getFullYear() - anioContratacion),
      schedule: this.armarHorario(empleado.id, horarios),
      activo: empleado.activo,
    };
  }

  private armarHorario(
    empleadoId: number,
    horarios: HorarioApi[],
  ): Empleado['schedule'] {
    const propios = horarios.filter((h) => h.empleado_id === empleadoId);
    if (propios.length === 0) return undefined;

    const dias = [
      ...new Set(
        propios
          .map((h) => DIAS[h.dia_semana])
          .filter((d): d is string => !!d),
      ),
    ];
    const inicios = propios.map((h) => aHHMM(h.hora_inicio)).sort();
    const fines = propios.map((h) => aHHMM(h.hora_fin)).sort();

    return {
      start: inicios[0],
      end: fines[fines.length - 1],
      days: dias,
    };
  }
}
