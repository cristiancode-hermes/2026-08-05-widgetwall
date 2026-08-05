import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../shared/toast.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../services/api.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent],
  template: `
    <div class="settings-page max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold text-ink mb-6">Settings</h2>

      <!-- Success banner -->
      @if (successMessage()) {
        <div class="success-banner bg-success/10 border border-success/30 text-success text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <span>✓</span>
          <span>{{ successMessage() }}</span>
        </div>
      }

      <!-- Error banner -->
      @if (errorMessage()) {
        <div class="error-banner bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      <!-- Profile Section -->
      <section class="settings-section bg-surface border border-border rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-ink mb-4">Profile</h3>
        <div class="flex flex-col gap-4">
          <div class="field-group">
            <label for="displayName" class="block text-sm font-medium text-ink mb-1.5">Display Name</label>
            <input
              id="displayName"
              type="text"
              [(ngModel)]="displayName"
              placeholder="Your display name"
              class="w-full max-w-sm px-4 py-2.5 border border-border rounded-lg bg-surface text-ink text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div class="field-group">
            <label for="email" class="block text-sm font-medium text-ink mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              placeholder="you@example.com"
              class="w-full max-w-sm px-4 py-2.5 border border-border rounded-lg bg-surface text-ink text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
      </section>

      <!-- Theme Section -->
      <section class="settings-section bg-surface border border-border rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-ink mb-4">Theme</h3>
        <div class="flex flex-col gap-3">
          @for (option of themeOptions; track option.value) {
            <label class="theme-option flex items-center gap-3 px-4 py-3 rounded-lg border border-border cursor-pointer hover:bg-surface-secondary transition-colors">
              <input
                type="radio"
                name="defaultTheme"
                [value]="option.value"
                [checked]="defaultTheme() === option.value"
                (change)="setDefaultTheme(option.value)"
                class="w-4 h-4 accent-primary"
              />
              <div>
                <div class="text-sm font-medium text-ink">{{ option.label }}</div>
                <div class="text-xs text-ink-secondary">{{ option.description }}</div>
              </div>
            </label>
          }
        </div>
        <div class="mt-4 flex items-center gap-3">
          <label class="text-sm text-ink">Dark mode</label>
          <button
            class="toggle-btn relative w-10 h-5 rounded-full transition-colors border-none cursor-pointer"
            [class.bg-primary]="themeService.isDark()"
            [class.bg-border]="!themeService.isDark()"
            (click)="themeService.toggle()"
          >
            <span
              class="toggle-knob absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
              [class.translate-x-5]="themeService.isDark()"
            ></span>
          </button>
        </div>
      </section>

      <!-- Password Section -->
      <section class="settings-section bg-surface border border-border rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-ink mb-4">Change Password</h3>
        <div class="flex flex-col gap-4">
          <div class="field-group">
            <label for="currentPassword" class="block text-sm font-medium text-ink mb-1.5">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              [(ngModel)]="currentPassword"
              placeholder="••••••••"
              class="w-full max-w-sm px-4 py-2.5 border border-border rounded-lg bg-surface text-ink text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div class="field-group">
            <label for="newPassword" class="block text-sm font-medium text-ink mb-1.5">New Password</label>
            <input
              id="newPassword"
              type="password"
              [(ngModel)]="newPassword"
              placeholder="••••••••"
              class="w-full max-w-sm px-4 py-2.5 border border-border rounded-lg bg-surface text-ink text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="settings-section bg-surface border border-danger/30 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-danger mb-4">Danger Zone</h3>
        <p class="text-sm text-ink-secondary mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          class="px-4 py-2 bg-danger text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors cursor-pointer border-none"
          (click)="showDeleteConfirm.set(true)"
        >
          Delete Account
        </button>
      </section>

      <!-- Save button -->
      <div class="flex justify-end mb-8">
        <button
          class="px-6 py-2.5 bg-primary text-white font-medium text-sm rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
          [disabled]="saving()"
          (click)="saveSettings()"
        >
          @if (saving()) {
            <span class="spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Saving...
          } @else {
            Save Changes
          }
        </button>
      </div>
    </div>

    <!-- Delete confirm dialog -->
    <app-confirm-dialog
      title="Delete Account"
      message="Are you sure you want to permanently delete your account? This action cannot be undone."
      confirmLabel="Delete My Account"
      [danger]="true"
      [visible]="showDeleteConfirm()"
      (confirm)="deleteAccount()"
      (cancel)="showDeleteConfirm.set(false)"
    />
  `,
  styles: [
    `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .animate-spin {
        animation: spin 0.6s linear infinite;
      }

      .toggle-knob {
        transition: transform 0.2s ease;
      }

      .translate-x-5 {
        transform: translateX(1.25rem);
      }
    `,
  ],
})
export class SettingsPageComponent implements OnInit {
  private authService = inject(AuthService);
  protected themeService = inject(ThemeService);
  private toastService = inject(ToastService);
  private http = inject(HttpClient);

  protected displayName = '';
  protected email = '';
  protected defaultTheme = signal<'light' | 'dark' | 'system'>('system');
  protected currentPassword = '';
  protected newPassword = '';
  protected saving = signal(false);
  protected successMessage = signal('');
  protected errorMessage = signal('');
  protected showDeleteConfirm = signal(false);

  protected themeOptions = [
    { value: 'light', label: 'Light', description: 'Always use light mode' },
    { value: 'dark', label: 'Dark', description: 'Always use dark mode' },
    { value: 'system', label: 'System', description: 'Follow system preference' },
  ];

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.displayName = user.displayName || '';
      this.email = user.email || '';
      this.defaultTheme.set(user.settings?.defaultTheme || 'system');
    }
  }

  protected setDefaultTheme(value: string) {
    this.defaultTheme.set(value as 'light' | 'dark' | 'system');
  }

  protected saveSettings() {
    this.saving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    // Apply theme preference
    if (this.defaultTheme() === 'light') {
      this.themeService.setDark(false);
    } else if (this.defaultTheme() === 'dark') {
      this.themeService.setDark(true);
    }

    // Save profile (mock)
    setTimeout(() => {
      this.saving.set(false);
      this.successMessage.set('Settings saved successfully');
      this.toastService.success('Settings saved');

      setTimeout(() => this.successMessage.set(''), 3000);
    }, 500);
  }

  protected deleteAccount() {
    this.showDeleteConfirm.set(false);

    this.http.delete(`${API_BASE_URL}/auth/profile`).subscribe({
      next: () => {
        this.toastService.info('Account deleted');
        this.authService.logout();
      },
      error: () => {
        this.toastService.error('Failed to delete account');
      },
    });
  }
}
