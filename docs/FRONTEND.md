# WidgetWall Frontend

## Architecture

Angular 22 standalone component architecture with signals, zoneless change detection.

## Routes

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/login` | LoginPageComponent | No | Login form |
| `/register` | RegisterPageComponent | No | Registration form |
| `/dashboard` | DashboardPageComponent | Yes | Main dashboard (default) |
| `/dashboard/:slug` | DashboardPageComponent | Yes | Specific dashboard |
| `/settings` | SettingsPageComponent | Yes | User profile & preferences |

## Component Tree

```
AppComponent
└── RouterOutlet
    ├── LoginPageComponent              (/login)
    ├── RegisterPageComponent            (/register)
    └── MainLayoutComponent              (guarded)
        ├── Sidebar (dashboard list, new dashboard)
        ├── Topbar (theme toggle, user menu)
        └── RouterOutlet
            ├── DashboardPageComponent   (/dashboard, /dashboard/:slug)
            │   ├── WidgetGridComponent
            │   │   ├── WidgetCardComponent * N
            │   │   │   ├── ClockWidgetComponent
            │   │   │   ├── NotesWidgetComponent
            │   │   │   ├── TodoWidgetComponent
            │   │   │   ├── LinksWidgetComponent
            │   │   │   ├── WeatherWidgetComponent
            │   │   │   ├── PomodoroWidgetComponent
            │   │   │   ├── RssWidgetComponent
            │   │   │   └── GreetingWidgetComponent
            │   │   └── AddWidgetPlaceholderComponent
            │   └── WidgetPickerModalComponent
            └── SettingsPageComponent    (/settings)
                ├── Profile section
                ├── Theme section
                ├── Password section
                └── Danger Zone section
```

## Widget Types

| Type | Display Name | Description | Dependencies |
|------|-------------|-------------|-------------|
| clock | Clock | Digital time with 12/24h format | Local `setInterval` |
| notes | Quick Notes | Markdown textarea with auto-save | NotesService |
| todo | Todo List | Inline task list | TodoService |
| links | Quick Links | Bookmark grid | BookmarkService |
| weather | Weather | Current conditions (mock) | WeatherService |
| pomodoro | Pomodoro Timer | Focus timer with intervals | Local `setInterval` |
| rss | RSS Reader | Feed headline list | RssService |
| greeting | Greeting | Time-aware welcome message | AuthService |

## Services

All services use `providedIn: 'root'` and expose signal-based state:
- **AuthService** — login, register, token storage, currentUser signal
- **DashboardService** — CRUD, dashboards signal
- **WidgetService** — CRUD + reorder, widgets signal
- **NotesService** — CRUD, notes signal
- **TodoService** — CRUD + reorder, tasks signal
- **BookmarkService** — CRUD, bookmarks signal
- **WeatherService** — mock fetch
- **RssService** — proxy fetch
- **ThemeService** — dark mode toggle with localStorage persistence
- **ToastService** — notification queue

## Styling

- **Tailwind CSS v4** with custom theme tokens in tailwind.css
- **Design token system**: IndiAmber palette (indigo primary + amber accent)
- **Utility aliases** in styles.css for tree-shaking prevention
- **Dark mode** via `data-theme` attribute on `<html>`

## Build

```bash
cd apps/web
../../node_modules/.bin/ng build
```

Output: `apps/web/dist/web/browser/`
