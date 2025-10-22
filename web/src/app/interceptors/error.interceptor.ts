import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { SnackService } from '../services/snack.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(SnackService);
  return next(req).pipe(
    tap({
      error: (e: unknown) => {
        const msg = e instanceof HttpErrorResponse
          ? (e.error?.message || e.message)
          : 'Error desconocido';
        snack.error(msg);
      }
    })
  );
};
