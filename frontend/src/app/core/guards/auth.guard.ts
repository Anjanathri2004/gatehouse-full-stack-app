import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Role } from '../models/models';
import { AuthService } from '../services/auth.service';

/** Blocks anonymous users; if route data has `roles`, also blocks users without one of them. */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.auth.isLoggedIn) { return this.router.parseUrl('/login'); }
    const roles = route.data.roles as Role[] | undefined;
    if (roles && !roles.includes(this.auth.user!.role)) { return this.router.parseUrl('/dashboard'); }
    return true;
  }
}
