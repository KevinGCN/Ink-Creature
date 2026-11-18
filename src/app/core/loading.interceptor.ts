import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from './loading.service';

/**
 * Muestra la barra de carga global mientras haya peticiones al backend.
 * `finalize` se ejecuta tanto si la petición responde como si falla, para
 * que la barra nunca se quede trabada.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  loading.iniciarPeticion();

  return next(req).pipe(finalize(() => loading.terminarPeticion()));
};
