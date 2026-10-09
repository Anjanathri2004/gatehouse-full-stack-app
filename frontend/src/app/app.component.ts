import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'gh-root',
  template: `
    <header class="bar" *ngIf="auth.user$ | async as user">
      <a class="brand" routerLink="/dashboard">Gatehouse</a>
      <nav>
        <a routerLink="/dashboard" routerLinkActive="on">My access</a>
        <a routerLink="/admin" routerLinkActive="on" *ngIf="user.role === 'Admin'">Manage users</a>
      </nav>
      <div class="who">
        <span class="avatar">{{ user.name.charAt(0) }}</span>
        <span>{{ user.name }}<small>{{ user.role }}</small></span>
        <button class="btn ghost" (click)="logout()">Sign out</button>
      </div>
    </header>
    <router-outlet></router-outlet>`
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout(): void { this.auth.logout(); this.router.navigate(['/login']); }
}
