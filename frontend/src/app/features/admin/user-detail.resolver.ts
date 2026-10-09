import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../core/models/models';
import { UserService } from '../../core/services/user.service';

/** Loads the user BEFORE the detail page renders; unknown users send the admin back to the list. */
@Injectable({ providedIn: 'root' })
export class UserDetailResolver implements Resolve<User> {
  constructor(private users: UserService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    return this.users.get(route.paramMap.get('userId') || '').pipe(
      catchError(() => {
        this.router.navigate(['/admin']);
        return EMPTY;
      })
    );
  }
}
