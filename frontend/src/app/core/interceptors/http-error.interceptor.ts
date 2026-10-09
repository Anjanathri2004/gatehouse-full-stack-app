import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Global error toast for problems no component can fix: server unreachable or 5xx.
 * Validation (400/409) and auth (401/403) errors are handled where they happen.
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private snack: MatSnackBar) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 0) {
          this.snack.open('Cannot reach the server. Check that the API is running.', 'Dismiss', { duration: 5000 });
        } else if (err.status >= 500) {
          this.snack.open('The server ran into a problem. Please try again.', 'Dismiss', { duration: 5000 });
        }
        return throwError(err);
      })
    );
  }
}
