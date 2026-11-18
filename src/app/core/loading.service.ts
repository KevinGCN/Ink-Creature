import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';

/**
 * Estado global de carga.
 *
 * Cuenta peticiones HTTP y navegaciones activas para mostrar una sola
 * barra de progreso. Así cada clic (guardar, borrar, filtrar, cambiar de
 * página) da una señal visual inmediata de que algo está pasando.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private peticiones$ = new BehaviorSubject<number>(0);
  private navegando$ = new BehaviorSubject<boolean>(false);

  /** `true` mientras haya una petición o un cambio de ruta en curso. */
  visible$: Observable<boolean> = combineLatest([
    this.peticiones$,
    this.navegando$,
  ]).pipe(map(([peticiones, navegando]) => peticiones > 0 || navegando));

  iniciarPeticion(): void {
    this.peticiones$.next(this.peticiones$.value + 1);
  }

  terminarPeticion(): void {
    this.peticiones$.next(Math.max(0, this.peticiones$.value - 1));
  }

  iniciarNavegacion(): void {
    this.navegando$.next(true);
  }

  terminarNavegacion(): void {
    this.navegando$.next(false);
  }
}
