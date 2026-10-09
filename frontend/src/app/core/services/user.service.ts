import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RecordsResponse, User, UserForm } from '../models/models';

/** All user-related API calls. Every call accepts an optional `delay` (ms) so the server simulates latency. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  private delayParams(delay = 0): HttpParams { return new HttpParams().set('delay', String(delay)); }

  me(delay = 0): Observable<User> {
    return this.http.get<User>(`${this.api}/me`, { params: this.delayParams(delay) });
  }
  records(delay = 0): Observable<RecordsResponse> {
    return this.http.get<RecordsResponse>(`${this.api}/records`, { params: this.delayParams(delay) });
  }
  list(delay = 0): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users`, { params: this.delayParams(delay) });
  }
  get(userId: string, delay = 0): Observable<User> {
    return this.http.get<User>(`${this.api}/users/${userId}`, { params: this.delayParams(delay) });
  }
  create(form: UserForm, delay = 0): Observable<User> {
    return this.http.post<User>(`${this.api}/users`, form, { params: this.delayParams(delay) });
  }
  update(userId: string, form: Partial<UserForm>, delay = 0): Observable<User> {
    return this.http.put<User>(`${this.api}/users/${userId}`, form, { params: this.delayParams(delay) });
  }
  remove(userId: string, delay = 0): Observable<void> {
    return this.http.delete<void>(`${this.api}/users/${userId}`, { params: this.delayParams(delay) });
  }
}
