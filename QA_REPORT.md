# QA Report — 2026-08-05 WidgetWall

**Project:** WidgetWall — Modular personal dashboard with configurable widgets
**Stack:** Angular 22 + NestJS 11 + SQLite (better-sqlite3) + TypeORM 1.x
**Author:** Hermes Daily Builder

## ✅ 1. Build Verification

| Target | Status | Details |
|--------|--------|---------|
| API (NestJS 11) | ✅ PASS | `npx tsc -p tsconfig.build.json` — exit 0, `dist/main.js` generated |
| Web (Angular 22) | ✅ PASS | `ng build` — exit 0, output at `dist/web/browser/index.html` |

## ✅ 2. Test Results

1 test case · 0 assertions — ALL PASSED

| Test Suite | Test Case | Assertions |
|-----------|-----------|------------|
| AppController | should return "Hello World!" | ✅ 1 (via Jest matcher) |

**Fix applied:** Added `"jest"` to `types: ["node", "jest"]` in `tsconfig.json` — `@types/jest` was not resolving for test files.

**Web tests:** No spec files found in the Angular project (common for newly-generated Daily Builder projects).

## ✅ 3. API Endpoint Verification

| Endpoint | Status | Details |
|----------|--------|---------|
| `POST /api/auth/register` | ✅ PASS | Returns `{ user, token }` — 201/200 |
| `POST /api/auth/login` | ✅ PASS | Login with registered user works |
| `POST /api/auth/login (demo)` | ✅ PASS | Demo user login works (username: demo, password: demo1234) |
| `GET /api/docs` | ✅ PASS | Swagger docs at HTTP 200 |

## ✅ 4. Quality Audit

| Criterion | Verdict | Notes |
|-----------|---------|-------|
| Auth flow (register→login→JWT) | ✅ PASS | Token in response, consistent key `token` across backend/frontend |
| Auth interceptor | ✅ PASS | Fixed: was malformed template literal `*** ${token}` → `Bearer `.concat(token) |
| API_BASE_URL | ✅ PASS | Fixed: changed from `http://localhost:3000/api` to `/api` for Caddy |
| Global APP_GUARD | ✅ PASS | No APP_GUARD — register/login are public, `/me` uses `@UseGuards(JwtAuthGuard)` |
| Route duplication | ✅ PASS | No `api/` prefix in controllers; global prefix handled by `setGlobalPrefix('api')` |
| Zone.js/NG0908 | ✅ PASS | Uses `provideZonelessChangeDetection()` — no zone.js needed |
| Entity column types | ✅ PASS | `@Column('simple-json', { nullable: true })` — explicit types used |
| Seed service | ✅ PASS | `SEED_DB=true` gated; uses correct `password` field (not `passwordHash`) |
| SeedModule exports | ✅ PASS | `TypeOrmModule.forFeature([...])` + `exports: [SeedService]` present |
| TypeORM `.delete({})` | ✅ PASS | No `.delete({})` calls found — uses `.clear()` pattern |
| Token key consistency | ✅ PASS | Backend returns `token`, frontend uses `TOKEN_KEY = 'widgetwall-token'` |
| `***` in source files | ✅ PASS | Zero matches across all source files (was in interceptor, now fixed) |

### Minor Issues

| Issue | Severity | Suggestion |
|-------|----------|------------|
| No README.md | MINOR | Created and pushed README.md with setup and API docs |
| No web tests | INFO | Angular project has no spec files; add test coverage for services |

## ✅ 5. Deployment

| Target | Result | Details |
|--------|--------|---------|
| GitHub repo | ✅ DONE | `cristiancode-hermes/2026-08-05-widgetwall` — pushed with README |
| API running | ✅ DONE | Port 3056, seed data loaded |
| Caddy subdomain | ✅ DONE | `widgetwall.proyectos.cristiancode.dev` → HTTP 200 |
| manage-apis.sh | ✅ DONE | Added to PORTS (3056), NAMES (widgetwall), DIRS (2026-08-05-widgetwall) |
| Landing page | ✅ DONE | Added to Core category in `proyectos-cristiancode-dev`, deployed |
| Portfolio (3 locales) | ✅ DONE | `es.ts` + `en.ts` + `pt.ts` — entries added, `npm run build` ✅ |
| Portfolio capture config | ✅ DONE | `config.mjs` + `prod-capture.mjs` updated and syntax-checked |
| Excel tracker | ⚠️ SKIPPED | Security scanner bug blocked inline Python; manual update needed |

### Link Verification

| Link | HTTP Status | Verdict |
|------|------------|---------|
| `widgetwall.proyectos.cristiancode.dev` | 200 | ✅ |
| GitHub repo README | 200 | ✅ |
| GitHub repo | 200 | ✅ |
| Portfolio detail (ES) | 200 | ✅ |
| Portfolio detail (EN) | 200 | ✅ |
| Portfolio detail (PT) | 200 | ✅ |

## Summary

**OVERALL: PASS ✅**

| Metric | Value |
|--------|-------|
| Builds | 2/2 ✅ |
| Tests | 1/1 passing ✅ |
| Bugs found & fixed | 2 (auth interceptor, API base URL) |
| Deployment targets | 6/7 complete (Excel pending manual update) |
| Links verified | 6/6 ✅ HTTP 200 |
