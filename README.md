# WidgetWall — Personal Dashboard

A modular personal dashboard application where users assemble their own command center from configurable widgets.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 22, Tailwind CSS v4 |
| Backend | NestJS 11, TypeORM 1.x |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (Passport) |

## Features

- 🔐 JWT authentication (register/login)
- 📊 Personal dashboards with configurable layouts
- 🕐 Clock widget with timezone support
- 📝 Quick Notes widget
- ✅ Todo List widget
- 🔗 Quick Links (bookmarks) widget
- 🌤️ Weather widget
- 📰 RSS Feed Reader widget
- 🍅 Pomodoro Timer widget
- 👋 Personalized Greeting widget
- 🌓 Theme support (light/dark/system)

## Setup

```bash
# Install dependencies
npm install

# Build API
npm run build:api

# Build frontend
npm run build:web

# Run (with demo data)
cd apps/api && PORT=3000 SEED_DB=true node dist/main.js
```

## API Endpoints

- `POST /api/auth/register` — Register `{ username, email, password }`
- `POST /api/auth/login` — Login `{ usernameOrEmail, password }`
- `GET /api/auth/me` — Current user (JWT required)
- `GET /api/dashboards` — List dashboards
- `POST /api/dashboards` — Create dashboard
- `GET /api/dashboards/:id` — Dashboard with widgets
- `GET /api/dashboards/:dashboardId/widgets` — List widgets
- `POST /api/dashboards/:dashboardId/widgets` — Add widget
- `GET /api/widget-definitions` — Available widget types
- `GET /api/widgets/:widgetId/notes` — Notes in widget
- `GET /api/widgets/:widgetId/tasks` — Tasks in widget
- `GET /api/widgets/:widgetId/bookmarks` — Bookmarks in widget
- `GET /api/widgets/:widgetId/weather` — Weather (mock)
- `GET /api/widgets/:widgetId/rss` — RSS feed reader

## Demo Credentials

- Username: `demo`
- Email: `demo@widgetwall.dev`
- Password: `demo1234`

## License

MIT
