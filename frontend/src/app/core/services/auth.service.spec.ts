import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { User } from '../models/models';
import { AuthService } from './auth.service';

const user: User = { userId: 'john', name: 'John', email: 'j@x.dev', role: 'General User', department: 'Support', active: true, createdAt: '2026-01-01' };

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); localStorage.clear(); });

  it('starts signed out', () => {
    expect(service.isLoggedIn).toBeFalse();
  });

  it('stores the token and user after login', () => {
    service.login({ userId: 'john', password: 'User@123', role: 'General User' }).subscribe();
    const req = http.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'abc', user });
    expect(service.token).toBe('abc');
    expect(service.user?.userId).toBe('john');
    expect(service.isLoggedIn).toBeTrue();
    expect(service.hasRole('Admin')).toBeFalse();
  });

  it('clears everything on logout', () => {
    service.login({ userId: 'john', password: 'x', role: 'General User' }).subscribe();
    http.expectOne('/api/auth/login').flush({ token: 'abc', user });
    service.logout();
    expect(service.isLoggedIn).toBeFalse();
    expect(localStorage.getItem('gh.token')).toBeNull();
  });
});
