import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ToastContainerComponent } from '../../shared/toast-container.component';
import { Dashboard } from '../../interfaces';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ToastContainerComponent],
  template: `
    <div class="layout-container flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <aside
        class="sidebar w-64 bg-surface border-r border-border flex flex-col shrink-0 transition-all"
        [class.sidebar-collapsed]="sidebarCollapsed()"
      >
        <!-- Logo -->
        <div class="logo-area px-5 py-4 border-b border-border flex items-center gap-3">
          <div class="logo-icon w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <span class="font-semibold text-ink text-base">WidgetWall</span>
        </div>

        <!-- Dashboard list -->
        <nav class="sidebar-nav flex-1 overflow-y-auto px-3 py-3">
          <div class="nav-label text-xs font-semibold text-ink-secondary uppercase tracking-wider px-2 mb-2">
            Dashboards
          </div>

          @for (dash of dashboardService.dashboards(); track dash.id) {
            <a
              [routerLink]="['/dashboard', dash.slug]"
              class="nav-item flex items-center gap-2 px-3 py-2 rounded-md text-sm text-ink-secondary hover:bg-surface-secondary hover:text-ink transition-colors no-underline"
              routerLinkActive="active-nav-item bg-primary-50 text-primary font-medium"
            >
              <span class="nav-dot w-2 h-2 rounded-full bg-primary-400"></span>
              <span class="truncate">{{ dash.name }}</span>
            </a>
          } @empty {
            <div class="text-xs text-ink-secondary px-2 py-3">
              No dashboards yet
            </div>
          }

          <!-- New Dashboard button -->
          <button
            class="new-dash-btn w-full mt-3 flex items-center gap-2 px-3 py-2 rounded-md text-sm text-primary font-medium hover:bg-primary-50 transition-colors cursor-pointer bg-transparent border-2 border-dashed border-primary-300"
            (click)="showNewDashboardInput.set(true)"
          >
            <span class="text-lg leading-none">+</span>
            New Dashboard
          </button>

          @if (showNewDashboardInput()) {
            <div class="mt-2 flex gap-2">
              <input
                #newDashInput
                type="text"
                placeholder="Dashboard name"
                class="flex-1 px-3 py-1.5 text-sm border border-border rounded-md bg-surface text-ink outline-none focus:border-primary"
                (keydown.enter)="createDashboard(newDashInput.value)"
                (keydown.escape)="showNewDashboardInput.set(false); newDashInput.value = ''"
              />
              <button
                class="px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-primary-hover transition-colors cursor-pointer border-none"
                (click)="createDashboard(newDashInput.value)"
              >
                Add
              </button>
            </div>
          }
        </nav>

        <!-- Settings link -->
        <div class="sidebar-footer px-3 py-3 border-t border-border">
          <a
            routerLink="/settings"
            class="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-ink-secondary hover:bg-surface-secondary hover:text-ink transition-colors no-underline"
          >
            ⚙️ Settings
          </a>
        </div>
      </aside>

      <!-- Main content -->
      <div class="main-area flex-1 flex flex-col overflow-hidden">
        <!-- Top bar -->
        <header class="topbar flex items-center justify-between px-6 py-3 bg-surface border-b border-border shrink-0">
          <div class="topbar-left flex items-center gap-3">
            <h1 class="text-lg font-semibold text-ink">Dashboard</h1>
          </div>

          <div class="topbar-right flex items-center gap-4">
            <!-- Theme toggle -->
            <button
              class="theme-btn p-2 rounded-md text-ink-secondary hover:bg-surface-secondary hover:text-ink transition-colors cursor-pointer bg-transparent border-none text-lg"
              (click)="themeService.toggle()"
              [title]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              @if (themeService.isDark()) { ☀️ } @else { 🌙 }
            </button>

            <!-- User menu -->
            <div class="user-menu relative" (mouseleave)="showUserMenu.set(false)">
              <button
                class="user-btn flex items-center gap-2 p-2 rounded-md hover:bg-surface-secondary transition-colors cursor-pointer bg-transparent border-none"
                (mouseenter)="showUserMenu.set(true)"
                (click)="showUserMenu.update(v => !v)"
              >
                <div class="avatar w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {{ userInitials() }}
                </div>
                <span class="text-sm text-ink font-medium hidden sm:inline">
                  {{ authService.currentUser()?.displayName || authService.currentUser()?.username }}
                </span>
              </button>

              @if (showUserMenu()) {
                <div class="user-dropdown absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
                  <div class="px-4 py-2 text-sm text-ink-secondary border-b border-border">
                    {{ authService.currentUser()?.email }}
                  </div>
                  <button
                    class="w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-secondary transition-colors cursor-pointer bg-transparent border-none"
                    routerLink="/settings"
                  >
                    ⚙️ Settings
                  </button>
                  <button
                    class="w-full text-left px-4 py-2 text-sm text-danger hover:bg-surface-secondary transition-colors cursor-pointer bg-transparent border-none"
                    (click)="authService.logout()"
                  >
                    🚪 Log out
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="content-area flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>

    <!-- Toast container -->
    <app-toast-container />
  `,
  styles: [
    `
      .active-nav-item {
        background: color-mix(in srgb, var(--color-primary) 10%, transparent);
      }

      .user-dropdown {
        transform-origin: top right;
        animation: dropdown-appear 100ms ease-out both;
      }

      @keyframes dropdown-appear {
        from {
          opacity: 0;
          transform: translateY(-4px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `,
  ],
})
export class MainLayoutComponent implements OnInit {
  protected dashboardService = inject(DashboardService);
  protected authService = inject(AuthService);
  protected themeService = inject(ThemeService);
  private router = inject(Router);

  protected showNewDashboardInput = signal(false);
  protected showUserMenu = signal(false);
  protected sidebarCollapsed = signal(false);

  ngOnInit() {
    this.loadDashboards();
    this.loadProfile();
  }

  protected loadDashboards() {
    this.dashboardService.getAll().subscribe({
      next: (dashboards) => this.dashboardService.dashboards.set(dashboards),
      error: () => {
        // Silently fail — dashboards will be empty
      },
    });
  }

  protected loadProfile() {
    this.authService.getProfile().subscribe({
      next: (user) => this.authService.currentUser.set(user),
      error: () => {
        // Profile will be loaded on first login
      },
    });
  }

  protected createDashboard(name: string) {
    if (!name?.trim()) return;
    this.dashboardService.create(name.trim()).subscribe({
      next: (dash) => {
        this.dashboardService.dashboards.update((list) => [...list, dash]);
        this.showNewDashboardInput.set(false);
        this.router.navigate(['/dashboard', dash.slug]);
      },
      error: () => {
        // Handle error
      },
    });
  }

  protected userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    const name = user.displayName || user.username;
    return name.charAt(0).toUpperCase();
  }
}
