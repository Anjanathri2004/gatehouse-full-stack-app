import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { throwError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SharedModule } from '../../shared/shared.module';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let auth: { login: jasmine.Spy; isLoggedIn: boolean };
  let router: Router;

  beforeEach(async () => {
    auth = { login: jasmine.createSpy('login'), isLoggedIn: false };
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: auth }]
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('does not call the API while the form is invalid', () => {
    component.submit();
    expect(auth.login).not.toHaveBeenCalled();
    expect(component.form.controls.userId.touched).toBeTrue();
  });

  it('signs in with the chosen role and goes to the dashboard', () => {
    auth.login.and.returnValue(of({}));
    component.form.setValue({ userId: 'admin', password: 'Admin@123', role: 'Admin' });
    component.submit();
    expect(auth.login).toHaveBeenCalledWith({ userId: 'admin', password: 'Admin@123', role: 'Admin' });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('shows the server message when sign-in fails', () => {
    auth.login.and.returnValue(throwError({ error: { message: 'User ID or password is incorrect.' } }));
    component.form.setValue({ userId: 'john', password: 'bad-pass', role: 'General User' });
    component.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alert').textContent).toContain('incorrect');
    expect(component.busy).toBeFalse();
  });

  it('fills the form from a demo account button', () => {
    component.fill(component.demo[0]);
    expect(component.form.value.userId).toBe('admin');
    expect(component.form.value.role).toBe('Admin');
  });
});
