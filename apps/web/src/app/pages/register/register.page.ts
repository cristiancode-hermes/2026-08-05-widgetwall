import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="register-container min-h-screen flex items-center justify-center px-4">
      <div class="register-card w-full max-w-sm bg-surface rounded-lg shadow-lg p-8 border border-border">
        <!-- Logo -->
        <div class="text-center mb-6">
          <div class="logo-icon w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            W
          </div>
          <h1 class="text-2xl font-bold text-ink">Create account</h1>
          <p class="text-sm text-ink-secondary mt-1">Join WidgetWall today</p>
        </div>

        <!-- Error banner -->
        @if (errorMessage()) {
          <div class="error-banner bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- Validation errors -->
        @if (validationErrors().length > 0) {
          <div class="validation-errors mb-4">
            @for (err of validationErrors(); track err) {
              <div class="text-danger text-xs flex items-center gap-1 mb-1">
                <span>•</span>
                <span>{{ err }}</span>
              </div>
            }
          </div>
        }

        <!-- Register form -->
        <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="field-group">
            <label for="username" class="block text-sm font-medium text-ink mb-1.5">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              [(ngModel)]="username"
              required
              autocomplete="username"
              placeholder="yourname"
              class="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-ink text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div class="field-group">
            <label for="email" class="block text-sm font-medium text-ink mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-ink text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
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
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-ink text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div class="field-group">
            <label for="confirmPassword" class="block text-sm font-medium text-ink mb-1.5">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              required
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-ink text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            class="w-full py-2.5 bg-primary text-white font-medium text-sm rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Creating account...
            } @else {
              Create account
            }
          </button>
        </form>

        <!-- Login link -->
        <p class="text-center text-sm text-ink-secondary mt-6">
          Already have an account?
          <a routerLink="/login" class="text-primary font-medium hover:underline">Sign in</a>
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

      input.ng-invalid.ng-touched {
        border-color: var(--color-danger);
      }
    `,
  ],
})
export class RegisterPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected username = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected loading = signal(false);
  protected errorMessage = signal('');
  protected validationErrors = signal<string[]>([]);

  protected onSubmit() {
    this.validationErrors.set([]);
    this.errorMessage.set('');

    // Client-side validation
    const errors: string[] = [];
    if (this.username.length < 3 || this.username.length > 20) {
      errors.push('Username must be between 3 and 20 characters');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('Please enter a valid email address');
    }
    if (this.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    } else {
      if (!/[a-zA-Z]/.test(this.password)) {
        errors.push('Password must contain at least one letter');
      }
      if (!/[0-9]/.test(this.password)) {
        errors.push('Password must contain at least one number');
      }
    }
    if (this.password !== this.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
      this.validationErrors.set(errors);
      return;
    }

    this.loading.set(true);

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        this.authService.setToken(res.token);
        this.authService.currentUser.set(res.user);
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Username or email already taken');
        } else if (err.status === 0) {
          this.errorMessage.set('Unable to connect to server');
        } else {
          this.errorMessage.set(err.error?.message || 'Registration failed');
        }
      },
    });
  }
}
