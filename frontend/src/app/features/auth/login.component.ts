import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Role } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';

@Component({ selector: 'gh-login', templateUrl: './login.component.html' })
export class LoginComponent {
  readonly roles: Role[] = ['General User', 'Admin'];
  readonly demo = [
    { label: 'Sign in as admin', userId: 'admin', password: 'Admin@123', role: 'Admin' as Role },
    { label: 'Sign in as general user', userId: 'john', password: 'User@123', role: 'General User' as Role }
  ];
  busy = false;
  error = '';

  form = this.fb.group({
    userId: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['General User' as Role, Validators.required]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn) { router.navigate(['/dashboard']); }
  }

  fill(d: { userId: string; password: string; role: Role }): void {
    this.form.setValue({ userId: d.userId, password: d.password, role: d.role });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.busy = true;
    this.error = '';
    this.auth.login(this.form.getRawValue())
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: err => (this.error = err.error?.message || 'Cannot reach the server. Is the API running on port 3000?')
      });
  }
}
