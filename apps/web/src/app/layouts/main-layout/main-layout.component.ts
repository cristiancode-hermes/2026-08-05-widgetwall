import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ToastContainerComponent } from '../../shared/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ToastContainerComponent],
  template: `
    <div class="layout-root">
      <!-- Mobile backdrop -->
      @if (sidebarOpen() && isMobile()) {
        <div class="mobile-backdrop" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Sidebar -->
      <aside
        class="sidebar"
        [class.sidebar-open]="sidebarOpen() || !isMobile()"
      >
        <!-- Logo -->
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">W</div>
            <span class="logo-text">WidgetWall</span>
          </div>
          <button class="sidebar-close md-hidden" (click)="sidebarOpen.set(false)">✕</button>
        </div>

        <!-- Nav -->
        <nav class="sidebar-nav">
          <div class="nav-section-label">Dashboards</div>

          @for (dash of dashboardService.dashboards(); track dash.id) {
            <a
              [routerLink]="['/dashboard', dash.slug]"
              class="nav-item"
              routerLinkActive="nav-item-active"
              (click)="sidebarOpen.set(false)"
            >
              <span class="nav-dot"></span>
              <span class="nav-label">{{ dash.name }}</span>
            </a>
          } @empty {
            <div class="nav-empty">No dashboards yet</div>
          }

          @if (showNewDashboardInput()) {
            <div class="new-dash-form">
              <input
                #newDashInput
                type="text"
                placeholder="Dashboard name"
                class="new-dash-input"
                (keydown.enter)="createDashboard(newDashInput.value)"
                (keydown.escape)="showNewDashboardInput.set(false); newDashInput.value = ''"
              />
              <button class="new-dash-add" (click)="createDashboard(newDashInput.value)">Add</button>
            </div>
          } @else {
            <button class="new-dash-btn" (click)="showNewDashboardInput.set(true)">
              <span class="new-dash-plus">+</span>
              New Dashboard
            </button>
          }
        </nav>

        <!-- Sidebar footer -->
        <div class="sidebar-footer">
          <a routerLink="/settings" class="footer-link" (click)="sidebarOpen.set(false)">
            ⚙️ Settings
          </a>
        </div>
      </aside>

      <!-- Main area -->
      <div class="main-area">
        <!-- Top bar -->
        <header class="topbar">
          <div class="topbar-left">
            <button class="hamburger md-hidden" (click)="sidebarOpen.set(!sidebarOpen())" aria-label="Toggle sidebar">
              <span></span><span></span><span></span>
            </button>
            <h1 class="page-title">Dashboard</h1>
          </div>

          <div class="topbar-right">
            <button
              class="theme-btn"
              (click)="themeService.toggle()"
              [title]="themeService.isDark() ? 'Light mode' : 'Dark mode'"
            >
              @if (themeService.isDark()) { ☀️ } @else { 🌙 }
            </button>

            <div class="user-menu" (mouseleave)="showUserMenu.set(false)">
              <button
                class="user-btn"
                (mouseenter)="showUserMenu.set(true)"
                (click)="showUserMenu.update(v => !v)"
              >
                <div class="avatar">{{ userInitials() }}</div>
                <span class="user-name">{{ authService.currentUser()?.displayName || authService.currentUser()?.username }}</span>
              </button>

              @if (showUserMenu()) {
                <div class="user-dropdown">
                  <div class="dropdown-email">{{ authService.currentUser()?.email }}</div>
                  <button class="dropdown-item" routerLink="/settings">⚙️ Settings</button>
                  <button class="dropdown-item dropdown-danger" (click)="authService.logout()">🚪 Log out</button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="content">
          <router-outlet />
        </main>
      </div>

      <app-toast-container />
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .layout-root {
        display: flex;
        height: 100vh;
        overflow: hidden;
        background: var(--color-surface-secondary);
      }

      /* ===== SIDEBAR ===== */
      .sidebar {
        width: 260px;
        min-width: 260px;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        z-index: 40;
        transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px;
        border-bottom: 1px solid var(--color-border);
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .logo-icon {
        width: 34px;
        height: 34px;
        border-radius: var(--radius-md);
        background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
        letter-spacing: -0.02em;
      }

      .logo-text {
        font-weight: 600;
        font-size: 16px;
        color: var(--color-ink);
        letter-spacing: -0.02em;
      }

      .sidebar-close {
        display: none;
        background: none;
        border: none;
        color: var(--color-ink-secondary);
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        border-radius: var(--radius-sm);
        transition: color 0.15s;
      }
      .sidebar-close:hover { color: var(--color-ink); }

      .sidebar-nav {
        flex: 1;
        overflow-y: auto;
        padding: 16px 12px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .nav-section-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--color-ink-secondary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 0 10px;
        margin-bottom: 8px;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 10px;
        border-radius: var(--radius-md);
        font-size: 14px;
        color: var(--color-ink-secondary);
        text-decoration: none;
        transition: all 0.15s;
        cursor: pointer;
      }
      .nav-item:hover {
        background: var(--color-surface-secondary);
        color: var(--color-ink);
      }

      .nav-item-active {
        background: var(--color-primary-subtle) !important;
        color: var(--color-primary) !important;
        font-weight: 500;
      }

      .nav-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--color-border);
        flex-shrink: 0;
        transition: background 0.15s;
      }
      .nav-item-active .nav-dot {
        background: var(--color-primary);
      }
      .nav-item:hover .nav-dot {
        background: var(--color-ink-secondary);
      }

      .nav-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .nav-empty {
        font-size: 13px;
        color: var(--color-ink-secondary);
        padding: 12px 10px;
      }

      .new-dash-btn {
        width: 100%;
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 10px;
        border-radius: var(--radius-md);
        font-size: 13px;
        font-weight: 500;
        color: var(--color-primary);
        background: transparent;
        border: 2px dashed color-mix(in srgb, var(--color-primary) 25%, transparent);
        cursor: pointer;
        transition: all 0.15s;
      }
      .new-dash-btn:hover {
        background: var(--color-primary-subtle);
        border-color: var(--color-primary);
      }

      .new-dash-plus {
        font-size: 18px;
        line-height: 1;
      }

      .new-dash-form {
        margin-top: 8px;
        display: flex;
        gap: 6px;
      }

      .new-dash-input {
        flex: 1;
        padding: 8px 12px;
        font-size: 13px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-surface);
        color: var(--color-ink);
        outline: none;
        transition: border-color 0.15s;
      }
      .new-dash-input:focus {
        border-color: var(--color-primary);
      }

      .new-dash-add {
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 500;
        color: #fff;
        background: var(--color-primary);
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background 0.15s;
      }
      .new-dash-add:hover {
        background: var(--color-primary-hover);
      }

      .sidebar-footer {
        padding: 12px;
        border-top: 1px solid var(--color-border);
      }

      .footer-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 10px;
        border-radius: var(--radius-md);
        font-size: 14px;
        color: var(--color-ink-secondary);
        text-decoration: none;
        transition: all 0.15s;
      }
      .footer-link:hover {
        background: var(--color-surface-secondary);
        color: var(--color-ink);
      }

      /* ===== MAIN AREA ===== */
      .main-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-width: 0;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        flex-shrink: 0;
        gap: 12px;
        min-height: 60px;
      }

      .topbar-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .page-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-ink);
        letter-spacing: -0.02em;
        margin: 0;
      }

      .topbar-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .hamburger {
        display: none;
        flex-direction: column;
        gap: 4px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 6px;
        border-radius: var(--radius-sm);
        transition: background 0.15s;
      }
      .hamburger:hover { background: var(--color-surface-secondary); }
      .hamburger span {
        display: block;
        width: 20px;
        height: 2px;
        background: var(--color-ink);
        border-radius: 2px;
        transition: transform 0.2s;
      }

      .theme-btn {
        padding: 8px;
        border-radius: var(--radius-md);
        font-size: 18px;
        background: transparent;
        border: none;
        color: var(--color-ink-secondary);
        cursor: pointer;
        transition: all 0.15s;
      }
      .theme-btn:hover {
        background: var(--color-surface-secondary);
        color: var(--color-ink);
      }

      .user-menu {
        position: relative;
      }

      .user-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: var(--radius-md);
        background: transparent;
        border: none;
        cursor: pointer;
        transition: background 0.15s;
      }
      .user-btn:hover { background: var(--color-surface-secondary); }

      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 12px;
        font-weight: 600;
      }

      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-ink);
      }
      @media (max-width: 640px) {
        .user-name { display: none; }
      }

      .user-dropdown {
        position: absolute;
        right: 0;
        top: calc(100% + 4px);
        width: 200px;
        background: var(--color-surface-elevated);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: 4px;
        z-index: 50;
        transform-origin: top right;
        animation: dropdown-appear 120ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .dropdown-email {
        padding: 10px 12px;
        font-size: 13px;
        color: var(--color-ink-secondary);
        border-bottom: 1px solid var(--color-border);
        margin-bottom: 4px;
      }

      .dropdown-item {
        width: 100%;
        text-align: left;
        padding: 9px 12px;
        font-size: 14px;
        color: var(--color-ink);
        background: transparent;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background 0.1s;
        display: block;
        text-decoration: none;
      }
      .dropdown-item:hover { background: var(--color-surface-secondary); }

      .dropdown-danger {
        color: var(--color-danger);
      }
      .dropdown-danger:hover {
        background: color-mix(in srgb, var(--color-danger) 8%, transparent);
      }

      .content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
      }

      /* ===== MOBILE ===== */
      @media (max-width: 767px) {
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          transform: translateX(-100%);
          box-shadow: var(--shadow-xl);
        }

        .sidebar.sidebar-open {
          transform: translateX(0);
        }

        .sidebar-close {
          display: block;
        }

        .hamburger {
          display: flex;
        }

        .mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 39;
          animation: fade-in 200ms ease-out;
        }

        .content {
          padding: 16px;
        }

        .topbar {
          padding: 10px 16px;
        }
      }

      @media (min-width: 768px) {
        .md-hidden { display: none !important; }
      }

      @keyframes dropdown-appear {
        from { opacity: 0; transform: translateY(-6px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
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
  protected sidebarOpen = signal(false);
  protected isMobile = signal(false);

  private mql = window.matchMedia('(max-width: 767px)');

  ngOnInit() {
    this.isMobile.set(this.mql.matches);
    this.mql.addEventListener('change', this.onViewportChange);
    this.loadDashboards();
    this.loadProfile();
  }

  private onViewportChange = (e: MediaQueryListEvent) => {
    this.isMobile.set(e.matches);
    if (!e.matches) this.sidebarOpen.set(false);
  };

  protected loadDashboards() {
    this.dashboardService.getAll().subscribe({
      next: (dashboards) => {
        this.dashboardService.dashboards.set(dashboards);
        const url = this.router.url;
        if (dashboards.length > 0) {
          if (url === '/dashboard' || url === '/') {
            this.router.navigate(['/dashboard', dashboards[0].slug], { replaceUrl: true });
          }
        } else {
          this.createDashboard('My Dashboard');
        }
      },
      error: () => {},
    });
  }

  protected loadProfile() {
    this.authService.getProfile().subscribe({
      next: (user) => this.authService.currentUser.set(user),
      error: () => {},
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
      error: () => {},
    });
  }

  protected userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return (user.displayName || user.username).charAt(0).toUpperCase();
  }
}
