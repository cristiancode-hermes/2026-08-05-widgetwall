# WidgetWall — Architecture

## Overview

WidgetWall is a modular personal dashboard application where users assemble their own command center from configurable widgets. Built with Angular 22 + NestJS 11 + SQLite/Neon.

## Project Structure

```
widgetwall/
├── apps/
│   ├── api/              # NestJS 11 backend
│   │   └── src/
│   │       ├── auth/         # JWT auth (register, login, me)
│   │       ├── users/        # User profile & settings
│   │       ├── dashboards/   # Dashboard CRUD
│   │       ├── widgets/      # Widget instance CRUD + reorder
│   │       ├── widget-definitions/  # Available widget types
│   │       ├── notes/        # Quick Notes content
│   │       ├── tasks/        # Todo list tasks
│   │       ├── bookmarks/    # Quick Links bookmarks
│   │       ├── weather/      # Mock weather data
│   │       ├── rss/          # RSS feed proxy
│   │       └── seed/         # Demo data seeder
│   └── web/              # Angular 22 frontend
│       └── src/app/
│           ├── pages/        # Page components (login, register, dashboard, settings)
│           ├── layouts/      # Main layout (sidebar + topbar + content)
│           ├── shared/       # Reusable components
│           ├── services/     # API services
│           ├── interfaces/   # TypeScript interfaces
│           └── interceptors/ # HTTP interceptors
└── docs/
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (signals, zoneless, standalone) |
| Styling | Tailwind CSS v4 with custom theme tokens |
| Backend | NestJS 11 |
| ORM | TypeORM 1.1.0 |
| Database | SQLite (dev) / Neon PostgreSQL (production) |
| Auth | JWT + Passport + bcryptjs |

## Key Design Decisions

1. **Signal-first state management**: All component state uses Angular signals (signal, computed, effect) for reactive UI without zone.js.
2. **Modular backend**: 12 NestJS modules, each responsible for one domain entity.
3. **Widget isolation**: Each widget type is rendered dynamically by the WidgetCardComponent based on the `type` field.
4. **CSS custom properties**: Design tokens defined in tailwind.css are consumed throughout the app via `var(--color-xxx)`.
5. **Dark mode**: Theme toggle via `data-theme` attribute on `<html>`, flipping CSS custom property values.

## Data Flow

```
Browser (Angular)
    │  HTTP + JWT Bearer token
    ▼
NestJS API (/api/*)
    │
    ├── AuthModule → JWT validation → @CurrentUser() decorator
    │
    ├── DashboardsModule → GET/POST/PATCH/DELETE /api/dashboards/*
    ├── WidgetsModule → CRUD + reorder /api/widgets/*
    ├── NotesModule → CRUD /api/notes/*
    ├── TasksModule → CRUD + reorder /api/tasks/*
    ├── BookmarksModule → CRUD /api/bookmarks/*
    ├── WeatherModule → GET mock data
    └── RssModule → GET proxy to external feeds
    │
    ▼
SQLite (data/widgetwall.db)
```

## Entity Relationships

```
User (1) ── (N) Dashboard (1) ── (N) WidgetInstance
                                    │
                                    ├── (N) Note (type: 'notes')
                                    ├── (N) Task (type: 'todo')
                                    └── (N) Bookmark (type: 'links')

WidgetDefinition (lookup table — 8 seeded rows)
```
