import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Role, User } from '../models/models';

const TOKEN_KEY = 'gh.token';
const USER_KEY = 'gh.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(this.restore());
  readonly user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  get token(): string | null { return localStorage.getItem(TOKEN_KEY); }
  get user(): User | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!this.token && !!this.user; }
  hasRole(role: Role): boolean { return this.user?.role === role; }

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, body).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

  private restore(): User | null {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  }
}
