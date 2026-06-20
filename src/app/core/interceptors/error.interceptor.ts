import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'Ocurrió un error inesperado';

        if (error.error?.message) {
          message = error.error.message;
        } else if (error.status === 401) {
          message = 'Sesión expirada';
          localStorage.removeItem('token');
        } else if (error.status === 403) {
          message = 'No tienes permisos';
        } else if (error.status === 404) {
          message = 'Recurso no encontrado';
        } else if (error.status === 500) {
          message = 'Error del servidor';
        }

        console.error(`[ErrorInterceptor] ${error.status}: ${message}`);
        return throwError(() => ({ status: error.status, message }));
      })
    );
  }
}
