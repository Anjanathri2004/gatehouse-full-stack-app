import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccessLevel, User } from '../../core/models/models';

@Component({
  selector: 'gh-user-detail',
  template: `
    <main class="page" *ngIf="user$ | async as u">
      <a class="back" routerLink="/admin">Back to users</a>
      <div class="page-head"><div><h1>{{ u.name }}</h1><p class="muted">{{ u.userId }} &middot; {{ u.role }}</p></div></div>

      <section class="panel">
        <header><h2>Account</h2>
          <span class="status" [ngClass]="u.active ? 'closed' : 'review'">{{ u.active ? 'Active' : 'Deactivated' }}</span></header>
        <dl class="profile">
          <div><dt>Email</dt><dd>{{ u.email }}</dd></div>
          <div><dt>Department</dt><dd>{{ u.department }}</dd></div>
          <div><dt>Member since</dt><dd>{{ u.createdAt | date: 'longDate' }}</dd></div>
        </dl>
      </section>

      <section class="panel">
        <header><h2>What this role can open</h2></header>
        <div class="detail">
          <ul class="access-list">
            <li *ngFor="let t of tiers" [class.no]="!can(u, t)">
              <gh-access-badge [level]="t"></gh-access-badge>
              {{ can(u, t) ? 'Can open these records' : 'Hidden from this role' }}
            </li>
          </ul>
        </div>
      </section>
    </main>`
})
export class UserDetailComponent {
  readonly tiers: AccessLevel[] = ['public', 'general', 'admin'];
  readonly user$: Observable<User> = this.route.data.pipe(map(d => d.user as User));
  constructor(private route: ActivatedRoute) {}
  can(u: User, tier: AccessLevel): boolean { return tier !== 'admin' || u.role === 'Admin'; }
}
