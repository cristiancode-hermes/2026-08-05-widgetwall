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
    <div class="login-container min-h-screen flex items-center justify-center px-4">
      <div class="login-card w-full max-w-sm bg-surface rounded-lg shadow-lg p-8 border border-border">
        <!-- Logo -->
        <div class="text-center mb-6">
          <div class="logo-icon w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            W
          </div>
          <h1 class="text-2xl font-bold text-ink">Welcome back</h1>
          <p class="text-sm text-ink-secondary mt-1">Sign in to WidgetWall</p>
        </div>

        <!-- Error banner -->
        @if (errorMessage()) {
          <div class="error-banner bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- Login form -->
        <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="field-group">
            <label for="usernameOrEmail" class="block text-sm font-medium text-ink mb-1.5">Username or Email</label>
            <input
              id="usernameOrEmail"
              type="text"
              name="usernameOrEmail"
              [(ngModel)]="usernameOrEmail"
              required
              autocomplete="username"
              placeholder="username@example.com"
              class="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-ink text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              [class.border-danger]="!!errorMessage()"
            />
          </div>

          <div class="field-group">
            <label for="password" class="block text-sm font-medium text-ink mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              [(ngModel)]="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-ink text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              [class.border-danger]="!!errorMessage()"
            />
          </div>

          <button
            type="submit"
            class="w-full py-2.5 bg-primary text-white font-medium text-sm rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Signing in...
            } @else {
              Sign in
            }
          </button>
        </form>

        <!-- Register link -->
        <p class="text-center text-sm text-ink-secondary mt-6">
          Don't have an account?
          <a routerLink="/register" class="text-primary font-medium hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .animate-spin {
        animation: spin 0.6s linear infinite;
      }
    `,
  ],
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected usernameOrEmail = '';
  protected password = '';
  protected loading = signal(false);
  protected errorMessage = signal('');

  protected onSubmit() {
    if (!this.usernameOrEmail || !this.password) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.usernameOrEmail, this.password).subscribe({
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
