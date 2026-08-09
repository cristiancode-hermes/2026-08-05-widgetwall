import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <!-- Logo -->
        <div class="auth-header">
          <div class="logo-icon">W</div>
          <h1 class="auth-title">Welcome back</h1>
          <p class="auth-subtitle">Sign in to WidgetWall</p>
        </div>

        <!-- Error banner -->
        @if (errorMessage()) {
          <div class="error-banner">
            <span>⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- Login form -->
        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="field">
            <label for="usernameOrEmail">Username or Email</label>
            <input
              id="usernameOrEmail"
              type="text"
              name="usernameOrEmail"
              [ngModel]="usernameOrEmail()"
              (ngModelChange)="usernameOrEmail.set($event)"
              required
              autocomplete="username"
              placeholder="username@example.com"
              [class.input-error]="!!errorMessage()"
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              [ngModel]="password()"
              (ngModelChange)="password.set($event)"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              [class.input-error]="!!errorMessage()"
            />
          </div>

          <button
            type="submit"
            class="auth-btn"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="spinner"></span>
              Signing in...
            } @else {
              Sign in
            }
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account?
          <a routerLink="/register">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 4%, var(--color-surface-secondary)), var(--color-surface-secondary));
      }

      .auth-card {
        width: 100%;
        max-width: 400px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-lg);
        padding: 40px 32px;
      }

      .auth-header {
        text-align: center;
        margin-bottom: 28px;
      }

      .logo-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-lg);
        background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 700;
        font-size: 22px;
        margin: 0 auto 16px;
        letter-spacing: -0.02em;
      }

      .auth-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--color-ink);
        margin: 0 0 6px;
        letter-spacing: -0.03em;
      }

      .auth-subtitle {
        font-size: 14px;
        color: var(--color-ink-secondary);
        margin: 0;
      }

      .error-banner {
        background: color-mix(in srgb, var(--color-danger) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--color-danger) 30%, transparent);
        color: var(--color-danger);
        font-size: 13px;
        padding: 12px 16px;
        border-radius: var(--radius-md);
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: shake 0.3s ease-out;
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field label {
        font-size: 13px;
        font-weight: 500;
        color: var(--color-ink);
      }

      .field input {
        width: 100%;
        padding: 10px 14px;
        font-size: 14px;
        border: 1.5px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-surface);
        color: var(--color-ink);
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
        box-sizing: border-box;
      }
      .field input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-subtle);
      }
      .field input::placeholder {
        color: var(--color-ink-secondary);
        opacity: 0.6;
      }

      .input-error {
        border-color: var(--color-danger) !important;
      }
      .input-error:focus {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-danger) 15%, transparent) !important;
      }

      .auth-btn {
        width: 100%;
        padding: 11px 20px;
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: opacity 0.15s, transform 0.1s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .auth-btn:hover:not(:disabled) {
        opacity: 0.92;
        transform: translateY(-1px);
      }
      .auth-btn:active:not(:disabled) {
        transform: translateY(0);
      }
      .auth-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      .auth-footer {
        text-align: center;
        font-size: 13px;
        color: var(--color-ink-secondary);
        margin-top: 24px;
      }
      .auth-footer a {
        color: var(--color-primary);
        font-weight: 500;
        text-decoration: none;
      }
      .auth-footer a:hover {
        text-decoration: underline;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-4px); }
        40% { transform: translateX(4px); }
        60% { transform: translateX(-3px); }
        80% { transform: translateX(3px); }
      }
    `,
  ],
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected usernameOrEmail = signal('');
  protected password = signal('');
  protected loading = signal(false);
  protected errorMessage = signal('');

  protected onSubmit() {
    const usernameOrEmail = this.usernameOrEmail();
    const password = this.password();
    if (!usernameOrEmail || !password) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(usernameOrEmail, password).subscribe({
      next: (res) => {
        this.authService.setToken(res.token);
        this.authService.currentUser.set(res.user);
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Invalid username or password');
        } else if (err.status === 0) {
          this.errorMessage.set('Unable to connect to server');
        } else {
          this.errorMessage.set(err.error?.message || 'Login failed');
        }
      },
    });
  }
}
