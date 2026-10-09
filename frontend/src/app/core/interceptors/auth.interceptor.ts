import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/** Adds the bearer token to API calls and signs the user out when the server says the session is invalid. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.token;
    const authed = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    return next.handle(authed).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !req.url.endsWith('/auth/login')) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
        return throwError(err);
      })
    );
  }
}
