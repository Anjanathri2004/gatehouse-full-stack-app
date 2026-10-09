import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorInterceptor } from './http-error.interceptor';

describe('HttpErrorInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let snack: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snack = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: MatSnackBar, useValue: snack },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
      ]
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  it('shows a toast when the server is unreachable', () => {
    http.get('/api/x').subscribe({ error: () => undefined });
    ctrl.expectOne('/api/x').error(new ErrorEvent('network'), { status: 0 });
    expect(snack.open).toHaveBeenCalledWith(jasmine.stringMatching(/Cannot reach/), 'Dismiss', jasmine.anything());
  });

  it('shows a toast on a 500', () => {
    http.get('/api/x').subscribe({ error: () => undefined });
    ctrl.expectOne('/api/x').flush({}, { status: 500, statusText: 'Server Error' });
    expect(snack.open).toHaveBeenCalledTimes(1);
  });

  it('stays quiet on validation errors but still passes the error on', () => {
    let status = 0;
    http.get('/api/x').subscribe({ error: e => (status = e.status) });
    ctrl.expectOne('/api/x').flush({ message: 'taken' }, { status: 409, statusText: 'Conflict' });
    expect(snack.open).not.toHaveBeenCalled();
    expect(status).toBe(409);
  });
});
