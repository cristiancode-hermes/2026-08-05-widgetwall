# WidgetWall API Reference

Base URL: `http://localhost:3000/api`

## Auth

### POST /api/auth/register
Register a new user.

```json
{ "username": "demo", "email": "demo@widgetwall.dev", "password": "demo1234" }
```
→ `{ "user": { ... }, "token": "eyJ..." }`

### POST /api/auth/login
Login with username or email.

```json
{ "usernameOrEmail": "demo", "password": "demo1234" }
```
→ `{ "user": { ... }, "token": "eyJ..." }`

### GET /api/auth/me
Get current user (requires JWT).

→ `{ "id": "...", "username": "demo", "email": "demo@widgetwall.dev" }`

## Users (JWT required)

- `PATCH /api/users/me` — Update profile `{ displayName?, email? }`
- `PATCH /api/users/me/password` — Change password `{ currentPassword, newPassword }`
- `DELETE /api/users/me` — Delete account
- `GET /api/users/me/settings` — Get theme settings
- `PATCH /api/users/me/settings` — Update theme `{ defaultTheme }`

## Dashboards (JWT required)

- `GET /api/dashboards` — List user's dashboards
- `POST /api/dashboards` — Create dashboard `{ name, slug? }`
- `GET /api/dashboards/:id` — Get dashboard with widgets
- `PATCH /api/dashboards/:id` — Update dashboard `{ name?, slug? }`
- `DELETE /api/dashboards/:id` — Delete dashboard (cascades widgets)

## Widgets (JWT required)

- `GET /api/dashboards/:dashboardId/widgets` — List widgets on dashboard
- `POST /api/dashboards/:dashboardId/widgets` — Add widget `{ type, position?, size? }`
- `PATCH /api/widgets/:id` — Update widget `{ config?, position?, size?, title? }`
- `DELETE /api/widgets/:id` — Remove widget
- `PATCH /api/dashboards/:dashboardId/widgets/reorder` — Batch reorder `{ orderedIds: string[] }`

## Widget Definitions (JWT)

- `GET /api/widget-definitions` — List 8 available widget types

## Notes (JWT)

- `GET /api/widgets/:widgetId/notes` — List notes
- `POST /api/widgets/:widgetId/notes` — Create note `{ content }`
- `PATCH /api/notes/:id` — Update note `{ content }`
- `DELETE /api/notes/:id` — Delete note

## Tasks (JWT)

- `GET /api/widgets/:widgetId/tasks` — List tasks
- `POST /api/widgets/:widgetId/tasks` — Create task `{ text, position? }`
- `PATCH /api/tasks/:id` — Update task `{ text?, completed?, position? }`
- `DELETE /api/tasks/:id` — Delete task
- `PATCH /api/widgets/:widgetId/tasks/reorder` — Batch reorder `{ orderedIds: string[] }`

## Bookmarks (JWT)

- `GET /api/widgets/:widgetId/bookmarks` — List bookmarks
- `POST /api/widgets/:widgetId/bookmarks` — Create bookmark `{ title, url, position? }`
- `PATCH /api/bookmarks/:id` — Update bookmark `{ title?, url?, position? }`
- `DELETE /api/bookmarks/:id` — Delete bookmark

## Weather (JWT, mock data)

- `GET /api/widgets/:widgetId/weather?location=Madrid&units=celsius`
→ `{ temp: 22, feelsLike: 20, condition: "Partly Cloudy", icon: "⛅", location: "Madrid" }`

## RSS (JWT, proxy)

- `GET /api/widgets/:widgetId/rss?feedUrl=https://...&maxItems=10`
→ `{ feedTitle: "...", items: [{ title, link, pubDate, description }, ...] }`

## Seed (dev only, no auth)

- `POST /api/seed` — Seeds demo user, default dashboard, 8 widget definitions, and sample widgets

## Swagger Docs

Available at `http://localhost:3000/api/docs` when the server is running.
