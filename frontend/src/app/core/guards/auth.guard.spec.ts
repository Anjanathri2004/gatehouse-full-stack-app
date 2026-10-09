import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Role } from '../models/models';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;
  let auth: { isLoggedIn: boolean; user: { role: Role } | null };

  const route = (roles?: Role[]) => ({ data: { roles } } as unknown as ActivatedRouteSnapshot);

  beforeEach(() => {
    auth = { isLoggedIn: false, user: null };
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: auth }]
    });
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('redirects anonymous users to /login', () => {
    const result = guard.canActivate(route()) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/login');
  });

  it('lets a signed-in user through a route without roles', () => {
    auth.isLoggedIn = true; auth.user = { role: 'General User' };
    expect(guard.canActivate(route())).toBeTrue();
  });

  it('sends a General User away from an Admin route', () => {
    auth.isLoggedIn = true; auth.user = { role: 'General User' };
    const result = guard.canActivate(route(['Admin'])) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/dashboard');
  });

  it('lets an Admin into an Admin route', () => {
    auth.isLoggedIn = true; auth.user = { role: 'Admin' };
    expect(guard.canActivate(route(['Admin']))).toBeTrue();
  });
});
