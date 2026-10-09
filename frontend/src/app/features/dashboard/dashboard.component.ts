import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { RecordsResponse, Section, User } from '../../core/models/models';
import { UserService } from '../../core/services/user.service';

/**
 * Async showcase: the profile and the records are requested at the same time, each with its own
 * simulated server delay. Each section renders as soon as ITS data arrives (async pipe + startWith),
 * and shows how long it took.
 */
@Component({ selector: 'gh-dashboard', templateUrl: './dashboard.component.html' })
export class DashboardComponent implements OnInit {
  profileDelay = 500;
  recordsDelay = 2000;
  search = new FormControl('');

  profile$!: Observable<Section<User>>;
  records$!: Observable<Section<RecordsResponse>>;

  constructor(private users: UserService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.profile$ = this.track(this.users.me(this.profileDelay));
    this.records$ = this.track(this.users.records(this.recordsDelay));
  }

  private track<T>(source: Observable<T>): Observable<Section<T>> {
    const started = performance.now();
    return source.pipe(
      map(data => ({ loading: false, data, ms: Math.round(performance.now() - started) })),
      catchError(err => of({ loading: false, error: err.error?.message || 'Could not load this section.' } as Section<T>)),
      startWith({ loading: true } as Section<T>)
    );
  }
}
