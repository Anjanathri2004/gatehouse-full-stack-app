import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { User } from '../../core/models/models';
import { UserService } from '../../core/services/user.service';
import { UserDetailResolver } from './user-detail.resolver';

const user: User = { userId: 'john', name: 'John', email: 'j@x.dev', role: 'General User', department: 'Support', active: true, createdAt: '2026-01-01' };
const snapshot = (id: string) => ({ paramMap: convertToParamMap({ userId: id }) } as ActivatedRouteSnapshot);

describe('UserDetailResolver', () => {
  let users: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;
  let resolver: UserDetailResolver;

  beforeEach(() => {
    users = jasmine.createSpyObj<UserService>('UserService', ['get']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [{ provide: UserService, useValue: users }, { provide: Router, useValue: router }]
    });
    resolver = TestBed.inject(UserDetailResolver);
  });

  it('resolves the user from the API', done => {
    users.get.and.returnValue(of(user));
    resolver.resolve(snapshot('john')).subscribe(u => {
      expect(u.userId).toBe('john');
      expect(users.get).toHaveBeenCalledWith('john');
      done();
    });
  });

  it('goes back to the admin list when the user cannot be loaded', done => {
    users.get.and.returnValue(throwError({ status: 404 }));
    resolver.resolve(snapshot('ghost')).subscribe({
      complete: () => { expect(router.navigate).toHaveBeenCalledWith(['/admin']); done(); }
    });
  });
});
