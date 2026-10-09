import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Role, User } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

/** Admin-only user management: list, add, edit, activate/deactivate, delete. All calls honour the delay slider. */
@Component({ selector: 'gh-admin', templateUrl: './admin.component.html' })
export class AdminComponent implements OnInit {
  readonly roles: Role[] = ['General User', 'Admin'];
  users: User[] = [];
  loading = false;
  saving = false;
  busyUser: string | null = null;
  error = '';
  delay = 1000;
  editing: User | null = null;
  formOpen = false;

  form = this.fb.group({
    userId: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.-]{3,30}$/)]],
    name: ['', Validators.required],
    email: ['', Validators.email],
    department: ['General'],
    role: ['General User' as Role, Validators.required],
    password: ['']
  });

  constructor(
    private fb: FormBuilder, private api: UserService, public auth: AuthService,
    private snack: MatSnackBar, private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.load(); }

  get currentUserId(): string { return this.auth.user?.userId || ''; }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.list(this.delay).pipe(finalize(() => (this.loading = false))).subscribe({
      next: users => (this.users = users),
      error: err => (this.error = err.error?.message || 'Could not load users.')
    });
  }

  openCreate(): void {
    this.editing = null;
    this.form.reset({ userId: '', name: '', email: '', department: 'General', role: 'General User', password: '' });
    this.form.controls.userId.enable();
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();
    this.formOpen = true;
  }

  openEdit(u: User): void {
    this.editing = u;
    this.form.reset({ ...u, password: '' });
    this.form.controls.userId.disable();
    this.form.controls.password.setValidators([Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();
    this.formOpen = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const body = { ...v, active: this.editing ? this.editing.active : true };
    if (!body.password) { delete body.password; }
    this.saving = true;
    const wasEditing = !!this.editing;
    const call = this.editing
      ? this.api.update(this.editing.userId, body, this.delay)
      : this.api.create(body, this.delay);
    call.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => { this.say(wasEditing ? 'User updated' : 'User added'); this.formOpen = false; this.load(); },
      error: err => this.say(err.error?.message || 'Could not save the user.')
    });
  }

  toggleActive(u: User): void {
    this.run(u, this.api.update(u.userId, { active: !u.active }, this.delay), u.active ? 'User deactivated' : 'User activated');
  }

  remove(u: User): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete user', message: `Delete ${u.name} (${u.userId})? This cannot be undone.`, confirmLabel: 'Delete user' }
    }).afterClosed().subscribe(ok => {
      if (ok) { this.run(u, this.api.remove(u.userId, this.delay), 'User deleted'); }
    });
  }

  private run(u: User, call: Observable<unknown>, ok: string): void {
    this.busyUser = u.userId;
    call.pipe(finalize(() => (this.busyUser = null))).subscribe({
      next: () => { this.say(ok); this.load(); },
      error: err => this.say(err.error?.message || 'That action failed.')
    });
  }

  private say(msg: string): void { this.snack.open(msg, 'OK', { duration: 3500 }); }
}
